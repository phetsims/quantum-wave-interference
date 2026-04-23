// Copyright 2026, University of Colorado Boulder

/**
 * CanvasNode that renders the interference pattern on the overhead detector screen parallelogram.
 * Draws the same shared detector-screen texture used by the front-facing detector view,
 * with an affine transform that skews it into the overhead parallelogram.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import SceneModel from '../model/SceneModel.js';
import { createParallelogramShape } from './createParallelogramNode.js';
import getDetectorScreenTexture from './getDetectorScreenTexture.js';

const FULL_SCALE_INDEX = 0;

export default class OverheadDetectorPatternNode extends CanvasNode {

  private dx: number;
  private dy: number;
  private leftHeight: number;

  private sceneModel: SceneModel | null = null;

  public constructor( dx: number, dy: number, leftHeight: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, dx, leftHeight + dy )
    } );

    this.dx = dx;
    this.dy = dy;
    this.leftHeight = leftHeight;

    this.updateClipAndBounds();
  }

  private updateClipAndBounds(): void {
    this.canvasBounds = new Bounds2( 0, 0, this.dx, this.leftHeight + this.dy );
    this.clipArea = createParallelogramShape( this.dx, this.dy, this.leftHeight );
  }

  public setGeometry( dx: number, dy: number, leftHeight: number ): void {
    this.dx = dx;
    this.dy = dy;
    this.leftHeight = leftHeight;
    this.updateClipAndBounds();
    this.invalidatePaint();
  }

  /**
   * Updates the active scene model, then repaints.
   */
  public updatePattern( sceneModel: SceneModel ): void {
    this.sceneModel = sceneModel;
    this.invalidatePaint();
  }

  /**
   * Renders the shared detector-screen texture with a skew transform so it matches the overhead detector parallelogram
   * perspective.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    if ( !this.sceneModel ) {
      return;
    }

    const texture = getDetectorScreenTexture( this.sceneModel, FULL_SCALE_INDEX );
    const sourceWidth = texture.width;
    const sourceHeight = texture.height;
    const fullScreenHalfWidth = SceneModel.getScreenHalfWidthForScaleIndex( FULL_SCALE_INDEX );
    const visibleFraction = this.sceneModel.screenHalfWidth / fullScreenHalfWidth;
    const sourceCropWidth = sourceWidth * visibleFraction;
    const sourceCropX = ( sourceWidth - sourceCropWidth ) / 2;

    // Transform source rect -> overhead parallelogram:
    // x' = (dx / sourceWidth) * x
    // y' = (dy / sourceWidth) * x + (leftHeight / sourceHeight) * y
    context.save();
    context.transform(
      this.dx / sourceCropWidth, this.dy / sourceCropWidth, 0,
      this.leftHeight / sourceHeight, 0, 0
    );
    context.drawImage( texture, sourceCropX, 0, sourceCropWidth, sourceHeight, 0, 0, sourceCropWidth, sourceHeight );
    context.restore();
  }
}
