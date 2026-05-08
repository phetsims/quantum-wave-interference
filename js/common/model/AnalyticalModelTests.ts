// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { type AnalyticalWaveParameters, computeSampleIntensity, evaluateAnalyticalLayeredSample, evaluateAnalyticalSample, getDecoherenceEventAtPassTime, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import { getFieldSampleRGBA, getLayeredFieldSampleRGBA, rasterizeAnalyticalWave, UNREACHED_VACUUM } from './AnalyticalWaveRasterizer.js';
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
  actual: Complex,
  expected: Complex,
  message: string,
  epsilon = EPSILON
): void => {
  assertApproximately( assert, actual.real, expected.real, `${message} real`, epsilon );
  assertApproximately( assert, actual.imaginary, expected.imaginary, `${message} imaginary`, epsilon );
};

const complexDistance = ( a: Complex, b: Complex ): number => a.minus( b ).magnitude;

const phaseDifference = ( a: Complex, b: Complex ): number => {
  const rawDifference = b.phase() - a.phase();
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

const sumAmplitudeProbability = ( amplitudes: Float64Array ): number => {
  let sum = 0;
  for ( let i = 0; i < amplitudes.length; i += 2 ) {
    sum += amplitudes[ i ] * amplitudes[ i ] + amplitudes[ i + 1 ] * amplitudes[ i + 1 ];
  }
  return sum;
};

const getGridProbabilityAtNorm = ( solver: AnalyticalWavePacketSolver, xNorm: number, yNorm: number ): number => {
  const field = solver.getAmplitudeField();
  const ix = Math.max( 0, Math.min( solver.gridWidth - 1, Math.floor( xNorm * solver.gridWidth ) ) );
  const iy = Math.max( 0, Math.min( solver.gridHeight - 1, Math.floor( yNorm * solver.gridHeight ) ) );
  const idx = ( iy * solver.gridWidth + ix ) * 2;
  return field[ idx ] * field[ idx ] + field[ idx + 1 ] * field[ idx + 1 ];
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
  barrier?: AnalyticalWaveParameters['barrier'];
} ): AnalyticalWaveParameters => ( {
  source: {
    kind: 'plane',
    waveNumber: options?.waveNumber ?? 2 * Math.PI,
    speed: options?.speed ?? 1,
    startTime: options?.startTime === undefined ? 0 : options.startTime,
    edgeTaperDistance: options?.edgeTaperDistance
  },
  barrier: options?.barrier ?? { kind: 'none' }
} );

const createGaussianPacketParameters = ( options?: {
  waveNumber?: number;
  barrier?: AnalyticalWaveParameters['barrier'];
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
  barrier: options?.barrier ?? { kind: 'none' },
  projections: options?.projections
} );

const createDoubleSlitBarrier = ( options?: {
  topOpen?: boolean;
  bottomOpen?: boolean;
  coherent?: boolean;
  slitWidth?: number;
} ): AnalyticalWaveParameters['barrier'] => {
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
    assertComplexApproximately( assert, sample.components[ 0 ].value, new Complex( -1, 0 ), 'plane wave phase' );
    assertApproximately( assert, computeSampleIntensity( sample ), 1, 'plane wave intensity' );
  }
} );

QUnit.test( 'double slit barrier distinguishes aperture, absorbed barrier, and blocked downstream region', assert => {
  const barrier = createDoubleSlitBarrier( { topOpen: true, bottomOpen: false } );
  const parameters = createPlaneParameters( { barrier: barrier } );

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
    barrier: createDoubleSlitBarrier( { topOpen: false, bottomOpen: false } )
  } );
  assert.strictEqual(
    evaluateAnalyticalSample( allBlockedParameters, 1.2, 0, 5 ).kind,
    'blocked',
    'downstream region with no open slits is blocked, not merely unreached'
  );
} );

QUnit.test( 'coherent and decoherent slit components produce different total intensities', assert => {
  const coherentParameters = createPlaneParameters( {
    barrier: createDoubleSlitBarrier( { coherent: true } )
  } );
  const decoherentParameters = createPlaneParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
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
    barrier: createDoubleSlitBarrier( { coherent: true, slitWidth: 0.18 } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.18 } )
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
    barrier: createDoubleSlitBarrier( { coherent: false, slitWidth: 0.18 } )
  } );
  const topOnlyParameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.18 } )
  } );
  const bottomOnlyParameters = createPlaneParameters( {
    waveNumber: 18 * Math.PI,
    barrier: createDoubleSlitBarrier( { topOpen: false, bottomOpen: true, slitWidth: 0.18 } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: slitWidth } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: slitWidth } )
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
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
      barrier: createDoubleSlitBarrier( { coherent: true, slitWidth: slitWidth } )
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

