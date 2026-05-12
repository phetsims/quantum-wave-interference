// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for analytical detector-screen rasterization helpers.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { getAnalyticalSingleSlitEnvelopeIntensity, getExactAnalyticalDetectorIntensity } from '../model/AnalyticalDetectorPattern.js';
import { getApparentAnalyticalDetectorIntensity, type ApparentAnalyticalDetectorPatternOptions } from './ApparentDetectorPattern.js';

QUnit.module( 'ApparentDetectorPattern' );

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

const createDoubleSlitOptions = (): ApparentAnalyticalDetectorPatternOptions => ( {
  positionOnScreen: 0.001,
  sampleWidthOnScreen: 1e-6,
  effectiveWavelength: 500e-9,
  screenDistance: 0.6,
  slitWidth: 20e-6,
  slitSeparation: 0.25e-3,
  slitSetting: 'bothOpen'
} );

QUnit.test( 'resolved double-slit pattern uses exact analytical intensity', assert => {
  const options = createDoubleSlitOptions();
  options.sampleWidthOnScreen = 1e-7;

  assertApproximately(
    assert,
    getApparentAnalyticalDetectorIntensity( options ),
    getExactAnalyticalDetectorIntensity( options ),
    'resolved fringes should render exactly'
  );
} );

QUnit.test( 'unresolved double-slit pattern blends to bright-biased envelope', assert => {
  const effectiveWavelength = 500e-9;
  const screenDistance = 0.6;
  const slitSeparation = 0.25e-3;

  // First dark fringe, where exact double-slit intensity is near zero but the single-slit envelope is bright.
  const positionOnScreen = screenDistance * effectiveWavelength / ( 2 * slitSeparation );
  const options = createDoubleSlitOptions();
  options.positionOnScreen = positionOnScreen;
  options.sampleWidthOnScreen = 0.005;
  options.effectiveWavelength = effectiveWavelength;
  options.screenDistance = screenDistance;
  options.slitSeparation = slitSeparation;

  const exactIntensity = getExactAnalyticalDetectorIntensity( options );
  const envelopeIntensity = getAnalyticalSingleSlitEnvelopeIntensity(
    positionOnScreen,
    effectiveWavelength,
    screenDistance,
    options.slitWidth
  );
  const apparentIntensity = getApparentAnalyticalDetectorIntensity( options );

  assert.ok( exactIntensity < 1e-6, 'chosen position is a dark fringe in the exact pattern' );
  assertApproximately( assert, apparentIntensity, envelopeIntensity, 'unresolved fringes render as envelope' );
  assert.ok( apparentIntensity > exactIntensity, 'unresolved rendering is bright-biased' );
} );

QUnit.test( 'single-slit and which-path patterns are unchanged by sample footprint', assert => {
  const hugeSampleWidth = 0.02;

  for ( const slitSetting of [ 'leftCovered', 'rightCovered', 'leftDetector', 'rightDetector', 'bothDetectors' ] as const ) {
    const options = createDoubleSlitOptions();
    options.sampleWidthOnScreen = hugeSampleWidth;
    options.slitSetting = slitSetting;

    assertApproximately(
      assert,
      getApparentAnalyticalDetectorIntensity( options ),
      getExactAnalyticalDetectorIntensity( options ),
      `${slitSetting} should not be filtered`
    );
  }
} );
