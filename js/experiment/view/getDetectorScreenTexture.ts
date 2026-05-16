// Copyright 2026, University of Colorado Boulder

/**
 * Provides a shared per-scene detector-screen texture. The texture is rendered with the same logic used by the
 * front-facing detector screen, so other views (e.g. overhead) can display identical graphics by drawing the same
 * cached image with different transforms.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { getApparentAnalyticalDetectorIntensity } from '../../common/view/ApparentDetectorPattern.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getSceneRGB, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER, PERCEPTUAL_VISIBILITY_THRESHOLD } from '../../common/view/ScreenBrightnessUtils.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../model/DetectorScreenScale.js';
import SceneModel from '../model/SceneModel.js';

const SCREEN_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;

// Target displayed supersample factor for the front-facing detector screen. The backing texture scales with the
// front-facing zoom so the cropped visible region is still downsampled by this factor at every zoom level.
const SUPERSAMPLE = 2;

type SceneTextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;
  renderScale: number;
  textureWidth: number;
  textureHeight: number;

  // Persistent-canvas optimization: track how many hits have already been painted so incremental frames only blit
  // the new ones. When rendering parameters change (brightness, wavelength, mode) we set lastRenderedHitCount to 0
  // to force a full repaint.
  lastRenderedHitCount: number;

  // The parameters that were used for the last render, so we can detect when a full repaint is needed vs an
  // incremental blit.
  lastBrightness: number;
  lastWavelength: number;
  lastDetectionMode: string;
  lastIntensity: number;
  lastIsEmitting: boolean;

  // Cached hit sprite (small offscreen canvas with glow + core pre-rendered). Invalidated when brightness or color
  // changes.
  hitSprite: HTMLCanvasElement | null;
  hitSpriteParams: HitSpriteParams | null;
};

type HitSpriteParams = {
  r: number;
  g: number;
  b: number;
  coreAlpha: number;
  glowAlpha: number;
  glowRadius: number;
};

// Top-level cache keyed by SceneModel so each scene keeps its own full detector texture.
// WeakMap prevents the cache from extending a scene's lifetime: if a SceneModel becomes unreachable,
// its full-screen texture cache can be garbage collected with it.
//
// Cached textures should not go stale during normal use. Each SceneTextureCache registers listeners on the scene
// that mark it dirty whenever rendering inputs change, and the texture is lazily repainted on the next request.
const sceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();

// Log once when the render cap is reached, so QA/designers know why new dots stop appearing.
let hasLoggedRenderCap = false;

// True when an existing cached hit sprite can be reused for the current source color and brightness settings.
function hitSpriteParamsMatch(
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

function rgbToRGBA( rgb: { r: number; g: number; b: number }, alpha: number ): string {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

function fillCircle(
  context: CanvasRenderingContext2D,
  rgb: { r: number; g: number; b: number },
  alpha: number,
  center: number,
  radius: number
): void {
  context.fillStyle = rgbToRGBA( rgb, alpha );
  context.beginPath();
  context.arc( center, center, radius, 0, Math.PI * 2 );
  context.fill();
}

function getScaledRGBFillStyle( rgb: { r: number; g: number; b: number }, scale: number ): string | null {
  if ( scale < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
    return null;
  }

  const r = clamp( roundSymmetric( rgb.r * scale ), 0, 255 );
  const g = clamp( roundSymmetric( rgb.g * scale ), 0, 255 );
  const b = clamp( roundSymmetric( rgb.b * scale ), 0, 255 );
  return `rgb(${r},${g},${b})`;
}

function getTextureRenderScale(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): number {
  const visibleFraction = getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value ) /
                          sceneModel.fullScreenHalfWidth;
  return SUPERSAMPLE / visibleFraction;
}

function getHitSpriteCenter( renderScale: number ): number {
  const hitCoreRadius = BASE_HIT_CORE_RADIUS * renderScale;

  // Reserve enough canvas space for the largest glow possible at this render scale. This keeps the sprite size stable
  // across brightness changes, so hit placement does not shift when the sprite is regenerated.
  const maxGlowRadius = BASE_HIT_GLOW_RADIUS * renderScale *
                        Math.min( 2, Math.sqrt( Math.max( 1, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER ) ) );

  // Fixed integer anchor for all brightness values at this render scale, plus 1 px antialiasing padding.
  return Math.ceil( Math.max( hitCoreRadius, maxGlowRadius ) ) + 1;
}

function resetCacheRenderingState( cache: SceneTextureCache ): void {
  cache.lastRenderedHitCount = 0;
  cache.hitSprite = null;
  cache.hitSpriteParams = null;
}

function updateCacheTextureSize(
  cache: SceneTextureCache,
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): void {
  const renderScale = getTextureRenderScale( sceneModel, detectorScreenScaleIndexProperty );

  if ( cache.renderScale === renderScale ) {
    return;
  }

  cache.renderScale = renderScale;
  cache.textureWidth = Math.ceil( SCREEN_WIDTH * renderScale );
  cache.textureHeight = Math.ceil( SCREEN_HEIGHT * renderScale );
  cache.canvas.width = cache.textureWidth;
  cache.canvas.height = cache.textureHeight;

  // Resizing the canvas clears the context, so all hits must be repainted at the new resolution.
  resetCacheRenderingState( cache );
  cache.dirty = true;
}

/**
 * Creates (or returns a cached) hit sprite — a small offscreen canvas with the glow ring and solid core pre-rendered.
 * Using drawImage per hit instead of beginPath/arc/fill avoids path tessellation and is typically 3-5× faster.
 */
