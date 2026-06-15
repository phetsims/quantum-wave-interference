// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceConstants is the set of constants used throughout the 'Quantum Wave Interference' simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import { numberOfDecimalPlaces } from '../../../dot/js/util/numberOfDecimalPlaces.js';
import { type CreditsData } from '../../../joist/js/CreditsNode.js';
import { type SourceType } from './model/SourceType.js';

const CREDITS: CreditsData = {
  leadDesign: 'Matthew Blackman',
  softwareDevelopment: 'Sam Reid, Matthew Blackman',
  team: 'Kathy Perkins, Martin Veillette, Ariel Paul, Amy Rouinfar',
  contributors: 'Stephen Pollock (University of Colorado Boulder), Gina Passante (California State ' +
                'University, Fullerton), Noah Finkelstein (University of Colorado Boulder), Carl Wieman ' +
                '(Stanford University), Sam McKagan',
  qualityAssurance: 'Matthew Moore, Valentina Pérez, Nancy Salpepi, Kathryn Woessner',
  graphicArts: '',
  soundDesign: '',
  thanks: ''
};

const WAVELENGTH_RANGE_NM_BY_SOURCE_TYPE: Readonly<Record<SourceType, readonly [ number, number ]>> = {
  photons: [ 380, 780 ],
  electrons: [ 0, 0 ],
  neutrons: [ 0, 0 ],
  heliumAtoms: [ 0, 0 ]
};

const PHOTON_WAVELENGTH_CONTROL_RANGE_NM = [ 400, 700 ] as const;

export default class QuantumWaveInterferenceConstants {

  private constructor() {
    // Not intended for instantiation.
  }

  public static readonly SCREEN_VIEW_X_MARGIN = 15;
  public static readonly SCREEN_VIEW_Y_MARGIN = 15;

  public static readonly CREDITS = CREDITS;

  // Physical constants
  public static readonly PLANCK_CONSTANT = 6.626e-34; // J·s
  public static readonly SPEED_OF_LIGHT = 3e8; // m/s

  // Particle masses in kg
  private static readonly ELECTRON_MASS = 9.109e-31;
  private static readonly NEUTRON_MASS = 1.675e-27;
  private static readonly HELIUM_ATOM_MASS = 6.646e-27;

  /**
   * Returns the rest mass of the particle for the given source type, in kilograms.
   * Photons have zero rest mass and return 0 as a sentinel; callers that use the mass
   * in de Broglie wavelength calculations should guard against this case.
   */
  public static getParticleMass( sourceType: SourceType ): number {
    return sourceType === 'photons' ? 0 :
           sourceType === 'electrons' ? QuantumWaveInterferenceConstants.ELECTRON_MASS :
           sourceType === 'neutrons' ? QuantumWaveInterferenceConstants.NEUTRON_MASS :
           sourceType === 'heliumAtoms' ? QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS :
           ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
  }

  public static readonly DEFAULT_PHOTON_WAVELENGTH_NM = 650;

  public static readonly PHOTON_WAVELENGTH_CONTROL_MIN_NM = PHOTON_WAVELENGTH_CONTROL_RANGE_NM[ 0 ];
  public static readonly PHOTON_WAVELENGTH_CONTROL_MAX_NM = PHOTON_WAVELENGTH_CONTROL_RANGE_NM[ 1 ];

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
  public static readonly WAVE_PACKET_SIGMA_X_FRACTION = 0.15;
  public static readonly WAVE_PACKET_SIGMA_Y_FRACTION = 0.15;

  // The packet starts this many sigma_x widths to the left of the visible region. Keep this close
  // enough that Single Particles packets appear promptly after emission while still entering smoothly.
  public static readonly WAVE_PACKET_START_OFFSET_SIGMAS = 2;

  // Slit-detector re-emission starts with this many sigma_x of packet history already elapsed. This
  // keeps the source-side packet reset, while avoiding a long wait before the new packet is visible
  // at the detected aperture in slow motion.
  public static readonly WAVE_PACKET_RE_EMISSION_TIME_ADVANCE_SIGMAS = 1.5;

  // Controls packet spreading in display time. Larger values spread more slowly after emission.
  public static readonly WAVE_PACKET_LONGITUDINAL_SPREAD_TRAVERSALS = 2.5;
  public static readonly WAVE_PACKET_TRANSVERSE_SPREAD_TRAVERSALS = 1.5;

  // Maximum percentage for the screen brightness slider, shared across all screens
  public static readonly SCREEN_BRIGHTNESS_MAX = 100;

  // Maximum number of hits allowed in Hits mode before the source is shut off.
  public static readonly MAX_HITS = 25000;

