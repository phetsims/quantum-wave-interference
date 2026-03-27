// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceConstants is the set of constants used throughout the 'Quantum Wave Interference' simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class QuantumWaveInterferenceConstants {

  private constructor() {
    // Not intended for instantiation.
  }

  public static readonly SCREEN_VIEW_X_MARGIN = 15;
  public static readonly SCREEN_VIEW_Y_MARGIN = 15;

  // Padding between the front-facing display areas (screen rect, accordion box) and their
  // adjacent side buttons (eraser, snapshot, zoom).
  public static readonly INTERNAL_PADDING = 10;

  // Physical constants
  public static readonly PLANCK_CONSTANT = 6.626e-34; // J·s

  // Particle masses in kg
  public static readonly ELECTRON_MASS = 9.109e-31;
  public static readonly NEUTRON_MASS = 1.675e-27;
  public static readonly HELIUM_ATOM_MASS = 6.646e-27;
}