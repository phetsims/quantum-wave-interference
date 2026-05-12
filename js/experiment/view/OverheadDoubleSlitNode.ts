// Copyright 2026, University of Colorado Boulder

/**
 * OverheadDoubleSlitNode displays the double slit in overhead perspective, including the label, parallelogram, slit
 * lines, cover overlays, and detector overlays. Updates dynamically based on the active scene's slit separation and
 * slit setting.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import createParallelogramNode, { createParallelogramShape } from './createParallelogramNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const OVERHEAD_SKEW_SCALE = ExperimentConstants.OVERHEAD_SKEW_SCALE;
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 24;
const BASE_PARALLELOGRAM_X = 365;
const BASE_PARALLELOGRAM_DX = 51;
const BASE_PARALLELOGRAM_CENTER_X = BASE_PARALLELOGRAM_X + BASE_PARALLELOGRAM_DX / 2;
const PARALLELOGRAM_LEFT_HEIGHT = 50 * OVERHEAD_SCALE;
const BASE_SLIT_BACKGROUND_SCALE = 0.75;
const SLIT_BACKGROUND_SCALE = BASE_SLIT_BACKGROUND_SCALE * 1.15;
const DETECTOR_OVERLAY_FILL_ALPHA = 0.4;
const DETECTOR_OVERLAY_STROKE_WIDTH = 0.25;
const DETECTOR_OVERLAY_WIDTH_SCALE = 0.78;
const DETECTOR_OVERLAY_HEIGHT_SCALE = 0.97;
const SLIT_MARKER_WIDTH = 0.75 * OVERHEAD_SCALE;
const PARTICLE_SLIT_VISUAL_SCALE = 0.4;

export default class OverheadDoubleSlitNode extends Node {

  public readonly parallelogramNode: Path;
  private readonly reducedBackgroundNode: Path;
  private readonly doubleSlitLabel: Text;
  private readonly leftSlitDetectorOverlay: Path;
  private readonly rightSlitDetectorOverlay: Path;
  private readonly slitOverlayDx: number;
  private readonly slitOverlayDy: number;
  private readonly slitOverlayHeight: number;

  // Skew parameters for the overhead parallelogram, exposed so sibling nodes can match the perspective.
  public readonly skewDx = 51 * OVERHEAD_SCALE;
  public readonly skewDy = 21 * OVERHEAD_SCALE * OVERHEAD_SKEW_SCALE;

  public constructor( sceneProperty: TReadOnlyProperty<SceneModel> ) {
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

    // Reduce the visible rounded-rectangle/parallelogram background from the alignment bounds while preserving
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
    const slitLineLength = 18.75 * OVERHEAD_SCALE * 1.15;
    const slitXFraction = 0.5;

    // Keep slit lines vertically centered in the slit element.
    const slitYCenter = PARALLELOGRAM_LEFT_HEIGHT / 2;
    const slitBaseX = slitXFraction * this.skewDx;
    const slitBaseY = slitYCenter + slitXFraction * this.skewDy;

    const MIN_VISUAL_SLIT_SPACING = OVERHEAD_SCALE;
    const MAX_VISUAL_SLIT_SPACING = 8 * OVERHEAD_SCALE;

    const slitMarkerDy = SLIT_MARKER_WIDTH * ( this.skewDy / this.skewDx );
    const leftSlitMarker = createParallelogramNode( SLIT_MARKER_WIDTH, slitMarkerDy, slitLineLength, 'white', 0 );
    const rightSlitMarker = createParallelogramNode( SLIT_MARKER_WIDTH, slitMarkerDy, slitLineLength, 'white', 0 );
    this.parallelogramNode.addChild( leftSlitMarker );
    this.parallelogramNode.addChild( rightSlitMarker );

    // Detector overlays
    this.slitOverlayHeight = ( slitLineLength + 1.5 * OVERHEAD_SCALE ) * DETECTOR_OVERLAY_HEIGHT_SCALE;
    this.slitOverlayDx = 4 * OVERHEAD_SCALE * 0.6 * 0.85 * DETECTOR_OVERLAY_WIDTH_SCALE;
    this.slitOverlayDy = this.slitOverlayDx * ( this.skewDy / this.skewDx );

    this.leftSlitDetectorOverlay = createParallelogramNode( this.slitOverlayDx, this.slitOverlayDy, this.slitOverlayHeight,
      QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( DETECTOR_OVERLAY_FILL_ALPHA ).toCSS(),
      0
    );
    this.leftSlitDetectorOverlay.stroke = QuantumWaveInterferenceColors.detectorOverlayStrokeProperty;
    this.leftSlitDetectorOverlay.lineWidth = DETECTOR_OVERLAY_STROKE_WIDTH;
    this.leftSlitDetectorOverlay.visible = false;
    this.parallelogramNode.addChild( this.leftSlitDetectorOverlay );

    this.rightSlitDetectorOverlay = createParallelogramNode(
      this.slitOverlayDx,
      this.slitOverlayDy,
      this.slitOverlayHeight,
      QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( DETECTOR_OVERLAY_FILL_ALPHA ).toCSS(),
      0
    );
    this.rightSlitDetectorOverlay.stroke = QuantumWaveInterferenceColors.detectorOverlayStrokeProperty;
    this.rightSlitDetectorOverlay.lineWidth = DETECTOR_OVERLAY_STROKE_WIDTH;
    this.rightSlitDetectorOverlay.visible = false;
    this.parallelogramNode.addChild( this.rightSlitDetectorOverlay );

    // Updates slit line positions and detector overlays
    const updateOverheadSlits = () => {
      const scene = sceneProperty.value;
      const separation = scene.slitSeparationProperty.value;
      const range = scene.slitSeparationRange;
      const fraction = ( separation - range.min ) / ( range.max - range.min );
      const particleVisualScale = scene.sourceType === 'photons' ? 1 : PARTICLE_SLIT_VISUAL_SCALE;
      const visualSpacing = (
        MIN_VISUAL_SLIT_SPACING + fraction * ( MAX_VISUAL_SLIT_SPACING - MIN_VISUAL_SLIT_SPACING )
      ) * particleVisualScale;

      const leftX = slitBaseX - visualSpacing / 2;
      const rightX = slitBaseX + visualSpacing / 2;

      const slopeRatio = this.skewDy / this.skewDx;
      const slitMarkerWidth = SLIT_MARKER_WIDTH * particleVisualScale;
      const slitMarkerDy = slitMarkerWidth * slopeRatio;
      const leftY = slitBaseY - ( visualSpacing / 2 ) * slopeRatio;
      const rightY = slitBaseY + ( visualSpacing / 2 ) * slopeRatio;

      leftSlitMarker.shape = createParallelogramShape( slitMarkerWidth, slitMarkerDy, slitLineLength );
      rightSlitMarker.shape = createParallelogramShape( slitMarkerWidth, slitMarkerDy, slitLineLength );

      leftSlitMarker.x = leftX - slitMarkerWidth / 2;
      leftSlitMarker.y = leftY - slitLineLength / 2;
      rightSlitMarker.x = rightX - slitMarkerWidth / 2;
      rightSlitMarker.y = rightY - slitLineLength / 2;

      this.leftSlitDetectorOverlay.x = leftX - this.slitOverlayDx / 2;
      this.leftSlitDetectorOverlay.y = leftY - this.slitOverlayHeight / 2;
      this.rightSlitDetectorOverlay.x = rightX - this.slitOverlayDx / 2;
      this.rightSlitDetectorOverlay.y = rightY - this.slitOverlayHeight / 2;

      const slitSetting = scene.slitSettingProperty.value;
      leftSlitMarker.visible = true;
      rightSlitMarker.visible = true;
      leftSlitMarker.fill = slitSetting === 'leftCovered' ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';
      rightSlitMarker.fill = slitSetting === 'rightCovered' ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';
      this.leftSlitDetectorOverlay.visible = hasDetectorOnSide( slitSetting, 'left' );
      this.rightSlitDetectorOverlay.visible = hasDetectorOnSide( slitSetting, 'right' );
    };

    sceneProperty.link( ( newScene, oldScene ) => {
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
    return isLeftDetector ? new Vector2(
      this.parallelogramNode.x + this.leftSlitDetectorOverlay.x - DETECTOR_OVERLAY_STROKE_WIDTH / 2,
      this.parallelogramNode.y + this.leftSlitDetectorOverlay.y + this.slitOverlayHeight / 2
    ) : new Vector2(
      this.parallelogramNode.x + this.rightSlitDetectorOverlay.x + this.slitOverlayDx + DETECTOR_OVERLAY_STROKE_WIDTH / 2,
      this.parallelogramNode.y + this.rightSlitDetectorOverlay.y + this.slitOverlayHeight / 2 + this.slitOverlayDy
    );
  }

  private layoutLabel(): void {
    this.doubleSlitLabel.centerX = this.parallelogramNode.centerX;

    const fullBackgroundHeight = PARALLELOGRAM_LEFT_HEIGHT + this.skewDy;
    const originalBackgroundTop = this.parallelogramNode.y +
                                  fullBackgroundHeight * ( 1 - BASE_SLIT_BACKGROUND_SCALE ) / 2;
    const currentBackgroundTop = this.parallelogramNode.y + this.reducedBackgroundNode.top;
    this.doubleSlitLabel.top = LABEL_Y + currentBackgroundTop - originalBackgroundTop;
  }
}
