// Copyright 2026, University of Colorado Boulder

/**
 * Computes an approximation to the inverse standard normal cumulative distribution function.
 *
 * This is Peter J. Acklam's rational approximation, split into lower-tail, central, and upper-tail
 * regions. The input is clamped away from 0 and 1 so the result remains finite for simulation timing.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';

const A = [
  -3.969683028665376e+1,
  2.209460984245205e+2,
  -2.759285104469687e+2,
  1.383577518672690e+2,
  -3.066479806614716e+1,
  2.506628277459239
];

const B = [
  -5.447609879822406e+1,
  1.615858368580409e+2,
  -1.556989798598866e+2,
  6.680131188771972e+1,
  -1.328068155288572e+1
];

const C = [
  -7.784894002430293e-3,
  -3.223964580411365e-1,
  -2.400758277161838,
  -2.549732539343734,
  4.374664141464968,
  2.938163982698783
];

const D = [
  7.784695709041462e-3,
  3.224671290700398e-1,
  2.445134137142996,
  3.754408661907416
];

const LOW_TAIL = 0.02425;
const HIGH_TAIL = 1 - LOW_TAIL;
const MIN_PROBABILITY = 1e-12;
const MAX_PROBABILITY = 1 - MIN_PROBABILITY;

/**
 * Returns the z value where the standard normal cumulative distribution function equals probability.
 * Values outside the open interval (0, 1) are clamped, so this function always returns a finite number.
 */
export default function inverseStandardNormalCDF( probability: number ): number {
  const p = clamp( probability, MIN_PROBABILITY, MAX_PROBABILITY );

  if ( p < LOW_TAIL ) {
    const q = Math.sqrt( -2 * Math.log( p ) );
    return ( ( ( ( ( C[ 0 ] * q + C[ 1 ] ) * q + C[ 2 ] ) * q + C[ 3 ] ) * q + C[ 4 ] ) * q + C[ 5 ] ) /
           ( ( ( ( D[ 0 ] * q + D[ 1 ] ) * q + D[ 2 ] ) * q + D[ 3 ] ) * q + 1 );
  }
  if ( p > HIGH_TAIL ) {
    const q = Math.sqrt( -2 * Math.log( 1 - p ) );
    return -( ( ( ( ( C[ 0 ] * q + C[ 1 ] ) * q + C[ 2 ] ) * q + C[ 3 ] ) * q + C[ 4 ] ) * q + C[ 5 ] ) /
           ( ( ( ( D[ 0 ] * q + D[ 1 ] ) * q + D[ 2 ] ) * q + D[ 3 ] ) * q + 1 );
  }

  const q = p - 0.5;
  const r = q * q;
  return ( ( ( ( ( A[ 0 ] * r + A[ 1 ] ) * r + A[ 2 ] ) * r + A[ 3 ] ) * r + A[ 4 ] ) * r + A[ 5 ] ) * q /
         ( ( ( ( ( B[ 0 ] * r + B[ 1 ] ) * r + B[ 2 ] ) * r + B[ 3 ] ) * r + B[ 4 ] ) * r + 1 );
}
