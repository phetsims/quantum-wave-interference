// Copyright 2026, University of Colorado Boulder

/**
 * OverheadDoubleSlitNode displays the double slit in overhead perspective, including the label, parallelogram, slit
 * lines, cover overlays, and detector overlays. Updates dynamically based on the active scene's slit separation and
 * slit setting.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import { hasDetectorOnSide } from '../model/SlitConfiguration.js';
import createParallelogramNode from './createParallelogramNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const OVERHEAD_SKEW_SCALE = ExperimentConstants.OVERHEAD_SKEW_SCALE;
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 24;
const BASE_PARALLELOGRAM_X = 365;
const BASE_PARALLELOGRAM_DX = 51;
const BASE_PARALLELOGRAM_CENTER_X = BASE_PARALLELOGRAM_X + BASE_PARALLELOGRAM_DX / 2;
const PARALLELOGRAM_LEFT_HEIGHT = 50 * OVERHEAD_SCALE;
const SLIT_BACKGROUND_SCALE = 0.75;
const DETECTOR_OVERLAY_FILL_ALPHA = 0.4;
const DETECTOR_OVERLAY_STROKE_WIDTH = 0.25;
const DETECTOR_OVERLAY_WIDTH_SCALE = 0.78;
const DETECTOR_OVERLAY_HEIGHT_SCALE = 0.97;
const SLIT_MARKER_WIDTH = 0.75 * OVERHEAD_SCALE;

export default class OverheadDoubleSlitNode extends Node {

  public readonly parallelogramNode: Path;
  private readonly reducedBackgroundNode: Path;
  private readonly doubleSlitLabel: Text;
  private leftDetectorAnchorPoint = new Vector2( 0, 0 );
  private rightDetectorAnchorPoint = new Vector2( 0, 0 );

  // Skew parameters for the overhead parallelogram, exposed so sibling nodes can match the perspective.
  public readonly skewDx = 51 * OVERHEAD_SCALE;
  public readonly skewDy = 21 * OVERHEAD_SCALE * OVERHEAD_SKEW_SCALE;

  public constructor( model: ExperimentModel ) {
    super( { isDisposable: false } );

    // Double slit label
    this.doubleSlitLabel = new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
      font: LABEL_FONT,
      maxWidth: 120
    } );
    this.addChild( this.doubleSlitLabel );

    // Double slit parallelogram container (overhead perspective view).
    // The container keeps the original bounds for layout/beam geometry, while the visible background is a smaller
    // child.
    this.parallelogramNode = createParallelogramNode( this.skewDx, this.skewDy, PARALLELOGRAM_LEFT_HEIGHT, 'rgba(0,0,0,0)' );
    this.parallelogramNode.x = BASE_PARALLELOGRAM_CENTER_X - this.skewDx / 2;
    this.parallelogramNode.y = 45;
    this.addChild( this.parallelogramNode );

    // Reduce the visible rounded-rectangle/parallelogram background by 25% in both width and height while preserving
    // the existing slit-line coordinates and overall node positioning.
    this.reducedBackgroundNode = createParallelogramNode(
      this.skewDx * SLIT_BACKGROUND_SCALE,
      this.skewDy * SLIT_BACKGROUND_SCALE,
      PARALLELOGRAM_LEFT_HEIGHT * SLIT_BACKGROUND_SCALE,
      'black'
    );
    this.reducedBackgroundNode.x = this.skewDx * ( 1 - SLIT_BACKGROUND_SCALE ) / 2;
    this.reducedBackgroundNode.y = ( PARALLELOGRAM_LEFT_HEIGHT + this.skewDy ) * ( 1 - SLIT_BACKGROUND_SCALE ) / 2;
    this.parallelogramNode.addChild( this.reducedBackgroundNode );

    // Position label centered above the parallelogram
    this.layoutLabel();
    this.doubleSlitLabel.localBoundsProperty.link( () => this.layoutLabel() );

    // Slit lines on the parallelogram
    const slitLineLength = 18.75 * OVERHEAD_SCALE;
    const slitXFraction = 0.5;

    // Keep slit lines vertically centered in the slit element.
    const slitYCenter = PARALLELOGRAM_LEFT_HEIGHT / 2;
    const slitBaseX = slitXFraction * this.skewDx;
    const slitBaseY = slitYCenter + slitXFraction * this.skewDy;

    const MIN_VISUAL_SLIT_SPACING = OVERHEAD_SCALE;
    const MAX_VISUAL_SLIT_SPACING = 4 * OVERHEAD_SCALE;

    const slitMarkerDy = SLIT_MARKER_WIDTH * ( this.skewDy / this.skewDx );
    const leftSlitMarker = createParallelogramNode( SLIT_MARKER_WIDTH, slitMarkerDy, slitLineLength, 'white', 0 );
    const rightSlitMarker = createParallelogramNode( SLIT_MARKER_WIDTH, slitMarkerDy, slitLineLength, 'white', 0 );
    this.parallelogramNode.addChild( leftSlitMarker );
    this.parallelogramNode.addChild( rightSlitMarker );

    // Detector overlays
    const slitOverlayHeight = ( slitLineLength + 1.5 * OVERHEAD_SCALE ) * DETECTOR_OVERLAY_HEIGHT_SCALE;
    const slitOverlayDx = 4 * OVERHEAD_SCALE * 0.6 * 0.85 * DETECTOR_OVERLAY_WIDTH_SCALE;
    const slitOverlayDy = slitOverlayDx * ( this.skewDy / this.skewDx );

    const leftSlitDetectorOverlay = createParallelogramNode( slitOverlayDx, slitOverlayDy, slitOverlayHeight,
      QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( DETECTOR_OVERLAY_FILL_ALPHA ).toCSS(),
      0
    );
    leftSlitDetectorOverlay.stroke = QuantumWaveInterferenceColors.detectorOverlayStrokeProperty;
    leftSlitDetectorOverlay.lineWidth = DETECTOR_OVERLAY_STROKE_WIDTH;
    leftSlitDetectorOverlay.visible = false;
    this.parallelogramNode.addChild( leftSlitDetectorOverlay );

    const rightSlitDetectorOverlay = createParallelogramNode(
      slitOverlayDx,
      slitOverlayDy,
      slitOverlayHeight,
      QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( DETECTOR_OVERLAY_FILL_ALPHA ).toCSS(),
      0
    );
    rightSlitDetectorOverlay.stroke = QuantumWaveInterferenceColors.detectorOverlayStrokeProperty;
    rightSlitDetectorOverlay.lineWidth = DETECTOR_OVERLAY_STROKE_WIDTH;
    rightSlitDetectorOverlay.visible = false;
    this.parallelogramNode.addChild( rightSlitDetectorOverlay );

    // Updates slit line positions and detector overlays
    const updateOverheadSlits = () => {
      const scene = model.sceneProperty.value;
      const separation = scene.slitSeparationProperty.value;
      const range = scene.slitSeparationRange;
      const fraction = ( separation - range.min ) / ( range.max - range.min );
      const visualSpacing = MIN_VISUAL_SLIT_SPACING + fraction * ( MAX_VISUAL_SLIT_SPACING - MIN_VISUAL_SLIT_SPACING );

      const leftX = slitBaseX - visualSpacing / 2;
      const rightX = slitBaseX + visualSpacing / 2;

      const slopeRatio = this.skewDy / this.skewDx;
      const leftY = slitBaseY - ( visualSpacing / 2 ) * slopeRatio;
      const rightY = slitBaseY + ( visualSpacing / 2 ) * slopeRatio;

      leftSlitMarker.x = leftX - SLIT_MARKER_WIDTH / 2;
      leftSlitMarker.y = leftY - slitLineLength / 2;
      rightSlitMarker.x = rightX - SLIT_MARKER_WIDTH / 2;
      rightSlitMarker.y = rightY - slitLineLength / 2;

      leftSlitDetectorOverlay.x = leftX - slitOverlayDx / 2;
      leftSlitDetectorOverlay.y = leftY - slitOverlayHeight / 2;
      rightSlitDetectorOverlay.x = rightX - slitOverlayDx / 2;
      rightSlitDetectorOverlay.y = rightY - slitOverlayHeight / 2;

      this.leftDetectorAnchorPoint = new Vector2(
        this.parallelogramNode.x + leftSlitDetectorOverlay.x - DETECTOR_OVERLAY_STROKE_WIDTH / 2,
        this.parallelogramNode.y + leftY
      );
      this.rightDetectorAnchorPoint = new Vector2(
        this.parallelogramNode.x + rightSlitDetectorOverlay.x + slitOverlayDx + DETECTOR_OVERLAY_STROKE_WIDTH / 2,
        this.parallelogramNode.y + rightY + slitOverlayDy
      );

      const slitSetting = scene.slitSettingProperty.value;
      leftSlitMarker.visible = true;
      rightSlitMarker.visible = true;
      leftSlitMarker.fill = slitSetting === 'leftCovered' ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';
      rightSlitMarker.fill = slitSetting === 'rightCovered' ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';
      leftSlitDetectorOverlay.visible = hasDetectorOnSide( slitSetting, 'left' );
      rightSlitDetectorOverlay.visible = hasDetectorOnSide( slitSetting, 'right' );
    };

    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.slitSeparationProperty.unlink( updateOverheadSlits );
        oldScene.slitSettingProperty.unlink( updateOverheadSlits );
      }
      newScene.slitSeparationProperty.link( updateOverheadSlits );
      newScene.slitSettingProperty.link( updateOverheadSlits );
    } );
  }

  /**
   * Returns the x-position (in parent coordinates) of the left edge of the visible rounded-rectangle/parallelogram
   * graphic.
   */
  public getVisibleBackgroundLeftX(): number {
    return this.parallelogramNode.x + this.reducedBackgroundNode.left;
  }

  /**
   * Returns the x-position (in parent coordinates) of the right edge of the visible rounded-rectangle/parallelogram
   * graphic.
   */
  public getVisibleBackgroundRightX(): number {
    return this.parallelogramNode.x + this.reducedBackgroundNode.right;
  }

  /**
   * Sets the horizontal center position of the overhead slit parallelogram and keeps its label aligned.
   */
  public setParallelogramCenterX( centerX: number ): void {
    this.parallelogramNode.centerX = centerX;
    this.layoutLabel();
  }

  public getDetectorAnchorPoint( isLeftDetector: boolean ): Vector2 {
    return isLeftDetector ? this.leftDetectorAnchorPoint : this.rightDetectorAnchorPoint;
  }

  private layoutLabel(): void {
    this.doubleSlitLabel.centerX = this.parallelogramNode.centerX;
    this.doubleSlitLabel.top = LABEL_Y;
  }
}
