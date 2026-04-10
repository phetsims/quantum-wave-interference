// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotButton is the camera button used to capture the current detector screen pattern as a snapshot.
 * It is disabled once the maximum number of snapshots has been reached, plays a capture sound,
 * and invokes a caller-supplied callback when a snapshot is successfully taken (used by DetectorScreenNode to trigger
 * the flash overlay effect).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import cameraSolidShape from '../../../../sherpa/js/fontawesome-5/cameraSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import nullSoundPlayer from '../../../../tambo/js/nullSoundPlayer.js';
import SoundClip from '../../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../../tambo/js/soundManager.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import snapshotCaptured_mp3 from '../../../sounds/snapshotCaptured_mp3.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';

const DETECTOR_ACTION_BUTTON_MIN_WIDTH = 36;

const snapshotCapturedSoundClip = new SoundClip( snapshotCaptured_mp3, {
  initialOutputLevel: 0.4
} );
soundManager.addSoundGenerator( snapshotCapturedSoundClip );

export default class SnapshotButton extends RectangularPushButton {

  public constructor( sceneModel: SceneModel, onSnapshotCaptured: () => void, tandem: Tandem ) {

    const accessibleHelpTextProperty = QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.takeSnapshot.accessibleHelpText.createProperty( {
      maxSnapshots: SceneModel.MAX_SNAPSHOTS
    } );
    const accessibleContextResponseProperty = QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.takeSnapshot.accessibleContextResponse.createProperty( {
      snapshotNumber: sceneModel.numberOfSnapshotsProperty
    } );

    super( {
      isDisposable: false,
      listener: () => {
        const numberOfSnapshotsBefore = sceneModel.numberOfSnapshotsProperty.value;
        sceneModel.takeSnapshot();
        if ( sceneModel.numberOfSnapshotsProperty.value > numberOfSnapshotsBefore ) {
          snapshotCapturedSoundClip.play();
          onSnapshotCaptured();
        }
      },
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      content: new Path( cameraSolidShape, {
        fill: 'black',
        scale: 0.04
      } ),
      minWidth: DETECTOR_ACTION_BUTTON_MIN_WIDTH,
      enabledProperty: new DerivedProperty(
        [ sceneModel.numberOfSnapshotsProperty ],
        numberOfSnapshots => numberOfSnapshots < SceneModel.MAX_SNAPSHOTS,
        {
          tandem: tandem.createTandem( 'enabledProperty' ),
          phetioValueType: BooleanIO
        }
      ),
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.takeSnapshot.accessibleNameStringProperty,
      accessibleHelpText: accessibleHelpTextProperty,
      accessibleContextResponse: accessibleContextResponseProperty,
      soundPlayer: nullSoundPlayer,
      tandem: tandem
    } );
  }
}
