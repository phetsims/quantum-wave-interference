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
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import ExperimentScreenViewDescription from './description/ExperimentScreenViewDescription.js';
import DetectorRulerNode from './DetectorRulerNode.js';
import ExperimentDetectorColumnNode from './ExperimentDetectorColumnNode.js';
import ExperimentOverheadApparatusNode from './ExperimentOverheadApparatusNode.js';
import ExperimentScreenSummaryContent from './ExperimentScreenSummaryContent.js';
import ExperimentSlitColumnNode from './ExperimentSlitColumnNode.js';
import RulerCheckbox from './RulerCheckbox.js';
import StopwatchCheckbox from './StopwatchCheckbox.js';

type SelfOptions = EmptySelfOptions;

type ExperimentScreenViewOptions = SelfOptions & Pick<ScreenViewOptions, 'tandem'>;

const MIDDLE_COLUMN_LEFT_SHIFT = 3;

export default class ExperimentScreenView extends ScreenView {
  private readonly detectorColumnNode: ExperimentDetectorColumnNode;
  private readonly centerRulerOnDetectorScreen: () => void;

  public constructor( model: ExperimentModel, providedOptions: ExperimentScreenViewOptions ) {
    const options = optionize<ExperimentScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
        screenSummaryContent: new ExperimentScreenSummaryContent( model )
      },
      providedOptions );

    super( options );

    const overheadApparatusNode = new ExperimentOverheadApparatusNode( model, this.layoutBounds, options.tandem );
    this.addChild( overheadApparatusNode );

    const slitColumnNode = new ExperimentSlitColumnNode( model, this, options.tandem );
    this.addChild( slitColumnNode );

    this.detectorColumnNode = new ExperimentDetectorColumnNode(
      model,
      this.layoutBounds.maxX,
      () => overheadApparatusNode.startSnapshotFlash(),
      options.tandem
    );
    this.addChild( this.detectorColumnNode );
    overheadApparatusNode.setFrontFacingScreenBounds(
      this.detectorColumnNode.detectorScreenLeft,
      this.detectorColumnNode.detectorScreenRight
    );

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: options.tandem.createTandem( 'sourceControlPanel' )
    } );
    sourceControlPanel.left = overheadApparatusNode.overheadEmitterNode.laserPointerNode.left;
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

    const stopwatchCheckbox = new StopwatchCheckbox( model.stopwatch.isVisibleProperty, {
      tandem: options.tandem.createTandem( 'stopwatchCheckbox' )
    } );
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

    const bottomRowLeft = this.detectorColumnNode.bottomControlsLeft;
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
    slitColumnNode.slitControlPanel.bottom = checkboxGroup.bottom + 2;

    // Draggable ruler. The ruler's horizontal scale is calibrated to the active detector screen: its full width maps to
    // the scene's full detector width in mm.
    const rulerNodesTandem = options.tandem.createTandem( 'rulerNodes' );
    const rulerNodes = model.scenes.map( ( scene, index ) => {
      const rulerNode = new DetectorRulerNode(
        scene,
        model.sceneProperty,
        model.isRulerVisibleProperty,
        model.detectorScreenScaleIndexProperty,
        model.rulerPositionProperty,
        this.visibleBoundsProperty,
        this.detectorColumnNode.graphExpandedProperty,
        this.detectorColumnNode.detectorScreenNodes[ index ],
        this.detectorColumnNode.graphAccordionBoxes[ index ],
        this,
        rulerNodesTandem.createTandem( `rulerNode${index}` )
      );
      this.addChild( rulerNode );
      return rulerNode;
    } );
    this.centerRulerOnDetectorScreen = () => {
      const activeSceneIndex = model.scenes.indexOf( model.sceneProperty.value );
      rulerNodes[ activeSceneIndex ].centerRulerOnDetectorScreen();
    };
    this.centerRulerOnDetectorScreen();

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
        stopwatchCheckbox.labelNode.localToGlobalBounds( stopwatchCheckbox.labelNode.localBounds )
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
      experimentScreenViewDescription.experimentSetupHeadingNode,
      experimentScreenViewDescription.sourceHeadingNode,
      experimentScreenViewDescription.slitsHeadingNode,
      experimentScreenViewDescription.detectorScreenHeadingNode,
      ...this.detectorColumnNode.graphAccordionBoxes,
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
    this.detectorColumnNode.reset();
    this.centerRulerOnDetectorScreen();
  }

}
