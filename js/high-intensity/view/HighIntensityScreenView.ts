// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityScreenView is the top-level view for the High Intensity screen. It contains:
 * - Left controls: source controls panel, scene radio buttons, barrier combo box, slit controls
 * - Center: emitter source, wave visualization region (black rectangle), detector screen (skewed parallelogram)
 * - Detector screen controls: screen controls (erase/camera/snapshots), detection mode, brightness,
 *   tools checkboxes, wave display combo box, time controls, reset all
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import createFrontFacingSlitDetectorOptions from '../../common/view/createFrontFacingSlitDetectorOptions.js';
import createSlitConfigComboItems from '../../common/view/createSlitConfigComboItems.js';
import createStandardToolCheckboxes from '../../common/view/createStandardToolCheckboxes.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import QuantumWaveInterferenceScreenViewDescription from '../../common/view/description/QuantumWaveInterferenceScreenViewDescription.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import MeasurementToolsLayerNode from '../../common/view/MeasurementToolsLayerNode.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import DetectorScreenControls from '../../common/view/DetectorScreenControls.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraph from '../../common/view/SidewaysGraph.js';
import SlitConfigurationControlsRow from '../../common/view/SlitConfigurationControlsRow.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import WaveRegionNode from '../../common/view/WaveRegionNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import type HighIntensitySceneModel from '../model/HighIntensitySceneModel.js';
import HighIntensityAccessibleResponses from './description/HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './description/QWIAccessibleStateDescriber.js';
import QWIAccessibleStateTemplate from './description/QWIAccessibleStateTemplate.js';
import HighIntensityTopRowNode from './HighIntensityTopRowNode.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityScreenViewOptions = SelfOptions & ScreenViewOptions;

type SourceControlNodes = {
  sourceControlPanel: SourceControlPanel<HighIntensitySceneModel>;
  sceneRadioButtonGroup: SceneRadioButtonGroup<HighIntensitySceneModel>;
  particleMassAnnotation: ParticleMassAnnotationNode;
  leftColumnWidth: number;
  leftColumnCenterX: number;
};

type WaveRegionLayout = {
  waveRegionLeft: number;
  waveRegionTop: number;
  waveRegionRight: number;
  slitControlsBottom: number;
};

type WaveRegionNodes = {
  detectorScreenNode: DetectorScreenNode;
  waveVisualizationNode: WaveVisualizationNode;
};

type MeasurementToolNodes = {
  measurementToolsNode: MeasurementToolsLayerNode;
  timePlotNode: TimePlotNode;
  positionPlotNode: PositionPlotNode;
};

const LABEL_FONT = new PhetFont( 14 );

const CONTENT_VERTICAL_OFFSET = 12;
const TOP_ROW_BEAM_RIGHT_PANEL_GAP = 10;

const TOP_ROW_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const TOP_ROW_TO_MASS_LABEL_SPACING = 12;
const WAVE_REGION_Y_OFFSET = -30;

// Extra vertical space below the top row to accommodate the zoom-callout lines between the
// mini-symbol (at TOP_ROW_CENTER_Y) and the top of the main wave region.
const CALLOUT_GAP = 55;

export default class HighIntensityScreenView extends ScreenView {

