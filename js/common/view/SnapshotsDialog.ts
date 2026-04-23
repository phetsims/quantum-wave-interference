// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotsDialog displays detector screen snapshots in a vertical list.
 * Adapts the pattern from models-of-the-hydrogen-atom SpectrometerSnapshotsDialog: pre-allocates a fixed number of
 * SnapshotNode instances and toggles their visibility based on how many snapshots exist.
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
  formatSlitSeparation?: ( slitSepMM: number ) => string;
  showScreenDistance?: boolean;
  getDescription?: ( snapshot: Snapshot ) => string;
  getSnapshotDisplayWidthScale?: ( snapshot: Snapshot ) => number;
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
        slitSettingDisplayMap: providedOptions?.slitSettingDisplayMap,
        formatSlitSeparation: providedOptions?.formatSlitSeparation,
        showScreenDistance: providedOptions?.showScreenDistance,
        getDescription: providedOptions?.getDescription,
        getSnapshotDisplayWidthScale: providedOptions?.getSnapshotDisplayWidthScale
      } ) );
    }

    const content = new VBox( {
      spacing: 10,
      align: 'center',
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
