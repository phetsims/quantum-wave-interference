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

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import createMeasurementToolNodes from '../../common/view/createMeasurementToolNodes.js';
import createObstacleControlsSection from '../../common/view/createObstacleControlsSection.js';
import createObstacleControlsRow from '../../common/view/createObstacleControlsRow.js';
import createRightControlsColumn from '../../common/view/createRightControlsColumn.js';
import createToolCheckbox from '../../common/view/createToolCheckbox.js';
import createWaveRegionNodes from '../../common/view/createWaveRegionNodes.js';
import HighIntensityTopRowNode from './HighIntensityTopRowNode.js';
import ToolIcons from '../../common/view/ToolIcons.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import createSidewaysGraph from '../../common/view/createSidewaysGraph.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
const CONTENT_VERTICAL_OFFSET = 12;
const TOP_ROW_BEAM_RIGHT_PANEL_GAP = 10;

const TOP_ROW_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const TOP_ROW_TO_MASS_LABEL_SPACING = 12;
const SOURCE_TO_SCENE_CONTROLS_SPACING = 40;
const SCENE_TO_OBSTACLE_CONTROLS_SPACING = 36;
const SOURCE_CONTROL_Y_OFFSET = 20;
const SCENE_AND_OBSTACLE_Y_OFFSET = 10;
const SCENE_BUTTON_GROUP_Y_OFFSET = 10;
const WAVE_REGION_Y_OFFSET = -30;

// Extra vertical space below the top row to accommodate the zoom-callout lines between the
// mini-symbol (at TOP_ROW_CENTER_Y) and the top of the main wave region.
const CALLOUT_GAP = 55;

export default class HighIntensityScreenView extends ScreenView {

