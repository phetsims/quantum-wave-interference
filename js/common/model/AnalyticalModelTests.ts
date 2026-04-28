// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type AnalyticalWaveParameters, type ComplexValue, computeSampleIntensity, evaluateAnalyticalSample, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import { getFieldSampleRGBA, rasterizeAnalyticalWave, UNREACHED_VACUUM } from './AnalyticalWaveRasterizer.js';
import AnalyticalWaveSolver from './AnalyticalWaveSolver.js';
import AnalyticalWavePacketSolver from './AnalyticalWavePacketSolver.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

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

const complexDistance = ( a: ComplexValue, b: ComplexValue ): number =>
  Math.sqrt( ( a.re - b.re ) * ( a.re - b.re ) + ( a.im - b.im ) * ( a.im - b.im ) );

const phaseDifference = ( a: ComplexValue, b: ComplexValue ): number => {
  const rawDifference = Math.atan2( b.im, b.re ) - Math.atan2( a.im, a.re );
  return Math.atan2( Math.sin( rawDifference ), Math.cos( rawDifference ) );
};

const intensityAt = ( parameters: AnalyticalWaveParameters, x: number, y: number, t: number ): number =>
  computeSampleIntensity( evaluateAnalyticalSample( parameters, x, y, t ) );

const hasNonZeroAmplitude = ( amplitudes: Float64Array ): boolean => {
  for ( let i = 0; i < amplitudes.length; i++ ) {
    if ( Math.abs( amplitudes[ i ] ) > EPSILON ) {
      return true;
    }
  }
  return false;
};

const integrateIntensity = (
  parameters: AnalyticalWaveParameters,
  bounds: { minX: number; maxX: number; minY: number; maxY: number },
  t: number,
  nx: number,
  ny: number
): number => {
  const dx = ( bounds.maxX - bounds.minX ) / nx;
  const dy = ( bounds.maxY - bounds.minY ) / ny;
  let sum = 0;

  for ( let ix = 0; ix < nx; ix++ ) {
    const x = bounds.minX + ( ix + 0.5 ) * dx;
    for ( let iy = 0; iy < ny; iy++ ) {
      const y = bounds.minY + ( iy + 0.5 ) * dy;
      sum += intensityAt( parameters, x, y, t ) * dx * dy;
    }
  }

  return sum;
};

const createPlaneParameters = ( options?: {
  startTime?: number | null;
  speed?: number;
  waveNumber?: number;
  edgeTaperDistance?: number;
  obstacle?: AnalyticalWaveParameters['obstacle'];
} ): AnalyticalWaveParameters => ( {
  source: {
    kind: 'plane',
    waveNumber: options?.waveNumber ?? 2 * Math.PI,
    speed: options?.speed ?? 1,
    startTime: options?.startTime === undefined ? 0 : options.startTime,
    edgeTaperDistance: options?.edgeTaperDistance
  },
  obstacle: options?.obstacle ?? { kind: 'none' }
} );

const createGaussianPacketParameters = ( options?: {
  waveNumber?: number;
  obstacle?: AnalyticalWaveParameters['obstacle'];
  projections?: AnalyticalWaveParameters['projections'];
} ): AnalyticalWaveParameters => ( {
  source: {
    kind: 'gaussianPacket',
    isActive: true,
    waveNumber: options?.waveNumber ?? 2 * Math.PI,
    speed: 1,
    initialCenterX: -0.5,
    centerY: 0,
    sigmaX0: 0.2,
    sigmaY0: 0.2,
    longitudinalSpreadTime: 2,
    transverseSpreadTime: 2
  },
  obstacle: options?.obstacle ?? { kind: 'none' },
  projections: options?.projections
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

QUnit.test( 'symmetric apertures produce symmetric detector intensities', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    obstacle: createDoubleSlitObstacle( { coherent: true, slitWidth: 0.18 } )
  } );

  for ( const y of [ 0, 0.08, 0.17, 0.31, 0.42 ] ) {
    assertApproximately(
      assert,
      intensityAt( parameters, 2.4, y, 6 ),
      intensityAt( parameters, 2.4, -y, 6 ),
      `symmetric double-slit intensity at y=${y}`,
      1e-10
    );
  }
} );

