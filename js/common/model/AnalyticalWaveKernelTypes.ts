// Copyright 2026, University of Colorado Boulder

/**
 * Public data shapes for the pure analytical wave kernel.
 *
 * Keeping these types separate from AnalyticalWaveKernel makes the evaluator easier to scan while
 * preserving one shared vocabulary for solvers, rasterizers, and tests.
 *
 * Conventions shared by every type in this file:
 * - Positions are wave-region model coordinates: x increases downstream from the source plane at
 *   x = 0, and y = 0 is the vertical center of the wave region.
 * - Times are solver display times in seconds, on the same clock as the t passed to the evaluators.
 * - waveNumber is in radians per model-distance unit and speed is in model-distance units per second.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';

/**
 * Identifies the path that produced a field component: the direct field from the source, or
 * diffraction through one of the two slit apertures.
 */
export type FieldComponentSource = 'incident' | 'topSlit' | 'bottomSlit';

/**
 * The slit chosen by a which-path interaction. Incident components can never be selected, so this is
 * the slit subset of FieldComponentSource.
 */
export type DecoherenceSlit = 'topSlit' | 'bottomSlit';

/**
 * One which-path detector record. For plane waves the record applies only to the temporal particle
 * slice whose wavefront passed the slits at the record time; for gaussian packets the latest causal
 * record projects the entire packet.
 */
export type DecoherenceEvent = {

  // Solver time when the wavefront or packet interacted with the slit detectors. Downstream samples
  // compare this against their retarded slit pass time, not against the current sample time.
  time: number;

  // The slit the interaction collapsed to. The kernel preserves this slit's component and attenuates
  // the other slit's component.
  selectedSlit: DecoherenceSlit;

  // The slit whose physical detector recorded the hit, or undefined when the selected slit has no
  // detector. The kernel ignores this field; scene models use it to increment detector hit counts.
  clickedDetectorSlit?: DecoherenceSlit;
};

/**
 * Replaces the original gaussian packet with a fresh packet emitted from the selected slit aperture
 * after an on-slit detector clicks (Single Particles screen). While present, the kernel evaluates
 * only the re-emitted packet: samples before eventTime or upstream of sourceX are unreached.
 */
export type GaussianPacketReEmission = {

  // The slit aperture the packet was detected at and re-emitted from.
  selectedSlit: DecoherenceSlit;

  // Solver time of the detector click. The re-emitted packet's local clock starts at this time.
  eventTime: number;

  // Optional non-negative head start added to the re-emitted packet's local clock so the new packet
  // appears already partway through the aperture instead of materializing with zero evolution.
  // Negative values are clamped to zero.
  timeAdvance?: number;

  // x coordinate of the re-emission plane, i.e. the barrier position.
  sourceX: number;

  // Center y of the selected aperture, which becomes the new packet's transverse center.
  centerY: number;

  // Aperture width. On the re-emission plane itself, only samples within width / 2 of centerY are
  // reached; downstream, this width drives the diffraction transfer.
  width: number;
};

/**
 * One coherent path contribution at a sample point. A sample carries one component per reachable
 * path so decohered paths can be kept from interfering.
 */
export type FieldComponent = {

  // The path that produced this contribution.
  source: FieldComponentSource;

  // Components with the same group name sum coherently (by complex amplitude) before squaring;
  // different group names add by intensity. Solvers give slits with which-path detectors their own
  // group names so their contributions cannot interfere.
  coherenceGroup: string;

  // Optional visual wavefront support in [0,1] for rendering: how strongly this point should be
  // drawn as reached field rather than unreached vacuum. Diffraction interference can drive |value|
  // to zero at points the wavefront has clearly reached, so support is tracked separately from
  // amplitude. When undefined, renderers fall back to amplitude-based visibility.
  support?: number;

  // Complex probability amplitude contributed by this path.
  value: Complex;
};

/**
 * The model-facing field status at one ( x, y, t ) sample point.
 * - 'unreached': no source field has causally arrived; rendered as vacuum.
 * - 'absorbed': on the barrier plane, on closed barrier material.
 * - 'blocked': downstream of a barrier with no open slits.
 * - 'field': causally reached by the source. components may be empty when every reachable path
 *   currently contributes zero amplitude; that still means reached field, not vacuum.
 */
export type FieldSample =
  { kind: 'unreached' } |
  { kind: 'absorbed' } |
  { kind: 'blocked' } |
  { kind: 'field'; components: FieldComponent[] };

/**
 * Rendering-level description of one visible particle-chain band.
 */
export type FieldLayer = {

  // z-compositing key: layers with larger order draw over layers with smaller order. Decoherence
  // bands use their detector-record time so newer particle bands paint over older ones.
  order: number;

  // Band envelope in [0,1], used as the layer's opacity so chain heads/tails fade to the vacuum
  // background instead of painting black.
  alpha: number;

  // The field components rendered in this layer, with the same coherence semantics as FieldSample.
  components: FieldComponent[];
};

/**
 * Renderer-facing counterpart of FieldSample. The status values are intentionally parallel, but the
 * 'field' case exposes renderable particle bands instead of an already-projected component list.
 */
