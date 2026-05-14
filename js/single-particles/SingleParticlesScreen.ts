// Copyright 2026, University of Colorado Boulder

/**
 * Screen for the "Single Particles" mode of the Quantum Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceKeyboardHelpContent from '../common/view/QuantumWaveInterferenceKeyboardHelpContent.js';
import { SingleParticlesScreenIcon } from '../common/view/ScreenIcons.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from './model/SingleParticlesModel.js';
import SingleParticlesScreenView from './view/SingleParticlesScreenView.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesScreenOptions = SelfOptions & ScreenOptions;

//TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Narrow this interface to omit the ScreenOptions that this class controls.
export default class SingleParticlesScreen extends Screen<SingleParticlesModel, SingleParticlesScreenView> {

  public constructor( providedOptions: SingleParticlesScreenOptions ) {

    const options = optionize<SingleParticlesScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.singleParticles.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: new SingleParticlesScreenIcon(),
      createKeyboardHelpNode: () => new QuantumWaveInterferenceKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new SingleParticlesModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new SingleParticlesScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
