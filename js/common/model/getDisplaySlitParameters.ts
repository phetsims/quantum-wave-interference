// Copyright 2026, University of Colorado Boulder

/**
 * Maps physical slit parameters to display-scale equivalents that produce visible interference
 * fringes on the solver grid.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';

const MIN_DISPLAY_D_LAMBDA = 3;
const MAX_DISPLAY_D_LAMBDA = 8;
const LOG_PHYS_RATIO_MIN = Math.log( 50 );
const LOG_PHYS_RATIO_RANGE = Math.log( 1500 ) - LOG_PHYS_RATIO_MIN;

export type DisplaySlitParameters = {
  displaySlitSep: number;
  displaySlitWidth: number;
};

//REVIEW WebStorm identifies this function as unused.
export function getDisplaySlitParameters(
  wavelength: number,
  slitSeparation: number,
  displayLambda: number
): DisplaySlitParameters {
  let displaySlitSep: number;
  if ( wavelength <= 0 || slitSeparation <= 0 ) {
    displaySlitSep = 5 * displayLambda;
  }
  else {
    const physicalRatio = slitSeparation / wavelength;
    const logFraction = ( Math.log( Math.max( physicalRatio, 50 ) ) - LOG_PHYS_RATIO_MIN ) / LOG_PHYS_RATIO_RANGE;
    const displayRatio = MIN_DISPLAY_D_LAMBDA + ( MAX_DISPLAY_D_LAMBDA - MIN_DISPLAY_D_LAMBDA ) * clamp( logFraction, 0, 1 );
    displaySlitSep = displayRatio * displayLambda;
  }
  const displaySlitWidth = Math.max( displaySlitSep / 12, 0.3 * displayLambda );
  return { displaySlitSep: displaySlitSep, displaySlitWidth: displaySlitWidth };
}
