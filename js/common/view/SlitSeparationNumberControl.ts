// Copyright 2026, University of Colorado Boulder

/**
 * SlitSeparationNumberControl creates a slit separation NumberControl for a given scene. Used by both the
 * High Intensity and Single Particles screens. Each scene has a different physical range and may
 * display in millimeters, micrometers, or nanometers depending on the range magnitude.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import NumberControl, { NumberControlMajorTick } from '../../../../scenery-phet/js/NumberControl.js';
import { type NumberDisplayOptions } from '../../../../scenery-phet/js/NumberDisplay.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 120, 3 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;

// Model values are stored in millimeters, but very small scene ranges are clearer with smaller display units.
const NANOMETER_RANGE_THRESHOLD_MM = 0.0001;
const MICROMETER_RANGE_THRESHOLD_MM = 0.1;
const MICROMETERS_PER_MILLIMETER = 1000;
const NANOMETERS_PER_MILLIMETER = 1e6;

/**
 * Chooses the fewest decimal places that still produce compact min/max tick labels for converted unit values.
 */
const getCompactDecimalPlaces = ( maxValue: number ): number => {
  return maxValue >= 10 ? 0 :
         maxValue >= 1 ? 1 :
         2;
};

export default class SlitSeparationNumberControl extends NumberControl {

  /**
   * @param scene - provides the slit separation Property and its physical range, in millimeters
   * @param tandem - parent Tandem used to instrument this control for the scene source type
   */
  public constructor( scene: BaseSceneModel, tandem: Tandem ) {
    const range = scene.slitSeparationRange;
    const usesNanometers = range.max <= NANOMETER_RANGE_THRESHOLD_MM;
    const usesMicrometers = !usesNanometers && range.max <= MICROMETER_RANGE_THRESHOLD_MM;

    let numberDisplayOptions: NumberDisplayOptions;
    let ticks: NumberControlMajorTick[];
    let delta: number;

    if ( usesNanometers ) {

      // Nanometer scenes keep the model value in millimeters, but display and label values in nanometers.
      const minNM = range.min * NANOMETERS_PER_MILLIMETER;
      const maxNM = range.max * NANOMETERS_PER_MILLIMETER;
      const decimalPlaces = getCompactDecimalPlaces( maxNM );
      delta = Math.pow( 10, -decimalPlaces ) / NANOMETERS_PER_MILLIMETER;
      numberDisplayOptions = {
        numberFormatter: ( valueMM: number ) => {
          const valueNM = valueMM * NANOMETERS_PER_MILLIMETER;
          const numberFormatOptions = {
            decimalPlaces: decimalPlaces,
            showTrailingZeros: true
          };
          return {
            visualString: nanometersUnit.getVisualSymbolPatternString( valueNM, numberFormatOptions ),
            accessibleString: nanometersUnit.getAccessibleString( valueNM, numberFormatOptions )
          };
        },
        numberFormatterDependencies: [
          ...nanometersUnit.getDependentProperties()
        ],
        textOptions: { font: new PhetFont( 14 ) },
        maxWidth: 100
      };
      ticks = [
        { value: range.min, label: new Text( toFixed( minNM, decimalPlaces ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) },
        { value: range.max, label: new Text( toFixed( maxNM, decimalPlaces ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) }
      ];
    }
    else if ( usesMicrometers ) {

      // Micrometer scenes use the same millimeter-backed Property with micrometer formatting for readability.
      const minUM = range.min * MICROMETERS_PER_MILLIMETER;
      const maxUM = range.max * MICROMETERS_PER_MILLIMETER;
      const dp = getCompactDecimalPlaces( maxUM );
      delta = Math.pow( 10, -dp ) / MICROMETERS_PER_MILLIMETER;
      numberDisplayOptions = {
        numberFormatter: ( valueMM: number ) => {
          const valueUM = valueMM * MICROMETERS_PER_MILLIMETER;
          const numberFormatOptions = {
            decimalPlaces: dp,
            showTrailingZeros: true
          };
          return {
            visualString: micrometersUnit.getVisualSymbolPatternString( valueUM, numberFormatOptions ),
            accessibleString: micrometersUnit.getAccessibleString( valueUM, numberFormatOptions )
          };
        },
        numberFormatterDependencies: [
          ...micrometersUnit.getDependentProperties()
        ],
        textOptions: { font: new PhetFont( 14 ) },
        maxWidth: 100
      };
      ticks = [
        { value: range.min, label: new Text( toFixed( minUM, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) },
        { value: range.max, label: new Text( toFixed( maxUM, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) }
      ];
    }
    else {

      // Larger ranges remain in millimeters and use the shared decimal-place helper for range endpoints.
      const dp = QuantumWaveInterferenceConstants.getRangeDecimalPlaces( range.min, range.max );
      delta = 0.1;
      numberDisplayOptions = {
        decimalPlaces: dp,
        textOptions: { font: new PhetFont( 14 ) },
        maxWidth: 100
      };
      ticks = [
        { value: range.min, label: new Text( toFixed( range.min, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) },
        { value: range.max, label: new Text( toFixed( range.max, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) }
      ];
    }

    super(
      QuantumWaveInterferenceFluent.slitSeparationStringProperty,
      scene.slitSeparationProperty,
      range,
      {
        delta: delta,
        titleNodeOptions: {
          font: TITLE_FONT,
          maxWidth: 150
        },
        numberDisplayOptions: numberDisplayOptions,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSeparationSlider.accessibleHelpText.createProperty( {
          unit: usesNanometers ? 'nanometers' : usesMicrometers ? 'micrometers' : 'millimeters'
        } ),
        sliderOptions: {
          trackSize: SLIDER_TRACK_SIZE,
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: ticks
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          ySpacing: NUMBER_CONTROL_Y_SPACING,
          arrowButtonsXSpacing: ARROW_BUTTONS_X_SPACING
        } ),
        tandem: tandem.createTandem( `${scene.sourceType}SlitSeparationControl` )
      }
    );
  }
}
