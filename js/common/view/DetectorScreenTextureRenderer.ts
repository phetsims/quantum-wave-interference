// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenTextureRenderer provides shared per-scene detector-screen texture rendering for the
 * High Intensity and Single Particles screens. It renders hit dots or intensity bands onto an offscreen
 * canvas, using incremental rendering for hits to minimize per-frame cost.
 *
 * This follows the same architecture as the Experiment screen's getDetectorScreenTexture.ts, adapted
 * to work with both HighIntensitySceneModel and SingleParticlesSceneModel via a common interface.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TEmitter from '../../../../axon/js/TEmitter.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import { type SourceType } from '../model/SourceType.js';
import type WaveSolver from '../model/WaveSolver.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { createDetectorScreenHitRenderCache, createDetectorScreenHitSpriteParams, type DetectorScreenHitRenderCache, detectorScreenHitSpriteParamsMatch, type DetectorScreenTextureRenderParameters, detectorScreenTextureRenderParametersChanged, resetDetectorScreenHitRenderCache } from './renderDetectorScreenTexture.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHighIntensityIntensityDisplayGain, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getSceneRGB, getWaveAndDetectorBackgroundRGB, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER, PERCEPTUAL_VISIBILITY_THRESHOLD } from './ScreenBrightnessUtils.js';

// Supersampling factor for the offscreen detector-screen texture. Rendering above the displayed screen size keeps
// skewed detector textures and small hit dots from looking pixelated.
const DEFAULT_TEXTURE_SCALE = 2;

// Maximum number of most-recent particle hits drawn into the live detector texture. This bounds canvas rendering cost
// while the model can continue accumulating the full hit history.
const MAX_RENDERED_HITS = 10000;

// Visual size adjustment for hit dots on the shared High Intensity and Single Particles detector screens.
const HIT_SIZE_SCALE = 1.2;

// Minimal scene-model interface required by DetectorScreenTextureRenderer. HighIntensitySceneModel and
// SingleParticlesSceneModel both satisfy this shape, so the shared DetectorScreenNode can render either scene without
// depending on screen-specific model classes.
export type DetectorScreenSceneLike = {

  // Detector-screen hit positions. The renderer maps hit.y in [0, 1] to horizontal screen position and hit.x in
  // [-1, 1] to vertical screen position to match the detector-screen face orientation.
  hits: Vector2[];

  // Selects the scene color palette. The final color also depends on wavelengthProperty.
  sourceType: SourceType;

  // Effective source wavelength used for detector-screen hit and intensity colors.
  wavelengthProperty: TReadOnlyProperty<number>;

  // User-controlled detector-screen brightness. The range max is required for normalizing the display gain.
  screenBrightnessProperty: TReadOnlyProperty<number> & { range: { max: number } };

  // Whether the source is currently emitting. Rendering depends on this because turning emission off can change
  // detector-screen appearance and cache invalidation behavior.
  isEmittingProperty: TReadOnlyProperty<boolean>;

  // Emits when hits are added, cleared, or otherwise changed. The renderer listens to this to invalidate its
  // per-scene texture cache.
  hitsChangedEmitter: TEmitter;

  // Provides the detector probability distribution for intensity rendering.
  waveSolver: WaveSolver;

  // Optional because Single Particles always renders hits. High Intensity switches between hits and intensity.
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;

  // Optional High Intensity display gain for intensity rendering. Single Particles does not expose this slider.
  intensityProperty?: TReadOnlyProperty<number>;

  // Optional exposure ramp for intensity patterns on the High Intensity screen as the detector pattern forms.
  detectorPatternFormationFactorProperty?: TReadOnlyProperty<number>;
};

/**
 * Per-scene rendering state owned by DetectorScreenTextureRenderer. One cache is created lazily per
 * DetectorScreenSceneLike instance and stored in a WeakMap so it is garbage-collected with the scene.
 *
 * - canvas/context: the supersampled offscreen canvas written to and returned by getTexture.
 * - dirty: set to true by scene property listeners whenever any render parameter changes; cleared after renderTexture.
 * - lastRenderParameters: snapshot of the parameters used for the most recent render; used to detect full-repaint
 *   vs. incremental-append scenarios.
 * - hitRenderCache: sprite and incremental bookkeeping for hit-mode rendering (see renderDetectorScreenTexture.ts).
 * - intensityCanvas/Context/ImageData: single-pixel-wide scratch buffers for intensity column rendering,
 *   allocated lazily and reused across frames to minimize GC pressure.
 */
type TextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;
  lastRenderParameters: DetectorScreenTextureRenderParameters | null;
  hitRenderCache: DetectorScreenHitRenderCache;
  intensityCanvas: HTMLCanvasElement | null;
  intensityContext: CanvasRenderingContext2D | null;
  intensityImageData: ImageData | null;
};

export default class DetectorScreenTextureRenderer {

  private readonly textureWidth: number;
  private readonly faceHeight: number;
  private readonly faceTextureHeight: number;
  private readonly hitCoreRadius: number;
  private readonly hitGlowRadius: number;
  private readonly hitSpriteCenter: number;
  private readonly hitSpriteSize: number;
  private readonly cacheMap = new WeakMap<DetectorScreenSceneLike, TextureCache>();

  public constructor( screenWidth: number, screenHeight: number, skew = 0, textureScale = DEFAULT_TEXTURE_SCALE ) {
    this.textureWidth = Math.ceil( screenWidth * textureScale );
    this.faceHeight = ( screenHeight - skew ) * textureScale;
    this.faceTextureHeight = Math.ceil( this.faceHeight );
    this.hitCoreRadius = BASE_HIT_CORE_RADIUS * textureScale * HIT_SIZE_SCALE;
    this.hitGlowRadius = BASE_HIT_GLOW_RADIUS * textureScale * HIT_SIZE_SCALE;

    const maxGlowRadius = this.hitGlowRadius *
                          Math.min( 2, Math.sqrt( Math.max( 1, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER ) ) );

    // Fixed integer anchor for all brightness values, plus 1 px antialiasing padding.
    this.hitSpriteCenter = Math.ceil( Math.max( this.hitCoreRadius, maxGlowRadius ) ) + 1;
    this.hitSpriteSize = this.hitSpriteCenter * 2;
  }

  /**
   * Returns the supersampled offscreen canvas for the given scene, re-rendering it first if dirty.
   * Called every animation frame by DetectorScreenNode; the returned canvas is drawn into the WebGL/Canvas
   * scene graph via drawImage. In intensity mode the texture is always re-rendered because the
   * solver distribution changes every frame; in hit mode rendering is incremental.
   */
  public getTexture( scene: DetectorScreenSceneLike ): HTMLCanvasElement {
    let cache = this.cacheMap.get( scene );
    if ( !cache ) {
      cache = this.createCache( scene );
      this.cacheMap.set( scene, cache );
    }

    // In intensity mode, the solver distribution updates every frame, so always re-render
    const detectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    const lastRampFactor = cache.lastRenderParameters?.rampFactor ?? 1;
    if ( cache.dirty || detectionMode === 'intensity' || lastRampFactor < 1 ) {
      this.renderTexture( cache, scene );
    }

    return cache.canvas;
  }

  /**
   * Allocates a fresh TextureCache for a scene and attaches markDirty listeners to every scene property that
   * can change the rendered output. The listeners are never explicitly removed; they are released when the scene
   * (and therefore the WeakMap entry) is garbage-collected. Throws if the browser cannot provide a 2D context.
   */
  private createCache( scene: DetectorScreenSceneLike ): TextureCache {
    const canvas = document.createElement( 'canvas' );
    canvas.width = this.textureWidth;
    canvas.height = this.faceTextureHeight;

    const context = canvas.getContext( '2d' );
    if ( !context ) {
      throw new Error( 'Could not create 2D context for detector screen texture cache' );
    }

    const cache: TextureCache = {
      canvas: canvas,
      context: context,
      dirty: true,
      lastRenderParameters: null,
      hitRenderCache: createDetectorScreenHitRenderCache(),
      intensityCanvas: null,
      intensityContext: null,
      intensityImageData: null
    };

    const markDirty = () => { cache.dirty = true; };

    scene.hitsChangedEmitter.addListener( markDirty );
    scene.isEmittingProperty.link( markDirty );
    scene.screenBrightnessProperty.link( markDirty );
    scene.wavelengthProperty.link( markDirty );
    if ( scene.detectionModeProperty ) {
      scene.detectionModeProperty.link( markDirty );
    }
    if ( scene.intensityProperty ) {
      scene.intensityProperty.link( markDirty );
    }
    if ( scene.detectorPatternFormationFactorProperty ) {
      scene.detectorPatternFormationFactorProperty.link( markDirty );
    }

    return cache;
  }

