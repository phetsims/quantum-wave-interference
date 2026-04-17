// Copyright 2026, University of Colorado Boulder

/**
 * Creates a StringProperty that tracks the y-axis label for wave plot tools based on the active scene's
 * wave display mode. Uses DynamicProperty to correctly subscribe to the scene's activeWaveDisplayModeProperty,
 * ensuring the label updates when either the scene or the display mode changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

export default function waveDisplayModeYAxisLabelProperty(
  sceneProperty: TReadOnlyProperty<WaveVisualizableScene>
): TReadOnlyProperty<string> {

  const activeDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, WaveVisualizableScene>( sceneProperty, {
    derive: 'activeWaveDisplayModeProperty'
  } );

  return new DerivedProperty(
    [
      activeDisplayModeProperty,
      QuantumWaveInterferenceFluent.electricFieldStringProperty,
      QuantumWaveInterferenceFluent.magnitudeStringProperty,
      QuantumWaveInterferenceFluent.realPartStringProperty,
      QuantumWaveInterferenceFluent.imaginaryPartStringProperty,
      QuantumWaveInterferenceFluent.timeAveragedIntensityStringProperty
    ],
    ( mode, electricField, magnitude, realPart, imaginaryPart, timeAveragedIntensity ) =>
      mode === 'electricField' ? electricField :
      mode === 'magnitude' ? magnitude :
      mode === 'realPart' ? realPart :
      mode === 'imaginaryPart' ? imaginaryPart :
      mode === 'timeAveragedIntensity' ? timeAveragedIntensity :
      ( () => { throw new Error( `Unrecognized displayMode: ${mode}` ); } )()
  );
}
