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
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getInterpolatedRGB, getSceneRGB, getWaveAndDetectorBackgroundRGB, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER, sampleIntensityDistribution } from './ScreenBrightnessUtils.js';

const SUPERSAMPLE = 2;
const MAX_RENDERED_HITS = 10000;
const HIT_SIZE_SCALE = 1.2;

export type DetectorScreenSceneLike = {
  hits: Vector2[];
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  screenBrightnessProperty: TReadOnlyProperty<number> & { range: { max: number } };
  isEmittingProperty: TReadOnlyProperty<boolean>;
  hitsChangedEmitter: TEmitter;
  waveSolver: WaveSolver;
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  intensityProperty?: TReadOnlyProperty<number>;
  detectorPatternFormationFactorProperty?: TReadOnlyProperty<number>;
};

type TextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;
  lastRenderedHitCount: number;
  lastBrightness: number;
  lastWavelength: number;
  lastDetectionMode: string;
  lastIntensity: number;
  lastIsEmitting: boolean;
  lastRampFactor: number;
  hitSprite: HTMLCanvasElement | null;
  hitSpriteParams: HitSpriteParams | null;
  intensityImageData: ImageData | null;
};

type HitSpriteParams = {
  r: number;
  g: number;
  b: number;
  coreAlpha: number;
  glowAlpha: number;
  glowRadius: number;
};

export default class DetectorScreenTextureRenderer {

  private readonly textureWidth: number;
  private readonly textureHeight: number;
  private readonly skewOffset: number;
  private readonly faceHeight: number;
  private readonly hitCoreRadius: number;
  private readonly hitGlowRadius: number;
  private readonly hitSpriteCenter: number;
  private readonly hitSpriteSize: number;
  private readonly cacheMap = new WeakMap<DetectorScreenSceneLike, TextureCache>();

  public constructor( screenWidth: number, screenHeight: number, skew = 0 ) {
    this.textureWidth = screenWidth * SUPERSAMPLE;
    this.textureHeight = screenHeight * SUPERSAMPLE;
    this.skewOffset = skew * SUPERSAMPLE;
    this.faceHeight = ( screenHeight - skew ) * SUPERSAMPLE;
    this.hitCoreRadius = BASE_HIT_CORE_RADIUS * SUPERSAMPLE * HIT_SIZE_SCALE;
    this.hitGlowRadius = BASE_HIT_GLOW_RADIUS * SUPERSAMPLE * HIT_SIZE_SCALE;

    const maxGlowRadius = this.hitGlowRadius *
                          Math.min( 2, Math.sqrt( Math.max( 1, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER ) ) );

    // Fixed integer anchor for all brightness values, plus 1 px antialiasing padding.
    this.hitSpriteCenter = Math.ceil( Math.max( this.hitCoreRadius, maxGlowRadius ) ) + 1;
    this.hitSpriteSize = this.hitSpriteCenter * 2;
  }

  public getTexture( scene: DetectorScreenSceneLike ): HTMLCanvasElement {
    let cache = this.cacheMap.get( scene );
    if ( !cache ) {
      cache = this.createCache( scene );
      this.cacheMap.set( scene, cache );
    }

    // In intensity mode, the solver distribution updates every frame, so always re-render
    const detectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    if ( cache.dirty || detectionMode === 'averageIntensity' || cache.lastRampFactor < 1 ) {
      this.renderTexture( cache, scene );
    }

    return cache.canvas;
  }

