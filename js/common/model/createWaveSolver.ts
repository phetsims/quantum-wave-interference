// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create the analytical WaveSolver for each screen.
 *
 * createContinuousWaveSolver() is used by the High Intensity screen (plane wave propagation).
 * createWavePacketSolver() is used by the Single Particles screen (Gaussian wave packet).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import AnalyticalWavePacketSolver from './AnalyticalWavePacketSolver.js';
import AnalyticalWaveSolver from './AnalyticalWaveSolver.js';
import type WaveSolver from './WaveSolver.js';

export function createContinuousWaveSolver(): WaveSolver {
  return new AnalyticalWaveSolver();
}

export function createWavePacketSolver(): WaveSolver {
  return new AnalyticalWavePacketSolver();
}
