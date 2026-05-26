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

// TODO: Move this to WaveModeDisplayPolarity.ts, see https://github.com/phetsims/quantum-wave-interference/issues/135

export default function waveDisplayModePolarityProperty(
  activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>
): TReadOnlyProperty<WaveDisplayModePolarity> {

  return new DerivedProperty( [ activeDisplayModeProperty ], mode => getDisplayModePolarity( mode ) );
}
