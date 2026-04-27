// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesScreenView is the top-level view for the Single Particles screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import createMeasurementToolNodes from '../../common/view/createMeasurementToolNodes.js';
import createObstacleControlsSection from '../../common/view/createObstacleControlsSection.js';
import createObstacleControlsRow from '../../common/view/createObstacleControlsRow.js';
import createRightControlsColumn from '../../common/view/createRightControlsColumn.js';
import createToolCheckbox from '../../common/view/createToolCheckbox.js';
import createWaveRegionNodes from '../../common/view/createWaveRegionNodes.js';
import ToolIcons from '../../common/view/ToolIcons.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import createSidewaysGraph from '../../common/view/createSidewaysGraph.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';
import SingleParticlesSceneModel, { type SingleParticlesSlitConfiguration } from '../model/SingleParticlesSceneModel.js';
import DetectorToolNode from './DetectorToolNode.js';
import SingleParticleEmitterNode from './SingleParticleEmitterNode.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const CONTENT_VERTICAL_OFFSET = 12;
const TOP_ROW_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const SOURCE_TO_SCENE_CONTROLS_SPACING = 40;
const SCENE_TO_OBSTACLE_CONTROLS_SPACING = 36;
const CALLOUT_GAP = 55;
const SCENE_AND_OBSTACLE_Y_OFFSET = 10;
const SCENE_BUTTON_GROUP_Y_OFFSET = 10;
const WAVE_REGION_Y_OFFSET = -30;

type HighIntensityReferenceScene = {
  sourceType: SingleParticlesSceneModel[ 'sourceType' ];
  wavelengthProperty: SingleParticlesSceneModel[ 'wavelengthProperty' ];
  velocityProperty: SingleParticlesSceneModel[ 'velocityProperty' ];
  velocityRange: SingleParticlesSceneModel[ 'velocityRange' ];
  intensityProperty: NumberProperty;
};


export default class SingleParticlesScreenView extends ScreenView {