QUnit.test( 'shrinking measurement projection is spatially local to detector region', assert => {
  const unprojected = createGaussianPacketParameters();
  const projected = createGaussianPacketParameters( {
    projections: [ {
      centerX: 0.5,
      centerY: 0,
      radius: 0.2,
      edgeFeather: 0.02,
      measurementTime: 1,
      renormScale: 1,
      shrinkDuration: 0.5
    } ]
  } );

  assertApproximately(
    assert,
    intensityAt( projected, 0.67, 0, 1 ),
    0,
    'shrinking projection blanks the detector interior'
  );
  const featherIntensity = intensityAt( projected, 0.69, 0, 1 );
  const unprojectedFeatherIntensity = intensityAt( unprojected, 0.69, 0, 1 );
  assert.ok(
    featherIntensity > 0 && featherIntensity < unprojectedFeatherIntensity,
    'shrinking projection feathers the inside edge of the detector region'
  );
  assertApproximately(
    assert,
    intensityAt( projected, 0.71, 0, 1 ),
    intensityAt( unprojected, 0.71, 0, 1 ),
    'shrinking projection does not attenuate samples outside the detector region',
    1e-10
  );
} );

QUnit.test( 'wave-packet measurement bite shrinks while preserving grid probability', assert => {
  const projectedSolver = new AnalyticalWavePacketSolver( 80, 80 );
  const controlSolver = new AnalyticalWavePacketSolver( 80, 80 );
  projectedSolver.setParameters( { isSourceOn: true } );
  controlSolver.setParameters( { isSourceOn: true } );

  projectedSolver.step( 1.4 );
  controlSolver.step( 1.4 );

  const measurementCenter = new Vector2( 0.5, 0.5 );
  const measurementRadius = 0.16;
  const detectorInteriorX = measurementCenter.x + measurementRadius * 0.75;
  const controlTotalAtMeasurement = sumAmplitudeProbability( controlSolver.getAmplitudeField() );
  const controlCenterAtMeasurement = getGridProbabilityAtNorm( controlSolver, measurementCenter.x, measurementCenter.y );
  const controlDetectorInteriorAtMeasurement = getGridProbabilityAtNorm( controlSolver, detectorInteriorX, measurementCenter.y );
  projectedSolver.applyMeasurementProjection( measurementCenter, measurementRadius );

  assertApproximately(
    assert,
    sumAmplitudeProbability( projectedSolver.getAmplitudeField() ) / controlTotalAtMeasurement,
    1,
    'projected packet is normalized immediately after failed detection'
  );
  assert.ok(
    getGridProbabilityAtNorm( projectedSolver, measurementCenter.x, measurementCenter.y ) <
    controlCenterAtMeasurement * 1e-4,
    'failed-detection bite removes the packet center immediately'
  );
  assert.ok(
    getGridProbabilityAtNorm( projectedSolver, detectorInteriorX, measurementCenter.y ) <
    controlDetectorInteriorAtMeasurement * 1e-4,
    'failed-detection bite blanks the interior of the detector region immediately'
  );

  const fillTime = 0.4;
  projectedSolver.step( fillTime );
  controlSolver.step( fillTime );

  const movingDetectorInteriorX = detectorInteriorX + projectedSolver.getDisplayPropagationSpeed() * fillTime;
  const laterProjectedDetectorInterior = getGridProbabilityAtNorm( projectedSolver, movingDetectorInteriorX, measurementCenter.y );
  const laterControlDetectorInterior = getGridProbabilityAtNorm( controlSolver, movingDetectorInteriorX, measurementCenter.y );

  assert.ok(
    laterProjectedDetectorInterior > laterControlDetectorInterior * 0.2,
    'shrinking bite lets probability fill back into the measured region'
  );
  assertApproximately(
    assert,
    sumAmplitudeProbability( projectedSolver.getAmplitudeField() ) /
    sumAmplitudeProbability( controlSolver.getAmplitudeField() ),
    1,
    'projected packet remains normalized as the bite shrinks'
  );
} );

QUnit.test( 'gaussian packet measurement projection returns one projected base layer', assert => {
  const parameters = createGaussianPacketParameters( {
    projections: [ {
      centerX: 0.5,
      centerY: 0,
      radius: 0.2,
      measurementTime: 1,
      renormScale: 1.5
    } ]
  } );

  const layeredSample = evaluateAnalyticalLayeredSample( parameters, 0.82, 0, 1.1 );
  const sample = evaluateAnalyticalSample( parameters, 0.82, 0, 1.1 );

  assert.strictEqual( layeredSample.kind, 'field', 'projected layered sample is field' );
  assert.strictEqual( sample.kind, 'field', 'projected sample is field' );

  if ( layeredSample.kind === 'field' && sample.kind === 'field' ) {
    assert.strictEqual( layeredSample.layers.length, 1, 'projected packet has only the base layer' );
    assert.strictEqual( layeredSample.layers[ 0 ].alpha, 1, 'base layer remains opaque' );
    assert.strictEqual(
      layeredSample.layers[ 0 ].components.length,
      sample.components.length,
      'base layer uses the projected sample components'
    );

    for ( let i = 0; i < sample.components.length; i++ ) {
      const layeredComponent = layeredSample.layers[ 0 ].components[ i ];
      const sampleComponent = sample.components[ i ];
      assert.strictEqual( layeredComponent.source, sampleComponent.source, 'base layer component source matches' );
      assert.strictEqual( layeredComponent.coherenceGroup, sampleComponent.coherenceGroup, 'base layer component coherence matches' );
      assert.strictEqual( layeredComponent.support, sampleComponent.support, 'base layer component support matches' );
      assertComplexApproximately( assert, layeredComponent.value, sampleComponent.value, 'base layer component value matches' );
    }
  }
} );

