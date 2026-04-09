// Copyright 2026, University of Colorado Boulder

/**
 * Provides a shared per-scene detector-screen texture. The texture is rendered with the same logic used by the
 * front-facing detector screen, so other views (e.g. overhead) can display identical graphics by drawing the same
 * cached image with different transforms.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import { getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getSceneRGB } from './ScreenBrightnessUtils.js';

const SCREEN_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;

// Supersample factor: render the texture at 2x resolution for crisper hit dots on the front-facing detector screen.
// Consumers draw the texture with drawImage(..., destW, destH) which naturally downscales,
// producing smoother results similar to the snapshot dialog.
const SUPERSAMPLE = 2;
const TEXTURE_WIDTH = SCREEN_WIDTH * SUPERSAMPLE;
const TEXTURE_HEIGHT = SCREEN_HEIGHT * SUPERSAMPLE;

// Hit dot rendering parameters (in texture-space, i.e. scaled by SUPERSAMPLE).
const HIT_CORE_RADIUS = 2.0 * SUPERSAMPLE;
const HIT_GLOW_RADIUS = 3.4 * SUPERSAMPLE;

type SceneTextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;

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
  hitSpriteParams: { r: number; g: number; b: number; coreAlpha: number; glowAlpha: number; glowRadius: number } | null;
};

const sceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();

// Log once when the render cap is reached, so QA/designers know why new dots stop appearing.
let hasLoggedRenderCap = false;

/**
 * Creates (or returns a cached) hit sprite — a small offscreen canvas with the glow ring and solid core pre-rendered.
 * Using drawImage per hit instead of beginPath/arc/fill avoids path tessellation and is typically 3-5× faster.
 */
const getHitSprite = (
  cache: SceneTextureCache,
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number
): HTMLCanvasElement => {

  // Return cached sprite if parameters haven't changed.
  if ( cache.hitSprite && cache.hitSpriteParams &&
       cache.hitSpriteParams.r === rgb.r &&
       cache.hitSpriteParams.g === rgb.g &&
       cache.hitSpriteParams.b === rgb.b &&
       cache.hitSpriteParams.coreAlpha === coreAlpha &&
       cache.hitSpriteParams.glowAlpha === glowAlpha &&
       cache.hitSpriteParams.glowRadius === glowRadius ) {
    return cache.hitSprite;
  }

  const maxRadius = Math.max( glowRadius, HIT_CORE_RADIUS );
  // Pad by 1 px so antialiased edges aren't clipped.
  const size = Math.ceil( maxRadius * 2 ) + 2;
  const center = size / 2;

  const spriteCanvas = document.createElement( 'canvas' );
  spriteCanvas.width = size;
  spriteCanvas.height = size;
  const ctx = spriteCanvas.getContext( '2d' )!;

  // Draw glow circle first (larger, semi-transparent).
  if ( glowAlpha > 0 ) {
    ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${glowAlpha})`;
    ctx.beginPath();
    ctx.arc( center, center, glowRadius, 0, Math.PI * 2 );
    ctx.fill();
  }

  // Draw core circle on top (smaller, more opaque).
  ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${coreAlpha})`;
  ctx.beginPath();
  ctx.arc( center, center, HIT_CORE_RADIUS, 0, Math.PI * 2 );
  ctx.fill();

  cache.hitSprite = spriteCanvas;
  cache.hitSpriteParams = { r: rgb.r, g: rgb.g, b: rgb.b, coreAlpha: coreAlpha, glowAlpha: glowAlpha, glowRadius: glowRadius };
  return spriteCanvas;
};

/**
 * Paints hits onto the cache canvas. When possible, only new hits (those added since the last render) are blitted,
 * making the per-frame cost O(new hits) ≈ 1–6 instead of O(total hits).
 */
