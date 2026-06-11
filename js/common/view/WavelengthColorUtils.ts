// Copyright 2026, University of Colorado Boulder

/**
 * Shared helpers for converting visible-light wavelength values to the coarse color names used in visual and
 * accessible readouts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

// The seven coarse color-name zones that span the visible-light spectrum (~380–700 nm) used in
// accessible readouts and state descriptions.
export type WavelengthColorZone = 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red';

// Ordered array of localized StringProperties for each WavelengthColorZone, in the same order as the zone
// union (violet → red). Spread this array as dependencies in a Multilink or DerivedProperty so that locale
// changes re-evaluate the accessible color name.
export const WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES: TReadOnlyProperty<string>[] = [
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.violetStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.blueStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.indigoStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.greenStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.yellowStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.orangeStringProperty,
  QuantumWaveInterferenceFluent.a11y.wavelengthSlider.color.redStringProperty
];

/**
 * Maps a wavelength (in nanometers) to its coarse visible-spectrum color zone. Boundaries are inclusive on the
 * upper end of each zone (e.g., ≤450 nm → violet, 451–485 nm → blue, …, >625 nm → red). Callers should round
 * the wavelength before passing it (e.g., with roundSymmetric) so zone boundaries are consistent.
 */
export function getWavelengthColorZone( wavelength: number ): WavelengthColorZone {
  return wavelength <= 450 ? 'violet' :
         wavelength <= 485 ? 'blue' :
         wavelength <= 500 ? 'indigo' :
         wavelength <= 565 ? 'green' :
         wavelength <= 590 ? 'yellow' :
         wavelength <= 625 ? 'orange' :
         'red';
}

/**
 * Returns the localized StringProperty for a given WavelengthColorZone. The returned Property updates when the
 * locale changes, so callers that embed its value in a description must include it (or the corresponding entry
 * from WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES) as a dependency. Throws if colorZone is not a recognized value.
 */
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
