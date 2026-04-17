// Copyright 2026, University of Colorado Boulder

/**
 * Derives a polarity property ('unipolar' | 'bipolar') from a scene's active wave display mode.
 * Follows the same DynamicProperty pattern as `waveDisplayModeYAxisLabelProperty` so the polarity
 * updates correctly when either the scene or its display mode changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import getDisplayModePolarity, { type WaveDisplayModePolarity } from '../model/getDisplayModePolarity.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

export default function waveDisplayModePolarityProperty(
  sceneProperty: TReadOnlyProperty<WaveVisualizableScene>
): TReadOnlyProperty<WaveDisplayModePolarity> {

  const activeDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, WaveVisualizableScene>( sceneProperty, {
    derive: 'activeWaveDisplayModeProperty'
  } );

  return new DerivedProperty( [ activeDisplayModeProperty ], mode => getDisplayModePolarity( mode ) );
}