QUnit.test( 'single open slit is symmetric about the open aperture center', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.18 } )
  } );
  const slitCenterY = -0.25;

  for ( const offset of [ 0, 0.05, 0.13, 0.25 ] ) {
    assertApproximately(
      assert,
      intensityAt( parameters, 2.4, slitCenterY + offset, 6 ),
      intensityAt( parameters, 2.4, slitCenterY - offset, 6 ),
      `single-slit intensity symmetric around open slit for offset=${offset}`,
      1e-10
    );
  }
} );

QUnit.test( 'decoherent double slit intensity equals sum of independent slit intensities', assert => {
  const decoherentParameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    obstacle: createDoubleSlitObstacle( { coherent: false, slitWidth: 0.18 } )
  } );
  const topOnlyParameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.18 } )
  } );
  const bottomOnlyParameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: false, bottomOpen: true, slitWidth: 0.18 } )
  } );

  for ( const y of [ -0.35, -0.1, 0.07, 0.28, 0.5 ] ) {
    assertApproximately(
      assert,
      intensityAt( decoherentParameters, 2.4, y, 6 ),
      intensityAt( topOnlyParameters, 2.4, y, 6 ) + intensityAt( bottomOnlyParameters, 2.4, y, 6 ),
      `decoherent intensity sum at y=${y}`,
      1e-10
    );
  }
} );

QUnit.test( 'diffracted far-field samples are field samples, not ether', assert => {
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
  const intensity = computeSampleIntensity( sample );

  assert.strictEqual( sample.kind, 'field', 'diffracted far-field point is physically reached field' );
  assert.ok( Number.isFinite( intensity ), 'diffracted far-field intensity is finite' );
} );

QUnit.test( 'single slit diffraction includes far-field aperture envelope', assert => {
  const waveNumber = 20 * Math.PI;
  const wavelength = 2 * Math.PI / waveNumber;
  const slitWidth = 0.4;
  const barrierX = 1;
  const slitCenterY = -0.25;
  const xPastBarrier = 5;
  const x = barrierX + xPastBarrier;
  const t = 20;
  const parameters = createPlaneParameters( {
    waveNumber: waveNumber,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: slitWidth } )
  } );

  const yAtSinTheta = ( sinTheta: number ): number =>
    slitCenterY + xPastBarrier * sinTheta / Math.sqrt( 1 - sinTheta * sinTheta );

  const firstMinimumSinTheta = wavelength / slitWidth;
  const centerIntensity = intensityAt( parameters, x, slitCenterY, t );
  const halfAngleIntensity = intensityAt( parameters, x, yAtSinTheta( 0.5 * firstMinimumSinTheta ), t );
  const firstMinimumIntensity = intensityAt( parameters, x, yAtSinTheta( firstMinimumSinTheta ), t );

  assert.ok(
    halfAngleIntensity > 0.25 * centerIntensity,
    'the central diffraction maximum stays bright before the first minimum'
  );
  assert.ok(
    firstMinimumIntensity < 0.02 * centerIntensity,
    `first single-slit minimum is dark relative to center: center=${centerIntensity}, minimum=${firstMinimumIntensity}`
  );
} );

QUnit.test( 'Fresnel aperture propagation is continuous inside an open aperture', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: 20 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  const yInsideTopApertureAwayFromCenter = -0.25 + 0.1;
  const atAperture = evaluateAnalyticalSample( parameters, 1, yInsideTopApertureAwayFromCenter, 5 );
  const justRightOfAperture = evaluateAnalyticalSample( parameters, 1 + 1e-6, yInsideTopApertureAwayFromCenter, 5 );

  assert.strictEqual( atAperture.kind, 'field', 'aperture point is field' );
  assert.strictEqual( justRightOfAperture.kind, 'field', 'just-right aperture point is field' );
  assertComplexApproximately(
    assert,
    getRepresentativeComplex( justRightOfAperture ),
    getRepresentativeComplex( atAperture ),
    'field is continuous across aperture opening',
    1e-10
  );
} );

// Regression test for the center artifact immediately downstream of an open aperture.
QUnit.test( 'plane wave aperture handoff is smooth in the first display cell', assert => {
  const slitWidth = 22 / 385;
  const parameters = createPlaneParameters( {
    waveNumber: 2 * Math.PI * QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: slitWidth } )
  } );

  const apertureY = -0.25;
  const atAperture = getRepresentativeComplex( evaluateAnalyticalSample( parameters, 1, apertureY, 5 ) );
  const firstDisplayCellRight = getRepresentativeComplex( evaluateAnalyticalSample( parameters, 1 + 1 / 200, apertureY, 5 ) );

  assert.ok(
    complexDistance( firstDisplayCellRight, atAperture ) < 0.12,
    'first display cell right of the aperture remains visually continuous with the aperture'
  );
} );

