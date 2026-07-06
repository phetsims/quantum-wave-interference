// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesScreenView is the top-level view for the Single Particles screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import AccessibleList, { type AccessibleListItem } from '../../../../scenery-phet/js/accessibility/AccessibleList.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import createAndAddSlitConfigurationControlsRow from '../../common/view/createAndAddSlitConfigurationControlsRow.js';
import createFrontFacingSlitDetectorOptions from '../../common/view/createFrontFacingSlitDetectorOptions.js';
import createStandardToolCheckboxes from '../../common/view/createStandardToolCheckboxes.js';
import BandAnalysis, { type EnvelopeHeuristicAnalysis } from '../../common/view/description/BandAnalysis.js';
import createPathDetectorsViewState from '../../common/view/description/createPathDetectorsViewState.js';
import DetectorPatternGraphDescriber from '../../common/view/description/DetectorPatternGraphDescriber.js';
import { type DetectorPatternGraphViewState, type DetectorProbeViewState, type DetectorScreenViewState, type MeasurementToolsViewState, type PathDetectorsViewState, type SlitBarrierViewState, type WaveVisualizationViewState } from '../../common/view/description/QuantumWaveInterferenceAccessibleViewState.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import QuantumWaveInterferenceScreenViewDescription from '../../common/view/description/QuantumWaveInterferenceScreenViewDescription.js';
import DetectorPatternGraphLayerNode from '../../common/view/DetectorPatternGraphLayerNode.js';
import DetectorScreenControls from '../../common/view/DetectorScreenControls.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import type DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import MaxHitsReachedPanel from '../../common/view/MaxHitsReachedPanel.js';
import MeasurementToolsLayerNode from '../../common/view/MeasurementToolsLayerNode.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import resetDetectorScreenView from '../../common/view/resetDetectorScreenView.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import stepDetectorScreenViewNodes from '../../common/view/stepDetectorScreenViewNodes.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import ToolCheckbox from '../../common/view/ToolCheckbox.js';
import WaveRegionNode from '../../common/view/WaveRegionNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';
import SingleParticlesAccessibleResponses from './description/SingleParticlesAccessibleResponses.js';
import DetectorProbeNode from './DetectorProbeNode.js';
import SingleParticleEmitterNode from './SingleParticleEmitterNode.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesScreenViewOptions = SelfOptions & StrictOmit<ScreenViewOptions, 'screenSummaryContent'>;

const LABEL_FONT = new PhetFont( 14 );

const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
const Y_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const CONTENT_VERTICAL_OFFSET = 12;
const TOP_ROW_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const THUMBNAIL_GAP = 55;
const WAVE_REGION_Y_OFFSET = -30;
const EMITTER_WAVE_REGION_OVERLAP = 2;
const MAX_HITS_REACHED_PANEL_SPACING = 10;

/**
 * Complete agent-facing accessibility snapshot for the Single Particles screen. Returned by getAccessibleViewState()
 * and consumed by screen-reader agents to describe the full simulation state in a single structured object.
 * Notable units: wavelengthNM is in nanometres, particleSpeedMetersPerSecond and effectiveWavelengthMeters are in SI,
 * slitSeparationMM is in millimetres, and screenBrightnessPercent is a 0–100 integer.
 * detectionMode is always 'hits' on this screen (no wave-intensity mode).
 */
type SingleParticlesAccessibleViewState = {
  sourceType: string;
  isPlaying: boolean;
  timeSpeed: string;
  isEmitting: boolean;
  isEmitterEnabled: boolean;
  isMaxHitsReached: boolean;
  autoRepeat: boolean;
  isPacketActive: boolean;
  detectionMode: 'hits';
  displayMode: 'screen' | 'graph';
  waveDisplayMode: string;
  slitConfiguration: string;
  wavelengthNM: number;
  particleSpeedMetersPerSecond: number;
  effectiveWavelengthMeters: number;
  slitSeparationMM: number;
  envelopeHeuristic: EnvelopeHeuristicAnalysis | null;
  totalHits: number;
  pathDetectors: PathDetectorsViewState;
  screenBrightnessPercent: number;
  numberOfSnapshots: number;
  detectorScreen: DetectorScreenViewState;
  detectorPatternGraph: DetectorPatternGraphViewState;
  waveVisualization: WaveVisualizationViewState;
  slitBarrier: SlitBarrierViewState;
  detectorProbe: DetectorProbeViewState;
  measurementTools: MeasurementToolsViewState;
};

