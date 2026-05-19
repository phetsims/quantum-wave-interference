// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for shared screen-model time controls.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import HighIntensityModel from '../../high-intensity/model/HighIntensityModel.js';
import HighIntensitySceneModel, { DETECTOR_SCREEN_HIT_RATE } from '../../high-intensity/model/HighIntensitySceneModel.js';

QUnit.module( 'BaseScreenModel' );

const EPSILON = 1e-12;
const ANTI_STROBE_FRAME_RATE = 30;

// Leave margin below the 0.5 cycles/frame Nyquist threshold to avoid visible phase strobing.
const MAX_HIGH_INTENSITY_CYCLES_PER_FRAME = 0.46;

const assertApproximately = (
  assert: Assert,
  actual: number,
  expected: number,
  message: string,
  epsilon = EPSILON
): void => {
  assert.ok( Math.abs( actual - expected ) <= Math.abs( expected ) * epsilon, `${message}: expected ${expected}, got ${actual}` );
};

const prepareHighIntensitySceneForHits = ( scene: HighIntensitySceneModel ): void => {
  scene.isEmittingProperty.value = true;
  const dt = 1 / 60;
  for ( let i = 0; i < 600; i++ ) {
    scene.step( dt );
    if ( scene.hasWavefrontReachedScreen() ) {
      scene.detectionModeProperty.value = 'hits';
      return;
    }
  }
  throw new Error( 'wavefront did not reach screen during test setup' );
};

QUnit.test( 'pause advances neither solver nor stopwatch', assert => {
  const model = new HighIntensityModel( { tandem: Tandem.OPT_OUT } );
  const scene = model.sceneProperty.value;

  model.stopwatch.isRunningProperty.value = true;
  model.isPlayingProperty.value = false;

  const initialSolverTime = scene.waveSolver.getTime();
  const initialStopwatchTime = model.stopwatch.timeProperty.value;

  model.step( 1 );

  assert.strictEqual( scene.waveSolver.getTime(), initialSolverTime, 'solver time does not advance while paused' );
  assert.strictEqual( model.stopwatch.timeProperty.value, initialStopwatchTime, 'stopwatch time does not advance while paused' );
} );

QUnit.test( 'time speeds preserve measured physical wave speed', assert => {
  [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ].forEach( timeSpeed => {
    const model = new HighIntensityModel( { tandem: Tandem.OPT_OUT } );
    const scene = model.sceneProperty.value;

    model.stopwatch.isRunningProperty.value = true;
    model.timeSpeedProperty.value = timeSpeed;

    const displayPropagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
    const effectiveWaveSpeed = scene.getEffectiveWaveSpeed();
    model.step( 1 );

    const visualDt = scene.waveSolver.getTime();
    const physicalDt = model.stopwatch.timeProperty.value;

    assert.ok( physicalDt > 0, `${timeSpeed.name} advances physical stopwatch time` );
    assertApproximately(
      assert,
      displayPropagationSpeed * visualDt / physicalDt,
      effectiveWaveSpeed,
      `${timeSpeed.name} display distance divided by stopwatch time equals physical speed`
    );
  } );
} );

QUnit.test( 'High Intensity time speeds stay below anti-strobe phase budget', assert => {
  const model = new HighIntensityModel( { tandem: Tandem.OPT_OUT } );
  const frameDt = 1 / ANTI_STROBE_FRAME_RATE;

  model.scenes.forEach( scene => {
    if ( scene.sourceType === 'photons' ) {
      scene.wavelengthProperty.value = scene.wavelengthProperty.range.min;
    }
    else {
      scene.velocityProperty.value = scene.velocityRange.max;
    }

    [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ].forEach( timeSpeed => {
      model.timeSpeedProperty.value = timeSpeed;
      const cyclesPerFrame = scene.waveSolver.getDisplayPropagationSpeed() *
                             model.getEffectiveDt( frameDt ) /
                             scene.getEffectiveWavelength();

      assert.ok(
        cyclesPerFrame < MAX_HIGH_INTENSITY_CYCLES_PER_FRAME,
        `${scene.sourceType} ${timeSpeed.name} advances ${cyclesPerFrame} cycles per ${ANTI_STROBE_FRAME_RATE} FPS frame`
      );
    } );
  } );
} );

QUnit.test( 'High Intensity Hits mode rate scales with time speed', assert => {
  const realDt = 0.4;

  [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ].forEach( timeSpeed => {
    const model = new HighIntensityModel( { tandem: Tandem.OPT_OUT } );
    const scene = model.sceneProperty.value;

    prepareHighIntensitySceneForHits( scene );
    model.timeSpeedProperty.value = timeSpeed;
    model.step( realDt );

    const expectedHits = Math.floor( DETECTOR_SCREEN_HIT_RATE * model.getEffectiveDt( realDt ) );
    assert.strictEqual(
      scene.totalHitsProperty.value,
      expectedHits,
      `${timeSpeed.name} creates detector-screen hits according to effective dt`
    );
  } );
} );

QUnit.test( 'stepOnce advances stopwatch by physical time', assert => {
  const model = new HighIntensityModel( { tandem: Tandem.OPT_OUT } );
  const scene = model.sceneProperty.value;
  const nominalDt = model.getNominalStepDt();
  const expectedPhysicalDt = scene.getPhysicalDt( nominalDt );

  model.isPlayingProperty.value = false;
  model.stopwatch.isRunningProperty.value = true;
  model.stepOnce();

  assert.strictEqual( scene.waveSolver.getTime(), nominalDt, 'stepOnce advances visual solver by one nominal step' );
  assertApproximately(
    assert,
    model.stopwatch.timeProperty.value,
    expectedPhysicalDt,
    'stepOnce advances stopwatch by converted physical time'
  );
} );
