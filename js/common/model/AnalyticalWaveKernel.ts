// Copyright 2026, University of Colorado Boulder

/**
 * Pure analytical wave kernel for the High Intensity and Single Particles screens.
 *
 * This file intentionally has no scene-model state, cached grid arrays, detector accumulation, or
 * rendering assumptions. It answers one question: given complete source/barrier parameters, what
 * physically meaningful field sample exists at ( x, y, t )?
 *
 * A sample is richer than a single complex value because decohered slit paths must not interfere.
 * The kernel reports one component per coherent path and assigns each component to a coherence group.
 * Intensity is then computed as sum( |sum(group)|^2 ). Views may choose their own depiction of
 * multiple groups; the legacy WaveSolver adapter reduces them to one representative complex value.
 *
 * High Intensity plane waves are interpreted as a time-ordered chain of discrete particles rather
 * than one indivisible classical wave. A which-path detector record belongs to the particle whose
 * wavefront reached the slit at record.time. Downstream, each grid sample computes the retarded
 * pass time for each slit component and asks which particle record, if any, owns that temporal slice.
 *
 * This interpretation creates a useful rendering distinction. FieldSample preserves the model-facing
 * projection semantics: the unselected slit component is attenuated inside the particle's temporal
 * band. LayeredFieldSample preserves the particle-chain structure for rendering: selected-slit bands
 * become separate layers with alpha tapers. Consecutive records that choose the same slit merge into
 * one chain, so repeated bottom choices look like a continuous bottom-selected plane wave with only
 * a leading and trailing taper.
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
const PLANE_WAVE_DECOHERENCE_BAND_DURATION = 0.2;
const PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION = PLANE_WAVE_DECOHERENCE_BAND_DURATION / 2;
const MEASUREMENT_BITE_INITIAL_SATURATION = Math.exp( 0.5 );

export type FieldComponentSource = 'incident' | 'topSlit' | 'bottomSlit';

export type DecoherenceSlit = 'topSlit' | 'bottomSlit';

export type DecoherenceEvent = {
  time: number;
  selectedSlit: DecoherenceSlit;
  clickedDetectorSlit?: DecoherenceSlit;
};

export type GaussianPacketReEmission = {
  selectedSlit: DecoherenceSlit;
  eventTime: number;
  timeAdvance?: number;
  sourceX: number;
  centerY: number;
  width: number;
};

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

// Rendering-level description of one visible particle-chain band. order controls z-compositing,
// alpha controls the band envelope, and components carry the field value rendered in the layer.
export type FieldLayer = {
  order: number;
  alpha: number;
  components: FieldComponent[];
};

// Layered samples are intentionally parallel to FieldSample status values, but expose renderable
// particle bands instead of an already-projected list of components.
export type LayeredFieldSample =
  { kind: 'unreached' } |
  { kind: 'absorbed' } |
  { kind: 'blocked' } |
  { kind: 'field'; layers: FieldLayer[] };

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

export type AnalyticalBarrier =
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
  edgeFeather?: number;
  measurementTime: number;
  renormScale: number;
  shrinkDuration?: number;
};

export type AnalyticalWaveParameters = {
  source: AnalyticalSource;
  barrier: AnalyticalBarrier;
  projections?: MeasurementProjection[];
  decoherenceEvents?: readonly DecoherenceEvent[];
  packetReEmission?: GaussianPacketReEmission | null;
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

  //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Duplicate of line 273-279
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
  let sample = evaluateUndecoheredAnalyticalSample( parameters, x, y, t );

  sample = applyDecoherenceEvent( sample, parameters, x, y, t );

  return applyMeasurementProjections( sample, parameters.projections || [], parameters.source, x, y, t );
};

/**
 * Rendering-oriented companion to evaluateAnalyticalSample.
 *
 * evaluateAnalyticalSample answers "what field exists here after decoherence/projection?" and returns
 * one already-composited FieldSample. This method answers "which independently renderable field bands
 * should be painted here?" and returns a LayeredFieldSample. For plane waves with slit-detector events,
 * that preserves the discrete-particle-chain interpretation so the rasterizer can draw selected-slit
 * bands as transparent layers with z ordering. For packet sources, measurement projections are applied
 * to the base packet layer so layered rendering matches the model-facing FieldSample.
 */
