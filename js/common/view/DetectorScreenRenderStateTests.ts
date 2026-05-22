// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for shared Experiment detector-screen render state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../experiment/model/DetectorScreenScale.js';
import SceneModel from '../../experiment/model/SceneModel.js';
import createDetectorScreenRenderStateFromSceneModel from '../../experiment/view/createDetectorScreenRenderStateFromSceneModel.js';
import { type SlitConfiguration } from '../model/SlitConfiguration.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { createDetectorScreenRenderStateFromSnapshot, type DetectorScreenRenderState } from './DetectorScreenRenderState.js';
import renderDetectorScreenTexture from './renderDetectorScreenTexture.js';

QUnit.module( 'DetectorScreenRenderState' );

const TEST_RENDER_WIDTH = 128;
const TEST_RENDER_HEIGHT = 48;
const SAMPLE_PIXELS = [
  [ 0, 24 ],
  [ 7, 24 ],
  [ 32, 24 ],
  [ 64, 24 ],
  [ 96, 24 ],
  [ 120, 24 ],
  [ 127, 24 ]
] as const;

const createScene = ( sourceType: SourceType ): SceneModel => new SceneModel( {
  sourceType: sourceType,
  tandem: Tandem.OPT_OUT
} );

const renderSamples = (
  renderState: DetectorScreenRenderState,
  visibleScreenHalfWidth: number
): number[][] => {
  const canvas = document.createElement( 'canvas' );
  canvas.width = TEST_RENDER_WIDTH;
  canvas.height = TEST_RENDER_HEIGHT;
  const context = canvas.getContext( '2d' );
  if ( !context ) {
    throw new Error( 'Could not create detector render test context' );
  }

  renderDetectorScreenTexture( context, renderState, {
    outputWidth: TEST_RENDER_WIDTH,
    outputHeight: TEST_RENDER_HEIGHT,
    visibleScreenHalfWidth: visibleScreenHalfWidth
  } );

  return SAMPLE_PIXELS.map( ( [ x, y ] ) => Array.from( context.getImageData( x, y, 1, 1 ).data ) );
};

const assertSnapshotMatchesLiveRenderState = (
  assert: Assert,
  scene: SceneModel,
  message: string,
  visibleScreenHalfWidth = getDetectorScreenHalfWidthForScaleIndex( 1 )
): void => {
  const liveRenderState = createDetectorScreenRenderStateFromSceneModel( scene );
  scene.takeSnapshot();
  const snapshot = scene.snapshotsProperty.value[ 0 ];
  const snapshotRenderState = createDetectorScreenRenderStateFromSnapshot( snapshot );

  assert.deepEqual(
    renderSamples( snapshotRenderState, visibleScreenHalfWidth ),
    renderSamples( liveRenderState, visibleScreenHalfWidth ),
    message
  );
};

const prepareAverageIntensityScene = ( sourceType: SourceType, slitSetting: SlitConfiguration ): SceneModel => {
  const scene = createScene( sourceType );
  scene.detectionModeProperty.value = 'averageIntensity';
  scene.isEmittingProperty.value = true;
  scene.intensityProperty.value = 1;
  scene.screenBrightnessProperty.value = QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
  scene.slitSettingProperty.value = slitSetting;

  if ( sourceType === 'photons' ) {
    scene.wavelengthProperty.value = 594;
  }

  return scene;
};

QUnit.test( 'snapshot and live render states match for photon left-detector intensity', assert => {
  const scene = prepareAverageIntensityScene( 'photons', 'leftDetector' );
  assertSnapshotMatchesLiveRenderState( assert, scene, 'photon left-detector snapshot samples match live samples' );
} );

QUnit.test( 'snapshot and live render states match for photon double-slit intensity', assert => {
  const scene = prepareAverageIntensityScene( 'photons', 'bothOpen' );
  assertSnapshotMatchesLiveRenderState( assert, scene, 'photon both-open snapshot samples match live samples' );
} );

QUnit.test( 'snapshot and live render states match when source is off', assert => {
  const scene = prepareAverageIntensityScene( 'photons', 'bothOpen' );
  scene.isEmittingProperty.value = false;
  assertSnapshotMatchesLiveRenderState( assert, scene, 'source-off snapshot samples match live samples' );
} );

QUnit.test( 'snapshot and live render states match for non-photon intensity', assert => {
  const scene = prepareAverageIntensityScene( 'electrons', 'bothOpen' );
  assertSnapshotMatchesLiveRenderState( assert, scene, 'electron snapshot samples match live samples' );
} );

QUnit.test( 'snapshot and live render states match for experiment hits', assert => {
  const scene = createScene( 'photons' );
  scene.detectionModeProperty.value = 'hits';
  scene.wavelengthProperty.value = 594;
  scene.screenBrightnessProperty.value = QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
  scene.hits.push(
    new Vector2( -0.5, -0.3 ),
    new Vector2( 0, 0 ),
    new Vector2( 0.35, 0.2 )
  );

  assertSnapshotMatchesLiveRenderState(
    assert,
    scene,
    'experiment hit snapshot samples match live samples',
    getDetectorScreenHalfWidthForScaleIndex( 2 )
  );
} );
