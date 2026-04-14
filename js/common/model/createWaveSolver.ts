// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create the appropriate WaveSolver based on the ?waveModel query parameter.
 *
 * createContinuousWaveSolver() is used by the High Intensity screen (plane wave propagation).
 * createWavePacketSolver() is used by the Single Particles screen (Gaussian wave packet).
 *
 * When ?waveModel=lattice, the High Intensity screen uses LatticeWaveSolver (FDTD classical wave
 * equation). The Single Particles screen currently falls back to AnalyticalWavePacketSolver for
 * the lattice option since a lattice-based Schrödinger packet solver has not yet been implemented.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import AnalyticalWaveSolver from './AnalyticalWaveSolver.js';
import AnalyticalWavePacketSolver from './AnalyticalWavePacketSolver.js';
import LatticeWaveSolver from './LatticeWaveSolver.js';
import type WaveSolver from './WaveSolver.js';

export function createContinuousWaveSolver(): WaveSolver {
  return QuantumWaveInterferenceQueryParameters.waveModel === 'lattice'
    ? new LatticeWaveSolver()
    : new AnalyticalWaveSolver();
}

export function createWavePacketSolver(): WaveSolver {
  // Lattice-based Schrödinger packet solver is not yet implemented; fall back to analytical.
  return new AnalyticalWavePacketSolver();
}