  /**
   * Dispatches to paintHits or paintIntensity based on the current detection mode. When render parameters have
   * changed since the last frame (wavelength, brightness, mode, etc.) the hit render cache is reset and the canvas
   * is cleared so the next paint starts from scratch rather than compositing over stale content.
   */
  private renderTexture( cache: TextureCache, scene: DetectorScreenSceneLike ): void {
    const context = cache.context;
    const currentBrightness = scene.screenBrightnessProperty.value;
    const currentWavelength = scene.wavelengthProperty.value;
    const currentDetectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    const currentIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
    const currentIsEmitting = scene.isEmittingProperty.value;
    const rampFactor = currentDetectionMode === 'intensity' ?
                       scene.detectorPatternFormationFactorProperty?.value ?? 1 :
                       1;
    const currentRenderParameters: DetectorScreenTextureRenderParameters = {
      brightness: currentBrightness,
      wavelength: currentWavelength,
      detectionMode: currentDetectionMode,
      intensity: currentIntensity,
      isEmitting: currentIsEmitting,
      rampFactor: rampFactor
    };

    if ( detectorScreenTextureRenderParametersChanged( cache.lastRenderParameters, currentRenderParameters ) ) {
      resetDetectorScreenHitRenderCache( cache.hitRenderCache );
      context.clearRect( 0, 0, this.textureWidth, this.faceTextureHeight );
      cache.lastRenderParameters = currentRenderParameters;
    }

    if ( currentDetectionMode === 'hits' ) {
      const sliderMax = scene.screenBrightnessProperty.range.max;
      const hitsDisplayGain = getHitsDisplayGain( currentBrightness, sliderMax );
      const hitsBrightnessFraction = getHitsBrightnessFraction( currentBrightness );
      this.paintHits( cache, context, scene, hitsDisplayGain, hitsBrightnessFraction );
    }
    else {
      context.clearRect( 0, 0, this.textureWidth, this.faceTextureHeight );
      const normalizedBrightness = currentBrightness / scene.screenBrightnessProperty.range.max;
      const intensityDisplayGain = getHighIntensityIntensityDisplayGain( normalizedBrightness, currentIntensity );
      this.paintIntensity( cache, scene, intensityDisplayGain, rampFactor );
    }

    cache.dirty = false;
  }

  /**
   * Incrementally stamps hit-dot sprites onto the cache canvas. Only the hits added since the last frame are
   * drawn when the hit list has grown monotonically; a full repaint is triggered when hits were cleared or when
   * the window of rendered hits (capped at MAX_RENDERED_HITS) needs to shift. Normalized hit coordinates use
   * hit.y → horizontal screen position and hit.x → vertical, matching the detector-screen face orientation.
   */
  private paintHits(
    cache: TextureCache,
    context: CanvasRenderingContext2D,
    scene: DetectorScreenSceneLike,
    displayGain: number,
    brightnessFraction: number
  ): void {
    const hits = scene.hits;
    if ( hits.length === 0 ) {
      if ( cache.hitRenderCache.lastRenderedHitCount > 0 ) {
        context.clearRect( 0, 0, this.textureWidth, this.faceTextureHeight );
      }
      cache.hitRenderCache.lastRenderedHitCount = 0;
      return;
    }

    const rgb = getSceneRGB( scene.sourceType, scene.wavelengthProperty.value );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = this.hitGlowRadius * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const sprite = this.getHitSprite( cache.hitRenderCache, rgb, coreAlpha, glowAlpha, glowRadius );

    const hitCount = hits.length;
    const renderCount = Math.min( hitCount, MAX_RENDERED_HITS );
    const startIndex = hitCount - renderCount;

    const alreadyRendered = cache.hitRenderCache.lastRenderedHitCount;
    const needsFullRepaint = alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
    const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

    if ( needsFullRepaint ) {
      context.clearRect( 0, 0, this.textureWidth, this.faceTextureHeight );
    }

    for ( let i = incrementalStart; i < hitCount; i++ ) {
      const hit = hits[ i ];

      const viewX = (
                      QuantumWaveInterferenceConstants.DETECTOR_SCREEN_OVERLAP_FRACTION +
                      hit.y * QuantumWaveInterferenceConstants.DETECTOR_SCREEN_VISIBLE_FRACTION
                    ) * this.textureWidth;
      const viewY = ( ( hit.x + 1 ) / 2 ) * this.faceHeight;
      context.drawImage( sprite, viewX - this.hitSpriteCenter, viewY - this.hitSpriteCenter );
    }

    cache.hitRenderCache.lastRenderedHitCount = hitCount;
  }

