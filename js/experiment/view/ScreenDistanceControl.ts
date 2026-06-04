// Copyright 2026, University of Colorado Boulder

/**
 * ScreenDistanceControl is the NumberControl for the experiment screen's screen distance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import { equalsEpsilon } from '../../../../dot/js/util/equalsEpsilon.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl, { NumberControlMajorTick, NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { showsDoubleSlitInterferencePattern } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';

const TITLE_FONT = new PhetFont( 14 );
const SLIDER_TRACK_SIZE = new Dimension2( 150, 3 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;
const SCREEN_DISTANCE_DECIMAL_PLACES = 2;
const SCREEN_DISTANCE_DELTA = 0.01;
const SCREEN_DISTANCE_RESPONSE_EPSILON = 1e-12;

type ScreenDistanceDirection = 'closer' | 'farther';
type ScreenDistancePatternEffect = 'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther';

type SelfOptions = EmptySelfOptions;

export type ScreenDistanceControlOptions = SelfOptions & PickRequired<NumberControlOptions, 'tandem'>;

function getScreenDistanceContextResponse( scene: SceneModel, value: number, valueOnStart: number ): string | null {
  if ( equalsEpsilon( value, valueOnStart, SCREEN_DISTANCE_RESPONSE_EPSILON ) ) {
    return null;
  }

  const direction: ScreenDistanceDirection = value < valueOnStart ? 'closer' : 'farther';

  if ( !scene.isEmittingProperty.value ) {
    return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponseNoPattern.format( {
      direction: direction
    } );
  }

  if ( scene.detectionModeProperty.value === 'hits' ) {
    return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponseHits.format( {
      direction: direction
    } );
  }

  const isDoubleSlitInterferencePattern = showsDoubleSlitInterferencePattern( scene.slitSettingProperty.value );
  const patternEffect: ScreenDistancePatternEffect = isDoubleSlitInterferencePattern ?
                                                     ( direction === 'closer' ? 'doubleSlitCloser' : 'doubleSlitFarther' ) :
                                                     ( direction === 'closer' ? 'singleSlitCloser' : 'singleSlitFarther' );

  return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponse.format( {
    direction: direction,
    patternEffect: patternEffect
  } );
}

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
        majorTicks: ScreenDistanceControl.createNumericTicks( screenDistanceRange.min, screenDistanceRange.max ),
        createContextResponseAlert: ( value, _newValue, valueOnStart ) =>
          getScreenDistanceContextResponse( scene, value, valueOnStart )
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

  private static createNumericTicks( min: number, max: number ): NumberControlMajorTick[] {
    return ExperimentConstants.createMinMaxTicks( min, max, { decimalPlaces: SCREEN_DISTANCE_DECIMAL_PLACES } );
  }
}
