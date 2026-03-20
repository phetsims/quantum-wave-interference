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
import Color from '../../../../scenery/js/util/Color.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import createParallelogramNode from './createParallelogramNode.js';

const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 18;

export default class OverheadDoubleSlitNode extends Node {

  public readonly parallelogramNode: Path;

  // Skew parameters for the overhead parallelogram, exposed so sibling nodes can match the perspective.
  public readonly skewDx = 51;
  public readonly skewDy = 21;

  public constructor( model: ExperimentModel ) {
    super();

    // Double slit label
    const doubleSlitLabel = new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
      font: LABEL_FONT,
      maxWidth: 120
    } );
    this.addChild( doubleSlitLabel );

    // Double slit parallelogram (overhead perspective view)
    this.parallelogramNode = createParallelogramNode( this.skewDx, this.skewDy, 50, 'black' );
    this.parallelogramNode.x = 365;
    this.parallelogramNode.y = 45;
    this.addChild( this.parallelogramNode );

    // Position label centered above the parallelogram
    doubleSlitLabel.centerX = this.parallelogramNode.centerX;
    doubleSlitLabel.top = LABEL_Y;

    // Slit lines on the parallelogram
    const slitLineLength = 25;
    const slitXFraction = 0.5;
    const slitYCenter = 25;
    const slitBaseX = slitXFraction * this.skewDx;
    const slitBaseY = slitYCenter + slitXFraction * this.skewDy;

    const MIN_VISUAL_SLIT_SPACING = 1;
    const MAX_VISUAL_SLIT_SPACING = 4;

    const leftSlitLine = new Path( null, { stroke: 'white', lineWidth: 1 } );
    const rightSlitLine = new Path( null, { stroke: 'white', lineWidth: 1 } );
    this.parallelogramNode.addChild( leftSlitLine );
    this.parallelogramNode.addChild( rightSlitLine );

    // Cover/detector overlays
    const slitOverlayHeight = slitLineLength + 4;
    const slitOverlayWidth = 5;

    const leftSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: '#555', visible: false
    } );
    this.parallelogramNode.addChild( leftSlitCover );

    const rightSlitCover = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: '#555', visible: false
    } );
    this.parallelogramNode.addChild( rightSlitCover );

    const leftSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: new Color( 255, 200, 50, 0.8 ), visible: false
    } );
    this.parallelogramNode.addChild( leftSlitDetectorOverlay );

    const rightSlitDetectorOverlay = new Rectangle( 0, 0, slitOverlayWidth, slitOverlayHeight, {
      fill: new Color( 255, 200, 50, 0.8 ), visible: false
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
}
