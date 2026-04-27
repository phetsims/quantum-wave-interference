// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationCanvasNode renders field samples from the wave solver onto the wave visualization
 * region using a CanvasNode. It uses the solver's explicit FieldSample status instead of inferring
 * status from zero amplitude, so dark interference nodes are rendered as reached field rather than
 * neutral background.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import { DECOHERENCE_GLIMMER_RATE_HZ, getFieldSampleRGBA, UNREACHED_GRAY } from '../model/AnalyticalWaveRasterizer.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

const MATTER_BASE_R = 200;
const MATTER_BASE_G = 200;
const MATTER_BASE_B = 200;

// Neutral gray for cells the wavefront hasn't reached yet.
const BACKGROUND_GRAY = UNREACHED_GRAY;

export default class WaveVisualizationCanvasNode extends CanvasNode {

  public static readonly BACKGROUND_COLOR = new Color( BACKGROUND_GRAY, BACKGROUND_GRAY, BACKGROUND_GRAY );

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly viewWidth: number;
  private readonly viewHeight: number;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenContext: CanvasRenderingContext2D | null = null;
  private imageData: ImageData | null = null;

  private cachedWavelength = -1;
  private cachedR = 0;
  private cachedG = 0;
  private cachedB = 0;

  public constructor( sceneProperty: TReadOnlyProperty<WaveVisualizableScene>, viewWidth: number, viewHeight: number ) {
    super( {
      isDisposable: false,
      canvasBounds: new Bounds2( 0, 0, viewWidth, viewHeight )
    } );

    this.sceneProperty = sceneProperty;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const scene = this.sceneProperty.value;

    context.clearRect( 0, 0, this.viewWidth, this.viewHeight );

    if ( !scene.isWaveVisibleProperty.value ) {
      return;
    }

    const solver = scene.waveSolver;
    const gridWidth = solver.gridWidth;
    const gridHeight = solver.gridHeight;

    if ( !this.offscreenCanvas || this.offscreenCanvas.width !== gridWidth || this.offscreenCanvas.height !== gridHeight ) {
      this.offscreenCanvas = document.createElement( 'canvas' );
      this.offscreenCanvas.width = gridWidth;
      this.offscreenCanvas.height = gridHeight;
      this.offscreenContext = this.offscreenCanvas.getContext( '2d' )!;
      this.imageData = null;
    }

    if ( !this.imageData ) {
      this.imageData = this.offscreenContext!.createImageData( gridWidth, gridHeight );
    }

    const data = this.imageData.data;
    const isPhotons = scene.sourceType === 'photons';
    const displayMode = scene.activeWaveDisplayModeProperty.value;

    let baseR: number;
    let baseG: number;
    let baseB: number;

    if ( isPhotons ) {
      const wavelength = scene.wavelengthProperty.value;
      if ( wavelength !== this.cachedWavelength ) {
        const color = VisibleColor.wavelengthToColor( wavelength );
        this.cachedR = color.red;
        this.cachedG = color.green;
        this.cachedB = color.blue;
        this.cachedWavelength = wavelength;
      }
      baseR = this.cachedR;
      baseG = this.cachedG;
      baseB = this.cachedB;
    }
    else {
      baseR = MATTER_BASE_R;
      baseG = MATTER_BASE_G;
      baseB = MATTER_BASE_B;
    }

    const amplitudeScale = scene.waveAmplitudeScaleProperty.value;
    const decoherenceFrame = Math.floor( solver.getTime() * DECOHERENCE_GLIMMER_RATE_HZ );

    for ( let gy = 0; gy < gridHeight; gy++ ) {
      for ( let gx = 0; gx < gridWidth; gx++ ) {
        const cellIdx = gy * gridWidth + gx;
        const pixelIdx = cellIdx * 4;

        const sample = solver.getFieldSampleAtGridCell( gx, gy );
        const color = getFieldSampleRGBA( sample, displayMode, {
          red: baseR,
          green: baseG,
          blue: baseB
        }, amplitudeScale, {
          xIndex: gx,
          yIndex: gy,
          decoherenceFrame: decoherenceFrame
        } );
        data[ pixelIdx ] = color.red;
        data[ pixelIdx + 1 ] = color.green;
        data[ pixelIdx + 2 ] = color.blue;
        data[ pixelIdx + 3 ] = color.alpha;
      }
    }

    this.offscreenContext!.putImageData( this.imageData, 0, 0 );

    context.imageSmoothingEnabled = true;
    context.drawImage( this.offscreenCanvas, 0, 0, this.viewWidth, this.viewHeight );
  }
}
