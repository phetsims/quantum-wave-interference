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
  // 'analytical' uses closed-form Fraunhofer diffraction expressions.
  // 'lattice' uses a finite-difference time-domain (FDTD) approach.
  waveModel: {
    type: 'string' as const,
    defaultValue: 'analytical',
    public: true,
    isValidValue: ( value: string | null ) => value === 'analytical' || value === 'lattice' || value === 'gpu'
  }
} );

logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
phet.log && phet.log( `QuantumWaveInterferenceQueryParameters: ${JSON.stringify( QuantumWaveInterferenceQueryParameters, null, 2 )}` );

export default QuantumWaveInterferenceQueryParameters;