  private readonly model: HighIntensityModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly sidewaysGraphNode: SidewaysGraph;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: HighIntensityModel, providedOptions: HighIntensityScreenViewOptions ) {
    const accessibleStateDescriber = new QWIAccessibleStateDescriber( model );

    const options = optionize<HighIntensityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      screenSummaryContent: new QuantumWaveInterferenceScreenSummaryContent(
        model,
        model.currentSlitConfigurationProperty,
        {
          detectionMode: model.currentDetectionModeProperty,
          slitOrientation: 'topBottom',
          currentDetailsContent: QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty( model, accessibleStateDescriber )
        }
      )
    }, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;
    const accessibleResponses = new HighIntensityAccessibleResponses( model, accessibleStateDescriber );

    // Keep this top-level sequence aligned with the visual layers: source controls, wave region,
    // detector readouts, detector screen controls, tools, and accessible description.
    const sourceControlNodes = this.createAndAddSourceControls( model, tandem );
    const waveRegionLayout = this.createWaveRegionLayout( sourceControlNodes.leftColumnWidth );
    const topRowBeamRightLimitXProperty = new NumberProperty( this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN );
    const topRowNode = this.createAndAddTopRowNode(
      model,
      sourceControlNodes.leftColumnCenterX,
      waveRegionLayout,
      topRowBeamRightLimitXProperty,
      tandem
    );
    this.positionAndAddParticleMassAnnotation( sourceControlNodes.particleMassAnnotation, topRowNode );

    const waveRegionNodes = this.createAndAddWaveRegionNodes( model, waveRegionLayout );
    this.detectorScreenNode = waveRegionNodes.detectorScreenNode;
    this.waveVisualizationNode = waveRegionNodes.waveVisualizationNode;

    const bottomRow = this.createAndAddSlitControls( model, waveRegionLayout, tandem );
    this.sidewaysGraphNode = this.createAndAddSidewaysGraph( model, this.detectorScreenNode, waveRegionLayout, tandem );

    const detectorScreenControls = this.createAndAddDetectorScreenControls(
      model,
      accessibleResponses,
      this.sidewaysGraphNode,
      this.detectorScreenNode,
      topRowBeamRightLimitXProperty,
      tandem
    );

    const measurementToolNodes = this.createAndAddMeasurementTools( model, waveRegionLayout, tandem );
    this.timePlotNode = measurementToolNodes.timePlotNode;
    this.positionPlotNode = measurementToolNodes.positionPlotNode;

    const screenViewDescription = this.createAndAddScreenViewDescription(
      model,
      topRowNode,
      sourceControlNodes.sourceControlPanel,
      sourceControlNodes.sceneRadioButtonGroup,
      bottomRow,
      detectorScreenControls
    );

    this.addChild( accessibleResponses );
    this.setHighIntensityPDOMOrder( screenViewDescription, measurementToolNodes.measurementToolsNode, detectorScreenControls );
  }

  /**
   * Creates the source controls and scene selector on the left side of the screen.
   *
   * @param model - the screen model that owns the source and scene state
   * @param tandem - parent tandem for child instrumentation
   * @returns the source nodes and left-column measurements needed by later layout sections
   */
  private createAndAddSourceControls( model: HighIntensityModel, tandem: Tandem ): SourceControlNodes {
    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, {
      tandem: tandem.createTandem( 'sourceControlPanel' )
    } );

    const sceneRadioButtonGroup = new SceneRadioButtonGroup(
      model.sceneProperty,
      model.scenes,
      tandem.createTandem( 'sceneRadioButtonGroup' ),
      {
        // HighIntensityAccessibleResponses describes the full scene transition.
        createAccessibleContextResponse: () => null
      }
    );

    const particleMassAnnotation = new ParticleMassAnnotationNode( model.sceneProperty );

    sceneRadioButtonGroup.layoutOptions = { align: 'center' };

    const leftColumnWidth = Math.max( sourceControlPanel.width, sceneRadioButtonGroup.width );
    const leftColumnCenterX = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + leftColumnWidth / 2;

    sourceControlPanel.centerX = leftColumnCenterX;
    sourceControlPanel.top = QuantumWaveInterferenceConstants.SOURCE_CONTROL_PANEL_TOP;
    this.addChild( sourceControlPanel );

    sceneRadioButtonGroup.centerX = leftColumnCenterX;
    sceneRadioButtonGroup.centerY = QuantumWaveInterferenceConstants.SCENE_BUTTON_GROUP_CENTER_Y;
    this.addChild( sceneRadioButtonGroup );

    return {
      sourceControlPanel: sourceControlPanel,
      sceneRadioButtonGroup: sceneRadioButtonGroup,
      particleMassAnnotation: particleMassAnnotation,
      leftColumnWidth: leftColumnWidth,
      leftColumnCenterX: leftColumnCenterX
    };
  }

  /**
   * Calculates the fixed wave-region coordinates shared by the top row, wave area, slit controls,
   * graph, and measurement tools.
   *
   * @param leftColumnWidth - width of the source controls column
   * @returns coordinates for the wave region and slit controls
   */
  private createWaveRegionLayout( leftColumnWidth: number ): WaveRegionLayout {
    const waveRegionLeft = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + leftColumnWidth + 20;
    const baseWaveRegionTop = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN + TOP_ROW_CENTER_Y + CALLOUT_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const waveRegionRight = waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const slitControlsBottom = this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;

    return {
      waveRegionLeft: waveRegionLeft,
      waveRegionTop: waveRegionTop,
      waveRegionRight: waveRegionRight,
      slitControlsBottom: slitControlsBottom
    };
  }

  /**
   * Creates the source emitter and callout row that connects the source controls to the main wave region.
   *
   * @param model - the screen model that owns source, barrier, and slit state
   * @param leftColumnCenterX - horizontal center for the source controls column
   * @param waveRegionLayout - coordinates for the main wave region
   * @param topRowBeamRightLimitXProperty - mutable right limit that responds to the detector-screen controls width
   * @param tandem - parent tandem for child instrumentation
   * @returns the top row node, used for particle-mass annotation layout and accessible description
   */
  private createAndAddTopRowNode(
    model: HighIntensityModel,
    leftColumnCenterX: number,
    waveRegionLayout: WaveRegionLayout,
    topRowBeamRightLimitXProperty: NumberProperty,
    tandem: Tandem
  ): HighIntensityTopRowNode<HighIntensitySceneModel> {
    const topRowNode = new HighIntensityTopRowNode(
      model.sceneProperty,
      model.scenes,
      model.currentWavelengthProperty,
      model.currentBarrierTypeProperty,
      model.currentSlitPositionFractionProperty,
      model.currentSlitSeparationProperty,
      model.currentIsEmittingProperty,
      model.currentIsEmitterEnabledProperty,
      this.visibleBoundsProperty,
      topRowBeamRightLimitXProperty,
      {
        emitterCenterX: leftColumnCenterX,
        topRowCenterY: TOP_ROW_CENTER_Y,
        waveRegionLeft: waveRegionLayout.waveRegionLeft,
        waveRegionRight: waveRegionLayout.waveRegionRight,
        waveRegionTop: waveRegionLayout.waveRegionTop
      },
      tandem.createTandem( 'topRowNode' )
    );
    this.addChild( topRowNode );

    return topRowNode;
  }

  /**
   * Positions the particle mass annotation below the top-row emitter and adds it to the scene graph.
   *
   * @param particleMassAnnotation - annotation node that labels the current particle mass
   * @param topRowNode - top-row node that provides the emitter bounds
   */
  private positionAndAddParticleMassAnnotation(
    particleMassAnnotation: ParticleMassAnnotationNode,
    topRowNode: HighIntensityTopRowNode<HighIntensitySceneModel>
  ): void {
    const updateParticleMassAnnotationPosition = () => {
      particleMassAnnotation.centerX = topRowNode.emitterCenterX;
      particleMassAnnotation.top = topRowNode.emitterBottom + TOP_ROW_TO_MASS_LABEL_SPACING;
    };
    particleMassAnnotation.localBoundsProperty.link( updateParticleMassAnnotationPosition );
    updateParticleMassAnnotationPosition();
    this.addChild( particleMassAnnotation );
  }

  /**
   * Creates the main wave display and detector screen nodes.
   *
   * @param model - the screen model that owns wave, slit, and detector state
   * @param waveRegionLayout - coordinates for positioning the wave region and detector screen
   * @returns the detector screen and wave visualization nodes retained by the ScreenView
   */
  private createAndAddWaveRegionNodes( model: HighIntensityModel, waveRegionLayout: WaveRegionLayout ): WaveRegionNodes {
    const waveRegionNode = new WaveRegionNode( model, {
      waveRegionLeft: waveRegionLayout.waveRegionLeft,
      waveRegionTop: waveRegionLayout.waveRegionTop,
      additionalDoubleSlitOptions: createFrontFacingSlitDetectorOptions(
        model.currentSlitConfigurationProperty,
        model.currentLeftDetectorHitsProperty,
        model.currentRightDetectorHitsProperty
      )
    } );
    const detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionLayout.waveRegionRight - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 2,
      y: waveRegionLayout.waveRegionTop - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2
    } );
    this.addChild( detectorScreenNode );

    this.addChild( waveRegionNode );

    return {
      detectorScreenNode: detectorScreenNode,
      waveVisualizationNode: waveRegionNode.waveVisualizationNode
    };
  }

  /**
   * Creates the slit controls along the bottom of the wave region.
   *
   * @param model - the screen model that owns slit configuration state
   * @param waveRegionLayout - coordinates for aligning controls with the wave region
   * @param tandem - parent tandem for child instrumentation
   * @returns the row of slit controls, used by accessible description
   */
  private createAndAddSlitControls(
    model: HighIntensityModel,
    waveRegionLayout: WaveRegionLayout,
    tandem: Tandem
  ): SlitConfigurationControlsRow<SlitConfigurationWithNoBarrier> {
    const slitConfigItems = createSlitConfigComboItems( {
      topCoveredTandemName: 'topCoveredItem',
      bottomCoveredTandemName: 'bottomCoveredItem'
    } );

    const bottomRow = new SlitConfigurationControlsRow(
      model.currentSlitConfigurationProperty,
      slitConfigItems,
      model.sceneProperty,
      model.scenes,
      waveRegionLayout.waveRegionLeft,
      waveRegionLayout.slitControlsBottom,
      this,
      tandem
    );
    this.addChild( bottomRow );

    return bottomRow;
  }

  /**
   * Creates the detector-side intensity graph.
   *
   * @param model - the screen model that owns graph visibility and detection mode
   * @param detectorScreenNode - detector screen node that anchors the graph
   * @param waveRegionLayout - coordinates for positioning the graph beside the wave region
   * @param tandem - parent tandem for child instrumentation
   * @returns the graph node retained by the ScreenView for stepping and reset
   */
  private createAndAddSidewaysGraph(
    model: HighIntensityModel,
    detectorScreenNode: DetectorScreenNode,
    waveRegionLayout: WaveRegionLayout,
    tandem: Tandem
  ): SidewaysGraph {
    const sidewaysGraphNode = new SidewaysGraph(
      model.sceneProperty,
      detectorScreenNode,
      model.isIntensityGraphVisibleProperty,
      waveRegionLayout.waveRegionRight,
      waveRegionLayout.waveRegionTop,
      tandem.createTandem( 'sidewaysGraphNode' ), {
        detectionModeProperty: model.currentDetectionModeProperty,
        initialZoomLevels: {
          averageIntensity: 3,
          hits: 'max'
        }
      }
    );
    this.addChild( sidewaysGraphNode );

    return sidewaysGraphNode;
  }

  /**
   * Creates the detection-mode radio buttons used inside the detector-screen controls.
   *
   * @param model - the screen model that owns the detection mode
   * @param tandem - parent tandem for child instrumentation
   * @returns an AlignBox that sizes and centers the detection-mode controls for the right panel
   */
  private createDetectionModeRadioButtonGroupBox( model: HighIntensityModel, tandem: Tandem ): AlignBox {
    const detectionModeItems: AquaRadioButtonGroupItem<DetectionMode>[] = [ {
      value: 'averageIntensity',
      createNode: () => new Text( QuantumWaveInterferenceFluent.intensityStringProperty, { font: LABEL_FONT, maxWidth: 130 } ),
      tandemName: 'averageIntensityRadioButton'
    }, {
      value: 'hits',
      createNode: () => new Text( QuantumWaveInterferenceFluent.hitsStringProperty, { font: LABEL_FONT, maxWidth: 130 } ),
      tandemName: 'hitsRadioButton'
    } ];

    const detectionModeRadioButtonGroup = new AquaRadioButtonGroup<DetectionMode>( model.currentDetectionModeProperty,
      detectionModeItems, {
        spacing: 8,
        align: 'left',
        orientation: 'vertical',
        stretch: false,
        radioButtonOptions: { radius: 7 },
        accessibleName: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleNameStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( 'detectionModeRadioButtonGroup' )
      }
    );

    const detectionModeRadioButtonGroupBox = new AlignBox( detectionModeRadioButtonGroup, {
      xAlign: 'center',
      yAlign: 'center',
      yMargin: 4,
      preferredWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH,
      layoutOptions: { align: 'center' }
    } );

    return detectionModeRadioButtonGroupBox;
  }

  /**
   * Creates and positions the detector screen controls, including detector controls, tool checkboxes, time controls,
   * and reset buttons.
   *
   * @param model - the screen model that owns detector-screen control state
   * @param accessibleResponses - response node used for clear-screen alerts
   * @param sidewaysGraphNode - graph node reset by the detector-screen controls reset action
   * @param detectorScreenNode - detector screen node used for snapshot flash and reset
   * @param topRowBeamRightLimitXProperty - mutable right limit for the top-row beam callout
   * @param tandem - parent tandem for child instrumentation
   * @returns the detector screen controls, used by layout and accessible description
   */
  private createAndAddDetectorScreenControls(
    model: HighIntensityModel,
    accessibleResponses: HighIntensityAccessibleResponses,
    sidewaysGraphNode: SidewaysGraph,
    detectorScreenNode: DetectorScreenNode,
    topRowBeamRightLimitXProperty: NumberProperty,
    tandem: Tandem
  ): DetectorScreenControls {
    const detectionModeRadioButtonGroupBox = this.createDetectionModeRadioButtonGroupBox( model, tandem );
    const { tapeMeasureCheckbox, stopwatchCheckbox, timePlotCheckbox, positionPlotCheckbox } =
      createStandardToolCheckboxes( model, tandem );

    const detectorScreenControls = new DetectorScreenControls( model, this, tandem, {
      screenGraphVisibleProperty: model.isIntensityGraphVisibleProperty,
      additionalScreenControlChildren: [ detectionModeRadioButtonGroupBox ],
      toolCheckboxes: [
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox
      ],
      clearScreen: () => accessibleResponses.clearScreenAndEmitResponse( () => model.sceneProperty.value.clearScreen() ),
      onSnapshotCaptured: () => detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      resetView: () => {
        sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        detectorScreenNode.clearFlash();
      }
    } );

    this.addChild( detectorScreenControls );

    ManualConstraint.create( this, [ detectorScreenControls ], detectorScreenControlsProxy => {
      detectorScreenControlsProxy.right = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
      detectorScreenControlsProxy.top = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
      topRowBeamRightLimitXProperty.value = detectorScreenControlsProxy.left - TOP_ROW_BEAM_RIGHT_PANEL_GAP;
    } );

    this.addChild( detectorScreenControls.bottomButtonsRow );

    const rightPanelCenterX = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN - QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH / 2;
    this.addChild( detectorScreenControls.waveDisplayAndTimeControlsGroup );

    ManualConstraint.create( this, [ detectorScreenControls.bottomButtonsRow ], () => {
      detectorScreenControls.positionBottomButtonsRow(
        this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN,
        this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN
      );
    } );

    ManualConstraint.create( this, [ detectorScreenControls.bottomButtonsRow, detectorScreenControls.waveDisplayAndTimeControlsGroup ], () => {
      detectorScreenControls.positionWaveDisplayAndTimeControlsGroup(
        rightPanelCenterX,
        this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN
      );
    } );

    return detectorScreenControls;
  }

  /**
   * Creates the measurement tools layer and adds it above the main screen controls.
   *
   * @param model - the screen model that owns the measurement tool state
   * @param waveRegionLayout - coordinates for anchoring the measurement tools to the wave region
   * @param tandem - parent tandem for child instrumentation
   * @returns the measurement layer and the plot nodes retained by the ScreenView
   */
  private createAndAddMeasurementTools(
    model: HighIntensityModel,
    waveRegionLayout: WaveRegionLayout,
    tandem: Tandem
  ): MeasurementToolNodes {
    const measurementToolsNode = new MeasurementToolsLayerNode(
      model,
      this.visibleBoundsProperty,
      waveRegionLayout.waveRegionLeft,
      waveRegionLayout.waveRegionTop,
      tandem
    );
    this.addChild( measurementToolsNode );

    return {
      measurementToolsNode: measurementToolsNode,
      timePlotNode: measurementToolsNode.timePlotNode,
      positionPlotNode: measurementToolsNode.positionPlotNode
    };
  }

  /**
   * Creates the PDOM description nodes that describe the screen structure and current state.
   *
   * @param model - the screen model that supplies dynamic description state
   * @param topRowNode - source row node included in the source description
   * @param sourceControlPanel - source controls included in the source description
   * @param sceneRadioButtonGroup - scene controls included in the source description
   * @param bottomRow - slit controls included in the slit description
   * @param detectorScreenControls - detector controls included in the detector-screen description
   * @returns the description node used for PDOM order
   */
  private createAndAddScreenViewDescription(
    model: HighIntensityModel,
    topRowNode: HighIntensityTopRowNode<HighIntensitySceneModel>,
    sourceControlPanel: SourceControlPanel<HighIntensitySceneModel>,
    sceneRadioButtonGroup: SceneRadioButtonGroup<HighIntensitySceneModel>,
    bottomRow: SlitConfigurationControlsRow<SlitConfigurationWithNoBarrier>,
    detectorScreenControls: DetectorScreenControls
  ): QuantumWaveInterferenceScreenViewDescription {
    const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
      model,
      model.currentSlitConfigurationProperty, {
        detectionModeProperty: model.currentDetectionModeProperty,
        slitOrientation: 'topBottom',
        includeExperimentSetupDetails: false,
        sourceNodes: [ topRowNode, sourceControlPanel, sceneRadioButtonGroup ],
        slitNodes: [ bottomRow ],
        detectorScreenControlNodes: [ detectorScreenControls ]
      }
    );
    this.addChild( screenViewDescription );

    return screenViewDescription;
  }

  /**
   * Sets the screen reader traversal order for play-area and control-area content.
   *
   * @param screenViewDescription - description node that owns the heading nodes
   * @param measurementToolsNode - measurement tools layer included in play-area order
   * @param detectorScreenControls - detector-screen controls whose detached groups are in the control-area order
   */
  private setHighIntensityPDOMOrder(
    screenViewDescription: QuantumWaveInterferenceScreenViewDescription,
    measurementToolsNode: MeasurementToolsLayerNode,
    detectorScreenControls: DetectorScreenControls
  ): void {
    this.pdomPlayAreaNode.pdomOrder = [
      screenViewDescription.sourceHeadingNode,
      screenViewDescription.slitsHeadingNode,
      this.sidewaysGraphNode,
      measurementToolsNode
    ];

    this.pdomControlAreaNode.pdomOrder = [
      screenViewDescription.detectorScreenHeadingNode,
      detectorScreenControls.waveDisplayAndTimeControlsGroup,
      detectorScreenControls.bottomButtonsRow
    ];
  }

  public override step( dt: number ): void {
    super.step( dt );
    this.waveVisualizationNode.step();
    this.detectorScreenNode.step();
    this.sidewaysGraphNode.step();
    this.timePlotNode.step( this.model.getEffectiveDt( dt ) );
    this.positionPlotNode.step();
  }
}
