// Copyright 2026, University of Colorado Boulder

/**
 * SlitSeparationControl is the NumberControl for the experiment screen's slit separation. It displays the model value,
 * stored in mm, as either mm or μm depending on the scene scale.
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
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
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

type SelfOptions = EmptySelfOptions;

export type SlitSeparationControlOptions = SelfOptions & PickRequired<NumberControlOptions, 'tandem'>;

export default class SlitSeparationControl extends NumberControl {

  public constructor( scene: SceneModel, providedOptions: SlitSeparationControlOptions ) {
    const slitSeparationRange = scene.slitSeparationRange;
    const usesMicrometers = scene.sourceType === 'photons' || slitSeparationRange.max <= 0.1;

    let numberDisplayOptions;
    let ticks;
    let delta;

    if ( usesMicrometers ) {

      // Display in μm: convert mm values to μm (×1000) for the number display and ticks.
      const mmToMicrometerDecimalPlaces = ExperimentConstants.getRangeDecimalPlaces(
        slitSeparationRange.min * 1000, slitSeparationRange.max * 1000
      );
      delta = scene.sourceType === 'photons' ? SlitSeparationControl.getDelta( slitSeparationRange ) : 0.0001;
      numberDisplayOptions = {
        numberFormatter: ( valueMM: number ) => {
          const valueUM = valueMM * 1000;
          const numberFormatOptions = {
            decimalPlaces: mmToMicrometerDecimalPlaces,
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
        textOptions: {
          font: new PhetFont( 14 )
        },
        maxWidth: 100
      };
      ticks = SlitSeparationControl.createMicrometerTicks( slitSeparationRange );
    }
    else {
      const slitSeparationDecimalPlaces = ExperimentConstants.getRangeDecimalPlaces( slitSeparationRange.min, slitSeparationRange.max );
      delta = SlitSeparationControl.getDelta( slitSeparationRange );
      numberDisplayOptions = {
        decimalPlaces: slitSeparationDecimalPlaces,
        textOptions: {
          font: new PhetFont( 14 )
        },
        maxWidth: 100
      };
      ticks = SlitSeparationControl.createNumericTicks( slitSeparationRange );
    }

    const options = optionize<SlitSeparationControlOptions, SelfOptions, NumberControlOptions>()( {
      delta: delta,
      titleNodeOptions: {
        font: TITLE_FONT,
        maxWidth: 150
      },
      numberDisplayOptions: numberDisplayOptions,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSeparationSlider.accessibleHelpTextStringProperty,
      sliderOptions: {
        trackSize: SLIDER_TRACK_SIZE,
        thumbSize: new Dimension2( 13, 22 ),
        majorTickLength: 12,
        majorTicks: ticks
      },
      layoutFunction: NumberControl.createLayoutFunction1( {
        ySpacing: NUMBER_CONTROL_Y_SPACING,
        arrowButtonsXSpacing: ARROW_BUTTONS_X_SPACING
      } )
    }, providedOptions );

    super(
      QuantumWaveInterferenceFluent.slitSeparationStringProperty,
      scene.slitSeparationProperty,
      slitSeparationRange,
      options
    );
  }

  /**
   * Creates major tick marks with μm labels for slit separation ranges that are in the micrometer scale.
   * The range is in mm but the labels display the values converted to μm for readability.
   */
  private static createMicrometerTicks( range: Range ): { value: number; label: Node }[] {

    // Use consistent decimal places across both tick labels so they visually match. E.g., for range 0.5-1.0 μm,
    // both ticks should show 1 decimal place: "0.5" and "1.0".
    const minUM = range.min * 1000;
    const maxUM = range.max * 1000;
    const decimalPlaces = Math.max(
      ExperimentConstants.getDecimalPlacesForValue( minUM ),
      ExperimentConstants.getDecimalPlacesForValue( maxUM )
    );

    return [
      {
        value: range.min,
        label: new Text( toFixed( minUM, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      },
      {
        value: range.max,
        label: new Text( toFixed( maxUM, decimalPlaces ), {
          font: TICK_LABEL_FONT,
          maxWidth: 40
        } )
      }
    ];
  }

  /**
   * Creates major tick marks with numeric labels showing the min and max values of the range.
   * Uses minimal decimal places needed to represent the values without trailing zeros.
   */
  private static createNumericTicks( range: Range ): { value: number; label: Node }[] {

    // Use consistent decimal places across both tick labels so they visually match. E.g., for range 0.2-1.0 mm,
    // both ticks should show 1 decimal place: "0.2" and "1.0".
    const tickDecimalPlaces = Math.max(
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

  /**
   * Determines an appropriate delta (step size) for a NumberControl based on the decimal precision of the range
   * boundaries. The step size is the smallest increment representable at that precision (e.g.,
   * 1 decimal place -> delta = 0.1).
   */
  private static getDelta( range: Range ): number {
    const decimalPlaces = ExperimentConstants.getRangeDecimalPlaces( range.min, range.max );
    return Math.pow( 10, -decimalPlaces );
  }
}
