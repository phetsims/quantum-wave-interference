// Copyright 2026, University of Colorado Boulder

/**
 * SourceIntensityControl creates the optional source-intensity slider. Some screens use source scenes with fixed
 * intensity and therefore do not create this control.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SourceType } from '../model/SourceType.js';
import { SOURCE_CONTROL_PARTICLE_INTENSITY_LABEL_SPACING, SOURCE_CONTROL_PHOTON_INTENSITY_LABEL_SPACING, SOURCE_CONTROL_SLIDER_TRACK_HEIGHT, SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SOURCE_CONTROL_TICK_LABEL_FONT, SOURCE_CONTROL_TITLE_FONT } from './SourceControlPanelConstants.js';

/**
 * Returns a screen-reader context response that describes how the source intensity changed after a drag.
 */
function getIntensityContextResponse( sourceType: SourceType, value: number, valueOnStart: number, range: Range ): string | null {
  if ( value === valueOnStart ) {
    return null;
  }

  const change = value === range.min ? 'zero' :
                 value === range.max ? 'max' :
                 value > valueOnStart ? 'more' :
                 'less';

  return QuantumWaveInterferenceFluent.a11y.intensitySlider.accessibleContextResponse.format( {
    sourceType: sourceType,
    change: change
  } );
}

export default class SourceIntensityControl extends VBox {

  public constructor(
    intensityProperty: NumberProperty,
    sourceType: SourceType,
    intensityLabelStringProperty: TReadOnlyProperty<string>,
    tandem: Tandem
  ) {
    const intensitySlider = new HSlider( intensityProperty, intensityProperty.range, {
      trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SOURCE_CONTROL_SLIDER_TRACK_HEIGHT ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      tickLabelSpacing: sourceType === 'photons' ? 2 : 6,
      createAriaValueText: value => percentUnit.getAccessibleString( value * 100, {
        decimalPlaces: 0,
        showTrailingZeros: false,
        showIntegersAsIntegers: true
      } ),
      createContextResponseAlert: ( value, _newValue, valueOnStart ) =>
        getIntensityContextResponse( sourceType, value, valueOnStart, intensityProperty.range ),
      accessibleName: intensityLabelStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.intensitySlider.accessibleHelpText.createProperty( {
        sourceType: sourceType
      } ),
      tandem: tandem.createTandem( 'intensitySlider' )
    } );

    intensitySlider.addMajorTick( 0, new Text( '0', { font: SOURCE_CONTROL_TICK_LABEL_FONT } ) );
    intensitySlider.addMajorTick( 0.5 );
    intensitySlider.addMajorTick(
      1,
      new Text( QuantumWaveInterferenceFluent.maxStringProperty, {
        font: SOURCE_CONTROL_TICK_LABEL_FONT,
        maxWidth: 40
      } )
    );
    for ( let i = 1; i <= 4; i++ ) {
      intensitySlider.addMinorTick( i * 0.1 );
      intensitySlider.addMinorTick( 0.5 + i * 0.1 );
    }

    const intensityLabel = new Text( intensityLabelStringProperty, {
      font: SOURCE_CONTROL_TITLE_FONT,
      maxWidth: 120
    } );

    super( {
      spacing: sourceType === 'photons' ?
               SOURCE_CONTROL_PHOTON_INTENSITY_LABEL_SPACING :
               SOURCE_CONTROL_PARTICLE_INTENSITY_LABEL_SPACING,
      children: [ intensityLabel, intensitySlider ]
    } );
  }
}
