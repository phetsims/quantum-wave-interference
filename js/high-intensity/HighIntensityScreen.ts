// Copyright 2026, University of Colorado Boulder

/**
 * Screen for the "High Intensity" mode of the Quantum Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import { createHighIntensityScreenIcon } from '../common/view/createScreenIcons.js';
import QuantumWaveInterferenceKeyboardHelpContent from '../common/view/QuantumWaveInterferenceKeyboardHelpContent.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from './model/HighIntensityModel.js';
import HighIntensityScreenView from './view/HighIntensityScreenView.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityScreenOptions = SelfOptions & ScreenOptions;

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Narrow this interface to omit the ScreenOptions that this class controls.
export default class HighIntensityScreen extends Screen<HighIntensityModel, HighIntensityScreenView> {

  public constructor( providedOptions: HighIntensityScreenOptions ) {

    const options = optionize<HighIntensityScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.highIntensity.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: createHighIntensityScreenIcon(),
      createKeyboardHelpNode: () => new QuantumWaveInterferenceKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new HighIntensityModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new HighIntensityScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