function getHitSprite(
  cache: SceneTextureCache,
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number
): HTMLCanvasElement {

  // Return cached sprite if parameters haven't changed.
  if ( cache.hitSprite && hitSpriteParamsMatch( cache.hitSpriteParams, rgb, coreAlpha, glowAlpha, glowRadius ) ) {
    return cache.hitSprite;
  }

  const hitCoreRadius = BASE_HIT_CORE_RADIUS * cache.renderScale;
  const center = getHitSpriteCenter( cache.renderScale );
  const size = center * 2;

  const spriteCanvas = document.createElement( 'canvas' );
  spriteCanvas.width = size;
  spriteCanvas.height = size;
  const ctx = spriteCanvas.getContext( '2d' )!;

  // Draw glow circle first (larger, semi-transparent).
  if ( glowAlpha > 0 ) {
    fillCircle( ctx, rgb, glowAlpha, center, glowRadius );
  }

  // Draw core circle on top (smaller, more opaque).
  fillCircle( ctx, rgb, coreAlpha, center, hitCoreRadius );

  cache.hitSprite = spriteCanvas;
  cache.hitSpriteParams = { r: rgb.r, g: rgb.g, b: rgb.b, coreAlpha: coreAlpha, glowAlpha: glowAlpha, glowRadius: glowRadius };
  return spriteCanvas;
}

/**
 * Paints hits onto the cache canvas. When possible, only new hits (those added since the last render) are blitted,
 * making the per-frame cost O(new hits) ≈ 1–6 instead of O(total hits).
 */
