// Copyright 2026, University of Colorado Boulder

/**
 * Returns the maximum displayed scalar value supported by the model for a given wave display mode.
 *
 * The solvers use normalized wave fields:
 * - electricField, realPart, imaginaryPart are bounded by [-1, 1]
 * - magnitude is bounded by [0, 1]
 * - timeAveragedIntensity is bounded by [0, 1]
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { type WaveDisplayMode } from './WaveDisplayMode.js';

export default function getMaxDisplayedWaveValue( displayMode: WaveDisplayMode ): number {
  return displayMode === 'electricField' ? 1 :
         displayMode === 'magnitude' ? 1 :
         displayMode === 'realPart' ? 1 :
         displayMode === 'imaginaryPart' ? 1 :
         displayMode === 'timeAveragedIntensity' ? 1 :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}
