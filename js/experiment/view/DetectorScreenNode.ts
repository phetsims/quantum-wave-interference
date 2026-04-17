// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenNode is the front-facing view of the detector screen.
 * It displays either individual hit dots (in Hits mode) or an intensity glow pattern (in Average Intensity mode) on a
 * black rounded rectangle. Hit rendering uses CanvasNode for efficient drawing of potentially thousands of dots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import DetectorScreenCanvasNode from './DetectorScreenCanvasNode.js';
import SnapshotButton from './SnapshotButton.js';
import SnapshotsDialog from './SnapshotsDialog.js';
import ViewSnapshotsButton from './ViewSnapshotsButton.js';

// Dimensions of the front-facing detector screen display, sourced from shared layout constants.
const SCREEN_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;
const SCREEN_CORNER_RADIUS = 0;
const BUTTON_COLUMN_GAP = 6;
const TARGET_SCALE_WIDTH_MM = 5;
const HORIZONTAL_ZOOM_BUTTON_MARGIN = 6;
const SNAPSHOT_FLASH_INITIAL_OPACITY = 0.8;
const SNAPSHOT_FLASH_DURATION = 0.6;
const DETECTOR_ACTION_BUTTON_MIN_WIDTH = 36;

/**
 * Returns the number of decimal places to show in a millimeter scale label,
 * based on the magnitude of the value (0 for integers >=1, 1 for >=0.1, 2 otherwise).
 */
const getScaleLabelDecimalPlaces = ( valueMM: number ): number => {
  if ( valueMM >= 1 ) {
    return Number.isInteger( valueMM ) ? 0 : 1;
  }
  if ( valueMM >= 0.1 ) {
    return 1;
  }
  return 2;
};

type SelfOptions = EmptySelfOptions;