function paintHits(
  cache: SceneTextureCache,
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number,
  brightnessFraction: number
): void {
  const hits = sceneModel.hits;
  if ( hits.length === 0 ) {
    hasLoggedRenderCap = false;
    if ( cache.lastRenderedHitCount > 0 ) {
      context.clearRect( 0, 0, cache.textureWidth, cache.textureHeight );
    }
    cache.lastRenderedHitCount = 0;
    return;
  }

  const rgb = getSceneRGB( sceneModel.sourceType, sceneModel.wavelengthProperty.value );
  const coreAlpha = getHitsCoreAlpha( brightnessFraction );
  const glowAlpha = getHitsGlowAlpha( brightnessFraction );
  const glowRadius = BASE_HIT_GLOW_RADIUS * cache.renderScale * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

  const sprite = getHitSprite( cache, rgb, coreAlpha, glowAlpha, glowRadius );
  const spriteCenter = getHitSpriteCenter( cache.renderScale );

  const hitCount = hits.length;
  const renderCount = Math.min( hitCount, ExperimentConstants.MAX_HITS );
  const startIndex = hitCount - renderCount;

  if ( renderCount >= ExperimentConstants.MAX_HITS && !hasLoggedRenderCap ) {
    hasLoggedRenderCap = true;
    phet.log && phet.log(
      `[DetectorScreen] Render cap reached: only the most recent ${ExperimentConstants.MAX_HITS} hits are drawn. Hit counter continues to accumulate.`
    );
  }

  // Determine the range of hits that still need to be drawn.
  // If the cache already has some hits rendered (from a previous frame), skip those.
  const alreadyRendered = cache.lastRenderedHitCount;

  // If hits were trimmed (array splice in SceneModel.step), the previously rendered hits may no longer be at the same
  // indices. Detect this and force a full repaint.
  const needsFullRepaint = alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
  const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

  if ( needsFullRepaint ) {
    context.clearRect( 0, 0, cache.textureWidth, cache.textureHeight );
  }

  for ( let i = incrementalStart; i < hitCount; i++ ) {
    const hit = hits[ i ];
    const viewX = ( ( hit.x + 1 ) / 2 ) * cache.textureWidth;
    const viewY = ( ( hit.y + 1 ) / 2 ) * cache.textureHeight;
    context.drawImage( sprite, viewX - spriteCenter, viewY - spriteCenter );
  }

  cache.lastRenderedHitCount = hitCount;
}

function paintIntensity(
  cache: SceneTextureCache,
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number
): void {
  // Intensity mode shows the instantaneous theoretical pattern whenever the source is emitting.
  if ( !sceneModel.isEmittingProperty.value ) {
    return;
  }

  const rgb = getSceneRGB( sceneModel.sourceType, sceneModel.wavelengthProperty.value );

  // The texture spans the full detector width, which is twice the model's fullScreenHalfWidth.
  const sampleWidthOnScreen = 2 * sceneModel.fullScreenHalfWidth / cache.textureWidth;
  const effectiveWavelength = sceneModel.getEffectiveWavelength();
  const screenDistance = sceneModel.screenDistanceProperty.value;
  const slitWidth = sceneModel.slitWidth * 1e-3;
  const slitSeparation = sceneModel.slitSeparationProperty.value * 1e-3;
  const slitSetting = sceneModel.slitSettingProperty.value;

  for ( let x = 0; x < cache.textureWidth; x++ ) {
    const fraction = ( x + 0.5 ) / cache.textureWidth;
    const physicalX = ( fraction - 0.5 ) * 2 * sceneModel.fullScreenHalfWidth;
    const intensity = getApparentAnalyticalDetectorIntensity( {
      positionOnScreen: physicalX,
      sampleWidthOnScreen: sampleWidthOnScreen,
      effectiveWavelength: effectiveWavelength,
      screenDistance: screenDistance,
      slitWidth: slitWidth,
      slitSeparation: slitSeparation,
      slitSetting: slitSetting
    } );
    const fillStyle = getScaledRGBFillStyle( rgb, intensity * displayGain );

    // Skip bands below perceptual visibility to avoid painting nearly-black pixels
    if ( !fillStyle ) {
      continue;
    }

    context.fillStyle = fillStyle;
    context.fillRect( x, 0, 1, cache.textureHeight );
  }
}

