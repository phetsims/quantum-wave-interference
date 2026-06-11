// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenNode is the front-facing view of the detector screen.
 * It displays either individual hit dots (in Hits mode) or an intensity glow pattern (in Average Intensity mode) on a
 * black rounded rectangle. Hit rendering uses CanvasNode for efficient drawing of potentially thousands of dots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// TODO: Cannot have same name as other DetectorScreenNode in quantum-wave-interference, see https://github.com/phetsims/quantum-wave-interference/issues/135

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import { type DualString } from '../../../../axon/js/AccessibleStrings.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import createDetectorZoomLevelResponseProperty from '../../common/view/description/createDetectorZoomLevelResponseProperty.js';
import { type DetectorScreenViewStateFragment } from '../../common/view/description/QuantumWaveInterferenceAccessibleViewState.js';
import SnapshotDescriber from '../../common/view/description/SnapshotDescriber.js';
import SnapshotButton from '../../common/view/SnapshotButton.js';
import SnapshotIndicatorDotsNode from '../../common/view/SnapshotIndicatorDotsNode.js';
import SnapshotsDialog from '../../common/view/SnapshotsDialog.js';
import ViewSnapshotsButton from '../../common/view/ViewSnapshotsButton.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../model/DetectorScreenScale.js';
import SceneModel from '../model/SceneModel.js';
import DetectorScreenCanvasNode from './DetectorScreenCanvasNode.js';
import DetectorScreenScaleIndicatorNode from './DetectorScreenScaleIndicatorNode.js';

function formatExperimentSlitSeparation( slitSepMM: number ): DualString {
  const slitSepUM = slitSepMM * 1000;
  return micrometersUnit.getDualString( slitSepUM, {
    decimalPlaces: ExperimentConstants.getDecimalPlacesForValue( slitSepUM ),
    showTrailingZeros: true
  } );
}

// Dimensions of the front-facing detector screen display, sourced from shared layout constants.
const SCREEN_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const SCREEN_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;
const SCREEN_CORNER_RADIUS = 0;
const BUTTON_COLUMN_GAP = 6;
const HORIZONTAL_ZOOM_BUTTON_MARGIN = 6;
const SNAPSHOT_FLASH_INITIAL_OPACITY = 0.8;
const SNAPSHOT_FLASH_DURATION = 0.6;
const DETECTOR_ACTION_BUTTON_MIN_WIDTH = 36;
const SPAN_TICK_LENGTH = 8;
const SPAN_ARROW_Y = -10;

type SelfOptions = {

  // Called immediately after a snapshot is taken and the visual flash animation has been started.
  // Use this to trigger any additional side-effects in the parent view (e.g., a coordinated flash
  // on the overhead apparatus). Defaults to a no-op.
  onSnapshotCaptured?: () => void;
};

