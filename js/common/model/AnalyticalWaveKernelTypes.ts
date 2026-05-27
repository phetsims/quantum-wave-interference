// Copyright 2026, University of Colorado Boulder

/**
 * Public data shapes for the pure analytical wave kernel.
 *
 * Keeping these types separate from AnalyticalWaveKernel makes the evaluator easier to scan while
 * preserving one shared vocabulary for solvers, rasterizers, and tests.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';

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

  // Kept only so legacy saved states and hand-authored test parameters can be read harmlessly.
  // Radius-dependent spreading ignores this field.
  shrinkDuration?: number;
};

export type AnalyticalWaveParameters = {
  source: AnalyticalSource;
  barrier: AnalyticalBarrier;
  projections?: MeasurementProjection[];
  decoherenceEvents?: readonly DecoherenceEvent[];
  packetReEmission?: GaussianPacketReEmission | null;
};