  /**
   * Renders the intensity distribution from the wave solver into the cache canvas. A single-pixel-wide
   * scratch canvas is populated via ImageData for performance, then stretched across the full texture width with
   * image smoothing enabled. The exposureFactor ramps both brightness and contrast so the pattern appears to form
   * progressively rather than snapping to full contrast the moment the first average is available.
   */
  private paintIntensity(
    cache: TextureCache,
    scene: DetectorScreenSceneLike,
    displayGain: number,
    exposureFactor: number
  ): void {
    const context = cache.context;
    const backgroundRGB = getWaveAndDetectorBackgroundRGB();
    const rgb = getSceneRGB( scene.sourceType, scene.wavelengthProperty.value );
    const distribution = scene.waveSolver.getDetectorProbabilityDistribution();
    const distributionLength = distribution.length;
    let totalIntensity = 0;
    for ( let i = 0; i < distributionLength; i++ ) {
      totalIntensity += distribution[ i ];
    }
    const meanIntensity = distributionLength > 0 ? totalIntensity / distributionLength : 0;
    let intensityCanvas = cache.intensityCanvas;
    let intensityContext = cache.intensityContext;
    let imageData = cache.intensityImageData;
    if ( !intensityCanvas || !intensityContext || intensityCanvas.height !== this.faceTextureHeight ) {
      intensityCanvas = document.createElement( 'canvas' );
      intensityCanvas.width = 1;
      intensityCanvas.height = this.faceTextureHeight;

      intensityContext = intensityCanvas.getContext( '2d' );
      if ( !intensityContext ) {
        throw new Error( 'Could not create 2D context for detector screen intensity texture' );
      }

      cache.intensityCanvas = intensityCanvas;
      cache.intensityContext = intensityContext;
      imageData = null;
    }
    if ( !imageData || imageData.width !== 1 || imageData.height !== this.faceTextureHeight ) {
      imageData = intensityContext.createImageData( 1, this.faceTextureHeight );
      cache.intensityImageData = imageData;
    }
    const data = imageData.data;
    const rgbRed = rgb.r;
    const rgbGreen = rgb.g;
    const rgbBlue = rgb.b;
    const lastDistributionIndex = distributionLength - 1;

    for ( let y = 0; y < this.faceTextureHeight; y++ ) {
      const pixelIndex = y * 4;
      const faceY = ( y + 0.5 ) / this.faceTextureHeight * this.faceHeight;

      // NOTE: This is purposefully duplicated with sampleIntensityDistribution + getInterpolatedRGB
      // Because this is the most important inner loop and very performance sensitive.
      let patternIntensity: number;
      if ( distributionLength === 0 ) {
        patternIntensity = 0;
      }
      else if ( distributionLength === 1 ) {
        patternIntensity = distribution[ 0 ];
      }
      else {
        const sampleIndex = faceY / this.faceHeight * distributionLength - 0.5;
        if ( sampleIndex <= 0 ) {
          patternIntensity = distribution[ 0 ];
        }
        else if ( sampleIndex >= lastDistributionIndex ) {
          patternIntensity = distribution[ lastDistributionIndex ];
        }
        else {
          const lowerIndex = Math.floor( sampleIndex );
          const upperWeight = sampleIndex - lowerIndex;
          patternIntensity = distribution[ lowerIndex ] +
                             ( distribution[ lowerIndex + 1 ] - distribution[ lowerIndex ] ) * upperWeight;
        }
      }

      // Simulate detector exposure: brightness and contrast both ramp up so the normalized intensity
      // pattern does not appear fully formed as soon as the first average is available.
      const exposedIntensity = ( meanIntensity + ( patternIntensity - meanIntensity ) * exposureFactor ) *
                               exposureFactor;
      const colorFraction = exposedIntensity * displayGain;

      if ( colorFraction < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
        data[ pixelIndex ] = backgroundRGB.r;
        data[ pixelIndex + 1 ] = backgroundRGB.g;
        data[ pixelIndex + 2 ] = backgroundRGB.b;
      }
      else {
        const clampedFraction = colorFraction > 1 ? 1 : colorFraction;
        data[ pixelIndex ] = Math.round( backgroundRGB.r + ( rgbRed - backgroundRGB.r ) * clampedFraction ); // eslint-disable-line phet/bad-sim-text
        data[ pixelIndex + 1 ] = Math.round( backgroundRGB.g + ( rgbGreen - backgroundRGB.g ) * clampedFraction ); // eslint-disable-line phet/bad-sim-text
        data[ pixelIndex + 2 ] = Math.round( backgroundRGB.b + ( rgbBlue - backgroundRGB.b ) * clampedFraction ); // eslint-disable-line phet/bad-sim-text
      }
      data[ pixelIndex + 3 ] = 255;
    }

    intensityContext.putImageData( imageData, 0, 0 );

    context.imageSmoothingEnabled = true;
    context.drawImage( intensityCanvas, 0, 0, 1, this.faceTextureHeight, 0, 0, this.textureWidth, this.faceHeight );
  }

