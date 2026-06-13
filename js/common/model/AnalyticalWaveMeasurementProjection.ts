// Copyright 2026, University of Colorado Boulder

/**
 * Failed-measurement projection helpers for the pure analytical wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { type AnalyticalSource, type AnalyticalWaveParameters, type FieldComponent, type FieldLayer, type FieldSample, type GaussianPacketSource, type LayeredFieldSample, type MeasurementProjection } from './AnalyticalWaveKernelTypes.js';
import { EPSILON, smoothStep } from './AnalyticalWaveMath.js';

const MEASUREMENT_BITE_INITIAL_SATURATION = Math.exp( 0.5 );

// The detector probe's default radius is 0.1 of the wave-region width while the packet starts with
// sigmaX0 = 0.15 of that width. Keeping this ratio here lets the pure kernel derive the reference
// detector radius from the packet parameters it already receives.
const MEASUREMENT_BITE_REFERENCE_RADIUS_TO_PACKET_SIGMA_X = 2 / 3;
const MEASUREMENT_BITE_REFERENCE_SPREAD_TIME = 0.5;
const MEASUREMENT_BITE_MAX_SPREAD_TIME = 1.1;

// After the instantaneous failed-detection disk, evolve the bite as a single centered super-Gaussian
// deficit. The edge deficit calibrates the falloff scale so the super-Gaussian is nearly zero at the
// detector radius when steep, and the exponent relaxes toward 2 as the deficit spreads and fades.
const MEASUREMENT_BITE_EDGE_DEFICIT = 0.02;
const MEASUREMENT_BITE_MAX_SUPER_GAUSSIAN_EXPONENT = 24;

/**
 * Shape parameters for the time-evolved super-Gaussian deficit that represents a spreading
 * failed-measurement bite. Returned by getMeasurementProjectionSpread and consumed directly
 * by getMeasurementProjectionMask to evaluate `deficitStrength * exp( -0.5*(r/falloffScale)^exponent )`.
 *
 * - falloffScale: effective width of the super-Gaussian, scaled so the deficit equals
 *   MEASUREMENT_BITE_EDGE_DEFICIT at the original detector radius.
 * - deficitStrength: peak height of the deficit (0–1); decays as the bite spreads so the
 *   removed amplitude fills back in everywhere at once rather than leaving a permanent ring.
 * - exponent: super-Gaussian order; starts near MEASUREMENT_BITE_MAX_SUPER_GAUSSIAN_EXPONENT
 *   for a disk-like bite and relaxes toward 2 (normal Gaussian) as the deficit expands.
 */
type MeasurementProjectionSpread = {
  falloffScale: number;
  deficitStrength: number;
  exponent: number;
};

/**
 * Converts a gaussian-packet field sample into the layered representation used by renderers.
 *
 * Failed-measurement projections are applied before the single layer is created so the rendering path
 * sees the same attenuated packet as the model-facing sample. This pure helper is called only for
 * gaussian-packet sources; non-packet sources fall back to a single opaque layer for defensive use.
 */
export function applyGaussianPacketMeasurementProjectionLayers(
  sample: Extract<FieldSample, { kind: 'field' }>,
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): LayeredFieldSample {
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
}

/**
 * Applies failed-measurement projection masks to a gaussian-packet field sample.
 *
 * Each active projection multiplies all components by its local mask and renormalization scale, so
 * both probability amplitude and support are attenuated consistently. Plane waves and non-field
 * samples are returned unchanged. This function is pure and creates new components only when the
 * accumulated scale changes the sample.
 */
export function applyMeasurementProjections(
  sample: FieldSample,
  projections: MeasurementProjection[],
  source: AnalyticalSource,
  x: number,
  y: number,
  t: number
): FieldSample {
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
        value: new Complex( component.value.real * scale, component.value.imaginary * scale )
      };
      if ( component.support !== undefined ) {

        // Measurement projections attenuate both probability amplitude and the visible reached-field support.
        projectedComponent.support = component.support * scale;
      }
      return projectedComponent;
    } )
  };
}

