// Copyright 2026, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';

const QuantumWaveInterferenceQueryParameters = QueryStringMachine.getAll( {

  // Internal performance tuning knob for the analytical wave visualization grid. For example,
  // ?waveSolverGridSize=100 reduces the default 200x200 solver grid to 100x100.
  waveSolverGridSize: {
    type: 'number',
    defaultValue: 200,
    isValidValue: value => Number.isInteger( value ) && value > 0 && value <= 1000
  },

  // Internal performance tuning knob for the shared detector screen texture. The default 2 preserves
  // the current supersampled rendering. For example, ?detectorScreenTextureScale=1 renders 1/4 as
  // many texture pixels, and ?detectorScreenTextureScale=0.5 renders 1/16 as many.
  detectorScreenTextureScale: {
    type: 'number',
    defaultValue: 2,
    isValidValue: value => value > 0 && value <= 4
  }
} );

export default QuantumWaveInterferenceQueryParameters;