  private readonly model: SingleParticlesModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly sidewaysGraphNode: SidewaysGraphNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: SingleParticlesModel, providedOptions: SingleParticlesScreenViewOptions ) {
    const options = optionize<SingleParticlesScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;

    const autoRepeatCheckbox = new Checkbox(
      model.currentAutoRepeatProperty,
      new Text( QuantumWaveInterferenceFluent.autoRepeatStringProperty, { font: LABEL_FONT, maxWidth: 120 } ),
      {
        boxWidth: 16,
        spacing: 6,
        tandem: tandem.createTandem( 'autoRepeatCheckbox' )
      }
    );

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: tandem.createTandem( 'sourceControlPanel' ),
      additionalContent: autoRepeatCheckbox
    } );

    // Match the left-column geometry used on High Intensity so the scene buttons, obstacle controls,
    // wave region, detector screen, and graph land on the same coordinates.
    const highIntensityReferenceScenes: HighIntensityReferenceScene[] = model.scenes.map( scene => ( {
      sourceType: scene.sourceType,
      wavelengthProperty: scene.wavelengthProperty,
      velocityProperty: scene.velocityProperty,
      velocityRange: scene.velocityRange,
      intensityProperty: new NumberProperty( 0.5, {
        range: new Range( 0, 1 )
      } )
    } ) );
    const highIntensityReferenceSceneProperty = new Property( highIntensityReferenceScenes[ 0 ] );
    const highIntensityReferenceSourceControlPanel = new SourceControlPanel(
      highIntensityReferenceSceneProperty,
      highIntensityReferenceScenes,
      {
        photonIntensityLabelStringProperty: QuantumWaveInterferenceFluent.intensityStringProperty,
        particleIntensityLabelStringProperty: QuantumWaveInterferenceFluent.intensityStringProperty,
        tandem: Tandem.OPT_OUT
      }
    );

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

    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      tandem.createTandem( 'sceneRadioButtonGroup' )
    );

    const particleMassAnnotation = new ParticleMassAnnotationNode( model.sceneProperty );
    sceneRadioButtonGroup.layoutOptions = { align: 'center' };

    const { obstacleControlsSection } = createObstacleControlsSection(
      model.currentObstacleTypeProperty,
      tandem
    );

    const baseWaveRegionTop = Y_MARGIN + TOP_ROW_CENTER_Y + CALLOUT_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const highIntensityLeftColumnWidth = highIntensityReferenceSourceControlPanel.width;
    const highIntensitySourceControlPanelHeight = highIntensityReferenceSourceControlPanel.height;
    const waveRegionLeft = X_MARGIN + highIntensityLeftColumnWidth + 20;

    sourceControlPanel.left = X_MARGIN;
    sourceControlPanel.top = Y_MARGIN + 20;
    this.addChild( sourceControlPanel );

    obstacleControlsSection.centerX = X_MARGIN + highIntensityLeftColumnWidth / 2;
    obstacleControlsSection.top =
      baseWaveRegionTop + highIntensitySourceControlPanelHeight + SOURCE_TO_SCENE_CONTROLS_SPACING +
      SCENE_AND_OBSTACLE_Y_OFFSET + sceneRadioButtonGroup.height + SCENE_TO_OBSTACLE_CONTROLS_SPACING;
    this.addChild( obstacleControlsSection );

    sceneRadioButtonGroup.centerX = obstacleControlsSection.centerX;
    sceneRadioButtonGroup.top =
      obstacleControlsSection.top - SCENE_TO_OBSTACLE_CONTROLS_SPACING - sceneRadioButtonGroup.height +
      SCENE_BUTTON_GROUP_Y_OFFSET;
    this.addChild( sceneRadioButtonGroup );

    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    emitterNode.right = waveRegionLeft + 2;
    emitterNode.centerY = waveRegionTop + waveRegionHeight / 2;

    const { waveVisualizationNode, doubleSlitNode } = createWaveRegionNodes( model, {
      waveRegionLeft: waveRegionLeft,
      waveRegionTop: waveRegionTop
    } );
    this.detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionLeft + WAVE_REGION_WIDTH - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 2,
      y: waveRegionTop - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2
    } );
    this.addChild( this.detectorScreenNode );

    this.waveVisualizationNode = waveVisualizationNode;
    this.addChild( this.waveVisualizationNode );
    this.addChild( doubleSlitNode );
    this.addChild( emitterNode );

    const updateParticleMassAnnotationPosition = () => {
      particleMassAnnotation.centerX = sourceControlPanel.centerX;
      particleMassAnnotation.top = emitterNode.top;
    };
    particleMassAnnotation.localBoundsProperty.link( updateParticleMassAnnotationPosition );
    updateParticleMassAnnotationPosition();
    this.addChild( particleMassAnnotation );

    const slitConfigItems: ComboBoxItem<SingleParticlesSlitConfiguration>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.topClosedStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topClosedItem' },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomClosedStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomClosedItem' }
    ];

    const bottomRow = createObstacleControlsRow(
      model.currentObstacleTypeProperty,
      model.currentSlitConfigurationProperty,
      slitConfigItems,
      model.sceneProperty,
      model.scenes,
      waveRegionLeft,
      obstacleControlsSection,
      this,
      tandem
    );
    this.addChild( bottomRow );

    // Hits graph (always in Hits mode on this screen)
    this.sidewaysGraphNode = createSidewaysGraph(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isHitsGraphVisibleProperty,
      waveRegionTop,
      tandem.createTandem( 'sidewaysGraphNode' )
    );
    this.addChild( this.sidewaysGraphNode );

    // Detector tool (draggable circle + panel, Single Particles only)
    const detectorToolNode = new DetectorToolNode(
      model,
      waveRegionLeft,
      waveRegionTop,
      tandem.createTandem( 'detectorToolNode' )
    );
    this.addChild( detectorToolNode );

    // --- Right controls (shared factory) ---

    const hitsGraphCheckbox = createToolCheckbox( model.isHitsGraphVisibleProperty, QuantumWaveInterferenceFluent.hitsGraphStringProperty, tandem.createTandem( 'hitsGraphCheckbox' ), ToolIcons.createGraphIcon() );
    const tapeMeasureCheckbox = createToolCheckbox( model.isTapeMeasureVisibleProperty, QuantumWaveInterferenceFluent.tapeMeasureStringProperty, tandem.createTandem( 'tapeMeasureCheckbox' ), ToolIcons.createTapeMeasureIcon() );
    const stopwatchCheckbox = createToolCheckbox( model.isStopwatchVisibleProperty, QuantumWaveInterferenceFluent.stopwatchStringProperty, tandem.createTandem( 'stopwatchCheckbox' ), ToolIcons.createStopwatchIcon() );
    const timePlotCheckbox = createToolCheckbox( model.isTimePlotVisibleProperty, QuantumWaveInterferenceFluent.timePlotStringProperty, tandem.createTandem( 'timePlotCheckbox' ), ToolIcons.createTimePlotIcon() );
    const positionPlotCheckbox = createToolCheckbox( model.isPositionPlotVisibleProperty, QuantumWaveInterferenceFluent.positionPlotStringProperty, tandem.createTandem( 'positionPlotCheckbox' ), ToolIcons.createPositionPlotIcon() );
    const detectorCheckbox = createToolCheckbox( model.isDetectorToolVisibleProperty, QuantumWaveInterferenceFluent.detectorStringProperty, tandem.createTandem( 'detectorCheckbox' ), ToolIcons.createDetectorIcon() );

    // Detector checkbox is only shown when obstacle is None; its checked state is preserved in the model.
    model.isDetectorToolAvailableProperty.link( isAvailable => {
      detectorCheckbox.visible = isAvailable;
    } );

    const { rightControlsVBox, timeAndResetRow } = createRightControlsColumn( model, this, tandem, {
      additionalScreenControlChildren: [],
      toolCheckboxes: [
        hitsGraphCheckbox,
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox,
        detectorCheckbox
      ],
      clearScreen: () => model.sceneProperty.value.clearScreen(),
      onSnapshotCaptured: () => this.detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      resetView: () => {
        this.sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        this.detectorScreenNode.clearFlash();
      },
      slitSettingDisplayMap: {
        bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
        leftCovered: QuantumWaveInterferenceFluent.topClosedStringProperty,
        rightCovered: QuantumWaveInterferenceFluent.bottomClosedStringProperty,
        leftDetector: QuantumWaveInterferenceFluent.topDetectorStringProperty,
        rightDetector: QuantumWaveInterferenceFluent.bottomDetectorStringProperty,
        bothDetectors: QuantumWaveInterferenceFluent.bothDetectorsStringProperty
      }
    } );

    rightControlsVBox.right = this.layoutBounds.maxX - X_MARGIN;
    rightControlsVBox.top = Y_MARGIN;
    this.addChild( rightControlsVBox );

    timeAndResetRow.right = this.layoutBounds.maxX - X_MARGIN;
    timeAndResetRow.bottom = this.layoutBounds.maxY - Y_MARGIN;
    this.addChild( timeAndResetRow );

    const toolNodes = createMeasurementToolNodes( model, this, this.visibleBoundsProperty, waveRegionLeft, waveRegionTop, tandem );
    this.timePlotNode = toolNodes.timePlotNode;
    this.positionPlotNode = toolNodes.positionPlotNode;
  }

  public override step( dt: number ): void {
    super.step( dt );
    this.waveVisualizationNode.step();
    this.detectorScreenNode.step( dt );
    this.sidewaysGraphNode.step();
    this.timePlotNode.step( this.model.getEffectiveDt( dt ) );
    this.positionPlotNode.step();
  }
}