/**
 * Computes the local multiplicative mask for one failed-measurement projection.
 *
 * At the measurement instant, the mask removes amplitude inside the detector disk with optional
 * boundary feathering. Afterward, the deficit advects with the packet and spreads as a centered
 * super-Gaussian so the visual bite fills in as time passes. This helper is pure.
 */
function getMeasurementProjectionMask(
  projection: MeasurementProjection,
  source: GaussianPacketSource,
  x: number,
  y: number,
  t: number
): number {
  const dt = Math.max( 0, t - projection.measurementTime );
  const projectionCenterX = projection.centerX + source.speed * dt;
  const projectionRadius = Math.max( projection.radius, EPSILON );
  const distance = Math.sqrt( ( x - projectionCenterX ) ** 2 + ( y - projection.centerY ) ** 2 );
  const edgeFeather = Math.max( projection.edgeFeather ?? 0, 0 );

  if ( dt > EPSILON ) {
    const spread = getMeasurementProjectionSpread( source, projectionRadius, dt );
    const deficit = spread.deficitStrength * Math.exp( -0.5 * ( distance / spread.falloffScale ) ** spread.exponent );
    return Math.max( 0, Math.min( 1, 1 - deficit ) );
  }

  if ( distance >= projectionRadius ) {
    return 1;
  }

  return getInitialMeasurementProjectionMask( distance, projectionRadius, edgeFeather );
}

/**
 * Computes the instantaneous detector-disk mask for a failed measurement.
 *
 * The saturated gaussian deficit suppresses the detector center while the optional feather blends
 * back to an unchanged mask at the detector boundary. Call this only for samples inside the detector
 * radius at measurement time. This helper is pure.
 */
function getInitialMeasurementProjectionMask(
  distance: number,
  projectionRadius: number,
  edgeFeather: number
): number {
  const saturatedGaussian = MEASUREMENT_BITE_INITIAL_SATURATION *
                            Math.exp( -0.5 * ( distance / projectionRadius ) ** 2 );
  const localMask = Math.max( 0, 1 - saturatedGaussian );

  // Keep failed-detection effects local to the detector: the designer-tunable feather is applied
  // inside the detector boundary only, so samples outside projectionRadius are untouched.
  const boundaryBlend = edgeFeather > EPSILON ?
                        smoothStep( Math.max( 0, projectionRadius - edgeFeather ), projectionRadius, distance ) :
                        0;
  return localMask + ( 1 - localMask ) * boundaryBlend;
}

/**
 * Computes the spreading shape parameters for an old failed-measurement deficit.
 *
 * The spread time scales with detector radius relative to the packet width, while the exponent relaxes
 * from a steep disk-like super-Gaussian toward a normal Gaussian as the deficit expands. The returned
 * values are used by getMeasurementProjectionMask and are pure derived data.
 */
function getMeasurementProjectionSpread(
  source: GaussianPacketSource,
  projectionRadius: number,
  dt: number
): MeasurementProjectionSpread {
  const referenceRadius = Math.max( source.sigmaX0 * MEASUREMENT_BITE_REFERENCE_RADIUS_TO_PACKET_SIGMA_X, EPSILON );
  const proportionalSpreadTime = MEASUREMENT_BITE_REFERENCE_SPREAD_TIME * projectionRadius / referenceRadius;
  const spreadTime = Math.max( EPSILON, Math.min( proportionalSpreadTime, MEASUREMENT_BITE_MAX_SPREAD_TIME ) );
  const sigma = projectionRadius * Math.sqrt( 1 + ( dt / spreadTime ) ** 2 );
  const spreadRatio = projectionRadius / sigma;
  const exponent = 2 + ( MEASUREMENT_BITE_MAX_SUPER_GAUSSIAN_EXPONENT - 2 ) * spreadRatio * spreadRatio;

  return {
    falloffScale: sigma / Math.pow( -2 * Math.log( MEASUREMENT_BITE_EDGE_DEFICIT ), 1 / exponent ),

    // A single centered deficit avoids making the original detector radius a persistent visual feature,
    // and the peak decays like a spreading two-dimensional deficit so the bite fills in everywhere at once.
    deficitStrength: spreadRatio * spreadRatio,
    exponent: exponent
  };
}
