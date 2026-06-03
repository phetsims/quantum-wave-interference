// Copyright 2026, University of Colorado Boulder

/**
 * SlitSeparationControl is the NumberControl for the experiment screen's slit separation. It displays the model value,
 * stored in mm, as either mm or μm depending on the scene scale.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import NumberControl, { NumberControlOptions } from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';

const TITLE_FONT = new PhetFont( 14 );
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
      ticks = ExperimentConstants.createMinMaxTicks(
        slitSeparationRange.min, slitSeparationRange.max,
        { labelScale: 1000 }
      );
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
      ticks = ExperimentConstants.createMinMaxTicks( slitSeparationRange.min, slitSeparationRange.max );
    }

    const options = optionize<SlitSeparationControlOptions, SelfOptions, NumberControlOptions>()( {
      delta: delta,
      titleNodeOptions: {
        font: TITLE_FONT,
        maxWidth: 150
      },
      numberDisplayOptions: numberDisplayOptions,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSeparationSlider.accessibleHelpText.createProperty( {
        unit: usesMicrometers ? 'micrometers' : 'millimeters'
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
   * Determines an appropriate delta (step size) for a NumberControl based on the decimal precision of the range
   * boundaries. The step size is the smallest increment representable at that precision (e.g.,
   * 1 decimal place -> delta = 0.1).
   */
  private static getDelta( range: Range ): number {
    const decimalPlaces = ExperimentConstants.getRangeDecimalPlaces( range.min, range.max );
    return Math.pow( 10, -decimalPlaces );
  }
}
