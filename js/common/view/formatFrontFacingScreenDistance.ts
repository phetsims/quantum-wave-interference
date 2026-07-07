// Copyright 2026, University of Colorado Boulder

/**
 * Formats barrier-screen distance for front-facing detector-screen views, where physical distances are described in
 * the same micrometer/nanometer units as the measuring tape and barrier-position control.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';

/**
 * Converts a barrier-screen distance stored in meters to the front-facing scene units selected for the wave region.
 * This is shared by snapshot metadata and live PDOM Experiment details so they do not drift.
 */
export default function formatFrontFacingScreenDistance(
  screenDistanceMeters: number,
  regionWidthMeters: number
): DualString {
  const measuringTapeUnits = getMeasuringTapeUnits( regionWidthMeters );
  const screenDistance = screenDistanceMeters / regionWidthMeters *
                         QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH *
                         measuringTapeUnits.multiplier;
  return measuringTapeUnits.unit.getDualString( screenDistance, {
    decimalPlaces: 2,
    showTrailingZeros: true
  } );
}
