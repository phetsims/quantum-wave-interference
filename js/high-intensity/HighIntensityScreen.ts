// Copyright 2026, University of Colorado Boulder

/**
 * Screen for the "High Intensity" mode of the Quantum Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Image from '../../../scenery/js/nodes/Image.js';
import highIntensityScreenIcon_svg from '../../images/highIntensityScreenIcon_svg.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceKeyboardHelpContent from '../common/view/QuantumWaveInterferenceKeyboardHelpContent.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from './model/HighIntensityModel.js';
import HighIntensityScreenView from './view/HighIntensityScreenView.js';

// No screen-specific options; this alias exists to follow the standard optionize pattern.
type SelfOptions = EmptySelfOptions;

// tandem is required so the screen and its model/view subtrees are properly instrumented for PhET-iO.
type HighIntensityScreenOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class HighIntensityScreen extends Screen<HighIntensityModel, HighIntensityScreenView> {

  public constructor( providedOptions: HighIntensityScreenOptions ) {

    const options = optionize<HighIntensityScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.highIntensity.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( highIntensityScreenIcon_svg ), {
        size: MINIMUM_HOME_SCREEN_ICON_SIZE,
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      createKeyboardHelpNode: () => new QuantumWaveInterferenceKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new HighIntensityModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new HighIntensityScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
