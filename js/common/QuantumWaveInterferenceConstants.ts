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

  // Width of the front-facing slit view background rectangle.
  public static readonly FRONT_FACING_SLIT_VIEW_WIDTH = 204;

  // Shared height for both the front-facing slit view and the front-facing detector screen.
  public static readonly FRONT_FACING_ROW_HEIGHT = 155;

  // Y position where the front-facing view backgrounds start.
  public static readonly FRONT_FACING_ROW_TOP = 165;

  // X position of the front-facing slit view left edge.
  public static readonly FRONT_FACING_SLIT_LEFT = 305;

  // Width of the front-facing detector screen rect.
  public static readonly DETECTOR_SCREEN_WIDTH = 370;

  // Padding between the front-facing display areas (screen rect, accordion box) and their
  // adjacent side buttons (eraser, snapshot, zoom).
  public static readonly INTERNAL_PADDING = 10;
}
