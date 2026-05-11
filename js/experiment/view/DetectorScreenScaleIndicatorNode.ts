// Copyright 2026, University of Colorado Boulder

/**
 * Scale indicator for the Experiment front-facing detector screen and Experiment snapshots dialog.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../model/DetectorScreenScale.js';

const TARGET_SCALE_WIDTH_MM = 5;
const SPAN_TICK_LENGTH = 8;
const DEFAULT_SPAN_ARROW_Y = -10;

/**
 * Returns the number of decimal places to show in a millimeter scale label,
 * based on the magnitude of the value (0 for integers >=1, 1 for >=0.1, 2 otherwise).
 */
const getScaleLabelDecimalPlaces = ( valueMM: number ): number => {
  if ( valueMM >= 1 ) {
    return Number.isInteger( valueMM ) ? 0 : 1;
  }
  if ( valueMM >= 0.1 ) {
    return 1;
  }
  return 2;
};

export default class DetectorScreenScaleIndicatorNode extends Node {

  public constructor(
    detectorScreenScaleIndexProperty: TReadOnlyProperty<number>,
    detectorScreenWidth: number,
    spanArrowY = DEFAULT_SPAN_ARROW_Y
  ) {

    const scaleLabelStringProperty = new DerivedProperty(
      [
        detectorScreenScaleIndexProperty,
        QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty
      ],
      ( detectorScreenScaleIndex, pattern ) => {
        const fullPhysicalWidthMM = getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndex ) * 2 * 1e3;
        const scalePhysicalWidthMM = fullPhysicalWidthMM >= TARGET_SCALE_WIDTH_MM ?
                                     TARGET_SCALE_WIDTH_MM :
                                     fullPhysicalWidthMM * 0.25;
        return StringUtils.fillIn( pattern, {
          value: toFixed( scalePhysicalWidthMM, getScaleLabelDecimalPlaces( scalePhysicalWidthMM ) )
        } );
      }
    );

    const scaleArrow = new ArrowNode( 0, spanArrowY, 1, spanArrowY, {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 1,
      doubleHead: true,
      fill: 'black',
      stroke: null
    } );

    const scaleLeftTick = new Line(
      0,
      spanArrowY - SPAN_TICK_LENGTH / 2,
      0,
      spanArrowY + SPAN_TICK_LENGTH / 2,
      { stroke: 'black', lineWidth: 1 }
    );

    const scaleRightTick = new Line(
      0,
      spanArrowY - SPAN_TICK_LENGTH / 2,
      0,
      spanArrowY + SPAN_TICK_LENGTH / 2,
      { stroke: 'black', lineWidth: 1 }
    );

    const scaleLabelText = new Text( scaleLabelStringProperty, {
      font: new PhetFont( 12 ),
      fill: 'black',
      maxWidth: 100,
      centerY: spanArrowY
    } );

    super( {
      isDisposable: false,
      children: [ scaleArrow, scaleLeftTick, scaleRightTick, scaleLabelText ]
    } );

    const updateScaleIndicator = () => {
      const fullPhysicalWidth = getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value ) * 2;
      const metersPerPixel = fullPhysicalWidth / detectorScreenWidth;
      const fullPhysicalWidthMM = fullPhysicalWidth * 1e3;
      const scalePhysicalWidthMM = fullPhysicalWidthMM >= TARGET_SCALE_WIDTH_MM ?
                                   TARGET_SCALE_WIDTH_MM :
                                   fullPhysicalWidthMM * 0.25;
      const scaleArrowWidth = ( scalePhysicalWidthMM * 1e-3 ) / metersPerPixel;

      scaleArrow.setTailAndTip( 0, spanArrowY, scaleArrowWidth, spanArrowY );
      scaleRightTick.x = scaleArrowWidth;
      scaleLabelText.left = scaleArrowWidth + 4;
    };
    detectorScreenScaleIndexProperty.link( updateScaleIndicator );
  }
}
