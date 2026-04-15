// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesScreenView is the top-level view for the Single Particles screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Panel from '../../../../sun/js/Panel.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import createBrightnessControl from '../../common/view/createBrightnessControl.js';
import createMeasurementToolNodes from '../../common/view/createMeasurementToolNodes.js';
import createObstacleControlsRow from '../../common/view/createObstacleControlsRow.js';
import createToolCheckbox from '../../common/view/createToolCheckbox.js';
import createWaveDisplaySection from '../../common/view/createWaveDisplaySection.js';
import DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SnapshotButton from '../../common/view/SnapshotButton.js';
import SnapshotsDialog from '../../common/view/SnapshotsDialog.js';
import ViewSnapshotsButton from '../../common/view/ViewSnapshotsButton.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';
import SingleParticlesSceneModel, { type SingleParticlesSlitConfiguration } from '../model/SingleParticlesSceneModel.js';
import DetectorToolNode from './DetectorToolNode.js';
import SingleParticleEmitterNode from './SingleParticleEmitterNode.js';
import SingleParticlesDetectorScreenNode from './SingleParticlesDetectorScreenNode.js';
import SingleParticlesSourceControlPanel from './SingleParticlesSourceControlPanel.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
const RIGHT_PANEL_WIDTH = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH;
const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const DETECTOR_SCREEN_SKEW = QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW;

