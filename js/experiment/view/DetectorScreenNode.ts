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
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
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
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import DetectionMode from '../model/DetectionMode.js';
import SceneModel from '../model/SceneModel.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import SourceType from '../model/SourceType.js';

// Dimensions of the front-facing detector screen display, sourced from shared layout constants.
const SCREEN_WIDTH = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_HEIGHT;
const SCREEN_CORNER_RADIUS = 10;

// Hit dot rendering: a bright core with a soft halo to match the design mockup's
// phosphorescent screen look, where each detection event is clearly visible.
const HIT_CORE_RADIUS = 2.5;
const HIT_GLOW_RADIUS = 5;

// Performance: When hit count exceeds this threshold, skip the expensive glow halo pass and
// use fillRect instead of arc for cores. At high counts, overlapping dots already create a
// natural glow effect, so per-dot halos add visual clutter with no pedagogical benefit.
const GLOW_THRESHOLD = 2000;

// Maximum number of dots to render individually. Beyond this, the interference pattern is
// clearly established and additional dots don't aid learning. The model continues accumulating
// hits in intensityBins for correct histogram/overhead rendering.
const MAX_RENDERED_HITS = 20000;

type SelfOptions = EmptySelfOptions;

type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {

  private readonly screenCanvasNode: DetectorScreenCanvasNode;

  // Exposed so ExperimentScreenView can use ManualConstraint to align the right edges of
  // these controls with the layout bounds.
  public readonly eraserButton: EraserButton;
  public readonly snapshotButtonGroup: VBox;

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
      if ( sceneModel.detectionModeProperty.value === DetectionMode.HITS ) {
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

    // Close the snapshots dialog when this DetectorScreenNode becomes invisible (i.e., when the
    // user switches to a different scene). Without this, the dialog would remain open showing
    // stale snapshot data from the previous scene, which is confusing.
    this.visibleProperty.lazyLink( visible => {
      if ( !visible && snapshotsDialog.isShowingProperty.value ) {
        snapshotsDialog.hide();
      }
    } );

    // Position eraser button top-aligned to the right of the screen
    this.eraserButton.left = SCREEN_WIDTH + 6;
    this.eraserButton.top = 0;
    this.addChild( this.eraserButton );

    // Snapshot buttons and indicator dots, bottom-aligned to the right of the screen
    this.snapshotButtonGroup = new VBox( {
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
    this.addChild( this.snapshotButtonGroup );
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
   * Renders individual hit dots on the canvas. For low hit counts, uses a two-pass approach
   * (glow halo + bright core via arc) for the design mockup's phosphorescent screen look.
   * For high hit counts, switches to fillRect cores only for performance — overlapping dots
   * create a natural glow, and arc calls become the dominant render cost.
   */
  private paintHits( context: CanvasRenderingContext2D, brightness: number ): void {
    const hits = this.sceneModel.hits;
    if ( hits.length === 0 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;
    const rgb = this.getHitRGB();
    const hitCount = hits.length;

    // Cap the number of rendered hits to prevent frame drops. Start rendering from the end
    // of the array so that the most recent hits are always shown.
    const renderCount = Math.min( hitCount, MAX_RENDERED_HITS );
    const startIndex = hitCount - renderCount;

    if ( hitCount <= GLOW_THRESHOLD ) {

      // Low hit count: full quality rendering with glow halos and circular cores
      // Pass 1: Draw glow halos (semi-transparent, larger radius)
      context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${brightness * 0.15})`;
      for ( let i = startIndex; i < hitCount; i++ ) {
        const hit = hits[ i ];
        const viewX = ( hit.x + 1 ) / 2 * width;
        const viewY = ( hit.y + 1 ) / 2 * height;
        context.beginPath();
        context.arc( viewX, viewY, HIT_GLOW_RADIUS, 0, Math.PI * 2 );
        context.fill();
      }

      // Pass 2: Draw solid cores (bright, smaller radius)
      context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${brightness})`;
      for ( let i = startIndex; i < hitCount; i++ ) {
        const hit = hits[ i ];
        const viewX = ( hit.x + 1 ) / 2 * width;
        const viewY = ( hit.y + 1 ) / 2 * height;
        context.beginPath();
        context.arc( viewX, viewY, HIT_CORE_RADIUS, 0, Math.PI * 2 );
        context.fill();
      }
    }
    else {

      // High hit count: performance-optimized rendering using fillRect (no path computation)
      // and skipping the glow pass (overlapping dots at this density create natural glow).
      const coreDiameter = HIT_CORE_RADIUS * 2;
      context.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b},${brightness})`;
      for ( let i = startIndex; i < hitCount; i++ ) {
        const hit = hits[ i ];
        const viewX = ( hit.x + 1 ) / 2 * width;
        const viewY = ( hit.y + 1 ) / 2 * height;
        context.fillRect( viewX - HIT_CORE_RADIUS, viewY - HIT_CORE_RADIUS, coreDiameter, coreDiameter );
      }
    }
  }

  /**
   * Renders the average intensity pattern as vertical glowing bands using the theoretical intensity
   * curve. Uses getIntensityAtPosition() for a clean, smooth pattern that responds immediately to
   * parameter changes, consistent with the overhead detector pattern and graph views.
   * Opacity scales logarithmically with total accumulated hits so the pattern builds up over time,
   * matching the design requirement that time controls affect the aggregation rate.
   */
  private paintIntensity( context: CanvasRenderingContext2D, brightness: number ): void {
    const sceneModel = this.sceneModel;
    const totalHits = sceneModel.totalHitsProperty.value;

    if ( totalHits === 0 ) {
      return;
    }

    // Opacity scales with total accumulated hits using a logarithmic ramp, matching the
    // overhead detector pattern (OverheadDetectorPatternNode) and graph (GraphAccordionBox).
    // The pattern appears faintly at first and saturates as data accumulates.
    const opacityScale = Math.min( 1, Math.log10( totalHits + 1 ) / 2 );

    if ( opacityScale < 0.01 ) {
      return;
    }

    const width = SCREEN_WIDTH;
    const height = SCREEN_HEIGHT;
    const screenHalfWidth = sceneModel.screenHalfWidth;

    // Sample the theoretical intensity curve at evenly-spaced positions across the screen.
    // 200 samples provides a smooth curve that matches the model's INTENSITY_BIN_COUNT.
    const NUM_SAMPLES = 200;
    const bandWidth = width / NUM_SAMPLES;

    for ( let i = 0; i < NUM_SAMPLES; i++ ) {
      const fraction = ( i + 0.5 ) / NUM_SAMPLES;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      const intensity = sceneModel.getIntensityAtPosition( physicalX );
      const alpha = intensity * brightness * opacityScale;

      if ( alpha > 0.01 ) {
        context.fillStyle = this.getIntensityColor( alpha );
        context.fillRect( i * bandWidth, 0, bandWidth + 0.5, height );
      }
    }
  }

  /**
   * Returns the RGB components for hit dots based on the source type.
   * For photons, uses VisibleColor to get the wavelength-dependent color.
   * For particles, returns white.
   */
  private getHitRGB(): { r: number; g: number; b: number } {
    if ( this.sceneModel.sourceType === SourceType.PHOTONS ) {
      const color = VisibleColor.wavelengthToColor( this.sceneModel.wavelengthProperty.value );
      return { r: color.red, g: color.green, b: color.blue };
    }
    else {
      return { r: 255, g: 255, b: 255 };
    }
  }

  /**
   * Returns the CSS color string for an intensity band based on the source type and alpha.
   * For photons, uses VisibleColor to ensure consistent wavelength-dependent colors across all views.
   */
  private getIntensityColor( alpha: number ): string {
    if ( this.sceneModel.sourceType === SourceType.PHOTONS ) {
      const color = VisibleColor.wavelengthToColor( this.sceneModel.wavelengthProperty.value );
      return `rgba(${color.red},${color.green},${color.blue},${alpha})`;
    }
    else {
      return `rgba(255,255,255,${alpha})`;
    }
  }
}

quantumWaveInterference.register( 'DetectorScreenNode', DetectorScreenNode );
