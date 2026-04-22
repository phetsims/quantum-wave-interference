// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationCanvasNode renders the 2D amplitude field from the wave solver onto the wave visualization
 * region using a CanvasNode. It supports all five display modes:
 *
 * Photon modes:
 * - Time-averaged intensity: maps |amplitude|^2 from the neutral background to wavelength color
 * - Electric field: positive real = wavelength color, negative = black, zero = neutral background
 *
 * Matter-particle modes:
 * - Magnitude: maps |amplitude| from the neutral background to light gray
 * - Real/Imaginary part: positive = light gray, negative = black, zero = neutral background
 *
 * Renders at the solver grid resolution (typically 200x200) and scales up to the view dimensions
 * via drawImage for performance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

const MATTER_BASE_R = 200;
const MATTER_BASE_G = 200;
const MATTER_BASE_B = 200;

/**
 * Interpolates between start and end RGB colors and writes rounded values into the provided array at index 0, 1, 2.
 */
const interpolateRGB = (
  out: number[],
  startR: number,
  startG: number,
  startB: number,
  endR: number,
  endG: number,
  endB: number,
  fraction: number
): void => {
  const clampedFraction = clamp( fraction, 0, 1 );
  out[ 0 ] = roundSymmetric( startR + ( endR - startR ) * clampedFraction );
  out[ 1 ] = roundSymmetric( startG + ( endG - startG ) * clampedFraction );
  out[ 2 ] = roundSymmetric( startB + ( endB - startB ) * clampedFraction );
};

export default class WaveVisualizationCanvasNode extends CanvasNode {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly viewWidth: number;
  private readonly viewHeight: number;
  private offscreenCanvas: HTMLCanvasElement | null = null;
  private offscreenContext: CanvasRenderingContext2D | null = null;
  private imageData: ImageData | null = null;

  // Cached wavelength-to-color to avoid per-frame Color allocation
  private cachedWavelength = -1;
  private cachedR = 0;
  private cachedG = 0;
  private cachedB = 0;

  // Scratch array for scaleRGB output
  private readonly rgb = [ 0, 0, 0 ];

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
    const backgroundColor = QuantumWaveInterferenceColors.waveAndDetectorBackgroundColorProperty.value;
    const backgroundR = backgroundColor.red;
    const backgroundG = backgroundColor.green;
    const backgroundB = backgroundColor.blue;

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

    const rgb = this.rgb;
    const amplitudeScale = scene.waveAmplitudeScaleProperty.value;

    for ( let gy = 0; gy < gridHeight; gy++ ) {
      const rowOffset = gy * gridWidth * 2;

      for ( let gx = 0; gx < gridWidth; gx++ ) {
        const fieldIdx = rowOffset + gx * 2;
        const re = amplitudeField[ fieldIdx ] * amplitudeScale;
        const im = amplitudeField[ fieldIdx + 1 ] * amplitudeScale;

        if ( isPhotons ) {
          if ( displayMode === 'timeAveragedIntensity' ) {
            interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, baseR, baseG, baseB, re * re + im * im );
          }
          else {
            const value = clamp( re, -1, 1 );
            if ( value >= 0 ) {
              interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, baseR, baseG, baseB, value );
            }
            else {
              interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, 0, 0, 0, -value );
            }
          }
        }
        else {
          if ( displayMode === 'magnitude' ) {
            interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, baseR, baseG, baseB, Math.sqrt( re * re + im * im ) );
          }
          else {
            const component = displayMode === 'realPart' ? re : im;
            const value = clamp( component, -1, 1 );
            if ( value >= 0 ) {
              interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, baseR, baseG, baseB, value );
            }
            else {
              interpolateRGB( rgb, backgroundR, backgroundG, backgroundB, 0, 0, 0, -value );
            }
          }
        }

        const pixelIdx = ( gy * gridWidth + gx ) * 4;
        data[ pixelIdx ] = rgb[ 0 ];
        data[ pixelIdx + 1 ] = rgb[ 1 ];
        data[ pixelIdx + 2 ] = rgb[ 2 ];
        data[ pixelIdx + 3 ] = 255;
      }
    }

    this.offscreenContext!.putImageData( this.imageData, 0, 0 );

    context.imageSmoothingEnabled = true;
    context.drawImage( this.offscreenCanvas, 0, 0, this.viewWidth, this.viewHeight );
  }
}
