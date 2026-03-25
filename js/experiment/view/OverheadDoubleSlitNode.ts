// Copyright 2026, University of Colorado Boulder

/**
 * OverheadDoubleSlitNode displays the double slit in overhead perspective, including the label,
 * parallelogram, slit lines, cover overlays, and detector overlays. Updates dynamically based
 * on the active scene's slit separation and slit setting.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
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

export default class OverheadDoubleSlitNode extends Node {

  public readonly parallelogramNode: Path;
  private readonly reducedBackgroundNode: Path;

  // Skew parameters for the overhead parallelogram, exposed so sibling nodes can match the perspective.
  public readonly skewDx = 51 * OVERHEAD_SCALE;
  public readonly skewDy = 21 * OVERHEAD_SCALE * OVERHEAD_SKEW_SCALE;

  public constructor( model: ExperimentModel ) {
    super();

    // Double slit label
    const doubleSlitLabel = new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
      font: LABEL_FONT,
      maxWidth: 120
    } );
    this.addChild( doubleSlitLabel );

    // Double slit parallelogram container (overhead perspective view). The container keeps the
    // original bounds for layout/beam geometry, while the visible background is a smaller child.
    this.parallelogramNode = createParallelogramNode( this.skewDx, this.skewDy, PARALLELOGRAM_LEFT_HEIGHT, 'rgba(0,0,0,0)' );
    this.parallelogramNode.x = BASE_PARALLELOGRAM_CENTER_X - this.skewDx / 2;
    this.parallelogramNode.y = 45;
    this.addChild( this.parallelogramNode );

    // Reduce the visible rounded-rectangle/parallelogram background by 25% in both width and height
    // while preserving the existing slit-line coordinates and overall node positioning.
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
    doubleSlitLabel.centerX = this.parallelogramNode.centerX;
    doubleSlitLabel.top = LABEL_Y;

    // Slit lines on the parallelogram
    const slitLineLength = 18.75 * OVERHEAD_SCALE;
    const slitXFraction = 0.5;
    // Keep slit lines vertically centered in the slit element.
    const slitYCenter = PARALLELOGRAM_LEFT_HEIGHT / 2;
    const slitBaseX = slitXFraction * this.skewDx;
    const slitBaseY = slitYCenter + slitXFraction * this.skewDy;

    const MIN_VISUAL_SLIT_SPACING = 1 * OVERHEAD_SCALE;
    const MAX_VISUAL_SLIT_SPACING = 4 * OVERHEAD_SCALE;

    const leftSlitLine = new Path( null, { stroke: 'white', lineWidth: 1 } );
    const rightSlitLine = new Path( null, { stroke: 'white', lineWidth: 1 } );
    this.parallelogramNode.addChild( leftSlitLine );
    this.parallelogramNode.addChild( rightSlitLine );

    // Cover/detector overlays
    const slitOverlayHeight = slitLineLength + 4 * OVERHEAD_SCALE;
    const slitOverlayWidth = 5 * OVERHEAD_SCALE;

    const leftSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty, visible: false
    } );
    this.parallelogramNode.addChild( leftSlitCover );

    const rightSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty, visible: false
    } );
    this.parallelogramNode.addChild( rightSlitCover );

    const leftSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( 0.8 ), visible: false
    } );
    this.parallelogramNode.addChild( leftSlitDetectorOverlay );

    const rightSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( 0.8 ), visible: false
    } );
    this.parallelogramNode.addChild( rightSlitDetectorOverlay );

    // Updates slit line positions, covers, and detector overlays
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

      leftSlitLine.shape = Shape.lineSegment( leftX, leftY - slitLineLength / 2,
        leftX, leftY + slitLineLength / 2 );
      rightSlitLine.shape = Shape.lineSegment( rightX, rightY - slitLineLength / 2,
        rightX, rightY + slitLineLength / 2 );

      leftSlitCover.x = leftX - slitOverlayWidth / 2;
      leftSlitCover.y = leftY - slitOverlayHeight / 2;
      rightSlitCover.x = rightX - slitOverlayWidth / 2;
      rightSlitCover.y = rightY - slitOverlayHeight / 2;

      leftSlitDetectorOverlay.x = leftX - slitOverlayWidth / 2;
      leftSlitDetectorOverlay.y = leftY - slitOverlayHeight / 2;
      rightSlitDetectorOverlay.x = rightX - slitOverlayWidth / 2;
      rightSlitDetectorOverlay.y = rightY - slitOverlayHeight / 2;

      const slitSetting = scene.slitSettingProperty.value;
      leftSlitCover.visible = ( slitSetting === 'leftCovered' );
      rightSlitCover.visible = ( slitSetting === 'rightCovered' );
      leftSlitDetectorOverlay.visible = ( slitSetting === 'leftDetector' );
      rightSlitDetectorOverlay.visible = ( slitSetting === 'rightDetector' );
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
   * Returns the x-position (in parent coordinates) of the right edge of the visible
   * rounded-rectangle/parallelogram graphic.
   */
  public getVisibleBackgroundRightX(): number {
    return this.parallelogramNode.x + this.reducedBackgroundNode.right;
  }
}
