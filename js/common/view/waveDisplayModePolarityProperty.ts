// Copyright 2026, University of Colorado Boulder

/**
 * Derives a polarity property ('unipolar' | 'bipolar') from a scene's active wave display mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import getDisplayModePolarity, { type WaveDisplayModePolarity } from '../model/getDisplayModePolarity.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';

export default function waveDisplayModePolarityProperty(
  activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>
): TReadOnlyProperty<WaveDisplayModePolarity> {

  return new DerivedProperty( [ activeDisplayModeProperty ], mode => getDisplayModePolarity( mode ) );
}
