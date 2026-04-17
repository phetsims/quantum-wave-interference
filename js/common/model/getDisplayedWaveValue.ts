// Copyright 2026, University of Colorado Boulder

/**
 * Extracts a scalar displayed value from complex amplitude (re, im) based on the active wave display mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type WaveDisplayMode } from './WaveDisplayMode.js';

export default function getDisplayedWaveValue( re: number, im: number, displayMode: WaveDisplayMode ): number {
  return displayMode === 'timeAveragedIntensity' ? re * re + im * im :
         displayMode === 'electricField' ? re :
         displayMode === 'magnitude' ? Math.sqrt( re * re + im * im ) :
         displayMode === 'realPart' ? re :
         displayMode === 'imaginaryPart' ? im :
         ( () => { throw new Error( `Unrecognized displayMode: ${displayMode}` ); } )();
}
