// Copyright 2026, University of Colorado Boulder

/**
 * Provides shared per-scene detector-screen textures. Textures are rendered with the same logic used by Experiment
 * snapshots, so live and captured detector screens stay pixel-consistent while the live path keeps its persistent
 * canvas and incremental hit rendering optimization.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceQueryParameters from '../../common/QuantumWaveInterferenceQueryParameters.js';
import renderDetectorScreenTexture, { createDetectorScreenHitRenderCache, type DetectorScreenHitRenderCache, type DetectorScreenTextureRenderParameters, detectorScreenTextureRenderParametersChanged, resetDetectorScreenHitRenderCache } from '../../common/view/renderDetectorScreenTexture.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../model/DetectorScreenScale.js';
import SceneModel from '../model/SceneModel.js';
import createDetectorScreenRenderStateFromSceneModel from './createDetectorScreenRenderStateFromSceneModel.js';

const SCREEN_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;

// Target displayed supersample factor for the front-facing detector screen. The backing texture scales with the
// front-facing zoom so the cropped visible region is still downsampled by this factor at every zoom level.
const SUPERSAMPLE = QuantumWaveInterferenceQueryParameters.experimentDetectorTextureScale;

type DetectorScreenTextureScaleMode = 'zoomDependent' | 'fullDetector';
const DEFAULT_TEXTURE_SCALE_MODE: DetectorScreenTextureScaleMode = 'zoomDependent';

type DetectorScreenTextureOptions = {

  // zoomDependent is used by the front-facing detector so its cropped visible region stays supersampled at every zoom.
  // fullDetector is used by overhead views that need a stable full-detector pattern independent of front-facing zoom.
  scaleMode?: DetectorScreenTextureScaleMode;
};

/**
 * Per-scene mutable state for one detector-screen texture mode. Instances live in mode-specific WeakMaps for as long
 * as their SceneModel is reachable. Callers receive a reference to canvas directly and must treat it as read-only; the
 * cache owns the canvas and may resize or repaint it at any time.
 */
type SceneTextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;
  renderScale: number;
  textureWidth: number;
  textureHeight: number;
  hitRenderCache: DetectorScreenHitRenderCache;

  // The parameters that were used for the last render, so we can detect when a full repaint is needed vs an
  // incremental blit.
  lastRenderParameters: DetectorScreenTextureRenderParameters | null;
};

// Top-level caches keyed by SceneModel so each scene keeps separate zoom-dependent and full-detector textures.
// WeakMaps prevent the caches from extending a scene's lifetime: if a SceneModel becomes unreachable,
// its texture caches can be garbage collected with it.
//
// Cached textures should not go stale during normal use. Each SceneTextureCache registers listeners on the scene
// that mark it dirty whenever rendering inputs change, and the texture is lazily repainted on the next request.
const zoomDependentSceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();
const fullDetectorSceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();

// Log once when the render cap is reached, so QA/designers know why new dots stop appearing.
let hasLoggedRenderCap = false;

/**
 * Returns the fraction of the full detector represented by the backing texture's displayed region.
 */
function getTextureVisibleFraction(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number> | null,
  scaleMode: DetectorScreenTextureScaleMode
): number {
  if ( scaleMode === 'fullDetector' ) {
    return 1;
  }

  if ( !detectorScreenScaleIndexProperty ) {
    throw new Error( 'detectorScreenScaleIndexProperty is required for zoom-dependent detector textures' );
  }

  return getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value ) /
         sceneModel.fullScreenHalfWidth;
}

/**
 * Returns the pixel-per-model-unit scale factor for the backing texture. For the zoom-dependent front-facing detector,
 * the scale grows as the user zooms in so the cropped visible region is always downsampled by SUPERSAMPLE. For
 * full-detector rendering, the scale is fixed so overhead views do not change pattern resolution or hit radius with
 * the front-facing detector zoom.
 */
function getTextureRenderScale(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number> | null,
  scaleMode: DetectorScreenTextureScaleMode
): number {
  return SUPERSAMPLE / getTextureVisibleFraction( sceneModel, detectorScreenScaleIndexProperty, scaleMode );
}

function getSceneTextureMap( scaleMode: DetectorScreenTextureScaleMode ): WeakMap<SceneModel, SceneTextureCache> {
  return scaleMode === 'zoomDependent'
         ? zoomDependentSceneTextureMap
         : fullDetectorSceneTextureMap;
}

function resetCacheRenderingState( cache: SceneTextureCache ): void {
  resetDetectorScreenHitRenderCache( cache.hitRenderCache );
}

/**
 * Resizes the backing canvas when the render scale has changed (e.g., after a zoom-level change). Resizing
 * clears the canvas context, so the hit render cache is reset and the dirty flag is set to trigger a full repaint.
 * A no-op when the scale is unchanged.
 */
