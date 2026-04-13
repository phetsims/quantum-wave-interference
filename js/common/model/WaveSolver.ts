// Copyright 2026, University of Colorado Boulder

/**
 * WaveSolver defines the interface for wave propagation solvers used by both the High Intensity
 * and Single Particles screens. Both the analytical solver and the lattice-based FDTD solver
 * implement this interface, allowing all model and view code to be solver-agnostic.
 *
 * The solver manages a 2D complex amplitude field on a visualization grid and computes the
 * probability distribution at the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type ObstacleType } from './ObstacleType.js';

export type WaveSolverParameters = {
  wavelength?: number;
  waveSpeed?: number;
  obstacleType?: ObstacleType;
  slitSeparation?: number;
  slitWidth?: number;
  barrierFractionX?: number;
  isTopSlitOpen?: boolean;
  isBottomSlitOpen?: boolean;
  isSourceOn?: boolean;
  regionWidth?: number;
  regionHeight?: number;
};

type WaveSolver = {

  readonly gridWidth: number;

  readonly gridHeight: number;

  step( dt: number ): void;

  getAmplitudeField(): Float64Array;

  getDetectorProbabilityDistribution(): Float64Array;

  setParameters( params: WaveSolverParameters ): void;

  reset(): void;

  invalidate(): void;
};

export default WaveSolver;
