// Copyright 2026, University of Colorado Boulder

/**
 * OverheadDetectorScreenNode displays the detector screen in overhead perspective, including the label, parallelogram,
 * pattern overlay, and distance span arrow. The parallelogram slides horizontally based on the screen distance
 * property.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import createParallelogramNode, { createParallelogramShape } from './createParallelogramNode.js';
import OverheadDetectorPatternNode from './OverheadDetectorPatternNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const OVERHEAD_SKEW_SCALE = ExperimentConstants.OVERHEAD_SKEW_SCALE;
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 13;
const BASE_DETECTOR_DX = 90;
const BASE_DOUBLE_SLIT_SKEW_DX = 51;
const BASE_DOUBLE_SLIT_SKEW_DY = 21;
const DISTANCE_LABEL_FONT = new PhetFont( 12 );

export const DETECTOR_DX = BASE_DETECTOR_DX * OVERHEAD_SCALE;
export const DETECTOR_DY = BASE_DETECTOR_DX * ( BASE_DOUBLE_SLIT_SKEW_DY / BASE_DOUBLE_SLIT_SKEW_DX ) * OVERHEAD_SCALE * OVERHEAD_SKEW_SCALE;
export const DETECTOR_LEFT_HEIGHT = 48 * OVERHEAD_SCALE;

export default class OverheadDetectorScreenNode extends Node {

  public readonly parallelogramNode: Path;
  public readonly overheadPatternNode: OverheadDetectorPatternNode;

  private readonly sceneProperty: TReadOnlyProperty<SceneModel>;
  private frontFacingScreenLeft = 0;
  private frontFacingScreenRight = 0;
  private currentScreenCenterX = 0;
  private readonly doubleSlitParallelogramNode: Node;
  private readonly updateDetectorScreenPosition: () => void;

  public constructor( sceneProperty: TReadOnlyProperty<SceneModel>, doubleSlitParallelogramNode: Node ) {
    super( { isDisposable: false } );

    this.sceneProperty = sceneProperty;
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
      tailWidth: OVERHEAD_SCALE,
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
      const scene = sceneProperty.value;
      const distance = scene.screenDistanceProperty.value;
      const range = scene.screenDistanceRange;
      const visibleWidthFraction = this.getVisibleDetectorWidthFraction();
      const visibleDx = DETECTOR_DX * visibleWidthFraction;
      const visibleDy = DETECTOR_DY * visibleWidthFraction;

      // Scene-dependent proportional mapping: center-to-center distance in view space is proportional to the model's
      // screen distance. For each scene, its max screenDistance maps to the current far-right max position.
      const slitCenterX = this.doubleSlitParallelogramNode.centerX;
      const maxScreenCenterX = this.frontFacingScreenRight - DETECTOR_DX / 2;
      const maxCenterDistanceX = maxScreenCenterX - slitCenterX;
      const pixelsPerMeter = maxCenterDistanceX / range.max;
      const screenCenterX = slitCenterX + distance * pixelsPerMeter;
      this.currentScreenCenterX = screenCenterX;

      this.parallelogramNode.shape = createParallelogramShape(
        visibleDx,
        visibleDy,
        DETECTOR_LEFT_HEIGHT
      );
      this.overheadPatternNode.setGeometry( visibleDx, visibleDy, DETECTOR_LEFT_HEIGHT );
      this.parallelogramNode.centerX = screenCenterX;
      this.parallelogramNode.centerY = this.doubleSlitParallelogramNode.centerY;

      detectorScreenLabel.centerX = this.parallelogramNode.centerX;
      detectorScreenLabel.top = LABEL_Y;

      // Keep the slit-to-screen distance annotation at the lowest vertical position it reaches when the overhead
      // detector is fully expanded, so zooming the front-facing detector screen does not shift the annotation.
      const spanY = Math.max( this.doubleSlitParallelogramNode.bottom, this.getFullParallelogramBottom() ) + 12;
      const leftX = this.doubleSlitParallelogramNode.centerX;
      const rightX = this.parallelogramNode.centerX;

      distanceSpanArrow.setTailAndTip( leftX, spanY, rightX, spanY );
      distanceSpanLeftTick.x = leftX;
      distanceSpanLeftTick.centerY = spanY;
      distanceSpanRightTick.x = rightX;
      distanceSpanRightTick.centerY = spanY;

      distanceText.string = StringUtils.fillIn( QuantumWaveInterferenceFluent.valueMetersPatternStringProperty.value, {
        value: toFixed( distance, 2 )
      } );
      distanceText.centerX = ( leftX + rightX ) / 2;
      distanceText.bottom = spanY - SPAN_TICK_LENGTH / 2;
    };

    detectorScreenLabel.localBoundsProperty.link( () => this.updateDetectorScreenPosition() );

    sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.screenDistanceProperty.unlink( this.updateDetectorScreenPosition );
        oldScene.detectorScreenScaleIndexProperty.unlink( this.updateDetectorScreenPosition );
      }
      newScene.screenDistanceProperty.link( this.updateDetectorScreenPosition );
      newScene.detectorScreenScaleIndexProperty.link( this.updateDetectorScreenPosition );
    } );
  }

  public getVisibleDetectorWidthFraction(): number {
    const fullScreenHalfWidth = SceneModel.getScreenHalfWidthForScaleIndex( 0 );
    return this.sceneProperty.value.screenHalfWidth / fullScreenHalfWidth;
  }

  public getFullParallelogramHeight(): number {
    return DETECTOR_LEFT_HEIGHT + DETECTOR_DY;
  }

  public getFullParallelogramTop(): number {
    return this.parallelogramNode.centerY - this.getFullParallelogramHeight() / 2;
  }

  public getFullParallelogramBottom(): number {
    return this.parallelogramNode.centerY + this.getFullParallelogramHeight() / 2;
  }

  public getFullParallelogramTopLeft(): { x: number; y: number } {
    return {
      x: this.currentScreenCenterX - DETECTOR_DX / 2,
      y: this.getFullParallelogramTop()
    };
  }

  public getFullParallelogramBottomRight(): { x: number; y: number } {
    return {
      x: this.currentScreenCenterX + DETECTOR_DX / 2,
      y: this.getFullParallelogramBottom()
    };
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
   * Returns the detector screen parallelogram left x-position corresponding to the maximum screen distance for the
   * active scene. Used for keeping the overhead fan-beam graphic static in width while the detector screen itself
   * moves.
   */
  public getMaxDistanceParallelogramLeft(): number {
    if ( this.frontFacingScreenRight <= this.frontFacingScreenLeft ) {
      return this.currentScreenCenterX - DETECTOR_DX / 2;
    }
    const maxScreenCenterX = this.frontFacingScreenRight - DETECTOR_DX / 2;
    return maxScreenCenterX - DETECTOR_DX / 2;
  }

  /**
   * Returns the detector screen parallelogram right x-position corresponding to the maximum screen distance for the
   * active scene. Used for keeping the overhead fan-beam graphic static in width while the detector screen itself
   * moves.
   */
  public getMaxDistanceParallelogramRight(): number {
    return this.getMaxDistanceParallelogramLeft() + DETECTOR_DX;
  }

  /**
   * Recomputes the detector screen position using the current slit position and active scene distance.
   */
  public updatePosition(): void {
    this.updateDetectorScreenPosition();
  }
}
