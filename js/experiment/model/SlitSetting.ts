// Copyright 2026, University of Colorado Boulder

/**
 * SlitSetting enumerates the possible configurations of the double slit.
 *
 * TODO: Rename SlitConfiguration? see https://github.com/phetsims/quantum-wave-interference/issues/9
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const SlitSettingValues = [ 'bothOpen', 'leftCovered', 'rightCovered', 'leftDetector', 'rightDetector' ] as const;

export type SlitSetting = typeof SlitSettingValues[number];
