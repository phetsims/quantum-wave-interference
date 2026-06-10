// Copyright 2026, University of Colorado Boulder

/**
 * WaveDisplayMode enumerates how the wave is rendered in the wave visualization region.
 *
 * For photons: 'amplitude' or 'electricField'
 * For matter particles (electrons, neutrons, helium atoms): 'amplitude', 'realPart', or 'imaginaryPart'
 *
 * Note that 'amplitude' renders differently for the two particle families: photons show the
 * time-averaged intensity (re^2 + im^2) while matter waves show the wave function magnitude
 * sqrt( re^2 + im^2 ), so consumers that map values must also know the particle family.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// For photons, 'amplitude' displays the time-averaged intensity, re^2 + im^2.
export const PhotonWaveDisplayModeValues = [ 'amplitude', 'electricField' ] as const;
export type PhotonWaveDisplayMode = typeof PhotonWaveDisplayModeValues[number];

// For matter waves, 'amplitude' displays the wave function magnitude, sqrt( re^2 + im^2 ).
export const MatterWaveDisplayModeValues = [ 'amplitude', 'realPart', 'imaginaryPart' ] as const;
export type MatterWaveDisplayMode = typeof MatterWaveDisplayModeValues[number];

// In the combined union, 'amplitude' is a single value with two meanings (see above), so consumers
// that map 'amplitude' to a number must also know the particle family.
export type WaveDisplayMode = PhotonWaveDisplayMode | MatterWaveDisplayMode;

/**
 * Extracts a scalar displayed value from complex amplitude (re, im) based on the active wave display mode.
 *
 * @param re - real component of the wave amplitude
 * @param im - imaginary component of the wave amplitude
 * @param displayMode - selected representation for the displayed scalar value
 * @param isPhoton - whether the wave is a photon wave; the 'amplitude' mode shows time-averaged
 *                   intensity for photons but wave function magnitude for matter waves
 */
export function getDisplayedWaveValue( re: number, im: number, displayMode: WaveDisplayMode, isPhoton: boolean ): number {
  return displayMode === 'amplitude' ? ( isPhoton ? re * re + im * im : Math.sqrt( re * re + im * im ) ) :
         displayMode === 'electricField' ? re :
         displayMode === 'realPart' ? re :
         displayMode === 'imaginaryPart' ? im :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}

/**
 * Returns the maximum displayed scalar value supported by the model for a given wave display mode.
 *
 * The solvers use normalized wave fields:
 * - electricField, realPart, imaginaryPart are bounded by [-1, 1]
 * - amplitude is bounded by [0, 1]
 *
 * @param displayMode - selected representation for the displayed scalar value
 */
export function getMaxDisplayedWaveValue( displayMode: WaveDisplayMode ): number {
  return displayMode === 'electricField' ? 1 :
         displayMode === 'amplitude' ? 1 :
         displayMode === 'realPart' ? 1 :
         displayMode === 'imaginaryPart' ? 1 :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}
