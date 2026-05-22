// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for HighIntensitySceneModel detector pattern formation timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Tandem from '../../../../tandem/js/Tandem.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import HighIntensitySceneModel, { DETECTOR_PATTERN_FORMATION_EASE_POWER, DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD, DETECTOR_PATTERN_FORMATION_TIME_CONSTANT, DETECTOR_SCREEN_HIT_RATE, SLIT_DETECTOR_EVENT_RATE } from './HighIntensitySceneModel.js';

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
  electrons: QuantumWaveInterferenceConstants.getParticleMass( 'electrons' ),
  neutrons: QuantumWaveInterferenceConstants.getParticleMass( 'neutrons' ),
  heliumAtoms: QuantumWaveInterferenceConstants.getParticleMass( 'heliumAtoms' )
};

const EXPECTED_SLIT_SEPARATIONS: Record<SourceType, { min: number; max: number; defaultValue: number }> = {
  photons: {
    min: 0.001,
    max: 0.005,
    defaultValue: 0.003
  },
  electrons: {
    min: 1e-6,
    max: 5e-6,
    defaultValue: 3e-6
  },
  neutrons: {
    min: 1e-6,
    max: 5e-6,
    defaultValue: 3e-6
  },
  heliumAtoms: {
    min: 0.10e-6,
    max: 0.60e-6,
    defaultValue: 0.40e-6
  }
};

const createScene = ( sourceType: SourceType = 'photons' ): HighIntensitySceneModel => new HighIntensitySceneModel( {
  sourceType: sourceType,
  tandem: Tandem.OPT_OUT
} );

const stepSceneInSmallIncrements = ( scene: HighIntensitySceneModel, totalDt: number ): void => {
  let remainingDt = totalDt;
  while ( remainingDt > EPSILON ) {
    const dt = Math.min( 1 / 60, remainingDt );
    scene.step( dt );
    remainingDt -= dt;
  }
};

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

const prepareSceneForDetectorScreenHits = ( scene: HighIntensitySceneModel ): void => {
  scene.isEmittingProperty.value = true;
  stepUntilWavefrontReachesScreen( scene );
  scene.detectionModeProperty.value = 'hits';
};

const getDetectorPatternFormationDt = ( initialFactor: number, targetFactor: number ): number => {
  const initialEasedFactor = Math.pow( initialFactor, 1 / DETECTOR_PATTERN_FORMATION_EASE_POWER );
  const targetEasedFactor = Math.pow( targetFactor, 1 / DETECTOR_PATTERN_FORMATION_EASE_POWER );

  return -DETECTOR_PATTERN_FORMATION_TIME_CONSTANT * Math.log(
    ( 1 - targetEasedFactor ) / ( 1 - initialEasedFactor )
  );
};

QUnit.test( 'slit separation ranges use requested values', assert => {
  ( Object.keys( EXPECTED_SLIT_SEPARATIONS ) as SourceType[] ).forEach( sourceType => {
    const scene = createScene( sourceType );
    const expected = EXPECTED_SLIT_SEPARATIONS[ sourceType ];

    assertApproximately( assert, scene.slitSeparationRange.min, expected.min, `${sourceType} slit separation minimum` );
    assertApproximately( assert, scene.slitSeparationRange.max, expected.max, `${sourceType} slit separation maximum` );
    assertApproximately( assert, scene.slitSeparationProperty.value, expected.defaultValue, `${sourceType} slit separation default` );
  } );
} );

QUnit.test( 'neutron wave visualizer scale matches electrons without changing physics', assert => {
  const electronsScene = createScene( 'electrons' );
  const neutronsScene = createScene( 'neutrons' );

  assert.strictEqual( neutronsScene.regionWidth, electronsScene.regionWidth, 'neutron region width matches electron region width' );
  assert.strictEqual( neutronsScene.regionHeight, electronsScene.regionHeight, 'neutron region height matches electron region height' );

  assertApproximately(
    assert,
    neutronsScene.getEffectiveWavelength(),
    QuantumWaveInterferenceConstants.PLANCK_CONSTANT /
    ( QuantumWaveInterferenceConstants.NEUTRON_MASS * neutronsScene.velocityProperty.value ),
    'neutron wavelength still follows neutron mass and velocity'
  );
} );

