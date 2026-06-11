// Copyright 2026, University of Colorado Boulder

/**
 * ScreenDistanceControl is the NumberControl for the experiment screen's screen distance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { equalsEpsilon } from '../../../../dot/js/util/equalsEpsilon.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern, type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';

const TITLE_FONT = new PhetFont( 14 );
const SLIDER_TRACK_SIZE = new Dimension2( 150, 3 );
const NUMBER_CONTROL_Y_SPACING = 8;
const ARROW_BUTTONS_X_SPACING = 6;
const SCREEN_DISTANCE_DECIMAL_PLACES = 2;
const SCREEN_DISTANCE_DELTA = 0.01;
const SCREEN_DISTANCE_RESPONSE_EPSILON = 1e-12;

/**
 * Describes whether the screen is at a range endpoint or moved closer/farther relative to the value at interaction
 * start.
 */
type ScreenDistancePosition = 'closest' | 'closer' | 'farther' | 'farthest';

/**
 * Describes how moving the screen changes the visible single- or double-slit interference pattern.
 */
type ScreenDistancePatternEffect = 'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther';

// The slice of SceneModel needed by this control and its context-response helpers.
type ScreenDistanceScene = {
  readonly screenDistanceProperty: NumberProperty;
  readonly screenDistanceRange: Range;
  readonly isEmittingProperty: TReadOnlyProperty<boolean>;
  readonly detectionModeProperty: TReadOnlyProperty<DetectionMode>;
  readonly slitSettingProperty: TReadOnlyProperty<SlitConfiguration>;
};

type SelfOptions = EmptySelfOptions;

/**
 * Options for ScreenDistanceControl. A tandem is required for PhET-iO instrumentation.
 */
export type ScreenDistanceControlOptions = SelfOptions & PickRequired<NumberControlOptions, 'tandem'>;

/**
 * Classifies the screen distance for an accessibility response. Range endpoints are recognized within
 * SCREEN_DISTANCE_RESPONSE_EPSILON; other values are classified relative to the value at interaction start.
 *
 * @param scene - supplies the allowed screen-distance range
 * @param value - current screen distance
 * @param valueOnStart - screen distance when the interaction started
 * @returns the endpoint or relative movement classification
 */
function getScreenDistancePosition( scene: ScreenDistanceScene, value: number, valueOnStart: number ): ScreenDistancePosition {
  return equalsEpsilon( value, scene.screenDistanceRange.min, SCREEN_DISTANCE_RESPONSE_EPSILON ) ? 'closest' :
         equalsEpsilon( value, scene.screenDistanceRange.max, SCREEN_DISTANCE_RESPONSE_EPSILON ) ? 'farthest' :
         value < valueOnStart ? 'closer' :
         'farther';
}

/**
 * Creates the context response for a completed screen-distance interaction, based on whether a pattern is visible and
 * how moving the screen affects it. Returns null when the final value equals the interaction-start value within
 * SCREEN_DISTANCE_RESPONSE_EPSILON, so no unchanged-value response is announced.
 *
 * @param scene - supplies the screen-distance range and current experiment state
 * @param value - final screen distance
 * @param valueOnStart - screen distance when the interaction started
 * @returns a localized accessibility response, or null when the distance did not meaningfully change
 */
function getScreenDistanceContextResponse( scene: ScreenDistanceScene, value: number, valueOnStart: number ): string | null {
  if ( equalsEpsilon( value, valueOnStart, SCREEN_DISTANCE_RESPONSE_EPSILON ) ) {
    return null;
  }

  const position = getScreenDistancePosition( scene, value, valueOnStart );

  if ( !scene.isEmittingProperty.value ) {
    return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponseNoPattern.format( {
      position: position
    } );
  }

  if ( scene.detectionModeProperty.value === 'hits' ) {
    return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponseHits.format( {
      position: position
    } );
  }

  const isDoubleSlitInterferencePattern = showsDoubleSlitInterferencePattern( scene.slitSettingProperty.value );
  const isCloser = position === 'closest' || position === 'closer';
  const patternEffect: ScreenDistancePatternEffect = isDoubleSlitInterferencePattern ?
                                                     ( isCloser ? 'doubleSlitCloser' : 'doubleSlitFarther' ) :
                                                     ( isCloser ? 'singleSlitCloser' : 'singleSlitFarther' );

  return QuantumWaveInterferenceFluent.a11y.screenDistanceSlider.accessibleContextResponse.format( {
    position: position,
    patternEffect: patternEffect
  } );
}

export default class ScreenDistanceControl extends NumberControl {

  public constructor( scene: ScreenDistanceScene, providedOptions: ScreenDistanceControlOptions ) {
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
        majorTicks: ExperimentConstants.createMinMaxTicks( screenDistanceRange.min, screenDistanceRange.max, {
          decimalPlaces: SCREEN_DISTANCE_DECIMAL_PLACES
        } ),
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

}
