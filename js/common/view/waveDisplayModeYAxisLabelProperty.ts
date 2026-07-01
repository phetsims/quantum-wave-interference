// Copyright 2026, University of Colorado Boulder

/**
 * Creates a StringProperty that tracks the y-axis label for wave plot tools based on the active scene's
 * wave display mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';

/**
 * Returns a locale-aware derived StringProperty that maps the active WaveDisplayMode to the appropriate y-axis label
 * string. Used by PositionPlotNode and TimePlotNode to set their yAxisLabelStringProperty. All locale string
 * dependencies are declared as DerivedProperty dependencies so the label updates automatically on locale change.
 *
 * @param activeDisplayModeProperty - the current wave display mode for the active scene
 * @returns a read-only property that resolves to the localized y-axis label for the given mode
 */
export default function waveDisplayModeYAxisLabelProperty( activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode> ): TReadOnlyProperty<string> {

  return new DerivedProperty(
    [
      activeDisplayModeProperty,
      QuantumWaveInterferenceFluent.electricFieldStringProperty,
      QuantumWaveInterferenceFluent.amplitudeStringProperty,
      QuantumWaveInterferenceFluent.waveFunctionRealPartStringProperty,
      QuantumWaveInterferenceFluent.waveFunctionImaginaryPartStringProperty
    ],
    ( mode, electricField, amplitude, realPart, imaginaryPart ) =>
      mode === 'electricField' ? electricField :
      mode === 'amplitude' ? amplitude :
      mode === 'realPart' ? realPart :
      mode === 'imaginaryPart' ? imaginaryPart :
      ( () => { throw new Error( `Unrecognized displayMode: ${mode}` ); } )()
  );
}
