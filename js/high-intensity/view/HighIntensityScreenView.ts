// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityScreenView is the top-level view for the High Intensity screen. It contains:
 * - Left controls: source controls panel, scene radio buttons, barrier combo box, slit controls
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
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { hasDetectorOnSide, type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import QuantumWaveInterferenceScreenViewDescription from '../../common/view/description/QuantumWaveInterferenceScreenViewDescription.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import MeasurementToolsNode from '../../common/view/MeasurementToolsNode.js';
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
import WaveRegionNode from '../../common/view/WaveRegionNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import HighIntensityAccessibleResponses from './description/HighIntensityAccessibleResponses.js';
import QWIAccessibleStateDescriber from './description/QWIAccessibleStateDescriber.js';
import QWIAccessibleStateTemplate from './description/QWIAccessibleStateTemplate.js';
import HighIntensityTopRowNode from './HighIntensityTopRowNode.js';

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

    // This top-level layout intentionally parallels SingleParticlesScreenView while keeping screen-specific
    // controls and tandems explicit.
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
    const leftColumnCenterX = X_MARGIN + leftColumnWidth / 2;

    sourceControlPanel.centerX = leftColumnCenterX;
    sourceControlPanel.top = QuantumWaveInterferenceConstants.SOURCE_CONTROL_PANEL_TOP;
    this.addChild( sourceControlPanel );

    sceneRadioButtonGroup.centerX = leftColumnCenterX;
    sceneRadioButtonGroup.centerY = QuantumWaveInterferenceConstants.SCENE_BUTTON_GROUP_CENTER_Y;
    this.addChild( sceneRadioButtonGroup );

    const waveRegionLeft = X_MARGIN + leftColumnWidth + 20;
    const baseWaveRegionTop = Y_MARGIN + TOP_ROW_CENTER_Y + CALLOUT_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const waveRegionRight = waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const slitControlsBottom = this.layoutBounds.maxY - Y_MARGIN;

    const topRowBeamRightLimitXProperty = new NumberProperty( this.layoutBounds.maxX - X_MARGIN );
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

    const waveRegionNode = new WaveRegionNode( model, {
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

        // TODO: https://github.com/phetsims/quantum-wave-interference/issues/135 it's confusing to have top/bottom and left/right interchangeability
        topDetectorCountProperty: model.currentLeftDetectorHitsProperty,
        bottomDetectorCountProperty: model.currentRightDetectorHitsProperty
      }
    } );
    this.detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionRight - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 2,
      y: waveRegionTop - QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW / 2
    } );
    this.addChild( this.detectorScreenNode );

    this.waveVisualizationNode = waveRegionNode.waveVisualizationNode;
    this.addChild( waveRegionNode );

    // --- Bottom row: barrier, slit configuration, slit separation ---
    const slitConfigItems: ComboBoxItem<SlitConfigurationWithNoBarrier>[] = [
      { value: 'bothOpen', createNode: () => new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothOpenItem' },
      { value: 'leftCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.coverTopStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topCoveredItem', separatorBefore: true },
      { value: 'rightCovered', createNode: () => new Text( QuantumWaveInterferenceFluent.coverBottomStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomCoveredItem' },
      { value: 'leftDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorTopStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'topDetectorItem', separatorBefore: true },
      { value: 'rightDetector', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorBottomStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bottomDetectorItem' },
      { value: 'bothDetectors', createNode: () => new Text( QuantumWaveInterferenceFluent.detectorBothStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'bothDetectorsItem' },
      { value: 'noBarrier', createNode: () => new Text( QuantumWaveInterferenceFluent.noBarrierStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'noBarrierItem', separatorBefore: true }
    ];

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

    this.sidewaysGraphNode = new SidewaysGraph(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isIntensityGraphVisibleProperty,
      waveRegionRight,
      waveRegionTop,
      tandem.createTandem( 'sidewaysGraphNode' ),
      {
        detectionModeProperty: model.currentDetectionModeProperty,
        initialZoomLevels: {
          averageIntensity: 3,
          hits: 'max'
        }
      }
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

    const tapeMeasureCheckbox = new ToolCheckbox(
      model.isTapeMeasureVisibleProperty,
      QuantumWaveInterferenceFluent.tapeMeasureStringProperty,
      tandem.createTandem( 'tapeMeasureCheckbox' ),
      ToolIcons.createTapeMeasureIcon(),
      QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleHelpTextStringProperty
    );
    const stopwatchCheckbox = new ToolCheckbox(
      model.isStopwatchVisibleProperty,
      QuantumWaveInterferenceFluent.stopwatchStringProperty,
      tandem.createTandem( 'stopwatchCheckbox' ),
      ToolIcons.createStopwatchIcon(),
      QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleHelpTextStringProperty
    );
    const timePlotCheckbox = new ToolCheckbox(
      model.isTimePlotVisibleProperty,
      QuantumWaveInterferenceFluent.timePlotStringProperty,
      tandem.createTandem( 'timePlotCheckbox' ),
      ToolIcons.createTimePlotIcon(),
      QuantumWaveInterferenceFluent.a11y.timePlotCheckbox.accessibleHelpTextStringProperty
    );
    const positionPlotCheckbox = new ToolCheckbox(
      model.isPositionPlotVisibleProperty,
      QuantumWaveInterferenceFluent.positionPlotStringProperty,
      tandem.createTandem( 'positionPlotCheckbox' ),
      ToolIcons.createPositionPlotIcon(),
      QuantumWaveInterferenceFluent.a11y.positionPlotCheckbox.accessibleHelpTextStringProperty
    );

    const rightControlsColumn = new RightControlsColumn( model, this, tandem, {
      screenGraphVisibleProperty: model.isIntensityGraphVisibleProperty,
      additionalScreenControlChildren: [ detectionModeRadioButtonGroupBox ],
      toolCheckboxes: [
        tapeMeasureCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox
      ],
      clearScreen: () => accessibleResponses.clearScreenAndEmitResponse( () => model.sceneProperty.value.clearScreen() ),
      onSnapshotCaptured: () => this.detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      resetView: () => {
        this.sidewaysGraphNode.reset();
        this.timePlotNode.reset();
        this.positionPlotNode.reset();
        this.detectorScreenNode.clearFlash();
      }
    } );

    this.addChild( rightControlsColumn );

    ManualConstraint.create( this, [ rightControlsColumn ], rightControlsColumnProxy => {
      rightControlsColumnProxy.right = this.layoutBounds.maxX - X_MARGIN;
      rightControlsColumnProxy.top = Y_MARGIN;
      topRowBeamRightLimitXProperty.value = rightControlsColumnProxy.left - TOP_ROW_BEAM_RIGHT_PANEL_GAP;
    } );

    this.addChild( rightControlsColumn.bottomButtonsRow );

    const rightPanelCenterX = this.layoutBounds.maxX - X_MARGIN - QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH / 2;
    this.addChild( rightControlsColumn.waveDisplayAndTimeControlsGroup );

    ManualConstraint.create( this, [ rightControlsColumn.bottomButtonsRow ], () => {
      rightControlsColumn.positionBottomButtonsRow( this.layoutBounds.maxX - X_MARGIN, this.layoutBounds.maxY - Y_MARGIN );
    } );

    ManualConstraint.create( this, [ rightControlsColumn.bottomButtonsRow, rightControlsColumn.waveDisplayAndTimeControlsGroup ], () => {
      rightControlsColumn.positionWaveDisplayAndTimeControlsGroup( rightPanelCenterX, this.layoutBounds.maxX - X_MARGIN );
    } );

    const measurementToolsNode = new MeasurementToolsNode( model, this.visibleBoundsProperty, waveRegionLeft, waveRegionTop, tandem );
    this.addChild( measurementToolsNode );
    this.timePlotNode = measurementToolsNode.timePlotNode;
    this.positionPlotNode = measurementToolsNode.positionPlotNode;

    const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
      model,
      model.currentSlitConfigurationProperty,
      {
        detectionModeProperty: model.currentDetectionModeProperty,
        slitOrientation: 'topBottom',
        includeExperimentSetupDetails: false,
        sourceNodes: [ topRowNode, sourceControlPanel, sceneRadioButtonGroup ],
        slitNodes: [ bottomRow ],
        detectorScreenControlNodes: [ rightControlsColumn ]
      }
    );
    this.addChild( screenViewDescription );

    this.addChild( accessibleResponses );

    this.pdomPlayAreaNode.pdomOrder = [
      screenViewDescription.sourceHeadingNode,
      screenViewDescription.slitsHeadingNode,
      this.sidewaysGraphNode,
      measurementToolsNode
    ];

    this.pdomControlAreaNode.pdomOrder = [
      screenViewDescription.detectorScreenHeadingNode,
      rightControlsColumn.waveDisplayAndTimeControlsGroup,
      rightControlsColumn.bottomButtonsRow
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
