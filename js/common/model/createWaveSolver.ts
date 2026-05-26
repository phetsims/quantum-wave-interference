// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create the analytical WaveSolver for each screen.
 *
 * createContinuousWaveSolver() is used by the High Intensity screen (plane wave propagation).
 * createWavePacketSolver() is used by the Single Particles screen (Gaussian wave packet).
 *
 * TODO: This file seems extraneous and unnecessary, document its utility or delete it, see https://github.com/phetsims/quantum-wave-interference/issues/135
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import AnalyticalWavePacketSolver from './AnalyticalWavePacketSolver.js';
import AnalyticalWaveSolver from './AnalyticalWaveSolver.js';
import type WaveSolver from './WaveSolver.js';

export function createContinuousWaveSolver(): WaveSolver {
  return new AnalyticalWaveSolver(
    QuantumWaveInterferenceQueryParameters.waveSolverGridSize,
    QuantumWaveInterferenceQueryParameters.waveSolverGridSize
  );
}

export function createWavePacketSolver(): WaveSolver {
  return new AnalyticalWavePacketSolver(
    QuantumWaveInterferenceQueryParameters.waveSolverGridSize,
    QuantumWaveInterferenceQueryParameters.waveSolverGridSize
  );
}
