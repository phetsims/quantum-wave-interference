// Copyright 2026, University of Colorado Boulder

/**
 * Which-path detector decoherence helpers for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { getClosestYOnSlit } from './AnalyticalSlitGeometry.js';
import { type AnalyticalBarrier, type AnalyticalWaveParameters, type DecoherenceEvent, type FieldComponent, type FieldLayer, type FieldSample, type LayeredFieldSample, type PlaneWaveSource } from './AnalyticalWaveKernelTypes.js';
import { EPSILON, smoothStep } from './AnalyticalWaveMath.js';

const PLANE_WAVE_DECOHERENCE_BAND_DURATION = 0.2;
const PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION = PLANE_WAVE_DECOHERENCE_BAND_DURATION / 2;

/**
 * Returns the latest detector record whose time is causal for a pass time.
 *
 * Gaussian-packet projection uses this to select the most recent which-path event that can affect the
 * packet at the current time. Unlike the plane-wave chain helper, the returned event remains active
 * after its event time. This helper is pure and returns null when no event has occurred yet.
 */
function getDecoherenceEventAtPassTime(
  events: readonly DecoherenceEvent[],
  passTime: number
): DecoherenceEvent | null {
  for ( let i = events.length - 1; i >= 0; i-- ) {
    if ( events[ i ].time <= passTime + EPSILON ) {
      return events[ i ];
    }
  }
  return null;
}

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
function getPlaneWaveDecoherenceChainAtPassTime(
  events: readonly DecoherenceEvent[],
  passTime: number
): DecoherenceChain | null {
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
}

/**
 * Returns the smooth envelope strength for a merged plane-wave detector-record chain.
 *
 * The chain is fully active through its interior and tapers only across the first and last half-band
 * durations. Call this after the chain start/end times are known to convert a retarded pass time into
 * either projection strength or render-layer alpha. This helper is pure.
 */
function getPlaneWaveDecoherenceChainStrength(
  passTime: number,
  chainStartTime: number,
  chainEndTime: number
): number {
  if ( passTime <= chainStartTime + EPSILON || passTime >= chainEndTime - EPSILON ) {
    return 0;
  }

  // The envelope tapers only at the chain ends. The interior stays full strength, so a long run of
  // same-slit particles behaves like a stable one-slit plane wave rather than a sequence of packets.
  const leadingStrength = smoothStep(
    chainStartTime,
    ( chainStartTime + PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION ),
    passTime
  );
  const trailingStrength = 1 - smoothStep(
    ( chainEndTime - PLANE_WAVE_DECOHERENCE_BAND_HALF_DURATION ),
    chainEndTime,
    passTime
  );
  return Math.min( leadingStrength, trailingStrength );
}

/**
 * Finds the detector-record chain that causally applies to one slit component at one sample point.
 *
 * For downstream plane waves, a detector record belongs to the temporal slice that passed through a
 * slit at the retarded pass time. This helper computes that pass time from the nearest aperture point
 * and delegates to getPlaneWaveDecoherenceChainAtPassTime. It is pure and returns null for incident
 * components, missing slits, or samples outside active detector chains.
 */
function getPlaneWaveComponentDecoherenceChain(
  component: FieldComponent,
  events: readonly DecoherenceEvent[],
  barrier: Extract<AnalyticalBarrier, { kind: 'doubleSlit' }>,
  source: PlaneWaveSource,
  x: number,
  y: number,
  t: number
): DecoherenceChain | null {
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
}

/**
 * Converts an undecohered plane-wave field sample into renderable particle-chain layers.
 *
 * For samples with no active detector chain, the original components are returned in one opaque layer.
 * For samples inside a detected particle chain, only the selected slit component is emitted, and its
 * chain strength becomes the layer alpha. The unselected slit is omitted instead of painted black, so
 * the taper fades to transparent over the black wave-region background. FieldSample projection still
 * handles model-facing attenuation separately in applyDecoherenceEvent.
 */
export function applyPlaneWaveDecoherenceEventLayers(
  sample: Extract<FieldSample, { kind: 'field' }>,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): LayeredFieldSample {
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
}

/**
 * Applies which-path detector records to a model-facing field sample.
 *
 * Detector records preserve the selected slit component and attenuate the other slit component. For
 * Gaussian packets the latest causal record projects the whole packet, while for plane waves the
 * projection is restricted to the retarded temporal chain for each component. This pure helper is
 * called after the undecohered source/barrier field has been evaluated.
 */
export function applyDecoherenceEvent(
  sample: FieldSample,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample {
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
        value: new Complex( component.value.real * scale, component.value.imaginary * scale )
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
}
