// Copyright 2026, University of Colorado Boulder

/**
 * BarrierScreenDistanceIndicatorNode displays the distance from the double-slit barrier to the detector screen plane
 * as a horizontal span annotation below the front-facing wave region.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { type BarrierType } from '../model/BarrierType.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import formatFrontFacingScreenDistance from './formatFrontFacingScreenDistance.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

const SPAN_TICK_LENGTH = 8;
const SPAN_LINE_Y = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT + 12;
const SPAN_LABEL_FONT = new PhetFont( 12 );
const SPAN_LABEL_HORIZONTAL_MARGIN = 8;

type BarrierScreenDistanceIndicatorScene = {
  readonly regionWidth: number;
};

export default class BarrierScreenDistanceIndicatorNode extends Node {

  /**
   * Creates the visual span annotation used on front-facing wave-region screens. The indicator reads the active scene
   * width so the label uses the same nanometer/micrometer units as the measuring tape and snapshot metadata.
   */
  public constructor(
    sceneProperty: TReadOnlyProperty<BarrierScreenDistanceIndicatorScene>,
    barrierTypeProperty: TReadOnlyProperty<BarrierType>,
    barrierPositionFractionProperty: TReadOnlyProperty<number>
  ) {
    super( {
      isDisposable: false,
      pickable: false
    } );

    const distanceSpanLine = new Line( 0, 0, 1, 0, {
      stroke: 'black',
      lineWidth: 1
    } );
    this.addChild( distanceSpanLine );

    const createTick = () => new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
      stroke: 'black',
      lineWidth: 1
    } );

    const distanceSpanLeftTick = createTick();
    this.addChild( distanceSpanLeftTick );

    const distanceSpanRightTick = createTick();
    this.addChild( distanceSpanRightTick );

    const distanceText = new Text( '', {
      font: SPAN_LABEL_FONT
    } );
    this.addChild( distanceText );

    const updateIndicator = () => {
      const scene = sceneProperty.value;
      const barrierType = barrierTypeProperty.value;
      const barrierPositionFraction = barrierPositionFractionProperty.value;
      const isDoubleSlit = barrierType === 'doubleSlit';
      this.visible = isDoubleSlit;

      if ( !isDoubleSlit ) {
        return;
      }

      const leftX = barrierPositionFraction * WAVE_REGION_WIDTH;
      const rightX = WAVE_REGION_WIDTH;
      const screenDistanceMeters = ( 1 - barrierPositionFraction ) * scene.regionWidth;

      distanceSpanLine.setLine( leftX, SPAN_LINE_Y, rightX, SPAN_LINE_Y );
      distanceSpanLeftTick.x = leftX;
      distanceSpanLeftTick.centerY = SPAN_LINE_Y;
      distanceSpanRightTick.x = rightX;
      distanceSpanRightTick.centerY = SPAN_LINE_Y;

      distanceText.string = formatFrontFacingScreenDistance(
        screenDistanceMeters,
        scene.regionWidth
      ).visualString;
      distanceText.maxWidth = Math.max( 1, rightX - leftX - 2 * SPAN_LABEL_HORIZONTAL_MARGIN );
      distanceText.centerX = ( leftX + rightX ) / 2;
      distanceText.top = SPAN_LINE_Y + SPAN_TICK_LENGTH / 2;
    };

    // This node lives for the screen lifetime, so these links are intentionally not unlinked.
    Array.from( new Set( [
      sceneProperty,
      barrierTypeProperty,
      barrierPositionFractionProperty,
      ...micrometersUnit.getDependentProperties(),
      ...nanometersUnit.getDependentProperties()
    ] ) ).forEach( property => {
      property.link( updateIndicator );
    } );
  }
}
