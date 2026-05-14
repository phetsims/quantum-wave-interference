// Copyright 2026, University of Colorado Boulder

/**
 * CanvasNode that renders the interference pattern on the overhead detector screen parallelogram.
 * Draws the same shared detector-screen texture used by the front-facing detector view,
 * with an affine transform that skews it into the overhead parallelogram.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import SceneModel from '../model/SceneModel.js';
import getDetectorScreenTexture from './getDetectorScreenTexture.js';
import { ParallelogramShape } from './ParallelogramNode.js';

export default class OverheadDetectorPatternNode extends CanvasNode {

  private readonly dx: number;
  private readonly dy: number;
  private readonly leftHeight: number;
  private readonly detectorScreenScaleIndexProperty: TReadOnlyProperty<number>;

  private sceneModel: SceneModel | null = null;

  public constructor(
    dx: number,
    dy: number,
    leftHeight: number,
    detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, dx, leftHeight + dy )
    } );

    this.dx = dx;
    this.dy = dy;
    this.leftHeight = leftHeight;
    this.detectorScreenScaleIndexProperty = detectorScreenScaleIndexProperty;

    this.updateClipAndBounds();
    detectorScreenScaleIndexProperty.link( () => this.invalidatePaint() );
  }

  private updateClipAndBounds(): void {
    this.canvasBounds = new Bounds2( 0, 0, this.dx, this.leftHeight + this.dy );
    this.clipArea = new ParallelogramShape( this.dx, this.dy, this.leftHeight );
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

    const texture = getDetectorScreenTexture( this.sceneModel, this.detectorScreenScaleIndexProperty );
    const sourceWidth = texture.width;
    const sourceHeight = texture.height;

    // Transform source rect -> overhead parallelogram:
    // x' = (dx / sourceWidth) * x
    // y' = (dy / sourceWidth) * x + (leftHeight / sourceHeight) * y
    context.save();
    context.transform(
      this.dx / sourceWidth, this.dy / sourceWidth, 0,
      this.leftHeight / sourceHeight, 0, 0
    );
    context.drawImage( texture, 0, 0, sourceWidth, sourceHeight );
    context.restore();
  }
}
