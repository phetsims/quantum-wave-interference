// Copyright 2026, University of Colorado Boulder

/**
 * Fresnel aperture transfer for analytical slit diffraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { type AnalyticalSlit } from './AnalyticalWaveKernelTypes.js';
import { EPSILON, NEAR_APERTURE_X_FRACTION, smoothStep } from './AnalyticalWaveMath.js';

// Smooth the first post-aperture samples so the visual transition from slit mask to Fresnel propagation
// does not create a screen-specific artifact at the aperture boundary.
const APERTURE_BLEND_SLIT_WIDTH_FRACTION = 0.5;
const APERTURE_BLEND_WAVELENGTH_FRACTION = 0.25;


// Keep physical complex amplitude separate from visual wavefront support. Diffraction can reduce
// amplitude without meaning the sample is unreached background.
export type ApertureTransfer = {
  value: Complex;
  support: number;
};

// The analytical kernel is sampled for every visible grid cell. Keep transient complex arithmetic in
// numeric real/imaginary components here, then allocate Complex only at the public transfer boundary.
type ComplexComponents = {
  real: number;
  imaginary: number;
};

// Reused scratch objects for the synchronous Fresnel hot path. These values are copied into a new
// Complex before returning, so callers never observe or retain the mutable scratch state.
const fresnelUMinComponents: ComplexComponents = { real: 0, imaginary: 0 };
const fresnelUMaxComponents: ComplexComponents = { real: 0, imaginary: 0 };
const apertureTransferComponents: ComplexComponents = { real: 0, imaginary: 0 };
const apertureBlendComponents: ComplexComponents = { real: 0, imaginary: 0 };

// Fast Abramowitz-Stegun style approximation for Fresnel integrals. The max error is small enough
// for rendering/unit-test invariants, and it avoids per-cell numerical quadrature in the canvas.
function setFresnelIntegralComponents( x: number, out: ComplexComponents ): void {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs( x );

  if ( ax < EPSILON ) {
    out.real = 0;
    out.imaginary = 0;
    return;
  }

  const phase = 0.5 * Math.PI * ax * ax;
  const sinPhase = Math.sin( phase );
  const cosPhase = Math.cos( phase );
  const f = ( 1 + 0.926 * ax ) / ( 2 + 1.792 * ax + 3.104 * ax * ax );
  const g = 1 / ( 2 + 4.142 * ax + 3.492 * ax * ax + 6.67 * ax * ax * ax );

  out.real = sign * ( 0.5 + f * sinPhase - g * cosPhase );
  out.imaginary = sign * ( 0.5 - f * cosPhase - g * sinPhase );
}

// Allocation-free equivalent of Complex#times for short-lived intermediate values.
function setMultiplyComponents(
  aReal: number,
  aImaginary: number,
  bReal: number,
  bImaginary: number,
  out: ComplexComponents
): void {
  out.real = aReal * bReal - aImaginary * bImaginary;
  out.imaginary = aReal * bImaginary + aImaginary * bReal;
}

// Allocation-free equivalent of Complex.createPolar( magnitude, phase ).times( value ).
function setPolarTimesComponents(
  magnitude: number,
  phase: number,
  real: number,
  imaginary: number,
  out: ComplexComponents
): void {
  setMultiplyComponents(
    magnitude * Math.cos( phase ),
    magnitude * Math.sin( phase ),
    real,
    imaginary,
    out
  );
}

// Allocation-free equivalent of blending two Complex values.
function setBlendComponents(
  aReal: number,
  aImaginary: number,
  bReal: number,
  bImaginary: number,
  t: number,
  out: ComplexComponents
): void {
  out.real = aReal + ( bReal - aReal ) * t;
  out.imaginary = aImaginary + ( bImaginary - aImaginary ) * t;
}

/**
 * Computes the Fresnel transfer through one finite slit aperture.
 *
 * The returned Complex is the diffracted amplitude contribution, while support tracks whether the
 * wavefront has visually reached the sample even when the complex amplitude is small.
 */
export function getFresnelApertureTransfer(
  waveNumber: number,
  xPastBarrier: number,
  y: number,
  slit: AnalyticalSlit
): ApertureTransfer {
  const halfWidth = slit.width / 2;
  const yMin = slit.centerY - halfWidth;
  const yMax = slit.centerY + halfWidth;
  const nearApertureX = Math.max( EPSILON, slit.width * NEAR_APERTURE_X_FRACTION );
  const apertureMaskReal = Math.abs( y - slit.centerY ) <= halfWidth ? 1 : 0;
  const apertureMaskSupport = apertureMaskReal;

  if ( xPastBarrier <= nearApertureX ) {
    return {
      value: new Complex( apertureMaskReal, 0 ),
      support: apertureMaskSupport
    };
  }

  const wavelength = 2 * Math.PI / waveNumber;
  const uScale = Math.sqrt( 2 / ( wavelength * xPastBarrier ) );
  const uMin = ( yMin - y ) * uScale;
  const uMax = ( yMax - y ) * uScale;

  // Compute F(uMax)-F(uMin) numerically instead of allocating two Fresnel Complex values and subtracting.
  setFresnelIntegralComponents( uMin, fresnelUMinComponents );
  setFresnelIntegralComponents( uMax, fresnelUMaxComponents );

  const apertureIntegralReal = fresnelUMaxComponents.real - fresnelUMinComponents.real;
  const apertureIntegralImaginary = fresnelUMaxComponents.imaginary - fresnelUMinComponents.imaginary;
  setPolarTimesComponents(
    0.57, // Fine-tuned to make sure the wave downstream of the aperture still has a strong magnitude, but cannot overshoot the original wave height. See https://github.com/phetsims/quantum-wave-interference/issues/152
    waveNumber * xPastBarrier - Math.PI / 4,
    apertureIntegralReal,
    apertureIntegralImaginary,
    apertureTransferComponents
  );

  const apertureBlendDistance = Math.max(
    nearApertureX,
    Math.min(
      slit.width * APERTURE_BLEND_SLIT_WIDTH_FRACTION,
      wavelength * APERTURE_BLEND_WAVELENGTH_FRACTION
    )
  );

  if ( xPastBarrier < apertureBlendDistance ) {
    const blend = smoothStep( nearApertureX, apertureBlendDistance, xPastBarrier );
    setBlendComponents(
      apertureMaskReal,
      0,
      apertureTransferComponents.real,
      apertureTransferComponents.imaginary,
      blend,
      apertureBlendComponents
    );

    // Inside the handoff region, ramp the visual support to reached-field status while blending
    // the complex value from the aperture mask to the Fresnel result.
    return {
      value: new Complex( apertureBlendComponents.real, apertureBlendComponents.imaginary ),
      support: apertureMaskSupport + ( 1 - apertureMaskSupport ) * blend
    };
  }

  return {
    value: new Complex( apertureTransferComponents.real, apertureTransferComponents.imaginary ),
    support: 1
  };
}