type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {
  private readonly screenCanvasNode: DetectorScreenCanvasNode;
  private readonly screenBackgroundRect: Rectangle;

  public readonly eraserButton: EraserButton;
  public readonly snapshotButton: SnapshotButton;
  public readonly viewSnapshotsButton: ViewSnapshotsButton;
  private readonly snapshotButtonGroup: VBox;

  public constructor(
    sceneModel: SceneModel,
    isPlayingProperty: Property<boolean>,
    providedOptions: DetectorScreenNodeOptions
  ) {
    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()(
      {
        isDisposable: false
      },
      providedOptions
    );

    super( options );

    // Black rounded rectangle background representing the detector screen
    this.screenBackgroundRect = new Rectangle(
      0,
      0,
      SCREEN_WIDTH,
      SCREEN_HEIGHT,
      SCREEN_CORNER_RADIUS,
      SCREEN_CORNER_RADIUS,
      {
        fill: 'black',
        stroke: QuantumWaveInterferenceColors.frontFacingStrokeProperty,
        lineWidth: 1
      }
    );
    this.addChild( this.screenBackgroundRect );

    // Canvas node for rendering hits and intensity, clipped to the screen area
    this.screenCanvasNode = new DetectorScreenCanvasNode( sceneModel, SCREEN_WIDTH, SCREEN_HEIGHT );
    this.screenCanvasNode.clipArea = this.screenBackgroundRect.shape!;
    this.addChild( this.screenCanvasNode );

    // Transient snapshot flash overlay. This is a visual effect only (not model state).
    const snapshotFlashRect = new Rectangle( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT, {
      fill: 'white',
      opacity: 0,
      visible: false,
      pickable: false
    } );
    this.addChild( snapshotFlashRect );

    let snapshotFlashAnimation: Animation | null = null;

    const clearSnapshotFlash = () => {
      if ( snapshotFlashAnimation ) {
        snapshotFlashAnimation.stop();
      }
      snapshotFlashRect.opacity = 0;
      snapshotFlashRect.visible = false;
    };

    const startSnapshotFlash = () => {
      clearSnapshotFlash();
      snapshotFlashRect.opacity = SNAPSHOT_FLASH_INITIAL_OPACITY;
      snapshotFlashRect.visible = true;

      const flashAnimation = new Animation( {
        object: snapshotFlashRect,
        attribute: 'opacity',
        from: SNAPSHOT_FLASH_INITIAL_OPACITY,
        to: 0,
        duration: SNAPSHOT_FLASH_DURATION,
        easing: Easing.LINEAR
      } );

      snapshotFlashAnimation = flashAnimation;

      flashAnimation.endedEmitter.addListener( () => {
        if ( snapshotFlashAnimation === flashAnimation ) {
          snapshotFlashAnimation = null;
        }
        snapshotFlashRect.visible = false;
        flashAnimation.dispose();
      } );

      flashAnimation.start();
    };

    const horizontalZoomLevelResponseProperty = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponse.createProperty( {
      level: new DerivedProperty(
        [ sceneModel.detectorScreenScaleIndexProperty ],
        detectorScreenScaleIndex => detectorScreenScaleIndex + 1
      ),
      max: sceneModel.detectorScreenScaleIndexProperty.range.max + 1
    } );

    const horizontalZoomButtonGroup = new PlusMinusZoomButtonGroup( sceneModel.detectorScreenScaleIndexProperty, {
      orientation: 'horizontal',
      spacing: 0,
      iconOptions: {
        scale: 1.2
      },
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      left: HORIZONTAL_ZOOM_BUTTON_MARGIN,
      top: HORIZONTAL_ZOOM_BUTTON_MARGIN,
      zoomInButtonOptions: {
        accessibleName: QuantumWaveInterferenceFluent.a11y.zoomInButton.accessibleNameStringProperty,
        accessibleContextResponse: horizontalZoomLevelResponseProperty
      },
      zoomOutButtonOptions: {
        accessibleName: QuantumWaveInterferenceFluent.a11y.zoomOutButton.accessibleNameStringProperty,
        accessibleContextResponse: horizontalZoomLevelResponseProperty
      },
      tandem: providedOptions.tandem.createTandem( 'horizontalZoomButtonGroup' )
    } );
    this.addChild( horizontalZoomButtonGroup );

    // Hit count text - only visible in Hits mode, positioned above the screen on the right side (per design:
    // "Above the screen... on the right, there is a readout displaying the total number of detected hits (only if
    // 'Hits' selected)")
    const hitCountText = new Text( '', {
      font: new PhetFont( 12 ),
      fill: 'black',
      maxWidth: 100
    } );
    this.addChild( hitCountText );

    // Scale indicator: a double-headed span arrow spanning the full width of the detector screen,
    // with tick marks at the endpoints and a centered label showing the physical width.
    // This matches the span indicators used in FrontFacingSlitNode for slit width/separation.
    const SPAN_TICK_LENGTH = 8;
    const SPAN_ARROW_Y = -10; // y position of the span arrow above the screen

    // Scale indicator: the span arrow length is computed directly from the scene's physical detector width,
    // so the visual measurement is consistent with the interference pattern scale.
    // Use 5 mm when that fits on the detector screen. For scenes with sub-mm detector widths,
    // use 1/4 of the detector width so the scale bar remains readable.
    const scaleLabelStringProperty = new DerivedProperty(
      [
        sceneModel.detectorScreenScaleIndexProperty,
        QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty
      ],
      ( _detectorScreenScaleIndex, pattern ) => {
        const fullPhysicalWidthMM = sceneModel.screenHalfWidth * 2 * 1e3;
        const scalePhysicalWidthMM = fullPhysicalWidthMM >= TARGET_SCALE_WIDTH_MM ? TARGET_SCALE_WIDTH_MM : fullPhysicalWidthMM * 0.25;
        return StringUtils.fillIn( pattern, {
          value: toFixed( scalePhysicalWidthMM, getScaleLabelDecimalPlaces( scalePhysicalWidthMM ) )
        } );
      }
    );

    // Future cleanup: the scale indicator (arrow + ticks + label) could be extracted to a reusable ScaleIndicatorNode.
    const scaleArrow = new ArrowNode( 0, SPAN_ARROW_Y, 1, SPAN_ARROW_Y, {
      headHeight: 5,
      headWidth: 5,
      tailWidth: 1,
      doubleHead: true,
      fill: 'black',
      stroke: null
    } );
    this.addChild( scaleArrow );

    const scaleLeftTick = new Line(
      0,
      SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2,
      0,
      SPAN_ARROW_Y + SPAN_TICK_LENGTH / 2,
      { stroke: 'black', lineWidth: 1 }
    );
    this.addChild( scaleLeftTick );

    const scaleRightTick = new Line(
      0,
      SPAN_ARROW_Y - SPAN_TICK_LENGTH / 2,
      0,
      SPAN_ARROW_Y + SPAN_TICK_LENGTH / 2,
      { stroke: 'black', lineWidth: 1 }
    );
    this.addChild( scaleRightTick );

    const scaleLabelText = new Text( scaleLabelStringProperty, {
      font: new PhetFont( 12 ),
      fill: 'black',
      maxWidth: 100,
      centerY: SPAN_ARROW_Y
    } );
    this.addChild( scaleLabelText );

    const updateScaleIndicator = () => {
      const fullPhysicalWidth = sceneModel.screenHalfWidth * 2;
      const metersPerPixel = fullPhysicalWidth / SCREEN_WIDTH;
      const fullPhysicalWidthMM = fullPhysicalWidth * 1e3;
      const scalePhysicalWidthMM = fullPhysicalWidthMM >= TARGET_SCALE_WIDTH_MM ? TARGET_SCALE_WIDTH_MM : fullPhysicalWidthMM * 0.25;
      const scaleArrowWidth = ( scalePhysicalWidthMM * 1e-3 ) / metersPerPixel;

      scaleArrow.setTailAndTip( 0, SPAN_ARROW_Y, scaleArrowWidth, SPAN_ARROW_Y );
      scaleRightTick.x = scaleArrowWidth;
      scaleLabelText.left = scaleArrowWidth + 4;
    };
    sceneModel.detectorScreenScaleIndexProperty.link( updateScaleIndicator );

    // Update the hit count text and canvas when hits change or locale strings change
    const updateDisplay = () => {
      if ( sceneModel.detectionModeProperty.value === 'hits' ) {
        hitCountText.string = StringUtils.fillIn(
          QuantumWaveInterferenceFluent.hitsCountPatternStringProperty.value,
          {
            count: sceneModel.totalHitsProperty.value
          }
        );
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
    QuantumWaveInterferenceFluent.hitsCountPatternStringProperty.lazyLink( updateDisplay );
    sceneModel.isEmittingProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.screenBrightnessProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.intensityProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.detectorScreenScaleIndexProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // The intensity pattern is derived from accumulated hits (which trigger hitsChangedEmitter),
    // but wavelength changes affect hit dot color for photons.
    sceneModel.wavelengthProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.velocityProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // Eraser button to clear the screen
    const eraserButtonEnabledProperty = new DerivedProperty(
      [ sceneModel.detectionModeProperty, sceneModel.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits > 0,
      {
        tandem: providedOptions.tandem.createTandem( 'eraserButtonEnabledProperty' ),
        phetioValueType: BooleanIO
      }
    );

    // Snapshot dialog (one per scene)
    const snapshotsDialog = new SnapshotsDialog(
      sceneModel,
      providedOptions.tandem.createTandem( 'snapshotsDialog' )
    );

    // Camera button to take a snapshot
    this.snapshotButton = new SnapshotButton(
      sceneModel.numberOfSnapshotsProperty,
      () => sceneModel.takeSnapshot(),
      startSnapshotFlash,
      providedOptions.tandem.createTandem( 'snapshotButton' )
    );

    // Match detector-side action button dimensions to the camera button without scaling icons.
    const detectorActionButtonMinHeight = this.snapshotButton.height;
    const detectorActionButtonMinWidth = DETECTOR_ACTION_BUTTON_MIN_WIDTH;
    const eraserButtonTandem = providedOptions.tandem.createTandem( 'eraserButton' );
    const eraserButtonVisibleProperty = new GatedVisibleProperty(
      sceneModel.detectionModeProperty.derived( detectionMode => detectionMode === 'hits' ),
      eraserButtonTandem
    );

    // Eraser button to clear the screen
    this.eraserButton = new EraserButton( {
      iconWidth: 18,
      minWidth: detectorActionButtonMinWidth,
      minHeight: detectorActionButtonMinHeight,
      listener: () => sceneModel.clearScreen(),
      soundPlayer: sharedSoundPlayers.get( 'erase' ),
      enabledProperty: eraserButtonEnabledProperty,
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty,
      accessibleContextResponse: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleContextResponseStringProperty,
      tandem: eraserButtonTandem,
      visibleProperty: eraserButtonVisibleProperty
    } );

    // Eye button to view snapshots
    this.viewSnapshotsButton = new ViewSnapshotsButton(
      sceneModel.numberOfSnapshotsProperty,
      isPlayingProperty,
      snapshotsDialog,
      detectorActionButtonMinWidth,
      detectorActionButtonMinHeight,
      providedOptions.tandem.createTandem( 'viewSnapshotsButton' )
    );

    // Snapshot indicator circles (4 small circles that fill as snapshots are taken)
    const DOT_RADIUS = 3;
    const indicatorDots: Circle[] = [];
    for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
      indicatorDots.push(
        new Circle( DOT_RADIUS, {
          stroke: QuantumWaveInterferenceColors.indicatorDotStrokeProperty,
          lineWidth: 0.5,
          fill: QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty
        } )
      );
    }

    const indicatorDotsBox = new HBox( {
      spacing: 3,
      children: indicatorDots
    } );

    // Update indicator dot fills when snapshots change
    sceneModel.numberOfSnapshotsProperty.link( count => {
      for ( let i = 0; i < SceneModel.MAX_SNAPSHOTS; i++ ) {
        indicatorDots[ i ].fill = i < count
                                  ? QuantumWaveInterferenceColors.indicatorDotActiveFillProperty
                                  : QuantumWaveInterferenceColors.indicatorDotInactiveFillProperty;
      }
    } );

    // Close the snapshots dialog when this DetectorScreenNode becomes invisible (i.e.,
    // when the user switches to a different scene). Without this,
    // the dialog would remain open showing stale snapshot data from the previous scene, which is confusing.
    this.visibleProperty.lazyLink( visible => {
      if ( !visible && snapshotsDialog.isShowingProperty.value ) {
        snapshotsDialog.hide();
      }
      if ( !visible ) {
        clearSnapshotFlash();
      }
    } );

    // If this node is detached from all displays (e.g. screen switch), stop and clear any active flash effect.
    this.rootedDisplayChangedEmitter.addListener( () => {
      if ( this.rootedDisplays.length === 0 ) {
        clearSnapshotFlash();
      }
    } );

    // Snapshot buttons and indicator dots, bottom-aligned to the right of the screen
    this.snapshotButtonGroup = new VBox( {
      spacing: 4,
      align: 'left',
      children: [ indicatorDotsBox, this.snapshotButton, this.viewSnapshotsButton ]
    } );

    // Left-align both button groups so their left edges match,
    // with reduced horizontal gap from the detector screen to the button column.
    const buttonsLeft = SCREEN_WIDTH + BUTTON_COLUMN_GAP;
    this.eraserButton.left = buttonsLeft;
    this.eraserButton.top = 0;
    this.addChild( this.eraserButton );

    this.snapshotButtonGroup.left = buttonsLeft;
    this.snapshotButtonGroup.bottom = SCREEN_HEIGHT;
    this.addChild( this.snapshotButtonGroup );
  }

  /**
   * Gets the global bounds of the black rectangular detector screen area.
   */
  public getScreenRectangleGlobalBounds(): Bounds2 {
    return this.screenBackgroundRect.localToGlobalBounds( this.screenBackgroundRect.localBounds );
  }
}
