// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesScreenView is the top-level view for the Single Particles screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import { hasDetectorOnSide, type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import MeasurementToolNodes from '../../common/view/MeasurementToolNodes.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import RightControlsColumn from '../../common/view/RightControlsColumn.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraph from '../../common/view/SidewaysGraph.js';
import SlitConfigurationControlsRow from '../../common/view/SlitConfigurationControlsRow.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import ToolCheckbox from '../../common/view/ToolCheckbox.js';
import ToolIcons from '../../common/view/ToolIcons.js';
import WaveRegionNodes from '../../common/view/WaveRegionNodes.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';
import DetectorToolNode from './DetectorToolNode.js';
import SingleParticleEmitterNode from './SingleParticleEmitterNode.js';

type SelfOptions = EmptySelfOptions;

// TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Narrow this interface to omit the ScreenViewOptions that this class controls.
type SingleParticlesScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const CONTENT_VERTICAL_OFFSET = 12;
const TOP_ROW_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const CALLOUT_GAP = 55;
const WAVE_REGION_Y_OFFSET = -30;

export default class SingleParticlesScreenView extends ScreenView {

  private readonly model: SingleParticlesModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly sidewaysGraphNode: SidewaysGraph;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: SingleParticlesModel, providedOptions: SingleParticlesScreenViewOptions ) {
    const options = optionize<SingleParticlesScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;

    // This top-level layout intentionally parallels HighIntensityScreenView while keeping screen-specific
    // controls and tandems explicit.
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

    // Emitter source with SingleParticleEmitter.svg image and red toggle button
    const emitterNode = new SingleParticleEmitterNode(
      model.currentIsEmittingProperty,
      model.currentIsEmitterEnabledProperty,
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

    const leftColumnWidth = Math.max( sourceControlPanel.width, sceneRadioButtonGroup.width );
    const leftColumnCenterX = X_MARGIN + leftColumnWidth / 2;

    sourceControlPanel.centerX = leftColumnCenterX;
    sourceControlPanel.top = Y_MARGIN + 20;
    this.addChild( sourceControlPanel );

    sceneRadioButtonGroup.centerX = leftColumnCenterX;
    sceneRadioButtonGroup.centerY = QuantumWaveInterferenceConstants.SCENE_BUTTON_GROUP_CENTER_Y;
    this.addChild( sceneRadioButtonGroup );

    const baseWaveRegionTop = Y_MARGIN + TOP_ROW_CENTER_Y + CALLOUT_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const waveRegionLeft = X_MARGIN + leftColumnWidth + 20;
    const slitControlsBottom = this.layoutBounds.maxY - Y_MARGIN;

    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    emitterNode.right = waveRegionLeft + 2;
    emitterNode.centerY = waveRegionTop + waveRegionHeight / 2;

    const waveRegionNodes = new WaveRegionNodes( model, {
      waveRegionLeft: waveRegionLeft,
      waveRegionTop: waveRegionTop,
      additionalDoubleSlitOptions: {
        isTopSlitDetectorProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => hasDetectorOnSide( slitConfig, 'left' )
        ),
        isBottomSlitDetectorProperty: new DerivedProperty(
          [ model.currentSlitConfigurationProperty ],
          slitConfig => hasDetectorOnSide( slitConfig, 'right' )
        ),
        topDetectorCountProperty: model.currentLeftDetectorHitsProperty,
        bottomDetectorCountProperty: model.currentRightDetectorHitsProperty
      }
    } );
    this.detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionLeft + WAVE_REGION_WIDTH - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 2,
      y: waveRegionTop - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2
    } );
    this.addChild( this.detectorScreenNode );

    this.waveVisualizationNode = waveRegionNodes.waveVisualizationNode;
    this.addChild( waveRegionNodes );
    this.addChild( emitterNode );

    const updateParticleMassAnnotationPosition = () => {
      particleMassAnnotation.centerX = sourceControlPanel.centerX;
      particleMassAnnotation.top = emitterNode.top;
    };
    particleMassAnnotation.localBoundsProperty.link( updateParticleMassAnnotationPosition );
    updateParticleMassAnnotationPosition();
    this.addChild( particleMassAnnotation );

    const slitConfigItems: ComboBoxItem<SlitConfigurationWithNoBarrier>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.coverTopStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topClosedItem', separatorBefore: true },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.coverBottomStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomClosedItem' },
      { value: 'leftDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorTopStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topDetectorItem', separatorBefore: true },
      { value: 'rightDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorBottomStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomDetectorItem' },
      { value: 'bothDetectors', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorBothStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothDetectorsItem' },
      { value: 'noBarrier', createNode: () => new Text( QuantumWaveInterferenceFluent.noBarrierStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'noBarrierItem', separatorBefore: true }
    ];

    // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Identical to bottomRow in HighIntensityScreenView
    const bottomRow = new SlitConfigurationControlsRow(
      model.currentSlitConfigurationProperty,
      slitConfigItems,
      model.sceneProperty,
      model.scenes,
      waveRegionLeft,
      slitControlsBottom,
      this,
      tandem
    );
    this.addChild( bottomRow );

    // Hits graph (always in Hits mode on this screen)
    this.sidewaysGraphNode = new SidewaysGraph(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isHitsGraphVisibleProperty,
      waveRegionLeft + WAVE_REGION_WIDTH,
      waveRegionTop,
      tandem.createTandem( 'sidewaysGraphNode' ),
      { initialZoomLevel: 'max' }
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

    const hitsGraphCheckbox = new ToolCheckbox( model.isHitsGraphVisibleProperty, QuantumWaveInterferenceFluent.hitsGraphStringProperty, tandem.createTandem( 'hitsGraphCheckbox' ), ToolIcons.createGraphIcon() );
    const tapeMeasureCheckbox = new ToolCheckbox( model.isTapeMeasureVisibleProperty, QuantumWaveInterferenceFluent.tapeMeasureStringProperty, tandem.createTandem( 'tapeMeasureCheckbox' ), ToolIcons.createTapeMeasureIcon() );
    const stopwatchCheckbox = new ToolCheckbox( model.isStopwatchVisibleProperty, QuantumWaveInterferenceFluent.stopwatchStringProperty, tandem.createTandem( 'stopwatchCheckbox' ), ToolIcons.createStopwatchIcon() );
    const timePlotCheckbox = new ToolCheckbox( model.isTimePlotVisibleProperty, QuantumWaveInterferenceFluent.timePlotStringProperty, tandem.createTandem( 'timePlotCheckbox' ), ToolIcons.createTimePlotIcon() );
    const positionPlotCheckbox = new ToolCheckbox( model.isPositionPlotVisibleProperty, QuantumWaveInterferenceFluent.positionPlotStringProperty, tandem.createTandem( 'positionPlotCheckbox' ), ToolIcons.createPositionPlotIcon() );
    const detectorCheckbox = new ToolCheckbox( model.isDetectorToolVisibleProperty, QuantumWaveInterferenceFluent.detectorStringProperty, tandem.createTandem( 'detectorCheckbox' ), ToolIcons.createDetectorIcon() );

    // Detector checkbox is only shown when barrier is None; its checked state is preserved in the model.
    model.isDetectorToolAvailableProperty.link( isAvailable => {
      detectorCheckbox.visible = isAvailable;
    } );

    const rightControlsColumn = new RightControlsColumn( model, this, tandem, {
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
      // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Duplicate of resetView in HighIntensityScreenView
      resetView: () => {
        this.sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        this.detectorScreenNode.clearFlash();
      },
      slitSettingDisplayMap: {
        bothOpen: QuantumWaveInterferenceFluent.bothOpenStringProperty,
        leftCovered: QuantumWaveInterferenceFluent.coverTopStringProperty,
        rightCovered: QuantumWaveInterferenceFluent.coverBottomStringProperty,
        leftDetector: QuantumWaveInterferenceFluent.detectorTopStringProperty,
        rightDetector: QuantumWaveInterferenceFluent.detectorBottomStringProperty,
        bothDetectors: QuantumWaveInterferenceFluent.detectorBothStringProperty,
        noBarrier: QuantumWaveInterferenceFluent.noBarrierStringProperty
      }
    } );

    rightControlsColumn.right = this.layoutBounds.maxX - X_MARGIN;
    rightControlsColumn.top = Y_MARGIN;
    this.addChild( rightControlsColumn );

    rightControlsColumn.timeAndResetRow.right = this.layoutBounds.maxX - X_MARGIN;
    rightControlsColumn.timeAndResetRow.bottom = this.layoutBounds.maxY - Y_MARGIN;
    this.addChild( rightControlsColumn.timeAndResetRow );

    const toolNodes = new MeasurementToolNodes( model, this.visibleBoundsProperty, waveRegionLeft, waveRegionTop, tandem );
    this.addChild( toolNodes );
    this.timePlotNode = toolNodes.timePlotNode;
    this.positionPlotNode = toolNodes.positionPlotNode;
  }

  // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Duplicate of HighIntensityScreenView.step
  public override step( dt: number ): void {
    super.step( dt );
    this.waveVisualizationNode.step();
    this.detectorScreenNode.step();
    this.sidewaysGraphNode.step();
    this.timePlotNode.step( this.model.getEffectiveDt( dt ) );
    this.positionPlotNode.step();
  }
}
