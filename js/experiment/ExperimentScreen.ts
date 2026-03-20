// Copyright 2026, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import ExperimentModel from './model/ExperimentModel.js';
import ExperimentScreenView from './view/ExperimentScreenView.js';

type SelfOptions = EmptySelfOptions;

type ExperimentScreenOptions = SelfOptions & ScreenOptions;

export default class ExperimentScreen extends Screen<ExperimentModel, ExperimentScreenView> {

  public constructor( providedOptions: ExperimentScreenOptions ) {

    const options = optionize<ExperimentScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.experiment.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new ExperimentModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new ExperimentScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
