// Copyright 2026, University of Colorado Boulder

/**
 * ScreenDistanceControl is the NumberControl for the experiment screen's screen distance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';

const TITLE_FONT = new PhetFont( 14 );
const TICK_LABEL_FONT = new PhetFont( 12 );
const SLIDER_TRACK_SIZE = new Dimension2( 150, 3 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;
const SCREEN_DISTANCE_DECIMAL_PLACES = 2;
const SCREEN_DISTANCE_DELTA = 0.01;

type SelfOptions = EmptySelfOptions;

export type ScreenDistanceControlOptions = SelfOptions & PickRequired<NumberControlOptions, 'tandem'>;

export default class ScreenDistanceControl extends NumberControl {

  public constructor( scene: SceneModel, providedOptions: ScreenDistanceControlOptions ) {
    const screenDistanceRange = scene.screenDistanceRange;

    const options = optionize<ScreenDistanceControlOptions, SelfOptions, NumberControlOptions>()( {
      delta: SCREEN_DISTANCE_DELTA,
      titleNodeOptions: {
        font: TITLE_FONT,
        maxWidth: 150
      },
      numberDisplayOptions: {
        decimalPlaces: SCREEN_DISTANCE_DECIMAL_PLACES,
        textOptions: {
          font: new PhetFont( 14 )
        },
        maxWidth: 100
      },
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleHelpTextStringProperty,
      sliderOptions: {
        trackSize: SLIDER_TRACK_SIZE,
        thumbSize: new Dimension2( 13, 22 ),
        majorTickLength: 12,
        majorTicks: ScreenDistanceControl.createNumericTicks( screenDistanceRange, SCREEN_DISTANCE_DECIMAL_PLACES )
      },
      layoutFunction: NumberControl.createLayoutFunction1( {
        ySpacing: NUMBER_CONTROL_Y_SPACING,
        arrowButtonsXSpacing: ARROW_BUTTONS_X_SPACING
      } )
    }, providedOptions );

    super(
      QuantumWaveInterferenceFluent.screenDistanceStringProperty,
      scene.screenDistanceProperty,
      screenDistanceRange,
      options
    );
  }

  /**
   * Creates major tick marks with numeric labels showing the min and max values of the range.
   * Uses minimal decimal places needed to represent the values without trailing zeros.
   */
  private static createNumericTicks( range: Range, decimalPlaces?: number ): { value: number; label: Node }[] {

    // Use consistent decimal places across both tick labels so they visually match. E.g., for range 0.2-1.0 mm,
    // both ticks should show 1 decimal place: "0.2" and "1.0".
    const tickDecimalPlaces = decimalPlaces ?? Math.max(
      ExperimentConstants.getDecimalPlacesForValue( range.min ),
      ExperimentConstants.getDecimalPlacesForValue( range.max )
    );

    return [
      {
        value: range.min,
        label: new Text( toFixed( range.min, tickDecimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      },
      {
        value: range.max,
        label: new Text( toFixed( range.max, tickDecimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      }
    ];
  }
}
