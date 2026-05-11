// Copyright 2026, University of Colorado Boulder

/**
 * Shared horizontal detector-screen scale options for the Experiment screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

export const DETECTOR_SCREEN_SCALE_OPTIONS = [
  { minMM: -20, maxMM: 20 },
  { minMM: -15, maxMM: 15 },
  { minMM: -10, maxMM: 10 },
  { minMM: -5, maxMM: 5 }
] as const;

export const DEFAULT_DETECTOR_SCREEN_SCALE_INDEX = 0;

/**
 * Physical half-width of the visible detector screen region in meters for a given horizontal zoom level.
 */
export const getDetectorScreenHalfWidthForScaleIndex = ( scaleIndex: number ): number => {
  const scaleOption = DETECTOR_SCREEN_SCALE_OPTIONS[ scaleIndex ];
  return ( scaleOption.maxMM - scaleOption.minMM ) * 0.5 * 1e-3;
};

/**
 * Physical half-width of the full detector screen in meters. Detector screen zoom changes the visible region,
 * not the underlying detector data.
 */
export const getFullDetectorScreenHalfWidth = (): number =>
  getDetectorScreenHalfWidthForScaleIndex( DEFAULT_DETECTOR_SCREEN_SCALE_INDEX );
