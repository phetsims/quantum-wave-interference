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
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import { type DetectorScreenViewState, type DetectorScreenViewStateFragment } from './description/QWIAccessibleViewState.js';
import DetectorScreenTextureRenderer, { type DetectorScreenSceneLike } from './DetectorScreenTextureRenderer.js';
import SnapshotFlashController from './SnapshotFlashController.js';
import WaveVisualizationCanvasNode from './WaveVisualizationCanvasNode.js';

type SelfOptions = EmptySelfOptions;

export type DetectorScreenNodeOptions = SelfOptions & NodeOptions;

const SCREEN_WIDTH = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const SKEW = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW;

export default class DetectorScreenNode extends Node {

  private readonly canvasNode: CanvasNode;
  private readonly sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>;
  private readonly snapshotFlashRect: Rectangle;
  private readonly snapshotFlashController: SnapshotFlashController;

  public constructor( sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>, providedOptions?: DetectorScreenNodeOptions ) {

    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    this.sceneProperty = sceneProperty;

    const textureRenderer = new DetectorScreenTextureRenderer(
      SCREEN_WIDTH,
      SCREEN_HEIGHT + SKEW,
      SKEW,
      QuantumWaveInterferenceQueryParameters.detectorScreenTextureScale
    );

    const shape = new Shape()
      .moveTo( 0, SKEW )
      .lineTo( SCREEN_WIDTH, 0 )
      .lineTo( SCREEN_WIDTH, SCREEN_HEIGHT )
      .lineTo( 0, SCREEN_HEIGHT + SKEW )
      .close();

    this.addChild( new Path( shape, {
      fill: WaveVisualizationCanvasNode.BACKGROUND_COLOR,
      stroke: '#333',
      lineWidth: 1
    } ) );

    this.canvasNode = new DetectorScreenCanvasNode( sceneProperty, textureRenderer, SCREEN_WIDTH, SCREEN_HEIGHT, SKEW );
    this.canvasNode.clipArea = shape;
    this.addChild( this.canvasNode );

    const invalidateCanvas = () => this.canvasNode.invalidatePaint();
    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( invalidateCanvas );
        previousScene.isEmittingProperty.unlink( invalidateCanvas );
      }
      scene.hitsChangedEmitter.addListener( invalidateCanvas );
      scene.isEmittingProperty.link( invalidateCanvas );
      invalidateCanvas();
    } );

    this.snapshotFlashRect = new Rectangle( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT + SKEW, {
      fill: 'white',
      opacity: 0,
      visible: false,
      pickable: false
    } );
    this.snapshotFlashRect.clipArea = shape;
    this.addChild( this.snapshotFlashRect );
    this.snapshotFlashController = new SnapshotFlashController( this.snapshotFlashRect );
  }

  public startSnapshotFlash(): void {
    this.snapshotFlashController.start();
  }

  public clearFlash(): void {
    this.snapshotFlashController.clear();
  }

  /**
   * Gets sparse detector-screen view state for agent-facing accessibility snapshots.
   *
   * @returns detector-screen view state
   */
  public getAccessibleViewState(): DetectorScreenViewStateFragment {
    if ( !this.visible ) {
      return {
        detectorScreen: {
          visible: false
        }
      };
    }

    const scene = this.sceneProperty.value;
    const sceneWithViewStateProperties = scene as DetectorScreenSceneLike & {
      numberOfSnapshotsProperty?: TReadOnlyProperty<number>;
    };

    const detectorScreen: DetectorScreenViewState = {
      visible: true,
      perspective: 'frontFacingSkewed',
      hitCount: scene.hits.length
    };

    if ( sceneWithViewStateProperties.numberOfSnapshotsProperty ) {
      detectorScreen.numberOfSnapshots = sceneWithViewStateProperties.numberOfSnapshotsProperty.value;
    }

    return {
      detectorScreen: detectorScreen
    };
  }

  public step(): void {
    this.canvasNode.invalidatePaint();
  }
}

/**
 * CanvasNode that renders the detector-screen texture for the High Intensity and Single Particles screens.
 * DetectorScreenTextureRenderer owns the offscreen, rectangular texture cache for the active scene. This node
 * draws that texture with an affine transform so the rectangular detector face appears as the skewed parallelogram
 * used in the side-view apparatus. The parent DetectorScreenNode supplies the matching clip area and invalidates this
 * node when scene hits or emission state changes.
 */
class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>;
  private readonly textureRenderer: DetectorScreenTextureRenderer;
  private readonly displayWidth: number;
  private readonly faceHeight: number;
  private readonly skew: number;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorScreenSceneLike>,
    textureRenderer: DetectorScreenTextureRenderer,
    width: number,
    faceHeight: number,
    skew: number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, faceHeight + skew )
    } );

    this.sceneProperty = sceneProperty;
    this.textureRenderer = textureRenderer;
    this.displayWidth = width;
    this.faceHeight = faceHeight;
    this.skew = skew;
  }

  /**
   * Renders the active scene texture with a skew transform so it matches the detector-screen parallelogram.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const texture = this.textureRenderer.getTexture( this.sceneProperty.value );
    context.save();
    context.imageSmoothingEnabled = true;
    context.transform( 1, -this.skew / this.displayWidth, 0, 1, 0, this.skew );
    context.drawImage( texture, 0, 0, this.displayWidth, this.faceHeight );
    context.restore();
  }
}
