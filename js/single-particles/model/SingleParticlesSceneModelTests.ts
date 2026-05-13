// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for SingleParticlesSceneModel packet timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type DecoherenceEvent, type GaussianPacketReEmission } from '../../common/model/AnalyticalWaveKernel.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import SingleParticlesSceneModel, { SCREEN_DETECTION_TIMING_PARAMETERS } from './SingleParticlesSceneModel.js';

QUnit.module( 'SingleParticlesSceneModel' );

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

class TestSingleParticlesSceneModel extends SingleParticlesSceneModel {

  public readonly decoherenceEventTimes: number[] = [];
  public decoherenceEvent: DecoherenceEvent | null = null;

  protected override createDecoherenceEventForSlitConfiguration(
    slitConfiguration: SlitConfigurationWithNoBarrier,
    time: number
  ): DecoherenceEvent | null {
    this.decoherenceEventTimes.push( time );
    return this.decoherenceEvent;
  }
}

type PrivateSingleParticlesSceneModelState = {
  packetReEmission: GaussianPacketReEmission | null;
  targetDetectionTime: number;
};

const createScene = (): TestSingleParticlesSceneModel => {
  const scene = new TestSingleParticlesSceneModel( {
    sourceType: 'photons',
    tandem: Tandem.OPT_OUT
  } );
  scene.slitConfigurationProperty.value = 'leftDetector';
  return scene;
};

const getDeterministicSlitArrivalTime = ( scene: SingleParticlesSceneModel ): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
  return ( scene.slitPositionFractionProperty.value * scene.regionWidth - initialCenterX ) / propagationSpeed;
};

const getOnSlitDetectionSigmaTime = ( scene: SingleParticlesSceneModel ): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  return 0.5 * sigmaX0 / propagationSpeed;
};

const getPacketReEmissionBaseAdvance = ( scene: SingleParticlesSceneModel ): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  return QuantumWaveInterferenceConstants.WAVE_PACKET_RE_EMISSION_TIME_ADVANCE_SIGMAS *
         QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth /
         propagationSpeed;
};

const getDeterministicScreenArrivalTime = ( scene: SingleParticlesSceneModel, sourceX = 0 ): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
  return ( scene.regionWidth - sourceX - initialCenterX ) / propagationSpeed;
};

const withStubbedGaussian = ( gaussianValues: number[], callback: () => void ): void => {
  const originalNextGaussian = dotRandom.nextGaussian;
  let index = 0;

  dotRandom.nextGaussian = () => {
    assert && assert( index < gaussianValues.length, 'stubbed gaussian values exhausted' );
    const value = gaussianValues[ index ];
    index++;
    return value;
  };

  try {
    callback();
  }
  finally {
    dotRandom.nextGaussian = originalNextGaussian;
  }
};

const withStubbedDoubles = ( doubleValues: number[], callback: () => void ): void => {
  const originalNextDouble = dotRandom.nextDouble;
  let index = 0;

  dotRandom.nextDouble = () => {
    assert && assert( index < doubleValues.length, 'stubbed double values exhausted' );
    const value = doubleValues[ index ];
    index++;
    return value;
  };

  try {
    callback();
  }
  finally {
    dotRandom.nextDouble = originalNextDouble;
  }
};

QUnit.test( 'on-slit detector sample is centered on deterministic slit arrival', assert => {
  const scene = createScene();
  const deterministicSlitArrivalTime = getDeterministicSlitArrivalTime( scene );

  withStubbedGaussian( [ 0, 0 ], () => {
    scene.emitPacket();
    scene.step( deterministicSlitArrivalTime + 1e-6 );
  } );

  assert.strictEqual( scene.decoherenceEventTimes.length, 1, 'one on-slit decoherence check occurred' );
  assertApproximately(
    assert,
    scene.decoherenceEventTimes[ 0 ],
    deterministicSlitArrivalTime,
    'zero Gaussian deviation samples the deterministic slit arrival time'
  );
} );

