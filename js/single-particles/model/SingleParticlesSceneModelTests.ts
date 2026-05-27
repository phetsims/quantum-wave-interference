// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for SingleParticlesSceneModel packet timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { getDisplaySlitLayout } from '../../common/getDisplaySlitLayout.js';
import { type DecoherenceEvent, type GaussianPacketReEmission } from '../../common/model/AnalyticalWaveKernel.js';
import inverseStandardNormalCDF from '../../common/model/inverseStandardNormalCDF.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import SingleParticlesSceneModel, { SCREEN_DETECTION_TIMING_PARAMETERS } from './SingleParticlesSceneModel.js';

QUnit.module( 'SingleParticlesSceneModel' );

const EPSILON = 1e-10;

const EXPECTED_SLIT_SEPARATIONS: Record<SourceType, { min: number; max: number; defaultValue: number }> = {
  photons: {
    min: 0.001,
    max: 0.003,
    defaultValue: 0.002
  },
  electrons: {
    min: 1e-6,
    max: 3e-6,
    defaultValue: 2e-6
  },
  neutrons: {
    min: 1e-6,
    max: 3e-6,
    defaultValue: 2e-6
  },
  heliumAtoms: {
    min: 0.10e-6,
    max: 0.50e-6,
    defaultValue: 0.30e-6
  }
};

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

const createScene = ( sourceType: SourceType = 'photons' ): TestSingleParticlesSceneModel => {
  const scene = new TestSingleParticlesSceneModel( {
    sourceType: sourceType,
    tandem: Tandem.OPT_OUT
  } );
  scene.slitConfigurationProperty.value = 'leftDetector';
  return scene;
};

const getVisualSlitSeparation = ( scene: SingleParticlesSceneModel, slitSeparation: number ): number => {
  const { displaySlitSeparation } = getDisplaySlitLayout(
    slitSeparation * 1e-3,
    scene.slitSeparationRange.min * 1e-3,
    scene.slitSeparationRange.max * 1e-3,
    scene.regionHeight
  );
  return displaySlitSeparation / scene.regionHeight * QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
};

const getDeterministicSlitArrivalTime = ( scene: SingleParticlesSceneModel ): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
  return ( scene.slitPositionFractionProperty.value * scene.regionWidth - initialCenterX ) / propagationSpeed;
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

const getDetectionTimeForWeight = (
  scene: SingleParticlesSceneModel,
  targetX: number,
  sourceX: number,
  detectionWeight: number
): number => {
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
  const sampledCenterOffset = inverseStandardNormalCDF( detectionWeight ) * sigmaX0;

  return ( targetX - sourceX - initialCenterX + sampledCenterOffset ) / propagationSpeed;
};

const getOnSlitDetectionTimeForWeight = (
  scene: SingleParticlesSceneModel,
  detectionWeight: number
): number => {
  return getDetectionTimeForWeight(
    scene,
    scene.slitPositionFractionProperty.value * scene.regionWidth,
    0,
    detectionWeight
  );
};

const getSampleDoubleForDetectionWeight = ( detectionWeight: number ): number => {
  const parameters = SCREEN_DETECTION_TIMING_PARAMETERS;
  affirm(
    detectionWeight >= parameters.startWeight && detectionWeight <= parameters.endWeight,
    'stubbed detection weight should be within the configured sampling interval'
  );

  return ( detectionWeight - parameters.startWeight ) / ( parameters.endWeight - parameters.startWeight );
};