QUnit.test( 'wave packet solver exposes layered samples without changing amplitude field', assert => {
  const solver = new AnalyticalWavePacketSolver( 12, 12 );
  solver.setParameters( {
    displayWavelengths: 2,
    displaySpeedScale: 1,
    regionWidth: 1,
    regionHeight: 1,
    isSourceOn: true
  } );
  solver.step( QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME );

  const amplitudeBeforeProjection = solver.getAmplitudeField().slice();
  solver.applyMeasurementProjection( new Vector2( 0.5, 0.5 ), 0.18 );
  const amplitudeAfterProjection = solver.getAmplitudeField();
  const layeredSample = solver.getLayeredFieldSampleAtGridCell( 6, 6 );

  assert.ok( hasNonZeroAmplitude( amplitudeBeforeProjection ), 'packet solver has amplitude before projection' );
  assert.ok( hasNonZeroAmplitude( amplitudeAfterProjection ), 'packet solver still has amplitude after projection' );
  assert.strictEqual( layeredSample.kind, 'field', 'packet solver exposes layered field samples' );
} );

QUnit.test( 'gaussian packet remains finite and continuous through slit aperture', assert => {
  const parameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
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
  const barrier = createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } );
  const planeParameters = createPlaneParameters( {
    waveNumber: waveNumber,
    barrier: barrier
  } );
  const packetParameters = createGaussianPacketParameters( {
    waveNumber: waveNumber,
    barrier: barrier
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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 22 / 385 } )
  } );

  const sample = evaluateAnalyticalSample( parameters, 1.0119, -0.25, 1.6 );
  assert.strictEqual( sample.kind, 'field', 'diffracted packet sample is field' );

  if ( sample.kind === 'field' ) {
    assert.strictEqual( sample.components.length, 1, 'single open slit produces one component' );
    const component = sample.components[ 0 ];
    const amplitude = component.value.magnitude;

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
    barrier: createDoubleSlitBarrier( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  const nearSlitPath = intensityAt( parameters, 1.2, -0.25, 1.7 );
  const farFromSlitPath = intensityAt( parameters, 1.2, 0.45, 1.7 );
  assert.ok(
    nearSlitPath > 5 * farFromSlitPath,
    'post-slit packet is localized around the expanding packet path instead of filling a vertical slab'
  );
} );

