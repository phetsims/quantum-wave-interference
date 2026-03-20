// Copyright 2026, University of Colorado Boulder

/**
 * Provides a shared per-scene detector-screen texture. The texture is rendered with the same
 * logic used by the front-facing detector screen, so other views (e.g. overhead) can display
 * identical graphics by drawing the same cached image with different transforms.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../dot/js/Utils.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import SceneModel from '../model/SceneModel.js';

const SCREEN_WIDTH = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_HEIGHT;

// Hit dot rendering parameters.
const HIT_CORE_RADIUS = 2.5;
const HIT_GLOW_RADIUS = 5;
const GLOW_THRESHOLD = 2000;
const MAX_RENDERED_HITS = 20000;
const INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 1.2;
const INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 6.0;
const INTENSITY_BRIGHTNESS_MAX_MULTIPLIER = 0.8;
const HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 0.1;
const HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 1.8; // previous default hits gain

type SceneTextureCache = {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  dirty: boolean;
};

const sceneTextureMap = new WeakMap<SceneModel, SceneTextureCache>();

const getHitRGB = ( sceneModel: SceneModel ): { r: number; g: number; b: number } => {
  if ( sceneModel.sourceType === 'photons' ) {
    const color = VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value );
    return { r: color.red, g: color.green, b: color.blue };
  }
 else {
    return { r: 255, g: 255, b: 255 };
  }
};

const getIntensityRGB = ( sceneModel: SceneModel ): { r: number; g: number; b: number } => {
  if ( sceneModel.sourceType === 'photons' ) {
    const color = VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value );
    return { r: color.red, g: color.green, b: color.blue };
  }
 else {
    return { r: 255, g: 255, b: 255 };
  }
};

const getIntensityScreenBrightnessMultiplier = ( sliderBrightness: number ): number => {
  const clampedBrightness = Utils.clamp( sliderBrightness, 0, 1 );
  return Utils.linear(
    0,
    1,
    INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

const getHitsScreenBrightnessMultiplier = ( sliderBrightness: number, sliderMax: number ): number => {
  const clampedBrightness = Utils.clamp( sliderBrightness, 0, sliderMax );
  return Utils.linear(
    0,
    sliderMax,
    HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

const paintHits = (
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number
): void => {
  const hits = sceneModel.hits;
  if ( hits.length === 0 ) {
    return;
  }

  const rgb = getHitRGB( sceneModel );
  const colorScale = Math.max( 1, displayGain );
  const scaledR = Utils.clamp( Utils.roundSymmetric( rgb.r * colorScale ), 0, 255 );
  const scaledG = Utils.clamp( Utils.roundSymmetric( rgb.g * colorScale ), 0, 255 );
  const scaledB = Utils.clamp( Utils.roundSymmetric( rgb.b * colorScale ), 0, 255 );
  const coreAlpha = Utils.clamp( displayGain, 0, 1 );
  const glowAlpha = Utils.clamp( displayGain * 0.2, 0, 1 );
  const glowRadius = HIT_GLOW_RADIUS * Math.min( 2, Math.sqrt( Math.max( 1, displayGain ) ) );

  const hitCount = hits.length;
  const renderCount = Math.min( hitCount, MAX_RENDERED_HITS );
  const startIndex = hitCount - renderCount;

  if ( hitCount <= GLOW_THRESHOLD ) {
    context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${glowAlpha})`;
    for ( let i = startIndex; i < hitCount; i++ ) {
      const hit = hits[ i ];
      const viewX = ( ( hit.x + 1 ) / 2 ) * SCREEN_WIDTH;
      const viewY = ( ( hit.y + 1 ) / 2 ) * SCREEN_HEIGHT;
      context.beginPath();
      context.arc( viewX, viewY, glowRadius, 0, Math.PI * 2 );
      context.fill();
    }

    context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${coreAlpha})`;
    for ( let i = startIndex; i < hitCount; i++ ) {
      const hit = hits[ i ];
      const viewX = ( ( hit.x + 1 ) / 2 ) * SCREEN_WIDTH;
      const viewY = ( ( hit.y + 1 ) / 2 ) * SCREEN_HEIGHT;
      context.beginPath();
      context.arc( viewX, viewY, HIT_CORE_RADIUS, 0, Math.PI * 2 );
      context.fill();
    }
  }
 else {
    const coreDiameter = HIT_CORE_RADIUS * 2;
    context.fillStyle = `rgba(${scaledR},${scaledG},${scaledB},${coreAlpha})`;
    for ( let i = startIndex; i < hitCount; i++ ) {
      const hit = hits[ i ];
      const viewX = ( ( hit.x + 1 ) / 2 ) * SCREEN_WIDTH;
      const viewY = ( ( hit.y + 1 ) / 2 ) * SCREEN_HEIGHT;
      context.fillRect(
        viewX - HIT_CORE_RADIUS,
        viewY - HIT_CORE_RADIUS,
        coreDiameter,
        coreDiameter
      );
    }
  }
};

const paintIntensity = (
  context: CanvasRenderingContext2D,
  sceneModel: SceneModel,
  displayGain: number
): void => {
  const totalHits = sceneModel.totalHitsProperty.value;
  if ( totalHits === 0 ) {
    return;
  }

  const opacityScale = Math.min( 1, Math.log10( totalHits + 1 ) / 2 );
  if ( opacityScale < 0.01 ) {
    return;
  }

  const screenHalfWidth = sceneModel.screenHalfWidth;
  const rgb = getIntensityRGB( sceneModel );
  const baseGain = opacityScale * displayGain;

  for ( let x = 0; x < SCREEN_WIDTH; x++ ) {
    const fraction = ( x + 0.5 ) / SCREEN_WIDTH;
    const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
    const intensity = sceneModel.getIntensityAtPosition( physicalX );
    const scale = intensity * baseGain;

    if ( scale < 0.004 ) {
      continue;
    }

    const r = Utils.clamp( Utils.roundSymmetric( rgb.r * scale ), 0, 255 );
    const g = Utils.clamp( Utils.roundSymmetric( rgb.g * scale ), 0, 255 );
    const b = Utils.clamp( Utils.roundSymmetric( rgb.b * scale ), 0, 255 );
    context.fillStyle = `rgb(${r},${g},${b})`;
    context.fillRect( x, 0, 1, SCREEN_HEIGHT );
  }
};

const renderSceneTexture = ( cache: SceneTextureCache, sceneModel: SceneModel ): void => {
  const context = cache.context;
  context.clearRect( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );

  const intensityBrightnessMultiplier = getIntensityScreenBrightnessMultiplier(
    sceneModel.screenBrightnessProperty.value
  );
  const hitsBrightnessMultiplier = getHitsScreenBrightnessMultiplier(
    sceneModel.screenBrightnessProperty.value,
    sceneModel.screenBrightnessProperty.range.max
  );
  const intensityMultiplier =
    Utils.clamp( sceneModel.intensityProperty.value, 0, 1 ) * INTENSITY_BRIGHTNESS_MAX_MULTIPLIER;
  const hitsDisplayGain = hitsBrightnessMultiplier;
  const intensityDisplayGain = intensityBrightnessMultiplier * intensityMultiplier;

  if ( sceneModel.detectionModeProperty.value === 'hits' ) {
    paintHits( context, sceneModel, hitsDisplayGain );
  }
 else {
    paintIntensity( context, sceneModel, intensityDisplayGain );
  }

  cache.dirty = false;
};

const createSceneTextureCache = ( sceneModel: SceneModel ): SceneTextureCache => {
  const canvas = document.createElement( 'canvas' );
  canvas.width = SCREEN_WIDTH;
  canvas.height = SCREEN_HEIGHT;

  const context = canvas.getContext( '2d' );
  if ( !context ) {
    throw new Error( 'Could not create 2D context for detector screen texture cache' );
  }

  const cache: SceneTextureCache = {
    canvas: canvas,
    context: context,
    dirty: true
  };

  const markDirty = () => {
    cache.dirty = true;
  };

  sceneModel.hitsChangedEmitter.addListener( markDirty );
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
