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

  // Physical constants
  public static readonly PLANCK_CONSTANT = 6.626e-34; // J·s

  // Particle masses in kg
  public static readonly ELECTRON_MASS = 9.109e-31;
  public static readonly NEUTRON_MASS = 1.675e-27;
  public static readonly HELIUM_ATOM_MASS = 6.646e-27;

  // Maximum value for the screen brightness slider, shared across all screens
  public static readonly SCREEN_BRIGHTNESS_MAX = 0.25;

  // Maximum number of snapshots that can be saved per scene
  public static readonly MAX_SNAPSHOTS = 4;

  // Shared layout dimensions for the wave visualization region and detector screen
  public static readonly WAVE_REGION_WIDTH = 420;
  public static readonly WAVE_REGION_HEIGHT = 350;
  public static readonly DETECTOR_SCREEN_SKEW = 18;
  public static readonly DETECTOR_SCREEN_WIDTH = 40;
  public static readonly RIGHT_PANEL_WIDTH = 180;
}