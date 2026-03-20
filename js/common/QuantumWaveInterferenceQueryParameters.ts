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
  },

  // Sets the initial wavelength (nm) for the photon scene (e.g., ?wavelength=500).
  // Useful for testing wavelength-dependent rendering (beam color, hit dot color, intensity bands).
  wavelength: {
    type: 'string',
    defaultValue: null
  },

  // Sets the initial slit separation (mm) for the active scene (e.g., ?slitSeparation=0.5).
  slitSeparation: {
    type: 'string',
    defaultValue: null
  },

  // Sets the initial screen distance (m) for the active scene (e.g., ?screenDistance=0.6).
  screenDistance: {
    type: 'string',
    defaultValue: null
  },

  // Sets the initial intensity (0–1) for the active scene (e.g., ?intensity=0.8).
  intensity: {
    type: 'string',
    defaultValue: null
  },

  // Sets the initial slit setting. Values: 'bothOpen', 'leftCovered', 'rightCovered',
  // 'leftDetector', 'rightDetector'
  slitSetting: {
    type: 'string',
    defaultValue: null,
    validValues: [ null, 'bothOpen', 'leftCovered', 'rightCovered', 'leftDetector', 'rightDetector' ]
  }
} );

quantumWaveInterference.register( 'QuantumWaveInterferenceQueryParameters', QuantumWaveInterferenceQueryParameters );

// Log query parameters
logGlobal( 'phet.chipper.queryParameters' );
logGlobal( 'phet.preloads.phetio.queryParameters' );
phet.log && phet.log( `QuantumWaveInterferenceQueryParameters: ${JSON.stringify( QuantumWaveInterferenceQueryParameters, null, 2 )}` );

export default QuantumWaveInterferenceQueryParameters;