function updateCacheTextureSize(
  cache: SceneTextureCache,
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number> | null,
  scaleMode: DetectorScreenTextureScaleMode
): void {
  const renderScale = getTextureRenderScale( sceneModel, detectorScreenScaleIndexProperty, scaleMode );

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
 * Paints the current detector-screen state onto the cache canvas. If rendering parameters (brightness, wavelength,
 * detection mode, etc.) have changed since the last paint, the canvas is cleared and all hits are repainted from
 * scratch; otherwise only newly accumulated hits are blitted incrementally. Clears the dirty flag on completion.
 */
function renderSceneTexture(
  cache: SceneTextureCache,
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number> | null,
  scaleMode: DetectorScreenTextureScaleMode
): void {
  updateCacheTextureSize( cache, sceneModel, detectorScreenScaleIndexProperty, scaleMode );

  const context = cache.context;
  const renderState = createDetectorScreenRenderStateFromSceneModel( sceneModel );
  const currentRenderParameters: DetectorScreenTextureRenderParameters = {
    brightness: renderState.brightness,
    wavelength: renderState.wavelength,
    effectiveWavelength: renderState.effectiveWavelength,
    detectionMode: renderState.detectionMode,
    intensity: renderState.intensity,
    isEmitting: renderState.isEmitting
  };

  // Detect whether rendering parameters changed (requiring a full repaint of all hits) vs only new hits were added
  // (allowing an incremental blit).
  const paramsChanged = detectorScreenTextureRenderParametersChanged(
    cache.lastRenderParameters,
    currentRenderParameters
  );

  if ( paramsChanged ) {
    resetCacheRenderingState( cache );
    context.clearRect( 0, 0, cache.textureWidth, cache.textureHeight );
    cache.lastRenderParameters = currentRenderParameters;
  }

  renderDetectorScreenTexture( context, renderState, {
    outputWidth: cache.textureWidth,
    outputHeight: cache.textureHeight,
    visibleScreenHalfWidth: renderState.fullScreenHalfWidth,
    renderScale: cache.renderScale,
    hitRenderCache: cache.hitRenderCache,
    maxRenderedHits: QuantumWaveInterferenceQueryParameters.maxHits,
    onRenderCapReached: () => {
      if ( !hasLoggedRenderCap ) {
        hasLoggedRenderCap = true;
        phet.log && phet.log(
          `[DetectorScreen] Render cap reached: only the most recent ${QuantumWaveInterferenceQueryParameters.maxHits} hits are drawn. Hit counter continues to accumulate.`
        );
      }
    }
  } );

  if ( renderState.hits.length === 0 ) {
    hasLoggedRenderCap = false;
  }

  cache.dirty = false;
}

/**
 * Creates and initializes a SceneTextureCache for the given scene. Allocates the backing canvas at the current
 * render scale, then attaches listeners on sceneModel that mark the cache dirty whenever any rendering input
 * changes. These listeners are never removed because the cache lifetime matches the scene lifetime (both are
 * released together when the WeakMap entry is collected).
 */
function createSceneTextureCache(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number> | null,
  scaleMode: DetectorScreenTextureScaleMode
): SceneTextureCache {
  const renderScale = getTextureRenderScale( sceneModel, detectorScreenScaleIndexProperty, scaleMode );
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
    hitRenderCache: createDetectorScreenHitRenderCache(),
    lastRenderParameters: null
  };

  const markDirty = () => {
    cache.dirty = true;
  };

  sceneModel.hitsChangedEmitter.addListener( markDirty );
  sceneModel.isEmittingProperty.link( markDirty );
  sceneModel.detectionModeProperty.link( markDirty );
  sceneModel.screenBrightnessProperty.link( markDirty );
  sceneModel.sourceStrengthProperty.link( markDirty );
  sceneModel.wavelengthProperty.link( markDirty );
  sceneModel.particleSpeedProperty.link( markDirty );
  sceneModel.slitSeparationProperty.link( markDirty );
  sceneModel.screenDistanceProperty.link( markDirty );
  sceneModel.slitConfigurationProperty.link( markDirty );

  return cache;
}

function isDetectorScreenTextureOptions(
  argument: TReadOnlyProperty<number> | DetectorScreenTextureOptions | undefined
): argument is DetectorScreenTextureOptions {
  return !!argument && 'scaleMode' in argument;
}

/**
 * Gets the shared detector-screen texture for the specified scene, rendering it lazily on demand.
 *
 * The returned canvas is mutable and shared — callers must not resize or paint onto it. Its pixel dimensions
 * can change between calls for zoom-dependent textures, so callers should re-request the texture each frame before
 * drawing it into another context (e.g. via drawImage).
 *
 * By default, textures are zoom-dependent for the front-facing detector. Pass { scaleMode: 'fullDetector' } to request
 * a stable full-detector texture for overhead rendering that should not change with front-facing detector zoom.
 */
function getDetectorScreenTexture(
  sceneModel: SceneModel,
  detectorScreenScaleIndexPropertyOrOptions?: TReadOnlyProperty<number> | DetectorScreenTextureOptions,
  providedOptions?: DetectorScreenTextureOptions
): HTMLCanvasElement {
  const detectorScreenScaleIndexProperty = isDetectorScreenTextureOptions( detectorScreenScaleIndexPropertyOrOptions ) ?
                                           null :
                                           detectorScreenScaleIndexPropertyOrOptions || null;
  const options = isDetectorScreenTextureOptions( detectorScreenScaleIndexPropertyOrOptions ) ?
                  detectorScreenScaleIndexPropertyOrOptions :
                  providedOptions;
  const scaleMode = options?.scaleMode || DEFAULT_TEXTURE_SCALE_MODE;
  const sceneTextureMap = getSceneTextureMap( scaleMode );

  let cache = sceneTextureMap.get( sceneModel );
  if ( !cache ) {
    cache = createSceneTextureCache( sceneModel, detectorScreenScaleIndexProperty, scaleMode );
    sceneTextureMap.set( sceneModel, cache );
  }

  updateCacheTextureSize( cache, sceneModel, detectorScreenScaleIndexProperty, scaleMode );

  if ( cache.dirty ) {
    renderSceneTexture( cache, sceneModel, detectorScreenScaleIndexProperty, scaleMode );
  }

  return cache.canvas;
}

export default getDetectorScreenTexture;
