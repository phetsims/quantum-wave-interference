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
import Utils from '../../../../dot/js/Utils.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import cameraSolidShape from '../../../../sherpa/js/fontawesome-5/cameraSolidShape.js';
import eyeSolidShape from '../../../../sherpa/js/fontawesome-5/eyeSolidShape.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import DetectionMode from '../model/DetectionMode.js';
import SceneModel from '../model/SceneModel.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import SourceType from '../model/SourceType.js';

// Dimensions of the front-facing detector screen display
const SCREEN_WIDTH = 217;
const SCREEN_HEIGHT = 250;
const SCREEN_CORNER_RADIUS = 10;

// Hit dot radius in view coordinates
const HIT_DOT_RADIUS = 1.5;

// Number of horizontal bins for the intensity display
const INTENSITY_BINS = 200;

type SelfOptions = EmptySelfOptions;

type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {

  private readonly screenCanvasNode: DetectorScreenCanvasNode;

  public constructor( sceneModel: SceneModel, providedOptions: DetectorScreenNodeOptions ) {

    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Black rounded rectangle background representing the detector screen
    const backgroundRect = new Rectangle( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, SCREEN_CORNER_RADIUS, SCREEN_CORNER_RADIUS, {
      fill: 'black',
      stroke: '#333',
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

    const scaleArrow = new ArrowNode( 0, SPAN_ARROW_Y, SCREEN_WIDTH, SPAN_ARROW_Y, {
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

    const scaleRightTick = new Line( SCREEN_WIDTH, SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2,
      SCREEN_WIDTH, SPAN_ARROW_Y + SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    this.addChild( scaleRightTick );

    const scaleLabelText = new Text( '', {
      font: new PhetFont( 11 ),
      fill: 'black',
      maxWidth: 100
    } );
    this.addChild( scaleLabelText );

    // Compute the scale label based on the screen half-width (constant per source type)
    const halfWidth = sceneModel.screenHalfWidth;
    const fullWidth = halfWidth * 2;

    if ( fullWidth >= 0.01 ) {
      scaleLabelText.string = `${toFixed( fullWidth * 100, 1 )} cm`;
    }
    else if ( fullWidth >= 1e-4 ) {
      scaleLabelText.string = `${toFixed( fullWidth * 1e3, 2 )} mm`;
    }
    else {
      scaleLabelText.string = `${toFixed( fullWidth * 1e6, 1 )} μm`;
    }
    // Position scale label on the left side above the screen (per design: scale on left, hit count on right)
    scaleLabelText.left = 0;
    scaleLabelText.bottom = SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2 - 2;

    // Update the hit count text and canvas when hits change
    const updateDisplay = () => {
      if ( sceneModel.detectionModeProperty.value === DetectionMode.HITS ) {
        hitCountText.string = `${sceneModel.totalHitsProperty.value} hits`;
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

    // In Average Intensity mode, the pattern is computed from the theoretical interference formula
    // and must update whenever properties that affect the formula change. These properties don't
    // fire hitsChangedEmitter, so we need explicit listeners.
    sceneModel.isEmittingProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.wavelengthProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.velocityProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // Eraser button to clear the screen - positioned to the right of the screen, top-aligned
    const eraserButton = new EraserButton( {
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
      baseColor: '#E8E8E8',
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
      baseColor: '#E8E8E8',
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
        stroke: '#888',
        lineWidth: 0.5,
        fill: 'white'
      } ) );
    }

    const indicatorDotsBox = new HBox( {
      spacing: 3,
      children: indicatorDots
    } );

    // Update indicator dot fills when snapshots change
    sceneModel.numberOfSnapshotsProperty.link( count => {
      for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
        indicatorDots[ i ].fill = i < count ? '#555' : 'white';
      }
    } );

    // Position eraser button top-aligned to the right of the screen
    eraserButton.left = SCREEN_WIDTH + 6;
    eraserButton.top = 0;
    this.addChild( eraserButton );

    // Snapshot buttons and indicator dots, bottom-aligned to the right of the screen
    const buttonGroup = new VBox( {
      spacing: 4,
      align: 'center',
      children: [
        indicatorDotsBox,
        snapshotButton,
        viewSnapshotsButton
      ],
      left: SCREEN_WIDTH + 6,
      bottom: SCREEN_HEIGHT
    } );
    this.addChild( buttonGroup );
  }
}

/**
 * Inner CanvasNode that renders hit dots or intensity bands on the detector screen.
 */
class DetectorScreenCanvasNode extends CanvasNode {

  private readonly sceneModel: SceneModel;

  public constructor( sceneModel: SceneModel, width: number, height: number ) {
    super( {
      canvasBounds: new Bounds2( 0, 0, width, height )
    } );

    this.sceneModel = sceneModel;
  }

  /**
   * Renders either hit dots or intensity bands depending on the detection mode.
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    const sceneModel = this.sceneModel;
    const brightness = sceneModel.screenBrightnessProperty.value;

    if ( sceneModel.detectionModeProperty.value === DetectionMode.HITS ) {
      this.paintHits( context, brightness );
    }
    else {
      this.paintIntensity( context, brightness );
    }
  }

  /**
   * Renders individual hit dots on the canvas.
   */
  private paintHits( context: CanvasRenderingContext2D, brightness: number ): void {
    const hits = this.sceneModel.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;

    // Determine the hit dot color based on source type
    const hitColor = this.getHitColor( brightness );
    context.fillStyle = hitColor;

    for ( let i = 0; i < hits.length; i++ ) {
      const hit = hits[ i ];

      // Map normalized coordinates [-1, 1] to view coordinates
      const viewX = ( hit.x + 1 ) / 2 * width;
      const viewY = ( hit.y + 1 ) / 2 * height;

      context.beginPath();
      context.arc( viewX, viewY, HIT_DOT_RADIUS, 0, Math.PI * 2 );
      context.fill();
    }
  }

  /**
   * Renders the average intensity pattern as vertical glowing bands.
   */
  private paintIntensity( context: CanvasRenderingContext2D, brightness: number ): void {
    if ( !this.sceneModel.isEmittingProperty.value && this.sceneModel.hits.length === 0 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;
    const binWidth = width / INTENSITY_BINS;

    for ( let i = 0; i < INTENSITY_BINS; i++ ) {
      // Map bin center to normalized x position [-1, 1]
      const normalizedX = ( ( i + 0.5 ) / INTENSITY_BINS ) * 2 - 1;

      // Convert to physical position on screen
      const physicalX = normalizedX * this.sceneModel.screenHalfWidth;

      // Get the theoretical intensity at this position
      const intensity = this.sceneModel.getIntensityAtPosition( physicalX );

      // Apply brightness control
      const alpha = intensity * brightness;

      if ( alpha > 0.01 ) {
        const color = this.getIntensityColor( alpha );
        context.fillStyle = color;
        context.fillRect( i * binWidth, 0, binWidth + 0.5, height );
      }
    }
  }

  /**
   * Returns the CSS color string for a hit dot based on the source type and brightness.
   */
  private getHitColor( brightness: number ): string {
    const sourceType = this.sceneModel.sourceType;

    if ( sourceType === SourceType.PHOTONS ) {
      // Use wavelength-based color for photons
      const wavelength = this.sceneModel.wavelengthProperty.value;
      const rgb = wavelengthToRGB( wavelength );
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${brightness})`;
    }
    else {
      // White dots for particles
      return `rgba(255,255,255,${brightness})`;
    }
  }

  /**
   * Returns the CSS color string for an intensity band based on the source type and alpha.
   */
  private getIntensityColor( alpha: number ): string {
    const sourceType = this.sceneModel.sourceType;

    if ( sourceType === SourceType.PHOTONS ) {
      const wavelength = this.sceneModel.wavelengthProperty.value;
      const rgb = wavelengthToRGB( wavelength );
      return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
    }
    else {
      // White glow for particles
      return `rgba(255,255,255,${alpha})`;
    }
  }
}

/**
 * Converts a visible light wavelength (380-780 nm) to an RGB color.
 * Based on Dan Bruton's algorithm.
 */
function wavelengthToRGB( wavelength: number ): { r: number; g: number; b: number } {
  let r = 0;
  let g = 0;
  let b = 0;

  if ( wavelength >= 380 && wavelength < 440 ) {
    r = -( wavelength - 440 ) / ( 440 - 380 );
    g = 0;
    b = 1;
  }
  else if ( wavelength >= 440 && wavelength < 490 ) {
    r = 0;
    g = ( wavelength - 440 ) / ( 490 - 440 );
    b = 1;
  }
  else if ( wavelength >= 490 && wavelength < 510 ) {
    r = 0;
    g = 1;
    b = -( wavelength - 510 ) / ( 510 - 490 );
  }
  else if ( wavelength >= 510 && wavelength < 580 ) {
    r = ( wavelength - 510 ) / ( 580 - 510 );
    g = 1;
    b = 0;
  }
  else if ( wavelength >= 580 && wavelength < 645 ) {
    r = 1;
    g = -( wavelength - 645 ) / ( 645 - 580 );
    b = 0;
  }
  else if ( wavelength >= 645 && wavelength <= 780 ) {
    r = 1;
    g = 0;
    b = 0;
  }

  // Intensity factor for edges of visible spectrum
  let factor = 1;
  if ( wavelength >= 380 && wavelength < 420 ) {
    factor = 0.3 + 0.7 * ( wavelength - 380 ) / ( 420 - 380 );
  }
  else if ( wavelength >= 700 && wavelength <= 780 ) {
    factor = 0.3 + 0.7 * ( 780 - wavelength ) / ( 780 - 700 );
  }

  return {
    r: Utils.roundSymmetric( 255 * r * factor ),
    g: Utils.roundSymmetric( 255 * g * factor ),
    b: Utils.roundSymmetric( 255 * b * factor )
  };
}

quantumWaveInterference.register( 'DetectorScreenNode', DetectorScreenNode );
