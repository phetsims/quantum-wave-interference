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

import Vector2 from '../../../../dot/js/Vector2.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import { type FieldSample } from './AnalyticalWaveKernel.js';
import { type ObstacleType } from './ObstacleType.js';

export type WaveSolverState = Record<string, IntentionalAny>;

export type WaveSolverParameters = {
  wavelength?: number;
  waveSpeed?: number;
  displaySpeedScale?: number;
  displayWavelengths?: number;
  obstacleType?: ObstacleType;
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
};

type WaveSolver = {

  readonly gridWidth: number;

  readonly gridHeight: number;

  readonly defaultDisplayWavelengths: number;

  step( dt: number ): void;

  getAmplitudeField(): Float64Array;

  /**
   * Returns the physically meaningful field sample for a solver grid cell at the current solver time.
   * Unlike getAmplitudeField(), this preserves status information such as unreached/absorbed/blocked
   * and independent decoherent components.
   */
  getFieldSampleAtGridCell( gridX: number, gridY: number ): FieldSample;

  getDetectorProbabilityDistribution(): Float64Array;

  setParameters( params: WaveSolverParameters ): void;

  reset(): void;

  invalidate(): void;

  // Returns true if there are still waves in the visualization region (used for post-emitter-off propagation)
  hasWavesInRegion(): boolean;

  /**
   * Applies a measurement projection to the wavefunction: zero the amplitude inside the circular region
   * and renormalize the remainder so the total probability is preserved. The projection persists across
   * subsequent step() calls. Center is normalized (0..1) within the visualization region; radius is a
   * fraction of the grid width. Continuous-wave solvers may treat this as a no-op.
   */
  applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void;

  getState(): WaveSolverState;

  setState( state: WaveSolverState ): void;
};

export default WaveSolver;
