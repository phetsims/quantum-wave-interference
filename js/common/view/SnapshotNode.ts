// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog.
 * It shows a miniature rendering of the detector screen state at the time the snapshot was taken, along with a title,
 * key physics parameters (source type, wavelength/speed, slit separation, slit configuration), and a delete button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import { type PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import type { Snapshot } from '../model/Snapshot.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import createCanonicalExperimentDetailsListItems from './description/createCanonicalExperimentDetailsListItems.js';
import SnapshotCanvasNode from './SnapshotCanvasNode.js';
import SnapshotMetadataProperties, { type SnapshotMetadataPropertiesOptions } from './SnapshotMetadataProperties.js';

const SNAPSHOT_WIDTH = 360;
const SNAPSHOT_HEIGHT = 132;
const CORNER_RADIUS = 0;
const METADATA_WIDTH = 165;

const PARAM_FONT = new PhetFont( 12 );
const TITLE_FONT = new PhetFont( { size: 16, weight: 'bold' } );

/**
 * Options for SnapshotNode. Extends SnapshotMetadataPropertiesOptions with the snapshot collection source,
 * deletion callback, and optional PDOM description and coordinate/zoom hooks.
 */
export type SnapshotNodeOptions = SnapshotMetadataPropertiesOptions & {

  // The ordered list of all snapshots in the owning scene. This node observes it to derive the snapshot at its slot.
  snapshotsProperty: TReadOnlyProperty<Snapshot[]>;

  // Called when the user presses the trash button; should remove the given snapshot from snapshotsProperty.
  deleteSnapshot: ( snapshot: Snapshot ) => void;

  // When provided, the full PDOM structure (section, heading, description paragraph, metadata list) is created.
  getDescription?: ( snapshot: Snapshot ) => string;

  // The front-facing High Intensity and Single Particles detector screens store hit.x as the detector-screen
  // vertical coordinate and hit.y as the horizontal coordinate. Other screens use the conventional x/y mapping.
  useFrontFacingHitCoordinates?: boolean;

  // Optional Experiment detector zoom. When supplied, all snapshots are cropped to the centered visible detector span.
  detectorScreenScaleIndexProperty?: TReadOnlyProperty<number>;
  getVisibleScreenHalfWidth?: () => number;
} &

  // Tandem for this snapshot slot. The node itself and its trash button are instrumented under it.
  PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SnapshotNode extends Node {
  private readonly detectorSnapshotSlot: Node;

  /**
   * @param index - zero-based slot in the snapshotsProperty array that this node represents; the node is visible
   *   only when a snapshot exists at this position
   * @param options
   */
  public constructor( index: number, options: SnapshotNodeOptions ) {

    const snapshotProperty: TReadOnlyProperty<Snapshot | null> = new DerivedProperty(
      [ options.snapshotsProperty ],
      snapshots => ( index < snapshots.length ? snapshots[ index ] : null )
    );

    const {
      headingProperty,
      isSlitGeometryRelevantProperty,
      wavelengthOrSpeedProperty,
      wavelengthOrSpeedAccessibleProperty,
      slitSeparationProperty,
      slitSeparationAccessibleProperty,
      screenDistanceProperty,
      screenDistanceAccessibleProperty,
      slitSettingProperty,
      screenBrightnessProperty,
      screenBrightnessAccessibleProperty,
      trashButtonAccessibleNameProperty,
      slitSettingListItemProperty
    } = new SnapshotMetadataProperties( snapshotProperty, options );

    const background = new Rectangle(
      0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT,
      CORNER_RADIUS, CORNER_RADIUS,
      {
        fill: 'black',
        stroke: QuantumWaveInterferenceColors.snapshotStrokeProperty,
        lineWidth: 1
      }
    );

    const canvasNode = new SnapshotCanvasNode(
      snapshotProperty,
      SNAPSHOT_WIDTH,
      SNAPSHOT_HEIGHT,
      options.useFrontFacingHitCoordinates || false,
      options.getVisibleScreenHalfWidth
    );
    canvasNode.clipArea = background.shape!;
    snapshotProperty.link( () => canvasNode.invalidatePaint() );
    options.detectorScreenScaleIndexProperty?.link( () => canvasNode.invalidatePaint() );

    const titleText = new Text( headingProperty, {
      font: TITLE_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    const wavelengthOrSpeedText = new Text( wavelengthOrSpeedProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );
    const slitSepText = new Text( slitSeparationProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH,
      visibleProperty: isSlitGeometryRelevantProperty
    } );
    const slitSettingText = new Text( slitSettingProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    const screenBrightnessText = new Text( screenBrightnessProperty, {
      font: PARAM_FONT,
      fill: 'black',
      maxWidth: METADATA_WIDTH
    } );

    // Conditionally include screen distance row on screens that expose barrier-screen distance.
    const screenDistanceText = screenDistanceProperty ?
                               new Text( screenDistanceProperty, {
                                 font: PARAM_FONT,
                                 fill: 'black',
                                 maxWidth: METADATA_WIDTH,
                                 visibleProperty: isSlitGeometryRelevantProperty
                               } ) :
                               null;

    const parameterLabelsChildren: Node[] = createCanonicalExperimentDetailsListItems( {
      sourcePhysicsItems: [ wavelengthOrSpeedText ],
      slitConfigurationItem: slitSettingText,
      slitSeparationItem: slitSepText,
      screenDistanceItem: screenDistanceText || undefined,
      screenBrightnessItem: screenBrightnessText
    } );

    const parameterLabels = new VBox( {
      spacing: 2,
      align: 'left',
      children: parameterLabelsChildren
    } );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          options.deleteSnapshot( snapshot );
        }
      },
      soundPlayer: sharedSoundPlayers.get( 'erase' ),
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      accessibleName: trashButtonAccessibleNameProperty,
      iconOptions: {
        scale: 0.6
      },
      touchAreaXDilation: 8,
      touchAreaYDilation: 8,
      tandem: options.tandem.createTandem( 'trashButton' ),
      phetioFeatured: true
    } );

    const metadataContent = new VBox( {
      spacing: 6,
      align: 'left',
      children: [ titleText, parameterLabels ]
    } );

    const metadataColumn = new Node( {
      children: [
        new Rectangle( 0, 0, METADATA_WIDTH, SNAPSHOT_HEIGHT, {
          fill: 'rgba( 0, 0, 0, 0 )',
          stroke: null,
          pickable: false
        } ),
        metadataContent
      ]
    } );
    metadataContent.left = 0;
    metadataContent.top = 0;

    const detectorSnapshotSlot = new Node( {
      children: [
        new Rectangle( 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, {
          fill: 'rgba( 0, 0, 0, 0 )',
          stroke: null,
          pickable: false
        } ),
        background,
        canvasNode
      ]
    } );

    metadataColumn.left = SNAPSHOT_WIDTH + 10;
    metadataColumn.top = 0;

    const contentBox = new Node( {
      children: [ detectorSnapshotSlot, metadataColumn ]
    } );
    trashButton.left = SNAPSHOT_WIDTH + 10;
    trashButton.bottom = SNAPSHOT_HEIGHT;

    const nodeChildren: Node[] = [ contentBox, trashButton ];

    // Build PDOM structure when a description provider is supplied.
    if ( options.getDescription ) {
      const getDescription = options.getDescription;

      const descriptionProperty = DerivedProperty.deriveAny( [
          snapshotProperty,
          ...( options.detectorScreenScaleIndexProperty ? [ options.detectorScreenScaleIndexProperty ] : [] ),
          ...QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.getDependentProperties() ],
        () => snapshotProperty.value ? getDescription( snapshotProperty.value ) : '' );
      const descriptionNode = new Node( {
        accessibleParagraph: descriptionProperty
      } );

      const screenDistanceListItem = screenDistanceAccessibleProperty ?
                                     new Node( {
                                       tagName: 'li',
                                       innerContent: screenDistanceAccessibleProperty,
                                       visibleProperty: isSlitGeometryRelevantProperty
                                     } ) :
                                     null;

      const metadataListChildren: Node[] = createCanonicalExperimentDetailsListItems( {
        sourcePhysicsItems: [ new Node( { tagName: 'li', innerContent: wavelengthOrSpeedAccessibleProperty } ) ],
        slitConfigurationItem: new Node( { tagName: 'li', innerContent: slitSettingListItemProperty } ),
        slitSeparationItem: new Node( {
          tagName: 'li',
          innerContent: slitSeparationAccessibleProperty,
          visibleProperty: isSlitGeometryRelevantProperty
        } ),
        screenDistanceItem: screenDistanceListItem || undefined,
        screenBrightnessItem: new Node( { tagName: 'li', innerContent: screenBrightnessAccessibleProperty } )
      } );

      const metadataListNode = new Node( {
        tagName: 'ul',
        children: metadataListChildren
      } );

      nodeChildren.push( descriptionNode, metadataListNode );
    }

    const superOptions: Record<string, unknown> = {
      isDisposable: false,
      children: nodeChildren,
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null ),
      tandem: options.tandem,
      phetioDocumentation: 'Displays the snapshot at one slot in the snapshots dialog. The number in the tandem name ' +
                           'matches the snapshot number displayed in the user interface.'
    };

    if ( options.getDescription ) {
      superOptions.tagName = 'div';
      superOptions.containerTagName = 'section';
      superOptions.accessibleHeading = headingProperty;
    }

    super( superOptions );
    this.detectorSnapshotSlot = detectorSnapshotSlot;

    if ( options.getDescription ) {
      const descriptionNode = nodeChildren[ 2 ];
      const metadataListNode = nodeChildren[ 3 ];
      this.pdomOrder = [ descriptionNode, metadataListNode, trashButton ];
    }
  }

  /**
   * Adds controls or indicators over the detector snapshot area.
   *
   * @param child - overlay node to add inside the detector snapshot slot
   * @param includeInPDOM - whether the overlay should appear after snapshot details in screen-reader order
   */
  public addSnapshotOverlayChild( child: Node, includeInPDOM = false ): void {
    this.detectorSnapshotSlot.addChild( child );
    if ( includeInPDOM && this.pdomOrder && this.pdomOrder.length > 0 ) {
      const lastPDOMNode = this.pdomOrder[ this.pdomOrder.length - 1 ];
      this.pdomOrder = [
        ...this.pdomOrder.slice( 0, -1 ),
        child,
        lastPDOMNode
      ];
    }
  }
}