QUnit.test( 'detector-record rendering zeroes non-event channels', assert => {
  const baseColor = { red: 220, green: 120, blue: 60 };
  const topComponent = {
    source: 'topSlit' as const,
    coherenceGroup: 'topPath',
    support: 1,
    value: new Complex( 0.5, 0 )
  };
  const bottomComponent = {
    source: 'bottomSlit' as const,
    coherenceGroup: 'bottomPath',
    support: 1,
    value: new Complex( -0.5, 0 )
  };
  const decoherentSample = {
    kind: 'field' as const,
    components: [ topComponent, bottomComponent ]
  };
  const topRecordedSample = {
    kind: 'field' as const,
    components: [
      topComponent,
      {
        source: 'bottomSlit' as const,
        coherenceGroup: 'bottomPath',
        support: 0,
        value: new Complex( 0, 0 )
      }
    ]
  };
  const bottomRecordedSample = {
    kind: 'field' as const,
    components: [
      {
        source: 'topSlit' as const,
        coherenceGroup: 'topPath',
        support: 0,
        value: new Complex( 0, 0 )
      },
      bottomComponent
    ]
  };
  const allZeroRecordedSample = {
    kind: 'field' as const,
    components: [
      {
        source: 'topSlit' as const,
        coherenceGroup: 'topPath',
        support: 0,
        value: new Complex( 0, 0 )
      },
      {
        source: 'bottomSlit' as const,
        coherenceGroup: 'bottomPath',
        support: 0,
        value: new Complex( 0, 0 )
      }
    ]
  };
  const topOnlyColor = getFieldSampleRGBA( {
    kind: 'field' as const,
    components: [ topComponent ]
  }, 'realPart', baseColor, 1 );
  const topRecordedColor = getFieldSampleRGBA( topRecordedSample, 'realPart', baseColor, 1 );
  const bottomRecordedColor = getFieldSampleRGBA( bottomRecordedSample, 'timeAveragedIntensity', baseColor, 1 );
  const bottomOnlyIntensityColor = getFieldSampleRGBA( {
    kind: 'field' as const,
    components: [ bottomComponent ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const allZeroRecordedColor = getFieldSampleRGBA( allZeroRecordedSample, 'realPart', baseColor, 1 );
  const firstIntensityColor = getFieldSampleRGBA( decoherentSample, 'timeAveragedIntensity', baseColor, 1 );
  const secondIntensityColor = getFieldSampleRGBA( decoherentSample, 'timeAveragedIntensity', baseColor, 1 );

  assert.deepEqual( topRecordedColor, topOnlyColor, 'detector record zeroes the unselected bottom path' );
  assert.deepEqual( bottomRecordedColor, bottomOnlyIntensityColor, 'detector record zeroes the unselected top path in intensity mode' );
  assert.deepEqual(
    allZeroRecordedColor,
    { red: UNREACHED_VACUUM, green: UNREACHED_VACUUM, blue: UNREACHED_VACUUM, alpha: 255 },
    'zeroed detector-record sample renders as blank'
  );
  assert.deepEqual(
    firstIntensityColor,
    secondIntensityColor,
    'intensity rendering remains deterministic'
  );
} );

QUnit.test( 'decoherence event lookup uses latest causal record', assert => {
  const events = [
    { time: 1, selectedSlit: 'topSlit' as const },
    { time: 2, selectedSlit: 'bottomSlit' as const },
    { time: 3, selectedSlit: 'topSlit' as const }
  ];

  assert.strictEqual( getDecoherenceEventAtPassTime( events, 0.5 ), null, 'no event exists before the first record' );
  assert.strictEqual( getDecoherenceEventAtPassTime( events, 2.5 ), events[ 1 ], 'latest event before pass time is selected' );
  assert.strictEqual( getDecoherenceEventAtPassTime( events, 3 ), events[ 2 ], 'event at pass time is selected' );
} );

QUnit.test( 'packet decoherence records project aperture and downstream to the selected slit', assert => {
  const topRecordedParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  topRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const }
  ];

  const beforeRecordSample = evaluateAnalyticalSample( topRecordedParameters, 2, 0, 2.5 );
  const afterTopRecordDownstreamSample = evaluateAnalyticalSample( topRecordedParameters, 2, 0.25, 3.01 );
  const afterTopRecordBottomApertureSample = evaluateAnalyticalSample( topRecordedParameters, 1, 0.25, 3.01 );
  const afterTopRecordTopApertureSample = evaluateAnalyticalSample( topRecordedParameters, 1, -0.25, 3.01 );

  assert.strictEqual( beforeRecordSample.kind, 'field', 'sample has field before detector record' );
  assert.strictEqual( afterTopRecordDownstreamSample.kind, 'field', 'downstream sample has field after top record' );
  assert.strictEqual( afterTopRecordBottomApertureSample.kind, 'field', 'unselected bottom aperture is represented as cleared field' );
  assert.strictEqual( afterTopRecordTopApertureSample.kind, 'field', 'selected top aperture keeps field' );

  if (
    beforeRecordSample.kind === 'field' &&
    afterTopRecordDownstreamSample.kind === 'field' &&
    afterTopRecordBottomApertureSample.kind === 'field' &&
    afterTopRecordTopApertureSample.kind === 'field'
  ) {
    const beforeTopPath = beforeRecordSample.components.find( component => component.source === 'topSlit' );
    const beforeBottomPath = beforeRecordSample.components.find( component => component.source === 'bottomSlit' );
    const downstreamTopPath = afterTopRecordDownstreamSample.components.find( component => component.source === 'topSlit' );
    const downstreamBottomPath = afterTopRecordDownstreamSample.components.find( component => component.source === 'bottomSlit' );
    const bottomAperturePath = afterTopRecordBottomApertureSample.components.find( component => component.source === 'bottomSlit' );
    const topAperturePath = afterTopRecordTopApertureSample.components.find( component => component.source === 'topSlit' );

    assert.ok( beforeTopPath && beforeTopPath.value.magnitude > 0, 'before record has top path' );
    assert.ok( beforeBottomPath && beforeBottomPath.value.magnitude > 0, 'before record has bottom path' );
    assert.ok( downstreamTopPath && downstreamTopPath.value.magnitude > 0, 'top record keeps top path downstream' );
    assert.strictEqual( downstreamBottomPath?.value.magnitude, 0, 'top record immediately zeroes bottom path downstream' );
    assert.strictEqual( bottomAperturePath?.value.magnitude, 0, 'top record clears the bottom aperture' );
    assert.ok( topAperturePath && topAperturePath.value.magnitude > 0, 'top record keeps the top aperture' );
  }

  const bottomRecordedParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  bottomRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'bottomSlit' as const }
  ];

  const afterBottomRecordDownstreamSample = evaluateAnalyticalSample( bottomRecordedParameters, 2, -0.25, 3.01 );
  const afterBottomRecordTopApertureSample = evaluateAnalyticalSample( bottomRecordedParameters, 1, -0.25, 3.01 );
  const afterBottomRecordBottomApertureSample = evaluateAnalyticalSample( bottomRecordedParameters, 1, 0.25, 3.01 );

  assert.strictEqual( afterBottomRecordDownstreamSample.kind, 'field', 'downstream sample has field after bottom record' );
  assert.strictEqual( afterBottomRecordTopApertureSample.kind, 'field', 'unselected top aperture is represented as cleared field' );
  assert.strictEqual( afterBottomRecordBottomApertureSample.kind, 'field', 'selected bottom aperture keeps field' );

  if (
    afterBottomRecordDownstreamSample.kind === 'field' &&
    afterBottomRecordTopApertureSample.kind === 'field' &&
    afterBottomRecordBottomApertureSample.kind === 'field'
  ) {
    const downstreamTopPath = afterBottomRecordDownstreamSample.components.find( component => component.source === 'topSlit' );
    const downstreamBottomPath = afterBottomRecordDownstreamSample.components.find( component => component.source === 'bottomSlit' );
    const topAperturePath = afterBottomRecordTopApertureSample.components.find( component => component.source === 'topSlit' );
    const bottomAperturePath = afterBottomRecordBottomApertureSample.components.find( component => component.source === 'bottomSlit' );

    assert.strictEqual( downstreamTopPath?.value.magnitude, 0, 'bottom record immediately zeroes top path downstream' );
    assert.ok( downstreamBottomPath && downstreamBottomPath.value.magnitude > 0, 'bottom record keeps bottom path downstream' );
    assert.strictEqual( topAperturePath?.value.magnitude, 0, 'bottom record clears the top aperture' );
    assert.ok( bottomAperturePath && bottomAperturePath.value.magnitude > 0, 'bottom record keeps the bottom aperture' );
  }

  const detectorOffParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: true } )
  } );
  const detectorOffSample = evaluateAnalyticalSample( detectorOffParameters, 2, 0, 3.5 );
  assert.strictEqual( detectorOffSample.kind, 'field', 'detector-off sample has field' );
  if ( detectorOffSample.kind === 'field' ) {
    assert.ok(
      detectorOffSample.components.every( component => component.value.magnitude > 0 ),
      'detector-off sample has no zeroed detector-record component'
    );
  }
} );

