// Copyright 2026, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import quantumWaveInterference from '../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceModel from './model/QuantumWaveInterferenceModel.js';
import QuantumWaveInterferenceScreenView from './view/QuantumWaveInterferenceScreenView.js';

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceScreenOptions = SelfOptions & ScreenOptions;

export default class QuantumWaveInterferenceScreen extends Screen<QuantumWaveInterferenceModel, QuantumWaveInterferenceScreenView> {

  public constructor( providedOptions: QuantumWaveInterferenceScreenOptions ) {

    const options = optionize<QuantumWaveInterferenceScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty
    }, providedOptions );

    super(
      () => new QuantumWaveInterferenceModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new QuantumWaveInterferenceScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}

quantumWaveInterference.register( 'QuantumWaveInterferenceScreen', QuantumWaveInterferenceScreen );