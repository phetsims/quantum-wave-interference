// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for HighIntensitySceneModel detector pattern formation timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
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

const PARTICLE_MASSES: Partial<Record<SourceType, number>> = {
  electrons: QuantumWaveInterferenceConstants.ELECTRON_MASS,
  neutrons: QuantumWaveInterferenceConstants.NEUTRON_MASS,
  heliumAtoms: QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS
};

const createScene = ( sourceType: SourceType = 'photons' ): HighIntensitySceneModel => new HighIntensitySceneModel( {
  sourceType: sourceType,
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

QUnit.test( 'effective wave speed and wavelength use physical source values', assert => {
  const photonScene = createScene( 'photons' );
  assert.strictEqual( photonScene.getEffectiveWaveSpeed(), 3e8, 'photon wave speed is c' );
  assertApproximately(
    assert,
    photonScene.getEffectiveWavelength(),
    photonScene.wavelengthProperty.value * 1e-9,
    'photon wavelength is the wavelength control value in meters'
  );

  ( [ 'electrons', 'neutrons', 'heliumAtoms' ] as SourceType[] ).forEach( sourceType => {
    const scene = createScene( sourceType );
    const particleMass = PARTICLE_MASSES[ sourceType ]!;

    [ scene.velocityRange.min, scene.velocityProperty.value, scene.velocityRange.max ].forEach( velocity => {
      scene.velocityProperty.value = velocity;

      assert.strictEqual( scene.getEffectiveWaveSpeed(), velocity, `${sourceType} wave speed is particle velocity` );
      assertApproximately(
        assert,
        scene.getEffectiveWavelength(),
        QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( particleMass * velocity ),
        `${sourceType} wavelength follows de Broglie relation at ${velocity} m/s`
      );
    } );
  } );
} );

QUnit.test( 'continuous solver physical time conversion matches effective wave speed', assert => {
  const scene = createScene( 'photons' );
  const visualDt = 0.75;
  const physicalDt = scene.getPhysicalDt( visualDt );

  assert.ok( physicalDt > 0, 'positive visual dt produces positive physical dt' );
  assertApproximately(
    assert,
    scene.waveSolver.getDisplayPropagationSpeed() * visualDt / physicalDt,
    scene.getEffectiveWaveSpeed(),
    'display distance divided by physical time equals photon speed'
  );
  assert.strictEqual( scene.getPhysicalDt( 0 ), 0, 'zero visual dt produces zero physical dt' );
} );