QUnit.test( 'plane wave reaches full open aperture simultaneously', assert => {
  const parameters = createPlaneParameters( {
    speed: 1,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  const xJustPastBarrier = 1.0001;
  const tJustPastBarrier = 1.0001;
  for ( const y of [ -0.43, -0.35, -0.25, -0.15, -0.07 ] ) {
    assert.strictEqual(
      evaluateAnalyticalSample( parameters, xJustPastBarrier, y, tJustPastBarrier ).kind,
      'field',
      `plane wave reaches open aperture at y=${y}`
    );
  }

  const yOutsideAperture = 0.03;
  assert.strictEqual(
    evaluateAnalyticalSample( parameters, xJustPastBarrier, yOutsideAperture, tJustPastBarrier ).kind,
    'unreached',
    'plane wave does not reach outside the aperture before the closest aperture edge can emit there'
  );
  assert.strictEqual(
    evaluateAnalyticalSample( parameters, xJustPastBarrier, yOutsideAperture, 1.0801 ).kind,
    'field',
    'plane wave reaches outside the aperture based on distance to the closest aperture edge'
  );
} );

QUnit.test( 'continuous wave solver restarts source after reset while source remains on', assert => {
  const solver = new AnalyticalWaveSolver( 12, 12 );
  solver.setParameters( {
    displayWavelengths: 2,
    displaySpeedScale: 1,
    regionWidth: 1,
    regionHeight: 1,
    isSourceOn: true
  } );

  solver.step( 3 );
  assert.ok( hasNonZeroAmplitude( solver.getAmplitudeField() ), 'source produces a field before reset' );

  solver.reset();
  solver.setParameters( { isSourceOn: true } );
  solver.step( 3 );

  assert.ok( hasNonZeroAmplitude( solver.getAmplitudeField() ), 'source produces a field after reset without toggling off first' );
} );

QUnit.test( 'wave packet solver reset clears source state', assert => {
  const solver = new AnalyticalWavePacketSolver();
  solver.setParameters( { isSourceOn: true } );
  solver.step( QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME );

  assert.ok( hasNonZeroAmplitude( solver.getAmplitudeField() ), 'source produces a field before reset' );

  solver.reset();

  assert.false( hasNonZeroAmplitude( solver.getAmplitudeField() ), 'source is inactive after reset' );
} );

QUnit.test( 'plane wave source gates leading edge taper', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: Math.PI,
    speed: 1,
    startTime: 0,
    edgeTaperDistance: 0.2
  } );

  const leadingEdge = intensityAt( parameters, 1, 0, 1.1 );
  const fullyOn = intensityAt( parameters, 1, 0, 1.3 );

  assert.ok( leadingEdge > 0 && leadingEdge < fullyOn, 'leading edge is smoothly tapered' );
  assertApproximately( assert, fullyOn, 1, 'fully illuminated plane wave remains unit intensity' );
} );

QUnit.test( 'extreme aperture widths remain finite', assert => {
  for ( const slitWidth of [ 1e-6, 0.01, 0.4, 1.2 ] ) {
    const parameters = createPlaneParameters( {
      waveNumber: 24 * Math.PI,
      obstacle: createDoubleSlitObstacle( { coherent: true, slitWidth: slitWidth } )
    } );

    for ( const x of [ 1, 1.001, 1.2, 2.5 ] ) {
      for ( const y of [ -0.55, -0.2, 0, 0.2, 0.55 ] ) {
        const intensity = intensityAt( parameters, x, y, 6 );
        assert.ok( Number.isFinite( intensity ), `finite intensity for slitWidth=${slitWidth}, x=${x}, y=${y}` );
      }
    }
  }
} );