  private createCache( scene: DetectorScreenSceneLike ): TextureCache {
    const canvas = document.createElement( 'canvas' );
    canvas.width = this.textureWidth;
    canvas.height = this.textureHeight;

    const context = canvas.getContext( '2d' );
    if ( !context ) {
      throw new Error( 'Could not create 2D context for detector screen texture cache' );
    }

    const cache: TextureCache = {
      canvas: canvas,
      context: context,
      dirty: true,
      lastRenderedHitCount: 0,
      lastBrightness: -1,
      lastWavelength: -1,
      lastDetectionMode: '',
      lastIntensity: -1,
      lastIsEmitting: false,
      lastRampFactor: 1,
      hitSprite: null,
      hitSpriteParams: null,
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

  private renderTexture( cache: TextureCache, scene: DetectorScreenSceneLike ): void {
    const context = cache.context;
    const currentBrightness = scene.screenBrightnessProperty.value;
    const currentWavelength = scene.wavelengthProperty.value;
    const currentDetectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    const currentIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
    const currentIsEmitting = scene.isEmittingProperty.value;
    const rampFactor = currentDetectionMode === 'averageIntensity' ?
                       scene.detectorPatternFormationFactorProperty?.value ?? 1 :
                       1;

    // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 paramsChanged duplicated in getDetectorScreenTexture
    const paramsChanged = cache.lastBrightness !== currentBrightness ||
                          cache.lastWavelength !== currentWavelength ||
                          cache.lastDetectionMode !== currentDetectionMode ||
                          cache.lastIntensity !== currentIntensity ||
                          cache.lastIsEmitting !== currentIsEmitting;
    const rampFactorChanged = cache.lastRampFactor !== rampFactor;

    // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Quite a bit of duplication in this if block with getDetectorScreenTexture.ts around line 338
    if ( paramsChanged || rampFactorChanged ) {
      cache.lastRenderedHitCount = 0;
      cache.hitSprite = null;
      cache.hitSpriteParams = null;
      context.clearRect( 0, 0, this.textureWidth, this.textureHeight );

      cache.lastBrightness = currentBrightness;
      cache.lastWavelength = currentWavelength;
      cache.lastDetectionMode = currentDetectionMode;
      cache.lastIntensity = currentIntensity;
      cache.lastIsEmitting = currentIsEmitting;
      cache.lastRampFactor = rampFactor;
    }

    if ( currentDetectionMode === 'hits' ) {
      const sliderMax = scene.screenBrightnessProperty.range.max;
      const hitsDisplayGain = getHitsDisplayGain( currentBrightness, sliderMax );
      const hitsBrightnessFraction = getHitsBrightnessFraction( currentBrightness );
      this.paintHits( cache, context, scene, hitsDisplayGain, hitsBrightnessFraction );
    }
    else {
      context.clearRect( 0, 0, this.textureWidth, this.textureHeight );
      const normalizedBrightness = currentBrightness / scene.screenBrightnessProperty.range.max;
      const intensityDisplayGain = getIntensityDisplayGain( normalizedBrightness, currentIntensity );
      this.paintIntensity( cache, scene, intensityDisplayGain, rampFactor );
    }

    cache.dirty = false;
  }

  private paintHits(
    cache: TextureCache,
    context: CanvasRenderingContext2D,
    scene: DetectorScreenSceneLike,
    displayGain: number,
    brightnessFraction: number
  ): void {
    const hits = scene.hits;
    if ( hits.length === 0 ) {
      if ( cache.lastRenderedHitCount > 0 ) {
        context.clearRect( 0, 0, this.textureWidth, this.textureHeight );
      }
      cache.lastRenderedHitCount = 0;
      return;
    }

    const rgb = getSceneRGB( scene.sourceType, scene.wavelengthProperty.value );
    const coreAlpha = getHitsCoreAlpha( brightnessFraction );
    const glowAlpha = getHitsGlowAlpha( brightnessFraction );
    const glowRadius = this.hitGlowRadius * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

    const sprite = this.getHitSprite( cache, rgb, coreAlpha, glowAlpha, glowRadius );

    const hitCount = hits.length;
    const renderCount = Math.min( hitCount, MAX_RENDERED_HITS );
    const startIndex = hitCount - renderCount;

    const alreadyRendered = cache.lastRenderedHitCount;
    const needsFullRepaint = alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
    const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

    if ( needsFullRepaint ) {
      context.clearRect( 0, 0, this.textureWidth, this.textureHeight );
    }

    context.save();
    context.transform( 1, -this.skewOffset / this.textureWidth, 0, 1, 0, this.skewOffset );

    for ( let i = incrementalStart; i < hitCount; i++ ) {
      const hit = hits[ i ];

      const viewX = ( ( hit.y + 1 ) / 2 ) * this.textureWidth;
      const viewY = ( ( hit.x + 1 ) / 2 ) * this.faceHeight;
      context.drawImage( sprite, viewX - this.hitSpriteCenter, viewY - this.hitSpriteCenter );
    }

    context.restore();

    cache.lastRenderedHitCount = hitCount;
  }

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
    const averageIntensity = distributionLength > 0 ? totalIntensity / distributionLength : 0;
    let imageData = cache.intensityImageData;
    if ( !imageData || imageData.width !== this.textureWidth || imageData.height !== this.textureHeight ) {
      imageData = context.createImageData( this.textureWidth, this.textureHeight );
      cache.intensityImageData = imageData;
    }
    const data = imageData.data;
    const shear = this.skewOffset / this.textureWidth;
    const color = { r: 0, g: 0, b: 0 };

    for ( let y = 0; y < this.textureHeight; y++ ) {
      for ( let x = 0; x < this.textureWidth; x++ ) {
        const pixelIndex = ( y * this.textureWidth + x ) * 4;
        const faceY = y + 0.5 - this.skewOffset + shear * ( x + 0.5 );
        if ( faceY < 0 || faceY >= this.faceHeight ) {
          data[ pixelIndex ] = 0;
          data[ pixelIndex + 1 ] = 0;
          data[ pixelIndex + 2 ] = 0;
          data[ pixelIndex + 3 ] = 0;
          continue;
        }

        const patternIntensity = sampleIntensityDistribution( distribution, faceY / this.faceHeight );

        // Simulate detector exposure: brightness and contrast both ramp up so the normalized intensity
        // pattern does not appear fully formed as soon as the first average is available.
        const exposedIntensity = ( averageIntensity + ( patternIntensity - averageIntensity ) * exposureFactor ) *
                                 exposureFactor;
        getInterpolatedRGB( backgroundRGB, rgb, exposedIntensity * displayGain, color );

        data[ pixelIndex ] = color.r;
        data[ pixelIndex + 1 ] = color.g;
        data[ pixelIndex + 2 ] = color.b;
        data[ pixelIndex + 3 ] = 255;
      }
    }

    context.putImageData( imageData, 0, 0 );
  }

  private rgbToRGBA( rgb: { r: number; g: number; b: number }, alpha: number ): string {
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }

  // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Duplicate of hitSpriteParamsMatch in getDetectorScreenTexture.ts
  private hitSpriteParamsMatch(
    params: HitSpriteParams | null,
    rgb: { r: number; g: number; b: number },
    coreAlpha: number,
    glowAlpha: number,
    glowRadius: number
  ): params is HitSpriteParams {
    return !!params &&
           params.r === rgb.r &&
           params.g === rgb.g &&
           params.b === rgb.b &&
           params.coreAlpha === coreAlpha &&
           params.glowAlpha === glowAlpha &&
           params.glowRadius === glowRadius;
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

  private getHitSprite(
    cache: TextureCache,
    rgb: { r: number; g: number; b: number },
    coreAlpha: number,
    glowAlpha: number,
    glowRadius: number
  ): HTMLCanvasElement {

    if ( cache.hitSprite && this.hitSpriteParamsMatch( cache.hitSpriteParams, rgb, coreAlpha, glowAlpha, glowRadius ) ) {
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
    // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Identical to implementation in getDetectorScreenTexture.ts
    cache.hitSpriteParams = { r: rgb.r, g: rgb.g, b: rgb.b, coreAlpha: coreAlpha, glowAlpha: glowAlpha, glowRadius: glowRadius };
    return spriteCanvas;
  }
}