const paintHits = (
  cache: SceneTextureCache,
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number,
  brightnessFraction: number
): void => {
  const hits = sceneModel.hits;
  if ( hits.length === 0 ) {
    hasLoggedRenderCap = false;
    if ( cache.lastRenderedHitCount > 0 ) {
      context.clearRect( 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT );
    }
    cache.lastRenderedHitCount = 0;
    return;
  }

  const rgb = getSceneRGB( sceneModel );
  const coreAlpha = getHitsCoreAlpha( brightnessFraction );
  const glowAlpha = getHitsGlowAlpha( brightnessFraction );
  const glowRadius = HIT_GLOW_RADIUS * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

  const sprite = getHitSprite( cache, rgb, coreAlpha, glowAlpha, glowRadius );
  const spriteHalfW = sprite.width / 2;
  const spriteHalfH = sprite.height / 2;

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
    context.clearRect( 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT );
  }

  for ( let i = incrementalStart; i < hitCount; i++ ) {
    const hit = hits[ i ];
    const viewX = ( ( hit.x + 1 ) / 2 ) * TEXTURE_WIDTH;
    const viewY = ( ( hit.y + 1 ) / 2 ) * TEXTURE_HEIGHT;
    context.drawImage( sprite, viewX - spriteHalfW, viewY - spriteHalfH );
  }

  cache.lastRenderedHitCount = hitCount;
};

const paintIntensity = (
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number
): void => {
  // Intensity mode shows the instantaneous theoretical pattern whenever the source is emitting.
  if ( !sceneModel.isEmittingProperty.value ) {
    return;
  }

  const screenHalfWidth = sceneModel.screenHalfWidth;
  const rgb = getSceneRGB( sceneModel );

  for ( let x = 0; x < TEXTURE_WIDTH; x++ ) {
    const fraction = ( x + 0.5 ) / TEXTURE_WIDTH;
    const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
    const intensity = sceneModel.getIntensityAtPosition( physicalX );
    const scale = intensity * displayGain;

    // Skip bands below perceptual visibility to avoid painting nearly-black pixels
    if ( scale < 0.004 ) {
      continue;
    }

    const r = clamp( roundSymmetric( rgb.r * scale ), 0, 255 );
    const g = clamp( roundSymmetric( rgb.g * scale ), 0, 255 );
    const b = clamp( roundSymmetric( rgb.b * scale ), 0, 255 );
    context.fillStyle = `rgb(${r},${g},${b})`;
    context.fillRect( x, 0, 1, TEXTURE_HEIGHT );
  }
};

const renderSceneTexture = ( cache: SceneTextureCache, sceneModel: SceneModel ): void => {
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
    cache.lastRenderedHitCount = 0;
    cache.hitSprite = null;
    cache.hitSpriteParams = null;
    context.clearRect( 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT );

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
    // Intensity mode always redraws fully (it's O(TEXTURE_WIDTH) ≈ 560 iterations, already fast).
    context.clearRect( 0, 0, TEXTURE_WIDTH, TEXTURE_HEIGHT );
    paintIntensity( context, sceneModel, intensityDisplayGain );
  }

  cache.dirty = false;
};

const createSceneTextureCache = ( sceneModel: SceneModel ): SceneTextureCache => {
  const canvas = document.createElement( 'canvas' );
  canvas.width = TEXTURE_WIDTH;
  canvas.height = TEXTURE_HEIGHT;

  const context = canvas.getContext( '2d' );
  if ( !context ) {
    throw new Error( 'Could not create 2D context for detector screen texture cache' );
  }

  const cache: SceneTextureCache = {
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

  const markDirty = () => {
    cache.dirty = true;
  };

  sceneModel.hitsChangedEmitter.addListener( markDirty );
  sceneModel.isEmittingProperty.link( markDirty );
  sceneModel.detectionModeProperty.link( markDirty );
  sceneModel.screenBrightnessProperty.link( markDirty );
  sceneModel.intensityProperty.link( markDirty );
  sceneModel.wavelengthProperty.link( markDirty );

  return cache;
};

/**
 * Gets the shared detector-screen texture for the specified scene, rendering it lazily on demand.
 */
function getDetectorScreenTexture( sceneModel: SceneModel ): HTMLCanvasElement {
  let cache = sceneTextureMap.get( sceneModel );
  if ( !cache ) {
    cache = createSceneTextureCache( sceneModel );
    sceneTextureMap.set( sceneModel, cache );
  }

  if ( cache.dirty ) {
    renderSceneTexture( cache, sceneModel );
  }

  return cache.canvas;
}

export default getDetectorScreenTexture;
