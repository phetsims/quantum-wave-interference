// Copyright 2026, University of Colorado Boulder

/**
 * Pure analytical helpers for rendering detector-screen intensity patterns. These functions are view-only: they
 * preserve the exact model formulas when the interference fringes are resolvable, but use a bright-biased apparent
 * intensity when double-slit fringes are finer than the rendered sample footprint.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import { getAnalyticalSingleSlitEnvelopeIntensity, getExactAnalyticalDetectorIntensity, getLocalDoubleSlitFringeSpacing, type AnalyticalDetectorPatternOptions } from '../model/AnalyticalDetectorPattern.js';
import { isDoubleSlitConfiguration } from '../model/SlitConfiguration.js';

// Below this many samples per bright-fringe spacing, alternating bright/dark fringes are not displayable.
const FULLY_UNRESOLVED_SAMPLES_PER_FRINGE = 2;

// Above this many samples per bright-fringe spacing, keep the exact analytical pattern.
const FULLY_RESOLVED_SAMPLES_PER_FRINGE = 4;

export type ApparentAnalyticalDetectorPatternOptions = AnalyticalDetectorPatternOptions & {

  // Physical width, in meters, represented by the rendered sample.
  sampleWidthOnScreen: number;
};

/**
 * Quintic smoothstep used to avoid a visible threshold when the renderer transitions from exact fringes to the
 * bright-biased envelope. Its zero slope at both endpoints keeps the blend stable at the fully resolved and fully
 * unresolved boundaries.
 */
const smootherStep = ( t: number ): number => {
  const clampedT = clamp( t, 0, 1 );

  // Ken Perlin's smootherstep polynomial: 6t^5 - 15t^4 + 10t^3.
  return clampedT * clampedT * clampedT * ( clampedT * ( clampedT * 6 - 15 ) + 10 );
};

/**
 * View-only detector intensity with bright-biased filtering for unresolved double-slit fringes.
 */
export const getApparentAnalyticalDetectorIntensity = ( options: ApparentAnalyticalDetectorPatternOptions ): number => {
  const exactIntensity = getExactAnalyticalDetectorIntensity( options );

  if ( !isDoubleSlitConfiguration( options.slitSetting ) || options.sampleWidthOnScreen <= 0 ) {
    return exactIntensity;
  }

  const fringeSpacing = getLocalDoubleSlitFringeSpacing( options );

  // Compare the local fringe spacing to the physical width represented by one rendered sample.
  const samplesPerFringe = fringeSpacing / options.sampleWidthOnScreen;

  // Fade from exact fringes to the envelope only in the transition zone where the display is losing resolution.
  const resolvedFraction = clamp(
    ( samplesPerFringe - FULLY_UNRESOLVED_SAMPLES_PER_FRINGE ) /
    ( FULLY_RESOLVED_SAMPLES_PER_FRINGE - FULLY_UNRESOLVED_SAMPLES_PER_FRINGE ),
    0,
    1
  );
  const unresolvedBlend = 1 - smootherStep( resolvedFraction );

  if ( unresolvedBlend === 0 ) {
    return exactIntensity;
  }

  // The envelope is a bright-biased fallback: unresolved bright fringes visually merge instead of averaging to gray.
  const envelopeIntensity = getAnalyticalSingleSlitEnvelopeIntensity(
    options.positionOnScreen,
    options.effectiveWavelength,
    options.screenDistance,
    options.slitWidth
  );

  return exactIntensity + ( envelopeIntensity - exactIntensity ) * unresolvedBlend;
};

// TODO: Do not give same filename as the model one, see https://github.com/phetsims/quantum-wave-interference/issues/100