export default class SingleParticlesScreenView extends ScreenView {

  private readonly model: SingleParticlesModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly detectorPatternGraphLayerNode: DetectorPatternGraphLayerNode;
  private readonly doubleSlitNode: DoubleSlitNode;
  private readonly detectorProbeNode: DetectorProbeNode;
  private readonly measurementToolsNode: MeasurementToolsLayerNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: SingleParticlesModel, providedOptions: SingleParticlesScreenViewOptions ) {
    const options = optionize<SingleParticlesScreenViewOptions, SelfOptions, ScreenViewOptions>()( {
      screenSummaryContent: new QuantumWaveInterferenceScreenSummaryContent(
        model,
        model.currentSlitConfigurationProperty,
        {
          detectionMode: 'hits',
          slitOrientation: 'topBottom',
          playAreaContent: QuantumWaveInterferenceFluent.a11y.screenSummary.playAreaSingleParticlesStringProperty,
          detectorScreenHasPatternProperty: model.currentTotalHitsProperty.derived( totalHits => totalHits > 0 )
        }
      )
    }, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );
    const sceneTandems = new Map<object, Tandem>( model.scenes.map( scene => [
      scene,
      scenesTandem.createTandem( `${scene.sourceType}Scene` )
    ] ) );
    const toolNodesTandem = tandem.createTandem( 'toolNodes' );

    // This top-level layout intentionally parallels HighIntensityScreenView while keeping screen-specific
    // controls and tandems explicit.
    const sourceControlPanelTandem = tandem.createTandem( 'sourceControlPanel' );
    const autoRepeatCheckbox = new Checkbox(
      model.currentAutoRepeatProperty,
      new Text( QuantumWaveInterferenceFluent.autoRepeatStringProperty, { font: LABEL_FONT, maxWidth: 120 } ),
      {
        boxWidth: 16,
        spacing: 6,
        touchAreaXDilation: 5,
        touchAreaYDilation: 4,
        mouseAreaXDilation: 5,
        mouseAreaYDilation: 4,
        accessibleName: QuantumWaveInterferenceFluent.a11y.autoRepeatCheckbox.accessibleNameStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.autoRepeatCheckbox.accessibleHelpTextStringProperty,

        // Nested under the panel that contains this checkbox in the view.
        tandem: sourceControlPanelTandem.createTandem( 'autoRepeatCheckbox' )
      }
    );

    const sourceControlPanel = new SourceControlPanel( model.sceneProperty, model.scenes, sceneTandems, {
      tandem: sourceControlPanelTandem,
      additionalContent: autoRepeatCheckbox
    } );

    // Emitter source with SingleParticleEmitter.svg image and red toggle button
    const emitterNode = new SingleParticleEmitterNode(
      model.sceneProperty,
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

    const baseWaveRegionTop = Y_MARGIN + TOP_ROW_CENTER_Y + THUMBNAIL_GAP;
    const waveRegionTop = baseWaveRegionTop + WAVE_REGION_Y_OFFSET;
    const waveRegionLeft = X_MARGIN + leftColumnWidth + 20;
    const waveRegionRight = waveRegionLeft + WAVE_REGION_WIDTH;
    const slitControlsBottom = this.layoutBounds.maxY - Y_MARGIN;

    const maxHitsReachedPanel = new MaxHitsReachedPanel( tandem.createTandem( 'maxHitsReachedPanel' ) );
    model.currentIsMaxHitsReachedProperty.link( isMaxHitsReached => {
      maxHitsReachedPanel.visible = isMaxHitsReached;
    } );

    // Narrates source start/stop, per-packet wave progress, hits, and max hits, and provides the PDOM state items
    // for the current packet status.
    const accessibleResponses = new SingleParticlesAccessibleResponses( model );
    this.addChild( accessibleResponses );

    const waveRegionNode = new WaveRegionNode( model, {
      tandem: tandem,
      waveRegionLeft: waveRegionLeft,
      waveRegionTop: waveRegionTop,
      additionalDoubleSlitOptions: createFrontFacingSlitDetectorOptions(
        model.currentSlitConfigurationProperty,
        model.currentLeftDetectorHitsProperty,
        model.currentRightDetectorHitsProperty
      )
    } );
    this.detectorScreenNode = new DetectorScreenNode( model.sceneProperty, {
      x: waveRegionRight -
         QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH *
         QuantumWaveInterferenceConstants.DETECTOR_SCREEN_OVERLAP_FRACTION,
      y: waveRegionTop -
         QuantumWaveInterferenceConstants.DETECTOR_SCREEN_SKEW *
         QuantumWaveInterferenceConstants.DETECTOR_SCREEN_VISIBLE_FRACTION
    } );
    this.addChild( this.detectorScreenNode );

    this.waveVisualizationNode = waveRegionNode.waveVisualizationNode;
    this.doubleSlitNode = waveRegionNode.doubleSlitNode;
    this.addChild( waveRegionNode );
    this.addChild( emitterNode );
    this.addChild( maxHitsReachedPanel );

    this.addChild( particleMassAnnotation );
    ManualConstraint.create(
      this,
      [ emitterNode, maxHitsReachedPanel, particleMassAnnotation ],
      ( emitterProxy, maxHitsReachedPanelProxy, particleMassAnnotationProxy ) => {
        emitterProxy.right = waveRegionLeft + EMITTER_WAVE_REGION_OVERLAP;
        emitterProxy.centerY = waveRegionTop + QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT / 2;

        maxHitsReachedPanelProxy.left = emitterProxy.right + MAX_HITS_REACHED_PANEL_SPACING;
        maxHitsReachedPanelProxy.centerY = emitterProxy.centerY;

        particleMassAnnotationProxy.centerX = sourceControlPanel.centerX;
        particleMassAnnotationProxy.top = emitterProxy.top;
      }
    );

    const slitConfigurationContextResponseProperty = new DerivedProperty(
      [
        model.currentIsEmittingProperty,
        model.isPlayingProperty,
        model.currentSlitConfigurationProperty
      ],
      ( isEmitting, isPlaying, slitConfiguration ) => {

        // Only announce "Source restarted." when the source is emitting AND the sim is playing; while paused, changing
        // the slit configuration describes the new configuration instead of claiming the source restarted.
        return QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.slitConfigurationChanged.format( {
          isRestarting: ( isEmitting && isPlaying ) ? 'true' : 'false',
          slitSetting: slitConfiguration,
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.sourceRestartedStringProperty.value
        } );
      }
    );

    const bottomRow = createAndAddSlitConfigurationControlsRow(
      model.currentSlitConfigurationProperty,
      model.sceneProperty,
      model.scenes,
      sceneTandems,
      waveRegionLeft,
      slitControlsBottom,
      this,
      tandem,
      {
        topCoveredTandemName: 'topClosedItem',
        bottomCoveredTandemName: 'bottomClosedItem'
      },
      slitConfigurationContextResponseProperty
    );

    // Hits graph (always in Hits mode on this screen)
    this.detectorPatternGraphLayerNode = new DetectorPatternGraphLayerNode(
      model.sceneProperty,
      this.detectorScreenNode,
      model.isGraphVisibleProperty,
      waveRegionRight,
      waveRegionTop,
      tandem.createTandem( 'detectorPatternGraphNode' ),
      {
        initialZoomLevel: 'max',
        createZoomButtonGroupAccessibleParagraphProperty: zoomLevelProperty =>
          QuantumWaveInterferenceFluent.a11y.singleParticlesScreen.detectorPatternGraph.zoomButtonGroup.accessibleParagraph.createProperty( {
            level: zoomLevelProperty
          } )
      }
    );
    this.addChild( this.detectorPatternGraphLayerNode );

    // Detector probe (draggable circle + panel, Single Particles only)
    const detectorProbeNode = new DetectorProbeNode(
      model.currentDetectorProbe,
      waveRegionLeft,
      waveRegionTop,
      () => bottomRow.getSlitSeparationControlCenterX(),
      () => bottomRow.getSlitSeparationControlCenterY(),
      toolNodesTandem.createTandem( 'detectorProbeNode' )
    );
    this.detectorProbeNode = detectorProbeNode;
    this.addChild( detectorProbeNode );

    // --- Detector screen controls ---

    // Same tandem as the tools panel created inside DetectorScreenControls (Tandem.createTandem memoizes children),
    // so these injected checkboxes nest under the panel in the PhET-iO tree.
    const toolsPanelTandem = tandem.createTandem( 'toolsPanel' );

    const { measuringTapeCheckbox, stopwatchCheckbox, timePlotCheckbox, positionPlotCheckbox } =
      createStandardToolCheckboxes( model, toolsPanelTandem );
    // Detector probe checkbox is only shown when barrier is None; its checked state is preserved in the model.
    const detectorProbeCheckboxTandem = toolsPanelTandem.createTandem( 'detectorProbeCheckbox' );
    const detectorProbeCheckbox = new ToolCheckbox(
      model.currentDetectorProbe.isVisibleProperty,
      QuantumWaveInterferenceFluent.detectorProbeStringProperty,
      detectorProbeCheckboxTandem,
      QuantumWaveInterferenceFluent.a11y.singleParticlesScreen.detectorProbeCheckbox.accessibleHelpTextStringProperty,
      new GatedVisibleProperty( model.currentDetectorProbe.isAvailableProperty, detectorProbeCheckboxTandem )
    );

    const detectorScreenControls = new DetectorScreenControls( model, this, tandem, {
      screenGraphVisibleProperty: model.isGraphVisibleProperty,
      additionalScreenControlChildren: [],
      toolCheckboxes: [
        measuringTapeCheckbox,
        stopwatchCheckbox,
        timePlotCheckbox,
        positionPlotCheckbox,
        detectorProbeCheckbox
      ],
      clearScreen: () => model.sceneProperty.value.clearScreen(),
      onSnapshotCaptured: () => this.detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      slitOrientation: 'topBottom',
      resetView: () => resetDetectorScreenView(
        this.detectorPatternGraphLayerNode,
        this.timePlotNode,
        this.positionPlotNode,
        this.detectorScreenNode
      )
    } );

    this.addChild( detectorScreenControls );

    ManualConstraint.create( this, [ detectorScreenControls ], detectorScreenControlsProxy => {
      detectorScreenControlsProxy.right = this.layoutBounds.maxX - X_MARGIN;
      detectorScreenControlsProxy.top = Y_MARGIN;
    } );

    this.addChild( detectorScreenControls.bottomButtonsRow );

    const rightPanelCenterX = this.layoutBounds.maxX - X_MARGIN - QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH / 2;
    this.addChild( detectorScreenControls.waveDisplayAndTimeControlsGroup );

    ManualConstraint.create( this, [ detectorScreenControls.bottomButtonsRow ], () => {
      detectorScreenControls.positionBottomButtonsRow( this.layoutBounds.maxX - X_MARGIN, this.layoutBounds.maxY - Y_MARGIN );
    } );

    ManualConstraint.create( this, [ detectorScreenControls.bottomButtonsRow, detectorScreenControls.waveDisplayAndTimeControlsGroup ], () => {
      detectorScreenControls.positionWaveDisplayAndTimeControlsGroup( rightPanelCenterX, this.layoutBounds.maxX - X_MARGIN, this.layoutBounds.maxY - Y_MARGIN );
    } );

    const measurementToolsNode = new MeasurementToolsLayerNode(
      model,
      this.visibleBoundsProperty,
      waveRegionLeft,
      waveRegionTop,
      toolNodesTandem
    );
    this.measurementToolsNode = measurementToolsNode;
    this.addChild( measurementToolsNode );
    this.timePlotNode = measurementToolsNode.timePlotNode;
    this.positionPlotNode = measurementToolsNode.positionPlotNode;

    // Pattern-state summary mirroring the Experiment screen's "Detector Screen and Experiment Details" structure:
    // a leading paragraph summarizing the detector screen, with one bullet for the current status. The packet is
    // transient, so milestone descriptions do not accumulate as on the High Intensity screen — the single bullet
    // describes the in-flight packet (moving packet, at slits, interfering) or the hits pattern once particles have
    // landed. While a packet is propagating but the screen is still empty, the status is 'emptyWavePropagating' so
    // the paragraph does not claim the experiment is "ready".
    const detectorScreenStatusProperty = new DerivedProperty(
      [ model.currentTotalHitsProperty, model.currentIsEmittingProperty ],
      ( totalHits, isEmitting ) =>
        totalHits > 0 ? 'pattern' as const :
        isEmitting ? 'emptyWavePropagating' as const :
        'empty' as const
    );

    // While the graph view is active, the histogram's own description is the final bullet.
    const graphDescriber = new DetectorPatternGraphDescriber( model.sceneProperty, new BooleanProperty( false ) );
    const graphDetailItem: AccessibleListItem = {
      stringProperty: graphDescriber.descriptionProperty,
      visibleProperty: model.isGraphVisibleProperty
    };

    // Announce the screen/graph switch, chaining the current graph contents into the same response so a
    // screen-reader user hears whether the revealed graph has data (mirrors the High Intensity screen).
    model.isGraphVisibleProperty.lazyLink( isGraphVisible => {
      accessibleResponses.addAccessibleContextResponse(
        QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.displayModeChanged.format( {
          displayMode: isGraphVisible ? 'graph' : 'screen',
          graphState: graphDescriber.descriptionProperty.value
        } )
      );
    } );

    const detectorScreenDetailsNode = new Node( {
      accessibleTemplate: AccessibleList.createTemplateProperty( {
        leadingParagraphStringProperty: QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.leadingParagraph.createProperty( {
          detectionMode: 'hits',
          sourceType: model.sceneProperty.derived( scene => scene.sourceType ),
          surface: model.isGraphVisibleProperty.derived( isGraphVisible => isGraphVisible ? 'graph' as const : 'detectorScreen' as const ),
          detectorScreenStatus: detectorScreenStatusProperty
        } ),
        listItems: [ accessibleResponses.autoRepeatStatusItem, accessibleResponses.packetStatusItem, graphDetailItem ]
      } )
    } );
    this.addChild( detectorScreenDetailsNode );

    const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
      model,
      model.currentSlitConfigurationProperty,
      {
        screenGraphVisibleProperty: model.isGraphVisibleProperty,
        slitOrientation: 'topBottom',
        detectorScreenDetailsNodes: [ detectorScreenDetailsNode ],
        // Tab order: Source Emitter, then Auto-fire checkbox, then the source controls (Wavelength). The checkbox is
        // visually inside sourceControlPanel, so listing it before the panel pulls it out to sit right after the
        // emitter, keeping the tightly-related Source Emitter and Auto-fire controls adjacent. See
        // https://github.com/phetsims/quantum-wave-interference/issues/268.
        sourceNodes: [ emitterNode, autoRepeatCheckbox, maxHitsReachedPanel, sourceControlPanel, sceneRadioButtonGroup ],
        slitNodes: [ bottomRow, waveRegionNode.doubleSlitNode ],
        detectorScreenControlNodes: [ detectorScreenControls ]
      }
    );
    this.addChild( screenViewDescription );

    this.pdomPlayAreaNode.pdomOrder = [
      screenViewDescription.detectorScreenAndExperimentDetailsHeadingNode,
      screenViewDescription.sourceHeadingNode,
      screenViewDescription.slitsHeadingNode,
      screenViewDescription.detectorScreenHeadingNode,
      this.detectorPatternGraphLayerNode,
      detectorProbeNode,
      measurementToolsNode
    ];

    this.pdomControlAreaNode.pdomOrder = [
      detectorScreenControls.waveDisplayAndTimeControlsGroup,
      detectorScreenControls.bottomButtonsRow
    ];
  }

  /**
   * Gets authored semantic view state for agent-facing accessibility snapshots.
   *
   * Called at runtime by the description editor.
   *
   * @returns current Single Particles accessible view state
   */
  private getAccessibleViewState(): SingleParticlesAccessibleViewState {
    const scene = this.model.sceneProperty.value;
    const measurementTools = this.measurementToolsNode.getAccessibleViewState().measurementTools;
    const slitBarrier = this.doubleSlitNode.getAccessibleViewState()?.slitBarrier;
    const slitConfiguration = this.model.currentSlitConfigurationProperty.value;
    const envelopeHeuristic = BandAnalysis.analyzeEnvelopeHeuristic( scene );

    affirm( slitBarrier, 'Expected Single Particles slit-barrier view state.' );

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/view/ExperimentScreenView.ts.
    // These common accessible-state fields stay inline because the screens expose different authored state shapes.
    return Object.assign(
      {
        sourceType: scene.sourceType,
        isPlaying: this.model.isPlayingProperty.value,
        timeSpeed: this.model.timeSpeedProperty.value.name,
        isEmitting: this.model.currentIsEmittingProperty.value,
        isEmitterEnabled: this.model.currentIsEmitterEnabledProperty.value,
        isMaxHitsReached: this.model.currentIsMaxHitsReachedProperty.value,
        autoRepeat: this.model.currentAutoRepeatProperty.value,
        isPacketActive: this.model.currentIsPacketActiveProperty.value,
        detectionMode: 'hits' as const,
        displayMode: this.model.isGraphVisibleProperty.value ? 'graph' as const : 'screen' as const,
        waveDisplayMode: this.model.currentWaveDisplayModeProperty.value,
        slitConfiguration: slitConfiguration,
        wavelengthNM: this.model.currentWavelengthProperty.value,
        particleSpeedMetersPerSecond: this.model.currentParticleSpeedProperty.value,
        effectiveWavelengthMeters: scene.getEffectiveWavelength(),
        slitSeparationMM: this.model.currentSlitSeparationProperty.value,
        envelopeHeuristic: envelopeHeuristic,
        totalHits: this.model.currentTotalHitsProperty.value,
        pathDetectors: createPathDetectorsViewState(
          slitConfiguration,
          this.model.currentLeftDetectorHitsProperty.value,
          this.model.currentRightDetectorHitsProperty.value
        ),
        screenBrightnessPercent: scene.screenBrightnessProperty.value,
        numberOfSnapshots: this.model.currentNumberOfSnapshotsProperty.value
      },
      this.detectorScreenNode.getAccessibleViewState(),
      this.detectorPatternGraphLayerNode.getAccessibleViewState(),
      this.waveVisualizationNode.getAccessibleViewState(),
      {
        slitBarrier: slitBarrier,
        measurementTools: measurementTools
      },
      this.detectorProbeNode.getAccessibleViewState()
    );
  }

  public override step( dt: number ): void {
    super.step( dt );

    // NOTE: see other duplicate in quantum-wave-interference/js/high-intensity/view/HighIntensityScreenView.ts.
    // Both screens call the shared step helper, but each passes its own screen-specific node fields.
    stepDetectorScreenViewNodes(
      this.model,
      dt,
      this.waveVisualizationNode,
      this.detectorScreenNode,
      this.detectorPatternGraphLayerNode,
      this.timePlotNode,
      this.positionPlotNode
    );
  }
}
