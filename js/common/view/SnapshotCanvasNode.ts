// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotCanvasNode renders the detector-screen preview shown inside a SnapshotNode.
 * It supports the two snapshot data sources used by Quantum Wave Interference:
 *
 * - stored particle hits from hits mode
 * - intensity snapshots, either captured from the wave solver or reconstructed from analytical metadata
 *
 * The node owns a reusable offscreen texture canvas for intensity rendering so repainting a snapshot does not allocate
 * canvas resources every frame. Hit rendering draws directly to the display canvas because the newest hits and zoom
 * crop are cheap to project for the small snapshot preview.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import type { Snapshot } from '../model/Snapshot.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { getApparentAnalyticalDetectorIntensity } from './ApparentDetectorPattern.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getInterpolatedRGBFillStyle, getSceneRGB, sampleSmoothedIntensityDistribution } from './ScreenBrightnessUtils.js';

const MAX_RENDERED_SNAPSHOT_HITS = 100000;

// Resolution for the offscreen texture canvas used by the analytical intensity rendering path.
const ANALYTICAL_TEXTURE_WIDTH = 376;
const ANALYTICAL_TEXTURE_HEIGHT = 155;
const CAPTURED_INTENSITY_SUPERSAMPLE = 4;
const CAPTURED_INTENSITY_SMOOTHING_RADIUS = 1.5;

export default class SnapshotCanvasNode extends CanvasNode {
  private readonly snapshotProperty: TReadOnlyProperty<Snapshot | null>;
  private readonly useFrontFacingHitCoordinates: boolean;
  private readonly getZoomedScreenHalfWidth: ( () => number ) | null;
  private readonly capturedIntensityTextureWidth: number;
  private readonly capturedIntensityTextureHeight: number;
  private readonly intensityTextureCanvas: HTMLCanvasElement;
  private readonly intensityTextureContext: CanvasRenderingContext2D;

  /**
   * @param snapshotProperty - current snapshot to render, or null when this slot is empty
   * @param width - display width of the snapshot canvas
   * @param height - display height of the snapshot canvas
   * @param useFrontFacingHitCoordinates - whether hit coordinates should be interpreted as front-facing detector data
   * @param getVisibleScreenHalfWidth - optional zoom crop used by Experiment detector snapshots
   */
  public constructor(
    snapshotProperty: TReadOnlyProperty<Snapshot | null>,
    width: number,
    height: number,
    useFrontFacingHitCoordinates: boolean,
    getVisibleScreenHalfWidth?: () => number
  ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.snapshotProperty = snapshotProperty;
    this.useFrontFacingHitCoordinates = useFrontFacingHitCoordinates;
    this.getZoomedScreenHalfWidth = getVisibleScreenHalfWidth || null;
    this.capturedIntensityTextureWidth = width * CAPTURED_INTENSITY_SUPERSAMPLE;
    this.capturedIntensityTextureHeight = height;

    this.intensityTextureCanvas = document.createElement( 'canvas' );
    this.intensityTextureCanvas.width = ANALYTICAL_TEXTURE_WIDTH;
    this.intensityTextureCanvas.height = ANALYTICAL_TEXTURE_HEIGHT;

    const intensityTextureContext = this.intensityTextureCanvas.getContext( '2d' );
    if ( !intensityTextureContext ) {
      throw new Error( 'Could not create 2D context for snapshot intensity texture' );
    }
    this.intensityTextureContext = intensityTextureContext;
  }

