// Copyright 2026, University of Colorado Boulder

/**
 * BarrierType enumerates the barrier options available in the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const BarrierTypeValues = [ 'none', 'doubleSlit' ] as const;

export type BarrierType = typeof BarrierTypeValues[number];
