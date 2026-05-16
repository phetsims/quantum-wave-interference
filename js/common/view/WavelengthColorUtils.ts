// Copyright 2026, University of Colorado Boulder

/**
 * Shared helpers for converting visible-light wavelength values to the coarse color names used in visual and
 * accessible readouts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

export type WavelengthColorZone = 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red';

export function getWavelengthColorZone( wavelength: number ): WavelengthColorZone {
  return wavelength <= 450 ? 'violet' :
         wavelength <= 485 ? 'blue' :
         wavelength <= 500 ? 'indigo' :
         wavelength <= 565 ? 'green' :
         wavelength <= 590 ? 'yellow' :
         wavelength <= 625 ? 'orange' :
         'red';
}

export function getWavelengthColorZoneString( colorZone: WavelengthColorZone ): string {
  return colorZone === 'violet' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty.value :
         colorZone === 'blue' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty.value :
         colorZone === 'indigo' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty.value :
         colorZone === 'green' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty.value :
         colorZone === 'yellow' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty.value :
         colorZone === 'orange' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty.value :
         colorZone === 'red' ? QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty.value :
         ( () => { throw new Error( `Unrecognized colorZone: ${colorZone}` ); } )();
}
