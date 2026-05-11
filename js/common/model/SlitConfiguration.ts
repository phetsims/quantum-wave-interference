// Copyright 2026, University of Colorado Boulder

/**
 * SlitConfiguration enumerates the possible configurations of the double slit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const SlitConfigurationValues = [
  'bothOpen',
  'leftCovered',
  'rightCovered',
  'leftDetector',
  'rightDetector',
  'bothDetectors'
] as const;

export type SlitConfiguration = typeof SlitConfigurationValues[number];

// The Experiment screen uses SlitConfiguration because it always has a barrier. High Intensity,
// Single Particles, and snapshots also support a no-barrier state.
export const SlitConfigurationWithNoBarrierValues = [
  ...SlitConfigurationValues,
  'noBarrier'
] as const;

export type SlitConfigurationWithNoBarrier = typeof SlitConfigurationWithNoBarrierValues[number];

export const DetectorSideValues = [ 'left', 'right' ] as const;

export type DetectorSide = typeof DetectorSideValues[number];

export const hasDetectorOnSide = ( slitConfiguration: SlitConfigurationWithNoBarrier, detectorSide: DetectorSide ): boolean => {
  return ( slitConfiguration === 'bothDetectors' ) ||
         ( slitConfiguration === 'leftDetector' && detectorSide === 'left' ) ||
         ( slitConfiguration === 'rightDetector' && detectorSide === 'right' );
};

export const hasAnyDetector = ( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean => {
  return slitConfiguration === 'bothDetectors' ||
         slitConfiguration === 'leftDetector' ||
         slitConfiguration === 'rightDetector';
};

// Does it show a double slit interference pattern? TODO: Rename, see https://github.com/phetsims/quantum-wave-interference/issues/100
export const isDoubleSlitConfiguration = ( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean => {
  return slitConfiguration === 'bothOpen';
};
