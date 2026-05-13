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

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27
//REVIEW   WebStorm identifies WaveDisplayModeValues as unused.
//REVIEW   Should WaveDisplayMode = typeof WaveDisplayModeValues[number] ?
export const WaveDisplayModeValues = [ ...PhotonWaveDisplayModeValues, ...MatterWaveDisplayModeValues ] as const;
export type WaveDisplayMode = PhotonWaveDisplayMode | MatterWaveDisplayMode;
