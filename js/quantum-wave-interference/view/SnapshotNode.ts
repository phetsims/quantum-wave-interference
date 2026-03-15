// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotNode displays a single snapshot in the SnapshotsDialog. It shows a miniature rendering of the
 * detector screen state at the time the snapshot was taken, along with a title and delete button.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import TrashButton from '../../../../scenery-phet/js/buttons/TrashButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import DetectionMode from '../model/DetectionMode.js';
import SceneModel from '../model/SceneModel.js';
import Snapshot from '../model/Snapshot.js';
import SourceType from '../model/SourceType.js';

// Snapshot display dimensions (scaled down from the full detector screen)
const SNAPSHOT_WIDTH = 180;
const SNAPSHOT_HEIGHT = 120;
const CORNER_RADIUS = 6;
const HIT_DOT_RADIUS = 1;
const INTENSITY_BINS = 150;

export default class SnapshotNode extends Node {

  public constructor( sceneModel: SceneModel, index: number ) {

    const snapshotProperty: TReadOnlyProperty<Snapshot | null> = new DerivedProperty(
      [ sceneModel.snapshotsProperty ],
      snapshots => ( index < snapshots.length ) ? snapshots[ index ] : null
    );

    // Background rectangle
    const background = new Rectangle( 0, 0, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT, CORNER_RADIUS, CORNER_RADIUS, {
      fill: 'black',
      stroke: '#555',
      lineWidth: 1
    } );

    // Canvas node for rendering the snapshot content
    const canvasNode = new SnapshotCanvasNode( snapshotProperty, SNAPSHOT_WIDTH, SNAPSHOT_HEIGHT );
    canvasNode.clipArea = background.shape!;

    // Title text showing "Snapshot N"
    const titleText = new Text( '', {
      font: new PhetFont( 12 ),
      fill: 'white',
      maxWidth: SNAPSHOT_WIDTH - 12
    } );

    snapshotProperty.link( snapshot => {
      if ( snapshot ) {
        titleText.string = QuantumWaveInterferenceFluent.snapshotNumberPatternStringProperty.value
          .replace( '{{number}}', `${snapshot.snapshotNumber}` );
      }
      titleText.left = 6;
      titleText.top = 4;
      canvasNode.invalidatePaint();
    } );

    const trashButton = new TrashButton( {
      listener: () => {
        const snapshot = snapshotProperty.value;
        if ( snapshot ) {
          sceneModel.deleteSnapshot( snapshot );
        }
      },
      iconOptions: {
        scale: 0.6
      },
      touchAreaXDilation: 8,
      touchAreaYDilation: 8
    } );

    const contentBox = new HBox( {
      spacing: 8,
      align: 'center',
      children: [
        new Node( { children: [ background, canvasNode, titleText ] } ),
        trashButton
      ]
    } );

    super( {
      children: [ contentBox ],
      visibleProperty: new DerivedProperty( [ snapshotProperty ], snapshot => snapshot !== null )
    } );
  }
}

/**
 * Canvas node that renders the snapshot content (hits or intensity).
 */
class SnapshotCanvasNode extends CanvasNode {

  private readonly snapshotProperty: TReadOnlyProperty<Snapshot | null>;

  public constructor( snapshotProperty: TReadOnlyProperty<Snapshot | null>, width: number, height: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );
    this.snapshotProperty = snapshotProperty;
  }

  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const snapshot = this.snapshotProperty.value;
    if ( !snapshot ) {
      return;
    }

    if ( snapshot.detectionMode === DetectionMode.HITS ) {
      this.paintHits( context, snapshot );
    }
    else {
      this.paintIntensity( context, snapshot );
    }
  }

  private paintHits( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const hits = snapshot.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SNAPSHOT_WIDTH;
    const height = SNAPSHOT_HEIGHT;

    // Hit color based on source type
    if ( snapshot.sourceType === SourceType.PHOTONS ) {
      const rgb = VisibleColor.wavelengthToColor( snapshot.wavelength );
      context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${snapshot.brightness})`;
    }
    else {
      context.fillStyle = `rgba(255,255,255,${snapshot.brightness})`;
    }

    for ( let i = 0; i < hits.length; i++ ) {
      const hit = hits[ i ];
      const viewX = ( hit.x + 1 ) / 2 * width;
      const viewY = ( hit.y + 1 ) / 2 * height;
      context.beginPath();
      context.arc( viewX, viewY, HIT_DOT_RADIUS, 0, Math.PI * 2 );
      context.fill();
    }
  }

  private paintIntensity( context: CanvasRenderingContext2D, snapshot: Snapshot ): void {
    const width = SNAPSHOT_WIDTH;
    const height = SNAPSHOT_HEIGHT;
    const binWidth = width / INTENSITY_BINS;

    for ( let i = 0; i < INTENSITY_BINS; i++ ) {
      const normalizedX = ( ( i + 0.5 ) / INTENSITY_BINS ) * 2 - 1;
      const intensity = snapshot.getIntensityAtPosition( normalizedX );
      const alpha = intensity * snapshot.brightness;

      if ( alpha > 0.01 ) {
        if ( snapshot.sourceType === SourceType.PHOTONS ) {
          const rgb = VisibleColor.wavelengthToColor( snapshot.wavelength );
          context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
        }
        else {
          context.fillStyle = `rgba(255,255,255,${Utils.clamp( alpha, 0, 1 )})`;
        }
        context.fillRect( i * binWidth, 0, binWidth + 0.5, height );
      }
    }
  }
}

quantumWaveInterference.register( 'SnapshotNode', SnapshotNode );