QUnit.test( 'on-slit detector waits for sampled time instead of center arrival', assert => {
  const scene = createScene();
  const deterministicSlitArrivalTime = getDeterministicSlitArrivalTime( scene );
  const onSlitDetectionSigmaTime = getOnSlitDetectionSigmaTime( scene );
  const sampledOnSlitDetectionTime = deterministicSlitArrivalTime + 2 * onSlitDetectionSigmaTime;

  withStubbedGaussian( [ 2 ], () => {
    scene.emitPacket();

    scene.step( deterministicSlitArrivalTime + onSlitDetectionSigmaTime );
    assert.strictEqual( scene.decoherenceEventTimes.length, 0, 'no event at deterministic center arrival' );

    scene.step( onSlitDetectionSigmaTime + 1e-6 );
  } );

  assert.strictEqual( scene.decoherenceEventTimes.length, 1, 'event occurs after sampled threshold' );
  assertApproximately(
    assert,
    scene.decoherenceEventTimes[ 0 ],
    sampledOnSlitDetectionTime,
    'event time is the sampled on-slit detection time'
  );
} );

QUnit.test( 'slit-detector packet re-emission uses sampled event time', assert => {
  const scene = createScene();
  const deterministicSlitArrivalTime = getDeterministicSlitArrivalTime( scene );
  const sampledOnSlitDetectionTime = deterministicSlitArrivalTime - getOnSlitDetectionSigmaTime( scene );
  scene.decoherenceEvent = {
    time: -1,
    selectedSlit: 'topSlit',
    clickedDetectorSlit: 'topSlit'
  };

  withStubbedGaussian( [ -1 ], () => {
    scene.emitPacket();
    scene.step( sampledOnSlitDetectionTime + 1e-6 );
  } );

  const packetReEmission = ( scene as unknown as PrivateSingleParticlesSceneModelState ).packetReEmission;
  assert.ok( packetReEmission, 'packet re-emission was created' );
  assertApproximately(
    assert,
    packetReEmission!.eventTime,
    sampledOnSlitDetectionTime,
    'packet re-emission event time matches sampled on-slit detection time'
  );
  assertApproximately(
    assert,
    packetReEmission!.timeAdvance!,
    getPacketReEmissionBaseAdvance( scene ) + sampledOnSlitDetectionTime - deterministicSlitArrivalTime,
    'packet re-emission preserves the sampled aperture timing offset'
  );
} );

QUnit.test( 'screen detection timing waits until after packet midpoint', assert => {
  const scene = createScene();
  scene.slitConfigurationProperty.value = 'bothOpen';

  const deterministicScreenArrivalTime = getDeterministicScreenArrivalTime( scene );
  const peakWeightFraction = ( SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight -
                               SCREEN_DETECTION_TIMING_PARAMETERS.startWeight ) /
                             ( SCREEN_DETECTION_TIMING_PARAMETERS.endWeight -
                               SCREEN_DETECTION_TIMING_PARAMETERS.startWeight );

  withStubbedDoubles( [ peakWeightFraction, 0 ], () => {
    withStubbedGaussian( [ 0 ], () => {
      scene.emitPacket();
    } );
  } );

  const targetDetectionTime = ( scene as unknown as PrivateSingleParticlesSceneModelState ).targetDetectionTime;
  assert.ok(
    targetDetectionTime > deterministicScreenArrivalTime,
    'screen hit is sampled after the packet midpoint reaches the screen'
  );

  scene.step( deterministicScreenArrivalTime + 1e-6 );
  assert.strictEqual( scene.totalHitsProperty.value, 0, 'no detector-screen hit at midpoint arrival' );

  scene.step( targetDetectionTime - deterministicScreenArrivalTime );

  assert.strictEqual( scene.totalHitsProperty.value, 1, 'detector-screen hit occurs at sampled later threshold' );
} );

QUnit.test( 'packet solver physical time conversion matches effective wave speed', assert => {
  const scene = createScene();
  const visualDt = 0.75;
  const physicalDt = scene.getPhysicalDt( visualDt );

  assert.ok( physicalDt > 0, 'positive visual dt produces positive physical dt' );
  assertApproximately(
    assert,
    scene.waveSolver.getDisplayPropagationSpeed() * visualDt / physicalDt,
    scene.getEffectiveWaveSpeed(),
    'display distance divided by physical time equals photon speed'
  );
  assert.strictEqual( scene.getPhysicalDt( -1 ), 0, 'negative visual dt produces zero physical dt' );
} );