  private readonly model: HighIntensityModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly sidewaysGraphNode: SidewaysGraphNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: HighIntensityModel, providedOptions: HighIntensityScreenViewOptions ) {
    const options = optionize<HighIntensityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      photonIntensityLabelStringProperty: QuantumWaveInterferenceFluent.intensityStringProperty,
      particleIntensityLabelStringProperty: QuantumWaveInterferenceFluent.emissionRateStringProperty,
      tandem: tandem.createTandem( 'sourceControlPanel' )
    } );

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

    const leftColumnWidth = Math.max( sourceControlPanel.width, sceneRadioButtonGroup.width, obstacleControlsSection.width );
    const leftColumnCenterX = X_MARGIN + leftColumnWidth / 2;
    const waveRegionLeft = X_MARGIN + leftColumnWidth + 20;
    const baseWaveRegionTop = Y_MARGIN + TOP_ROW_CENTER_Y + CALLOUT_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const waveRegionRight = waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

    sourceControlPanel.left = X_MARGIN;
    sourceControlPanel.top = baseWaveRegionTop + SOURCE_CONTROL_Y_OFFSET;
    this.addChild( sourceControlPanel );

    obstacleControlsSection.centerX = leftColumnCenterX;
    obstacleControlsSection.top =
      baseWaveRegionTop + sourceControlPanel.height + SOURCE_TO_SCENE_CONTROLS_SPACING +
      SCENE_AND_OBSTACLE_Y_OFFSET + sceneRadioButtonGroup.height + SCENE_TO_OBSTACLE_CONTROLS_SPACING;
    this.addChild( obstacleControlsSection );

    sceneRadioButtonGroup.centerX = leftColumnCenterX;
    sceneRadioButtonGroup.top =
      obstacleControlsSection.top - SCENE_TO_OBSTACLE_CONTROLS_SPACING - sceneRadioButtonGroup.height +
      SCENE_BUTTON_GROUP_Y_OFFSET;
    this.addChild( sceneRadioButtonGroup );

    const topRowBeamRightLimitXProperty = new NumberProperty( this.layoutBounds.maxX - X_MARGIN );
    const topRowNode = new HighIntensityTopRowNode(
      model.sceneProperty,
      model.scenes,
      model.currentObstacleTypeProperty,
      model.currentSlitPositionFractionProperty,
      model.currentSlitSeparationProperty,
      model.currentIsEmittingProperty,
      this.visibleBoundsProperty,
      topRowBeamRightLimitXProperty,
      {
        emitterCenterX: leftColumnCenterX,
        topRowCenterY: TOP_ROW_CENTER_Y,
        waveRegionLeft: waveRegionLeft,
        waveRegionRight: waveRegionRight,
        waveRegionTop: waveRegionTop
      },
      tandem.createTandem( 'topRowNode' )
    );
    this.addChild( topRowNode );

    const updateParticleMassAnnotationPosition = () => {
      particleMassAnnotation.centerX = topRowNode.emitterCenterX;
      particleMassAnnotation.top = topRowNode.emitterBottom + TOP_ROW_TO_MASS_LABEL_SPACING;
    };
    particleMassAnnotation.localBoundsProperty.link( updateParticleMassAnnotationPosition );
    updateParticleMassAnnotationPosition();
    this.addChild( particleMassAnnotation );

    const { waveVisualizationNode, doubleSlitNode } = createWaveRegionNodes( model, {
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
        )
      }
    } );
    this.detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionRight - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 2,
      y: waveRegionTop - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2
    } );
    this.addChild( this.detectorScreenNode );

    this.waveVisualizationNode = waveVisualizationNode;
    this.addChild( this.waveVisualizationNode );
    this.addChild( doubleSlitNode );

    // --- Bottom row: obstacle, slit configuration, slit separation ---
    const slitConfigItems: ComboBoxItem<SlitConfiguration>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.topCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topCoveredItem' },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomCoveredStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomCoveredItem' },
      { value: 'leftDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.topDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topDetectorItem' },
      { value: 'rightDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.bottomDetectorStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomDetectorItem' },
      { value: 'bothDetectors', createNode: () => new Text( QuantumWaveInterferenceFluent.bothDetectorsStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothDetectorsItem' }
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

    this.sidewaysGraphNode = createSidewaysGraph(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isIntensityGraphVisibleProperty,
      waveRegionRight,
      waveRegionTop,
      tandem.createTandem( 'sidewaysGraphNode' ),
      { detectionModeProperty: model.currentDetectionModeProperty }
    );
    this.addChild( this.sidewaysGraphNode );

    // --- Right controls (shared factory) ---

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

    const intensityGraphCheckbox = createToolCheckbox( model.isIntensityGraphVisibleProperty, QuantumWaveInterferenceFluent.intensityGraphStringProperty, tandem.createTandem( 'intensityGraphCheckbox' ), ToolIcons.createGraphIcon() );
    const tapeMeasureCheckbox = createToolCheckbox( model.isTapeMeasureVisibleProperty, QuantumWaveInterferenceFluent.tapeMeasureStringProperty, tandem.createTandem( 'tapeMeasureCheckbox' ), ToolIcons.createTapeMeasureIcon() );
    const stopwatchCheckbox = createToolCheckbox( model.isStopwatchVisibleProperty, QuantumWaveInterferenceFluent.stopwatchStringProperty, tandem.createTandem( 'stopwatchCheckbox' ), ToolIcons.createStopwatchIcon() );
    const timePlotCheckbox = createToolCheckbox( model.isTimePlotVisibleProperty, QuantumWaveInterferenceFluent.timePlotStringProperty, tandem.createTandem( 'timePlotCheckbox' ), ToolIcons.createTimePlotIcon() );
    const positionPlotCheckbox = createToolCheckbox( model.isPositionPlotVisibleProperty, QuantumWaveInterferenceFluent.positionPlotStringProperty, tandem.createTandem( 'positionPlotCheckbox' ), ToolIcons.createPositionPlotIcon() );

    const { rightControlsVBox, timeAndResetRow } = createRightControlsColumn( model, this, tandem, {
      additionalScreenControlChildren: [ detectionModeRadioButtonGroup ],
      toolCheckboxes: [
        intensityGraphCheckbox,
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox
      ],
      clearScreen: () => model.sceneProperty.value.clearScreen(),
      onSnapshotCaptured: () => this.detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      resetView: () => {
        this.sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        this.detectorScreenNode.clearFlash();
      }
    } );

    rightControlsVBox.right = this.layoutBounds.maxX - X_MARGIN;
    rightControlsVBox.top = Y_MARGIN;
    topRowBeamRightLimitXProperty.value = rightControlsVBox.left - TOP_ROW_BEAM_RIGHT_PANEL_GAP;
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