QUnit.test( 'packet decoherence records are honored by layered packet rendering', assert => {
  const topRecordedParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  topRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const }
  ];

  const topRecordLayeredSample = evaluateAnalyticalLayeredSample( topRecordedParameters, 2, 0.25, 3.01 );
  assert.strictEqual( topRecordLayeredSample.kind, 'field', 'top-record layered sample has field' );
  if ( topRecordLayeredSample.kind === 'field' ) {
    const topPath = topRecordLayeredSample.layers[ 0 ].components.find( component => component.source === 'topSlit' );
    const bottomPath = topRecordLayeredSample.layers[ 0 ].components.find( component => component.source === 'bottomSlit' );

    assert.ok( topPath && topPath.value.magnitude > 0, 'top record keeps top path in layered rendering' );
    assert.strictEqual( bottomPath?.value.magnitude, 0, 'top record zeroes bottom path in layered rendering' );
  }

  const bottomRecordedParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  bottomRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'bottomSlit' as const }
  ];

  const bottomRecordLayeredSample = evaluateAnalyticalLayeredSample( bottomRecordedParameters, 2, -0.25, 3.01 );
  assert.strictEqual( bottomRecordLayeredSample.kind, 'field', 'bottom-record layered sample has field' );
  if ( bottomRecordLayeredSample.kind === 'field' ) {
    const topPath = bottomRecordLayeredSample.layers[ 0 ].components.find( component => component.source === 'topSlit' );
    const bottomPath = bottomRecordLayeredSample.layers[ 0 ].components.find( component => component.source === 'bottomSlit' );

    assert.strictEqual( topPath?.value.magnitude, 0, 'bottom record zeroes top path in layered rendering' );
    assert.ok( bottomPath && bottomPath.value.magnitude > 0, 'bottom record keeps bottom path in layered rendering' );
  }
} );