export type LayeredFieldSample =
  { kind: 'unreached' } |
  { kind: 'absorbed' } |
  { kind: 'blocked' } |
  { kind: 'field'; layers: FieldLayer[] };

/**
 * Continuous plane-wave source used by the High Intensity screen, emitted from the source plane at
 * x = 0 toward +x.
 */
export type PlaneWaveSource = {
  kind: 'plane';

  // Spatial frequency in radians per model-distance unit.
  waveNumber: number;

  // Propagation speed in model-distance units per second. Non-positive speed produces no field.
  speed: number;

  // Solver time when emission began, or null when the source is off. A sample is unreached when its
  // retarded emission time ( t - pathLength / speed ) precedes startTime.
  startTime: number | null;

  // Optional distance over which the leading wavefront ramps smoothly from zero to full amplitude.
  // Undefined or zero produces a sharp wavefront.
  edgeTaperDistance?: number;
};

/**
 * Single spreading gaussian wave packet used by the Single Particles screen. The packet center moves
 * in +x at the given speed while its widths grow with their spread times, and the quadratic phase
 * chirp follows the analytical spreading solution.
 */
export type GaussianPacketSource = {
  kind: 'gaussianPacket';

  // Whether the packet currently exists. When false, samples are unreached.
  isActive: boolean;

  // Carrier spatial frequency in radians per model-distance unit.
  waveNumber: number;

  // Packet center speed in model-distance units per second.
  speed: number;

  // Packet center x at t = 0, typically negative so the packet starts upstream of the wave region.
  initialCenterX: number;

  // Packet center y, constant over time.
  centerY: number;

  // Initial longitudinal and transverse standard deviations at t = 0, in model-distance units.
  sigmaX0: number;
  sigmaY0: number;

  // Spreading timescales in seconds: each sigma grows like sigma0 * sqrt( 1 + ( t / spreadTime )^2 ),
  // and the same ratio drives the corresponding chirp term.
  longitudinalSpreadTime: number;
  transverseSpreadTime: number;
};

/**
 * Source field description: a continuous plane wave (High Intensity) or one gaussian packet
 * (Single Particles).
 */
export type AnalyticalSource = PlaneWaveSource | GaussianPacketSource;

/**
 * One slit aperture in the double-slit barrier.
 */
export type AnalyticalSlit = {

  // Which slit this is; becomes the source of this slit's downstream diffracted components.
  source: 'topSlit' | 'bottomSlit';

  // Aperture center y in model coordinates.
  centerY: number;

  // Full aperture extent in y, in model-distance units.
  width: number;

  // Closed slits contribute no downstream field, and their barrier-plane samples are absorbed.
  isOpen: boolean;

  // Coherence group assigned to this slit's components. Solvers give both slits one shared group
  // name when they should interfere, and a per-slit group name when a which-path detector makes
  // this slit decoherent. See FieldComponent.coherenceGroup for the summation rule.
  coherenceGroup: string;
};

/**
 * Barrier description: either no barrier, or a vertical barrier at x = barrierX containing slit
 * apertures. Samples with x < barrierX see only the incident source field.
 */
export type AnalyticalBarrier =
  { kind: 'none' } |
  {
    kind: 'doubleSlit';
    barrierX: number;
    slits: AnalyticalSlit[];
  };

/**
 * One failed detector-probe measurement applied to a gaussian packet. At measurementTime the
 * projection removes amplitude inside the detector disk; afterward the deficit advects with the
 * packet and spreads/fades so the bite fills back in. Plane-wave sources ignore projections.
 */
export type MeasurementProjection = {

  // Disk center in model coordinates at the moment of measurement. After measurementTime the deficit
  // center advects downstream at the packet speed.
  centerX: number;
  centerY: number;

  // Detector disk radius in model-distance units.
  radius: number;

  // Optional feather width applied inside the disk edge so the mask blends smoothly back to 1 at the
  // boundary. Effects never extend outside the radius. Undefined means no feathering.
  edgeFeather?: number;

  // Solver time of the failed measurement. The projection is inactive before this time.
  measurementTime: number;

  // Amplitude multiplier maintained by the solver so the projected packet keeps the same total
  // integrated intensity as the unprojected packet. 1 means no renormalization.
  renormScale: number;

  // Kept only so legacy saved states and hand-authored test parameters can be read harmlessly.
  // Radius-dependent spreading ignores this field.
  shrinkDuration?: number;
};

/**
 * Complete input to one analytical kernel evaluation: everything needed to answer "what is the
 * field at ( x, y, t )?" without any solver state. Treated as immutable during evaluation.
 */
export type AnalyticalWaveParameters = {
  source: AnalyticalSource;
  barrier: AnalyticalBarrier;

  // Failed-measurement projections in measurement order. Omitted or empty means none. Only
  // gaussian-packet sources are affected.
  projections?: MeasurementProjection[];

  // Which-path detector records ordered by ascending time. Omitted or empty means no decoherence.
  decoherenceEvents?: readonly DecoherenceEvent[];

  // When present (and the source is a gaussian packet), the original packet is replaced by the
  // packet re-emitted from the selected slit. Omitted or null means no re-emission has occurred.
  packetReEmission?: GaussianPacketReEmission | null;
};
