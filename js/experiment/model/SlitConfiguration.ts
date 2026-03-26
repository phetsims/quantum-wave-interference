// Copyright 2026, University of Colorado Boulder

/**
 * SlitConfiguration enumerates the possible configurations of the double slit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const SlitConfigurationValues = [ 'bothOpen', 'leftCovered', 'rightCovered', 'leftDetector', 'rightDetector' ] as const;

export type SlitConfiguration = typeof SlitConfigurationValues[number];
