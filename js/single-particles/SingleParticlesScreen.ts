// Copyright 2026, University of Colorado Boulder

/**
 * Screen for the "Single Particles" mode of the Quantum Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Screen, { ScreenOptions } from '../../../joist/js/Screen.js';
import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../joist/js/ScreenIcon.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Image from '../../../scenery/js/nodes/Image.js';
import singleParticlesScreenIcon_svg from '../../images/singleParticlesScreenIcon_svg.js';
import QuantumWaveInterferenceColors from '../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceKeyboardHelpContent from '../common/view/QuantumWaveInterferenceKeyboardHelpContent.js';
import QuantumWaveInterferenceFluent from '../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from './model/SingleParticlesModel.js';
import SingleParticlesScreenView from './view/SingleParticlesScreenView.js';

// No screen-specific options; this alias exists to follow the standard optionize pattern.
type SelfOptions = EmptySelfOptions;

// tandem is required so the screen and its model/view subtrees are properly instrumented for PhET-iO.
type SingleParticlesScreenOptions = SelfOptions & PickRequired<ScreenOptions, 'tandem'>;

export default class SingleParticlesScreen extends Screen<SingleParticlesModel, SingleParticlesScreenView> {

  public constructor( providedOptions: SingleParticlesScreenOptions ) {

    const options = optionize<SingleParticlesScreenOptions, SelfOptions, ScreenOptions>()( {
      name: QuantumWaveInterferenceFluent.screen.singleParticles.nameStringProperty,
      backgroundColorProperty: QuantumWaveInterferenceColors.screenBackgroundColorProperty,
      homeScreenIcon: new ScreenIcon( new Image( singleParticlesScreenIcon_svg ), {
        size: MINIMUM_HOME_SCREEN_ICON_SIZE,
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      createKeyboardHelpNode: () => new QuantumWaveInterferenceKeyboardHelpContent()
    }, providedOptions );

    super(
      () => new SingleParticlesModel( { tandem: options.tandem.createTandem( 'model' ) } ),
      model => new SingleParticlesScreenView( model, { tandem: options.tandem.createTandem( 'view' ) } ),
      options
    );
  }
}
