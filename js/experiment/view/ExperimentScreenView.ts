// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenView is the top-level view for the Quantum Wave Interference simulation. It contains three visual
 * "rows": the top row with the emitter, double slit, and detector screen in overhead perspective;
 * the middle row with controls and front-facing views; and the bottom row with scene selectors, slit controls,
 * and screen settings.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GatedEnabledProperty from '../../../../axon/js/GatedEnabledProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import createRulerNode from './createRulerNode.js';
import DetectorScreenDescriber from './description/DetectorScreenDescriber.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import ExperimentScreenSummaryContent from './ExperimentScreenSummaryContent.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';
import OverheadBeamNode from './OverheadBeamNode.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import ScreenSettingsPanel from './ScreenSettingsPanel.js';
import SlitControlPanel from './SlitControlPanel.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import WhichPathDetectorIndicatorNode from './WhichPathDetectorIndicatorNode.js';

type SelfOptions = EmptySelfOptions;

type ExperimentScreenViewOptions = SelfOptions & ScreenViewOptions;

const RULER_X_OFFSET = 0.5;
const RULER_KEYBOARD_DRAG_DELTA = 5;
const RULER_KEYBOARD_SHIFT_DRAG_DELTA = 1;
const MIDDLE_COLUMN_LEFT_SHIFT = 3;

export default class ExperimentScreenView extends ScreenView {
  private readonly graphAccordionBoxes: GraphAccordionBox[];
  private readonly centerRulerOnDetectorScreen: () => void;

  // Shared expanded state for the graph accordion boxes across all scenes,
  // so that switching scenes preserves the open/closed state per the design requirement.
  private readonly graphExpandedProperty: BooleanProperty;

