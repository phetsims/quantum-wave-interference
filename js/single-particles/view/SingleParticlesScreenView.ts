// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesScreenView is the top-level view for the Single Particles screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type ObstacleType } from '../../common/model/ObstacleType.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SnapshotButton from '../../common/view/SnapshotButton.js';
import SnapshotsDialog from '../../common/view/SnapshotsDialog.js';
import ViewSnapshotsButton from '../../common/view/ViewSnapshotsButton.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';
import { type SingleParticlesSlitConfiguration } from '../model/SingleParticlesSceneModel.js';
import DetectorToolNode from './DetectorToolNode.js';
import SingleParticlesDetectorScreenNode from './SingleParticlesDetectorScreenNode.js';
import SingleParticlesSourceControlPanel from './SingleParticlesSourceControlPanel.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const TITLE_FONT = new PhetFont( { size: 14, weight: 'bold' } );
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

    // --- Left controls ---

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

    const obstacleComboBoxItems: ComboBoxItem<ObstacleType>[] = [
      { value: 'none', createNode: () => new Text( QuantumWaveInterferenceFluent.noneStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'noneItem' },
      { value: 'doubleSlit', createNode: () => new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'doubleSlitItem' }
    ];

    const obstacleTitle = new Text( QuantumWaveInterferenceFluent.obstacleStringProperty, {
      font: TITLE_FONT,
      maxWidth: 120
    } );

    const obstacleComboBox = new ComboBox( model.currentObstacleTypeProperty, obstacleComboBoxItems, this, {
      tandem: tandem.createTandem( 'obstacleComboBox' ),
      xMargin: 10,
      yMargin: 6
    } );

    const obstacleSection = new VBox( {
      spacing: 6,
      align: 'left',
      children: [ obstacleTitle, obstacleComboBox ]
    } );

    const slitControlsNode = this.createSlitControls( model, tandem );
    model.currentObstacleTypeProperty.link( obstacleType => {
      slitControlsNode.visible = obstacleType === 'doubleSlit';
    } );

    const leftControlsVBox = new VBox( {
      spacing: 16,
      align: 'left',
      children: [ sourceControlPanel, autoRepeatCheckbox, sceneRadioButtonGroup, obstacleSection, slitControlsNode ]
    } );
    leftControlsVBox.left = X_MARGIN;
    leftControlsVBox.top = Y_MARGIN;
    this.addChild( leftControlsVBox );

    // --- Center: wave visualization region and detector screen ---

    const waveRegionLeft = leftControlsVBox.right + 20;
    const waveRegionTop = Y_MARGIN + 30;

    this.waveVisualizationNode = new WaveVisualizationNode( model.sceneProperty, {
      x: waveRegionLeft,
      y: waveRegionTop
    } );
    this.addChild( this.waveVisualizationNode );

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

    // --- Right controls ---

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

    const brightnessLabel = new Text( QuantumWaveInterferenceFluent.screenBrightnessStringProperty, {
      font: LABEL_FONT,
      maxWidth: 140
    } );
    const brightnessRange = new Range( 0, QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX );
    const brightnessSlider = new HSlider( model.currentScreenBrightnessProperty, brightnessRange, {
      trackSize: new Dimension2( 130, 3 ),
      thumbSize: new Dimension2( 13, 22 ),
      majorTickLength: 12,
      createAriaValueText: value => percentUnit.getAccessibleString(
        value / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX * 100,
        { decimalPlaces: 0, showTrailingZeros: false, showIntegersAsIntegers: true }
      ),
      tandem: tandem.createTandem( 'brightnessSlider' )
    } );
    const brightnessControl = new VBox( {
      spacing: 2,
      children: [ brightnessLabel, brightnessSlider ]
    } );

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

    // --- Tools panel ---

    const createToolCheckbox = ( property: BooleanProperty, stringProperty: TReadOnlyProperty<string>, tandemName: string ) => {
      const label = new Text( stringProperty, { font: LABEL_FONT, maxWidth: 120 } );
      return new Checkbox( property, label, {
        boxWidth: 16,
        spacing: 6,
        tandem: tandem.createTandem( tandemName )
      } );
    };

    const hitsGraphCheckbox = createToolCheckbox(
      model.isHitsGraphVisibleProperty,
      QuantumWaveInterferenceFluent.hitsGraphStringProperty,
      'hitsGraphCheckbox'
    );
    const tapeMeasureCheckbox = createToolCheckbox(
      model.isTapeMeasureVisibleProperty,
      QuantumWaveInterferenceFluent.tapeMeasureStringProperty,
      'tapeMeasureCheckbox'
    );
    const stopwatchCheckbox = createToolCheckbox(
      model.isStopwatchVisibleProperty,
      QuantumWaveInterferenceFluent.stopwatchStringProperty,
      'stopwatchCheckbox'
    );
    const timePlotCheckbox = createToolCheckbox(
      model.isTimePlotVisibleProperty,
      QuantumWaveInterferenceFluent.timePlotStringProperty,
      'timePlotCheckbox'
    );
    const positionPlotCheckbox = createToolCheckbox(
      model.isPositionPlotVisibleProperty,
      QuantumWaveInterferenceFluent.positionPlotStringProperty,
      'positionPlotCheckbox'
    );
    const detectorCheckbox = createToolCheckbox(
      model.isDetectorToolVisibleProperty,
      QuantumWaveInterferenceFluent.detectorStringProperty,
      'detectorCheckbox'
    );

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

    // --- Wave display combo box ---

    const waveDisplaySection = this.createWaveDisplaySection( model, tandem );

    // --- Time controls ---

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

    // --- Reset All ---

    const resetAllButton = new ResetAllButton( {
      listener: () => {
        model.reset();
      },
      tandem: tandem.createTandem( 'resetAllButton' )
    } );

    // --- Right column layout ---

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

    // --- Stopwatch ---

    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty,
      tandem: tandem.createTandem( 'stopwatchNode' )
    } );
    this.addChild( stopwatchNode );

    // Time plot tool
    this.timePlotNode = new TimePlotNode(
      model.sceneProperty,
      waveRegionLeft,
      waveRegionTop,
      model.isTimePlotVisibleProperty
    );
    this.addChild( this.timePlotNode );

    // Position plot tool
    this.positionPlotNode = new PositionPlotNode(
      model.sceneProperty,
      waveRegionLeft,
      waveRegionTop,
      model.isPositionPlotVisibleProperty
    );
    this.addChild( this.positionPlotNode );
  }

  public override step( dt: number ): void {
    super.step( dt );
    this.waveVisualizationNode.step();
    this.detectorScreenNode.step();
    this.timePlotNode.step( dt );
    this.positionPlotNode.step();
  }

  private createSlitControls( model: SingleParticlesModel, tandem: Tandem ): Node {
    const slitConfigTitle = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
      font: TITLE_FONT,
      maxWidth: 150
    } );

    const slitConfigItems: ComboBoxItem<SingleParticlesSlitConfiguration>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.topCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topCoveredItem' },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomCoveredItem' }
    ];

    const slitConfigurationComboBox = new ComboBox( model.currentSlitConfigurationProperty, slitConfigItems, this, {
      tandem: tandem.createTandem( 'slitConfigurationComboBox' ),
      xMargin: 10,
      yMargin: 6
    } );

    const slitSeparationTitle = new Text( QuantumWaveInterferenceFluent.slitSeparationStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150
    } );

    const slitSeparationSlider = new HSlider(
      model.currentSlitSeparationProperty,
      model.photonsScene.slitSeparationRange,
      {
        trackSize: new Dimension2( 130, 3 ),
        thumbSize: new Dimension2( 13, 22 ),
        tandem: tandem.createTandem( 'slitSeparationSlider' )
      }
    );

    return new VBox( {
      spacing: 10,
      align: 'left',
      children: [ slitConfigTitle, slitConfigurationComboBox, slitSeparationTitle, slitSeparationSlider ]
    } );
  }

  private createWaveDisplaySection( model: SingleParticlesModel, tandem: Tandem ): Node {
    const isPhotonsProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.sourceType === 'photons'
    );

    const waveDisplayTitleProperty = new DerivedProperty(
      [ isPhotonsProperty, QuantumWaveInterferenceFluent.waveDisplayStringProperty, QuantumWaveInterferenceFluent.waveFunctionDisplayStringProperty ],
      ( isPhotons, waveDisplay, waveFunctionDisplay ) =>
        isPhotons ? waveDisplay : waveFunctionDisplay
    );

    const waveDisplayTitle = new Text( waveDisplayTitleProperty, {
      font: TITLE_FONT,
      maxWidth: 170
    } );

    const photonWaveDisplayItems: ComboBoxItem<PhotonWaveDisplayMode>[] = [
      { value: 'timeAveragedIntensity', createNode: () => new Text( QuantumWaveInterferenceFluent.timeAveragedIntensityStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'timeAveragedIntensityItem' },
      { value: 'electricField', createNode: () => new Text( QuantumWaveInterferenceFluent.electricFieldStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'electricFieldItem' }
    ];

    const photonWaveDisplayComboBox = new ComboBox(
      model.currentPhotonWaveDisplayModeProperty,
      photonWaveDisplayItems,
      this,
      { tandem: tandem.createTandem( 'photonWaveDisplayComboBox' ), xMargin: 10, yMargin: 6 }
    );

    const matterWaveDisplayItems: ComboBoxItem<MatterWaveDisplayMode>[] = [
      { value: 'magnitude', createNode: () => new Text( QuantumWaveInterferenceFluent.magnitudeStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'magnitudeItem' },
      { value: 'realPart', createNode: () => new Text( QuantumWaveInterferenceFluent.realPartStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'realPartItem' },
      { value: 'imaginaryPart', createNode: () => new Text( QuantumWaveInterferenceFluent.imaginaryPartStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'imaginaryPartItem' }
    ];

    const matterWaveDisplayComboBox = new ComboBox(
      model.currentMatterWaveDisplayModeProperty,
      matterWaveDisplayItems,
      this,
      { tandem: tandem.createTandem( 'matterWaveDisplayComboBox' ), xMargin: 10, yMargin: 6 }
    );

    isPhotonsProperty.link( isPhotons => {
      photonWaveDisplayComboBox.visible = isPhotons;
      matterWaveDisplayComboBox.visible = !isPhotons;
    } );

    const comboBoxContainer = new Node( {
      children: [ photonWaveDisplayComboBox, matterWaveDisplayComboBox ],
      excludeInvisibleChildrenFromBounds: false
    } );

    return new VBox( {
      spacing: 6,
      align: 'left',
      children: [ waveDisplayTitle, comboBoxContainer ]
    } );
  }
}