const withStubbedDoubles = ( doubleValues: number[], callback: () => void ): void => {
  const originalNextDouble = dotRandom.nextDouble;
  let index = 0;

  dotRandom.nextDouble = () => {
    affirm( index < doubleValues.length, 'stubbed double values exhausted' );
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

const withStubbedDetectionWeights = ( detectionWeights: number[], callback: () => void ): void => {
  const doubleValues: number[] = [];
  detectionWeights.forEach( detectionWeight => {
    doubleValues.push( getSampleDoubleForDetectionWeight( detectionWeight ), 0 );
  } );
  withStubbedDoubles( doubleValues, callback );
};

QUnit.test( 'on-slit detector peak sample is centered on deterministic slit arrival', assert => {
  const scene = createScene();
  const deterministicSlitArrivalTime = getDeterministicSlitArrivalTime( scene );

  withStubbedDetectionWeights( [
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight,
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight
  ], () => {
    scene.emitPacket();
    scene.step( deterministicSlitArrivalTime + 1e-6 );
  } );

  assert.strictEqual( scene.decoherenceEventTimes.length, 1, 'one on-slit decoherence check occurred' );
  assertApproximately(
    assert,
    scene.decoherenceEventTimes[ 0 ],
    deterministicSlitArrivalTime,
    'peak packet-weight sample matches the deterministic slit arrival time'
  );
} );

QUnit.test( 'packet timing uses configured start offset', assert => {
  const scene = createScene();
  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const startOffset = QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;

  assert.strictEqual( QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS, 2, 'packet starts two sigma widths before the visible region' );
  assertApproximately(
    assert,
    getDeterministicSlitArrivalTime( scene ),
    ( scene.slitPositionFractionProperty.value * scene.regionWidth + startOffset ) / propagationSpeed,
    'slit arrival includes the configured start offset'
  );
  assertApproximately(
    assert,
    getDeterministicScreenArrivalTime( scene ),
    ( scene.regionWidth + startOffset ) / propagationSpeed,
    'screen arrival includes the configured start offset'
  );
} );

QUnit.test( 'single-particles slit separation ranges use requested values', assert => {
  ( Object.keys( EXPECTED_SLIT_SEPARATIONS ) as SourceType[] ).forEach( sourceType => {
    const scene = createScene( sourceType );
    const expected = EXPECTED_SLIT_SEPARATIONS[ sourceType ];

    assertApproximately( assert, scene.slitSeparationRange.min, expected.min, `${sourceType} slit separation minimum` );
    assertApproximately( assert, scene.slitSeparationRange.max, expected.max, `${sourceType} slit separation maximum` );
    assertApproximately( assert, scene.slitSeparationProperty.value, expected.defaultValue, `${sourceType} slit separation default` );
  } );
} );

QUnit.test( 'neutron wave visualizer scale matches electrons', assert => {
  const electronsScene = createScene( 'electrons' );
  const neutronsScene = createScene( 'neutrons' );

  assert.strictEqual( neutronsScene.regionWidth, electronsScene.regionWidth, 'neutron region width matches electron region width' );
  assert.strictEqual( neutronsScene.regionHeight, electronsScene.regionHeight, 'neutron region height matches electron region height' );
} );

QUnit.test( 'neutron and helium atom slit separations visually match electrons', assert => {
  const electronsScene = createScene( 'electrons' );
  const neutronsScene = createScene( 'neutrons' );
  const heliumAtomsScene = createScene( 'heliumAtoms' );

  const electronMinVisualSeparation = getVisualSlitSeparation( electronsScene, electronsScene.slitSeparationRange.min );
  const electronDefaultVisualSeparation = getVisualSlitSeparation( electronsScene, electronsScene.slitSeparationProperty.value );
  const electronMaxVisualSeparation = getVisualSlitSeparation( electronsScene, electronsScene.slitSeparationRange.max );

  for ( const scene of [ neutronsScene, heliumAtomsScene ] ) {
    assertApproximately(
      assert,
      getVisualSlitSeparation( scene, scene.slitSeparationRange.min ),
      electronMinVisualSeparation,
      `${scene.sourceType} minimum visual separation matches electrons`
    );
    assertApproximately(
      assert,
      getVisualSlitSeparation( scene, scene.slitSeparationProperty.value ),
      electronDefaultVisualSeparation,
      `${scene.sourceType} default visual separation matches electrons`
    );
    assertApproximately(
      assert,
      getVisualSlitSeparation( scene, scene.slitSeparationRange.max ),
      electronMaxVisualSeparation,
      `${scene.sourceType} maximum visual separation matches electrons`
    );
  }
} );

QUnit.test( 'clearScreen stops non-auto-repeat packet without re-emitting', assert => {
  const scene = createScene();
  scene.isEmittingProperty.value = true;
  scene.emitPacket();

  assert.true( scene.isPacketActiveProperty.value, 'packet is active before clearing' );
  assert.false( scene.isEmitterEnabledProperty.value, 'emitter button is disabled while non-auto-repeat packet is active' );

  scene.clearScreen();

  assert.false( scene.isEmittingProperty.value, 'clearing turns off source when auto-repeat is disabled' );
  assert.false( scene.isPacketActiveProperty.value, 'clearing cancels the active packet' );
  assert.true( scene.isEmitterEnabledProperty.value, 'emitter button is re-enabled after clearing' );

  scene.step( 1 );

  assert.false( scene.isPacketActiveProperty.value, 'packet is not re-emitted on the next step' );
  assert.strictEqual( scene.totalHitsProperty.value, 0, 'detector screen remains clear' );
} );

QUnit.test( 'clearScreen preserves auto-repeat re-emission', assert => {
  const scene = createScene();
  scene.autoRepeatProperty.value = true;
  scene.isEmittingProperty.value = true;
  scene.emitPacket();

  scene.clearScreen();

  assert.true( scene.isEmittingProperty.value, 'clearing keeps source on when auto-repeat is enabled' );
  assert.false( scene.isPacketActiveProperty.value, 'clearing cancels the current packet before the next repeat' );
  assert.true( scene.isEmitterEnabledProperty.value, 'emitter button remains enabled in auto-repeat mode' );

  scene.step( 0 );

  assert.true( scene.isPacketActiveProperty.value, 'auto-repeat emits a new packet on the next step' );
} );

QUnit.test( 'slit configuration clear stops non-auto-repeat packet without re-emitting', assert => {
  const scene = createScene();
  scene.isEmittingProperty.value = true;
  scene.emitPacket();

  scene.slitConfigurationProperty.value = 'rightDetector';

  assert.false( scene.isEmittingProperty.value, 'slit configuration clear turns off source when auto-repeat is disabled' );
  assert.false( scene.isPacketActiveProperty.value, 'slit configuration clear cancels the active packet' );
  assert.true( scene.isEmitterEnabledProperty.value, 'emitter button is re-enabled after slit configuration clear' );

  scene.step( 1 );

  assert.false( scene.isPacketActiveProperty.value, 'packet is not re-emitted after slit configuration clear' );
  assert.strictEqual( scene.totalHitsProperty.value, 0, 'detector screen remains clear after slit configuration change' );
} );

QUnit.test( 'on-slit detector uses shared packet-weight timing curve', assert => {
  const earlyScene = createScene();
  const earlyDetectionWeight = ( SCREEN_DETECTION_TIMING_PARAMETERS.startWeight +
                                 SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight ) / 2;
  const earlyDeterministicSlitArrivalTime = getDeterministicSlitArrivalTime( earlyScene );
  const earlyOnSlitDetectionTime = getOnSlitDetectionTimeForWeight( earlyScene, earlyDetectionWeight );

  assert.ok(
    earlyOnSlitDetectionTime < earlyDeterministicSlitArrivalTime,
    'weights before 0.5 produce on-slit detection before packet center arrival'
  );

  withStubbedDetectionWeights( [
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight,
    earlyDetectionWeight
  ], () => {
    earlyScene.emitPacket();
    earlyScene.step( earlyOnSlitDetectionTime + 1e-6 );
  } );

  assert.strictEqual( earlyScene.decoherenceEventTimes.length, 1, 'early event occurs at sampled threshold' );
  assertApproximately(
    assert,
    earlyScene.decoherenceEventTimes[ 0 ],
    earlyOnSlitDetectionTime,
    'early event time is the sampled on-slit detection time'
  );

  const lateScene = createScene();
  const lateDetectionWeight = ( SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight +
                                SCREEN_DETECTION_TIMING_PARAMETERS.endWeight ) / 2;
  const lateDeterministicSlitArrivalTime = getDeterministicSlitArrivalTime( lateScene );
  const lateOnSlitDetectionTime = getOnSlitDetectionTimeForWeight( lateScene, lateDetectionWeight );
  const beforeLateDetectionTime = lateDeterministicSlitArrivalTime +
                                  ( lateOnSlitDetectionTime - lateDeterministicSlitArrivalTime ) / 2;

  assert.ok(
    lateOnSlitDetectionTime > lateDeterministicSlitArrivalTime,
    'weights after 0.5 produce on-slit detection after packet center arrival'
  );

  withStubbedDetectionWeights( [
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight,
    lateDetectionWeight
  ], () => {
    lateScene.emitPacket();

    lateScene.step( beforeLateDetectionTime );
    assert.strictEqual( lateScene.decoherenceEventTimes.length, 0, 'no late event before sampled threshold' );

    lateScene.step( lateOnSlitDetectionTime - beforeLateDetectionTime + 1e-6 );
  } );

  assert.strictEqual( lateScene.decoherenceEventTimes.length, 1, 'late event occurs at sampled threshold' );
  assertApproximately(
    assert,
    lateScene.decoherenceEventTimes[ 0 ],
    lateOnSlitDetectionTime,
    'late event time is the sampled on-slit detection time'
  );
} );

QUnit.test( 'slit-detector packet re-emission uses sampled event time', assert => {
  const scene = createScene();
  const deterministicSlitArrivalTime = getDeterministicSlitArrivalTime( scene );
  const sampledDetectionWeight = ( SCREEN_DETECTION_TIMING_PARAMETERS.startWeight +
                                   SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight ) / 2;
  const sampledOnSlitDetectionTime = getOnSlitDetectionTimeForWeight( scene, sampledDetectionWeight );
  scene.decoherenceEvent = {
    time: -1,
    selectedSlit: 'topSlit',
    clickedDetectorSlit: 'topSlit'
  };

  withStubbedDetectionWeights( [
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight,
    sampledDetectionWeight,
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight
  ], () => {
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

QUnit.test( 'screen detection timing peak sample matches packet midpoint', assert => {
  const scene = createScene();
  scene.slitConfigurationProperty.value = 'bothOpen';

  const deterministicScreenArrivalTime = getDeterministicScreenArrivalTime( scene );

  withStubbedDetectionWeights( [
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight,
    SCREEN_DETECTION_TIMING_PARAMETERS.peakWeight
  ], () => {
    scene.emitPacket();
  } );

  const targetDetectionTime = ( scene as unknown as PrivateSingleParticlesSceneModelState ).targetDetectionTime;
  assertApproximately(
    assert,
    targetDetectionTime,
    deterministicScreenArrivalTime,
    'screen hit peak sample matches the packet midpoint arrival'
  );

  scene.step( targetDetectionTime + 1e-6 );

  assert.strictEqual( scene.totalHitsProperty.value, 1, 'detector-screen hit occurs at sampled threshold' );
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
