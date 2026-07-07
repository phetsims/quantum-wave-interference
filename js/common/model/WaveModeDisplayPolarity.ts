// Copyright 2026, University of Colorado Boulder

/**
 * Utilities for mapping wave display modes to the polarity expected by plot displays.
 *
 * Unipolar signals (amplitude - values in [0, +infinity)) have a baseline at the bottom of the
 * chart. Bipolar signals (real part, electric field - values in
 * (-infinity, +infinity)) have a baseline at the vertical center.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';

export type WaveDisplayModePolarity = 'unipolar' | 'bipolar';

/**
 * Maps a wave display mode to the polarity needed for plot baseline placement.
 *
 * @param mode - the wave display mode to classify
 * @returns 'unipolar' for non-negative display modes, otherwise 'bipolar'
 */
export function getDisplayModePolarity( mode: WaveDisplayMode ): WaveDisplayModePolarity {
  return mode === 'amplitude' ? 'unipolar' : 'bipolar';
}

/**
 * Creates a read-only Property that follows the polarity implied by an active wave display mode Property.
 *
 * @param activeDisplayModeProperty - Property that provides the active wave display mode
 * @returns read-only Property containing the corresponding display polarity
 */
export function waveDisplayModePolarityProperty(
  activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>
): TReadOnlyProperty<WaveDisplayModePolarity> {

  return new DerivedProperty( [ activeDisplayModeProperty ], mode => getDisplayModePolarity( mode ) );
}
