// Copyright 2026, University of Colorado Boulder

/**
 * ViewSnapshotsButton is the eye button used to open the snapshots dialog showing previously captured detector screen
 * patterns. It is disabled when no snapshots have been taken. Opening the dialog pauses the sim;
 * closing it resumes playback if the sim was playing when the dialog was opened.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import SnapshotsDialog from './SnapshotsDialog.js';

const EYE_BUTTON_X_MARGIN = 4;

export default class ViewSnapshotsButton extends RectangularPushButton {

  public constructor(
    sceneModel: SceneModel,
    isPlayingProperty: Property<boolean>,
    snapshotsDialog: SnapshotsDialog,
    minWidth: number,
    minHeight: number,
    tandem: Tandem
  ) {

    // If the sim was playing when the snapshots dialog opened, resume when it closes.
    let shouldResumeOnDialogClose = false;
    snapshotsDialog.isShowingProperty.link( isShowing => {
      if ( !isShowing && shouldResumeOnDialogClose ) {
        isPlayingProperty.value = true;
        shouldResumeOnDialogClose = false;
      }
    } );

    super( {
      isDisposable: false,
      listener: () => {
        if ( !snapshotsDialog.isShowingProperty.value ) {
          shouldResumeOnDialogClose = isPlayingProperty.value;
          isPlayingProperty.value = false;
        }
        snapshotsDialog.show();
      },
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      xMargin: EYE_BUTTON_X_MARGIN,
      content: new Path( eyeSolidShape, {
        fill: 'black',
        scale: 0.04
      } ),
      minWidth: minWidth,
      minHeight: minHeight,
      enabledProperty: new DerivedProperty(
        [ sceneModel.numberOfSnapshotsProperty ],
        numberOfSnapshots => numberOfSnapshots > 0,
        {
          tandem: tandem.createTandem( 'enabledProperty' ),
          phetioValueType: BooleanIO
        }
      ),
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.viewSnapshots.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.viewSnapshots.accessibleHelpTextStringProperty,
      soundPlayer: nullSoundPlayer,
      tandem: tandem
    } );
  }
}
