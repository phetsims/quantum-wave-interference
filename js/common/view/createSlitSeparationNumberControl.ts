// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates a slit separation NumberControl for a given scene. Used by both the
 * High Intensity and Single Particles screens. Each scene has a different physical range and may
 * display in millimeters, micrometers, or nanometers depending on the range magnitude.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 120, 3 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;
const NANOMETER_RANGE_THRESHOLD_MM = 0.0001;

const getCompactDecimalPlaces = ( maxValue: number ): number => {
  return maxValue >= 10 ? 0 :
         maxValue >= 1 ? 1 :
         2;
};

const createSlitSeparationNumberControl = ( scene: BaseSceneModel, tandem: Tandem ): Node => {
  const range = scene.slitSeparationRange;
  const usesNanometers = range.max <= NANOMETER_RANGE_THRESHOLD_MM;
  const usesMicrometers = !usesNanometers && range.max <= 0.1;

  let numberDisplayOptions;
  let ticks: { value: number; label: Node }[];
  let delta: number;

  if ( usesNanometers ) {
    const minNM = range.min * 1e6;
    const maxNM = range.max * 1e6;
    const dp = getCompactDecimalPlaces( maxNM );
    delta = Math.pow( 10, -dp ) / 1e6;
    numberDisplayOptions = {
      numberFormatter: ( valueMM: number ) => {
        const valueNM = valueMM * 1e6;
        return {
          visualString: StringUtils.fillIn(
            QuantumWaveInterferenceFluent.valueNanometersPatternStringProperty.value,
            { value: toFixed( valueNM, dp ) }
          ),
          accessibleString: `${toFixed( valueNM, dp )} nanometers`
        };
      },
      numberFormatterDependencies: [
        QuantumWaveInterferenceFluent.valueNanometersPatternStringProperty
      ],
      textOptions: { font: new PhetFont( 14 ) },
      maxWidth: 100
    };
    ticks = [
      { value: range.min, label: new Text( toFixed( minNM, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) },
      { value: range.max, label: new Text( toFixed( maxNM, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) }
    ];
  }
  else if ( usesMicrometers ) {
    const minUM = range.min * 1000;
    const maxUM = range.max * 1000;
    const dp = getCompactDecimalPlaces( maxUM );
    delta = Math.pow( 10, -dp ) / 1000;
    numberDisplayOptions = {
      numberFormatter: ( valueMM: number ) => {
        const valueUM = valueMM * 1000;
        return {
          visualString: StringUtils.fillIn(
            QuantumWaveInterferenceFluent.slitSeparationMicrometerPatternStringProperty.value,
            { value: toFixed( valueUM, dp ) }
          ),
          accessibleString: `${toFixed( valueUM, dp )} micrometers`
        };
      },
      numberFormatterDependencies: [
        QuantumWaveInterferenceFluent.slitSeparationMicrometerPatternStringProperty
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
    const dp = QuantumWaveInterferenceConstants.getRangeDecimalPlaces( range.min, range.max );
    delta = 0.1;
    numberDisplayOptions = {
      decimalPlaces: dp,
      valuePattern: {
        visualPattern: QuantumWaveInterferenceFluent.slitSeparationPatternStringProperty,
        accessiblePattern: millimetersUnit.accessiblePattern!
      },
      textOptions: { font: new PhetFont( 14 ) },
      maxWidth: 100
    };
    ticks = [
      { value: range.min, label: new Text( toFixed( range.min, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) },
      { value: range.max, label: new Text( toFixed( range.max, dp ), { font: TICK_LABEL_FONT, maxWidth: 40 } ) }
    ];
  }

  return new NumberControl(
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
};

export default createSlitSeparationNumberControl;