QUnit.test( 'detector pattern formation waits for wavefront and uses eased exponential model dt', assert => {
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

  scene.step( DETECTOR_PATTERN_FORMATION_TIME_CONSTANT );
  assertApproximately(
    assert,
    scene.detectorPatternFormationFactorProperty.value,
    Math.pow( 1 - Math.exp( -1 ), DETECTOR_PATTERN_FORMATION_EASE_POWER ),
    'formation advances by one eased exponential time constant'
  );
  assert.ok(
    scene.detectorPatternFormationFactorProperty.value < 0.5,
    'formation starts more gradually than the previous direct exponential'
  );

  scene.detectionModeProperty.value = 'hits';
  scene.detectionModeProperty.value = 'averageIntensity';
  assert.strictEqual( scene.detectorPatternFormationFactorProperty.value, 0, 're-entering intensity mode restarts nonzero formation' );

  const justBelowSnapFactor = DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD - 1e-4;
  scene.step( getDetectorPatternFormationDt( 0, justBelowSnapFactor ) );
  assertApproximately(
    assert,
    scene.detectorPatternFormationFactorProperty.value,
    justBelowSnapFactor,
    'formation does not snap below the snap-to-complete threshold'
  );

  const justAboveSnapFactor = DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD + 1e-4;
  scene.step( getDetectorPatternFormationDt( justBelowSnapFactor, justAboveSnapFactor ) );
  assert.strictEqual( scene.detectorPatternFormationFactorProperty.value, 1, 'formation snaps to completion after the threshold' );
} );

QUnit.test( 'detector-screen hits use increased rate after wavefront reaches screen', assert => {
  const scene = createScene();
  prepareSceneForDetectorScreenHits( scene );

  scene.step( 0.2 );

  assert.strictEqual(
    scene.totalHitsProperty.value,
    DETECTOR_SCREEN_HIT_RATE * 0.2,
    'detector-screen hits accumulate at the increased baseline rate'
  );
  assert.strictEqual( scene.hits.length, DETECTOR_SCREEN_HIT_RATE * 0.2, 'one hit dot is created for each screen hit' );
  assert.strictEqual(
    scene.leftDetectorHitsProperty.value + scene.rightDetectorHitsProperty.value,
    0,
    'screen hits do not increment on-slit detector counts when no slit detectors are present'
  );
} );

QUnit.test( 'detector-screen hits respect the maximum hit cap', assert => {
  const scene = createScene();
  prepareSceneForDetectorScreenHits( scene );

  scene.totalHitsProperty.value = QuantumWaveInterferenceConstants.MAX_HITS - 3;
  scene.step( 0.2 );

  assert.strictEqual( scene.totalHitsProperty.value, QuantumWaveInterferenceConstants.MAX_HITS, 'total hits stop at the maximum hit cap' );
  assert.strictEqual( scene.hits.length, 3, 'only enough hit dots are created to reach the maximum hit cap' );
} );

QUnit.test( 'slit-detector hits are scheduled relative to source-on time', assert => {
  const scene = createScene();
  scene.slitConfigurationProperty.value = 'bothDetectors';

  // The solver clock advances while the source is off. Slit-detector hit timing must not use this
  // absolute time as though the wave had been emitted from t=0.
  scene.step( 2 );
  scene.isEmittingProperty.value = true;
  scene.step( 0.05 );

  assert.strictEqual(
    scene.leftDetectorHitsProperty.value + scene.rightDetectorHitsProperty.value,
    0,
    'no slit-detector hits occur shortly after turning on, even when the idle solver time exceeds slit arrival time'
  );

  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const slitTravelTime = scene.slitPositionFractionProperty.value * scene.regionWidth / propagationSpeed;
  const dt = 1 / 60;
  for ( let elapsedTime = 0; elapsedTime < slitTravelTime + dt; elapsedTime += dt ) {
    scene.step( dt );
  }

  assert.ok(
    scene.leftDetectorHitsProperty.value + scene.rightDetectorHitsProperty.value > 0,
    'slit-detector hits occur after the wave has had enough source-on time to reach the slits'
  );
} );

QUnit.test( 'slit-detector event rate is independent from detector-screen hit rate', assert => {
  const scene = createScene();
  scene.slitConfigurationProperty.value = 'bothDetectors';
  scene.isEmittingProperty.value = true;

  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const slitTravelTime = scene.slitPositionFractionProperty.value * scene.regionWidth / propagationSpeed;
  stepSceneInSmallIncrements( scene, slitTravelTime + 1e-6 );

  const initialSlitDetectorHits = scene.leftDetectorHitsProperty.value + scene.rightDetectorHitsProperty.value;
  scene.step( 1 / SLIT_DETECTOR_EVENT_RATE );
  const finalSlitDetectorHits = scene.leftDetectorHitsProperty.value + scene.rightDetectorHitsProperty.value;

  assert.strictEqual(
    finalSlitDetectorHits - initialSlitDetectorHits,
    1,
    'one slit-detector event is created during one slit-detector interval'
  );
  assert.strictEqual( scene.totalHitsProperty.value, 0, 'slit-detector events do not create detector-screen hits outside Hits mode' );
} );

QUnit.test( 'effective wave speed and wavelength use physical source values', assert => {
  const photonScene = createScene( 'photons' );
  assert.strictEqual( photonScene.getEffectiveWaveSpeed(), QuantumWaveInterferenceConstants.SPEED_OF_LIGHT, 'photon wave speed is c' );
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
