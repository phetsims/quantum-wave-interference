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
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

export type RGB = { r: number; g: number; b: number };

// Below this intensity threshold, a band is considered perceptually invisible and is rendered as the background color.
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
export const getSceneRGB = ( sourceType: SourceType, wavelength: number ): RGB => {
  if ( sourceType === 'photons' ) {
    const color = VisibleColor.wavelengthToColor( wavelength );
    return { r: color.red, g: color.green, b: color.blue };
  }
  else {
    return { r: 255, g: 255, b: 255 };
  }
};

/**
 * Returns the detector screen background RGB. Black so that the intensity interpolation
 * goes from black to the wavelength color, matching the wave visualization's color scheme.
 */
export const getWaveAndDetectorBackgroundRGB = (): RGB => {
  return { r: 0, g: 0, b: 0 };
};

/**
 * Samples a detector distribution with linear interpolation between solver-cell centers.
 */
export const sampleIntensityDistribution = ( distribution: ArrayLike<number>, fraction: number ): number => {
  const length = distribution.length;
  if ( length === 0 ) {
    return 0;
  }
  if ( length === 1 ) {
    return distribution[ 0 ];
  }

  const sampleIndex = clamp( fraction, 0, 1 ) * length - 0.5;
  if ( sampleIndex <= 0 ) {
    return distribution[ 0 ];
  }
  if ( sampleIndex >= length - 1 ) {
    return distribution[ length - 1 ];
  }

  const lowerIndex = Math.floor( sampleIndex );
  const upperWeight = sampleIndex - lowerIndex;
  return linear( 0, 1, distribution[ lowerIndex ], distribution[ lowerIndex + 1 ], upperWeight );
};

/**
 * Samples a detector distribution with a small triangular smoothing kernel, where radius is measured in solver bins.
 */
export const sampleSmoothedIntensityDistribution = (
  distribution: ArrayLike<number>,
  fraction: number,
  radius: number
): number => {
  if ( radius <= 0 || distribution.length <= 1 ) {
    return sampleIntensityDistribution( distribution, fraction );
  }

  const length = distribution.length;
  const centerIndex = clamp( fraction, 0, 1 ) * length - 0.5;
  const startIndex = Math.floor( centerIndex - radius );
  const endIndex = Math.ceil( centerIndex + radius );
  let weightedIntensity = 0;
  let totalWeight = 0;

  for ( let i = startIndex; i <= endIndex; i++ ) {
    const distance = Math.abs( i - centerIndex );
    const weight = Math.max( 0, 1 - distance / ( radius + 1 ) );
    if ( weight > 0 ) {
      weightedIntensity += sampleIntensityDistribution( distribution, ( i + 0.5 ) / length ) * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? weightedIntensity / totalWeight : sampleIntensityDistribution( distribution, fraction );
};

/**
 * Interpolates between two RGB colors and returns integer RGB components.
 */
export const getInterpolatedRGB = (
  startRGB: RGB,
  endRGB: RGB,
  fraction: number,
  result?: RGB
): RGB => {
  const outputRGB = result || { r: 0, g: 0, b: 0 };

  if ( fraction < PERCEPTUAL_VISIBILITY_THRESHOLD ) {
    outputRGB.r = startRGB.r;
    outputRGB.g = startRGB.g;
    outputRGB.b = startRGB.b;
    return outputRGB;
  }

  const clampedFraction = clamp( fraction, 0, 1 );
  outputRGB.r = clamp( roundSymmetric( linear( 0, 1, startRGB.r, endRGB.r, clampedFraction ) ), 0, 255 );
  outputRGB.g = clamp( roundSymmetric( linear( 0, 1, startRGB.g, endRGB.g, clampedFraction ) ), 0, 255 );
  outputRGB.b = clamp( roundSymmetric( linear( 0, 1, startRGB.b, endRGB.b, clampedFraction ) ), 0, 255 );
  return outputRGB;
};

/**
 * Interpolates between two RGB colors and returns an rgb(...) fill style string.
 * Values below the perceptual threshold are rendered as the background color.
 */
export const getInterpolatedRGBFillStyle = (
  startRGB: RGB,
  endRGB: RGB,
  fraction: number
): string => {
  const rgb = getInterpolatedRGB( startRGB, endRGB, fraction );
  return `rgb(${rgb.r},${rgb.g},${rgb.b})`;
};
