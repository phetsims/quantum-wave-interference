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

export default function waveDisplayModeYAxisLabelProperty(
  activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>
): TReadOnlyProperty<string> {

  return new DerivedProperty(
    [
      activeDisplayModeProperty,
      QuantumWaveInterferenceFluent.electricFieldStringProperty,
      QuantumWaveInterferenceFluent.amplitudeStringProperty,
      QuantumWaveInterferenceFluent.realPartStringProperty,
      QuantumWaveInterferenceFluent.imaginaryPartStringProperty
    ],
    ( mode, electricField, amplitude, realPart, imaginaryPart ) =>
      mode === 'electricField' ? electricField :
      mode === 'magnitude' ? amplitude :
      mode === 'realPart' ? realPart :
      mode === 'imaginaryPart' ? imaginaryPart :
      mode === 'timeAveragedIntensity' ? amplitude :
      ( () => { throw new Error( `Unrecognized displayMode: ${mode}` ); } )()
  );
}