export const evaluateAnalyticalLayeredSample = (
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): LayeredFieldSample => {
  const sample = evaluateUndecoheredAnalyticalSample( parameters, x, y, t );

  if ( sample.kind !== 'field' ) {
    return sample;
  }

  if ( parameters.source.kind !== 'plane' ) {

    // Packet rendering has two independent measurement effects:
    // 1. slit-detector records, which collapse the packet to one slit path; and
    // 2. detector-tool projections, which apply the local failed-detection bite.
    // Apply slit-detector decoherence first so the model-facing and layered packet samples agree.
    const decoheredSample = applyDecoherenceEvent( sample, parameters, x, y, t );
    return decoheredSample.kind === 'field' ?
           applyGaussianPacketMeasurementProjectionLayers( decoheredSample, parameters, x, y, t ) :
           decoheredSample;
  }

  return applyPlaneWaveDecoherenceEventLayers( sample, parameters, x, y, t );
};

const applyGaussianPacketMeasurementProjectionLayers = (
  sample: Extract<FieldSample, { kind: 'field' }>,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): LayeredFieldSample => {
  const source = parameters.source;
  if ( source.kind !== 'gaussianPacket' ) {
    return {
      kind: 'field',
      layers: [ {
        order: 0,
        alpha: 1,
        components: sample.components
      } ]
    };
  }

  const projectedSample = applyMeasurementProjections( sample, parameters.projections || [], source, x, y, t );
  if ( projectedSample.kind !== 'field' ) {
    return projectedSample;
  }

  const layers: FieldLayer[] = [ {
    order: 0,
    alpha: 1,
    components: projectedSample.components
  } ];

  return {
    kind: 'field',
    layers: layers
  };
};

/**
 * Computes the raw analytical field before detector-record decoherence or measurement projections.
 *
 * Both public evaluators start here so model-facing FieldSample output and rendering-facing
 * LayeredFieldSample output share the exact same source/barrier propagation. This avoids a common
 * failure mode where the rendered particle bands and detector/graph math drift because they each
 * approximate diffraction or source reachability independently.
 */
