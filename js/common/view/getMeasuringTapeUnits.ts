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

// Extends MeasuringTapeUnits with a typed unit reference so callers can access the Unit (e.g. for
// PhET-iO or unit-conversion logic) without re-deriving it from the name string.
type QuantumWaveInterferenceMeasuringTapeUnits = MeasuringTapeUnits & { unit: Unit };

// StringProperties for the visual unit symbols (nm and μm) used as DerivedProperty dependencies in
// MeasurementToolsLayerNode so that the measuring tape label updates on locale changes.
export const MEASURING_TAPE_UNIT_VISUAL_SYMBOL_PROPERTIES = [
  nanometersUnit.getVisualSymbolStringProperty(),
  micrometersUnit.getVisualSymbolStringProperty()
] as const;

/**
 * Returns MeasuringTapeUnits suitable for the given scene's physical region width. The multiplier
 * maps view pixels to physical units: pixels × multiplier = value in the chosen unit.
 *
 * Threshold: regionWidth < 1e-6 m (i.e. sub-micrometre, typical of matter-wave scenes) → nanometres;
 * otherwise (photon scenes, μm-scale) → micrometres.
 *
 * @param regionWidth - physical width of the simulation region in metres
 * @returns MeasuringTapeUnits whose multiplier converts view-pixel distances to the selected unit,
 *          plus a typed Unit reference for downstream use
 */
export default function getMeasuringTapeUnits( regionWidth: number ): QuantumWaveInterferenceMeasuringTapeUnits {
  const useNanometers = regionWidth < 1e-6;
  const unit = useNanometers ? nanometersUnit : micrometersUnit;

  return {
    name: unit.getVisualSymbolString(),
    multiplier: regionWidth / WAVE_REGION_VIEW_WIDTH * ( useNanometers ? 1e9 : 1e6 ),
    unit: unit
  };
}
