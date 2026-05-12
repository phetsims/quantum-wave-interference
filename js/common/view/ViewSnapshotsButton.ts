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
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SnapshotsDialog from './SnapshotsDialog.js';

const EYE_BUTTON_X_MARGIN = 4;

export default class ViewSnapshotsButton extends RectangularPushButton {

  /**
   * @param numberOfSnapshotsProperty - number of snapshots currently available; disables the button at zero
   * @param isPlayingProperty - shared playback state to pause while the dialog is open
   * @param snapshotsDialog - dialog shown by this button
   * @param minWidth - minimum button width, matched to neighboring detector-screen action buttons
   * @param minHeight - minimum button height, matched to neighboring detector-screen action buttons
   * @param tandem - tandem for the button and its instrumented enabledProperty
   */
  public constructor(
    numberOfSnapshotsProperty: TReadOnlyProperty<number>,
    isPlayingProperty: Property<boolean>,
    snapshotsDialog: SnapshotsDialog,
    minWidth: number,
    minHeight: number,
    tandem: Tandem
  ) {

    // Remember whether the sim was playing before this button opened the dialog. If it was, resume when the dialog
    // closes; if it was already paused, leave it paused.
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
        [ numberOfSnapshotsProperty ],
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
