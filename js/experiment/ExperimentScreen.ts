// Copyright 2026, University of Colorado Boulder

/**
 * The single screen for the Quantum Wave Interference simulation.
 * Sets up the ExperimentModel and ExperimentScreenView with the appropriate tandem structure.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import { createExperimentScreenIcon } from '../common/view/createScreenIcons.js';
import QWIKeyboardHelpContent from '../common/view/QWIKeyboardHelpContent.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import ExperimentModel from './model/ExperimentModel.js';
import ExperimentScreenView from './view/ExperimentScreenView.js';

type SelfOptions = EmptySelfOptions;

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Narrow this interface to omit the ScreenOptions that this class controls.
type ExperimentScreenOptions = SelfOptions & ScreenOptions;

export default class ExperimentScreen extends Screen<ExperimentModel, ExperimentScreenView> {

  public constructor( providedOptions: ExperimentScreenOptions ) {

    const options = optionize<ExperimentScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.experiment.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: createExperimentScreenIcon(),
      createKeyboardHelpNode: () => new QWIKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new ExperimentModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new ExperimentScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
