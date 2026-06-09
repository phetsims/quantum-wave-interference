// Copyright 2026, University of Colorado Boulder

/**
 * Small numerical helpers shared by analytical wave kernel modules.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';

/**
 * Positive numerical tolerance for near-zero comparisons and denominator floors. Callers interpret
 * this value in the same model units as the quantity being compared.
 */
export const EPSILON = 1e-12;

/**
 * Dimensionless fraction of a slit width used as the downstream distance that is still considered
 * adjacent to the aperture. This positive fraction keeps boundary handling proportional to slit size.
 */
export const NEAR_APERTURE_X_FRACTION = 1e-4;

/**
 * Interpolates smoothly from 0 to 1 as x crosses the interval from edge0 to edge1, with zero slope at
 * both endpoints. The edges must be finite and strictly ordered with edge0 < edge1.
 *
 * @param edge0 - Lower edge, in the same units as x.
 * @param edge1 - Upper edge, in the same units as x.
 * @param x - Sample value.
 * @returns 0 below edge0, 1 above edge1, or a cubic interpolation in [ 0, 1 ] between the edges.
 */
export function smoothStep( edge0: number, edge1: number, x: number ): number {
  if ( x <= edge0 ) {
    return 0;
  }
  if ( x >= edge1 ) {
    return 1;
  }
  const u = ( x - edge0 ) / ( edge1 - edge0 );
  return u * u * ( 3 - 2 * u );
}

/**
 * Creates the polar complex value magnitude * exp( i * phase ) for public analytical-wave results.
 * Both arguments must be finite, and phase is measured in radians.
 *
 * @param magnitude - Scalar magnitude of the complex value.
 * @param phase - Complex phase in radians.
 * @returns A newly allocated Complex with the corresponding real and imaginary components.
 */
// TODO: Add to Complex, right? See https://github.com/phetsims/quantum-wave-interference/issues/135
export function createPolarComplex( magnitude: number, phase: number ): Complex {
  return new Complex( magnitude * Math.cos( phase ), magnitude * Math.sin( phase ) );
}

/**
 * Multiplies value by the polar factor magnitude * exp( i * phase ). All numeric inputs must be
 * finite, phase is measured in radians, and value is not mutated.
 *
 * @param magnitude - Scalar magnitude of the polar factor.
 * @param phase - Phase of the polar factor in radians.
 * @param value - Complex value multiplied by the polar factor.
 * @returns A newly allocated Complex containing ( magnitude * exp( i * phase ) ) * value.
 */
export function createPolarTimesComplex( magnitude: number, phase: number, value: Complex ): Complex {
  const polarReal = magnitude * Math.cos( phase );
  const polarImaginary = magnitude * Math.sin( phase );
  return new Complex(
    polarReal * value.real - polarImaginary * value.imaginary,
    polarReal * value.imaginary + polarImaginary * value.real
  );
}
