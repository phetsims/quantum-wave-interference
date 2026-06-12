// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenView is the top-level view for the Quantum Wave Interference simulation. It contains three visual
 * "rows": the top row with the emitter, double slit, and detector screen in overhead perspective;
 * the middle row with controls and front-facing views; and the bottom row with scene selectors, slit controls,
 * and screen settings.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import GatedEnabledProperty from '../../../../axon/js/GatedEnabledProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import ExperimentScreenViewDescription from './description/ExperimentScreenViewDescription.js';
import DetectorRulerNode from './DetectorRulerNode.js';
import ExperimentDetectorColumnNode from './ExperimentDetectorColumnNode.js';
import ExperimentOverheadApparatusNode from './ExperimentOverheadApparatusNode.js';
import ExperimentSlitColumnNode from './ExperimentSlitColumnNode.js';
import RulerCheckbox from './RulerCheckbox.js';

type SelfOptions = EmptySelfOptions;

type ExperimentScreenViewOptions = SelfOptions & Pick<ScreenViewOptions, 'tandem'>;

/**
 * A point-in-time snapshot of the Experiment screen's full semantic state, returned by getAccessibleState() and
 * consumed by the interact-daemon (agent-facing accessibility layer) to answer questions about the current
 * simulation state. All physical quantities use the units indicated by their field names (nm, mm, m, etc.).
 */
type ExperimentAccessibleState = {
  sourceType: string;
  isPlaying: boolean;
  timeSpeed: string;
  isEmitting: boolean;
  isEmitterEnabled: boolean;
  isMaxHitsReached: boolean;
  detectionMode: string;
  slitConfiguration: string;
  wavelengthNM: number;
  particleSpeedMetersPerSecond: number;
  effectiveWavelengthMeters: number;
  slitSeparationMM: number;
  screenDistanceMeters: number;
  screenBrightnessPercent: number;
  totalHits: number;
  leftDetectorHits: number;
  rightDetectorHits: number;
  numberOfSnapshots: number;
  detectorScreenScaleIndex: number;
  tools: {
    ruler: boolean;
  };
};

const MIDDLE_COLUMN_LEFT_SHIFT = 3;
const BOTTOM_CONTROLS_SPACING = 15;
const TOOL_CHECKBOX_SPACING = 6;
const SLIT_CONTROL_PANEL_BOTTOM_MARGIN = 2;

export default class ExperimentScreenView extends ScreenView {
  private readonly model: ExperimentModel;
  private readonly detectorColumnNode: ExperimentDetectorColumnNode;
  private readonly centerRulerOnDetectorScreen: () => void;

