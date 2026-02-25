// Copyright 2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import QuantumWaveInterferenceScreen from './quantum-wave-interference/QuantumWaveInterferenceScreen.js';
import QuantumWaveInterferenceFluent from './QuantumWaveInterferenceFluent.js';
import './common/QuantumWaveInterferenceQueryParameters.js';

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch( () => {

  const titleStringProperty = QuantumWaveInterferenceFluent[ 'quantum-wave-interference' ].titleStringProperty;

  const screens = [
    new QuantumWaveInterferenceScreen( { tandem: Tandem.ROOT.createTandem( 'quantumWaveInterferenceScreen' ) } )
  ];

  const options: SimOptions = {

    //TODO fill in credits, all of these fields are optional, see joist.CreditsNode, see https://github.com/phetsims/quantum-wave-interference/issues/3
    credits: {
      leadDesign: '',
      softwareDevelopment: '',
      team: '',
      contributors: '',
      qualityAssurance: '',
      graphicArts: '',
      soundDesign: '',
      thanks: ''
    }
  };

  const sim = new Sim( titleStringProperty, screens, options );
  sim.start();
} );