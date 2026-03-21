// Copyright 2026, University of Colorado Boulder

/**
 * Constants specific to the Experiment screen layout.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class ExperimentConstants {

  private constructor() {
    // Not intended for instantiation.
  }

  // Width of the front-facing slit view background rectangle.
  public static readonly FRONT_FACING_SLIT_VIEW_WIDTH = 204;

  // Shared height for both the front-facing slit view and the front-facing detector screen.
  public static readonly FRONT_FACING_ROW_HEIGHT = 155;

  // Y position where the front-facing view backgrounds start.
  // Increased to add more vertical separation below the overhead row.
  public static readonly FRONT_FACING_ROW_TOP = 180;

  // X position of the front-facing slit view left edge.
  public static readonly FRONT_FACING_SLIT_LEFT = 305;

  // Width of the front-facing detector screen rect.
  public static readonly DETECTOR_SCREEN_WIDTH = 370;
}