  public constructor( model: ExperimentModel, providedOptions: ExperimentScreenViewOptions ) {
    const options = optionize<ExperimentScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
        screenSummaryContent: new QuantumWaveInterferenceScreenSummaryContent(
          model,
          model.currentSlitSettingProperty,
          {
            detectionMode: model.currentDetectionModeProperty
          }
        )
      },
      providedOptions );

    super( options );

    this.model = model;
    const scenesTandem = options.tandem.createTandem( 'scenes' );
    const sceneTandems = new Map<object, Tandem>( model.scenes.map( scene => [
      scene,
      scenesTandem.createTandem( `${scene.sourceType}Scene` )
    ] ) );

    const overheadApparatusNode = new ExperimentOverheadApparatusNode( model, this.layoutBounds, sceneTandems, options.tandem );
    this.addChild( overheadApparatusNode );

    const slitColumnNode = new ExperimentSlitColumnNode( model.sceneProperty, model.scenes, this, sceneTandems, options.tandem );
    this.addChild( slitColumnNode );

    this.detectorColumnNode = new ExperimentDetectorColumnNode(
      model,
      this.layoutBounds.maxX,
      () => overheadApparatusNode.startSnapshotFlash(),
      sceneTandems,
      options.tandem
    );
    this.addChild( this.detectorColumnNode );
    overheadApparatusNode.setFrontFacingScreenBounds(
      this.detectorColumnNode.detectorScreenLeft,
      this.detectorColumnNode.detectorScreenRight
    );

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, sceneTandems, {
      tandem: options.tandem.createTandem( 'sourceControlPanel' )
    } );
    sourceControlPanel.left = overheadApparatusNode.overheadEmitterNode.getActiveEmitterNode().left;
    this.addChild( sourceControlPanel );

    const updateSourceControlPanelPosition = () => {
      sourceControlPanel.top = QuantumWaveInterferenceConstants.SOURCE_CONTROL_PANEL_TOP;
    };
    model.sceneProperty.link( updateSourceControlPanelPosition );

    const updateEmitterAlignment = () => {
      overheadApparatusNode.setEmitterCenterX( sourceControlPanel.centerX );
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
      options.tandem.createTandem( 'sceneRadioButtonGroup' ), {
        createAccessibleContextResponse: scene => QuantumWaveInterferenceFluent.a11y.sceneRadioButtonGroup.accessibleContextResponse.createProperty( {
          sourceType: scene.sourceType,
          isEmitting: scene.isEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' ),
          isMaxHitsReached: scene.isMaxHitsReachedProperty.derived( isMaxHitsReached => isMaxHitsReached ? 'true' : 'false' )
        } )
      }
    );
    sceneRadioButtonGroup.centerX = sourceControlPanel.centerX;
    sceneRadioButtonGroup.centerY = QuantumWaveInterferenceConstants.SCENE_BUTTON_GROUP_CENTER_Y;
    this.addChild( sceneRadioButtonGroup );

    // Center the slit-view/slit-panel middle column between the left and right columns.
    const leftColumnRight = Math.max( sourceControlPanel.right, sceneRadioButtonGroup.right );
    const rightColumnLeft = this.detectorColumnNode.detectorScreenLeft;
    const middleColumnCenterX = ( leftColumnRight + rightColumnLeft ) / 2 - MIDDLE_COLUMN_LEFT_SHIFT;
    slitColumnNode.setColumnCenterX( middleColumnCenterX );
    overheadApparatusNode.setSlitCenterX( middleColumnCenterX );

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

    const rulerCheckbox = new RulerCheckbox( model.isRulerVisibleProperty, {
      tandem: options.tandem.createTandem( 'rulerCheckbox' )
    } );
    this.addChild( rulerCheckbox );

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

    const eraserButtonTandem = options.tandem.createTandem( 'eraserButton' );
    const eraserButtonVisibleProperty = new GatedVisibleProperty(
      model.currentDetectionModeProperty.derived( detectionMode => detectionMode === 'hits' ),
      eraserButtonTandem
    );
    const clearScreenContextResponseProperty =
      QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleContextResponse.createProperty( {
        isEmitting: model.currentIsEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' ),
        isPlaying: model.isPlayingProperty.derived( isPlaying => isPlaying ? 'true' : 'false' )
      } );

    const eraserButton = new EraserButton( {
      iconWidth: QuantumWaveInterferenceConstants.ERASER_BUTTON_ICON_WIDTH,
      minWidth: QuantumWaveInterferenceConstants.ERASER_BUTTON_MIN_WIDTH,
      minHeight: QuantumWaveInterferenceConstants.ERASER_BUTTON_MIN_HEIGHT,
      yMargin: 0,
      listener: () => model.sceneProperty.value.clearScreen(),
      touchAreaXDilation: 5,
      touchAreaYDilation: 5,
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty,
      accessibleContextResponse: clearScreenContextResponseProperty,
      tandem: eraserButtonTandem,
      visibleProperty: eraserButtonVisibleProperty
    } );
    this.addChild( eraserButton );

    rulerCheckbox.left = this.detectorColumnNode.bottomControlsLeft;
    eraserButton.right = resetAllButton.left - BOTTOM_CONTROLS_SPACING;

    // Center time controls on the detector graph instead of spacing them from the ruler checkbox. This leaves a
    // stable gap for the eraser button while preserving the visual relationship with the graph below the screen.
    timeControlNode.centerX = this.detectorColumnNode.graphAccordionBoxes[ 0 ].centerX;

    resetAllButton.right = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
    eraserButton.centerY = resetAllButton.centerY;
    timeControlNode.centerY = resetAllButton.centerY;
    rulerCheckbox.centerY = resetAllButton.centerY;

    // Preserve the slit control panel position from when two tool checkboxes were centered in this row. Reapply this
    // bottom anchor whenever panel contents are hidden or shown through PhET-iO.
    ManualConstraint.create(
      this,
      [ slitColumnNode.slitControlPanel, resetAllButton, rulerCheckbox ],
      ( slitControlPanelProxy, resetAllButtonProxy, rulerCheckboxProxy ) => {
        const previousToolCheckboxGroupBottom =
          resetAllButtonProxy.centerY + rulerCheckboxProxy.height + TOOL_CHECKBOX_SPACING / 2;
        slitControlPanelProxy.bottom =
          previousToolCheckboxGroupBottom + SLIT_CONTROL_PANEL_BOTTOM_MARGIN;
      }
    );

    // Draggable ruler. The ruler's horizontal scale is calibrated to the active detector screen: its full width maps to
    // the scene's full detector width in mm.
    const rulerNode = new DetectorRulerNode(
      model.sceneProperty,
      model.scenes,
      model.isRulerVisibleProperty,
      model.detectorScreenScaleIndexProperty,
      model.rulerPositionProperty,
      this.visibleBoundsProperty,
      this.detectorColumnNode.graphExpandedProperty,
      this.detectorColumnNode.detectorScreenNodes,
      this.detectorColumnNode.graphAccordionBoxes,
      this,
      options.tandem.createTandem( 'rulerNode' )
    );
    this.addChild( rulerNode );
    this.centerRulerOnDetectorScreen = () => rulerNode.centerRulerOnDetectorScreen();
    this.centerRulerOnDetectorScreen();

    const experimentScreenViewDescription = new ExperimentScreenViewDescription(
      model,
      overheadApparatusNode.overheadEmitterNode,
      sourceControlPanel,
      sceneRadioButtonGroup,
      slitColumnNode.slitControlPanel,
      this.detectorColumnNode.getDetectorScreenButtonNodes(),
      this.detectorColumnNode.screenSettingsPanel
    );
    this.addChild( experimentScreenViewDescription );

    this.pdomPlayAreaNode.pdomOrder = [
      experimentScreenViewDescription.detectorScreenAndExperimentDetailsHeadingNode,
      experimentScreenViewDescription.sourceHeadingNode,
      experimentScreenViewDescription.slitsHeadingNode,
      experimentScreenViewDescription.detectorScreenHeadingNode,
      ...this.detectorColumnNode.graphAccordionBoxes,
      rulerNode
    ];

    // Control Area focus order. The ruler remains in the Play Area, while its visibility checkbox stays in the
    // Control Area.
    this.pdomControlAreaNode.pdomOrder = [
      rulerCheckbox,
      timeControlNode,
      eraserButton,
      resetAllButton
    ];
  }

  /**
   * Gets authored semantic state for agent-facing accessibility snapshots.
   *
   * Called by the Description Editor
   *
   * @returns current Experiment screen accessibility state
   */
  private getAccessibleState(): ExperimentAccessibleState {
    const scene = this.model.sceneProperty.value;

    // NOTE: see other duplicate in quantum-wave-interference/js/single-particles/view/SingleParticlesScreenView.ts.
    // These common accessible-state fields stay inline because the screens expose different authored state shapes.
    return {
      sourceType: scene.sourceType,
      isPlaying: this.model.isPlayingProperty.value,
      timeSpeed: this.model.timeSpeedProperty.value.name,
      isEmitting: this.model.currentIsEmittingProperty.value,
      isEmitterEnabled: this.model.currentIsEmitterEnabledProperty.value,
      isMaxHitsReached: this.model.currentIsMaxHitsReachedProperty.value,
      detectionMode: this.model.currentDetectionModeProperty.value,
      slitConfiguration: this.model.currentSlitSettingProperty.value,
      wavelengthNM: this.model.currentWavelengthProperty.value,
      particleSpeedMetersPerSecond: this.model.currentParticleSpeedProperty.value,
      effectiveWavelengthMeters: scene.getEffectiveWavelength(),
      slitSeparationMM: this.model.currentSlitSeparationProperty.value,
      screenDistanceMeters: this.model.currentScreenDistanceProperty.value,
      screenBrightnessPercent: this.model.currentScreenBrightnessProperty.value,
      totalHits: this.model.currentTotalHitsProperty.value,
      leftDetectorHits: this.model.currentLeftDetectorHitsProperty.value,
      rightDetectorHits: this.model.currentRightDetectorHitsProperty.value,
      numberOfSnapshots: scene.numberOfSnapshotsProperty.value,
      detectorScreenScaleIndex: this.model.detectorScreenScaleIndexProperty.value,
      tools: {
        ruler: this.model.isRulerVisibleProperty.value
      }
    };
  }

  /**
   * Resets the view.
   */
  private reset(): void {
    this.detectorColumnNode.reset();
    this.centerRulerOnDetectorScreen();
  }

}
