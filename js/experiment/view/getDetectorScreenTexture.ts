// Copyright 2026, University of Colorado Boulder

/**
 * Provides a shared per-scene detector-screen texture. The texture is rendered with the same logic used by Experiment
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

// Top-level cache keyed by SceneModel so each scene keeps its own full detector texture.
// WeakMap prevents the cache from extending a scene's lifetime: if a SceneModel becomes unreachable,
// its full-screen texture cache can be garbage collected with it.
//
// Cached textures should not go stale during normal use. Each SceneTextureCache registers listeners on the scene
// that mark it dirty whenever rendering inputs change, and the texture is lazily repainted on the next request.
const sceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();

// Log once when the render cap is reached, so QA/designers know why new dots stop appearing.
let hasLoggedRenderCap = false;

function getTextureRenderScale(
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): number {
  const visibleFraction = getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value ) /
                          sceneModel.fullScreenHalfWidth;
  return SUPERSAMPLE / visibleFraction;
}

function resetCacheRenderingState( cache: SceneTextureCache ): void {
  resetDetectorScreenHitRenderCache( cache.hitRenderCache );
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

function renderSceneTexture(
  cache: SceneTextureCache,
  sceneModel: SceneModel,
  detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
): void {
  updateCacheTextureSize( cache, sceneModel, detectorScreenScaleIndexProperty );

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
  sceneModel.intensityProperty.link( markDirty );
  sceneModel.wavelengthProperty.link( markDirty );
  sceneModel.particleSpeedProperty.link( markDirty );
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