  public constructor( model: ExperimentModel, providedOptions: ExperimentScreenViewOptions ) {
    const options = optionize<ExperimentScreenViewOptions, SelfOptions, ScreenViewOptions>()(
      {
        screenSummaryContent: new ExperimentScreenSummaryContent( model )
      },
      providedOptions
    );

    super( options );

    // ==============================
    // Top Row: Emitter, Double Slit, Detector Screen (overhead perspective)
    // ==============================

    const overheadEmitterNode = new OverheadEmitterNode( model, this.layoutBounds, options.tandem );
    const overheadDoubleSlitNode = new OverheadDoubleSlitNode( model.sceneProperty );

    const whichPathDetectorNode = new WhichPathDetectorIndicatorNode( model, overheadDoubleSlitNode );

    const updateWhichPathDetectorLayout = () => {
      whichPathDetectorNode.updateLayout();
    };
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.slitSeparationProperty.unlink( updateWhichPathDetectorLayout );
      }
      newScene.slitSeparationProperty.link( updateWhichPathDetectorLayout );
    } );

    const overheadDetectorScreenNode = new OverheadDetectorScreenNode(
      model.sceneProperty,
      overheadDoubleSlitNode.parallelogramNode
    );
    const overheadBeamNode = new OverheadBeamNode(
      model.sceneProperty,
      overheadEmitterNode,
      overheadDoubleSlitNode,
      overheadDetectorScreenNode
    );

    // Top-row stacking order (back to front):
    // fan beam -> double slit -> detector shadow -> incident beam -> detector/indicator -> emitter.
    // The incident beam (emitter to slit) is in front of the double slit but behind the laser.
    this.addChild( overheadBeamNode );
    this.addChild( overheadDoubleSlitNode );
    this.addChild( overheadBeamNode.detectorScreenShadowNode );
    this.addChild( overheadBeamNode.emitterBeamNode );
    this.addChild( overheadDetectorScreenNode );
    this.addChild( whichPathDetectorNode );
    this.addChild( overheadEmitterNode );

    const alignOverheadElements = () => {
      const activeEmitter = model.sceneProperty.value.sourceType === 'photons'
                            ? overheadEmitterNode.laserPointerNode
                            : overheadEmitterNode.particleEmitterNode;

      // Keep the slit centered on the active emitter's beam centerline.
      overheadDoubleSlitNode.parallelogramNode.centerY = activeEmitter.centerY;

      // Keep the hit-cap message centered in the horizontal gap between the active emitter and the visible black slit
      // background, not the larger transparent parallelogram bounds.
      overheadEmitterNode.maxHitsReachedPanel.centerX = ( activeEmitter.right + overheadDoubleSlitNode.getVisibleBackgroundLeftX() ) / 2;
      overheadEmitterNode.maxHitsReachedPanel.centerY = activeEmitter.centerY;

      whichPathDetectorNode.updateLayout();

      // Recompute beams after vertical alignment changes.
      overheadBeamNode.updateBeam();
    };
    model.sceneProperty.link( alignOverheadElements );

    // ==============================
    // Middle Row: Source controls, front-facing slits, front-facing screen, graph
    // ==============================

    // Front-facing slit view - one per scene, with visibility toggling
    const frontFacingSlitTandem = options.tandem.createTandem( 'frontFacingSlitNodes' );
    const frontFacingSlitNodes = model.scenes.map( ( scene, index ) => {
      const slitNode = new FrontFacingSlitNode( scene, {
        tandem: frontFacingSlitTandem.createTandem( `frontFacingSlitNode${index}` )
      } );
      slitNode.y = ExperimentConstants.FRONT_FACING_ROW_TOP;
      this.addChild( slitNode );
      return slitNode;
    } );

    // Front-facing detector screen - one per scene, with visibility toggling.
    const controlsRight = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    const detectorScreenTandem = options.tandem.createTandem( 'detectorScreenNodes' );
    const detectorScreenNodes = model.scenes.map( ( scene, index ) => {
      return new DetectorScreenNode( scene, model.isPlayingProperty, {
        onSnapshotCaptured: () => overheadDetectorScreenNode.startSnapshotFlash(),
        tandem: detectorScreenTandem.createTandem( `detectorScreenNode${index}` )
      } );
    } );

    const maxLocalRight = Math.max( ...detectorScreenNodes.map( ds => ds.localBounds.maxX ) );
    const detectorScreenX = controlsRight - maxLocalRight;
    for ( const detectorScreen of detectorScreenNodes ) {
      detectorScreen.x = detectorScreenX;
      detectorScreen.y = ExperimentConstants.FRONT_FACING_ROW_TOP;
      this.addChild( detectorScreen );
    }

    // Set overhead parallelogram positioning bounds and trigger initial updates
    const frontFacingScreenLeft = detectorScreenNodes[ 0 ].x;
    const frontFacingScreenRight = detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH;
    const detectorScreenCenterX = detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
    overheadDetectorScreenNode.setFrontFacingScreenBounds(
      frontFacingScreenLeft,
      frontFacingScreenRight
    );
    overheadBeamNode.updateBeam();

    // Shared expanded property for the graph accordion box
    this.graphExpandedProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'graphExpandedProperty' )
    } );

    // Graph accordion box - one per scene
    const graphTandem = options.tandem.createTandem( 'graphAccordionBoxes' );
    this.graphAccordionBoxes = model.scenes.map( ( scene, index ) => {
      const graphBox = new GraphAccordionBox( scene, {
        expandedProperty: this.graphExpandedProperty,
        isRulerVisibleProperty: model.isRulerVisibleProperty,
        tandem: graphTandem.createTandem( `graphAccordionBox${index}` )
      } );
      graphBox.x = detectorScreenCenterX - graphBox.getChartAreaLocalBounds().centerX;
      graphBox.top = detectorScreenNodes[ 0 ].bottom + 8;
      this.addChild( graphBox );
      return graphBox;
    } );

    const layoutGraphAccordionBoxes = () => {
      this.graphAccordionBoxes.forEach( graphBox => {
        graphBox.x = detectorScreenCenterX - graphBox.getChartAreaLocalBounds().centerX;
        graphBox.top = screenSettingsPanel.bottom + 8;
      } );
    };

    // Toggle visibility of front-facing slits, detector screens, and graphs based on the selected scene
    model.sceneProperty.link( selectedScene => {
      model.scenes.forEach( ( scene, index ) => {
        const isSelected = scene === selectedScene;
        frontFacingSlitNodes[ index ].visible = isSelected;
        detectorScreenNodes[ index ].visible = isSelected;
        this.graphAccordionBoxes[ index ].visible = isSelected;
      } );
    } );

    // Source controls panel (beneath the emitter)
    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: options.tandem.createTandem( 'sourceControlPanel' )
    } );
    sourceControlPanel.left = overheadEmitterNode.laserPointerNode.left;
    this.addChild( sourceControlPanel );

    const updateSourceControlPanelPosition = () => {
      sourceControlPanel.top = ExperimentConstants.FRONT_FACING_ROW_TOP - 2;
    };
    model.sceneProperty.link( updateSourceControlPanelPosition );

    const updateEmitterAlignment = () => {
      overheadEmitterNode.setEmitterCenterX( sourceControlPanel.centerX );
      alignOverheadElements();
    };
    sourceControlPanel.localBoundsProperty.link( updateEmitterAlignment );
    updateEmitterAlignment();

    // ==============================
    // Bottom Row
    // ==============================

    // Scene radio buttons - 2x2 grid centered under the source control panel (left UI column)
    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      options.tandem.createTandem( 'sceneRadioButtonGroup' ),
      {
        createAccessibleContextResponse: scene => QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleContextResponse.createProperty( {
          sourceType: scene.sourceType,
          isEmitting: scene.isEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' ),
          isMaxHitsReached: scene.isMaxHitsReachedProperty.derived( isMaxHitsReached => isMaxHitsReached ? 'true' : 'false' )
        } )
      }
    );
    const sceneButtonAreaTop = sourceControlPanel.bottom;
    const sceneButtonAreaBottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
    sceneRadioButtonGroup.centerX = sourceControlPanel.centerX;
    sceneRadioButtonGroup.centerY = ( sceneButtonAreaTop + sceneButtonAreaBottom ) / 2;
    this.addChild( sceneRadioButtonGroup );

    // Slit controls panel, top-justified directly beneath the front-facing slit view
    const slitControlPanel = new SlitControlPanel(
      model.sceneProperty,
      model.scenes,
      this, // ComboBox list parent
      {
        tandem: options.tandem.createTandem( 'slitControlPanel' )
      }
    );

    // Center the slit-view/slit-panel middle column between the left and right columns.
    const leftColumnRight = Math.max( sourceControlPanel.right, sceneRadioButtonGroup.right );
    const rightColumnLeft = detectorScreenNodes[ 0 ].left;
    const middleColumnCenterX = ( leftColumnRight + rightColumnLeft ) / 2 - MIDDLE_COLUMN_LEFT_SHIFT;
    frontFacingSlitNodes.forEach( node => {
      node.setViewCenterX( middleColumnCenterX );
    } );
    overheadDoubleSlitNode.setParallelogramCenterX( middleColumnCenterX );
    whichPathDetectorNode.updateLayout();
    overheadDetectorScreenNode.updatePosition();
    overheadBeamNode.updateBeam();
    slitControlPanel.centerX = middleColumnCenterX;
    slitControlPanel.top = frontFacingSlitNodes[ 0 ].bottom + 8;
    this.addChild( slitControlPanel );

    // Move front-facing slit nodes above the slit control panel so the slit separation span below the view is not
    // obscured by the panel's background.
    frontFacingSlitNodes.forEach( n => n.moveToFront() );

    // Screen settings panel (detection mode + brightness), directly below the detector screen.
    const screenSettingsPanel = new ScreenSettingsPanel(
      model.currentDetectionModeProperty,
      model.currentScreenBrightnessProperty,
      model.currentIsEmittingProperty,
      {
        tandem: options.tandem.createTandem( 'screenSettingsPanel' )
      }
    );

    const layoutScreenSettingsPanel = () => {
      screenSettingsPanel.centerX = detectorScreenNodes[ 0 ].x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
      screenSettingsPanel.top = detectorScreenNodes[ 0 ].bottom + 8;
    };

    layoutScreenSettingsPanel();
    this.addChild( screenSettingsPanel );

    // Keep the graph below the screen settings panel to avoid overlap and align the chart rectangle to the detector
    // screen rectangle even if labels or scale change.
    screenSettingsPanel.localBoundsProperty.link( () => {
      layoutScreenSettingsPanel();
      layoutGraphAccordionBoxes();
    } );
    this.graphAccordionBoxes.forEach( graphBox => {
      graphBox.localBoundsProperty.link( layoutGraphAccordionBoxes );
    } );
    layoutGraphAccordionBoxes();

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
        this.reset();
      },
      right: this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN,
      bottom: this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN,
      tandem: options.tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // Ruler checkbox
    const rulerCheckboxLabel = new Text( QuantumWaveInterferenceFluent.rulerStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 80
    } );
    const rulerCheckbox = new Checkbox( model.isRulerVisibleProperty, rulerCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleHelpTextStringProperty,
      accessibleContextResponseChecked: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty,
      accessibleContextResponseUnchecked: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty,
      tandem: options.tandem.createTandem( 'rulerCheckbox' )
    } );

    // Stopwatch checkbox - positioned below the ruler checkbox
    const stopwatchCheckboxLabel = new Text( QuantumWaveInterferenceFluent.stopwatchStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 80
    } );
    const stopwatchCheckbox = new Checkbox(
      model.stopwatch.isVisibleProperty,
      stopwatchCheckboxLabel,
      {
        boxWidth: 16,
        spacing: 6,
        accessibleHelpText:
        QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleHelpTextStringProperty,
        accessibleContextResponseChecked: QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty,
        accessibleContextResponseUnchecked: QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty,
        tandem: options.tandem.createTandem( 'stopwatchCheckbox' )
      }
    );
    const checkboxGroup = new VBox( {
      spacing: 6,
      align: 'left',
      children: [ rulerCheckbox, stopwatchCheckbox ]
    } );
    this.addChild( checkboxGroup );

    // Time controls: play/pause button with speed radio buttons.
    const timeControlNodeTandem = options.tandem.createTandem( 'timeControlNode' );
    const timeControlsHitsModeProperty = model.currentDetectionModeProperty.derived( detectionMode => detectionMode === 'hits' );
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: 15,
      visibleProperty: new GatedVisibleProperty( timeControlsHitsModeProperty, timeControlNodeTandem ),
      enabledProperty: new GatedEnabledProperty( timeControlsHitsModeProperty, timeControlNodeTandem ),
      speedRadioButtonGroupOptions: {
        accessibleHelpText:
        QuantumWaveInterferenceFluent.a11y.timeControlNode.simSpeedDescriptionStringProperty
      },
      playPauseStepButtonOptions: {
        includeStepForwardButton: false,
        playPauseButtonOptions: {
          radius: 22
        }
      },
      tandem: timeControlNodeTandem
    } );
    this.addChild( timeControlNode );

    const bottomRowLeft = this.graphAccordionBoxes[ 0 ].left;
    const bottomRowRight = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    const totalBottomControlsWidth = checkboxGroup.width + timeControlNode.width + resetAllButton.width;
    const bottomRowSpaceBetween = Math.max(
      0,
      ( bottomRowRight - bottomRowLeft - totalBottomControlsWidth ) / 2
    );

    checkboxGroup.left = bottomRowLeft;
    timeControlNode.left = checkboxGroup.right + bottomRowSpaceBetween;
    resetAllButton.left = timeControlNode.right + bottomRowSpaceBetween;
    resetAllButton.right = bottomRowRight;

    timeControlNode.centerY = resetAllButton.centerY;
    checkboxGroup.centerY = resetAllButton.centerY;

    // Nudge the slit control panel slightly lower than the checkbox group.
    slitControlPanel.bottom = checkboxGroup.bottom + 2;

    // Draggable ruler. The ruler's horizontal scale is calibrated to the active detector screen: its full width maps to
    // the scene's full detector width in mm.
    const rulerNodesTandem = options.tandem.createTandem( 'rulerNodes' );

    const rulerNodes = model.scenes.map( ( scene, index ) => {
      const rulerNode = createRulerNode(
        scene,
        rulerNodesTandem.createTandem( `rulerNode${index}` )
      );
      this.addChild( rulerNode );
      return rulerNode;
    } );

    const updateRulerVisibility = () => {
      const activeScene = model.sceneProperty.value;
      const isRulerVisible = model.isRulerVisibleProperty.value;
      model.scenes.forEach( ( scene, index ) => {
        rulerNodes[ index ].visible = isRulerVisible && scene === activeScene;
      } );
    };
    model.sceneProperty.link( updateRulerVisibility );
    model.isRulerVisibleProperty.link( updateRulerVisibility );

    model.rulerPositionProperty.link( position => {
      rulerNodes.forEach( rulerNode => {
        rulerNode.translation = position;
      } );
    } );

    const getActiveSceneIndex = () => model.scenes.indexOf( model.sceneProperty.value );
    const rulerDragBoundsProperty = new DerivedProperty(
      [ this.visibleBoundsProperty, model.sceneProperty, this.graphExpandedProperty ],
      visibleBounds => {
        const activeSceneIndex = getActiveSceneIndex();
        const activeDetectorScreen = detectorScreenNodes[ activeSceneIndex ];
        const activeGraphBox = this.graphAccordionBoxes[ activeSceneIndex ];
        const activeRulerNode = rulerNodes[ activeSceneIndex ];

        const detectorRectCenterX = activeDetectorScreen.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
        const fixedLeft = detectorRectCenterX - activeRulerNode.width / 2 + RULER_X_OFFSET;

        const detectorScreenRectBounds = this.globalToLocalBounds(
          activeDetectorScreen.getScreenRectangleGlobalBounds()
        );
        const minTopFromScreen = detectorScreenRectBounds.top;
        const graphChartBounds = this.globalToLocalBounds(
          activeGraphBox.getChartAreaGlobalBounds()
        );
        const maxTopFromGraph = graphChartBounds.bottom - activeRulerNode.height + activeGraphBox.getChartAreaStrokeLineWidth();

        const minTop = Math.max( minTopFromScreen, visibleBounds.minY );
        const maxTop = Math.max(
          minTop,
          Math.min( maxTopFromGraph, visibleBounds.maxY - activeRulerNode.height )
        );

        // Lock X to detector screen center by setting minX === maxX.
        return new Bounds2( fixedLeft, minTop, fixedLeft, maxTop );
      }
    );

    rulerDragBoundsProperty.link( dragBounds => {
      model.rulerPositionProperty.value = dragBounds.closestPointTo(
        model.rulerPositionProperty.value
      );
    } );

    this.centerRulerOnDetectorScreen = () => {
      const activeSceneIndex = getActiveSceneIndex();
      const activeDetectorScreen = detectorScreenNodes[ activeSceneIndex ];
      const activeRulerNode = rulerNodes[ activeSceneIndex ];
      const centeredTop = activeDetectorScreen.centerY - activeRulerNode.height / 2;
      const detectorRectCenterX = activeDetectorScreen.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
      const centeredLeft = detectorRectCenterX - activeRulerNode.width / 2 + RULER_X_OFFSET;
      model.rulerPositionProperty.value = rulerDragBoundsProperty.value.closestPointTo(
        new Vector2( centeredLeft, centeredTop )
      );
    };
    this.centerRulerOnDetectorScreen();

    rulerNodes.forEach( ( rulerNode, index ) => {
      const rulerTandem = rulerNodesTandem.createTandem( `rulerNode${index}` );

      rulerNode.addInputListener(
        new SoundDragListener( {
          positionProperty: model.rulerPositionProperty,
          dragBoundsProperty: rulerDragBoundsProperty,
          tandem: rulerTandem.createTandem( 'dragListener' )
        } )
      );

      rulerNode.addInputListener(
        new SoundKeyboardDragListener( {
          positionProperty: model.rulerPositionProperty,
          dragBoundsProperty: rulerDragBoundsProperty,
          keyboardDragDirection: 'upDown',
          dragDelta: RULER_KEYBOARD_DRAG_DELTA,
          shiftDragDelta: RULER_KEYBOARD_SHIFT_DRAG_DELTA,
          tandem: rulerTandem.createTandem( 'keyboardDragListener' )
        } )
      );
    } );

    // Draggable stopwatch for timing experiments
    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty,
      tandem: options.tandem.createTandem( 'stopwatchNode' )
    } );
    this.addChild( stopwatchNode );

    // When shown via checkbox, place the stopwatch above and to the right of the checkbox,
    // with stopwatch bottom aligned to the top of the checkbox text label.
    const positionStopwatchNearCheckbox = () => {
      const checkboxBounds = this.globalToLocalBounds(
        stopwatchCheckbox.localToGlobalBounds( stopwatchCheckbox.localBounds )
      );
      const checkboxLabelBounds = this.globalToLocalBounds(
        stopwatchCheckboxLabel.localToGlobalBounds( stopwatchCheckboxLabel.localBounds )
      );
      const x = checkboxBounds.right + 8;
      const y = checkboxLabelBounds.top - stopwatchNode.height;
      model.stopwatch.positionProperty.value = new Vector2( x, y );
    };
    model.stopwatch.isVisibleProperty.lazyLink( isVisible => {
      if ( isVisible ) {
        positionStopwatchNearCheckbox();
      }
    } );

    // Accessible paragraph describing the current state of the detector screen for screen reader users.
    // The description scales with hit count: few hits describe scattered detections,
    // many hits describe the emerging/established interference pattern.
    const detectorScreenDescriber = new DetectorScreenDescriber( model.sceneProperty, model.isRulerVisibleProperty );
    const detectorScreenDescriptionNode = new Node( {
      accessibleParagraph: detectorScreenDescriber.descriptionProperty
    } );
    this.addChild( detectorScreenDescriptionNode );

    // Accessible paragraph describing the magnified slit view for screen reader users.
    // This is important non-interactive visual content: the slit view shows the barrier with two slits, their width,
    // and the current slit configuration (open/covered/detector). The slit width is a constant per scene that is
    // visible on screen but not accessible through any interactive control.
    const slitSettingProperty = model.currentSlitSettingProperty;
    const slitWidthStringProperty = model.sceneProperty.derived( scene => {
      const slitWidthMM = scene.slitWidth;
      const { slitWidthUM, decimalPlaces } = ExperimentConstants.slitWidthMMToMicrometers( slitWidthMM );
      return QuantumWaveInterferenceFluent.a11y.slitWidthMicrometersPattern.format( {
        value: toFixed( slitWidthUM, decimalPlaces )
      } );
    } );
    const slitViewDescriptionNode = new Node( {
      accessibleParagraph:
        QuantumWaveInterferenceFluent.a11y.slitView.accessibleParagraph.createProperty( {
          slitWidth: slitWidthStringProperty,
          slitSetting: slitSettingProperty
        } )
    } );
    this.addChild( slitViewDescriptionNode );

    // Accessible paragraph describing the particle mass for screen reader users.
    // This is important on-screen text (rendered as RichText in OverheadEmitterNode) that supports the learning goal:
    // "Relate particle momentum to wavelength using the de Broglie relationship." Hidden for photons (which are
    // massless).
    const particleSourceTypeProperty = model.sceneProperty.derived(
      scene => scene.sourceType as 'electrons' | 'neutrons' | 'heliumAtoms'
    );
    const particleMassDescriptionNode = new Node( {
      accessibleParagraph:
        QuantumWaveInterferenceFluent.a11y.particleMass.accessibleParagraph.createProperty( {
          sourceType: particleSourceTypeProperty
        } )
    } );
    model.sceneProperty.link( scene => {
      particleMassDescriptionNode.visible = scene.sourceType !== 'photons';
    } );
    this.addChild( particleMassDescriptionNode );

    // Heading nodes for PDOM navigation. Each groups related controls under a heading so screen reader users can jump
    // between major sections with heading shortcuts.
    const experimentSetupHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.experimentSetupHeadingStringProperty
    } );
    this.addChild( experimentSetupHeadingNode );

    const sourceHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.sourceHeadingStringProperty
    } );
    this.addChild( sourceHeadingNode );

    const slitsHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.slitsHeadingStringProperty
    } );
    this.addChild( slitsHeadingNode );

    const detectorScreenHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.detectorScreenHeadingStringProperty
    } );
    this.addChild( detectorScreenHeadingNode );

    // Play Area focus order, organized under headings for screen reader navigation
    experimentSetupHeadingNode.pdomOrder = [
      detectorScreenDescriptionNode,
      slitViewDescriptionNode,
      particleMassDescriptionNode,
      overheadEmitterNode.maxHitsReachedPanel
    ];

    sourceHeadingNode.pdomOrder = [
      overheadEmitterNode.laserPointerNode,
      overheadEmitterNode.particleEmitterNode,
      sourceControlPanel,
      sceneRadioButtonGroup
    ];

    slitsHeadingNode.pdomOrder = [ slitControlPanel ];

    detectorScreenHeadingNode.pdomOrder = [
      ...detectorScreenNodes.flatMap( ds => [
        ds.eraserButton,
        ds.snapshotButton,
        ds.viewSnapshotsButton
      ] ),
      screenSettingsPanel
    ];

    this.pdomPlayAreaNode.pdomOrder = [
      experimentSetupHeadingNode,
      sourceHeadingNode,
      slitsHeadingNode,
      detectorScreenHeadingNode,
      ...this.graphAccordionBoxes,
      ...rulerNodes,
      stopwatchNode
    ];

    // Control Area focus order. The ruler and stopwatch tools themselves remain in the Play Area,
    // while their visibility checkboxes stay in the Control Area.
    this.pdomControlAreaNode.pdomOrder = [
      rulerCheckbox,
      stopwatchCheckbox,
      timeControlNode,
      resetAllButton
    ];
  }

  /**
   * Resets the view.
   */
  private reset(): void {
    this.graphExpandedProperty.reset();
    this.graphAccordionBoxes.forEach( box => box.reset() );
    this.centerRulerOnDetectorScreen();
  }
}
