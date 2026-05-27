// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationCanvasNode renders the active scene's wave solver samples into the rectangular
 * wave visualization region. It samples the solver grid once per paint, converts each model-level
 * FieldSample or LayeredFieldSample into RGBA bytes, writes those bytes to an offscreen ImageData,
 * then scales the offscreen canvas to the view size. Rendering at solver resolution avoids allocating
 * one Scenery Node per sample and keeps per-frame work predictable.
 *
 * The color mapping depends on the source and wave display mode. Photon scenes use the visible color
 * for the current wavelength, while matter-particle scenes use a neutral gray base color. The active
 * display mode determines whether the sampled complex amplitudes are shown as intensity, magnitude,
 * real part, imaginary part, or electric field.
 *
 * The renderer uses the solver's explicit FieldSample status instead of inferring status from zero
 * amplitude, so dark interference nodes are rendered as reached field rather than neutral background.
 * Solvers that expose layered samples can return transparent wave layers; those layers are composited
 * in the rasterizer and allow the black wave-region background behind this canvas to show through.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import { getFieldSampleRGBA, getLayeredFieldSampleRGBA } from '../model/AnalyticalWaveRasterizer.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

const MATTER_BASE_R = 200;
const MATTER_BASE_G = 200;
const MATTER_BASE_B = 200;

export default class WaveVisualizationCanvasNode extends CanvasNode {

  // Background color shared by the backing Rectangle in parent nodes so transparent layered samples reveal black.
  public static readonly BACKGROUND_COLOR = Color.BLACK;

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

  /**
   * @param sceneProperty - active wave-visualizable scene whose solver and display settings are rendered
   * @param viewWidth - width of the display region in view coordinates
   * @param viewHeight - height of the display region in view coordinates
   */
  public constructor( sceneProperty: TReadOnlyProperty<WaveVisualizableScene>, viewWidth: number, viewHeight: number ) {
    super( {
      isDisposable: false,
      canvasBounds: new Bounds2( 0, 0, viewWidth, viewHeight )
    } );

    this.sceneProperty = sceneProperty;
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
  }

  /**
   * Repaints the wave field for the current scene. This method mutates only this node's reusable
   * canvas caches and the provided CanvasRenderingContext2D; parent nodes are responsible for calling
   * invalidatePaint when scene state changes.
   */
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

    const amplitudeScale = scene.waveAmplitudeScaleProperty?.value ?? 1;
    const baseColor = {
      red: baseR,
      green: baseG,
      blue: baseB
    };
    const usesLayeredFieldSamples = solver.usesLayeredFieldSamples?.() === true;

    for ( let gy = 0; gy < gridHeight; gy++ ) {
      for ( let gx = 0; gx < gridWidth; gx++ ) {
        const cellIdx = gy * gridWidth + gx;
        const pixelIdx = cellIdx * 4;

        const color = usesLayeredFieldSamples && solver.getLayeredFieldSampleAtGridCell ?
                      getLayeredFieldSampleRGBA( solver.getLayeredFieldSampleAtGridCell( gx, gy ), displayMode, baseColor, amplitudeScale ) :
                      getFieldSampleRGBA( solver.getFieldSampleAtGridCell( gx, gy ), displayMode, baseColor, amplitudeScale );
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
