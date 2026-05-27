// Copyright 2026, University of Colorado Boulder

/**
 * SlitConfiguration enumerates the possible configurations of the double slit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';

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

/**
 * Determines detector placement using the Experiment screen's overhead left/right slit names.
 *
 * @param slitConfiguration - current slit configuration
 * @param detectorSide - physical detector side in Experiment's overhead view
 * @returns whether the requested side has a detector
 */
export function hasDetectorOnSide( slitConfiguration: SlitConfigurationWithNoBarrier, detectorSide: DetectorSide ): boolean {
  return ( slitConfiguration === 'bothDetectors' ) ||
         ( slitConfiguration === 'leftDetector' && detectorSide === 'left' ) ||
         ( slitConfiguration === 'rightDetector' && detectorSide === 'right' );
}

/**
 * In front-facing wave-region views and analytical wave solvers, the physical slit named "left" in
 * Experiment's overhead view is drawn and modeled as the top slit.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether the front-facing top slit is covered
 */
export function isTopSlitCovered( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return slitConfiguration === 'leftCovered';
}

/**
 * In front-facing wave-region views and analytical wave solvers, the physical slit named "right" in
 * Experiment's overhead view is drawn and modeled as the bottom slit.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether the front-facing bottom slit is covered
 */
export function isBottomSlitCovered( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return slitConfiguration === 'rightCovered';
}

/**
 * In front-facing wave-region views and analytical wave solvers, the physical slit named "left" in
 * Experiment's overhead view is drawn and modeled as the top slit.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether the front-facing top slit has a detector
 */
export function hasDetectorOnTopSlit( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return hasDetectorOnSide( slitConfiguration, 'left' );
}

/**
 * In front-facing wave-region views and analytical wave solvers, the physical slit named "right" in
 * Experiment's overhead view is drawn and modeled as the bottom slit.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether the front-facing bottom slit has a detector
 */
export function hasDetectorOnBottomSlit( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return hasDetectorOnSide( slitConfiguration, 'right' );
}

/**
 * Creates derived Properties that expose front-facing detector visibility for the top and bottom slits.
 *
 * @param slitConfigurationProperty - source Property for slit configuration
 * @returns derived detector visibility Properties for DoubleSlitNode
 */
export function createSlitDetectorProperties(
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>
): { isTopSlitDetectorProperty: TReadOnlyProperty<boolean>; isBottomSlitDetectorProperty: TReadOnlyProperty<boolean> } {
  return {
    isTopSlitDetectorProperty: new DerivedProperty( [ slitConfigurationProperty ],
      slitConfig => hasDetectorOnTopSlit( slitConfig ) ),
    isBottomSlitDetectorProperty: new DerivedProperty( [ slitConfigurationProperty ],
      slitConfig => hasDetectorOnBottomSlit( slitConfig ) )
  };
}

/**
 * Determines whether any slit detector is active for the provided configuration.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether at least one detector is present
 */
export function hasAnyDetector( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return slitConfiguration === 'bothDetectors' ||
         slitConfiguration === 'leftDetector' ||
         slitConfiguration === 'rightDetector';
}

/**
 * Determines whether the current configuration preserves coherent paths through both open slits.
 *
 * @param slitConfiguration - current slit configuration
 * @returns whether detector-screen output should show double-slit interference fringes
 */
export function showsDoubleSlitInterferencePattern( slitConfiguration: SlitConfigurationWithNoBarrier ): boolean {
  return slitConfiguration === 'bothOpen';
}
