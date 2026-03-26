// Copyright 2026, University of Colorado Boulder

/**
 * CanvasNode that renders hit dots or intensity bands on the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import SceneModel from '../model/SceneModel.js';
import getDetectorScreenTexture from './getDetectorScreenTexture.js';

export default class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneModel: SceneModel;
  private readonly textureWidth: number;
  private readonly textureHeight: number;

  public constructor( sceneModel: SceneModel, width: number, height: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneModel = sceneModel;
    this.textureWidth = width;
    this.textureHeight = height;
  }

  /**
   * Renders the shared detector-screen texture.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const texture = getDetectorScreenTexture( this.sceneModel );
    context.drawImage( texture, 0, 0, this.textureWidth, this.textureHeight );
  }
}
