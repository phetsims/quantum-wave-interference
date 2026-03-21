// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenNode is the front-facing view of the detector screen. It displays either individual hit dots
 * (in Hits mode) or an intensity glow pattern (in Average Intensity mode) on a black rounded rectangle.
 * Hit rendering uses CanvasNode for efficient drawing of potentially thousands of dots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import cameraSolidShape from '../../../../sherpa/js/fontawesome-5/cameraSolidShape.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import getDetectorScreenTexture from './getDetectorScreenTexture.js';
import SnapshotsDialog from './SnapshotsDialog.js';

// Dimensions of the front-facing detector screen display, sourced from shared layout constants.
const SCREEN_WIDTH = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_HEIGHT;
const SCREEN_CORNER_RADIUS = 10;

type SelfOptions = EmptySelfOptions;

type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {

  private readonly screenCanvasNode: DetectorScreenCanvasNode;

  private readonly eraserButton: EraserButton;
  private readonly snapshotButtonGroup: VBox;

  public constructor( sceneModel: SceneModel, providedOptions: DetectorScreenNodeOptions ) {

    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Black rounded rectangle background representing the detector screen
    const backgroundRect = new Rectangle( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CORNER_RADIUS, SCREEN_CORNER_RADIUS, {
      fill: 'black',
      stroke: QuantumWaveInterferenceColors.frontFacingStrokeProperty,
      lineWidth: 1
    } );
    this.addChild( backgroundRect );

    // Canvas node for rendering hits and intensity, clipped to the screen area
    this.screenCanvasNode = new DetectorScreenCanvasNode( sceneModel, SCREEN_WIDTH, SCREEN_HEIGHT );
    this.screenCanvasNode.clipArea = backgroundRect.shape!;
    this.addChild( this.screenCanvasNode );

    // Hit count text - only visible in Hits mode, positioned above the screen on the right side
    // (per design: "Above the screen... on the right, there is a readout displaying the total number
    // of detected hits (only if 'Hits' selected)")
    const hitCountText = new Text( '', {
      font: new PhetFont( 11 ),
      fill: 'black',
      maxWidth: 100
    } );
    this.addChild( hitCountText );

    // Scale indicator: a double-headed span arrow spanning the full width of the detector screen,
    // with tick marks at the endpoints and a centered label showing the physical width.
    // This matches the span indicators used in FrontFacingSlitNode for slit width/separation.
    const SPAN_TICK_LENGTH = 8;
    const SPAN_ARROW_Y = -10; // y position of the span arrow above the screen

    // Scale indicator: a span arrow representing a nice round physical width, with the label
    // to the right. The pixel width is computed from the physical-to-pixel ratio so it is
    // physically accurate. Choose a round scale value per source type.
    const halfWidth = sceneModel.screenHalfWidth;
    const fullPhysicalWidth = halfWidth * 2; // full physical width in meters
    const metersPerPixel = fullPhysicalWidth / SCREEN_WIDTH;

    // Choose a nice round physical scale value that spans roughly 1/4 of the screen width.
    // Find the largest power-of-10 in mm (or μm) that fits within about half the screen.
    const targetPhysicalWidth = fullPhysicalWidth * 0.25; // aim for ~1/4 of screen
    const targetMM = targetPhysicalWidth * 1e3;

    let scalePhysicalWidth: number; // in meters
    let scaleLabelString: string;

    if ( targetMM >= 1 ) {
      // Round down to nearest power of 10 in mm, then pick 1, 2, 5, 10, 20, 50...
      const orderMM = Math.pow( 10, Math.floor( Math.log10( targetMM ) ) );
      const niceValues = [ 1, 2, 5, 10 ];
      let bestMM = orderMM;
      for ( const n of niceValues ) {
        if ( orderMM * n <= targetMM * 1.5 ) {
          bestMM = orderMM * n;
        }
      }
      scalePhysicalWidth = bestMM * 1e-3;
      scaleLabelString = `${toFixed( bestMM, bestMM % 1 === 0 ? 0 : 1 )} mm`;
    }
    else if ( targetMM >= 0.001 ) {
      // Work in μm
      const targetUM = targetPhysicalWidth * 1e6;
      const orderUM = Math.pow( 10, Math.floor( Math.log10( targetUM ) ) );
      const niceValues = [ 1, 2, 5, 10 ];
      let bestUM = orderUM;
      for ( const n of niceValues ) {
        if ( orderUM * n <= targetUM * 1.5 ) {
          bestUM = orderUM * n;
        }
      }
      // If the result is >= 1000 μm, express in mm instead
      if ( bestUM >= 1000 ) {
        scalePhysicalWidth = bestUM * 1e-6;
        scaleLabelString = `${toFixed( bestUM / 1000, bestUM % 1000 === 0 ? 0 : 1 )} mm`;
      }
      else {
        scalePhysicalWidth = bestUM * 1e-6;
        scaleLabelString = `${toFixed( bestUM, bestUM % 1 === 0 ? 0 : 1 )} μm`;
      }
    }
    else {
      scalePhysicalWidth = targetPhysicalWidth;
      scaleLabelString = `${toFixed( targetPhysicalWidth * 1e9, 0 )} nm`;
    }

    const scaleArrowWidth = scalePhysicalWidth / metersPerPixel;

    const scaleArrow = new ArrowNode( 0, SPAN_ARROW_Y, scaleArrowWidth, SPAN_ARROW_Y, {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 1,
      doubleHead: true,
      fill: 'black',
      stroke: null
    } );
    this.addChild( scaleArrow );

    const scaleLeftTick = new Line( 0, SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2,
      0, SPAN_ARROW_Y + SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    this.addChild( scaleLeftTick );

    const scaleRightTick = new Line( scaleArrowWidth, SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2,
      scaleArrowWidth, SPAN_ARROW_Y + SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    this.addChild( scaleRightTick );

    const scaleLabelText = new Text( scaleLabelString, {
      font: new PhetFont( 11 ),
      fill: 'black',
      maxWidth: 100,
      left: scaleArrowWidth + 4,
      centerY: SPAN_ARROW_Y
    } );
    this.addChild( scaleLabelText );

    // Update the hit count text and canvas when hits change
    const updateDisplay = () => {
      if ( sceneModel.detectionModeProperty.value === 'hits' ) {
        hitCountText.string = StringUtils.fillIn( QuantumWaveInterferenceFluent.hitsCountPatternStringProperty.value, {
          count: sceneModel.totalHitsProperty.value
        } );
        hitCountText.right = SCREEN_WIDTH;
        hitCountText.bottom = SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2 - 2;
        hitCountText.visible = true;
      }
      else {
        hitCountText.visible = false;
      }
      this.screenCanvasNode.invalidatePaint();
    };

    sceneModel.hitsChangedEmitter.addListener( updateDisplay );
    sceneModel.detectionModeProperty.link( () => updateDisplay() );
    sceneModel.screenBrightnessProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.intensityProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // The intensity pattern is derived from accumulated hits (which trigger hitsChangedEmitter),
    // but wavelength changes affect hit dot color for photons.
    sceneModel.wavelengthProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // Eraser button to clear the screen
    this.eraserButton = new EraserButton( {
      iconWidth: 18,
      listener: () => sceneModel.clearScreen(),
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      tandem: providedOptions.tandem.createTandem( 'eraserButton' )
    } );

    // Snapshot dialog (one per scene)
    const snapshotsDialog = new SnapshotsDialog(
      sceneModel,
      providedOptions.tandem.createTandem( 'snapshotsDialog' )
    );

    // Camera button to take a snapshot
    const snapshotButton = new RectangularPushButton( {
      listener: () => sceneModel.takeSnapshot(),
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      content: new Path( cameraSolidShape, {
        fill: 'black',
        scale: 0.04
      } ),
      enabledProperty: new DerivedProperty( [ sceneModel.numberOfSnapshotsProperty ],
        numberOfSnapshots => numberOfSnapshots < SceneModel.MAX_SNAPSHOTS, {
          tandem: providedOptions.tandem.createTandem( 'snapshotButtonEnabledProperty' ),
          phetioValueType: BooleanIO
        } ),
      tandem: providedOptions.tandem.createTandem( 'snapshotButton' )
    } );

    // Eye button to view snapshots
    const viewSnapshotsButton = new RectangularPushButton( {
      listener: () => snapshotsDialog.show(),
      baseColor: QuantumWaveInterferenceColors.screenButtonBaseColorProperty,
      content: new Path( eyeSolidShape, {
        fill: 'black',
        scale: 0.04
      } ),
      enabledProperty: new DerivedProperty( [ sceneModel.numberOfSnapshotsProperty ],
        numberOfSnapshots => numberOfSnapshots > 0, {
          tandem: providedOptions.tandem.createTandem( 'viewSnapshotsButtonEnabledProperty' ),
          phetioValueType: BooleanIO
        } ),
      tandem: providedOptions.tandem.createTandem( 'viewSnapshotsButton' )
    } );

    // Snapshot indicator circles (4 small circles that fill as snapshots are taken)
    const DOT_RADIUS = 3;
    const indicatorDots: Circle[] = [];
    for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
      indicatorDots.push( new Circle( DOT_RADIUS, {
        stroke: QuantumWaveInterferenceColors.indicatorDotStrokeProperty,
        lineWidth: 0.5,
        fill: QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty
      } ) );
    }

    const indicatorDotsBox = new HBox( {
      spacing: 3,
      children: indicatorDots
    } );

    // Update indicator dot fills when snapshots change
    sceneModel.numberOfSnapshotsProperty.link( count => {
      for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
        indicatorDots[ i ].fill = i < count ? QuantumWaveInterferenceColors.indicatorDotActiveFillProperty : QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty;
      }
    } );

    // Close the snapshots dialog when this DetectorScreenNode becomes invisible (i.e., when the
    // user switches to a different scene). Without this, the dialog would remain open showing
    // stale snapshot data from the previous scene, which is confusing.
    this.visibleProperty.lazyLink( visible => {
      if ( !visible && snapshotsDialog.isShowingProperty.value ) {
        snapshotsDialog.hide();
      }
    } );

    // Snapshot buttons and indicator dots, bottom-aligned to the right of the screen
    this.snapshotButtonGroup = new VBox( {
      spacing: 4,
      align: 'center',
      children: [
        indicatorDotsBox,
        snapshotButton,
        viewSnapshotsButton
      ]
    } );

    // Right-align both button groups so they share a right edge, with INTERNAL_PADDING
    // between the screen rect's right edge and the nearest button's left edge.
    const buttonsRight = SCREEN_WIDTH + QuantumWaveInterferenceConstants.INTERNAL_PADDING +
                         Math.max( this.eraserButton.width, this.snapshotButtonGroup.width );
    this.eraserButton.right = buttonsRight;
    this.eraserButton.top = 0;
    this.addChild( this.eraserButton );

    this.snapshotButtonGroup.right = buttonsRight;
    this.snapshotButtonGroup.bottom = SCREEN_HEIGHT;
    this.addChild( this.snapshotButtonGroup );
  }
}

/**
 * Inner CanvasNode that renders hit dots or intensity bands on the detector screen.
 */
class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneModel: SceneModel;
  private readonly textureWidth: number;
  private readonly textureHeight: number;

  public constructor( sceneModel: SceneModel, width: number, height: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneModel = sceneModel;
    this.textureWidth = width;
    this.textureHeight = height;
  }

  /**
   * Renders the shared detector-screen texture.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const texture = getDetectorScreenTexture( this.sceneModel );
    context.drawImage( texture, 0, 0, this.textureWidth, this.textureHeight );
  }
}
