// Copyright 2026, University of Colorado Boulder

/**
 * Source and barrier propagation helpers for the wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { getFresnelApertureTransfer } from './FresnelApertureTransfer.js';
import { getClosestYOnSlit } from './SlitGeometry.js';
import { type FieldComponent, type FieldComponentSource, type FieldSample, type GaussianPacketReEmission, type GaussianPacketSource, type PlaneWaveSource, type WaveBarrier, type WaveParameters, type WaveSlit, type WaveSource } from './WaveKernelTypes.js';
import { createPolarTimesComplex, EPSILON, NEAR_APERTURE_X_FRACTION, smoothStep } from './WaveMath.js';

/**
 * Time-derived gaussian packet state shared by direct-source and diffracted-field evaluation.
 *
 * centerX is the longitudinal packet center, sigmaX and sigmaY are the current spreading widths,
 * and normalization preserves the packet's integrated intensity as those widths grow. chirpX and
 * chirpY are quadratic phase coefficients applied to squared longitudinal and transverse offsets.
 */
type GaussianPacketState = {
  centerX: number;
  sigmaX: number;
  sigmaY: number;
  normalization: number;
  chirpX: number;
  chirpY: number;
};

/**
 * Computes the raw field before detector-record decoherence or measurement projections.
 *
 * Both public evaluators start here so model-facing FieldSample output and rendering-facing
 * LayeredFieldSample output share the exact same source/barrier propagation. This avoids a common
 * failure mode where the rendered particle bands and detector/graph math drift because they each
 * approximate diffraction or source reachability independently.
 */
