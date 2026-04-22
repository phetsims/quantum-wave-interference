// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationCanvasNode renders the 2D amplitude field from the wave solver onto the wave visualization
 * region using a CanvasNode. Cells the wavefront hasn't reached (exactly zero amplitude) render as neutral gray.
 * Visited cells use intensity-based color mapping: baseColor * intensity, oscillating smoothly between
 * near-black and the full wavelength color. A peak-envelope tracker provides smooth gray-to-wave blending
 * at wavefront edges without affecting dark fringes in diffraction patterns.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

const MATTER_BASE_R = 200;
const MATTER_BASE_G = 200;
const MATTER_BASE_B = 200;

// Intensity at zero wave value (the "background" level).
const CUTOFF = 0.4;

// Neutral gray for cells the wavefront hasn't reached yet.
const BACKGROUND_GRAY = 80;

// Peak envelope threshold: once a cell's max-ever rawMag exceeds this, it no longer blends with gray.
const ENVELOPE_BLEND_THRESHOLD = 0.3;

export default class WaveVisualizationCanvasNode extends CanvasNode {

  public static readonly BACKGROUND_COLOR = new Color( BACKGROUND_GRAY, BACKGROUND_GRAY, BACKGROUND_GRAY );

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly viewWidth: number;
  private readonly viewHeight: number;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenContext: CanvasRenderingContext2D | null = null;
  private imageData: ImageData | null = null;

  // Tracks the maximum rawMag each cell has ever seen, to distinguish wavefront edges from dark fringes.
  private peakEnvelope: Float32Array | null = null;

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

    if ( !scene.isWaveVisibleProperty.value ) {
      return;
    }

    const solver = scene.waveSolver;
    const amplitudeField = solver.getAmplitudeField();
    const gridWidth = solver.gridWidth;
    const gridHeight = solver.gridHeight;
    const cellCount = gridWidth * gridHeight;

    if ( !this.offscreenCanvas || this.offscreenCanvas.width !== gridWidth || this.offscreenCanvas.height !== gridHeight ) {
      this.offscreenCanvas = document.createElement( 'canvas' );
      this.offscreenCanvas.width = gridWidth;
      this.offscreenCanvas.height = gridHeight;
      this.offscreenContext = this.offscreenCanvas.getContext( '2d' )!;
      this.imageData = null;
      this.peakEnvelope = null;
    }

    if ( !this.imageData ) {
      this.imageData = this.offscreenContext!.createImageData( gridWidth, gridHeight );
    }

    if ( !this.peakEnvelope || this.peakEnvelope.length !== cellCount ) {
      this.peakEnvelope = new Float32Array( cellCount );
    }

    const data = this.imageData.data;
    const envelope = this.peakEnvelope;
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

    for ( let gy = 0; gy < gridHeight; gy++ ) {
      const rowOffset = gy * gridWidth * 2;

      for ( let gx = 0; gx < gridWidth; gx++ ) {
        const fieldIdx = rowOffset + gx * 2;
        const cellIdx = gy * gridWidth + gx;
        const pixelIdx = cellIdx * 4;

        const rawRe = amplitudeField[ fieldIdx ];
        const rawIm = amplitudeField[ fieldIdx + 1 ];

        if ( rawRe === 0 && rawIm === 0 ) {

          // Reset envelope when amplitude returns to exactly zero (trailing edge has passed).
          envelope[ cellIdx ] = 0;

          data[ pixelIdx ] = BACKGROUND_GRAY;
          data[ pixelIdx + 1 ] = BACKGROUND_GRAY;
          data[ pixelIdx + 2 ] = BACKGROUND_GRAY;
          data[ pixelIdx + 3 ] = 255;
          continue;
        }

        const rawMag = Math.sqrt( rawRe * rawRe + rawIm * rawIm );
        if ( rawMag > envelope[ cellIdx ] ) {
          envelope[ cellIdx ] = rawMag;
        }

        const re = rawRe * amplitudeScale;
        const im = rawIm * amplitudeScale;

        let intensity;

        if ( displayMode === 'timeAveragedIntensity' ) {
          const mag2 = re * re + im * im;
          intensity = clamp( CUTOFF + ( 1 - CUTOFF ) * mag2, CUTOFF, 1 );
        }
        else if ( displayMode === 'magnitude' ) {
          const mag = Math.sqrt( re * re + im * im );
          intensity = clamp( CUTOFF + ( 1 - CUTOFF ) * mag, CUTOFF, 1 );
        }
        else {
          const value = displayMode === 'imaginaryPart' ? im : re;
          if ( value > 0 ) {
            intensity = clamp( CUTOFF + ( 1 - CUTOFF ) * value, CUTOFF, 1 );
          }
          else {
            intensity = clamp( CUTOFF * ( 1 + value ), 0, CUTOFF );
          }
        }

        const waveR = baseR * intensity;
        const waveG = baseG * intensity;
        const waveB = baseB * intensity;

        // Blend from gray at wavefront edges. Once the peak envelope exceeds the threshold,
        // the cell has been fully reached by the wavefront and shows pure wave color. This
        // prevents dark fringes (low current amplitude but high historical amplitude) from
        // incorrectly blending with gray.
        if ( envelope[ cellIdx ] >= ENVELOPE_BLEND_THRESHOLD ) {
          data[ pixelIdx ] = roundSymmetric( waveR );
          data[ pixelIdx + 1 ] = roundSymmetric( waveG );
          data[ pixelIdx + 2 ] = roundSymmetric( waveB );
        }
        else {
          const blend = envelope[ cellIdx ] / ENVELOPE_BLEND_THRESHOLD;
          data[ pixelIdx ] = roundSymmetric( BACKGROUND_GRAY + ( waveR - BACKGROUND_GRAY ) * blend );
          data[ pixelIdx + 1 ] = roundSymmetric( BACKGROUND_GRAY + ( waveG - BACKGROUND_GRAY ) * blend );
          data[ pixelIdx + 2 ] = roundSymmetric( BACKGROUND_GRAY + ( waveB - BACKGROUND_GRAY ) * blend );
        }
        data[ pixelIdx + 3 ] = 255;
      }
    }

    this.offscreenContext!.putImageData( this.imageData, 0, 0 );

    context.imageSmoothingEnabled = true;
    context.drawImage( this.offscreenCanvas, 0, 0, this.viewWidth, this.viewHeight );
  }
}
