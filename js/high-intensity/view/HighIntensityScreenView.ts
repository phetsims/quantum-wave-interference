// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityScreenView is the top-level view for the High Intensity screen. It contains:
 * - Left controls: source controls panel, scene radio buttons, obstacle combo box, slit controls
 * - Center: emitter source, wave visualization region (black rectangle), detector screen (skewed parallelogram)
 * - Right controls: screen controls (erase/camera/snapshots), detection mode, brightness,
 *   tools checkboxes, wave display combo box, time controls, reset all
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import EraserButton from '../../../../scenery-phet/js/buttons/EraserButton.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Slider from '../../../../sun/js/Slider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type ObstacleType } from '../../common/model/ObstacleType.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import { type MatterWaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import { type PhotonWaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import getMeasuringTapeUnits from '../../common/view/getMeasuringTapeUnits.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SnapshotButton from '../../common/view/SnapshotButton.js';
import SnapshotsDialog from '../../common/view/SnapshotsDialog.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import ViewSnapshotsButton from '../../common/view/ViewSnapshotsButton.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityConstants from '../HighIntensityConstants.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import HighIntensitySceneModel from '../model/HighIntensitySceneModel.js';
import HighIntensityDetectorScreenNode from './HighIntensityDetectorScreenNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const TITLE_FONT = new PhetFont( { size: 14, weight: 'bold' } );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;

const EMITTER_BODY_WIDTH = 70;
const EMITTER_BODY_HEIGHT = 32;
const EMITTER_NOZZLE_WIDTH = 14;
const EMITTER_NOZZLE_HEIGHT = 26;
const EMITTER_BUTTON_RADIUS = 12;

