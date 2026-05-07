// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceConstants is the set of constants used throughout the 'Quantum Wave Interference' simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { numberOfDecimalPlaces } from '../../../dot/js/util/numberOfDecimalPlaces.js';

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

  // Number of display-scale wavelengths visible across the wave region at default settings.
  // Shared between the continuous-wave and wave-packet solvers so both screens show matching wavelengths.
  public static readonly DISPLAY_WAVELENGTHS = 15;

  // Single Particles screen Gaussian wave packet tuning. These values control the designer-facing
  // visual size and timing of each emitted packet, using fractions of the wave region so they scale
  // with the displayed physical region.

  // Default display time for the center of a wave packet to cross the wave region at the scene's
  // default physical particle speed. The solver converts this to an actual display propagation speed
  // with regionWidth / WAVE_PACKET_TRAVERSAL_TIME, then scales by effectiveWaveSpeed / defaultWaveSpeed
  // in BaseSceneModel.syncSolverParameters. So faster particles cross the display faster; this constant
  // is the baseline animation timing, not a fixed physical speed.
  public static readonly WAVE_PACKET_TRAVERSAL_TIME = 1.5;

  // Initial one-sigma packet radius as a fraction of the wave region. Increase both values to make
  // the packet visibly larger; decrease both to make it tighter. The original values were 0.12.
  public static readonly WAVE_PACKET_SIGMA_X_FRACTION = 0.2;
  public static readonly WAVE_PACKET_SIGMA_Y_FRACTION = 0.2;

  // The packet starts this many sigma_x widths to the left of the visible region so it enters smoothly.
  public static readonly WAVE_PACKET_START_OFFSET_SIGMAS = 3;

  // Slit-detector re-emission starts with this many sigma_x of packet history already elapsed. This
  // keeps the source-side packet reset, while avoiding a long wait before the new packet is visible
  // at the detected aperture in slow motion.
  public static readonly WAVE_PACKET_RE_EMISSION_TIME_ADVANCE_SIGMAS = 1.5;

  // Controls packet spreading in display time. Larger values spread more slowly after emission.
  public static readonly WAVE_PACKET_LONGITUDINAL_SPREAD_TRAVERSALS = 2.5;
  public static readonly WAVE_PACKET_TRANSVERSE_SPREAD_TRAVERSALS = 1.5;

  // Maximum value for the screen brightness slider, shared across all screens
  public static readonly SCREEN_BRIGHTNESS_MAX = 0.25;

  // Maximum number of snapshots that can be saved per scene
  public static readonly MAX_SNAPSHOTS = 4;

  // Shared layout dimensions for the wave visualization region and detector screen
  public static readonly WAVE_REGION_WIDTH = 420;
  public static readonly WAVE_REGION_HEIGHT = 385;
  public static readonly DETECTOR_SCREEN_WIDTH = 88;
  public static readonly DETECTOR_SCREEN_OVERLAP = 15;

  // Angle of the detector screen's top/bottom edges above horizontal (degrees). The left and right
  // edges are vertical; adjusting this single value changes the perspective skew.
  public static readonly DETECTOR_SCREEN_ANGLE_DEGREES = 20;
  public static readonly DETECTOR_SCREEN_SKEW = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH *
    Math.tan( QuantumWaveInterferenceConstants.DETECTOR_SCREEN_ANGLE_DEGREES * Math.PI / 180 );
  public static readonly RIGHT_PANEL_WIDTH = 180;

  // Shared vertical placement for the source-type scene button group.
  public static readonly SCENE_BUTTON_GROUP_CENTER_Y = 470;

  public static getRangeDecimalPlaces( min: number, max: number ): number {
    return Math.max( numberOfDecimalPlaces( min ), numberOfDecimalPlaces( max ) );
  }
}