QUnit.test( 'packet slit re-emission blanks prior field and emits from selected slit', assert => {
  const baselineParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  const baselineSample = evaluateAnalyticalSample( baselineParameters, 0.5, 0, 1 );
  assert.strictEqual( baselineSample.kind, 'field', 'ordinary packet behavior is unchanged before slit detection' );

  const topReEmissionParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  topReEmissionParameters.packetReEmission = {
    selectedSlit: 'topSlit',
    eventTime: 3,
    timeAdvance: 0.5,
    sourceX: 1,
    centerY: -0.25,
    width: 0.12
  };

  assert.strictEqual(
    evaluateAnalyticalSample( topReEmissionParameters, 1.05, -0.25, 2.99 ).kind,
    'unreached',
    're-emitted packet is blank before the detector event time'
  );
  assert.strictEqual(
    evaluateAnalyticalSample( topReEmissionParameters, 0.5, -0.25, 3 ).kind,
    'unreached',
    'left side of the slit is blank immediately after top-slit detection'
  );
  assert.strictEqual(
    computeSampleIntensity( evaluateAnalyticalSample( topReEmissionParameters, 1, 0.25, 3 ) ),
    0,
    'bottom slit is blank immediately after top-slit detection'
  );

  const topSourceSample = evaluateAnalyticalSample( topReEmissionParameters, 1, -0.25, 3 );
  const topDownstreamSample = evaluateAnalyticalSample( topReEmissionParameters, 1.2, 0.25, 3.35 );
  assert.strictEqual( topSourceSample.kind, 'field', 'top slit begins re-emitting immediately' );
  assert.strictEqual( topDownstreamSample.kind, 'field', 'downstream top-slit re-emission reaches off-axis samples' );
  if ( topSourceSample.kind === 'field' && topDownstreamSample.kind === 'field' ) {
    assertComplexApproximately(
      assert,
      getRepresentativeComplex( topSourceSample ),
      getRepresentativeComplex( evaluateAnalyticalSample( createGaussianPacketParameters(), 0, 0, 0.5 ) ),
      'top slit re-emission uses the configured packet time advance'
    );
    assert.ok( computeSampleIntensity( topSourceSample ) > 0, 'top slit re-emission has nonzero source intensity' );
    assert.ok(
      topDownstreamSample.components.every( component => component.source === 'topSlit' ),
      'downstream top-slit re-emission contains only the top slit contribution'
    );
  }

  const bottomReEmissionParameters = createGaussianPacketParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  bottomReEmissionParameters.packetReEmission = {
    selectedSlit: 'bottomSlit',
    eventTime: 3,
    timeAdvance: 0.5,
    sourceX: 1,
    centerY: 0.25,
    width: 0.12
  };

  assert.strictEqual(
    evaluateAnalyticalSample( bottomReEmissionParameters, 0.5, 0.25, 3 ).kind,
    'unreached',
    'left side of the slit is blank immediately after bottom-slit detection'
  );
  assert.strictEqual(
    computeSampleIntensity( evaluateAnalyticalSample( bottomReEmissionParameters, 1, -0.25, 3 ) ),
    0,
    'top slit is blank immediately after bottom-slit detection'
  );

  const bottomSourceSample = evaluateAnalyticalSample( bottomReEmissionParameters, 1, 0.25, 3 );
  const bottomDownstreamSample = evaluateAnalyticalSample( bottomReEmissionParameters, 1.2, -0.25, 3.35 );
  assert.strictEqual( bottomSourceSample.kind, 'field', 'bottom slit begins re-emitting immediately' );
  assert.strictEqual( bottomDownstreamSample.kind, 'field', 'downstream bottom-slit re-emission reaches off-axis samples' );
  if ( bottomSourceSample.kind === 'field' && bottomDownstreamSample.kind === 'field' ) {
    assert.ok( computeSampleIntensity( bottomSourceSample ) > 0, 'bottom slit re-emission has nonzero source intensity' );
    assert.ok(
      bottomDownstreamSample.components.every( component => component.source === 'bottomSlit' ),
      'downstream bottom-slit re-emission contains only the bottom slit contribution'
    );
  }

  const planeControlParameters = createPlaneParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  const planeReEmissionParameters = createPlaneParameters( {
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  planeReEmissionParameters.packetReEmission = topReEmissionParameters.packetReEmission;
  assertComplexApproximately(
    assert,
    getRepresentativeComplex( evaluateAnalyticalSample( planeReEmissionParameters, 1.3, 0, 4 ) ),
    getRepresentativeComplex( evaluateAnalyticalSample( planeControlParameters, 1.3, 0, 4 ) ),
    'packet re-emission descriptor is ignored by plane-wave sources'
  );
} );

QUnit.test( 'wave packet solver serializes active slit re-emission state', assert => {
  const solver = new AnalyticalWavePacketSolver( 12, 12 );
  const packetReEmission = {
    selectedSlit: 'topSlit' as const,
    eventTime: 0,
    timeAdvance: 0.25,
    sourceX: 0.5,
    centerY: -0.2,
    width: 0.15
  };
  solver.setParameters( {
    displayWavelengths: 2,
    displaySpeedScale: 1,
    regionWidth: 1,
    regionHeight: 1,
    isSourceOn: true,
    barrierType: 'doubleSlit',
    barrierFractionX: 0.5,
    packetReEmission: packetReEmission
  } );
  solver.step( 0.1 );
  const state = solver.getState();
  const beforeClear = solver.evaluate( 0.5, -0.2 ).magnitudeSquared;

  solver.setParameters( {
    packetReEmission: null
  } );
  solver.setState( state );

  assert.deepEqual( state.packetReEmission, packetReEmission, 'state includes slit re-emission descriptor' );
  assertApproximately(
    assert,
    solver.evaluate( 0.5, -0.2 ).magnitudeSquared,
    beforeClear,
    'restored state preserves active slit re-emission field'
  );
} );

QUnit.test( 'plane-wave decoherence records form selected-slit temporal chains', assert => {
  const topRecordedParameters = createPlaneParameters( {
    speed: 1,
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  topRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const }
  ];

  const x = 2;
  const y = 0.25;
  const beforeBandSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 3.99 );
  const bandHeadSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 4 );
  const partialBandSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 4.05 );
  const bandCenterSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 4.1 );
  const bandTailSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 4.2 );
  const afterBandSample = evaluateAnalyticalSample( topRecordedParameters, x, y, 4.21 );

  assert.strictEqual( beforeBandSample.kind, 'field', 'sample has field before temporal record band arrives' );
  assert.strictEqual( bandHeadSample.kind, 'field', 'sample has field at temporal record band head' );
  assert.strictEqual( partialBandSample.kind, 'field', 'sample has field inside temporal record band' );
  assert.strictEqual( bandCenterSample.kind, 'field', 'sample has field at temporal record band center' );
  assert.strictEqual( bandTailSample.kind, 'field', 'sample has field at temporal record band tail' );
  assert.strictEqual( afterBandSample.kind, 'field', 'sample has field after temporal record band passes' );

  if (
    beforeBandSample.kind === 'field' &&
    bandHeadSample.kind === 'field' &&
    partialBandSample.kind === 'field' &&
    bandCenterSample.kind === 'field' &&
    bandTailSample.kind === 'field' &&
    afterBandSample.kind === 'field'
  ) {
    const getMagnitude = (
      sample: Extract<ReturnType<typeof evaluateAnalyticalSample>, { kind: 'field' }>,
      source: 'topSlit' | 'bottomSlit'
    ): number =>
      sample.components.find( component => component.source === source )?.value.magnitude ?? 0;

    const beforeTopMagnitude = getMagnitude( beforeBandSample, 'topSlit' );
    const beforeBottomMagnitude = getMagnitude( beforeBandSample, 'bottomSlit' );
    const headBottomMagnitude = getMagnitude( bandHeadSample, 'bottomSlit' );
    const partialBottomMagnitude = getMagnitude( partialBandSample, 'bottomSlit' );
    const centerTopMagnitude = getMagnitude( bandCenterSample, 'topSlit' );
    const centerBottomMagnitude = getMagnitude( bandCenterSample, 'bottomSlit' );
    const tailBottomMagnitude = getMagnitude( bandTailSample, 'bottomSlit' );
    const afterTopMagnitude = getMagnitude( afterBandSample, 'topSlit' );
    const afterBottomMagnitude = getMagnitude( afterBandSample, 'bottomSlit' );

    assert.ok( beforeTopMagnitude > 0, 'top path remains before its temporal band arrives' );
    assert.ok( beforeBottomMagnitude > 0, 'bottom path remains before its temporal band arrives' );
    assert.ok( headBottomMagnitude > 0, 'unselected bottom path is present at band head' );
    assert.ok(
      partialBottomMagnitude > 0 && partialBottomMagnitude < headBottomMagnitude,
      'unselected bottom path is partially attenuated between band head and center'
    );
    assert.ok( centerTopMagnitude > 0, 'top record keeps top path at band center' );
    assertApproximately( assert, centerBottomMagnitude, 0, 'top record zeroes bottom path at band center' );
    assert.ok( tailBottomMagnitude > 0, 'unselected bottom path is restored at band tail' );
    assert.ok( afterTopMagnitude > 0, 'top path remains after temporal band passes' );
    assert.ok( afterBottomMagnitude > 0, 'bottom path remains after temporal band passes' );
  }

  const bottomRecordedParameters = createPlaneParameters( {
    speed: 1,
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  bottomRecordedParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'bottomSlit' as const }
  ];

  const bottomBandSample = evaluateAnalyticalSample( bottomRecordedParameters, x, -0.25, 4.1 );
  assert.strictEqual( bottomBandSample.kind, 'field', 'sample has field at bottom temporal record band center' );
  if ( bottomBandSample.kind === 'field' ) {
    const topPath = bottomBandSample.components.find( component => component.source === 'topSlit' );
    const bottomPath = bottomBandSample.components.find( component => component.source === 'bottomSlit' );
    assertApproximately( assert, topPath?.value.magnitude ?? 0, 0, 'bottom record zeroes top path at band center' );
    assert.ok( bottomPath && bottomPath.value.magnitude > 0, 'bottom record keeps bottom path at band center' );
  }

  const repeatedTopParameters = createPlaneParameters( {
    speed: 1,
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  repeatedTopParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const },
    { time: 3.2, selectedSlit: 'topSlit' as const }
  ];

  const repeatedTopSeamSample = evaluateAnalyticalSample( repeatedTopParameters, x, y, 4.2 );
  const repeatedTopTailSample = evaluateAnalyticalSample( repeatedTopParameters, x, y, 4.4 );
  const repeatedTopAfterSample = evaluateAnalyticalSample( repeatedTopParameters, x, y, 4.41 );

  assert.strictEqual( repeatedTopSeamSample.kind, 'field', 'sample has field where repeated top records meet' );
  assert.strictEqual( repeatedTopTailSample.kind, 'field', 'sample has field at repeated top chain tail' );
  assert.strictEqual( repeatedTopAfterSample.kind, 'field', 'sample has field after repeated top chain passes' );

  if (
    repeatedTopSeamSample.kind === 'field' &&
    repeatedTopTailSample.kind === 'field' &&
    repeatedTopAfterSample.kind === 'field'
  ) {
    const seamBottomPath = repeatedTopSeamSample.components.find( component => component.source === 'bottomSlit' );
    const tailBottomPath = repeatedTopTailSample.components.find( component => component.source === 'bottomSlit' );
    const afterBottomPath = repeatedTopAfterSample.components.find( component => component.source === 'bottomSlit' );
    assertApproximately( assert, seamBottomPath?.value.magnitude ?? 0, 0, 'repeated top records keep bottom path zeroed at the seam' );
    assert.ok( tailBottomPath && tailBottomPath.value.magnitude > 0, 'repeated top chain restores bottom path at the trailing edge' );
    assert.ok( afterBottomPath && afterBottomPath.value.magnitude > 0, 'bottom path remains after repeated top chain passes' );
  }
} );

