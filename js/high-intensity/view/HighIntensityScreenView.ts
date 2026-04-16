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
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import createMeasurementToolNodes from '../../common/view/createMeasurementToolNodes.js';
import createObstacleControlsRow from '../../common/view/createObstacleControlsRow.js';
import createRightControlsColumn from '../../common/view/createRightControlsColumn.js';
import createToolCheckbox from '../../common/view/createToolCheckbox.js';
import HighIntensityTopRowNode from '../../common/view/HighIntensityTopRowNode.js';
import ToolIcons from '../../common/view/ToolIcons.js';
import DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import createSidewaysGraph from '../../common/view/createSidewaysGraph.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import HighIntensityDetectorScreenNode from './HighIntensityDetectorScreenNode.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityScreenViewOptions = SelfOptions & ScreenViewOptions;

const LABEL_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;

const TOP_ROW_CENTER_Y = 30;
const LEFT_CONTROLS_TOP_GAP = 12;

export default class HighIntensityScreenView extends ScreenView {

  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: HighIntensityDetectorScreenNode;
  private readonly sidewaysGraphNode: SidewaysGraphNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: HighIntensityModel, providedOptions: HighIntensityScreenViewOptions ) {
    const options = optionize<HighIntensityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    const tandem = options.tandem;

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      photonIntensityLabelStringProperty: QuantumWaveInterferenceFluent.intensityStringProperty,
      tandem: tandem.createTandem( 'sourceControlPanel' )
    } );

    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      tandem.createTandem( 'sceneRadioButtonGroup' )
    );

    const particleMassAnnotation = new ParticleMassAnnotationNode( model.sceneProperty );

    const leftControlsVBox = new VBox( {
      spacing: 16,
      align: 'left',
      children: [ sourceControlPanel, sceneRadioButtonGroup, particleMassAnnotation ]
    } );
    leftControlsVBox.left = X_MARGIN;
    this.addChild( leftControlsVBox );

    const waveRegionLeft = leftControlsVBox.right + 20;
    const waveRegionTop = Y_MARGIN + 50;

    const topRowNode = new HighIntensityTopRowNode(
      model.sceneProperty,
      model.scenes,
      model.currentIsEmittingProperty,
      waveRegionLeft,
      TOP_ROW_CENTER_Y,
      tandem.createTandem( 'topRowNode' )
    );
    this.addChild( topRowNode );

    leftControlsVBox.top = topRowNode.bottom + LEFT_CONTROLS_TOP_GAP;

    this.waveVisualizationNode = new WaveVisualizationNode( model.sceneProperty, {
      x: waveRegionLeft,
      y: waveRegionTop
    } );
    this.addChild( this.waveVisualizationNode );

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

    this.detectorScreenNode = new HighIntensityDetectorScreenNode( model, {
      x: waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2,
      y: waveRegionTop
    } );
    this.addChild( this.detectorScreenNode );

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
      waveRegionTop,
      this,
      tandem,
      { additionalTopConstraintNode: leftControlsVBox }
    );
    this.addChild( bottomRow );

    this.sidewaysGraphNode = createSidewaysGraph(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isIntensityGraphVisibleProperty,
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

    const { rightControlsVBox } = createRightControlsColumn( model, this, tandem, {
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
      resetView: () => {
        this.sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        this.detectorScreenNode.clearFlash();
      }
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
    this.sidewaysGraphNode.step();
    this.timePlotNode.step( dt );
    this.positionPlotNode.step();
  }
}
