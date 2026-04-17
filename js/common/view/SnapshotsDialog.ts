// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotsDialog displays detector screen snapshots in a vertical list for the High Intensity and
 * Single Particles screens. Adapts the pattern from experiment/view/SnapshotsDialog.ts and
 * models-of-the-hydrogen-atom SpectrometerSnapshotsDialog: pre-allocates a fixed number of SnapshotNode
 * instances and toggles their visibility based on how many snapshots exist.
 *
 * Unlike the Experiment screen's dialog (which binds to a single SceneModel), this dialog is driven
 * by DynamicProperties that follow the currently selected scene, so it automatically updates when
 * the user switches scenes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Dialog from '../../../../sun/js/Dialog.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type SlitConfiguration } from '../model/SlitConfiguration.js';
import Snapshot from '../model/Snapshot.js';
import SnapshotNode from './SnapshotNode.js';

type SnapshotsDialogOptions = {
  slitSettingDisplayMap?: Record<SlitConfiguration, TReadOnlyProperty<string>>;
};

export default class SnapshotsDialog extends Dialog {

  public constructor(
    snapshotsProperty: TReadOnlyProperty<Snapshot[]>,
    deleteSnapshot: ( snapshot: Snapshot ) => void,
    tandem: Tandem,
    providedOptions?: SnapshotsDialogOptions
  ) {
    let suppressNextCloseSound = false;

    const snapshotNodes: SnapshotNode[] = [];
    for ( let i = 0; i < QuantumWaveInterferenceConstants.MAX_SNAPSHOTS; i++ ) {
      snapshotNodes.push( new SnapshotNode( i, {
        snapshotsProperty: snapshotsProperty,
        deleteSnapshot: deleteSnapshot,
        slitSettingDisplayMap: providedOptions?.slitSettingDisplayMap
      } ) );
    }

    const content = new VBox( {
      spacing: 10,
      children: snapshotNodes
    } );

    super( content, {
      isDisposable: false,
      topMargin: 10,
      bottomMargin: 10,
      leftMargin: 10,
      closedSoundPlayer: {
        play: () => {
          if ( suppressNextCloseSound ) {
            suppressNextCloseSound = false;
            return;
          }
          sharedSoundPlayers.get( 'generalClose' ).play();
        },
        stop: () => {
          sharedSoundPlayers.get( 'generalClose' ).stop();
        }
      },
      tandem: tandem
    } );

    snapshotsProperty.link( snapshots => {
      if ( snapshots.length === 0 && this.isShowingProperty.value ) {
        suppressNextCloseSound = true;
        this.hide();
      }
    } );
  }
}
