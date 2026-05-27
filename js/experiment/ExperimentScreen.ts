// Copyright 2026, University of Colorado Boulder

/**
 * The single screen for the Quantum Wave Interference simulation.
 * Sets up the ExperimentModel and ExperimentScreenView with the appropriate tandem structure.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Image from '../../../scenery/js/nodes/Image.js';
import experimentScreenIcon_svg from '../../images/experimentScreenIcon_svg.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceKeyboardHelpContent from '../common/view/QuantumWaveInterferenceKeyboardHelpContent.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import ExperimentModel from './model/ExperimentModel.js';
import ExperimentScreenView from './view/ExperimentScreenView.js';

type SelfOptions = EmptySelfOptions;

type ExperimentScreenOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class ExperimentScreen extends Screen<ExperimentModel, ExperimentScreenView> {

  public constructor( providedOptions: ExperimentScreenOptions ) {

    const options = optionize<ExperimentScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.experiment.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( experimentScreenIcon_svg ), {
        size: MINIMUM_HOME_SCREEN_ICON_SIZE,
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      createKeyboardHelpNode: () => new QuantumWaveInterferenceKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new ExperimentModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new ExperimentScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