// Options for DetectorScreenNode. A tandem is required for PhET-iO instrumentation of the snapshot buttons.
type DetectorScreenNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class DetectorScreenNode extends Node {
  private readonly sceneModel: SceneModel;
  private readonly detectorScreenScaleIndexProperty: NumberProperty;
  private readonly screenCanvasNode: DetectorScreenCanvasNode;
  private readonly screenBackgroundRect: Rectangle;

  // Public so that ExperimentDetectorColumnNode can collect them for PDOM ordering (pdomOrder / focus management).
  public readonly snapshotButton: SnapshotButton;
  public readonly viewSnapshotsButton: ViewSnapshotsButton;
  private readonly snapshotButtonGroup: VBox;

  public constructor(
    sceneModel: SceneModel,
    detectorScreenScaleIndexProperty: NumberProperty,
    isPlayingProperty: Property<boolean>,
    providedOptions: DetectorScreenNodeOptions
  ) {
    const options = optionize<DetectorScreenNodeOptions, SelfOptions, NodeOptions>()(
      {
        onSnapshotCaptured: _.noop,
        isDisposable: false
      },
      providedOptions
    );

    super( options );

    this.sceneModel = sceneModel;
    this.detectorScreenScaleIndexProperty = detectorScreenScaleIndexProperty;

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
    this.screenCanvasNode = new DetectorScreenCanvasNode(
      sceneModel,
      detectorScreenScaleIndexProperty,
      SCREEN_WIDTH,
      SCREEN_HEIGHT
    );
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

    const horizontalZoomLevelResponseProperty = createDetectorZoomLevelResponseProperty( detectorScreenScaleIndexProperty );

    const horizontalZoomButtonGroup = new PlusMinusZoomButtonGroup( detectorScreenScaleIndexProperty, {
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
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreen.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty,
        accessibleContextResponse: horizontalZoomLevelResponseProperty
      },
      zoomOutButtonOptions: {
        accessibleName: QuantumWaveInterferenceFluent.a11y.zoomOutButton.accessibleNameStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreen.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty,
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

    this.addChild( new DetectorScreenScaleIndicatorNode( detectorScreenScaleIndexProperty, SCREEN_WIDTH, SPAN_ARROW_Y ) );

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
    detectorScreenScaleIndexProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // These Properties affect the detector texture directly. In Hits mode, geometry changes clear the screen through
    // SceneModel, but Average Intensity mode must also repaint when the theoretical pattern changes.
    sceneModel.wavelengthProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.particleSpeedProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.slitSeparationProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.screenDistanceProperty.link( () => this.screenCanvasNode.invalidatePaint() );
    sceneModel.slitSettingProperty.link( () => this.screenCanvasNode.invalidatePaint() );

    // Snapshot dialog (one per scene)
    const snapshotsDialog = new SnapshotsDialog(
      sceneModel.snapshotsProperty,
      snapshot => sceneModel.deleteSnapshot( snapshot ),
      providedOptions.tandem.createTandem( 'snapshotsDialog' ),
      {
        slitOrientation: 'leftRight',
        formatSlitSeparation: formatExperimentSlitSeparation,
        showScreenDistance: true,
        getDescription: snapshot => SnapshotDescriber.getDescription(
          snapshot,
          getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value )
        ),
        detectorScreenScaleIndexProperty: detectorScreenScaleIndexProperty,
        getVisibleScreenHalfWidth: () => getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value ),
        createScaleIndicatorNode: () => new DetectorScreenScaleIndicatorNode(
          detectorScreenScaleIndexProperty,
          SCREEN_WIDTH,
          SPAN_ARROW_Y
        )
      }
    );

    // Camera button to take a snapshot
    this.snapshotButton = new SnapshotButton(
      sceneModel.numberOfSnapshotsProperty,
      () => sceneModel.takeSnapshot(),
      () => {
        startSnapshotFlash();
        options.onSnapshotCaptured();
      },
      providedOptions.tandem.createTandem( 'snapshotButton' )
    );

    // Match detector-side action button dimensions to the camera button without scaling icons.
    const detectorActionButtonMinHeight = this.snapshotButton.height;
    const detectorActionButtonMinWidth = DETECTOR_ACTION_BUTTON_MIN_WIDTH;

    // Eye button to view snapshots
    this.viewSnapshotsButton = new ViewSnapshotsButton(
      sceneModel.numberOfSnapshotsProperty,
      isPlayingProperty,
      snapshotsDialog,
      detectorActionButtonMinWidth,
      detectorActionButtonMinHeight,
      providedOptions.tandem.createTandem( 'viewSnapshotsButton' )
    );

    const indicatorDotsBox = new SnapshotIndicatorDotsNode( sceneModel.numberOfSnapshotsProperty );

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

    // Align the snapshot buttons with a reduced horizontal gap from the detector screen.
    const buttonsLeft = SCREEN_WIDTH + BUTTON_COLUMN_GAP;
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

  /**
   * Gets sparse detector-screen view state for agent-facing accessibility snapshots.
   *
   * @returns detector-screen view state
   */
  private getAccessibleViewState(): DetectorScreenViewStateFragment {
    if ( !this.visible ) {
      return {
        detectorScreen: {
          visible: false
        }
      };
    }

    return {
      detectorScreen: {
        visible: true,
        perspective: 'frontFacing',
        hitCount: this.sceneModel.totalHitsProperty.value,
        numberOfSnapshots: this.sceneModel.numberOfSnapshotsProperty.value,
        detectorScreenScaleIndex: this.detectorScreenScaleIndexProperty.value
      }
    };
  }
}
