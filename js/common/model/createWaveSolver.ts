// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create the appropriate WaveSolver based on the ?waveModel query parameter.
 *
 * createContinuousWaveSolver() is used by the High Intensity screen (plane wave propagation).
 * createWavePacketSolver() is used by the Single Particles screen (Gaussian wave packet).
 *
 * With ?waveModel=default (the default), High Intensity uses AnalyticalWaveSolver and
 * Single Particles uses GPUWavePacketSolver. Explicit overrides ('analytical', 'lattice',
 * 'gpu') force that solver on all screens where an implementation exists.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import AnalyticalWaveSolver from './AnalyticalWaveSolver.js';
import AnalyticalWavePacketSolver from './AnalyticalWavePacketSolver.js';
import GPUWavePacketSolver from './GPUWavePacketSolver.js';
import LatticeWaveSolver from './LatticeWaveSolver.js';
import LatticeWavePacketSolver from './LatticeWavePacketSolver.js';
import type WaveSolver from './WaveSolver.js';

export function createContinuousWaveSolver(): WaveSolver {
  return QuantumWaveInterferenceQueryParameters.waveModel === 'lattice'
    ? new LatticeWaveSolver()
    : new AnalyticalWaveSolver();
}

export function createWavePacketSolver(): WaveSolver {
  const model = QuantumWaveInterferenceQueryParameters.waveModel;
  return model === 'analytical' ? new AnalyticalWavePacketSolver() :
         model === 'lattice' ? new LatticeWavePacketSolver() :
         new GPUWavePacketSolver();
}
