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

  // Width of the front-facing detector screen rect.
  public static readonly DETECTOR_SCREEN_WIDTH = 376;

  // Uniform scale factor for the top-row overhead elements (emitter, slit, detector, beam visuals).
  public static readonly OVERHEAD_ELEMENT_SCALE = 1.2;

  // Relative skew amount for overhead parallelograms (1 = original skew, 0.5 = 50% less skew).
  public static readonly OVERHEAD_SKEW_SCALE = 0.5;

  // Maximum number of hits allowed in Hits mode before the source is shut off.
  public static readonly MAX_HITS = 25000;

  /**
   * Converts a slit width from millimeters to micrometers and returns the value along with an appropriate number of
   * decimal places: 0 for >=1, 1 for >=0.1, 2 otherwise.
   */
  public static slitWidthMMToMicrometers( slitWidthMM: number ): { slitWidthUM: number; decimalPlaces: number } {
    const slitWidthUM = slitWidthMM * 1000;
    const decimalPlaces = slitWidthUM >= 1 ? 0 :
                          slitWidthUM >= 0.1 ? 1 : 2;
    return { slitWidthUM: slitWidthUM, decimalPlaces: decimalPlaces };
  }
}
