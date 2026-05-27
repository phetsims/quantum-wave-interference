// Copyright 2026, University of Colorado Boulder

/**
 * Shared renderer for Experiment detector-screen textures. It accepts frozen render-state data so live detector
 * textures and snapshot previews can render through the same code path.
 *
 * This renderer deliberately works with plain canvas contexts instead of Scenery nodes. The Experiment detector screen
 * is displayed as a raster texture, and Experiment snapshots need a pixel-consistent copy of that same detector image.
 * Keeping the rendering code here avoids two implementations drifting apart.
 *
 * Coordinate spaces used in this file:
 *
 * - Detector hit coordinates are normalized to the full detector screen, with x/y values in approximately [-1, 1].
 *   A hit with x = -1 is at the left edge of the full detector and x = 1 is at the right edge. The y coordinate is
 *   normalized the same way for the detector height.
 * - visibleScreenHalfWidth is the physical half-width currently shown by the caller. The live detector screen can zoom
 *   into the central part of the full detector, while snapshots can render at their displayed zoom.
 * - outputWidth/outputHeight are backing-canvas pixels. The caller chooses their size, so this renderer can paint either
 *   a supersampled live texture or a smaller snapshot preview.
 *
 * Hits mode is optimized for the live screen. A persistent DetectorScreenHitRenderCache lets callers append only newly
 * detected hits to an existing canvas. When no cache is provided, this function still works by repainting the requested
 * hit range into the supplied context.
 *
 * Average Intensity mode is intentionally analytical. Experiment snapshots do not store a solver intensity
 * distribution, so the renderer recomputes the apparent detector pattern from the frozen slit/source/screen parameters.
 * The optional intensitySampleWidthOnScreen parameter is important for previews: it tells the analytical sampler the
 * physical width represented by each visible sample, which keeps dense fringes from aliasing when rendering at high
 * backing-canvas resolution.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { getApparentAnalyticalDetectorIntensity } from './ApparentDetectorPattern.js';
import { type DetectorScreenRenderState } from './DetectorScreenRenderState.js';
import { BASE_HIT_CORE_RADIUS, BASE_HIT_GLOW_RADIUS, getHitsBrightnessFraction, getHitsCoreAlpha, getHitsDisplayGain, getHitsGlowAlpha, getIntensityDisplayGain, getSceneRGB, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER, PERCEPTUAL_VISIBILITY_THRESHOLD } from './ScreenBrightnessUtils.js';

// All fields that affect the cached hit sprite image. The sprite is a tiny offscreen canvas containing one particle hit
// at the current color, alpha, and radius. Reusing it avoids redrawing arcs for every hit.
export type DetectorScreenHitSpriteParams = {
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

  // Number of hits represented in the persistent hit canvas after the last render. The renderer uses this to append
  // only newly-added hits when possible.
  lastRenderedHitCount: number;

  // Offscreen canvas containing a reusable single-hit sprite.
  hitSprite: HTMLCanvasElement | null;

  // Parameters used to build hitSprite. Any visual parameter change invalidates the sprite.
  hitSpriteParams: DetectorScreenHitSpriteParams | null;
};

export type DetectorScreenRenderOptions = {

  // Size of the canvas region to paint, in backing-canvas pixels.
  outputWidth: number;
  outputHeight: number;

  // Physical half-width of the detector region currently represented by the output canvas. This can be smaller than
  // renderState.fullScreenHalfWidth when the detector screen is zoomed in.
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

  // Maximum number of most-recent hits to draw. This bounds live-rendering cost while the model can keep accumulating
  // hit count separately.
  maxRenderedHits?: number;

  // Called when maxRenderedHits prevents older hits from being drawn.
  onRenderCapReached?: () => void;
};

/**
 * Compares the complete visual state of a cached hit sprite.
 */
export function detectorScreenHitSpriteParamsMatch(
  params: DetectorScreenHitSpriteParams | null,
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number,
  hitCoreRadius: number,
  hitSpriteCenter: number
): params is DetectorScreenHitSpriteParams {
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

/**
 * Creates the complete visual state descriptor for a cached hit sprite.
 */
export function createDetectorScreenHitSpriteParams(
  rgb: { r: number; g: number; b: number },
  coreAlpha: number,
  glowAlpha: number,
  glowRadius: number,
  hitCoreRadius: number,
  hitSpriteCenter: number
): DetectorScreenHitSpriteParams {
  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    coreAlpha: coreAlpha,
    glowAlpha: glowAlpha,
    glowRadius: glowRadius,
    hitCoreRadius: hitCoreRadius,
    hitSpriteCenter: hitSpriteCenter
  };
}

/**
 * Returns a CSS rgba color string for canvas fillStyle.
 */
