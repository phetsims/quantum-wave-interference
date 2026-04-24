// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type AnalyticalWaveParameters, type ComplexValue, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';

QUnit.module( 'AnalyticalModel' );

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

const assertComplexApproximately = (
  assert: Assert,
  actual: ComplexValue,
  expected: ComplexValue,
  message: string,
  epsilon = EPSILON
): void => {
  assertApproximately( assert, actual.re, expected.re, `${message} re`, epsilon );
  assertApproximately( assert, actual.im, expected.im, `${message} im`, epsilon );
};

const createPlaneParameters = ( options?: {
  startTime?: number | null;
  stopTime?: number | null;
  speed?: number;
  waveNumber?: number;
  obstacle?: AnalyticalWaveParameters['obstacle'];
} ): AnalyticalWaveParameters => ( {
  source: {
    kind: 'plane',
    waveNumber: options?.waveNumber ?? 2 * Math.PI,
    speed: options?.speed ?? 1,
    startTime: options?.startTime === undefined ? 0 : options.startTime,
    stopTime: options?.stopTime === undefined ? null : options.stopTime
  },
  obstacle: options?.obstacle ?? { kind: 'none' }
} );

const createDoubleSlitObstacle = ( options?: {
  topOpen?: boolean;
  bottomOpen?: boolean;
  coherent?: boolean;
  slitWidth?: number;
} ): AnalyticalWaveParameters['obstacle'] => {
  const coherent = options?.coherent ?? true;
  return {
    kind: 'doubleSlit',
    barrierX: 1,
    slits: [
      {
        source: 'topSlit',
        centerY: -0.25,
        width: options?.slitWidth ?? 0.12,
        isOpen: options?.topOpen ?? true,
        coherenceGroup: coherent ? 'slits' : 'topPath'
      },
      {
        source: 'bottomSlit',
        centerY: 0.25,
        width: options?.slitWidth ?? 0.12,
        isOpen: options?.bottomOpen ?? true,
        coherenceGroup: coherent ? 'slits' : 'bottomPath'
      }
    ]
  };
};

QUnit.test( 'plane wave source timing and phase', assert => {
  const parameters = createPlaneParameters( { waveNumber: Math.PI, speed: 2 } );

  assert.deepEqual(
    evaluateAnalyticalSample( parameters, 1, 0, 0.25 ),
    { kind: 'unreached' },
    'retarded source timing has not reached x=1 at t=0.25'
  );

  const sample = evaluateAnalyticalSample( parameters, 1, 0, 1 );
  assert.strictEqual( sample.kind, 'field', 'plane wave has reached x=1 at t=1' );
  if ( sample.kind === 'field' ) {
    assert.strictEqual( sample.components.length, 1, 'plane wave has one component' );
    assertComplexApproximately( assert, sample.components[ 0 ].value, { re: -1, im: 0 }, 'plane wave phase' );
    assertApproximately( assert, computeSampleIntensity( sample ), 1, 'plane wave intensity' );
  }
} );

QUnit.test( 'double slit barrier distinguishes aperture, absorbed barrier, and blocked downstream region', assert => {
  const obstacle = createDoubleSlitObstacle( { topOpen: true, bottomOpen: false } );
  const parameters = createPlaneParameters( { obstacle: obstacle } );

  assert.strictEqual(
    evaluateAnalyticalSample( parameters, 1, -0.25, 2 ).kind,
    'field',
    'open top aperture transmits a field sample'
  );
  assert.strictEqual(
    evaluateAnalyticalSample( parameters, 1, 0.25, 2 ).kind,
    'absorbed',
    'closed bottom aperture is absorbing barrier material'
  );

  const allBlockedParameters = createPlaneParameters( {
    obstacle: createDoubleSlitObstacle( { topOpen: false, bottomOpen: false } )
  } );
  assert.strictEqual(
    evaluateAnalyticalSample( allBlockedParameters, 1.2, 0, 5 ).kind,
    'blocked',
    'downstream region with no open slits is blocked, not merely unreached'
  );
} );

