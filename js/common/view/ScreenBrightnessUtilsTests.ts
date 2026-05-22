// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for detector screen brightness mapping.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { getHighIntensityIntensityDisplayGain, getIntensityDisplayGain, HIGH_INTENSITY_INTENSITY_DISPLAY_GAIN_MAX, HIGH_INTENSITY_INTENSITY_DISPLAY_GAIN_MIN } from './ScreenBrightnessUtils.js';

QUnit.module( 'ScreenBrightnessUtils' );

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

QUnit.test( 'High Intensity Average Intensity brightness uses dimmer display range', assert => {
  const sourceIntensity = 1;
  const oldMinimumGain = getIntensityDisplayGain( 0, sourceIntensity );
  const oldDefaultGain = getIntensityDisplayGain( 0.5, sourceIntensity );

  assert.ok(
    getHighIntensityIntensityDisplayGain( 0, sourceIntensity ) < oldMinimumGain,
    'new minimum gain is below the previous minimum'
  );
  assert.strictEqual(
    getHighIntensityIntensityDisplayGain( 0, sourceIntensity ),
    HIGH_INTENSITY_INTENSITY_DISPLAY_GAIN_MIN,
    'new minimum gain uses the configured High Intensity minimum'
  );
  assertApproximately(
    assert,
    getHighIntensityIntensityDisplayGain( 0.5, sourceIntensity ),
    1.08,
    'new default gain remains close to the previous minimum'
  );
  assert.strictEqual(
    getHighIntensityIntensityDisplayGain( 1, sourceIntensity ),
    HIGH_INTENSITY_INTENSITY_DISPLAY_GAIN_MAX,
    'new maximum gain uses the configured High Intensity maximum'
  );
  assert.strictEqual(
    getHighIntensityIntensityDisplayGain( 1, sourceIntensity ),
    oldDefaultGain,
    'new maximum gain matches the previous default gain'
  );
  assertApproximately(
    assert,
    getHighIntensityIntensityDisplayGain( 0.5, 0.4 ),
    getHighIntensityIntensityDisplayGain( 0.5, sourceIntensity ) * 0.4,
    'source intensity scales the display gain'
  );
} );
