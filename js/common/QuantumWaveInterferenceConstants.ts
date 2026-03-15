// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceConstants is the set of constants used throughout the 'Quantum Wave Interference' simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import quantumWaveInterference from '../quantumWaveInterference.js';

export default class QuantumWaveInterferenceConstants {

  private constructor() {
    // Not intended for instantiation.
  }

  public static readonly SCREEN_VIEW_X_MARGIN = 15;
  public static readonly SCREEN_VIEW_Y_MARGIN = 15;
}

quantumWaveInterference.register( 'QuantumWaveInterferenceConstants', QuantumWaveInterferenceConstants );