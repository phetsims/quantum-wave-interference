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

import { type AnalyticalWaveParameters, type FieldSample, type LayeredFieldSample } from './AnalyticalWaveKernelTypes.js';
import { applyDecoherenceEvent, applyPlaneWaveDecoherenceEventLayers } from './AnalyticalWaveDecoherence.js';
import { applyGaussianPacketMeasurementProjectionLayers, applyMeasurementProjections } from './AnalyticalWaveMeasurementProjection.js';
import { evaluateUndecoheredAnalyticalSample } from './AnalyticalWavePropagation.js';

/**
 * Evaluates the model-facing analytical field at one sample point.
 *
 * The result includes barrier propagation, detector-record decoherence, and failed-measurement
 * projections, but does not allocate or mutate solver grid state. Call this when model code needs
 * the physical FieldSample used for intensity, graph, screen, or representative-complex queries.
 */
export function evaluateAnalyticalSample(
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): FieldSample {
  let sample = evaluateUndecoheredAnalyticalSample( parameters, x, y, t );

  sample = applyDecoherenceEvent( sample, parameters, x, y, t );

  return applyMeasurementProjections( sample, parameters.projections || [], parameters.source, x, y, t );
}

/**
 * Evaluates both the model-facing field and the rendering-facing layered field at one sample point.
 *
 * The returned sample is the same value evaluateAnalyticalSample would compute. The layered sample
 * preserves particle-chain bands needed by rasterized wave rendering, especially for High Intensity
 * which-path records. This pure function is the appropriate entry point for renderers that need both
 * numerical field data and layer alpha/order data from the same parameters.
 */
export function evaluateAnalyticalSamples(
  parameters: AnalyticalWaveParameters,
  x: number,
  y: number,
  t: number
): { sample: FieldSample; layeredSample: LayeredFieldSample } {
  const undecoheredSample = evaluateUndecoheredAnalyticalSample( parameters, x, y, t );
  const decoheredSample = applyDecoherenceEvent( undecoheredSample, parameters, x, y, t );
  const sample = applyMeasurementProjections( decoheredSample, parameters.projections || [], parameters.source, x, y, t );

  let layeredSample: LayeredFieldSample;
  if ( undecoheredSample.kind !== 'field' ) {
    layeredSample = undecoheredSample;
  }
  else if ( parameters.source.kind !== 'plane' ) {
    layeredSample = decoheredSample.kind === 'field' ?
                    applyGaussianPacketMeasurementProjectionLayers( decoheredSample, parameters, x, y, t ) :
                    decoheredSample;
  }
  else {
    layeredSample = applyPlaneWaveDecoherenceEventLayers( undecoheredSample, parameters, x, y, t );
  }

  return {
    sample: sample,
    layeredSample: layeredSample
  };
}
