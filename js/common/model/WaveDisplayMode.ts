// Copyright 2026, University of Colorado Boulder

/**
 * WaveDisplayMode enumerates how the wave is rendered in the wave visualization region.
 *
 * For photons: 'amplitude' or 'electricField'
 * For matter particles (electrons, neutrons, helium atoms): 'amplitude', 'realPart', or 'imaginaryPart'
 *
 * For all source types, 'amplitude' displays the complex magnitude sqrt( re^2 + im^2 ).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const PhotonWaveDisplayModeValues = [ 'amplitude', 'electricField' ] as const;
export type PhotonWaveDisplayMode = typeof PhotonWaveDisplayModeValues[number];

export const MatterWaveDisplayModeValues = [ 'amplitude', 'realPart', 'imaginaryPart' ] as const;
export type MatterWaveDisplayMode = typeof MatterWaveDisplayModeValues[number];

export type WaveDisplayMode = PhotonWaveDisplayMode | MatterWaveDisplayMode;

// All wave display modes across both source types, with the shared 'amplitude' mode listed once.
export const WaveDisplayModeValues: readonly WaveDisplayMode[] = _.uniq( [ ...PhotonWaveDisplayModeValues, ...MatterWaveDisplayModeValues ] );

/**
 * Extracts a scalar displayed value from complex amplitude (re, im) based on the active wave display mode.
 *
 * @param re - real component of the wave amplitude
 * @param im - imaginary component of the wave amplitude
 * @param displayMode - selected representation for the displayed scalar value
 */
export function getDisplayedWaveValue( re: number, im: number, displayMode: WaveDisplayMode ): number {
  return displayMode === 'amplitude' ? Math.sqrt( re * re + im * im ) :
         displayMode === 'electricField' ? re :
         displayMode === 'realPart' ? re :
         displayMode === 'imaginaryPart' ? im :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}
