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
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import createParallelogramNode from './createParallelogramNode.js';
import OverheadDetectorPatternNode from './OverheadDetectorPatternNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const OVERHEAD_SKEW_SCALE = ExperimentConstants.OVERHEAD_SKEW_SCALE;
const LABEL_FONT = new PhetFont( 14 * OVERHEAD_SCALE );
const LABEL_Y = 18;
const BASE_DETECTOR_DX = 60;
const DISTANCE_LABEL_FONT = new PhetFont( 11 * OVERHEAD_SCALE );

export const DETECTOR_DX = BASE_DETECTOR_DX * OVERHEAD_SCALE;
export const DETECTOR_DY = 24 * OVERHEAD_SCALE * OVERHEAD_SKEW_SCALE;
export const DETECTOR_LEFT_HEIGHT = 48 * OVERHEAD_SCALE;

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
    this.parallelogramNode = createParallelogramNode( DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT, 'black', 0 );
    this.parallelogramNode.y = 48;
    this.addChild( this.parallelogramNode );

    // Interference pattern overlay
    this.overheadPatternNode = new OverheadDetectorPatternNode( DETECTOR_DX, DETECTOR_DY, DETECTOR_LEFT_HEIGHT );
    this.parallelogramNode.addChild( this.overheadPatternNode );

    // Distance span between double slit and detector screen
    const SPAN_TICK_LENGTH = 8 * OVERHEAD_SCALE;
    const distanceSpanArrow = new ArrowNode( 0, 0, 1, 0, {
      headHeight: 5 * OVERHEAD_SCALE,
      headWidth: 5 * OVERHEAD_SCALE,
      tailWidth: 1 * OVERHEAD_SCALE,
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
      font: DISTANCE_LABEL_FONT
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
      const maxScreenCenterX = this.frontFacingScreenRight - BASE_DETECTOR_DX / 2;
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
      distanceText.bottom = spanY - SPAN_TICK_LENGTH / 2;
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
    const maxScreenCenterX = this.frontFacingScreenRight - BASE_DETECTOR_DX / 2;
    return maxScreenCenterX - DETECTOR_DX / 2;
  }
}
