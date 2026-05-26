// Copyright 2026, University of Colorado Boulder

/**
 * Shared renderer for Experiment detector-screen textures. It accepts frozen render-state data so live detector
 * textures and snapshot previews can render through the same code path.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// TODO: Err on the side of too much documentation instead of too little, we have to maintain and understand this file, see https://github.com/phetsims/quantum-wave-interference/issues/135

import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { getApparentAnalyticalDetectorIntensity } from './ApparentDetectorPattern.js';
import { type DetectorScreenRenderState } from './DetectorScreenRenderState.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getSceneRGB, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER, PERCEPTUAL_VISIBILITY_THRESHOLD } from './ScreenBrightnessUtils.js';

type HitSpriteParams = {
  r: number;
  g: number;
  b: number;
  coreAlpha: number;
  glowAlpha: number;
  glowRadius: number;
  hitCoreRadius: number;
  hitSpriteCenter: number;
};

export type DetectorScreenHitRenderCache = {
  lastRenderedHitCount: number;
  hitSprite: HTMLCanvasElement | null;
  hitSpriteParams: HitSpriteParams | null;
};

export type DetectorScreenRenderOptions = {
  outputWidth: number;
  outputHeight: number;
  visibleScreenHalfWidth: number;

  // Backing-canvas scale factor. Hit-dot radii scale with this and the detector zoom.
  renderScale?: number;

  // Overrides the computed hit-dot scale when the caller needs direct control.
  hitRadiusScale?: number;

  // Physical detector-screen width represented by one intensity sample. Defaults to one backing-canvas pixel. Snapshot
  // previews can pass their displayed detector sample width so supersampling does not reintroduce dense-fringe aliasing.
  intensitySampleWidthOnScreen?: number;

  // When provided, hits are drawn incrementally into a persistent canvas.
  hitRenderCache?: DetectorScreenHitRenderCache;
  maxRenderedHits?: number;
  onRenderCapReached?: () => void;
};

function hitSpriteParamsMatch(
  params: HitSpriteParams | null,
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number,
  hitCoreRadius: number,
  hitSpriteCenter: number
): params is HitSpriteParams {
  return !!params &&
         params.r === rgb.r &&
         params.g === rgb.g &&
         params.b === rgb.b &&
         params.coreAlpha === coreAlpha &&
         params.glowAlpha === glowAlpha &&
         params.glowRadius === glowRadius &&
         params.hitCoreRadius === hitCoreRadius &&
         params.hitSpriteCenter === hitSpriteCenter;
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

function getHitSpriteCenter( hitRadiusScale: number ): number {
  const hitCoreRadius = BASE_HIT_CORE_RADIUS * hitRadiusScale;

  // Reserve enough canvas space for the largest glow possible at this scale. This keeps the sprite size stable across
  // brightness changes, so hit placement does not shift when the sprite is regenerated.
  const maxGlowRadius = BASE_HIT_GLOW_RADIUS * hitRadiusScale *
                        Math.min( 2, Math.sqrt( Math.max( 1, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER ) ) );

  // Fixed integer anchor for all brightness values at this scale, plus 1 px antialiasing padding.
  return Math.ceil( Math.max( hitCoreRadius, maxGlowRadius ) ) + 1;
}

export function resetDetectorScreenHitRenderCache( cache: DetectorScreenHitRenderCache ): void {
  cache.lastRenderedHitCount = 0;
  cache.hitSprite = null;
  cache.hitSpriteParams = null;
}

function getHitSprite(
  cache: DetectorScreenHitRenderCache,
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number,
  hitCoreRadius: number,
  hitSpriteCenter: number
): HTMLCanvasElement {

  // Return cached sprite if parameters haven't changed.
  if ( cache.hitSprite && hitSpriteParamsMatch(
    cache.hitSpriteParams,
    rgb,
    coreAlpha,
    glowAlpha,
    glowRadius,
    hitCoreRadius,
    hitSpriteCenter
  ) ) {
    return cache.hitSprite;
  }

  const size = hitSpriteCenter * 2;
  const spriteCanvas = document.createElement( 'canvas' );
  spriteCanvas.width = size;
  spriteCanvas.height = size;
  const ctx = spriteCanvas.getContext( '2d' )!;

  if ( glowAlpha > 0 ) {
    fillCircle( ctx, rgb, glowAlpha, hitSpriteCenter, glowRadius );
  }

  fillCircle( ctx, rgb, coreAlpha, hitSpriteCenter, hitCoreRadius );

  cache.hitSprite = spriteCanvas;
  cache.hitSpriteParams = {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    coreAlpha: coreAlpha,
    glowAlpha: glowAlpha,
    glowRadius: glowRadius,
    hitCoreRadius: hitCoreRadius,
    hitSpriteCenter: hitSpriteCenter
  };
  return spriteCanvas;
}

function paintHits(
  context: CanvasRenderingContext2D,
  renderState: DetectorScreenRenderState,
  options: DetectorScreenRenderOptions
): void {
  const width = options.outputWidth;
  const height = options.outputHeight;
  const hits = renderState.hits;
  const cache = options.hitRenderCache;

  if ( hits.length === 0 ) {
    if ( !cache || cache.lastRenderedHitCount > 0 ) {
      context.clearRect( 0, 0, width, height );
    }
    if ( cache ) {
      cache.lastRenderedHitCount = 0;
    }
    return;
  }

  const visibleFraction = options.visibleScreenHalfWidth / renderState.fullScreenHalfWidth;
  const hitRadiusScale = options.hitRadiusScale || ( options.renderScale || 1 ) / visibleFraction;
  const displayGain = getHitsDisplayGain( renderState.brightness );
  const brightnessFraction = getHitsBrightnessFraction( renderState.brightness );
  const rgb = getSceneRGB( renderState.sourceType, renderState.wavelength );
  const coreAlpha = getHitsCoreAlpha( brightnessFraction );
  const glowAlpha = getHitsGlowAlpha( brightnessFraction );
  const hitCoreRadius = BASE_HIT_CORE_RADIUS * hitRadiusScale;
  const glowRadius = BASE_HIT_GLOW_RADIUS * hitRadiusScale * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );
  const maxRenderedHits = options.maxRenderedHits || hits.length;

  const localCache = cache || {
    lastRenderedHitCount: 0,
    hitSprite: null,
    hitSpriteParams: null
  };
  const hitSpriteCenter = getHitSpriteCenter( hitRadiusScale );
  const sprite = getHitSprite( localCache, rgb, coreAlpha, glowAlpha, glowRadius, hitCoreRadius, hitSpriteCenter );

  const hitCount = hits.length;
  const renderCount = Math.min( hitCount, maxRenderedHits );
  const startIndex = hitCount - renderCount;

  if ( renderCount >= maxRenderedHits ) {
    options.onRenderCapReached && options.onRenderCapReached();
  }

  const alreadyRendered = cache ? cache.lastRenderedHitCount : 0;
  const needsFullRepaint = !cache || alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
  const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

  if ( needsFullRepaint ) {
    context.clearRect( 0, 0, width, height );
  }

  for ( let i = incrementalStart; i < hitCount; i++ ) {
    const hit = hits[ i ];
    const normalizedVisibleX = hit.x / visibleFraction;
    const normalizedVisibleY = hit.y / visibleFraction;
    if ( Math.abs( normalizedVisibleX ) > 1 || Math.abs( normalizedVisibleY ) > 1 ) {
      continue;
    }

    const viewX = ( ( normalizedVisibleX + 1 ) / 2 ) * width;
    const viewY = ( ( normalizedVisibleY + 1 ) / 2 ) * height;
    context.drawImage( sprite, viewX - hitSpriteCenter, viewY - hitSpriteCenter );
  }

  if ( cache ) {
    cache.lastRenderedHitCount = hitCount;
  }
}

function paintIntensity(
  context: CanvasRenderingContext2D,
  renderState: DetectorScreenRenderState,
  options: DetectorScreenRenderOptions
): void {
  const width = options.outputWidth;
  const height = options.outputHeight;
  context.clearRect( 0, 0, width, height );

  // Intensity mode shows the instantaneous theoretical pattern whenever the source is emitting.
  if ( !renderState.isEmitting || renderState.effectiveWavelength === 0 ) {
    return;
  }

  const rgb = getSceneRGB( renderState.sourceType, renderState.wavelength );
  const displayGain = getIntensityDisplayGain( renderState.brightness, renderState.intensity );
  const sampleWidthOnScreen = options.intensitySampleWidthOnScreen || 2 * options.visibleScreenHalfWidth / width;
  const slitWidth = renderState.slitWidth * 1e-3;
  const slitSeparation = renderState.slitSeparation * 1e-3;

  for ( let x = 0; x < width; x++ ) {
    const fraction = ( x + 0.5 ) / width;
    const physicalX = ( fraction - 0.5 ) * 2 * options.visibleScreenHalfWidth;
    const intensity = getApparentAnalyticalDetectorIntensity( {
      positionOnScreen: physicalX,
      sampleWidthOnScreen: sampleWidthOnScreen,
      effectiveWavelength: renderState.effectiveWavelength,
      screenDistance: renderState.screenDistance,
      slitWidth: slitWidth,
      slitSeparation: slitSeparation,
      slitSetting: renderState.slitSetting
    } );
    const fillStyle = getScaledRGBFillStyle( rgb, intensity * displayGain );

    // Skip bands below perceptual visibility to avoid painting nearly-black pixels.
    if ( !fillStyle ) {
      continue;
    }

    context.fillStyle = fillStyle;
    context.fillRect( x, 0, 1, height );
  }
}

export default function renderDetectorScreenTexture(
  context: CanvasRenderingContext2D,
  renderState: DetectorScreenRenderState,
  options: DetectorScreenRenderOptions
): void {
  if ( renderState.detectionMode === 'hits' ) {
    paintHits( context, renderState, options );
  }
  else {
    paintIntensity( context, renderState, options );
  }
}
