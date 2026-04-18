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
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import { type SourceType } from '../model/SourceType.js';
import type WaveSolver from '../model/WaveSolver.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getSceneRGB, PERCEPTUAL_VISIBILITY_THRESHOLD } from './ScreenBrightnessUtils.js';

const SUPERSAMPLE = 2;
const MAX_RENDERED_HITS = 10000;
const HIT_SIZE_SCALE = 1.4;

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
  hitSprite: HTMLCanvasElement | null;
  hitSpriteParams: { r: number; g: number; b: number; coreAlpha: number; glowAlpha: number; glowRadius: number } | null;
};

export default class DetectorScreenTextureRenderer {

  private readonly textureWidth: number;
  private readonly textureHeight: number;
  private readonly skewOffset: number;
  private readonly faceHeight: number;
  private readonly hitCoreRadius: number;
  private readonly hitGlowRadius: number;
  private readonly cacheMap = new WeakMap<DetectorScreenSceneLike, TextureCache>();

  public constructor( screenWidth: number, screenHeight: number, skew = 0 ) {
    this.textureWidth = screenWidth * SUPERSAMPLE;
    this.textureHeight = screenHeight * SUPERSAMPLE;
    this.skewOffset = skew * SUPERSAMPLE;
    this.faceHeight = ( screenHeight - skew ) * SUPERSAMPLE;
    this.hitCoreRadius = BASE_HIT_CORE_RADIUS * SUPERSAMPLE * HIT_SIZE_SCALE;
    this.hitGlowRadius = BASE_HIT_GLOW_RADIUS * SUPERSAMPLE * HIT_SIZE_SCALE;
  }

  public getTexture( scene: DetectorScreenSceneLike ): HTMLCanvasElement {
    let cache = this.cacheMap.get( scene );
    if ( !cache ) {
      cache = this.createCache( scene );
      this.cacheMap.set( scene, cache );
    }

    // In intensity mode, the solver distribution updates every frame, so always re-render
    const detectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    if ( cache.dirty || detectionMode === 'averageIntensity' ) {
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
      hitSprite: null,
      hitSpriteParams: null
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

    return cache;
  }

  private renderTexture( cache: TextureCache, scene: DetectorScreenSceneLike ): void {
    const context = cache.context;
    const currentBrightness = scene.screenBrightnessProperty.value;
    const currentWavelength = scene.wavelengthProperty.value;
    const currentDetectionMode = scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
    const currentIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
    const currentIsEmitting = scene.isEmittingProperty.value;

    const paramsChanged = cache.lastBrightness !== currentBrightness ||
                          cache.lastWavelength !== currentWavelength ||
                          cache.lastDetectionMode !== currentDetectionMode ||
                          cache.lastIntensity !== currentIntensity ||
                          cache.lastIsEmitting !== currentIsEmitting;

    if ( paramsChanged ) {
      cache.lastRenderedHitCount = 0;
      cache.hitSprite = null;
      cache.hitSpriteParams = null;
      context.clearRect( 0, 0, this.textureWidth, this.textureHeight );

      cache.lastBrightness = currentBrightness;
      cache.lastWavelength = currentWavelength;
      cache.lastDetectionMode = currentDetectionMode;
      cache.lastIntensity = currentIntensity;
      cache.lastIsEmitting = currentIsEmitting;
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
      this.paintIntensity( context, scene, intensityDisplayGain );
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
    const spriteHalfW = sprite.width / 2;
    const spriteHalfH = sprite.height / 2;

    const hitCount = hits.length;
    const renderCount = Math.min( hitCount, MAX_RENDERED_HITS );
    const startIndex = hitCount - renderCount;

    const alreadyRendered = cache.lastRenderedHitCount;
    const needsFullRepaint = alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
    const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

    if ( needsFullRepaint ) {
      context.clearRect( 0, 0, this.textureWidth, this.textureHeight );
    }

    for ( let i = incrementalStart; i < hitCount; i++ ) {
      const hit = hits[ i ];

      const viewX = ( ( hit.y + 1 ) / 2 ) * this.textureWidth;
      const topEdge = this.skewOffset * ( 1 - viewX / this.textureWidth );
      const viewY = topEdge + ( ( hit.x + 1 ) / 2 ) * this.faceHeight;
      context.drawImage( sprite, viewX - spriteHalfW, viewY - spriteHalfH );
    }

    cache.lastRenderedHitCount = hitCount;
  }

  private paintIntensity(
    context: CanvasRenderingContext2D,
    scene: DetectorScreenSceneLike,
    displayGain: number
  ): void {
    const rgb = getSceneRGB( scene.sourceType, scene.wavelengthProperty.value );
    const distribution = scene.waveSolver.getDetectorProbabilityDistribution();
    const solverHeight = scene.waveSolver.gridHeight;

    for ( let y = 0; y < this.textureHeight; y++ ) {
      const detectorY = y - this.skewOffset / 2;
      const solverY = clamp( Math.floor( ( detectorY + 0.5 ) / this.faceHeight * solverHeight ), 0, solverHeight - 1 );
      const intensity = distribution[ solverY ];
      const scale = intensity * displayGain;

      if ( scale < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
        continue;
      }

      const r = clamp( roundSymmetric( rgb.r * scale ), 0, 255 );
      const g = clamp( roundSymmetric( rgb.g * scale ), 0, 255 );
      const b = clamp( roundSymmetric( rgb.b * scale ), 0, 255 );
      context.fillStyle = `rgb(${r},${g},${b})`;
      context.fillRect( 0, y, this.textureWidth, 1 );
    }
  }

  private getHitSprite(
    cache: TextureCache,
    rgb: { r: number; g: number; b: number },
    coreAlpha: number,
    glowAlpha: number,
    glowRadius: number
  ): HTMLCanvasElement {

    if ( cache.hitSprite && cache.hitSpriteParams &&
         cache.hitSpriteParams.r === rgb.r &&
         cache.hitSpriteParams.g === rgb.g &&
         cache.hitSpriteParams.b === rgb.b &&
         cache.hitSpriteParams.coreAlpha === coreAlpha &&
         cache.hitSpriteParams.glowAlpha === glowAlpha &&
         cache.hitSpriteParams.glowRadius === glowRadius ) {
      return cache.hitSprite;
    }

    const maxRadius = Math.max( glowRadius, this.hitCoreRadius );
    const size = Math.ceil( maxRadius * 2 ) + 2;
    const center = size / 2;

    const spriteCanvas = document.createElement( 'canvas' );
    spriteCanvas.width = size;
    spriteCanvas.height = size;
    const ctx = spriteCanvas.getContext( '2d' )!;

    if ( glowAlpha > 0 ) {
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${glowAlpha})`;
      ctx.beginPath();
      ctx.arc( center, center, glowRadius, 0, Math.PI * 2 );
      ctx.fill();
    }

    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${coreAlpha})`;
    ctx.beginPath();
    ctx.arc( center, center, this.hitCoreRadius, 0, Math.PI * 2 );
    ctx.fill();

    cache.hitSprite = spriteCanvas;
    cache.hitSpriteParams = { r: rgb.r, g: rgb.g, b: rgb.b, coreAlpha: coreAlpha, glowAlpha: glowAlpha, glowRadius: glowRadius };
    return spriteCanvas;
  }
}