function rgbToRGBA( rgb: { r: number; g: number; b: number }, alpha: number ): string {
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
}

/**
 * Draws a filled circle into the supplied canvas context.
 */
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

/**
 * Converts a particle/source color and intensity scale into an rgb(...) fill style. Very dim values are skipped so
 * Average Intensity mode does not spend time painting visually-black pixels.
 */
function getScaledRGBFillStyle( rgb: { r: number; g: number; b: number }, scale: number ): string | null {
  if ( scale < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
    return null;
  }

  const r = clamp( roundSymmetric( rgb.r * scale ), 0, 255 );
  const g = clamp( roundSymmetric( rgb.g * scale ), 0, 255 );
  const b = clamp( roundSymmetric( rgb.b * scale ), 0, 255 );
  return `rgb(${r},${g},${b})`;
}

/**
 * Computes the integer center coordinate for the reusable hit sprite.
 *
 * The sprite canvas must be large enough for the largest possible glow at this zoom scale. Its center must also remain
 * stable across brightness changes so regenerating the sprite cannot move already-rendered hits by subpixel amounts.
 */
function getHitSpriteCenter( hitRadiusScale: number ): number {
  const hitCoreRadius = BASE_HIT_CORE_RADIUS * hitRadiusScale;

  // Reserve enough canvas space for the largest glow possible at this scale. This keeps the sprite size stable across
  // brightness changes, so hit placement does not shift when the sprite is regenerated.
  const maxGlowRadius = BASE_HIT_GLOW_RADIUS * hitRadiusScale *
                        Math.min( 2, Math.sqrt( Math.max( 1, HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER ) ) );

  // Fixed integer anchor for all brightness values at this scale, plus 1 px antialiasing padding.
  return Math.ceil( Math.max( hitCoreRadius, maxGlowRadius ) ) + 1;
}

/**
 * Clears the incremental hit renderer's state so the next hits render will repaint from scratch.
 */
export function resetDetectorScreenHitRenderCache( cache: DetectorScreenHitRenderCache ): void {
  cache.lastRenderedHitCount = 0;
  cache.hitSprite = null;
  cache.hitSpriteParams = null;
}

/**
 * Returns a reusable offscreen canvas for one particle hit at the current visual settings.
 */
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
  if ( cache.hitSprite && detectorScreenHitSpriteParamsMatch(
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
  cache.hitSpriteParams = createDetectorScreenHitSpriteParams(
    rgb,
    coreAlpha,
    glowAlpha,
    glowRadius,
    hitCoreRadius,
    hitSpriteCenter
  );
  return spriteCanvas;
}

/**
 * Paints particle hits. With a persistent cache, the common live-screen path draws only hits that were added since the
 * last render. Without a cache, the caller gets a complete repaint of the selected hit range.
 */
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

  // hitRadiusScale combines backing-canvas resolution and detector zoom. Zooming into a smaller visible fraction makes
  // each normalized hit occupy more screen pixels, so hit dots should grow with 1 / visibleFraction.
  const hitCoreRadius = BASE_HIT_CORE_RADIUS * hitRadiusScale;
  const glowRadius = BASE_HIT_GLOW_RADIUS * hitRadiusScale * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );
  const maxRenderedHits = options.maxRenderedHits || hits.length;

  // A throwaway local cache still lets a one-off render reuse one generated sprite for all hits in this call.
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

  // A full repaint is needed if there is no persistent cache, if the hit array was reset/truncated, or if the render cap
  // has advanced far enough that the earliest still-visible hit was not part of the existing canvas.
  const needsFullRepaint = !cache || alreadyRendered > hitCount || startIndex > 0 && alreadyRendered <= startIndex;
  const incrementalStart = needsFullRepaint ? startIndex : Math.max( startIndex, alreadyRendered );

  if ( needsFullRepaint ) {
    context.clearRect( 0, 0, width, height );
  }

  for ( let i = incrementalStart; i < hitCount; i++ ) {
    const hit = hits[ i ];

    // Convert from full-detector normalized coordinates into the currently-visible detector crop.
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

/**
 * Paints the analytical Average Intensity detector pattern.
 *
 * Each output x-column samples the apparent intensity over a physical detector width. That width is normally one output
 * pixel in detector coordinates, but snapshot previews can pass a coarser sample width to match the display resolution
 * and prevent supersampling from creating false high-frequency fringe detail.
 */
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

  // The model stores slit dimensions in millimeters while the analytical detector-pattern helpers use meters.
  const slitWidth = renderState.slitWidth * 1e-3;
  const slitSeparation = renderState.slitSeparation * 1e-3;

  for ( let x = 0; x < width; x++ ) {

    // Sample at the center of the output pixel/column.
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

/**
 * Renders either hits mode or Average Intensity mode into the supplied canvas context.
 */
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
