// Copyright 2026, University of Colorado Boulder

/**
 * Maps the wavelength/speed controls to qualitative wave-peak separation descriptions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../../dot/js/Range.js';
import { clamp } from '../../../../../dot/js/util/clamp.js';
import QuantumWaveInterferenceConstants from '../../QuantumWaveInterferenceConstants.js';
import { type SourceType } from '../../model/SourceType.js';
import { type BandSpacingCategory } from './BandAnalysis.js';

export type WavePeakSpacingCategory = BandSpacingCategory;

const CLOSE_TO_FAR_CATEGORIES: WavePeakSpacingCategory[] = [
  'extremelyCloseTogether',
  'veryCloseTogether',
  'closeTogether',
  'somewhatCloseTogether',
  'farApart',
  'veryFarApart',
  'extremelyFarApart'
];

const FAR_TO_CLOSE_CATEGORIES: WavePeakSpacingCategory[] = [
  'extremelyFarApart',
  'veryFarApart',
  'farApart',
  'somewhatCloseTogether',
  'closeTogether',
  'veryCloseTogether',
  'extremelyCloseTogether'
];

type WavePeakSpacingScene = {
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  particleSpeedProperty: TReadOnlyProperty<number>;
  particleSpeedRange: Range;
};

function getRangeFraction( value: number, min: number, max: number ): number {
  const rangeLength = max - min;
  return rangeLength > 0 ? clamp( ( value - min ) / rangeLength, 0, 1 ) : 0;
}

const getEvenlySpacedCategory = (
  fraction: number,
  categories: WavePeakSpacingCategory[]
): WavePeakSpacingCategory => {
  const categoryIndex = clamp( Math.floor( fraction * categories.length ), 0, categories.length - 1 );
  return categories[ categoryIndex ];
};

/**
 * Gets the qualitative distance category for the separation between adjacent wave peaks. The seven categories are
 * distributed evenly across each source control's own slider range. Photon wavelength maps directly from close to far;
 * particle speed maps from far to close because slower particles have longer de Broglie wavelengths.
 *
 * @param scene - source scene with the wavelength or particle-speed control range
 * @returns qualitative category for adjacent wave-peak distance
 */
export function getWavePeakSpacingCategory( scene: WavePeakSpacingScene ): WavePeakSpacingCategory {
  if ( scene.sourceType === 'photons' ) {
    const wavelengthFraction = getRangeFraction(
      scene.wavelengthProperty.value,
      QuantumWaveInterferenceConstants.PHOTON_WAVELENGTH_CONTROL_MIN_NM,
      QuantumWaveInterferenceConstants.PHOTON_WAVELENGTH_CONTROL_MAX_NM
    );
    return getEvenlySpacedCategory( wavelengthFraction, CLOSE_TO_FAR_CATEGORIES );
  }

  const speedFraction = getRangeFraction(
    scene.particleSpeedProperty.value,
    scene.particleSpeedRange.min,
    scene.particleSpeedRange.max
  );
  return getEvenlySpacedCategory( speedFraction, FAR_TO_CLOSE_CATEGORIES );
}
