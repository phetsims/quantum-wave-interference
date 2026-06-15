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
import { type DecoherenceEvent, type FieldSample, type GaussianPacketReEmission, type LayeredFieldSample } from './AnalyticalWaveKernelTypes.js';
import { type BarrierType } from './BarrierType.js';

/**
 * Serializable measurement projection for the Single Particles detector probe. The packet solver stores one of these
 * after a failed detector-probe measurement so subsequent field samples include the resulting probability deficit.
 * Developers usually need this only when working on solver state, saved-state migration, or detector-probe physics.
 */
export type WaveSolverMeasurementProjectionState = {

  // Projection center in solver model coordinates, measured from the source side of the wave region.
  centerX: number;

  // Projection center in solver model coordinates, with y = 0 at the vertical center of the wave region.
  centerY: number;

  // Projection radius in solver model coordinates, scaled from the detector-probe radius.
  radius: number;

  // Width of the smooth inner-edge transition, in solver model coordinates.
  edgeFeather?: number;

  // Solver time, in model seconds, when the projection was applied.
  measurementTime: number;

  // Amplitude multiplier used to preserve total integrated probability after the projection.
  renormScale: number;
};

/**
 * Serializable state for the High Intensity continuous-wave solver. It preserves the solver clock and detector-screen
 * averaging data so PhET-iO state restore can resume the current wavefront and intensity pattern.
 */
export type AnalyticalWaveSolverState = {

  // Current solver time in model seconds.
  time: number;

  // Solver time when the source was most recently turned on, or null when no active wavefront has been emitted.
  sourceOnTime: number | null;

  // Running sum of instantaneous detector probabilities, one entry per detector grid row.
  detectorAccumulator: number[];

  // Number of instantaneous detector distributions included in detectorAccumulator.
  detectorAccumulatorCount: number;
};

/**
 * Serializable state for the Single Particles Gaussian-packet solver. It preserves the solver clock, detector-probe
 * measurement projections, and any which-slit re-emission descriptor for the active packet.
 */
export type AnalyticalWavePacketSolverState = {

  // Current solver time in model seconds.
  time: number;

  // Active failed-detection projections applied to the packet wavefunction.
  measurementProjections: WaveSolverMeasurementProjectionState[];

  // Descriptor for a packet re-emitted from a selected slit after which-slit detection, or null when absent.
  packetReEmission: GaussianPacketReEmission | null;
};

/**
 * Union of all solver state payloads accepted by WaveSolver.setState(). Callers should treat this as an opaque
 * serialization contract and use discriminating property checks when they need solver-specific fields.
 */
export type WaveSolverState = AnalyticalWaveSolverState | AnalyticalWavePacketSolverState;

/**
 * Partial scene-to-solver parameter update. setParameters() treats undefined fields as "leave the previous value
 * unchanged", so callers can send only the model values that changed or that belong to a subclass-specific solver.
 */
export type WaveSolverParameters = {

  // Effective physical wavelength in meters, used to derive display-scale wave geometry.
  wavelength?: number;

  // Effective physical propagation speed in meters per second.
  waveSpeed?: number;

  // Ratio of the current physical speed to the scene's default speed, used for display-time animation.
  displaySpeedScale?: number;

  // Number of wavelengths that should fit across the solver region at the current display scale.
  displayWavelengths?: number;

  // Barrier configuration for the wave region.
  barrierType?: BarrierType;

  // Physical slit-center separation in meters.
  slitSeparation?: number;

  // Minimum physical slit-center separation in meters, used to map the control range to display coordinates.
  slitSeparationMin?: number;

  // Maximum physical slit-center separation in meters, used to map the control range to display coordinates.
  slitSeparationMax?: number;

  // Physical slit aperture width in meters.
  slitWidth?: number;

  // Horizontal barrier position as a fraction of the solver region width.
  barrierFractionX?: number;

  // Whether the upper slit aperture passes the field.
  isTopSlitOpen?: boolean;

  // Whether the lower slit aperture passes the field.
  isBottomSlitOpen?: boolean;

  // Whether the upper slit path has an active which-path detector and should decohere from the other slit.
  isTopSlitDecoherent?: boolean;

  // Whether the lower slit path has an active which-path detector and should decohere from the other slit.
  isBottomSlitDecoherent?: boolean;

  // Whether the source is currently emitting into the solver.
  isSourceOn?: boolean;

  // Solver region width in display-model coordinates.
  regionWidth?: number;

  // Solver region height in display-model coordinates.
  regionHeight?: number;

  // Time-ordered which-path detector records used to attenuate or layer slit components.
  decoherenceEvents?: readonly DecoherenceEvent[];

  // Single Particles packet re-emission descriptor after which-slit detection; null clears it.
  packetReEmission?: GaussianPacketReEmission | null;
};

