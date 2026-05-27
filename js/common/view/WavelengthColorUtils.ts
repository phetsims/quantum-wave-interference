// Copyright 2026, University of Colorado Boulder

/**
 * Shared helpers for converting visible-light wavelength values to the coarse color names used in visual and
 * accessible readouts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

export type WavelengthColorZone = 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red';

export const WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES: TReadOnlyProperty<string>[] = [
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty
];

export function getWavelengthColorZone( wavelength: number ): WavelengthColorZone {
  return wavelength <= 450 ? 'violet' :
         wavelength <= 485 ? 'blue' :
         wavelength <= 500 ? 'indigo' :
         wavelength <= 565 ? 'green' :
         wavelength <= 590 ? 'yellow' :
         wavelength <= 625 ? 'orange' :
         'red';
}

export function getWavelengthColorZoneStringProperty( colorZone: WavelengthColorZone ): TReadOnlyProperty<string> {
  return colorZone === 'violet' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty :
         colorZone === 'blue' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty :
         colorZone === 'indigo' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty :
         colorZone === 'green' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty :
         colorZone === 'yellow' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty :
         colorZone === 'orange' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty :
         colorZone === 'red' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty :
         ( () => { throw new Error( `Unrecognized colorZone: ${colorZone}` ); } )();
}