  /**
   * Paints either stored particle hits or an intensity distribution for the active snapshot.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const snapshot = this.snapshotProperty.value;
    if ( !snapshot ) {
      return;
    }

    if ( snapshot.detectionMode === 'hits' ) {
      this.paintHits( context, snapshot );
    }
    else {
      this.paintIntensity( context, snapshot );
    }
  }

  /**
   * Paints the most recent particle hits, cropped to the visible detector range and scaled by brightness.
   */
  private paintHits( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const hits = snapshot.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const displayBounds = this.canvasBounds;
    const width = displayBounds.width;
    const height = displayBounds.height;
    const visibleHalfWidth = this.getVisibleScreenHalfWidth( snapshot );
    const visibleFraction = visibleHalfWidth / snapshot.screenHalfWidth;
    const zoomScale = 1 / visibleFraction;
    const displayGain = getHitsDisplayGain( snapshot.brightness );
    const brightnessFraction = getHitsBrightnessFraction( snapshot.brightness );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = BASE_HIT_GLOW_RADIUS * zoomScale * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const baseRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );
    const scaledR = baseRGB.r;
    const scaledG = baseRGB.g;
    const scaledB = baseRGB.b;

    const hitCount = hits.length;
    const renderCount = Math.min( hitCount, MAX_RENDERED_SNAPSHOT_HITS );
    const startIndex = hitCount - renderCount;