/**
 * Shared interface for wave propagation adapters used by the High Intensity and Single Particles screens. The
 * interface separates scene models from a specific numerical or analytical implementation while preserving the
 * combined grid-amplitude API used by view code.
 */
type WaveSolver = {

  // Number of horizontal cells in the solver visualization grid.
  readonly gridWidth: number;

  // Number of vertical cells in the solver visualization grid.
  readonly gridHeight: number;

  // Fallback display wavelength count used when a scene cannot compute one from physical parameters.
  readonly defaultDisplayWavelengths: number;

  /**
   * Advances the solver clock by dt model seconds and marks cached field data invalid.
   */
  step( dt: number ): void;

  /**
   * Gets the current solver time in model seconds.
   */
  getTime(): number;

  /**
   * Returns the cached complex amplitude grid as interleaved real/imaginary values. Callers should prefer
   * getFieldSampleAtGridCell() when they need status or decoherent component information.
   */
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

  /**
   * Returns true when the solver supports independent renderer layers. The view calls this before
   * getLayeredFieldSampleAtGridCell to decide whether to use layered compositing. Solvers that do not
   * override this method are treated as non-layered and only getFieldSampleAtGridCell is used. Both
   * optional methods must be implemented together — a solver must not implement one without the other.
   */
  usesLayeredFieldSamples?(): boolean;

  /**
   * Returns the layered field sample for a solver grid cell at the current solver time. Only called by the
   * view when usesLayeredFieldSamples() returns true. gridX and gridY are integer cell indices within the
   * solver visualization grid (0..gridWidth-1 and 0..gridHeight-1 respectively). Solvers that do not use
   * layered compositing need not implement this method.
   */
  getLayeredFieldSampleAtGridCell?( gridX: number, gridY: number ): LayeredFieldSample;

  /**
   * Returns the normalized detector-screen probability distribution, optionally resampled to sampleCount rows.
   */
  getDetectorProbabilityDistribution( sampleCount?: number ): Float64Array;

  /**
   * Gets the propagation speed in solver display-model coordinates.
   */
  getDisplayPropagationSpeed(): number;

  /**
   * Applies partial scene parameters. Undefined fields leave previous values unchanged.
   */
  setParameters( params: WaveSolverParameters ): void;

  /**
   * Restores the solver to its initial state and clears cached field data.
   */
  reset(): void;

  /**
   * Marks cached field and detector data dirty so it will be recomputed on the next query.
   */
  invalidate(): void;

  /**
   * Applies a measurement projection to the wavefunction and renormalizes the remainder so the total
   * probability is preserved. The projection persists across subsequent step() calls. Center is normalized
   * (0..1) within the visualization region; radius is a fraction of the grid width. Continuous-wave solvers
   * may treat this as a no-op.
   */
  applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void;

  /**
   * Gets the serializable solver state for PhET-iO state save/restore.
   */
  getState(): WaveSolverState;

  /**
   * Restores a previously serialized solver state and invalidates cached field data.
   */
  setState( state: WaveSolverState ): void;
};

export default WaveSolver;
