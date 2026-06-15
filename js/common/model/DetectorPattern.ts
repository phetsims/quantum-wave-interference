// Copyright 2026, University of Colorado Boulder

/**
 * Helpers for detector-screen intensity patterns. These functions contain the exact Fraunhofer
 * formulas shared by Experiment screen model hit generation and detector-screen rendering.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { hasAnyDetector, type SlitConfigurationWithNoBarrier } from './SlitConfiguration.js';

/**
 * Physical parameters used to evaluate a detector-screen pattern. All distances and wavelengths are
 * expressed in meters.
 */
export type DetectorPatternOptions = {

  // Position on the detector screen in meters, relative to the screen center.
  positionOnScreen: number;

  // Effective wavelength in meters.
  effectiveWavelength: number;

  // Distance from the slits to the detector screen in meters.
  screenDistance: number;

  // Slit width in meters.
  slitWidth: number;

  // Center-to-center slit separation in meters.
  slitSeparation: number;

  /**
   * Barrier, slit-cover, and which-path detector configuration used to select the pattern.
   */
  slitSetting: SlitConfigurationWithNoBarrier;
};

const SINGLE_OPEN_SLIT_INTENSITY_SCALE = 0.5;

/**
 * Evaluates the sinc-squared function, which describes the single-slit diffraction envelope. Defined as sinc^2(x) =
 * (sin(x)/x)^2, with the limit value of 1 at x=0.
 */
function sincSquared( x: number ): number {
  return x === 0 ? 1 : Math.pow( Math.sin( x ) / x, 2 );
}

/**
 * Evaluates the single-slit diffraction envelope at a detector-screen position.
 *
 * @param positionOnScreen - position on the detector screen in meters, relative to the screen center
 * @param effectiveWavelength - effective wavelength in meters
 * @param screenDistance - distance from the slits to the detector screen in meters
 * @param slitWidth - slit width in meters
 * @returns normalized envelope intensity from 0 (dark) to 1 (peak intensity), or 0 when the effective wavelength is zero
 */
export function getSingleSlitEnvelopeIntensity(
  positionOnScreen: number,
  effectiveWavelength: number,
  screenDistance: number,
  slitWidth: number
): number {
  if ( effectiveWavelength === 0 ) {
    return 0;
  }

  // Convert detector position to sin(theta) using the slit-to-screen distance as the adjacent leg.
  const sinTheta = positionOnScreen / Math.sqrt( positionOnScreen * positionOnScreen + screenDistance * screenDistance );

  // Single-slit diffraction envelope: sinc^2(pi * a * sin(theta) / lambda).
  const singleSlitArg = Math.PI * slitWidth * sinTheta / effectiveWavelength;
  return sincSquared( singleSlitArg );
}

/**
 * Computes the local spacing between neighboring double-slit bright fringes.
 *
 * @param options - physical detector-pattern parameters, with all distances and wavelengths in meters
 * @returns fringe spacing in meters, or positive infinity when slitSetting is not `bothOpen` or the wavelength, slit
 *          separation, or screen distance is zero
 */
export function getLocalDoubleSlitFringeSpacing( options: DetectorPatternOptions ): number {
  if (
    options.slitSetting !== 'bothOpen' ||
    options.effectiveWavelength === 0 ||
    options.slitSeparation === 0 ||
    options.screenDistance === 0
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const positionSquared = options.positionOnScreen * options.positionOnScreen;
  const screenDistanceSquared = options.screenDistance * options.screenDistance;

  // Differentiate the bright-fringe condition d*sin(theta)=n*lambda to estimate local spacing in screen position.
  return options.effectiveWavelength *
         Math.pow( positionSquared + screenDistanceSquared, 1.5 ) /
         ( options.slitSeparation * screenDistanceSquared );
}

/**
 * Evaluates the exact detector intensity from the Experiment screen's Fraunhofer formulas.
 *
 * @param options - physical detector-pattern parameters, with all distances and wavelengths in meters
 * @returns normalized intensity from 0 (dark) to 1 (the unobstructed reference intensity); returns 0 when the
 *          effective wavelength is zero
 */
export function getExactDetectorIntensity( options: DetectorPatternOptions ): number {
  const lambda = options.effectiveWavelength;
  if ( lambda === 0 ) {
    return 0;
  }

  if ( options.slitSetting === 'noBarrier' ) {
    return 1;
  }

  const slitSetting = options.slitSetting;

  if ( slitSetting === 'leftCovered' || slitSetting === 'rightCovered' ) {

    // Center the single-slit envelope on the open slit, which is half a slit-separation away from center.
    const uncoveredSlitOffset = slitSetting === 'leftCovered' ? options.slitSeparation / 2 :
                                -options.slitSeparation / 2;

    // With one slit covered, half the incident beam is blocked, so the transmitted peak intensity is halved.
    return SINGLE_OPEN_SLIT_INTENSITY_SCALE * getSingleSlitEnvelopeIntensity(
      options.positionOnScreen - uncoveredSlitOffset,
      lambda,
      options.screenDistance,
      options.slitWidth
    );
  }

  const envelope = getSingleSlitEnvelopeIntensity( options.positionOnScreen, lambda, options.screenDistance, options.slitWidth );

  if ( hasAnyDetector( slitSetting ) ) {

    // Which-path detection destroys coherence, so only the broad single-slit-like envelope remains.
    return envelope;
  }

  // Convert detector position to sin(theta) for the double-slit interference phase.
  const sinTheta = options.positionOnScreen /
                   Math.sqrt( options.positionOnScreen * options.positionOnScreen +
                              options.screenDistance * options.screenDistance );

  // Both open: double-slit interference cos^2(pi * d * sin(theta) / lambda) modulates the diffraction envelope.
  const doubleSlitArg = Math.PI * options.slitSeparation * sinTheta / lambda;
  return Math.pow( Math.cos( doubleSlitArg ), 2 ) * envelope;
}