    const drawHits = ( alpha: number, radius: number ): void => {
      if ( alpha === 0 ) {
        return;
      }
      context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${alpha})`;
      for ( let i = startIndex; i < hitCount; i++ ) {
        const hit = hits[ i ];
        const hitX = hit.x;
        const normalizedVisibleX = hitX / visibleFraction;
        if ( Math.abs( normalizedVisibleX ) > 1 ) {
          continue;
        }

        // Front-facing detector hits use hit.y from center-to-top; snapshots stretch that half-span to full height.
        const hitY = this.useFrontFacingHitCoordinates ? 1 - 2 * hit.y : hit.y;
        const normalizedVisibleY = hitY / visibleFraction;
        if ( Math.abs( normalizedVisibleY ) > 1 ) {
          continue;
        }

        const viewX = displayBounds.left + ( ( normalizedVisibleX + 1 ) / 2 ) * width;
        const viewY = displayBounds.top + ( ( normalizedVisibleY + 1 ) / 2 ) * height;
        context.beginPath();
        context.arc( viewX, viewY, radius, 0, Math.PI * 2 );
        context.fill();
      }
    };

    drawHits( glowAlpha, glowRadius );
    drawHits( coreAlpha, BASE_HIT_CORE_RADIUS * zoomScale );
  }

  /**
   * Selects the intensity rendering path. Captured intensity comes from simulated detector data, while analytical
   * intensity is reconstructed from Experiment screen metadata.
   */
  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    if ( snapshot.intensityDistribution.length > 0 ) {
      this.paintCapturedIntensity( context, snapshot );
    }
    else {
      this.paintAnalyticalIntensity( context, snapshot );
    }
  }

  /**
   * Renders from a captured solver probability distribution (High Intensity / Single Particles screens).
   */
  private paintCapturedIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const distribution = snapshot.intensityDistribution;
    const displayBounds = this.canvasBounds;
    const textureContext = this.intensityTextureContext;
    this.setIntensityTextureSize( this.capturedIntensityTextureWidth, this.capturedIntensityTextureHeight );
    textureContext.clearRect( 0, 0, this.capturedIntensityTextureWidth, this.capturedIntensityTextureHeight );

    const backgroundRGB = { r: 0, g: 0, b: 0 };

    const normalizedBrightness = snapshot.brightness / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
    const displayGain = getIntensityDisplayGain( normalizedBrightness, snapshot.intensity );

    const sourceRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );

    for ( let x = 0; x < this.capturedIntensityTextureWidth; x++ ) {
      const fraction = ( x + 0.5 ) / this.capturedIntensityTextureWidth;
      const intensityScale = sampleSmoothedIntensityDistribution( distribution, fraction, CAPTURED_INTENSITY_SMOOTHING_RADIUS ) *
                             displayGain;
      const fillStyle = getInterpolatedRGBFillStyle( backgroundRGB, sourceRGB, intensityScale );
      textureContext.fillStyle = fillStyle;
      textureContext.fillRect( x, 0, 1, this.capturedIntensityTextureHeight );
    }

    context.save();
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(
      this.intensityTextureCanvas,
      displayBounds.left,
      displayBounds.top,
      displayBounds.width,
      displayBounds.height
    );
    context.restore();
  }

  /**
   * Computes the analytical Fraunhofer diffraction pattern from snapshot metadata (Experiment screen).
   */
  private paintAnalyticalIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    if ( !snapshot.isEmitting ) {
      return;
    }

    const lambda = snapshot.effectiveWavelength;
    if ( lambda === 0 ) {
      return;
    }

    const displayBounds = this.canvasBounds;
    const textureContext = this.intensityTextureContext;
    this.setIntensityTextureSize( ANALYTICAL_TEXTURE_WIDTH, ANALYTICAL_TEXTURE_HEIGHT );
    textureContext.clearRect( 0, 0, ANALYTICAL_TEXTURE_WIDTH, ANALYTICAL_TEXTURE_HEIGHT );

    const displayGain = getIntensityDisplayGain( snapshot.brightness, snapshot.intensity );
    const screenHalfWidth = this.getVisibleScreenHalfWidth( snapshot );

    // The analytical snapshot texture spans the full detector width, which is twice the captured screenHalfWidth.
    const sampleWidthOnScreen = 2 * screenHalfWidth / ANALYTICAL_TEXTURE_WIDTH;
    const slitWidthMeters = snapshot.slitWidth * 1e-3;
    const slitSeparationMeters = snapshot.slitSeparation * 1e-3;
    const screenDistanceMeters = snapshot.screenDistance;
    const slitSetting = snapshot.slitSetting;
    const backgroundRGB = { r: 0, g: 0, b: 0 };

    const sourceRGB = getSceneRGB( snapshot.sourceType, snapshot.wavelength );

    for ( let x = 0; x < ANALYTICAL_TEXTURE_WIDTH; x++ ) {
      const fraction = ( x + 0.5 ) / ANALYTICAL_TEXTURE_WIDTH;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      const intensity = getApparentAnalyticalDetectorIntensity( {
        positionOnScreen: physicalX,
        sampleWidthOnScreen: sampleWidthOnScreen,
        effectiveWavelength: lambda,
        screenDistance: screenDistanceMeters,
        slitWidth: slitWidthMeters,
        slitSeparation: slitSeparationMeters,
        slitSetting: slitSetting
      } );

      const intensityScale = intensity * displayGain;
      const fillStyle = getInterpolatedRGBFillStyle( backgroundRGB, sourceRGB, intensityScale );
      textureContext.fillStyle = fillStyle;
      textureContext.fillRect( x, 0, 1, ANALYTICAL_TEXTURE_HEIGHT );
    }

    context.save();
    context.imageSmoothingEnabled = true;
    context.drawImage(
      this.intensityTextureCanvas,
      displayBounds.left,
      displayBounds.top,
      displayBounds.width,
      displayBounds.height
    );
    context.restore();
  }

  /**
   * Returns the detector half-width currently visible in the snapshot. Zoomed Experiment snapshots provide this as
   * a view callback; other snapshots use the half-width captured in the snapshot state.
   */
  private getVisibleScreenHalfWidth( snapshot: Snapshot ): number {
    return this.getZoomedScreenHalfWidth ? this.getZoomedScreenHalfWidth() : snapshot.screenHalfWidth;
  }

  /**
   * Resizes the reusable offscreen intensity texture canvas only when the rendering path changes dimensions.
   */
  private setIntensityTextureSize( width: number, height: number ): void {
    if ( this.intensityTextureCanvas.width !== width ) {
      this.intensityTextureCanvas.width = width;
    }
    if ( this.intensityTextureCanvas.height !== height ) {
      this.intensityTextureCanvas.height = height;
    }
  }
}
