// Copyright 2026, University of Colorado Boulder

/**
 * Pure analytical helpers for detector-screen intensity patterns. These functions contain the exact Fraunhofer
 * formulas shared by Experiment screen model hit generation and detector-screen rendering.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { hasAnyDetector, type SlitConfigurationWithNoBarrier } from './SlitConfiguration.js';

export type AnalyticalDetectorPatternOptions = {

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

  slitSetting: SlitConfigurationWithNoBarrier;
};

const SINGLE_OPEN_SLIT_INTENSITY_SCALE = 0.5;

function sincSquared( arg: number ): number {
  return arg === 0 ? 1 : Math.pow( Math.sin( arg ) / arg, 2 );
}

/**
 * Returns the single-slit diffraction envelope at the given detector position.
 */
export function getAnalyticalSingleSlitEnvelopeIntensity(
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
 * Returns the local spacing between neighboring double-slit bright fringes, in meters.
 */
export function getLocalDoubleSlitFringeSpacing( options: AnalyticalDetectorPatternOptions ): number {
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
 * Exact detector intensity from the Experiment screen's Fraunhofer formulas.
 */
export function getExactAnalyticalDetectorIntensity( options: AnalyticalDetectorPatternOptions ): number {
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
    return SINGLE_OPEN_SLIT_INTENSITY_SCALE * getAnalyticalSingleSlitEnvelopeIntensity(
      options.positionOnScreen - uncoveredSlitOffset,
      lambda,
      options.screenDistance,
      options.slitWidth
    );
  }

  const envelope = getAnalyticalSingleSlitEnvelopeIntensity( options.positionOnScreen, lambda, options.screenDistance, options.slitWidth );

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
