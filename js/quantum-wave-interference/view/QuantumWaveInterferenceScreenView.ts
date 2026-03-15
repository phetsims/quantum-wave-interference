// Copyright 2026, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceModel from '../model/QuantumWaveInterferenceModel.js';
import SceneRadioButtonGroup from './SceneRadioButtonGroup.js';

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceScreenViewOptions = SelfOptions & ScreenViewOptions;

export default class QuantumWaveInterferenceScreenView extends ScreenView {

  public constructor( model: QuantumWaveInterferenceModel, providedOptions: QuantumWaveInterferenceScreenViewOptions ) {

    const options = optionize<QuantumWaveInterferenceScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    // Scene radio buttons - 2x2 grid at the bottom-left
    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      options.tandem.createTandem( 'sceneRadioButtonGroup' )
    );
    sceneRadioButtonGroup.left = this.layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    sceneRadioButtonGroup.bottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    this.addChild( sceneRadioButtonGroup );

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );
  }

  /**
   * Resets the view.
   */
  public reset(): void {
    // no-op
  }

  /**
   * Steps the view.
   * @param dt - time step, in seconds
   */
  public override step( dt: number ): void {
    // no-op
  }
}

quantumWaveInterference.register( 'QuantumWaveInterferenceScreenView', QuantumWaveInterferenceScreenView );