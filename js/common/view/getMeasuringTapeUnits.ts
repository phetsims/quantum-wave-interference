// Copyright 2026, University of Colorado Boulder

/**
 * Returns the MeasuringTapeUnits for a given scene, converting from physical region width to
 * view-pixel multiplier with appropriate unit label (mm for photons, μm for matter particles).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type MeasuringTapeUnits } from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const WAVE_REGION_VIEW_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

export default function getMeasuringTapeUnits( sourceType: SourceType, regionWidth: number ): MeasuringTapeUnits {
  const isPhotons = sourceType === 'photons';
  return {
    name: isPhotons ? 'mm' : 'μm',
    multiplier: isPhotons
      ? regionWidth / WAVE_REGION_VIEW_WIDTH * 1000
      : regionWidth / WAVE_REGION_VIEW_WIDTH * 1e6
  };
}