export default class HighIntensityScreenView extends ScreenView {

  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: HighIntensityDetectorScreenNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: HighIntensityModel, providedOptions: HighIntensityScreenViewOptions ) {
    const options = optionize<HighIntensityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    const tandem = options.tandem;

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: tandem.createTandem( 'sourceControlPanel' )
    } );

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

    // Slit controls (visible only when obstacle is double slit)
    const slitControlsNode = this.createSlitControls( model, tandem );
    model.currentObstacleTypeProperty.link( obstacleType => {
      slitControlsNode.visible = obstacleType === 'doubleSlit';
    } );

    const leftControlsVBox = new VBox( {
      spacing: 16,
      align: 'left',
      children: [ sourceControlPanel, sceneRadioButtonGroup, obstacleSection, slitControlsNode ]
    } );
    leftControlsVBox.left = X_MARGIN;
    leftControlsVBox.top = Y_MARGIN;
    this.addChild( leftControlsVBox );

    const waveRegionLeft = leftControlsVBox.right + 20;
    const waveRegionTop = Y_MARGIN + 30;

    // Emitter source with toggle button
    const isEmitterEnabledProperty = new DynamicProperty<boolean, boolean, HighIntensitySceneModel>( model.sceneProperty, {
      derive: scene => scene.isEmitterEnabledProperty
    } );

    const photonEmitterNode = new LaserPointerNode( model.currentIsEmittingProperty, {
      bodySize: new Dimension2( EMITTER_BODY_WIDTH, EMITTER_BODY_HEIGHT ),
      nozzleSize: new Dimension2( EMITTER_NOZZLE_WIDTH, EMITTER_NOZZLE_HEIGHT ),
      buttonOptions: {
        baseColor: 'red',
        radius: EMITTER_BUTTON_RADIUS
      },
      tandem: tandem.createTandem( 'photonEmitterNode' )
    } );

    const particleEmitterNode = new LaserPointerNode( model.currentIsEmittingProperty, {
      bodySize: new Dimension2( EMITTER_BODY_WIDTH, EMITTER_BODY_HEIGHT ),
      nozzleSize: new Dimension2( EMITTER_NOZZLE_WIDTH, EMITTER_NOZZLE_HEIGHT ),
      topColor: 'rgb(100, 120, 180)',
      bottomColor: 'rgb(30, 40, 80)',
      highlightColor: 'rgb(160, 180, 230)',
      buttonOptions: {
        baseColor: 'red',
        radius: EMITTER_BUTTON_RADIUS
      },
      hasGlass: true,
      visible: false,
      tandem: tandem.createTandem( 'particleEmitterNode' )
    } );

    const emitterContainer = new Node( {
      children: [ photonEmitterNode, particleEmitterNode ]
    } );

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
        isTopSlitDetectorProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => hasDetectorOnSide( slitConfig, 'left' )
        ),
        isBottomSlitDetectorProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => hasDetectorOnSide( slitConfig, 'right' )
        ),
        x: waveRegionLeft,
        y: waveRegionTop
      }
    );
    this.addChild( doubleSlitNode );

    // Position the emitter so its nozzle overlaps the left edge of the wave region (added after so it renders on top)
    emitterContainer.right = waveRegionLeft + 4;
    emitterContainer.centerY = waveRegionTop + HighIntensityConstants.WAVE_REGION_HEIGHT / 2;
    this.addChild( emitterContainer );

    // Toggle emitter visibility based on scene, and wire enabled state
    model.sceneProperty.link( scene => {
      const isPhoton = scene.sourceType === 'photons';
      photonEmitterNode.visible = isPhoton;
      particleEmitterNode.visible = !isPhoton;
    } );

    isEmitterEnabledProperty.link( isEnabled => {
      photonEmitterNode.enabled = isEnabled;
      particleEmitterNode.enabled = isEnabled;
    } );

    this.detectorScreenNode = new HighIntensityDetectorScreenNode( model, {
      x: waveRegionLeft + HighIntensityConstants.WAVE_REGION_WIDTH - HighIntensityConstants.DETECTOR_SCREEN_SKEW / 2,
      y: waveRegionTop
    } );
    this.addChild( this.detectorScreenNode );

    // Axis label changes between "Intensity" and "Count" depending on detection mode
    const graphAxisLabelProperty = new DerivedProperty(
      [
        model.currentDetectionModeProperty,
        QuantumWaveInterferenceFluent.intensityStringProperty,
        QuantumWaveInterferenceFluent.countStringProperty
      ],
      ( detectionMode, intensityString, countString ) =>
        detectionMode === 'hits' ? countString : intensityString
    );

    const sidewaysGraphNode = new SidewaysGraphNode( model.sceneProperty, {
      detectionModeProperty: model.currentDetectionModeProperty,
      axisLabelStringProperty: graphAxisLabelProperty,
      tandem: tandem.createTandem( 'sidewaysGraphNode' )
    } );
    this.addChild( sidewaysGraphNode );

    // When the graph is visible, shrink the detector screen horizontally to 50% and position the graph beside it
    model.isIntensityGraphVisibleProperty.link( isVisible => {
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

    const detectionModeItems: AquaRadioButtonGroupItem<DetectionMode>[] = [
      {
        value: 'averageIntensity',
        createNode: () => new Text( QuantumWaveInterferenceFluent.intensityStringProperty, { font: LABEL_FONT, maxWidth: 130 } ),
        tandemName: 'averageIntensityRadioButton'
      },
      {
        value: 'hits',
        createNode: () => new Text( QuantumWaveInterferenceFluent.hitsStringProperty, { font: LABEL_FONT, maxWidth: 130 } ),
        tandemName: 'hitsRadioButton'
      }
    ];

    const detectionModeRadioButtonGroup = new AquaRadioButtonGroup<DetectionMode>(
      model.currentDetectionModeProperty,
      detectionModeItems,
      {
        spacing: 8,
        align: 'left',
        orientation: 'vertical',
        radioButtonOptions: { radius: 7 },
        tandem: tandem.createTandem( 'detectionModeRadioButtonGroup' )
      }
    );

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
      children: [ screenButtonsRow, detectionModeRadioButtonGroup, brightnessControl ]
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 10,
      minWidth: HighIntensityConstants.RIGHT_PANEL_WIDTH
    } );

    const createToolCheckbox = ( property: BooleanProperty, stringProperty: TReadOnlyProperty<string>, tandemName: string ) => {
      const label = new Text( stringProperty, { font: LABEL_FONT, maxWidth: 120 } );
      return new Checkbox( property, label, {
        boxWidth: 16,
        spacing: 6,
        tandem: tandem.createTandem( tandemName )
      } );
    };

    const intensityGraphCheckbox = createToolCheckbox(
      model.isIntensityGraphVisibleProperty,
      QuantumWaveInterferenceFluent.intensityGraphStringProperty,
      'intensityGraphCheckbox'
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

    const toolsPanel = new Panel( new VBox( {
      spacing: 8,
      align: 'left',
      children: [
        intensityGraphCheckbox,
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox
      ]
    } ), {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 10,
      minWidth: HighIntensityConstants.RIGHT_PANEL_WIDTH
    } );

    const waveDisplaySection = this.createWaveDisplaySection( model, tandem );

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

    const stopwatchNode = new StopwatchNode( model.stopwatch, {
      dragBoundsProperty: this.visibleBoundsProperty,
      tandem: tandem.createTandem( 'stopwatchNode' )
    } );
    model.isStopwatchVisibleProperty.link( isVisible => {
      model.stopwatch.isVisibleProperty.value = isVisible;
    } );
    this.addChild( stopwatchNode );

    const measuringTapeUnitsProperty = new Property( getMeasuringTapeUnits( model.sceneProperty.value.sourceType, model.sceneProperty.value.regionWidth ) );
    model.sceneProperty.link( scene => {
      measuringTapeUnitsProperty.value = getMeasuringTapeUnits( scene.sourceType, scene.regionWidth );
    } );

    const measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
      textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
      textColor: 'black',
      basePositionProperty: model.tapeMeasureBasePositionProperty,
      tipPositionProperty: model.tapeMeasureTipPositionProperty,
      significantFigures: 2,
      tandem: tandem.createTandem( 'measuringTapeNode' )
    } );
    this.visibleBoundsProperty.link( visibleBounds => measuringTapeNode.setDragBounds( visibleBounds.eroded( 20 ) ) );
    model.isTapeMeasureVisibleProperty.linkAttribute( measuringTapeNode, 'visible' );
    this.addChild( measuringTapeNode );

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

  /**
   * Creates the slit controls (slit configuration combo box + slit separation slider).
   */
  private createSlitControls( model: HighIntensityModel, tandem: Tandem ): Node {
    const slitConfigTitle = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
      font: TITLE_FONT,
      maxWidth: 150
    } );

    const slitConfigItems: ComboBoxItem<SlitConfiguration>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.topCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topCoveredItem' },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomCoveredItem' },
      { value: 'leftDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.topDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topDetectorItem' },
      { value: 'rightDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomDetectorItem' },
      { value: 'bothDetectors', createNode: () => new Text( QuantumWaveInterferenceFluent.bothDetectorsStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothDetectorsItem' }
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

    const slitSeparationRangeProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.slitSeparationRange
    );

    const slitSeparationSlider = new Slider(
      model.currentSlitSeparationProperty,
      slitSeparationRangeProperty,
      {
        orientation: Orientation.HORIZONTAL,
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

  /**
   * Creates the wave display combo box section.
   */
  private createWaveDisplaySection( model: HighIntensityModel, tandem: Tandem ): Node {
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
