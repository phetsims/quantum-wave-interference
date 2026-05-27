// Copyright 2026, University of Colorado Boulder

/**
 * Small numerical helpers shared by analytical wave kernel modules.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';

export const EPSILON = 1e-12;
export const NEAR_APERTURE_X_FRACTION = 1e-4;

export function smoothStep( edge0: number, edge1: number, x: number ): number {
  if ( x <= edge0 ) {
    return 0;
  }
  if ( x >= edge1 ) {
    return 1;
  }
  const u = ( x - edge0 ) / ( edge1 - edge0 );
  return u * u * ( 3 - 2 * u );
}

// Boundary helper for code paths that must return a public Complex object.
export function createPolarComplex( magnitude: number, phase: number ): Complex {
  return new Complex( magnitude * Math.cos( phase ), magnitude * Math.sin( phase ) );
}

// Boundary helper for code paths that must return a public Complex object.
export function createPolarTimesComplex( magnitude: number, phase: number, value: Complex ): Complex {
  const polarReal = magnitude * Math.cos( phase );
  const polarImaginary = magnitude * Math.sin( phase );
  return new Complex(
    polarReal * value.real - polarImaginary * value.imaginary,
    polarReal * value.imaginary + polarImaginary * value.real
  );
}