function renderSceneTexture(
  cache: SceneTextureCache,
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): void {
  updateCacheTextureSize( cache, sceneModel, detectorScreenScaleIndexProperty );

  const context = cache.context;

  const currentBrightness = sceneModel.screenBrightnessProperty.value;
  const currentWavelength = sceneModel.wavelengthProperty.value;
  const currentDetectionMode = sceneModel.detectionModeProperty.value;
  const currentIntensity = sceneModel.intensityProperty.value;
  const currentIsEmitting = sceneModel.isEmittingProperty.value;

  // Detect whether rendering parameters changed (requiring a full repaint of all hits) vs only new hits were added
  // (allowing an incremental blit).
  const paramsChanged = cache.lastBrightness !== currentBrightness ||
                        cache.lastWavelength !== currentWavelength ||
                        cache.lastDetectionMode !== currentDetectionMode ||
                        cache.lastIntensity !== currentIntensity ||
                        cache.lastIsEmitting !== currentIsEmitting;

  if ( paramsChanged ) {
    // Force full repaint by resetting the incremental counter and clearing the sprite cache.
    resetCacheRenderingState( cache );
    context.clearRect( 0, 0, cache.textureWidth, cache.textureHeight );

    cache.lastBrightness = currentBrightness;
    cache.lastWavelength = currentWavelength;
    cache.lastDetectionMode = currentDetectionMode;
    cache.lastIntensity = currentIntensity;
    cache.lastIsEmitting = currentIsEmitting;
  }

  const hitsDisplayGain = getHitsDisplayGain(
    currentBrightness,
    sceneModel.screenBrightnessProperty.range.max
  );
  const hitsBrightnessFractionValue = getHitsBrightnessFraction( currentBrightness );
  const intensityDisplayGain = getIntensityDisplayGain( currentBrightness, currentIntensity );

  if ( currentDetectionMode === 'hits' ) {
    paintHits( cache, context, sceneModel, hitsDisplayGain, hitsBrightnessFractionValue );
  }
  else {
    // Intensity mode always redraws fully (it's O(textureWidth), already fast).
    context.clearRect( 0, 0, cache.textureWidth, cache.textureHeight );
    paintIntensity( cache, context, sceneModel, intensityDisplayGain );
  }

  cache.dirty = false;
}

function createSceneTextureCache(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): SceneTextureCache {
  const renderScale = getTextureRenderScale( sceneModel, detectorScreenScaleIndexProperty );
  const textureWidth = Math.ceil( SCREEN_WIDTH * renderScale );
  const textureHeight = Math.ceil( SCREEN_HEIGHT * renderScale );

  const canvas = document.createElement( 'canvas' );
  canvas.width = textureWidth;
  canvas.height = textureHeight;

  const context = canvas.getContext( '2d' );
  if ( !context ) {
    throw new Error( 'Could not create 2D context for detector screen texture cache' );
  }

  const cache: SceneTextureCache = {
    canvas: canvas,
    context: context,
    dirty: true,
    renderScale: renderScale,
    textureWidth: textureWidth,
    textureHeight: textureHeight,
    lastRenderedHitCount: 0,
    lastBrightness: -1,
    lastWavelength: -1,
    lastDetectionMode: '',
    lastIntensity: -1,
    lastIsEmitting: false,
    hitSprite: null,
    hitSpriteParams: null
  };

  const markDirty = () => {
    cache.dirty = true;
  };

  sceneModel.hitsChangedEmitter.addListener( markDirty );
  sceneModel.isEmittingProperty.link( markDirty );
  sceneModel.detectionModeProperty.link( markDirty );
  sceneModel.screenBrightnessProperty.link( markDirty );
  sceneModel.intensityProperty.link( markDirty );
  sceneModel.wavelengthProperty.link( markDirty );
  sceneModel.velocityProperty.link( markDirty );
  sceneModel.slitSeparationProperty.link( markDirty );
  sceneModel.screenDistanceProperty.link( markDirty );
  sceneModel.slitSettingProperty.link( markDirty );

  return cache;
}

/**
 * Gets the shared full detector-screen texture for the specified scene, rendering it lazily on demand.
 */
function getDetectorScreenTexture(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): HTMLCanvasElement {
  let cache = sceneTextureMap.get( sceneModel );
  if ( !cache ) {
    cache = createSceneTextureCache( sceneModel, detectorScreenScaleIndexProperty );
    sceneTextureMap.set( sceneModel, cache );
  }

  updateCacheTextureSize( cache, sceneModel, detectorScreenScaleIndexProperty );

  if ( cache.dirty ) {
    renderSceneTexture( cache, sceneModel, detectorScreenScaleIndexProperty );
  }

  return cache.canvas;
}

export default getDetectorScreenTexture;
