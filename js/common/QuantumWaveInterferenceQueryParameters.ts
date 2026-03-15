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

  // Selects the initial scene. Values: 'photons', 'electrons', 'neutrons', 'helium'
  scene: {
    type: 'string',
    defaultValue: null,
    validValues: [ null, 'photons', 'electrons', 'neutrons', 'helium' ]
  },

  // Starts the emitter in the "on" state for the initial scene
  emitting: {
    type: 'flag'
  },

  // Starts in Hits detection mode instead of Average Intensity
  hitsMode: {
    type: 'flag'
  },

  // Sets the initial time speed. Values: 'slow', 'normal', 'fast'
  timeSpeed: {
    type: 'string',
    defaultValue: null,
    validValues: [ null, 'slow', 'normal', 'fast' ]
  },

  // Starts with the graph accordion box expanded
  graphExpanded: {
    type: 'flag'
  }
} );

quantumWaveInterference.register( 'QuantumWaveInterferenceQueryParameters', QuantumWaveInterferenceQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
logGlobal( 'phet.quantumWaveInterference.QuantumWaveInterferenceQueryParameters' );

export default QuantumWaveInterferenceQueryParameters;