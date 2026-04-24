// Copyright 2026, University of Colorado Boulder

/**
 * Unit tests for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type AnalyticalWaveParameters, type ComplexValue, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import { getFieldSampleRGBA, rasterizeAnalyticalWave, UNREACHED_GRAY } from './AnalyticalWaveRasterizer.js';

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

QUnit.test( 'known limitation: Fraunhofer stitch is not aperture-continuous away from slit center', assert => {
  const parameters = createPlaneParameters( {
    waveNumber: 20 * Math.PI,
    obstacle: createDoubleSlitObstacle( { topOpen: true, bottomOpen: false, slitWidth: 0.4 } )
  } );

  // This documents the current far-field approximation limitation. Fresnel diffraction should
  // replace this with a continuity assertion across x=barrierX inside the open aperture.
  const yInsideTopApertureAwayFromCenter = -0.25 + 0.1;
  const atAperture = evaluateAnalyticalSample( parameters, 1, yInsideTopApertureAwayFromCenter, 5 );
  const justRightOfAperture = evaluateAnalyticalSample( parameters, 1 + 1e-6, yInsideTopApertureAwayFromCenter, 5 );
  const discontinuity = Math.abs( computeSampleIntensity( atAperture ) - computeSampleIntensity( justRightOfAperture ) );

  assert.ok( discontinuity > 0.5, 'current Fraunhofer near-aperture stitch has a measurable discontinuity' );
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
    { red: UNREACHED_GRAY, green: UNREACHED_GRAY, blue: UNREACHED_GRAY, alpha: 255 },
    'zero-intensity field is not rendered as unreached background'
  );

  appendRasterPreview( 'coherent double slit', coherentRaster.width, coherentRaster.height, coherentRaster.pixels, coherentRaster.statusCounts );
  appendRasterPreview( 'all slits blocked', blockedRaster.width, blockedRaster.height, blockedRaster.pixels, blockedRaster.statusCounts );
} );
