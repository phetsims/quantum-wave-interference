// Copyright 2026, University of Colorado Boulder

/**
 * Creates DoubleSlitNode detector options for the front-facing wave-region views used by High Intensity and
 * Single Particles.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { createSlitDetectorProperties, type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { type DoubleSlitNodeOptions } from './DoubleSlitNode.js';

// The subset of DoubleSlitNodeOptions that wires up slit-detector visibility and hit counts for front-facing wave-region views.
type FrontFacingSlitDetectorOptions = Pick<DoubleSlitNodeOptions,
  'isTopSlitDetectorProperty' |
  'isBottomSlitDetectorProperty' |
  'topDetectorCountProperty' |
  'bottomDetectorCountProperty'
>;

/**
 * The model uses left/right names for detector slits because the Experiment screen presents an overhead view. In the
 * front-facing wave-region view, those same physical slits are drawn as top/bottom.
 *
 * @param slitConfigurationProperty - current slit configuration
 * @param leftDetectorCountProperty - hit count for the slit drawn on top in front-facing views
 * @param rightDetectorCountProperty - hit count for the slit drawn on bottom in front-facing views
 * @returns DoubleSlitNode options with detector visibility and counts mapped to front-facing positions
 */
export default function createFrontFacingSlitDetectorOptions(
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
  leftDetectorCountProperty: TReadOnlyProperty<number>,
  rightDetectorCountProperty: TReadOnlyProperty<number>
): FrontFacingSlitDetectorOptions {
  const slitDetectorProperties = createSlitDetectorProperties( slitConfigurationProperty );

  return {
    isTopSlitDetectorProperty: slitDetectorProperties.isTopSlitDetectorProperty,
    isBottomSlitDetectorProperty: slitDetectorProperties.isBottomSlitDetectorProperty,
    topDetectorCountProperty: leftDetectorCountProperty,
    bottomDetectorCountProperty: rightDetectorCountProperty
  };
}