  private rgbToRGBA( rgb: { r: number; g: number; b: number }, alpha: number ): string {
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }

  private fillCircle(
    context: CanvasRenderingContext2D,
    rgb: { r: number; g: number; b: number },
    alpha: number,
    center: number,
    radius: number
  ): void {
    context.fillStyle = this.rgbToRGBA( rgb, alpha );
    context.beginPath();
    context.arc( center, center, radius, 0, Math.PI * 2 );
    context.fill();
  }

  /**
   * Returns a cached hit-dot sprite canvas for the given visual parameters. If the parameters match the cached
   * sprite it is returned immediately; otherwise a new sprite is rendered (outer glow circle + solid core circle)
   * and stored in the cache for reuse across all hits in the current frame.
   */
  private getHitSprite(
    cache: DetectorScreenHitRenderCache,
    rgb: { r: number; g: number; b: number },
    coreAlpha: number,
    glowAlpha: number,
    glowRadius: number
  ): HTMLCanvasElement {

    if ( cache.hitSprite && detectorScreenHitSpriteParamsMatch(
      cache.hitSpriteParams,
      rgb,
      coreAlpha,
      glowAlpha,
      glowRadius,
      this.hitCoreRadius,
      this.hitSpriteCenter
    ) ) {
      return cache.hitSprite;
    }

    const spriteCanvas = document.createElement( 'canvas' );
    spriteCanvas.width = this.hitSpriteSize;
    spriteCanvas.height = this.hitSpriteSize;
    const ctx = spriteCanvas.getContext( '2d' )!;

    if ( glowAlpha > 0 ) {
      this.fillCircle( ctx, rgb, glowAlpha, this.hitSpriteCenter, glowRadius );
    }

    this.fillCircle( ctx, rgb, coreAlpha, this.hitSpriteCenter, this.hitCoreRadius );

    cache.hitSprite = spriteCanvas;
    cache.hitSpriteParams = createDetectorScreenHitSpriteParams(
      rgb,
      coreAlpha,
      glowAlpha,
      glowRadius,
      this.hitCoreRadius,
      this.hitSpriteCenter
    );
    return spriteCanvas;
  }
}