export default class SingleParticlesScreenView extends ScreenView {

  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: SingleParticlesDetectorScreenNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: SingleParticlesModel, providedOptions: SingleParticlesScreenViewOptions ) {
    const options = optionize<SingleParticlesScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    const tandem = options.tandem;

    const sourceControlPanel = new SingleParticlesSourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: tandem.createTandem( 'sourceControlPanel' )
    } );

    const autoRepeatCheckbox = new Checkbox(
      model.currentAutoRepeatProperty,
      new Text( QuantumWaveInterferenceFluent.autoRepeatStringProperty, { font: LABEL_FONT, maxWidth: 120 } ),
      {
        boxWidth: 16,
        spacing: 6,
        tandem: tandem.createTandem( 'autoRepeatCheckbox' )
      }
    );

    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      tandem.createTandem( 'sceneRadioButtonGroup' )
    );

    const leftControlsVBox = new VBox( {
      spacing: 16,
      align: 'left',
      children: [ sourceControlPanel, autoRepeatCheckbox, sceneRadioButtonGroup ]
    } );
    leftControlsVBox.left = X_MARGIN;
    leftControlsVBox.top = Y_MARGIN;
    this.addChild( leftControlsVBox );

    const waveRegionLeft = leftControlsVBox.right + 20;
    const waveRegionTop = Y_MARGIN + 30;

    this.waveVisualizationNode = new WaveVisualizationNode( model.sceneProperty, {
      x: waveRegionLeft,
      y: waveRegionTop
    } );
    this.addChild( this.waveVisualizationNode );

    // Emitter source with SingleParticleEmitter.svg image and red toggle button
    const isEmitterEnabledProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( model.sceneProperty, {
      derive: scene => scene.isEmitterEnabledProperty
    } );

    const emitterNode = new SingleParticleEmitterNode(
      model.currentIsEmittingProperty,
      isEmitterEnabledProperty,
      {
        tandem: tandem.createTandem( 'emitterNode' )
      }
    );

    // Position emitter so its right (nozzle) side overlaps the left edge of the wave region
    emitterNode.right = waveRegionLeft + 4;
    emitterNode.centerY = waveRegionTop + QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT / 2;
    this.addChild( emitterNode );

    // Double slit obstacle visualization overlaid on the wave region
    const slitSeparationRangeProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.slitSeparationRange
    );

    const doubleSlitNode = new DoubleSlitNode(
      model.currentObstacleTypeProperty,
      model.currentSlitPositionFractionProperty,
      model.currentSlitSeparationProperty,
      slitSeparationRangeProperty,
      {
        isTopSlitCoveredProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => slitConfig === 'leftCovered'
        ),
        isBottomSlitCoveredProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => slitConfig === 'rightCovered'
        ),
        x: waveRegionLeft,
        y: waveRegionTop
      }
    );
    this.addChild( doubleSlitNode );

    this.detectorScreenNode = new SingleParticlesDetectorScreenNode( model, {
      x: waveRegionLeft + WAVE_REGION_WIDTH - DETECTOR_SCREEN_SKEW / 2,
      y: waveRegionTop
    } );
    this.addChild( this.detectorScreenNode );

    const slitConfigItems: ComboBoxItem<SingleParticlesSlitConfiguration>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.topCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topCoveredItem' },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomCoveredItem' }
    ];

    const bottomRow = createObstacleControlsRow(
      model.currentObstacleTypeProperty,
      model.currentSlitConfigurationProperty,
      slitConfigItems,
      model.sceneProperty,
      model.scenes,
      waveRegionTop,
      this,
      tandem
    );
    this.addChild( bottomRow );

    // Hits graph (always in Hits mode on this screen)
    const sidewaysGraphNode = new SidewaysGraphNode( model.sceneProperty, {
      axisLabelStringProperty: QuantumWaveInterferenceFluent.countStringProperty,
      tandem: tandem.createTandem( 'sidewaysGraphNode' )
    } );
    this.addChild( sidewaysGraphNode );

    model.isHitsGraphVisibleProperty.link( isVisible => {
      sidewaysGraphNode.visible = isVisible;
      if ( isVisible ) {
        this.detectorScreenNode.setScaleMagnitude( 0.5, 1 );
        sidewaysGraphNode.left = this.detectorScreenNode.right + 2;
        sidewaysGraphNode.top = waveRegionTop;
      }
      else {
        this.detectorScreenNode.setScaleMagnitude( 1, 1 );
      }
    } );

    // Detector tool (draggable circle + panel, Single Particles only)
    const detectorToolNode = new DetectorToolNode(
      model,
      waveRegionLeft,
      waveRegionTop,
      tandem.createTandem( 'detectorToolNode' )
    );
    this.addChild( detectorToolNode );


    const eraseButton = new EraserButton( {
      listener: () => model.sceneProperty.value.clearScreen(),
      iconWidth: 20,
      tandem: tandem.createTandem( 'eraseButton' )
    } );

    const snapshotsDialog = new SnapshotsDialog(
      model.currentSnapshotsProperty,
      snapshot => model.deleteSnapshot( snapshot ),
      tandem.createTandem( 'snapshotsDialog' )
    );

    const snapshotButton = new SnapshotButton(
      model.currentNumberOfSnapshotsProperty,
      () => model.takeSnapshot(),
      () => { /* no-op */ },
      tandem.createTandem( 'snapshotButton' )
    );

    const viewSnapshotsButton = new ViewSnapshotsButton(
      model.currentNumberOfSnapshotsProperty,
      model.isPlayingProperty,
      snapshotsDialog,
      snapshotButton.width,
      eraseButton.height,
      tandem.createTandem( 'viewSnapshotsButton' )
    );

    const screenButtonsRow = new HBox( {
      spacing: 8,
      children: [ eraseButton, snapshotButton, viewSnapshotsButton ]
    } );

    const brightnessControl = createBrightnessControl( model.currentScreenBrightnessProperty, tandem );

    const screenControlsPanel = new Panel( new VBox( {
      spacing: 12,
      align: 'left',
      children: [ screenButtonsRow, brightnessControl ]
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 10,
      minWidth: RIGHT_PANEL_WIDTH
    } );


    const hitsGraphCheckbox = createToolCheckbox( model.isHitsGraphVisibleProperty, QuantumWaveInterferenceFluent.hitsGraphStringProperty, tandem.createTandem( 'hitsGraphCheckbox' ) );
    const tapeMeasureCheckbox = createToolCheckbox( model.isTapeMeasureVisibleProperty, QuantumWaveInterferenceFluent.tapeMeasureStringProperty, tandem.createTandem( 'tapeMeasureCheckbox' ) );
    const stopwatchCheckbox = createToolCheckbox( model.isStopwatchVisibleProperty, QuantumWaveInterferenceFluent.stopwatchStringProperty, tandem.createTandem( 'stopwatchCheckbox' ) );
    const timePlotCheckbox = createToolCheckbox( model.isTimePlotVisibleProperty, QuantumWaveInterferenceFluent.timePlotStringProperty, tandem.createTandem( 'timePlotCheckbox' ) );
    const positionPlotCheckbox = createToolCheckbox( model.isPositionPlotVisibleProperty, QuantumWaveInterferenceFluent.positionPlotStringProperty, tandem.createTandem( 'positionPlotCheckbox' ) );
    const detectorCheckbox = createToolCheckbox( model.isDetectorToolVisibleProperty, QuantumWaveInterferenceFluent.detectorStringProperty, tandem.createTandem( 'detectorCheckbox' ) );

    // Detector checkbox is only enabled when obstacle is None
    model.isDetectorToolAvailableProperty.link( ( isAvailable: boolean ) => {
      detectorCheckbox.enabled = isAvailable;
    } );

    const toolsPanel = new Panel( new VBox( {
      spacing: 8,
      align: 'left',
      children: [
        hitsGraphCheckbox,
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox,
        detectorCheckbox
      ]
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 10,
      minWidth: RIGHT_PANEL_WIDTH
    } );


    const waveDisplaySection = createWaveDisplaySection( model, this, tandem );


    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      timeSpeedProperty: model.timeSpeedProperty,
      timeSpeeds: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      flowBoxSpacing: 15,
      playPauseStepButtonOptions: {
        includeStepForwardButton: false,
        playPauseButtonOptions: { radius: 22 }
      },
      tandem: tandem.createTandem( 'timeControlNode' )
    } );


    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );


    const rightControlsVBox = new VBox( {
      spacing: 12,
      align: 'center',
      children: [
        screenControlsPanel,
        toolsPanel,
        waveDisplaySection,
        timeControlNode,
        resetAllButton
      ]
    } );
    rightControlsVBox.right = this.layoutBounds.maxX - X_MARGIN;
    rightControlsVBox.top = Y_MARGIN;
    this.addChild( rightControlsVBox );


    const toolNodes = createMeasurementToolNodes( model, this, this.visibleBoundsProperty, waveRegionLeft, waveRegionTop, tandem );
    this.timePlotNode = toolNodes.timePlotNode;
    this.positionPlotNode = toolNodes.positionPlotNode;
  }

  public override step( dt: number ): void {
    super.step( dt );
    this.waveVisualizationNode.step();
    this.detectorScreenNode.step();
    this.timePlotNode.step( dt );
    this.positionPlotNode.step();
  }
}
