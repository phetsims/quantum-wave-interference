// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for HighIntensitySceneModel detector pattern formation timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import HighIntensitySceneModel, { DETECTOR_PATTERN_FORMATION_DURATION } from './HighIntensitySceneModel.js';

QUnit.module( 'HighIntensitySceneModel' );

const EPSILON = 1e-10;

const assertApproximately = (
  assert: Assert,
  actual: number,
  expected: number,
  message: string,
  epsilon = EPSILON
): void => {
  assert.ok( Math.abs( actual - expected ) <= epsilon, `${message}: expected ${expected}, got ${actual}` );
};

const createScene = (): HighIntensitySceneModel => new HighIntensitySceneModel( {
  sourceType: 'photons',
  tandem: Tandem.OPT_OUT
} );

const stepUntilWavefrontReachesScreen = ( scene: HighIntensitySceneModel ): void => {
  const dt = 1 / 60;
  for ( let i = 0; i < 600; i++ ) {
    scene.step( dt );
    if ( scene.hasWavefrontReachedScreen() ) {
      return;
    }
  }
  throw new Error( 'wavefront did not reach screen during test setup' );
};

QUnit.test( 'detector pattern formation waits for wavefront and uses model dt', assert => {
  const scene = createScene();

  scene.isEmittingProperty.value = true;
  scene.step( 1e-6 );
  assert.strictEqual(
    scene.detectorPatternFormationFactorProperty.value,
    0,
    'detector pattern does not begin forming before the wavefront reaches the screen'
  );

  stepUntilWavefrontReachesScreen( scene );

  scene.detectionModeProperty.value = 'hits';
  scene.detectionModeProperty.value = 'averageIntensity';
  assert.strictEqual( scene.detectorPatternFormationFactorProperty.value, 0, 'entering intensity mode restarts formation' );

  scene.step( 0 );
  assert.strictEqual( scene.detectorPatternFormationFactorProperty.value, 0, 'zero dt does not advance formation' );

  scene.step( DETECTOR_PATTERN_FORMATION_DURATION / 2 );
  assertApproximately(
    assert,
    scene.detectorPatternFormationFactorProperty.value,
    0.5,
    'formation advances according to effective model dt'
  );

  scene.step( DETECTOR_PATTERN_FORMATION_DURATION / 2 );
  assert.strictEqual( scene.detectorPatternFormationFactorProperty.value, 1, 'formation reaches completion after the configured duration' );
} );
