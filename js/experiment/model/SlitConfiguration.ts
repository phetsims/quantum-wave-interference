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

export const DetectorSideValues = [ 'left', 'right' ] as const;

export type DetectorSide = typeof DetectorSideValues[number];

export const hasDetectorOnSide = ( slitConfiguration: SlitConfiguration, detectorSide: DetectorSide ): boolean => {
  return ( slitConfiguration === 'bothDetectors' ) ||
         ( slitConfiguration === 'leftDetector' && detectorSide === 'left' ) ||
         ( slitConfiguration === 'rightDetector' && detectorSide === 'right' );
};

export const hasAnyDetector = ( slitConfiguration: SlitConfiguration ): boolean => {
  return slitConfiguration === 'bothDetectors' ||
         slitConfiguration === 'leftDetector' ||
         slitConfiguration === 'rightDetector';
};

export const isDoubleSlitConfiguration = ( slitConfiguration: SlitConfiguration ): boolean => {
  return slitConfiguration === 'bothOpen';
};
