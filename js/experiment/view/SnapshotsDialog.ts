// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotsDialog displays detector screen snapshots in a vertical list.
 * Adapts the pattern from models-of-the-hydrogen-atom SpectrometerSnapshotsDialog:
 * pre-allocates a fixed number of SnapshotNode instances and toggles their visibility based on how many snapshots
 * exist.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Dialog from '../../../../sun/js/Dialog.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import SceneModel from '../model/SceneModel.js';
import SnapshotNode from './SnapshotNode.js';

export default class SnapshotsDialog extends Dialog {

  public constructor( sceneModel: SceneModel, tandem: Tandem ) {
    let suppressNextCloseSound = false;
    const markSuppressNextCloseSound = () => {
      suppressNextCloseSound = true;
    };

    // Pre-allocate snapshot nodes for the maximum number of snapshots
    const snapshotNodes: SnapshotNode[] = [];
    for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
      snapshotNodes.push( new SnapshotNode( sceneModel, i, markSuppressNextCloseSound ) );
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

    // Close the dialog when all snapshots are deleted
    sceneModel.snapshotsProperty.link( snapshots => {
      if ( snapshots.length === 0 && this.isShowingProperty.value ) {
        this.hide();
      }
    } );
  }
}
