// Copyright 2026, University of Colorado Boulder

/**
 * Defines query parameters that are specific to the Quantum Wave Interference simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';

const QuantumWaveInterferenceQueryParameters = QueryStringMachine.getAll( {

  // Selects the wave solver back-end for the High Intensity and Single Particles screens.
  // 'default' uses analytical on High Intensity and GPU on Single Particles.
  // 'analytical', 'lattice', or 'gpu' forces that solver on all screens (where available).
  waveModel: {
    type: 'string' as const,
    defaultValue: 'default',
    public: true,
    isValidValue: ( value: string | null ) => value === 'default' || value === 'analytical' || value === 'lattice' || value === 'gpu'
  },

  // Visible lattice size (always square) for the GPU Richardson solver, used when ?waveModel=gpu.
  // The simulation grid is extended slightly beyond this so damping layers live offscreen.
  gpuLatticeSize: {
    type: 'number' as const,
    defaultValue: 256,
    public: false,
    isValidValue: ( value: number ) => Number.isInteger( value ) && value >= 64 && value <= 1024
  }
} );

logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
phet.log && phet.log( `QuantumWaveInterferenceQueryParameters: ${JSON.stringify( QuantumWaveInterferenceQueryParameters, null, 2 )}` );

export default QuantumWaveInterferenceQueryParameters;
