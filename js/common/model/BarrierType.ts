// Copyright 2026, University of Colorado Boulder

/**
 * Valid values for StringUnionProperty instances that represent barrier state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
export const BarrierTypeValues = [ 'none', 'doubleSlit' ] as const;

/**
 * Represents whether the model, solver, and view use no barrier or a double-slit barrier.
 */
export type BarrierType = typeof BarrierTypeValues[number];
