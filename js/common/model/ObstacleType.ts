// Copyright 2026, University of Colorado Boulder

/**
 * ObstacleType enumerates the obstacle options available in the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const ObstacleTypeValues = [ 'none', 'doubleSlit' ] as const;

export type ObstacleType = typeof ObstacleTypeValues[number];
