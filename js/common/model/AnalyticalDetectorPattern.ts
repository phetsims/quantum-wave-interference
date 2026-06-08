// Copyright 2026, University of Colorado Boulder

/**
 * Pure analytical helpers for detector-screen intensity patterns. These functions contain the exact Fraunhofer
 * formulas shared by Experiment screen model hit generation and detector-screen rendering.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { type SlitConfigurationWithNoBarrier } from './SlitConfiguration.js';

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

function getSingleOpenSlitIntensity(
  options: AnalyticalDetectorPatternOptions,
  lambda: number,
  uncoveredSlitOffset: number
): number {

  // With one slit covered, half the incident beam is blocked, so the transmitted peak intensity is halved.
  return SINGLE_OPEN_SLIT_INTENSITY_SCALE * getAnalyticalSingleSlitEnvelopeIntensity(
    options.positionOnScreen - uncoveredSlitOffset,
    lambda,
    options.screenDistance,
    options.slitWidth
  );
}

function getWhichPathDetectorIntensity( options: AnalyticalDetectorPatternOptions, lambda: number ): number {

  // Which-path detection destroys coherence between the two open slit paths, so their intensities
  // add without the double-slit interference modulation.
  return getSingleOpenSlitIntensity( options, lambda, -options.slitSeparation / 2 ) +
         getSingleOpenSlitIntensity( options, lambda, options.slitSeparation / 2 );
}

function getBothOpenIntensity( options: AnalyticalDetectorPatternOptions, lambda: number ): number {
  const envelope = getAnalyticalSingleSlitEnvelopeIntensity(
    options.positionOnScreen,
    lambda,
    options.screenDistance,
    options.slitWidth
  );

  // Convert detector position to sin(theta) for the double-slit interference phase.
  const sinTheta = options.positionOnScreen /
                   Math.sqrt( options.positionOnScreen * options.positionOnScreen +
                              options.screenDistance * options.screenDistance );

  // Both open: double-slit interference cos^2(pi * d * sin(theta) / lambda) modulates the diffraction envelope.
  const doubleSlitArg = Math.PI * options.slitSeparation * sinTheta / lambda;
  return Math.pow( Math.cos( doubleSlitArg ), 2 ) * envelope;
}

/**
 * Exact detector intensity from the Experiment screen's Fraunhofer formulas.
 */
export function getExactAnalyticalDetectorIntensity( options: AnalyticalDetectorPatternOptions ): number {
  const lambda = options.effectiveWavelength;
  if ( lambda === 0 ) {
    return 0;
  }

  const slitSetting = options.slitSetting;

  // Dispatch exhaustively over the closed slit-setting union.
  return slitSetting === 'noBarrier' ? 1 :
         slitSetting === 'bothOpen' ? getBothOpenIntensity( options, lambda ) :
         slitSetting === 'leftCovered' ? getSingleOpenSlitIntensity( options, lambda, options.slitSeparation / 2 ) :
         slitSetting === 'rightCovered' ? getSingleOpenSlitIntensity( options, lambda, -options.slitSeparation / 2 ) :
         slitSetting === 'leftDetector' ? getWhichPathDetectorIntensity( options, lambda ) :
         slitSetting === 'rightDetector' ? getWhichPathDetectorIntensity( options, lambda ) :
         slitSetting === 'bothDetectors' ? getWhichPathDetectorIntensity( options, lambda ) :
         ( () => { throw new Error( `Unrecognized slitSetting: ${slitSetting}` ); } )();
}
