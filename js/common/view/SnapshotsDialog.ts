// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotsDialog displays detector screen snapshots in a vertical list.
 * Adapts the pattern from models-of-the-hydrogen-atom SpectrometerSnapshotsDialog: pre-allocates a fixed number of
 * SnapshotNode instances and toggles their visibility based on how many snapshots exist.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Dialog from '../../../../sun/js/Dialog.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import type { Snapshot } from '../model/Snapshot.js';
import SnapshotNode from './SnapshotNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const SNAPSHOT_ZOOM_BUTTON_MARGIN = 6;

type SnapshotsDialogOptions = {
  // TODO: Document every option, see https://github.com/phetsims/quantum-wave-interference/issues/100
  slitSettingDisplayMap?: Partial<Record<SlitConfigurationWithNoBarrier, TReadOnlyProperty<string>>>;
  formatSlitSeparation?: ( slitSepMM: number ) => string;
  showScreenDistance?: boolean;
  getDescription?: ( snapshot: Snapshot ) => string;
  useFrontFacingHitCoordinates?: boolean;
  detectorScreenScaleIndexProperty?: NumberProperty;
  getVisibleScreenHalfWidth?: () => number;
  createScaleIndicatorNode?: () => Node;
};

export default class SnapshotsDialog extends Dialog {

  // TODO: Document every parameter in JSDoc, see https://github.com/phetsims/quantum-wave-interference/issues/100
  public constructor(
    snapshotsProperty: TReadOnlyProperty<Snapshot[]>,
    deleteSnapshot: ( snapshot: Snapshot ) => void,
    tandem: Tandem,
    providedOptions?: SnapshotsDialogOptions
  ) {
    let suppressNextCloseSound = false;
    const detectorScreenScaleIndexProperty = providedOptions?.detectorScreenScaleIndexProperty;

    const snapshotNodes: SnapshotNode[] = [];
    for ( let i = 0; i < QuantumWaveInterferenceConstants.MAX_SNAPSHOTS; i++ ) {
      snapshotNodes.push( new SnapshotNode( i, {
        snapshotsProperty: snapshotsProperty,
        deleteSnapshot: deleteSnapshot,
        slitSettingDisplayMap: providedOptions?.slitSettingDisplayMap,
        formatSlitSeparation: providedOptions?.formatSlitSeparation,
        showScreenDistance: providedOptions?.showScreenDistance,
        getDescription: providedOptions?.getDescription,
        useFrontFacingHitCoordinates: providedOptions?.useFrontFacingHitCoordinates,
        detectorScreenScaleIndexProperty: detectorScreenScaleIndexProperty,
        getVisibleScreenHalfWidth: providedOptions?.getVisibleScreenHalfWidth
      } ) );
    }

    const contentChildren = [ ...snapshotNodes ];

    // TODO: Document if statement, see https://github.com/phetsims/quantum-wave-interference/issues/100
    if ( detectorScreenScaleIndexProperty && providedOptions?.createScaleIndicatorNode ) {
      const zoomLevelResponseProperty = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponse.createProperty( {
        level: new DerivedProperty(
          [ detectorScreenScaleIndexProperty ],
          detectorScreenScaleIndex => detectorScreenScaleIndex + 1
        ),
        max: detectorScreenScaleIndexProperty.range.max + 1
      } );

      const zoomButtonGroup = new PlusMinusZoomButtonGroup( detectorScreenScaleIndexProperty, {
        orientation: 'horizontal',
        spacing: 0,
        iconOptions: {
          scale: 1.2
        },
        touchAreaXDilation: 5,
        touchAreaYDilation: 5,
        left: SNAPSHOT_ZOOM_BUTTON_MARGIN,
        top: SNAPSHOT_ZOOM_BUTTON_MARGIN,
        zoomInButtonOptions: {
          accessibleName: QuantumWaveInterferenceFluent.a11y.zoomInButton.accessibleNameStringProperty,
          accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreen.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty,
          accessibleContextResponse: zoomLevelResponseProperty
        },
        zoomOutButtonOptions: {
          accessibleName: QuantumWaveInterferenceFluent.a11y.zoomOutButton.accessibleNameStringProperty,
          accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreen.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty,
          accessibleContextResponse: zoomLevelResponseProperty
        },
        tandem: tandem.createTandem( 'zoomButtonGroup' )
      } );
      snapshotNodes[ 0 ].addSnapshotOverlayChild( zoomButtonGroup, true );
      snapshotNodes[ 0 ].addSnapshotOverlayChild( providedOptions.createScaleIndicatorNode() );
    }

    const content = new VBox( {
      spacing: 10,
      align: 'center',
      children: contentChildren
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
