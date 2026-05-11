// Copyright 2026, University of Colorado Boulder

/**
 * CanvasNode that renders hit dots or intensity bands on the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../model/DetectorScreenScale.js';
import SceneModel from '../model/SceneModel.js';
import getDetectorScreenTexture from './getDetectorScreenTexture.js';

export default class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneModel: SceneModel;
  private readonly detectorScreenScaleIndexProperty: TReadOnlyProperty<number>;
  private readonly textureWidth: number;
  private readonly textureHeight: number;

  public constructor(
    sceneModel: SceneModel,
    detectorScreenScaleIndexProperty: TReadOnlyProperty<number>,
    width: number,
    height: number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneModel = sceneModel;
    this.detectorScreenScaleIndexProperty = detectorScreenScaleIndexProperty;
    this.textureWidth = width;
    this.textureHeight = height;
  }

  /**
   * Renders the visible zoomed portion of the shared full detector-screen texture.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const texture = getDetectorScreenTexture( this.sceneModel, this.detectorScreenScaleIndexProperty );
    const visibleFraction = getDetectorScreenHalfWidthForScaleIndex( this.detectorScreenScaleIndexProperty.value ) /
                            this.sceneModel.fullScreenHalfWidth;
    const sourceCropWidth = texture.width * visibleFraction;
    const sourceCropHeight = texture.height * visibleFraction;
    const sourceCropX = ( texture.width - sourceCropWidth ) / 2;
    const sourceCropY = ( texture.height - sourceCropHeight ) / 2;

    context.drawImage(
      texture,
      sourceCropX,
      sourceCropY,
      sourceCropWidth,
      sourceCropHeight,
      0,
      0,
      this.textureWidth,
      this.textureHeight
    );
  }
}
