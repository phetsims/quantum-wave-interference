// Copyright 2026, University of Colorado Boulder

/**
 * Defines query parameters that are specific to this simulation.
 * Run with ?log to print query parameters and their values to the browser console at startup.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import logGlobal from '../../../phet-core/js/logGlobal.js';
import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';
import quantumWaveInterference from '../quantumWaveInterference.js';

const QuantumWaveInterferenceQueryParameters = QueryStringMachine.getAll( {
  //TODO add schemas for query parameters
} );

quantumWaveInterference.register( 'QuantumWaveInterferenceQueryParameters', QuantumWaveInterferenceQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.quantumWaveInterference.QuantumWaveInterferenceQueryParameters' );

export default QuantumWaveInterferenceQueryParameters;