QUnit.test( 'gaussian packet source moves and broadens analytically', assert => {
  const parameters = createGaussianPacketParameters();

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

QUnit.test( 'gaussian packet integrated probability is stable while spreading', assert => {
  const parameters = createGaussianPacketParameters();
  const bounds = { minX: -1.5, maxX: 1.5, minY: -1.2, maxY: 1.2 };
  const initialIntegral = integrateIntensity( parameters, bounds, 0, 72, 56 );
  const laterIntegral = integrateIntensity( parameters, bounds, 1, 72, 56 );

  assertApproximately(
    assert,
    laterIntegral / initialIntegral,
    1,
    'free packet integrated probability remains stable',
    0.01
  );
} );

QUnit.test( 'measurement projection zeros detector region and renormalizes outside', assert => {
  const unprojected = createGaussianPacketParameters();
  const projected = createGaussianPacketParameters( {
    projections: [ {
      centerX: 0.5,
      centerY: 0,
      radius: 0.2,
      measurementTime: 1,
      renormScale: 1.5
    } ]
  } );

  assertApproximately(
    assert,
    intensityAt( projected, 0.5, 0, 1 ),
    0,
    'projection removes probability at detector center'
  );
  assertApproximately(
    assert,
    intensityAt( projected, 0.5, 0.5, 1 ) / intensityAt( unprojected, 0.5, 0.5, 1 ),
    1.5 * 1.5,
    'projection renormalizes outside probability density',
    1e-10
  );
} );

QUnit.test( 'gaussian packet remains finite and continuous through slit aperture', assert => {
  const parameters = createGaussianPacketParameters( {
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );
  const apertureY = -0.25 + 0.08;
  const t = 1.5;
  const atAperture = evaluateAnalyticalSample( parameters, 1, apertureY, t );
  const justRightOfAperture = evaluateAnalyticalSample( parameters, 1 + 1e-6, apertureY, t );

  assert.strictEqual( atAperture.kind, 'field', 'packet field reaches the open aperture' );
  assert.strictEqual( justRightOfAperture.kind, 'field', 'packet field reaches just beyond the aperture' );
  assertComplexApproximately(
    assert,
    getRepresentativeComplex( justRightOfAperture ),
    getRepresentativeComplex( atAperture ),
    'packet field is continuous across the aperture opening',
    1e-10
  );

  for ( const x of [ 1, 1.001, 1.2, 1.8 ] ) {
    for ( const y of [ -0.45, -0.25, 0, 0.25, 0.45 ] ) {
      const intensity = intensityAt( parameters, x, y, t );
      assert.ok( Number.isFinite( intensity ), `finite packet intensity through slit at x=${x}, y=${y}` );
    }
  }
} );

// Regression test for the compressed post-slit wavelength: packet phase should not include the
// downstream path twice when it is also multiplied by the Fresnel aperture transfer.
QUnit.test( 'gaussian packet post-slit phase does not double-count Fresnel propagation', assert => {
  const waveNumber = 20 * Math.PI;
  const obstacle = createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } );
  const planeParameters = createPlaneParameters( {
    waveNumber: waveNumber,
    obstacle: obstacle
  } );
  const packetParameters = createGaussianPacketParameters( {
    waveNumber: waveNumber,
    obstacle: obstacle
  } );

  const y = -0.25;
  const t = 1.8;
  const x1 = 1.18;
  const x2 = 1.21;
  const planePhaseAdvance = phaseDifference(
    getRepresentativeComplex( evaluateAnalyticalSample( planeParameters, x1, y, t ) ),
    getRepresentativeComplex( evaluateAnalyticalSample( planeParameters, x2, y, t ) )
  );
  const packetPhaseAdvance = phaseDifference(
    getRepresentativeComplex( evaluateAnalyticalSample( packetParameters, x1, y, t ) ),
    getRepresentativeComplex( evaluateAnalyticalSample( packetParameters, x2, y, t ) )
  );

  assertApproximately(
    assert,
    packetPhaseAdvance,
    planePhaseAdvance,
    'packet phase advances with the same post-slit wavelength as the plane wave',
    1e-10
  );
} );

// Regression test for the packet-only aperture artifact: visibility support must not be derived from
// diffracted amplitude, because Fresnel amplitude ripples are still reached field.
QUnit.test( 'gaussian packet aperture support is independent of diffracted amplitude', assert => {
  const parameters = createGaussianPacketParameters( {
    waveNumber: 2 * Math.PI * 25.7,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 22 / 385 } )
  } );

  const sample = evaluateAnalyticalSample( parameters, 1.0119, -0.25, 1.6 );
  assert.strictEqual( sample.kind, 'field', 'diffracted packet sample is field' );

  if ( sample.kind === 'field' ) {
    assert.strictEqual( sample.components.length, 1, 'single open slit produces one component' );
    const component = sample.components[ 0 ];
    const amplitude = Math.sqrt( component.value.re * component.value.re + component.value.im * component.value.im );

    assert.ok( component.support !== undefined, 'diffracted packet component has explicit rendering support' );
    if ( component.support !== undefined ) {
      assert.ok(
        component.support > 1.2 * amplitude,
        'packet visibility support tracks the reached packet envelope instead of Fresnel amplitude ripples'
      );
    }
  }
} );