QUnit.test( 'coherent and decoherent slit components produce different total intensities', assert => {
  const coherentParameters = createPlaneParameters( {
    obstacle: createDoubleSlitObstacle( { coherent: true } )
  } );
  const decoherentParameters = createPlaneParameters( {
    obstacle: createDoubleSlitObstacle( { coherent: false } )
  } );

  const coherentSample = evaluateAnalyticalSample( coherentParameters, 2, 0, 4 );
  const decoherentSample = evaluateAnalyticalSample( decoherentParameters, 2, 0, 4 );

  assert.strictEqual( coherentSample.kind, 'field', 'coherent sample is field' );
  assert.strictEqual( decoherentSample.kind, 'field', 'decoherent sample is field' );

  if ( coherentSample.kind === 'field' && decoherentSample.kind === 'field' ) {
    assert.strictEqual( coherentSample.components.length, 2, 'coherent case keeps both slit components' );
    assert.strictEqual( decoherentSample.components.length, 2, 'decoherent case keeps both slit components' );
    assert.strictEqual(
      coherentSample.components[ 0 ].coherenceGroup,
      coherentSample.components[ 1 ].coherenceGroup,
      'coherent slits share a coherence group'
    );
    assert.notEqual(
      decoherentSample.components[ 0 ].coherenceGroup,
      decoherentSample.components[ 1 ].coherenceGroup,
      'decoherent slits use separate coherence groups'
    );

    const coherentIntensity = computeSampleIntensity( coherentSample );
    const decoherentIntensity = computeSampleIntensity( decoherentSample );
    assert.ok( coherentIntensity > decoherentIntensity, 'constructive coherent centerline is brighter than decoherent sum' );
  }
} );

QUnit.test( 'zero-amplitude diffraction node is still a field sample, not ether', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: 20 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  // For lambda=0.1 and slit width=0.4, the first single-slit zero occurs at sin(theta)=0.25.
  const x = 2;
  const slitY = -0.25;
  const xPastBarrier = x - 1;
  const sinTheta = 0.25;
  const y = slitY + xPastBarrier * sinTheta / Math.sqrt( 1 - sinTheta * sinTheta );
  const sample = evaluateAnalyticalSample( parameters, x, y, 5 );

  assert.strictEqual( sample.kind, 'field', 'diffraction node is still physically reached field' );
  assert.ok( computeSampleIntensity( sample ) < 1e-24, 'single-slit sinc zero has negligible intensity' );
} );

QUnit.test( 'gaussian packet source moves and broadens analytically', assert => {
  const parameters: AnalyticalWaveParameters = {
    source: {
      kind: 'gaussianPacket',
      isActive: true,
      waveNumber: 2 * Math.PI,
      speed: 1,
      initialCenterX: -0.5,
      centerY: 0,
      sigmaX0: 0.2,
      sigmaY0: 0.2,
      longitudinalSpreadTime: 2,
      transverseSpreadTime: 2
    },
    obstacle: { kind: 'none' }
  };

  const early = evaluateAnalyticalSample( parameters, -0.5, 0, 0 );
  const laterAtOldCenter = evaluateAnalyticalSample( parameters, -0.5, 0, 1 );
  const laterAtNewCenter = evaluateAnalyticalSample( parameters, 0.5, 0, 1 );

  assert.strictEqual( early.kind, 'field', 'packet is present at initial center' );
  assert.strictEqual( laterAtOldCenter.kind, 'field', 'old center remains finite after spreading' );
  assert.strictEqual( laterAtNewCenter.kind, 'field', 'packet reaches new center' );

  assert.ok(
    computeSampleIntensity( laterAtNewCenter ) > computeSampleIntensity( laterAtOldCenter ),
    'packet center moves to the right'
  );
  assert.ok(
    computeSampleIntensity( laterAtNewCenter ) < computeSampleIntensity( early ),
    'packet peak decreases as it spreads'
  );
} );
