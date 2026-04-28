// Copyright 2026, University of Colorado Boulder

/**
 * Pure analytical wave kernel for the High Intensity and Single Particles screens.
 *
 * This file intentionally has no scene-model state, cached grid arrays, detector accumulation, or
 * rendering assumptions. It answers one question: given complete source/obstacle parameters, what
 * physically meaningful field sample exists at ( x, y, t )?
 *
 * A sample is richer than a single complex value because decohered slit paths must not interfere.
 * The kernel reports one component per coherent path and assigns each component to a coherence group.
 * Intensity is then computed as sum( |sum(group)|^2 ). Views may choose their own depiction of
 * multiple groups; the legacy WaveSolver adapter reduces them to one representative complex value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';

const EPSILON = 1e-12;
const NEAR_APERTURE_X_FRACTION = 1e-4;

// Smooth the first post-aperture samples so the visual transition from slit mask to Fresnel propagation
// does not create a screen-specific artifact at the aperture boundary.
const APERTURE_BLEND_SLIT_WIDTH_FRACTION = 0.5;
const APERTURE_BLEND_WAVELENGTH_FRACTION = 0.25;
const INV_SQRT_2 = 1 / Math.sqrt( 2 );

export type FieldComponentSource = 'incident' | 'topSlit' | 'bottomSlit';

export type FieldComponent = {
  source: FieldComponentSource;
  coherenceGroup: string;
  support?: number;
  value: Complex;
};

export type FieldSample =
  { kind: 'unreached' } |
  { kind: 'absorbed' } |
  { kind: 'blocked' } |
  { kind: 'field'; components: FieldComponent[] };

export type PlaneWaveSource = {
  kind: 'plane';
  waveNumber: number;
  speed: number;
  startTime: number | null;
  edgeTaperDistance?: number;
};

export type GaussianPacketSource = {
  kind: 'gaussianPacket';
  isActive: boolean;
  waveNumber: number;
  speed: number;
  initialCenterX: number;
  centerY: number;
  sigmaX0: number;
  sigmaY0: number;
  longitudinalSpreadTime: number;
  transverseSpreadTime: number;
};

export type AnalyticalSource = PlaneWaveSource | GaussianPacketSource;

export type AnalyticalSlit = {
  source: 'topSlit' | 'bottomSlit';
  centerY: number;
  width: number;
  isOpen: boolean;
  coherenceGroup: string;
};

export type AnalyticalObstacle =
  { kind: 'none' } |
  {
    kind: 'doubleSlit';
    barrierX: number;
    slits: AnalyticalSlit[];
  };

export type MeasurementProjection = {
  centerX: number;
  centerY: number;
  radius: number;
  measurementTime: number;
  renormScale: number;
};

export type AnalyticalWaveParameters = {
  source: AnalyticalSource;
  obstacle: AnalyticalObstacle;
  projections?: MeasurementProjection[];
};

type GaussianPacketState = {
  centerX: number;
  sigmaX: number;
  sigmaY: number;
  normalization: number;
  chirpX: number;
  chirpY: number;
};

// Keep physical complex amplitude separate from visual wavefront support. Diffraction can reduce
// amplitude without meaning the sample is unreached background.
type ApertureTransfer = {
  value: Complex;
  support: number;
};

const smoothStep = ( edge0: number, edge1: number, x: number ): number => {
  if ( x <= edge0 ) {
    return 0;
  }
  if ( x >= edge1 ) {
    return 1;
  }
  const u = ( x - edge0 ) / ( edge1 - edge0 );
  return u * u * ( 3 - 2 * u );
};

// Fast Abramowitz-Stegun style approximation for Fresnel integrals. The max error is small enough
// for rendering/unit-test invariants, and it avoids per-cell numerical quadrature in the canvas.
const fresnelIntegral = ( x: number ): Complex => {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs( x );

  if ( ax < EPSILON ) {
    return new Complex( 0, 0 );
  }

  const phase = 0.5 * Math.PI * ax * ax;
  const sinPhase = Math.sin( phase );
  const cosPhase = Math.cos( phase );
  const f = ( 1 + 0.926 * ax ) / ( 2 + 1.792 * ax + 3.104 * ax * ax );
  const g = 1 / ( 2 + 4.142 * ax + 3.492 * ax * ax + 6.67 * ax * ax * ax );

  return new Complex(
    sign * ( 0.5 + f * sinPhase - g * cosPhase ),
    sign * ( 0.5 - f * cosPhase - g * sinPhase )
  );
};

const blendComplex = ( a: Complex, b: Complex, t: number ): Complex => new Complex(
  a.real + ( b.real - a.real ) * t,
  a.imaginary + ( b.imaginary - a.imaginary ) * t
);

const getApertureMaskTransfer = ( y: number, slit: AnalyticalSlit ): Complex => {
  const halfWidth = slit.width / 2;
  return Math.abs( y - slit.centerY ) <= halfWidth ? new Complex( 1, 0 ) : new Complex( 0, 0 );
};

const getFresnelApertureTransfer = (
  waveNumber: number,
  xPastBarrier: number,
  y: number,
  slit: AnalyticalSlit
): ApertureTransfer => {
  const halfWidth = slit.width / 2;
  const yMin = slit.centerY - halfWidth;
  const yMax = slit.centerY + halfWidth;
  const nearApertureX = Math.max( EPSILON, slit.width * NEAR_APERTURE_X_FRACTION );
  const apertureMaskTransfer = getApertureMaskTransfer( y, slit );
  const apertureMaskSupport = apertureMaskTransfer.real;

  if ( xPastBarrier <= nearApertureX ) {
    return {
      value: apertureMaskTransfer,
      support: apertureMaskSupport
    };
  }

  const wavelength = 2 * Math.PI / waveNumber;
  const uScale = Math.sqrt( 2 / ( wavelength * xPastBarrier ) );
  const uMin = ( yMin - y ) * uScale;
  const uMax = ( yMax - y ) * uScale;
  const apertureIntegral = fresnelIntegral( uMax ).minus( fresnelIntegral( uMin ) );

  const fresnelTransfer = Complex.createPolar( INV_SQRT_2, waveNumber * xPastBarrier - Math.PI / 4 ).times( apertureIntegral );

  const apertureBlendDistance = Math.max(
    nearApertureX,
    Math.min(
      slit.width * APERTURE_BLEND_SLIT_WIDTH_FRACTION,
      wavelength * APERTURE_BLEND_WAVELENGTH_FRACTION
    )
  );

  if ( xPastBarrier < apertureBlendDistance ) {
    const blend = smoothStep( nearApertureX, apertureBlendDistance, xPastBarrier );

    // Inside the handoff region, ramp the visual support to reached-field status while blending
    // the complex value from the aperture mask to the Fresnel result.
    return {
      value: blendComplex( apertureMaskTransfer, fresnelTransfer, blend ),
      support: apertureMaskSupport + ( 1 - apertureMaskSupport ) * blend
    };
  }

  return {
    value: fresnelTransfer,
    support: 1
  };
};

const getClosestYOnSlit = ( y: number, slit: AnalyticalSlit ): number => {
  const halfWidth = slit.width / 2;
  const yMin = slit.centerY - halfWidth;
  const yMax = slit.centerY + halfWidth;
  return Math.max( yMin, Math.min( yMax, y ) );
};

export const computeSampleIntensity = ( sample: FieldSample ): number => {
  if ( sample.kind !== 'field' ) {
    return 0;
  }

  const groupSums = new Map<string, Complex>();
  for ( let i = 0; i < sample.components.length; i++ ) {
    const component = sample.components[ i ];
    const sum = groupSums.get( component.coherenceGroup ) || new Complex( 0, 0 );
    sum.add( component.value );
    groupSums.set( component.coherenceGroup, sum );
  }

  let intensity = 0;
  groupSums.forEach( sum => {
    intensity += sum.magnitudeSquared;
  } );
  return intensity;
};

/**
 * Legacy display adapter: produce one complex value from a physically richer FieldSample.
 *
 * If there is one coherence group, this is the coherent sum. If there are multiple groups, the
 * returned phase is taken from the strongest group and the magnitude is scaled to the total
 * decoherent intensity. That keeps old real/imaginary displays finite while preserving intensity.
 */
