// Copyright 2026, University of Colorado Boulder

/**
 * Returns the MeasuringTapeUnits for a given scene, converting from physical region width to
 * view-pixel multiplier with μm unit label.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type MeasuringTapeUnits } from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const WAVE_REGION_VIEW_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

export default function getMeasuringTapeUnits( regionWidth: number ): MeasuringTapeUnits {
  return {
    name: 'μm',
    multiplier: regionWidth / WAVE_REGION_VIEW_WIDTH * 1e6
  };
}
