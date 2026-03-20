// Copyright 2026, University of Colorado Boulder

/**
 * OverheadDetectorScreenNode displays the detector screen in overhead perspective, including the
 * label, parallelogram, pattern overlay, and distance span arrow. The parallelogram slides
 * horizontally based on the screen distance property.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { toFixed } from '../../../../dot/js/util/toFixed.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import createParallelogramNode from './createParallelogramNode.js';
import OverheadDetectorPatternNode from './OverheadDetectorPatternNode.js';

const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 18;

export const DETECTOR_DX = 60;
export const DETECTOR_DY = 24;
export const DETECTOR_LEFT_HEIGHT = 48;

export default class OverheadDetectorScreenNode extends Node {

  public readonly parallelogramNode: Path;
  public readonly overheadPatternNode: OverheadDetectorPatternNode;

  private frontFacingScreenLeft = 0;
  private frontFacingScreenRight = 0;
  private readonly doubleSlitParallelogramNode: Node;
  private readonly model: ExperimentModel;
  private readonly updateDetectorScreenPosition: () => void;

  public constructor( model: ExperimentModel, doubleSlitParallelogramNode: Node ) {
    super();

    this.model = model;
    this.doubleSlitParallelogramNode = doubleSlitParallelogramNode;

    // Detector screen label
    const detectorScreenLabel = new Text( QuantumWaveInterferenceFluent.detectorScreenStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150
    } );
    this.addChild( detectorScreenLabel );

    // Detector screen parallelogram
    this.parallelogramNode = createParallelogramNode( DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT, 'black' );
    this.parallelogramNode.y = 48;
    this.addChild( this.parallelogramNode );

    // Interference pattern overlay
    this.overheadPatternNode = new OverheadDetectorPatternNode( DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT );
    this.parallelogramNode.addChild( this.overheadPatternNode );

    // Distance span between double slit and detector screen
    const SPAN_TICK_LENGTH = 8;
    const distanceSpanArrow = new ArrowNode( 0, 0, 1, 0, {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 1,
      doubleHead: true,
      fill: 'black',
      stroke: null
    } );
    this.addChild( distanceSpanArrow );

    const distanceSpanLeftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
      stroke: 'black', lineWidth: 1
    } );
    this.addChild( distanceSpanLeftTick );

    const distanceSpanRightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
      stroke: 'black', lineWidth: 1
    } );
    this.addChild( distanceSpanRightTick );

    const distanceText = new Text( '', {
      font: new PhetFont( 13 )
    } );
    this.addChild( distanceText );

    // Update detector screen parallelogram position and span
    this.updateDetectorScreenPosition = () => {
      const scene = model.sceneProperty.value;
      const distance = scene.screenDistanceProperty.value;
      const range = scene.screenDistanceRange;

      // Keep the detector vertically aligned with the slit/beam centerline.
      this.parallelogramNode.centerY = this.doubleSlitParallelogramNode.centerY;

      // Scene-dependent proportional mapping:
      // center-to-center distance in view space is proportional to the model's screen distance.
      // For each scene, its max screenDistance maps to the current far-right max position.
      const slitCenterX = this.doubleSlitParallelogramNode.centerX;
      const maxScreenCenterX = this.frontFacingScreenRight - DETECTOR_DX / 2;
      const maxCenterDistanceX = maxScreenCenterX - slitCenterX;
      const pixelsPerMeter = maxCenterDistanceX / range.max;
      const screenCenterX = slitCenterX + distance * pixelsPerMeter;
      this.parallelogramNode.centerX = screenCenterX;

      detectorScreenLabel.centerX = this.parallelogramNode.centerX;
      detectorScreenLabel.top = LABEL_Y;

      const spanY = Math.max( this.doubleSlitParallelogramNode.bottom, this.parallelogramNode.bottom ) + 12;
      const leftX = this.doubleSlitParallelogramNode.centerX;
      const rightX = this.parallelogramNode.centerX;

      distanceSpanArrow.setTailAndTip( leftX, spanY, rightX, spanY );
      distanceSpanLeftTick.x = leftX;
      distanceSpanLeftTick.centerY = spanY;
      distanceSpanRightTick.x = rightX;
      distanceSpanRightTick.centerY = spanY;

      distanceText.string = `${toFixed( distance, 1 )} m`;
      distanceText.centerX = ( leftX + rightX ) / 2;
      distanceText.bottom = spanY - SPAN_TICK_LENGTH / 2 - 2;
    };

    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.screenDistanceProperty.unlink( this.updateDetectorScreenPosition );
      }
      newScene.screenDistanceProperty.link( this.updateDetectorScreenPosition );
    } );
  }

  /**
   * Sets the front-facing screen bounds used for positioning the overhead parallelogram.
   * Must be called after front-facing screens are created.
   */
  public setFrontFacingScreenBounds( left: number, right: number ): void {
    this.frontFacingScreenLeft = left;
    this.frontFacingScreenRight = right;
    this.updateDetectorScreenPosition();
  }

  /**
   * Returns the detector screen parallelogram left x-position corresponding to the
   * maximum screen distance for the active scene. Used for keeping the overhead fan-beam
   * graphic static in width while the detector screen itself moves.
   */
  public getMaxDistanceParallelogramLeft(): number {
    if ( this.frontFacingScreenRight <= this.frontFacingScreenLeft ) {
      return this.parallelogramNode.left;
    }
    return this.frontFacingScreenRight - DETECTOR_DX;
  }
}