export function evaluateUndecoheredSample(
  parameters: WaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample {
  const { source, barrier } = parameters;

  if ( parameters.packetReEmission && source.kind === 'gaussianPacket' ) {
    return evaluateGaussianPacketReEmissionSample( source, parameters.packetReEmission, x, y, t );
  }

  if ( barrier.kind === 'none' ) {
    const component = evaluateSourceComponent( source, 'incident', 'incident', x, y, x, t );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }
  else {
    return evaluateDoubleSlitSample( source, barrier, x, y, t );
  }
}

/**
 * Evaluates the field emitted by a packet that was re-created at a selected slit after detection.
 *
 * Single Particles can replace the original packet with a new source centered on the selected aperture.
 * This pure helper shifts the source time/origin to the re-emission event, blocks samples before the
 * event or behind the aperture, and otherwise evaluates direct aperture or downstream diffracted field.
 */
function evaluateGaussianPacketReEmissionSample(
  source: GaussianPacketSource,
  reEmission: GaussianPacketReEmission,
  x: number,
  y: number,
  t: number
): FieldSample {
  if ( !source.isActive || t < reEmission.eventTime - EPSILON || x < reEmission.sourceX - EPSILON ) {
    return { kind: 'unreached' };
  }

  const localTime = t - reEmission.eventTime + Math.max( 0, reEmission.timeAdvance ?? 0 );
  const localSource: GaussianPacketSource = {
    kind: source.kind,
    isActive: source.isActive,
    waveNumber: source.waveNumber,
    speed: source.speed,
    initialCenterX: source.initialCenterX,
    centerY: reEmission.centerY,
    sigmaX0: source.sigmaX0,
    sigmaY0: source.sigmaY0,
    longitudinalSpreadTime: source.longitudinalSpreadTime,
    transverseSpreadTime: source.transverseSpreadTime
  };
  const slit: WaveSlit = {
    source: reEmission.selectedSlit,
    centerY: reEmission.centerY,
    width: reEmission.width,
    isOpen: true,
    coherenceGroup: reEmission.selectedSlit
  };
  const xPastSource = x - reEmission.sourceX;

  if ( xPastSource <= EPSILON ) {
    if ( Math.abs( y - reEmission.centerY ) > reEmission.width / 2 ) {
      return { kind: 'unreached' };
    }

    const component = evaluateSourceComponent(
      localSource,
      reEmission.selectedSlit,
      reEmission.selectedSlit,
      0,
      y,
      0,
      localTime
    );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }

  const closestApertureY = getClosestYOnSlit( y, slit );
  const dyToAperture = y - closestApertureY;
  const distanceFromAperture = Math.sqrt( xPastSource * xPastSource + dyToAperture * dyToAperture );
  const component = evaluateDiffractedComponent(
    localSource,
    slit,
    0,
    xPastSource,
    y,
    distanceFromAperture,
    closestApertureY,
    localTime
  );

  if ( component ) {
    return { kind: 'field', components: [ component ] };
  }

  return isPathReachable( localSource, distanceFromAperture, localTime ) ?
    { kind: 'field', components: [] } :
    { kind: 'unreached' };
}

/**
 * Evaluates source propagation through a double-slit barrier at one sample point.
 *
 * Samples before the barrier use the incident source field, samples on closed barrier material become
 * absorbed/blocked, and downstream samples sum one diffracted component for each open slit that the
 * source can reach. This pure helper intentionally does not apply detector decoherence or measurement
 * projections; callers layer those effects afterward.
 */
function evaluateDoubleSlitSample(
  source: WaveSource,
  barrier: Extract<WaveBarrier, { kind: 'doubleSlit' }>,
  x: number,
  y: number,
  t: number
): FieldSample {
  if ( x < barrier.barrierX - EPSILON ) {
    const component = evaluateSourceComponent( source, 'incident', 'incident', x, y, x, t );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }

  const openSlits = barrier.slits.filter( slit => slit.isOpen );
  if ( openSlits.length === 0 ) {
    return Math.abs( x - barrier.barrierX ) <= EPSILON ? { kind: 'absorbed' } : { kind: 'blocked' };
  }

  if ( Math.abs( x - barrier.barrierX ) <= EPSILON ) {
    const slit = openSlits.find( candidate => Math.abs( y - candidate.centerY ) <= candidate.width / 2 );
    if ( !slit ) {
      return { kind: 'absorbed' };
    }

    const component = evaluateSourceComponent( source, slit.source, slit.coherenceGroup, barrier.barrierX, y, barrier.barrierX, t );
    return component ? { kind: 'field', components: [ component ] } : { kind: 'unreached' };
  }

  const components: FieldComponent[] = [];
  let hasReachablePath = false;

  // Evaluate each open slit independently. A reachable path with no returned component contributes
  // explicit zero amplitude so the sample remains a reached field rather than unreached background.
  for ( let i = 0; i < openSlits.length; i++ ) {
    const slit = openSlits[ i ];
    const xPastBarrier = x - barrier.barrierX;
    const closestApertureY = getClosestYOnSlit( y, slit );
    const dyToAperture = y - closestApertureY;
    const distanceFromAperture = Math.sqrt( xPastBarrier * xPastBarrier + dyToAperture * dyToAperture );
    const reachPathLength = barrier.barrierX + distanceFromAperture;
    const component = evaluateDiffractedComponent(
      source,
      slit,
      barrier.barrierX,
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
}

/**
 * Evaluates a single diffracted slit contribution downstream of an aperture.
 *
 * Plane waves use a Fresnel aperture transfer multiplied by the source envelope and barrier phase.
 * Gaussian packets additionally sample the spreading packet envelope/chirp at the aperture so the
 * downstream wavelength and transverse weighting remain stable. This pure helper returns null when
 * the source or path has not reached the sample.
 */
function evaluateDiffractedComponent(
  source: WaveSource,
  slit: WaveSlit,
  barrierX: number,
  xPastBarrier: number,
  y: number,
  reachPathLength: number,
  closestApertureY: number,
  t: number
): FieldComponent | null {
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
      value: createPolarTimesComplex( sourceEnvelope, barrierPhase, apertureTransfer.value )
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
    value: createPolarTimesComplex( envelope, phase, apertureTransfer.value )
  };
}

/**
 * Evaluates an undiffracted source component at one sample point or aperture point.
 *
 * Plane-wave sources return a phase/envelope based on path length and emission time. Gaussian-packet
 * sources return the current spreading packet envelope with chirp and support information. Call this
 * for incident fields and for samples located directly on an open aperture. This helper is pure.
 */
function evaluateSourceComponent(
  source: WaveSource,
  componentSource: FieldComponentSource,
  coherenceGroup: string,
  x: number,
  y: number,
  pathLength: number,
  t: number
): FieldComponent | null {
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
}

/**
 * Computes the instantaneous spreading state for a gaussian packet.
 *
 * The returned center, widths, normalization, and chirp terms are derived only from the immutable
 * source parameters and time. This pure helper centralizes packet spreading math for direct and
 * diffracted packet evaluation.
 */
function getGaussianPacketState( source: GaussianPacketSource, t: number ): GaussianPacketState {
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
}

/**
 * Returns the emission envelope for a plane wave along a path of known length.
 *
 * The envelope is zero before the source start wavefront can causally reach the path, then optionally
 * ramps on with edgeTaperDistance. Call this before evaluating plane-wave phase so unreached samples
 * can be omitted without mutating any solver state.
 */
function getPlaneEmissionEnvelope( source: PlaneWaveSource, pathLength: number, t: number ): number {
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
}

/**
 * Reports whether a source could have reached a path at the current time.
 *
 * Gaussian packets are considered reachable whenever their source is active because their finite
 * envelope cutoff is handled by component evaluators. Plane waves use the causal emission envelope.
 * This pure helper is used to distinguish unreached background from reached zero-amplitude field.
 */
function isPathReachable( source: WaveSource, pathLength: number, t: number ): boolean {
  if ( source.kind === 'gaussianPacket' ) {
    return source.isActive;
  }

  return getPlaneEmissionEnvelope( source, pathLength, t ) > 0;
}
