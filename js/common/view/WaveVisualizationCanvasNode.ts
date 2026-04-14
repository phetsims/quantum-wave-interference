// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationCanvasNode renders the 2D amplitude field from the wave solver onto the wave visualization
 * region using a CanvasNode. It supports all five display modes:
 *
 * Photon modes:
 * - Time-averaged intensity: maps |amplitude|^2 to wavelength-colored brightness
 * - Electric field: positive real = wavelength color, negative = complementary dark, zero = black
 *
 * Matter-particle modes:
 * - Magnitude: maps |amplitude| to gray brightness
 * - Real/Imaginary part: positive = light gray, negative = blue-gray, zero = black
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
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

const MATTER_BASE_R = 200;
const MATTER_BASE_G = 200;
const MATTER_BASE_B = 200;

const NEGATIVE_MATTER_R = 80;
const NEGATIVE_MATTER_G = 120;
const NEGATIVE_MATTER_B = 200;

const NEGATIVE_PHOTON_SCALE = 0.3;

/**
 * Scales base RGB by a brightness factor and writes rounded values into the provided array at index 0, 1, 2.
 */
const scaleRGB = ( out: number[], baseR: number, baseG: number, baseB: number, brightness: number ): void => {
  out[ 0 ] = roundSymmetric( baseR * brightness );
  out[ 1 ] = roundSymmetric( baseG * brightness );
  out[ 2 ] = roundSymmetric( baseB * brightness );
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

    // Pre-compute negative-phase base colors outside the inner loop
    const negR = isPhotons ? ( 255 - baseR ) * NEGATIVE_PHOTON_SCALE : NEGATIVE_MATTER_R;
    const negG = isPhotons ? ( 255 - baseG ) * NEGATIVE_PHOTON_SCALE : NEGATIVE_MATTER_G;
    const negB = isPhotons ? ( 255 - baseB ) * NEGATIVE_PHOTON_SCALE : NEGATIVE_MATTER_B;

    for ( let gy = 0; gy < gridHeight; gy++ ) {
      const rowOffset = gy * gridWidth * 2;

      for ( let gx = 0; gx < gridWidth; gx++ ) {
        const fieldIdx = rowOffset + gx * 2;
        const re = amplitudeField[ fieldIdx ];
        const im = amplitudeField[ fieldIdx + 1 ];

        if ( isPhotons ) {
          if ( displayMode === 'timeAveragedIntensity' ) {
            scaleRGB( rgb, baseR, baseG, baseB, clamp( re * re + im * im, 0, 1 ) );
          }
          else {
            const value = clamp( re, -1, 1 );
            const brightness = clamp( Math.abs( value ), 0, 1 );
            if ( value >= 0 ) {
              scaleRGB( rgb, baseR, baseG, baseB, brightness );
            }
            else {
              scaleRGB( rgb, negR, negG, negB, brightness );
            }
          }
        }
        else {
          if ( displayMode === 'magnitude' ) {
            scaleRGB( rgb, baseR, baseG, baseB, clamp( Math.sqrt( re * re + im * im ), 0, 1 ) );
          }
          else {
            const component = displayMode === 'realPart' ? re : im;
            const value = clamp( component, -1, 1 );
            const brightness = clamp( Math.abs( value ), 0, 1 );
            if ( value >= 0 ) {
              scaleRGB( rgb, baseR, baseG, baseB, brightness );
            }
            else {
              scaleRGB( rgb, negR, negG, negB, brightness );
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