QUnit.test( 'plane-wave decoherence layers taper with alpha and merge repeated selected-slit records', assert => {
  const baseColor = { red: 200, green: 200, blue: 200 };
  const x = 2;
  const y = -0.25;
  const parameters = createPlaneParameters( {
    speed: 1,
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  parameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const }
  ];

  const headColor = getLayeredFieldSampleRGBA(
    evaluateAnalyticalLayeredSample( parameters, x, y, 4 ),
    'magnitude',
    baseColor,
    1
  );
  const centerColor = getLayeredFieldSampleRGBA(
    evaluateAnalyticalLayeredSample( parameters, x, y, 4.1 ),
    'magnitude',
    baseColor,
    1
  );
  const tailColor = getLayeredFieldSampleRGBA(
    evaluateAnalyticalLayeredSample( parameters, x, y, 4.2 ),
    'magnitude',
    baseColor,
    1
  );

  assert.strictEqual( headColor.alpha, 0, 'single selected-slit layer is transparent at the leading edge' );
  assert.ok( centerColor.alpha > 0, 'single selected-slit layer is visible at the band center' );
  assert.strictEqual( tailColor.alpha, 0, 'single selected-slit layer is transparent at the trailing edge' );

  const repeatedTopParameters = createPlaneParameters( {
    speed: 1,
    barrier: createDoubleSlitBarrier( { coherent: false } )
  } );
  repeatedTopParameters.decoherenceEvents = [
    { time: 3, selectedSlit: 'topSlit' as const },
    { time: 3.2, selectedSlit: 'topSlit' as const }
  ];

  const seamColor = getLayeredFieldSampleRGBA(
    evaluateAnalyticalLayeredSample( repeatedTopParameters, x, y, 4.2 ),
    'magnitude',
    baseColor,
    1
  );
  const repeatedTailColor = getLayeredFieldSampleRGBA(
    evaluateAnalyticalLayeredSample( repeatedTopParameters, x, y, 4.4 ),
    'magnitude',
    baseColor,
    1
  );

  assert.strictEqual( seamColor.alpha, 255, 'repeated same-slit layers stay fully opaque where records meet' );
  assert.strictEqual( repeatedTailColor.alpha, 0, 'repeated same-slit chain tapers to transparency only at the chain tail' );
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
    barrier: createDoubleSlitBarrier( { coherent: true } )
  } );
  const blockedParameters = createPlaneParameters( {
    barrier: createDoubleSlitBarrier( { topOpen: false, bottomOpen: false } )
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
      value: new Complex( 0.1, 0 )
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const fullFrontColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [ {
      source: 'incident',
      coherenceGroup: 'incident',
      value: new Complex( 1, 0 )
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const weakAmplitudeFullSupportColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [ {
      source: 'topSlit',
      coherenceGroup: 'slits',
      support: 1,
      value: new Complex( 0.03, 0 )
    } ]
  }, 'timeAveragedIntensity', baseColor, 1 );
  const destructiveInterferenceColor = getFieldSampleRGBA( {
    kind: 'field',
    components: [
      {
        source: 'topSlit',
        coherenceGroup: 'slits',
        value: new Complex( 1, 0 )
      },
      {
        source: 'bottomSlit',
        coherenceGroup: 'slits',
        value: new Complex( -1, 0 )
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
