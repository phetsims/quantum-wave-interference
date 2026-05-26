// Copyright 2026, University of Colorado Boulder

/**
 * WaveSolver defines the interface for wave propagation solvers used by both the High Intensity
 * and Single Particles screens.
 *
 * The solver manages a 2D complex amplitude field on a visualization grid and computes the
 * probability distribution at the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { type DecoherenceEvent, type FieldSample, type GaussianPacketReEmission, type LayeredFieldSample } from './AnalyticalWaveKernel.js';
import { type BarrierType } from './BarrierType.js';

// TODO: Document anything exported. What is its meaning? When does the developer need to know about it? See https://github.com/phetsims/quantum-wave-interference/issues/135
export type WaveSolverMeasurementProjectionState = {
  centerX: number;
  centerY: number;
  radius: number;
  edgeFeather?: number;
  measurementTime: number;
  renormScale: number;
};

export type LegacyWaveSolverMeasurementProjectionState = {
  worldX0: number;
  worldY: number;
  invSigmaSq: number;
  edgeFeather?: number;
  measurementTime: number;
  renormScale?: number;
  shrinkDuration?: number;
};

export type AnalyticalWaveSolverState = {
  time: number;
  sourceOnTime: number | null;
  detectorAccumulator: number[];
  detectorAccumulatorCount: number;
};

export type AnalyticalWavePacketSolverState = {
  time: number;
  measurementProjections: WaveSolverMeasurementProjectionState[];
  packetReEmission: GaussianPacketReEmission | null;
};

export type LegacyAnalyticalWavePacketSolverState = {
  time: number;
  biteGaussians: LegacyWaveSolverMeasurementProjectionState[];
  packetReEmission?: GaussianPacketReEmission | null;
};

export type WaveSolverState = AnalyticalWaveSolverState | AnalyticalWavePacketSolverState | LegacyAnalyticalWavePacketSolverState;

export type WaveSolverParameters = {
  wavelength?: number;
  waveSpeed?: number;
  displaySpeedScale?: number;
  displayWavelengths?: number;
  barrierType?: BarrierType;
  slitSeparation?: number;
  slitSeparationMin?: number;
  slitSeparationMax?: number;
  slitWidth?: number;
  barrierFractionX?: number;
  isTopSlitOpen?: boolean;
  isBottomSlitOpen?: boolean;
  isTopSlitDecoherent?: boolean;
  isBottomSlitDecoherent?: boolean;
  isSourceOn?: boolean;
  regionWidth?: number;
  regionHeight?: number;
  decoherenceEvents?: readonly DecoherenceEvent[];
  packetReEmission?: GaussianPacketReEmission | null;
};

type WaveSolver = {

  readonly gridWidth: number;

  readonly gridHeight: number;

  readonly defaultDisplayWavelengths: number;

  step( dt: number ): void;

  getTime(): number;

  getAmplitudeField(): Float64Array;

  /**
   * Evaluates the field analytically at continuous model coordinates and an optional solver time.
   * x is measured from the source side of the wave region, and y is centered on the region.
   */
  evaluate( x: number, y: number, t?: number ): Complex;

  /**
   * Returns the physically meaningful field sample for a solver grid cell at the current solver time.
   * Unlike getAmplitudeField(), this preserves status information such as unreached/absorbed/blocked
   * and independent decoherent components.
   */
  getFieldSampleAtGridCell( gridX: number, gridY: number ): FieldSample;

  usesLayeredFieldSamples?(): boolean;

  getLayeredFieldSampleAtGridCell?( gridX: number, gridY: number ): LayeredFieldSample;

  getDetectorProbabilityDistribution( sampleCount?: number ): Float64Array;

  getDisplayPropagationSpeed(): number;

  setParameters( params: WaveSolverParameters ): void;

  reset(): void;

  invalidate(): void;

  /**
   * Applies a measurement projection to the wavefunction and renormalizes the remainder so the total
   * probability is preserved. The projection persists across subsequent step() calls. Center is normalized
   * (0..1) within the visualization region; radius is a fraction of the grid width. Continuous-wave solvers
   * may treat this as a no-op.
   */
  applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void;

  getState(): WaveSolverState;

  setState( state: WaveSolverState ): void;
};

export default WaveSolver;