  // Maximum number of snapshots that can be saved per scene
  public static readonly MAX_SNAPSHOTS = 4;

  // Shared layout dimensions for the wave visualization region and detector screen
  public static readonly WAVE_REGION_WIDTH = 420;
  public static readonly WAVE_REGION_HEIGHT = 385;
  public static readonly DETECTOR_SCREEN_WIDTH = 66;
  public static readonly DETECTOR_SCREEN_VISIBLE_FRACTION = 0.67;
  public static readonly DETECTOR_SCREEN_OVERLAP_FRACTION = 0.33;

  // Angle of the detector screen's top/bottom edges above horizontal (degrees). The left and right
  // edges are vertical; adjusting this single value changes the perspective skew.
  private static readonly DETECTOR_SCREEN_ANGLE_DEGREES = 20;
  public static readonly DETECTOR_SCREEN_SKEW = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH *
                                                Math.tan( QuantumWaveInterferenceConstants.DETECTOR_SCREEN_ANGLE_DEGREES * Math.PI / 180 );

  // Shared detector-screen controls panel dimensions.
  public static readonly RIGHT_PANEL_WIDTH = 180;
  public static readonly RIGHT_PANEL_X_MARGIN = 10;
  public static readonly RIGHT_PANEL_CONTENT_WIDTH = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH -
                                                     2 * QuantumWaveInterferenceConstants.RIGHT_PANEL_X_MARGIN;

  // Shared eraser button dimensions for the bottom-right screen controls. The background is shorter than it is wide
  // by design, while the icon remains full size so the eraser glyph stays visually consistent.
  public static readonly ERASER_BUTTON_ICON_WIDTH = 22.7;
  public static readonly ERASER_BUTTON_MIN_WIDTH = 41.4;
  public static readonly ERASER_BUTTON_MIN_HEIGHT = 28.98;

  // Fixed spacing for the High Intensity and Single Particles lower detector-screen controls.
  public static readonly WAVE_DISPLAY_AND_TIME_CONTROLS_SPACING = 24;
  public static readonly WAVE_DISPLAY_AND_TIME_CONTROLS_BOTTOM_OFFSET = 30;

  // Shared vertical placement for the source-type scene button group.
  public static readonly SCENE_BUTTON_GROUP_CENTER_Y = 470;

  // Shared top edge for the source control panels on screens that visually align with the Experiment screen.
  public static readonly SOURCE_CONTROL_PANEL_TOP = 178;

  /**
   * Returns the wavelength range (in nanometers) for the given source type.
   * Photons use the full visible-light range [380, 780] nm. All other particle types
   * return [0, 0] because their de Broglie wavelength is computed from momentum rather
   * than being a user-controlled input, so no wavelength picker is shown for them.
   */
  public static createWavelengthRangeNM( sourceType: SourceType ): Range {
    const range = WAVELENGTH_RANGE_NM_BY_SOURCE_TYPE[ sourceType ];
    return new Range( range[ 0 ], range[ 1 ] );
  }

  /**
   * Creates the photon wavelength slider range. This is narrower than the instrumented wavelength Property range so
   * PhET-iO can represent wavelengths just outside the visible slider while the UI stays on the authored color scale.
   *
   * @returns photon wavelength slider range in nanometers
   */
  public static createPhotonWavelengthControlRangeNM(): Range {
    return new Range(
      QuantumWaveInterferenceConstants.PHOTON_WAVELENGTH_CONTROL_MIN_NM,
      QuantumWaveInterferenceConstants.PHOTON_WAVELENGTH_CONTROL_MAX_NM
    );
  }

  /**
   * Returns the number of decimal places needed to faithfully display both endpoints of a numeric range.
   * Used by number controls and labels to choose a consistent decimal-place count so neither endpoint
   * appears rounded.
   *
   * @param min - lower bound of the range (same units as max)
   * @param max - upper bound of the range (same units as min)
   * @returns decimal places required to represent the more precise endpoint
   */
  public static getRangeDecimalPlaces( min: number, max: number ): number {
    return Math.max( numberOfDecimalPlaces( min ), numberOfDecimalPlaces( max ) );
  }

  /**
   * Chooses a compact number of decimal places for values whose largest display value is known.
   *
   * @param maxValue - largest value expected in the displayed range
   * @returns decimal places that keep labels compact while preserving small-range readability
   */
  public static getCompactDecimalPlacesForMaxValue( maxValue: number ): number {
    return maxValue >= 10 ? 0 :
           maxValue >= 1 ? 1 :
           2;
  }
}
