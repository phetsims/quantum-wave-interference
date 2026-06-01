// Copyright 2026, University of Colorado Boulder

/**
 * Returns the MeasuringTapeUnits for a given scene, converting from physical region width to a
 * view-pixel multiplier. Photon regions are μm-scale so the tape reads in μm; matter-wave regions
 * are nm-scale so the tape reads in nm.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type Unit } from '../../../../axon/js/Unit.js';
import { type MeasuringTapeUnits } from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const WAVE_REGION_VIEW_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

type QuantumWaveInterferenceMeasuringTapeUnits = MeasuringTapeUnits & { unit: Unit };

export default function getMeasuringTapeUnits( regionWidth: number ): QuantumWaveInterferenceMeasuringTapeUnits {
  const useNanometers = regionWidth < 1e-6;
  return {
    name: useNanometers ? 'nm' : 'μm',
    multiplier: regionWidth / WAVE_REGION_VIEW_WIDTH * ( useNanometers ? 1e9 : 1e6 ),
    unit: useNanometers ? nanometersUnit : micrometersUnit
  };
}
