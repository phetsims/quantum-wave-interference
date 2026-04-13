// Copyright 2026, University of Colorado Boulder

/**
 * DetectionMode enumerates the display modes for the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const DetectionModeValues = [ 'averageIntensity', 'hits' ] as const;

export type DetectionMode = typeof DetectionModeValues[number];
