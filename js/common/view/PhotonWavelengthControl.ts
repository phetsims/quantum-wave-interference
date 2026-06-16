// Copyright 2026, University of Colorado Boulder

/**
 * PhotonWavelengthControl creates the wavelength slider used when the active source scene emits photons.
 * It uses WavelengthNumberControl for the visible spectrum track, then customizes value formatting so the
 * accessible value includes the localized wavelength and color zone.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import WavelengthNumberControl from '../../../../scenery-phet/js/WavelengthNumberControl.js';
import SunConstants from '../../../../sun/js/SunConstants.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SOURCE_CONTROL_TITLE_FONT } from './SourceControlPanelConstants.js';
import { getWavelengthColorZone, getWavelengthColorZoneStringProperty, WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from './WavelengthColorUtils.js';

export default class PhotonWavelengthControl extends WavelengthNumberControl {

  public constructor( wavelengthProperty: NumberProperty, tandem: Tandem ) {
    super( wavelengthProperty, {
      range: QuantumWaveInterferenceConstants.createPhotonWavelengthControlRangeNM(),
      spectrumSliderTrackOptions: {
        size: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, 15 )
      },
      spectrumSliderThumbOptions: {
        width: 18,
        height: 18,
        cursorHeight: 15
      },
      titleNodeOptions: {
        font: SOURCE_CONTROL_TITLE_FONT,
        maxWidth: 100
      },
      numberDisplayOptions: {

        // WavelengthNumberControl supplies a wavelength-specific valuePattern by default. This custom
        // formatter adds the color zone to the accessible value, so clear that default pattern.
        valuePattern: SunConstants.VALUE_NAMED_PLACEHOLDER,
        numberFormatter: ( value: number ) => {
          const roundedValue = roundSymmetric( value );
          const colorZone = getWavelengthColorZone( roundedValue );
          return {
            visualString: nanometersUnit.getVisualSymbolPatternString( roundedValue, {
              decimalPlaces: 0,
              showTrailingZeros: false,
              showIntegersAsIntegers: true
            } ),
            accessibleString: QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleValue.format( {
              value: nanometersUnit.getAccessibleString( roundedValue, {
                decimalPlaces: 0,
                showTrailingZeros: false,
                showIntegersAsIntegers: true
              } ),
              color: getWavelengthColorZoneStringProperty( colorZone ).value
            } )
          };
        },
        numberFormatterDependencies: Array.from( new Set( [
          ...nanometersUnit.getDependentProperties(),
          ...QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleValue.getDependentProperties(),
          ...WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES
        ] ) ),
        textOptions: {
          font: new PhetFont( 14 )
        },
        maxWidth: 80
      },
      layoutFunction: NumberControl.createLayoutFunction4( {
        verticalSpacing: 8
      } ),
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.wavelengthSlider.accessibleHelpTextStringProperty,
      tandem: tandem.createTandem( 'wavelengthControl' )
    } );
  }
}
