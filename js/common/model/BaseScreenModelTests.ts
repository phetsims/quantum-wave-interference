// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for shared screen-model time controls.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import HighIntensityModel from '../../high-intensity/model/HighIntensityModel.js';

QUnit.module( 'BaseScreenModel' );

const EPSILON = 1e-12;

const assertApproximately = (
  assert: Assert,
  actual: number,
  expected: number,
  message: string,
  epsilon = EPSILON
): void => {
  assert.ok( Math.abs( actual - expected ) <= Math.abs( expected ) * epsilon, `${message}: expected ${expected}, got ${actual}` );
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
