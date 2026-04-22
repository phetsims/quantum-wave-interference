// Copyright 2026, University of Colorado Boulder

/**
 * Shared brightness/alpha utility functions and constants used by both the live detector screen
 * (getDetectorScreenTexture.ts) and the snapshot dialog (SnapshotNode.ts) to render hit dots and intensity bands with
 * consistent visual appearance.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import { linear } from '../../../../dot/js/util/linear.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type SourceType } from '../model/SourceType.js';

// Below this intensity threshold, a band is considered perceptually invisible and is skipped during rendering.
export const PERCEPTUAL_VISIBILITY_THRESHOLD = 0.004;

// Base hit-dot radii in CSS pixels (before any supersampling). Shared between the live detector screen texture
// (getDetectorScreenTexture.ts, which applies a SUPERSAMPLE multiplier) and the snapshot dialog (SnapshotNode.ts).
export const BASE_HIT_CORE_RADIUS = 2.0;
export const BASE_HIT_GLOW_RADIUS = 3.4;

// Brightness multiplier range for intensity (Average Intensity) display mode.
// The slider maps from a dim baseline (1.2x) up to a bright maximum (6.0x).
export const INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 1.2;
export const INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 6.0;
export const INTENSITY_BRIGHTNESS_MAX_MULTIPLIER = 0.8;

// Brightness multiplier range for hits display mode.
export const HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER = 0.1;
export const HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER = 1.8;

// Hit dot core/glow alpha parameters.
export const HITS_CORE_ALPHA_MIN = 0.2;
export const HITS_CORE_ALPHA_MIDPOINT_MAX = 1;
export const HITS_GLOW_ALPHA_MAX = 0.15;
export const HITS_GLOW_START_FRACTION = 0.5;

/**
 * Maps the intensity-mode brightness slider (0–1) to a screen brightness multiplier.
 */
export const getIntensityScreenBrightnessMultiplier = ( sliderBrightness: number ): number => {
  const clampedBrightness = clamp( sliderBrightness, 0, 1 );
  return linear(
    0,
    1,
    INTENSITY_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    INTENSITY_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

/**
 * Maps the hits-mode brightness slider to a display gain multiplier.
 */
export const getHitsDisplayGain = ( brightness: number, sliderMax: number = QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX ): number => {
  const clampedBrightness = clamp( brightness, 0, sliderMax );
  return linear(
    0,
    sliderMax,
    HITS_SCREEN_BRIGHTNESS_MIN_MULTIPLIER,
    HITS_SCREEN_BRIGHTNESS_MAX_MULTIPLIER,
    clampedBrightness
  );
};

/**
 * Converts a raw brightness value to a 0–1 fraction of the maximum brightness.
 */
export const getHitsBrightnessFraction = ( brightness: number ): number => {
  return clamp( brightness / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX, 0, 1 );
};

/**
 * Returns the core alpha for a hit dot at the given brightness fraction.
 * The core alpha ramps from HITS_CORE_ALPHA_MIN to HITS_CORE_ALPHA_MIDPOINT_MAX over the first half of the brightness
 * range, then stays at maximum.
 */
export const getHitsCoreAlpha = ( brightnessFraction: number ): number => {
  const clampedFraction = clamp( brightnessFraction, 0, 1 );
  if ( clampedFraction <= HITS_GLOW_START_FRACTION ) {
    return linear(
      0,
      HITS_GLOW_START_FRACTION,
      HITS_CORE_ALPHA_MIN,
      HITS_CORE_ALPHA_MIDPOINT_MAX,
      clampedFraction
    );
  }
  return HITS_CORE_ALPHA_MIDPOINT_MAX;
};

/**
 * Returns the glow alpha for a hit dot at the given brightness fraction. Glow is zero until the brightness exceeds
 * HITS_GLOW_START_FRACTION, then ramps up.
 */
export const getHitsGlowAlpha = ( brightnessFraction: number ): number => {
  const clampedFraction = clamp( brightnessFraction, 0, 1 );
  if ( clampedFraction <= HITS_GLOW_START_FRACTION ) {
    return 0;
  }
  return linear( HITS_GLOW_START_FRACTION, 1, 0, HITS_GLOW_ALPHA_MAX, clampedFraction );
};

/**
 * Computes the overall intensity display gain from brightness slider and current intensity.
 */
export const getIntensityDisplayGain = ( brightness: number, intensity: number ): number => {
  return (
    getIntensityScreenBrightnessMultiplier( brightness ) *
    clamp( intensity, 0, 1 ) *
    INTENSITY_BRIGHTNESS_MAX_MULTIPLIER
  );
};

/**
 * Returns the RGB color for a scene's particles (wavelength-dependent for photons, white for matter).
 */
export const getSceneRGB = ( sourceType: SourceType, wavelength: number ): { r: number; g: number; b: number } => {
  if ( sourceType === 'photons' ) {
    const color = VisibleColor.wavelengthToColor( wavelength );
    return { r: color.red, g: color.green, b: color.blue };
  }
  else {
    return { r: 255, g: 255, b: 255 };
  }
};

/**
 * Returns the shared neutral background RGB used by the wave region and detector screen.
 */
export const getWaveAndDetectorBackgroundRGB = (): { r: number; g: number; b: number } => {
  const color = QuantumWaveInterferenceColors.waveAndDetectorBackgroundColorProperty.value;
  return { r: color.red, g: color.green, b: color.blue };
};

/**
 * Interpolates between two RGB colors and returns an rgb(...) fill style string.
 * Values below the perceptual threshold are skipped so callers can let the background show through.
 */
export const getInterpolatedRGBFillStyle = (
  startRGB: { r: number; g: number; b: number },
  endRGB: { r: number; g: number; b: number },
  fraction: number
): string | null => {
  if ( fraction < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
    return null;
  }

  const clampedFraction = clamp( fraction, 0, 1 );
  const r = clamp( roundSymmetric( linear( 0, 1, startRGB.r, endRGB.r, clampedFraction ) ), 0, 255 );
  const g = clamp( roundSymmetric( linear( 0, 1, startRGB.g, endRGB.g, clampedFraction ) ), 0, 255 );
  const b = clamp( roundSymmetric( linear( 0, 1, startRGB.b, endRGB.b, clampedFraction ) ), 0, 255 );
  return `rgb(${r},${g},${b})`;
};