const evaluateUndecoheredAnalyticalSample = (
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample => {
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
};

export const getDecoherenceEventAtPassTime = (
  events: readonly DecoherenceEvent[],
  passTime: number
): DecoherenceEvent | null => {
  for ( let i = events.length - 1; i >= 0; i-- ) {
    if ( events[ i ].time <= passTime + EPSILON ) {
      return events[ i ];
    }
  }
  return null;
};

/**
 * A same-slit run of plane-wave detector records that should be treated as one visual chain.
 *
 * event is the causal record for the pass time being sampled, so event.selectedSlit tells which slit
 * owns this particle slice. strength is the chain envelope at that pass time: 0 at the chain head/tail,
 * 1 through the interior, and smoothly varying only at the outer ends. It is used as projection strength
 * in FieldSample output and as layer alpha in LayeredFieldSample output.
 */
type DecoherenceChain = {
  event: DecoherenceEvent;
  strength: number;
};

/**
 * Finds the causal plane-wave particle chain for a retarded slit pass time.
 *
 * Each detector record owns a fixed 0.2s temporal window. Unlike getDecoherenceEventAtPassTime, this
 * intentionally does not let the latest record stay active forever. If passTime is outside the active
 * window of the latest causal record, there is no chain. If adjacent records choose the same slit and
 * their windows touch, they are merged before the strength is computed. This is what makes bottom,
 * bottom, bottom look like one continuous bottom-selected plane wave instead of three visible packets.
 */
const getPlaneWaveDecoherenceChainAtPassTime = (
  events: readonly DecoherenceEvent[],
  passTime: number
): DecoherenceChain | null => {
  for ( let i = events.length - 1; i >= 0; i-- ) {
    const event = events[ i ];
    if ( passTime < event.time - EPSILON ) {
      continue;
    }

    if ( passTime > event.time + PLANE_WAVE_DECOHERENCE_BAND_DURATION + EPSILON ) {
      return null;
    }

    // Same-slit particle records whose 0.2s temporal windows touch are interpreted as one chain.
    // This prevents a run like bottom-bottom-bottom from showing artificial packet boundaries.
    let chainStartTime = event.time;
    for ( let j = i - 1; j >= 0; j-- ) {
      const previousEvent = events[ j ];
      if (
        previousEvent.selectedSlit !== event.selectedSlit ||
        chainStartTime - previousEvent.time > PLANE_WAVE_DECOHERENCE_BAND_DURATION + EPSILON
      ) {
        break;
      }
      chainStartTime = previousEvent.time;
    }

    let chainEndTime = event.time + PLANE_WAVE_DECOHERENCE_BAND_DURATION;
    let lastEventTime = event.time;
    for ( let j = i + 1; j < events.length; j++ ) {
      const nextEvent = events[ j ];
      if (
        nextEvent.selectedSlit !== event.selectedSlit ||
        nextEvent.time - lastEventTime > PLANE_WAVE_DECOHERENCE_BAND_DURATION + EPSILON
      ) {
        break;
      }
      lastEventTime = nextEvent.time;
      chainEndTime = nextEvent.time + PLANE_WAVE_DECOHERENCE_BAND_DURATION;
    }

    return {
      event: event,
      strength: getPlaneWaveDecoherenceChainStrength( passTime, chainStartTime, chainEndTime )
    };
  }
  return null;
};

const getPlaneWaveDecoherenceChainStrength = (
  passTime: number,
  chainStartTime: number,
  chainEndTime: number
): number => {
  if ( passTime <= chainStartTime + EPSILON || passTime >= chainEndTime - EPSILON ) {
    return 0;
  }

  // The envelope tapers only at the chain ends. The interior stays full strength, so a long run of
  // same-slit particles behaves like a stable one-slit plane wave rather than a sequence of packets.
  const leadingStrength = smoothStep(
    chainStartTime,
    chainStartTime + PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION,
    passTime
  );
  const trailingStrength = 1 - smoothStep(
    chainEndTime - PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION,
    chainEndTime,
    passTime
  );
  return Math.min( leadingStrength, trailingStrength );
};

const getPlaneWaveComponentDecoherenceChain = (
  component: FieldComponent,
  events: readonly DecoherenceEvent[],
  barrier: Extract<AnalyticalBarrier, { kind: 'doubleSlit' }>,
  source: PlaneWaveSource,
  x: number,
  y: number,
  t: number
): DecoherenceChain | null => {
  if ( component.source !== 'topSlit' && component.source !== 'bottomSlit' ) {
    return null;
  }

  const slit = barrier.slits.find( candidate => candidate.source === component.source );
  if ( !slit ) {
    return null;
  }

  // Use the nearest point on this aperture so the band expands from the whole slit opening,
  // rather than from a single point at the slit center.
  const xPastBarrier = x - barrier.barrierX;
  const closestApertureY = getClosestYOnSlit( y, slit );
  const downstreamDistance = Math.sqrt(
    xPastBarrier * xPastBarrier +
    ( y - closestApertureY ) * ( y - closestApertureY )
  );
  const passTime = t - downstreamDistance / source.speed;
  return getPlaneWaveDecoherenceChainAtPassTime( events, passTime );
};

/**
 * Converts an undecohereed plane-wave field sample into renderable particle-chain layers.
 *
 * For samples with no active detector chain, the original components are returned in one opaque layer.
 * For samples inside a detected particle chain, only the selected slit component is emitted, and its
 * chain strength becomes the layer alpha. The unselected slit is omitted instead of painted black, so
 * the taper fades to transparent over the black wave-region background. FieldSample projection still
 * handles model-facing attenuation separately in applyDecoherenceEvent.
 */
const applyPlaneWaveDecoherenceEventLayers = (
  sample: Extract<FieldSample, { kind: 'field' }>,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): LayeredFieldSample => {
  const events = parameters.decoherenceEvents;
  const barrier = parameters.barrier;
  const source = parameters.source;

  if (
    !events ||
    events.length === 0 ||
    barrier.kind !== 'doubleSlit' ||
    source.kind !== 'plane' ||
    source.speed <= 0 ||
    x < barrier.barrierX - EPSILON
  ) {
    return {
      kind: 'field',
      layers: [ {
        order: 0,
        alpha: 1,
        components: sample.components
      } ]
    };
  }

  const layers: FieldLayer[] = [];
  for ( let i = 0; i < sample.components.length; i++ ) {
    const component = sample.components[ i ];
    const chain = getPlaneWaveComponentDecoherenceChain( component, events, barrier, source, x, y, t );
    if ( chain ) {
      if ( chain.event.selectedSlit === component.source && chain.strength > EPSILON ) {
        // Only the selected slit is rendered for a detected particle band. The alpha envelope fades
        // this layer to transparent; the black wave-region background supplies the visual vacuum.
        layers.push( {
          order: chain.event.time,
          alpha: chain.strength,
          components: [ component ]
        } );
      }
    }
    else if ( component.source !== 'topSlit' && component.source !== 'bottomSlit' ) {
      layers.push( {
        order: 0,
        alpha: 1,
        components: [ component ]
      } );
    }
  }

  return {
    kind: 'field',
    layers: layers
  };
};

const applyDecoherenceEvent = (
  sample: FieldSample,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample => {
  const events = parameters.decoherenceEvents;
  const barrier = parameters.barrier;

  if (
    sample.kind !== 'field' ||
    !events ||
    events.length === 0 ||
    barrier.kind !== 'doubleSlit' ||
    x < barrier.barrierX - EPSILON
  ) {
    return sample;
  }

  const source = parameters.source;

  // Single Particles uses one finite packet at a time. When a slit detector identifies that packet,
  // the entire packet is projected to the selected aperture, so every aperture/downstream sample can
  // use the same detector record based on the current simulation time.
  const isPacketProjection = source.kind === 'gaussianPacket';
  const packetEvent = isPacketProjection ? getDecoherenceEventAtPassTime( events, t ) : null;

  const components = sample.components.map( component => {
    if ( component.source === 'topSlit' || component.source === 'bottomSlit' ) {
      let event = packetEvent;
      let planeWaveDecoherenceStrength = 1;

      // High Intensity uses a continuous plane wave to represent a stream of many independent
      // particles. One detector record attenuates only a fixed-width temporal slice for one particle,
      // so each sample asks when its wavefront left this slit aperture. Equal passTime contours are
      // the semicircular bands seen downstream from the detected apertures.
      if ( !event && source.kind === 'plane' && source.speed > 0 ) {
        const chain = getPlaneWaveComponentDecoherenceChain( component, events, barrier, source, x, y, t );
        if ( chain ) {
          event = chain.event;
          planeWaveDecoherenceStrength = chain.strength;
        }
      }

      if ( !event ) {
        return component;
      }

      if ( event.selectedSlit === component.source ) {
        return component;
      }

      const scale = 1 - planeWaveDecoherenceStrength;
      const attenuatedComponent: FieldComponent = {
        source: component.source,
        coherenceGroup: component.coherenceGroup,
        value: component.value.timesScalar( scale )
      };
      if ( component.support !== undefined ) {
        attenuatedComponent.support = component.support * scale;
      }
      return attenuatedComponent;
    }
    return component;
  } );

  return {
    kind: 'field',
    components: components
  };
};

const evaluateGaussianPacketReEmissionSample = (
  source: GaussianPacketSource,
  reEmission: GaussianPacketReEmission,
  x: number,
  y: number,
  t: number
): FieldSample => {
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
  const slit: AnalyticalSlit = {
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
};

const evaluateDoubleSlitSample = (
  source: AnalyticalSource,
  barrier: Extract<AnalyticalBarrier, { kind: 'doubleSlit' }>,
  x: number,
  y: number,
  t: number
): FieldSample => {
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

    const mask = getMeasurementProjectionMask( projection, source, x, y, t );
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

const getMeasurementProjectionMask = (
  projection: MeasurementProjection,
  source: GaussianPacketSource,
  x: number,
  y: number,
  t: number
): number => {
  const dt = Math.max( 0, t - projection.measurementTime );
  const projectionCenterX = projection.centerX + source.speed * dt;
  const spreadTime = Math.max( source.longitudinalSpreadTime, EPSILON );
  const spreadingProjectionRadius = projection.radius * Math.sqrt( 1 + ( dt / spreadTime ) ** 2 );
  const projectionRadius = projection.shrinkDuration === undefined ? spreadingProjectionRadius : projection.radius;
  const distance = Math.sqrt( ( x - projectionCenterX ) ** 2 + ( y - projection.centerY ) ** 2 );
  const edgeFeather = projection.shrinkDuration === undefined ? 0 : Math.max( projection.edgeFeather ?? 0, 0 );

  if ( projection.shrinkDuration === undefined ) {
    return dt <= EPSILON ? ( distance <= projection.radius ? 0 : 1 ) :
           smoothStep( spreadingProjectionRadius * 0.82, spreadingProjectionRadius * 1.18, distance );
  }

  if ( distance >= projectionRadius ) {
    return 1;
  }

  if ( projection.shrinkDuration <= EPSILON ) {
    return 1;
  }

  const biteStrength = 1 - smoothStep( 0, projection.shrinkDuration, dt );
  if ( biteStrength <= EPSILON ) {
    return 1;
  }

  const shrinkScale = 0.2 + 0.8 * biteStrength;
  const sigma = Math.max( projectionRadius * shrinkScale, EPSILON );
  const saturatedGaussian = MEASUREMENT_BITE_INITIAL_SATURATION * biteStrength *
                            Math.exp( -0.5 * ( distance / sigma ) ** 2 );
  const localMask = Math.max( 0, 1 - saturatedGaussian );

  // Keep failed-detection effects local to the detector: the designer-tunable feather is applied
  // inside the detector boundary only, so samples outside projectionRadius are untouched.
  const boundaryBlend = edgeFeather > EPSILON ?
                        smoothStep( Math.max( 0, projectionRadius - edgeFeather ), projectionRadius, distance ) :
                        0;
  return localMask + ( 1 - localMask ) * boundaryBlend;
};