QUnit.test( 'gaussian packet after a slit is localized around radial propagation path', assert => {
  const parameters = createGaussianPacketParameters( {
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  const nearSlitPath = intensityAt( parameters, 1.2, -0.25, 1.7 );
  const farFromSlitPath = intensityAt( parameters, 1.2, 0.45, 1.7 );
  assert.ok(
    nearSlitPath > 5 * farFromSlitPath,
    'post-slit packet is localized around the expanding packet path instead of filling a vertical slab'
  );
} );

QUnit.test( 'decoherent wave rendering stochastically samples channels weighted by intensity', assert => {
  const baseColor = { red: 220, green: 120, blue: 60 };
  const decoherentSample = {
    kind: 'field' as const,
    components: [
      {
        source: 'topSlit' as const,
        coherenceGroup: 'topPath',
        support: 1,
        value: { re: 2, im: 0 }
      },
      {
        source: 'bottomSlit' as const,
        coherenceGroup: 'bottomPath',
        support: 1,
        value: { re: -1, im: 0 }
      }
    ]
  };

  let topCount = 0;
  let bottomCount = 0;
  let changedCount = 0;
  const sampleWidth = 20;
  const sampleHeight = 20;

  for ( let yIndex = 0; yIndex < sampleHeight; yIndex++ ) {
    for ( let xIndex = 0; xIndex < sampleWidth; xIndex++ ) {
      const firstColor = getFieldSampleRGBA( decoherentSample, 'realPart', baseColor, 1, {
        xIndex: xIndex,
        yIndex: yIndex,
        decoherenceFrame: 0
      } );
      const secondColor = getFieldSampleRGBA( decoherentSample, 'realPart', baseColor, 1, {
        xIndex: xIndex,
        yIndex: yIndex,
        decoherenceFrame: 1
      } );

      if ( firstColor.red > 100 ) {
        topCount++;
      }
      else {
        bottomCount++;
      }
      if ( firstColor.red !== secondColor.red ) {
        changedCount++;
      }
    }
  }

  const firstIntensityColor = getFieldSampleRGBA( decoherentSample, 'timeAveragedIntensity', baseColor, 1, {
    xIndex: 0,
    yIndex: 0,
    decoherenceFrame: 0
  } );
  const secondIntensityColor = getFieldSampleRGBA( decoherentSample, 'timeAveragedIntensity', baseColor, 1, {
    xIndex: sampleWidth - 1,
    yIndex: sampleHeight - 1,
    decoherenceFrame: 1
  } );

  assert.ok(
    topCount > 2 * bottomCount,
    `brighter top channel is selected more often than bottom channel: top=${topCount}, bottom=${bottomCount}`
  );
  assert.ok(
    bottomCount > 0,
    'lower-intensity bottom channel still appears in some cells'
  );
  assert.ok(
    changedCount > 0,
    'decoherent stochastic rendering changes as the glimmer frame advances'
  );
  assert.deepEqual(
    firstIntensityColor,
    secondIntensityColor,
    'intensity rendering remains deterministic and independent of stochastic channel sampling'
  );
} );

const appendRasterPreview = (
  title: string,
  width: number,
  height: number,
  pixels: Uint8ClampedArray,
  statusCounts: Record<string, number>
): void => {
  let container = document.getElementById( 'analytical-wave-raster-previews' );
  if ( !container ) {
    container = document.createElement( 'div' );
    container.id = 'analytical-wave-raster-previews';
    container.style.cssText = 'padding: 12px; font: 12px sans-serif; background: #222; color: white;';
    document.body.appendChild( container );

    const heading = document.createElement( 'h2' );
    heading.textContent = 'Analytical wave rasterizer previews';
    heading.style.cssText = 'margin: 0 0 8px;';
    container.appendChild( heading );
  }

  const preview = document.createElement( 'div' );
  preview.style.cssText = 'display: inline-block; margin: 8px 16px 8px 0; vertical-align: top;';

  const label = document.createElement( 'div' );
  label.textContent = `${title} ${JSON.stringify( statusCounts )}`;
  label.style.cssText = 'margin-bottom: 4px;';
  preview.appendChild( label );

  const canvas = document.createElement( 'canvas' );
  canvas.width = width;
  canvas.height = height;
  canvas.style.cssText = 'width: 240px; height: 160px; image-rendering: pixelated; border: 1px solid #555;';
  const context = canvas.getContext( '2d' )!;
  const imageData = context.createImageData( width, height );
  imageData.data.set( pixels );
  context.putImageData( imageData, 0, 0 );
  preview.appendChild( canvas );
  container.appendChild( preview );
};

QUnit.test( 'pure rasterizer renders status-aware presets', assert => {
  const baseColor = { red: 255, green: 140, blue: 80 };
  const coherentParameters = createPlaneParameters( {
    obstacle: createDoubleSlitObstacle( { coherent: true } )
  } );
  const blockedParameters = createPlaneParameters( {
    obstacle: createDoubleSlitObstacle( { topOpen: false, bottomOpen: false } )
  } );

  const coherentRaster = rasterizeAnalyticalWave( {
    parameters: coherentParameters,
    width: 80,
    height: 48,
    regionWidth: 2,
    regionHeight: 1,
    time: 4,
    displayMode: 'timeAveragedIntensity',
    baseColor: baseColor,
    amplitudeScale: 1
  } );
  const blockedRaster = rasterizeAnalyticalWave( {
    parameters: blockedParameters,
    width: 80,
    height: 48,
    regionWidth: 2,
    regionHeight: 1,
    time: 4,
    displayMode: 'timeAveragedIntensity',
    baseColor: baseColor,
    amplitudeScale: 1
  } );

  assert.ok( coherentRaster.statusCounts.field > 0, 'coherent raster has reached field pixels' );
  assert.ok( coherentRaster.statusCounts.absorbed > 0, 'coherent raster distinguishes absorbed barrier pixels' );
  assert.ok( blockedRaster.statusCounts.blocked > 0, 'blocked raster distinguishes downstream blocked pixels' );

  const zeroFieldColor = getFieldSampleRGBA( { kind: 'field', components: [] }, 'timeAveragedIntensity', baseColor, 1 );
  assert.notDeepEqual(
    zeroFieldColor,
    { red: UNREACHED_VACUUM, green: UNREACHED_VACUUM, blue: UNREACHED_VACUUM, alpha: 255 },
    'zero-intensity field is not rendered as unreached background'
  );

  const weakFrontColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [ {
      source: 'incident',
      coherenceGroup: 'incident',
      value: { re: 0.1, im: 0 }
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const fullFrontColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [ {
      source: 'incident',
      coherenceGroup: 'incident',
      value: { re: 1, im: 0 }
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const weakAmplitudeFullSupportColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [ {
      source: 'topSlit',
      coherenceGroup: 'slits',
      support: 1,
      value: { re: 0.03, im: 0 }
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const destructiveInterferenceColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [
      {
        source: 'topSlit',
        coherenceGroup: 'slits',
        value: { re: 1, im: 0 }
      },
      {
        source: 'bottomSlit',
        coherenceGroup: 'slits',
        value: { re: -1, im: 0 }
      }
    ]
  }, 'timeAveragedIntensity', baseColor, 1 );

  assert.ok(
    Math.abs( weakFrontColor.red - UNREACHED_VACUUM ) < Math.abs( fullFrontColor.red - UNREACHED_VACUUM ),
    'weak wavefront support blends closer to unreached background than full support'
  );
  assert.ok(
    Math.abs( weakAmplitudeFullSupportColor.red - UNREACHED_VACUUM ) > Math.abs( weakFrontColor.red - UNREACHED_VACUUM ),
    'weak diffracted amplitude with full wavefront support is not mistaken for unreached ether'
  );
  assert.notDeepEqual(
    destructiveInterferenceColor,
    { red: UNREACHED_VACUUM, green: UNREACHED_VACUUM, blue: UNREACHED_VACUUM, alpha: 255 },
    'destructive interference with strong component support still renders as reached field'
  );

  appendRasterPreview( 'coherent double slit', coherentRaster.width, coherentRaster.height, coherentRaster.pixels, coherentRaster.statusCounts );
  appendRasterPreview( 'all slits blocked', blockedRaster.width, blockedRaster.height, blockedRaster.pixels, blockedRaster.statusCounts );
} );
