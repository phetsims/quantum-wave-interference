// Copyright 2026, University of Colorado Boulder

/**
 * Main entry point for the sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import ExperimentScreen from './experiment/ExperimentScreen.js';
import HighIntensityScreen from './high-intensity/HighIntensityScreen.js';
import QuantumWaveInterferenceFluent from './QuantumWaveInterferenceFluent.js';
import SingleParticlesScreen from './single-particles/SingleParticlesScreen.js';

// Launch the sim. Beware that scenery Image nodes created outside simLauncher.launch() will have zero bounds
// until the images are fully loaded. See https://github.com/phetsims/coulombs-law/issues/70#issuecomment-429037461
simLauncher.launch( () => {

  const titleStringProperty = QuantumWaveInterferenceFluent[ 'quantum-wave-interference' ].titleStringProperty;

  const screens = [
    new ExperimentScreen( { tandem: Tandem.ROOT.createTandem( 'experimentScreen' ) } ),
    new HighIntensityScreen( { tandem: Tandem.ROOT.createTandem( 'highIntensityScreen' ) } ),
    new SingleParticlesScreen( { tandem: Tandem.ROOT.createTandem( 'singleParticlesScreen' ) } )
  ];

  const options: SimOptions = {

    credits: {
      leadDesign: 'Amy Rouinfar',
      softwareDevelopment: 'Sam Reid',
      team: 'Wendy Adams, Diana López Tavares, Ariel Paul, Kathy Perkins',
      qualityAssurance: '',
      graphicArts: '',
      thanks: ''
    }
  };

  const sim = new Sim( titleStringProperty, screens, options );
  sim.start();
} );