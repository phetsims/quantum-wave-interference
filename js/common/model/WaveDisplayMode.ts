// Copyright 2026, University of Colorado Boulder

/**
 * WaveDisplayMode enumerates how the wave is rendered in the wave visualization region.
 *
 * For photons: 'timeAveragedIntensity' or 'electricField'
 * For matter particles (electrons, neutrons, helium atoms): 'magnitude', 'realPart', or 'imaginaryPart'
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const PhotonWaveDisplayModeValues = [ 'timeAveragedIntensity', 'electricField' ] as const;
export type PhotonWaveDisplayMode = typeof PhotonWaveDisplayModeValues[number];

export const MatterWaveDisplayModeValues = [ 'magnitude', 'realPart', 'imaginaryPart' ] as const;
export type MatterWaveDisplayMode = typeof MatterWaveDisplayModeValues[number];

export type WaveDisplayMode = PhotonWaveDisplayMode | MatterWaveDisplayMode;

/**
 * Extracts a scalar displayed value from complex amplitude (re, im) based on the active wave display mode.
 *
 * @param re - real component of the wave amplitude
 * @param im - imaginary component of the wave amplitude
 * @param displayMode - selected representation for the displayed scalar value
 */
export function getDisplayedWaveValue( re: number, im: number, displayMode: WaveDisplayMode ): number {
  return displayMode === 'timeAveragedIntensity' ? re * re + im * im :
         displayMode === 'electricField' ? re :
         displayMode === 'magnitude' ? Math.sqrt( re * re + im * im ) :
         displayMode === 'realPart' ? re :
         displayMode === 'imaginaryPart' ? im :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}
