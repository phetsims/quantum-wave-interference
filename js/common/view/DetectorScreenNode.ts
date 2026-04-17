// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenNode is the skewed parallelogram-shaped detector screen shared by the High Intensity and
 * Single Particles screens. It renders hit dots or intensity bands via DetectorScreenTextureRenderer,
 * drawn onto a CanvasNode clipped to the parallelogram shape.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type DetectorScreenSceneLike } from './DetectorScreenTextureRenderer.js';
import DetectorScreenTextureRenderer from './DetectorScreenTextureRenderer.js';

type SelfOptions = EmptySelfOptions;

export type DetectorScreenNodeOptions = SelfOptions & NodeOptions;

const SCREEN_WIDTH = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const SKEW = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW;
const SNAPSHOT_FLASH_INITIAL_OPACITY = 0.8;
const SNAPSHOT_FLASH_DURATION = 0.6;

export default class DetectorScreenNode extends Node {

  private readonly canvasNode: CanvasNode;
  private readonly snapshotFlashRect: Rectangle;
  private snapshotFlashAnimation: Animation | null = null;

  public constructor( sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>, providedOptions?: DetectorScreenNodeOptions ) {

    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    const textureRenderer = new DetectorScreenTextureRenderer( SCREEN_WIDTH + SKEW, SCREEN_HEIGHT, SKEW );

    const shape = new Shape()
      .moveTo( SKEW, 0 )
      .lineTo( SKEW + SCREEN_WIDTH, 0 )
      .lineTo( SCREEN_WIDTH, SCREEN_HEIGHT )
      .lineTo( 0, SCREEN_HEIGHT )
      .close();

    this.addChild( new Path( shape, {
      fill: 'black',
      stroke: '#333',
      lineWidth: 1
    } ) );

    this.canvasNode = new DetectorScreenCanvasNode( sceneProperty, textureRenderer, SCREEN_WIDTH + SKEW, SCREEN_HEIGHT );
    this.canvasNode.clipArea = shape;
    this.addChild( this.canvasNode );

    this.snapshotFlashRect = new Rectangle( 0, 0, SCREEN_WIDTH + SKEW, SCREEN_HEIGHT, {
      fill: 'white',
      opacity: 0,
      visible: false,
      pickable: false
    } );
    this.snapshotFlashRect.clipArea = shape;
    this.addChild( this.snapshotFlashRect );
  }

  public startSnapshotFlash(): void {
    this.clearFlash();
    this.snapshotFlashRect.opacity = SNAPSHOT_FLASH_INITIAL_OPACITY;
    this.snapshotFlashRect.visible = true;

    const flashAnimation = new Animation( {
      object: this.snapshotFlashRect,
      attribute: 'opacity',
      from: SNAPSHOT_FLASH_INITIAL_OPACITY,
      to: 0,
      duration: SNAPSHOT_FLASH_DURATION,
      easing: Easing.LINEAR
    } );

    this.snapshotFlashAnimation = flashAnimation;

    flashAnimation.endedEmitter.addListener( () => {
      if ( this.snapshotFlashAnimation === flashAnimation ) {
        this.snapshotFlashAnimation = null;
      }
      this.snapshotFlashRect.visible = false;
      flashAnimation.dispose();
    } );

    flashAnimation.start();
  }

  public clearFlash(): void {
    if ( this.snapshotFlashAnimation ) {
      this.snapshotFlashAnimation.stop();
    }
    this.snapshotFlashRect.opacity = 0;
    this.snapshotFlashRect.visible = false;
  }

  public step(): void {
    this.canvasNode.invalidatePaint();
  }
}

class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>;
  private readonly textureRenderer: DetectorScreenTextureRenderer;
  private readonly displayWidth: number;
  private readonly displayHeight: number;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>,
    textureRenderer: DetectorScreenTextureRenderer,
    width: number,
    height: number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneProperty = sceneProperty;
    this.textureRenderer = textureRenderer;
    this.displayWidth = width;
    this.displayHeight = height;
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const texture = this.textureRenderer.getTexture( this.sceneProperty.value );
    context.drawImage( texture, 0, 0, this.displayWidth, this.displayHeight );
  }
}