export const getRepresentativeComplex = ( sample: FieldSample ): Complex => {
  if ( sample.kind !== 'field' ) {
    return new Complex( 0, 0 );
  }

  const groupSums = new Map<string, Complex>();
  for ( let i = 0; i < sample.components.length; i++ ) {
    const component = sample.components[ i ];
    const sum = groupSums.get( component.coherenceGroup ) || new Complex( 0, 0 );
    sum.add( component.value );
    groupSums.set( component.coherenceGroup, sum );
  }

  let totalIntensity = 0;
  let strongest: Complex | null = null;
  let strongestIntensity = 0;

  for ( const sum of groupSums.values() ) {
    const intensity = sum.magnitudeSquared;
    totalIntensity += intensity;
    if ( intensity > strongestIntensity ) {
      strongest = sum;
      strongestIntensity = intensity;
    }
  }

  if ( totalIntensity <= 0 || !strongest ) {
    return new Complex( 0, 0 );
  }

  const scale = Math.sqrt( totalIntensity / strongestIntensity );
  return strongest.timesScalar( scale );
};

export const evaluateAnalyticalSample = (
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample => {
  const { source, obstacle } = parameters;

  let sample: FieldSample;

  if ( obstacle.kind === 'none' ) {
    const component = evaluateSourceComponent( source, 'incident', 'incident', x, y, x, t );
    sample = component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }
  else {
    sample = evaluateDoubleSlitSample( source, obstacle, x, y, t );
  }

  return applyMeasurementProjections( sample, parameters.projections || [], source, x, y, t );
};

const evaluateDoubleSlitSample = (
  source: AnalyticalSource,
  obstacle: Extract<AnalyticalObstacle, { kind: 'doubleSlit' }>,
  x: number,
  y: number,
  t: number
): FieldSample => {
  if ( x < obstacle.barrierX - EPSILON ) {
    const component = evaluateSourceComponent( source, 'incident', 'incident', x, y, x, t );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }

  const openSlits = obstacle.slits.filter( slit => slit.isOpen );
  if ( openSlits.length === 0 ) {
    return Math.abs( x - obstacle.barrierX ) <= EPSILON ? { kind: 'absorbed' } : { kind: 'blocked' };
  }

  if ( Math.abs( x - obstacle.barrierX ) <= EPSILON ) {
    const slit = openSlits.find( candidate => Math.abs( y - candidate.centerY ) <= candidate.width / 2 );
    if ( !slit ) {
      return { kind: 'absorbed' };
    }

    const component = evaluateSourceComponent( source, slit.source, slit.coherenceGroup, obstacle.barrierX, y, obstacle.barrierX, t );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }

  const components: FieldComponent[] = [];
  let hasReachablePath = false;

  for ( let i = 0; i < openSlits.length; i++ ) {
    const slit = openSlits[ i ];
    const xPastBarrier = x - obstacle.barrierX;
    const closestApertureY = getClosestYOnSlit( y, slit );
    const dyToAperture = y - closestApertureY;
    const distanceFromAperture = Math.sqrt( xPastBarrier * xPastBarrier + dyToAperture * dyToAperture );
    const reachPathLength = obstacle.barrierX + distanceFromAperture;
    const component = evaluateDiffractedComponent(
      source,
      slit,
      obstacle.barrierX,
      xPastBarrier,
      y,
      reachPathLength,
      closestApertureY,
      t
    );

    if ( component ) {
      hasReachablePath = true;
      components.push( component );
    }
    else if ( isPathReachable( source, reachPathLength, t ) ) {
      hasReachablePath = true;
      components.push( {
        source: slit.source,
        coherenceGroup: slit.coherenceGroup,
        value: new Complex( 0, 0 )
      } );
    }
  }

  if ( components.length > 0 ) {
    return { kind: 'field', components: components };
  }

  return hasReachablePath ? { kind: 'field', components: [] } : { kind: 'unreached' };
};

const evaluateDiffractedComponent = (
  source: AnalyticalSource,
  slit: AnalyticalSlit,
  barrierX: number,
  xPastBarrier: number,
  y: number,
  reachPathLength: number,
  closestApertureY: number,
  t: number
): FieldComponent | null => {
  if ( xPastBarrier <= EPSILON ) {
    return null;
  }

  if ( source.kind === 'plane' ) {
    const sourceEnvelope = getPlaneEmissionEnvelope( source, reachPathLength, t );
    if ( sourceEnvelope <= 0 ) {
      return null;
    }

    const barrierPhase = source.waveNumber * barrierX - source.waveNumber * source.speed * t;
    const apertureTransfer = getFresnelApertureTransfer( source.waveNumber, xPastBarrier, y, slit );
    return {
      source: slit.source,
      coherenceGroup: slit.coherenceGroup,
      support: sourceEnvelope * apertureTransfer.support,
      value: Complex.createPolar( sourceEnvelope, barrierPhase ).times( apertureTransfer.value )
    };
  }

  if ( !source.isActive ) {
    return null;
  }

  const state = getGaussianPacketState( source, t );
  const nearAperture = xPastBarrier <= Math.max( EPSILON, slit.width * NEAR_APERTURE_X_FRACTION );
  if ( nearAperture && Math.abs( y - closestApertureY ) <= EPSILON ) {
    return evaluateSourceComponent( source, slit.source, slit.coherenceGroup, barrierX, y, barrierX, t );
  }

  const longitudinalDelta = reachPathLength - state.centerX;
  const normalizedPath = longitudinalDelta / state.sigmaX;
  if ( normalizedPath * normalizedPath > 64 ) {
    return null;
  }

  const transverseDelta = closestApertureY - source.centerY;
  const normalizedTransverse = transverseDelta / state.sigmaY;
  if ( normalizedTransverse * normalizedTransverse > 64 ) {
    return null;
  }

  const envelope = state.normalization *
                   Math.exp( -0.5 * normalizedPath * normalizedPath ) *
                   Math.exp( -0.5 * normalizedTransverse * normalizedTransverse );
  const apertureLongitudinalDelta = barrierX - state.centerX;

  // The Fresnel aperture transfer already carries downstream propagation phase, so evaluate the
  // packet carrier/chirp at the aperture to avoid compressing the displayed post-slit wavelength.
  const phase = source.waveNumber * barrierX - source.waveNumber * source.speed * t +
                state.chirpX * apertureLongitudinalDelta * apertureLongitudinalDelta +
                state.chirpY * transverseDelta * transverseDelta;
  const apertureTransfer = getFresnelApertureTransfer( source.waveNumber, xPastBarrier, y, slit );

  return {
    source: slit.source,
    coherenceGroup: slit.coherenceGroup,
    support: envelope * apertureTransfer.support,
    value: Complex.createPolar( envelope, phase ).times( apertureTransfer.value )
  };
};

const evaluateSourceComponent = (
  source: AnalyticalSource,
  componentSource: FieldComponentSource,
  coherenceGroup: string,
  x: number,
  y: number,
  pathLength: number,
  t: number
): FieldComponent | null => {
  if ( source.kind === 'plane' ) {
    const sourceEnvelope = getPlaneEmissionEnvelope( source, pathLength, t );
    if ( sourceEnvelope <= 0 ) {
      return null;
    }

    const phase = source.waveNumber * pathLength - source.waveNumber * source.speed * t;
    return {
      source: componentSource,
      coherenceGroup: coherenceGroup,
      support: sourceEnvelope,
      value: Complex.createPolar( sourceEnvelope, phase )
    };
  }

  if ( !source.isActive ) {
    return null;
  }

  const state = getGaussianPacketState( source, t );
  const longitudinalDelta = pathLength - state.centerX;
  const normalizedPath = longitudinalDelta / state.sigmaX;
  if ( normalizedPath * normalizedPath > 64 ) {
    return null;
  }

  const transverseDelta = y - source.centerY;
  const normalizedTransverse = transverseDelta / state.sigmaY;
  if ( componentSource === 'incident' && normalizedTransverse * normalizedTransverse > 64 ) {
    return null;
  }

  const longitudinalEnvelope = Math.exp( -0.5 * normalizedPath * normalizedPath );
  const transverseEnvelope = Math.exp( -0.5 * normalizedTransverse * normalizedTransverse );
  const envelope = state.normalization * longitudinalEnvelope * transverseEnvelope;
  const phase = source.waveNumber * pathLength - source.waveNumber * source.speed * t +
                state.chirpX * longitudinalDelta * longitudinalDelta +
                state.chirpY * transverseDelta * transverseDelta;

  return {
    source: componentSource,
    coherenceGroup: coherenceGroup,

    // Packet support follows its envelope so low amplitude from phase/diffraction is still rendered
    // as reached field instead of being mistaken for unreached background.
    support: envelope,
    value: Complex.createPolar( envelope, phase )
  };
};

const getGaussianPacketState = ( source: GaussianPacketSource, t: number ): GaussianPacketState => {
  const longitudinalSpreadTime = Math.max( source.longitudinalSpreadTime, EPSILON );
  const transverseSpreadTime = Math.max( source.transverseSpreadTime, EPSILON );
  const spreadX = t / longitudinalSpreadTime;
  const spreadY = t / transverseSpreadTime;
  const sigmaX = source.sigmaX0 * Math.sqrt( 1 + spreadX * spreadX );
  const sigmaY = source.sigmaY0 * Math.sqrt( 1 + spreadY * spreadY );

  return {
    centerX: source.initialCenterX + source.speed * t,
    sigmaX: sigmaX,
    sigmaY: sigmaY,
    normalization: Math.sqrt( source.sigmaX0 / sigmaX * source.sigmaY0 / sigmaY ),
    chirpX: spreadX / ( 2 * sigmaX * sigmaX ),
    chirpY: spreadY / ( 2 * sigmaY * sigmaY )
  };
};

const getPlaneEmissionEnvelope = ( source: PlaneWaveSource, pathLength: number, t: number ): number => {
  if ( source.startTime === null || source.speed <= 0 ) {
    return 0;
  }

  const emissionTime = t - pathLength / source.speed;
  if ( emissionTime + EPSILON < source.startTime ) {
    return 0;
  }

  const taperTime = ( source.edgeTaperDistance ?? 0 ) / source.speed;
  if ( taperTime <= 0 ) {
    return 1;
  }

  return smoothStep( 0, taperTime, emissionTime - source.startTime );
};

const isPathReachable = ( source: AnalyticalSource, pathLength: number, t: number ): boolean => {
  if ( source.kind === 'gaussianPacket' ) {
    return source.isActive;
  }

  return getPlaneEmissionEnvelope( source, pathLength, t ) > 0;
};

const applyMeasurementProjections = (
  sample: FieldSample,
  projections: MeasurementProjection[],
  source: AnalyticalSource,
  x: number,
  y: number,
  t: number
): FieldSample => {
  if ( sample.kind !== 'field' || projections.length === 0 || source.kind !== 'gaussianPacket' ) {
    return sample;
  }

  let scale = 1;

  for ( let i = 0; i < projections.length; i++ ) {
    const projection = projections[ i ];
    if ( t + EPSILON < projection.measurementTime ) {
      continue;
    }

    const dt = Math.max( 0, t - projection.measurementTime );
    const projectionCenterX = projection.centerX + source.speed * dt;
    const spreadTime = Math.max( source.longitudinalSpreadTime, EPSILON );
    const projectionRadius = projection.radius * Math.sqrt( 1 + ( dt / spreadTime ) ** 2 );
    const distance = Math.sqrt( ( x - projectionCenterX ) ** 2 + ( y - projection.centerY ) ** 2 );
    const mask = dt <= EPSILON ? ( distance <= projection.radius ? 0 : 1 ) :
                 smoothStep( projectionRadius * 0.82, projectionRadius * 1.18, distance );
    scale *= mask * projection.renormScale;

    if ( scale === 0 ) {
      break;
    }
  }

  if ( scale === 1 ) {
    return sample;
  }

  return {
    kind: 'field',
    components: sample.components.map( component => {
      const projectedComponent: FieldComponent = {
        source: component.source,
        coherenceGroup: component.coherenceGroup,
        value: component.value.timesScalar( scale )
      };
      if ( component.support !== undefined ) {

        // Measurement projections attenuate both probability amplitude and the visible reached-field support.
        projectedComponent.support = component.support * scale;
      }
      return projectedComponent;
    } )
  };
};
