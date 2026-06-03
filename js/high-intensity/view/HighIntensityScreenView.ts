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
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import createAndAddSlitConfigurationControlsRow from '../../common/view/createAndAddSlitConfigurationControlsRow.js';
import createFrontFacingSlitDetectorOptions from '../../common/view/createFrontFacingSlitDetectorOptions.js';
import createStandardToolCheckboxes from '../../common/view/createStandardToolCheckboxes.js';
import BandAnalysis from '../../common/view/description/BandAnalysis.js';
import QuantumWaveInterferenceScreenSummaryContent from '../../common/view/description/QuantumWaveInterferenceScreenSummaryContent.js';
import QuantumWaveInterferenceScreenViewDescription from '../../common/view/description/QuantumWaveInterferenceScreenViewDescription.js';
import DetectorScreenNode from '../../common/view/DetectorScreenNode.js';
import type DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import MeasurementToolsLayerNode from '../../common/view/MeasurementToolsLayerNode.js';
import ParticleMassAnnotationNode from '../../common/view/ParticleMassAnnotationNode.js';
import PositionPlotNode from '../../common/view/PositionPlotNode.js';
import DetectorScreenControls from '../../common/view/DetectorScreenControls.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import DetectorPatternGraphLayerNode from '../../common/view/DetectorPatternGraphLayerNode.js';
import resetDetectorScreenView from '../../common/view/resetDetectorScreenView.js';
import SlitConfigurationControlsRow from '../../common/view/SlitConfigurationControlsRow.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import stepDetectorScreenViewNodes from '../../common/view/stepDetectorScreenViewNodes.js';
import TimePlotNode from '../../common/view/TimePlotNode.js';
import WaveRegionNode from '../../common/view/WaveRegionNode.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import { getWavelengthColorZone, type WavelengthColorZone } from '../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import { DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD } from '../model/HighIntensitySceneModel.js';
import type HighIntensitySceneModel from '../model/HighIntensitySceneModel.js';
import HighIntensityAccessibleResponses from './description/HighIntensityAccessibleResponses.js';
import { type HighIntensityAccessibleViewState, type HighIntensitySemanticAccessibleViewState, type QWIBandSpacingDescription, type QWIClockSpeedDescription, type QWIPatternFormation, type QWIPatternKind, type QWIWavefrontSpacing, type QWIWaveProgressCheckpoint, type QWIWaveProgressStage, type QWIWaveSpeedDescription } from './description/HighIntensityAccessibleViewState.js';
import QWIAccessibleStateTemplate from './description/QWIAccessibleStateTemplate.js';
import HighIntensitySourceBeamCalloutNode from './HighIntensitySourceBeamCalloutNode.js';

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
  doubleSlitNode: DoubleSlitNode;
  waveVisualizationNode: WaveVisualizationNode;
};

type MeasurementToolNodes = {
  measurementToolsNode: MeasurementToolsLayerNode;
  timePlotNode: TimePlotNode;
  positionPlotNode: PositionPlotNode;
};

const LABEL_FONT = new PhetFont( 14 );

const CONTENT_VERTICAL_OFFSET = 12;
const SOURCE_BEAM_RIGHT_PANEL_GAP = 10;

const SOURCE_BEAM_CALLOUT_CENTER_Y = 40 + CONTENT_VERTICAL_OFFSET;
const SOURCE_BEAM_CALLOUT_TO_MASS_LABEL_SPACING = 12;
const WAVE_REGION_Y_OFFSET = -30;

// Extra vertical space below the source beam callout to accommodate the zoom-callout lines between the
// mini-symbol and the top of the main wave region.
const CALLOUT_GAP = 55;

const getPatternKind = ( slitConfiguration: SlitConfigurationWithNoBarrier ): QWIPatternKind =>
  slitConfiguration === 'noBarrier' ? 'noBarrier' :
  showsDoubleSlitInterferencePattern( slitConfiguration ) ? 'doubleSlitInterference' :
  ( slitConfiguration === 'leftDetector' || slitConfiguration === 'rightDetector' || slitConfiguration === 'bothDetectors' ) ? 'whichPathDiffraction' :
  'singleSlitDiffraction';

const getPatternFormation = ( scene: HighIntensitySceneModel, model: HighIntensityModel ): QWIPatternFormation => {
  if ( scene.detectionModeProperty.value === 'hits' ) {
    return scene.totalHitsProperty.value > 0 ? 'collectingHits' :
           scene.isEmittingProperty.value ? 'collectingHits' :
           'empty';
  }

  if ( !scene.isEmittingProperty.value ) {
    return 'empty';
  }

  if ( !model.isPlayingProperty.value ) {
    return 'paused';
  }

  const formationFactor = scene.detectorPatternFormationFactorProperty.value;
  return formationFactor >= DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD ? 'complete' :
         formationFactor > 0 ? 'forming' :
         'empty';
};

const getClockSpeedDescription = ( model: HighIntensityModel ): QWIClockSpeedDescription => {
  const timeSpeed = model.timeSpeedProperty.value;
  return timeSpeed === TimeSpeed.SLOW ? 'slow' :
         timeSpeed === TimeSpeed.NORMAL ? 'normal' :
         timeSpeed === TimeSpeed.FAST ? 'fast' :
         ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
};

const getWavefrontSpacing = (
  scene: HighIntensitySceneModel,
  effectiveWavelengthMeters: number,
  wavelengthColorZone: WavelengthColorZone | null
): QWIWavefrontSpacing => {
  if ( scene.sourceType === 'photons' ) {
    return ( wavelengthColorZone === 'violet' || wavelengthColorZone === 'blue' ) ? 'tightlyPacked' :
           ( wavelengthColorZone === 'red' || wavelengthColorZone === 'orange' ) ? 'widelySpaced' :
           'moderatelySpaced';
  }

  const defaultEffectiveWavelength = scene.regionWidth / QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;
  const relativeWavelength = effectiveWavelengthMeters / defaultEffectiveWavelength;
  return relativeWavelength <= 0.85 ? 'tightlyPacked' :
         relativeWavelength >= 1.15 ? 'widelySpaced' :
         'moderatelySpaced';
};

const getWaveSpeedDescription = ( scene: HighIntensitySceneModel ): QWIWaveSpeedDescription => {
  if ( scene.sourceType === 'photons' ) {
    return 'fast';
  }

  const speedRange = scene.velocityProperty.range;
  const speedFraction = ( scene.velocityProperty.value - speedRange.min ) / speedRange.getLength();
  return speedFraction <= 1 / 3 ? 'slow' :
         speedFraction >= 2 / 3 ? 'fast' :
         'medium';
};

const getBandSpacingDescription = ( bandCount: number ): QWIBandSpacingDescription =>
  bandCount <= 5 ? 'farApart' :
  bandCount >= 13 ? 'closelySpaced' :
  'mediumSpaced';

const getWaveProgress = (
  scene: HighIntensitySceneModel,
  patternKind: QWIPatternKind
): HighIntensitySemanticAccessibleViewState['waveProgress'] => {
  if ( !scene.isEmittingProperty.value ) {
    return {
      stage: 'sourceOff',
      checkpoint: 'none',
      wavefrontPercent: 0,
      hasReachedSlits: false,
      hasPassedSlits: false,
      hasReachedScreen: false
    };
  }

  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const waveSolverState = scene.waveSolver.getState();
  const solverTime = scene.waveSolver.getTime();
  const sourceOnTime = 'sourceOnTime' in waveSolverState && typeof waveSolverState.sourceOnTime === 'number' ?
                       waveSolverState.sourceOnTime :
                       solverTime;
  const wavefrontX = propagationSpeed * Math.max( 0, solverTime - sourceOnTime );
  const wavefrontFraction = clamp( wavefrontX / scene.regionWidth, 0, 1 );
  const slitFraction = scene.slitPositionFractionProperty.value;
  const slitWindow = 0.04;
  const slitSeparationFraction = scene.slitSeparationProperty.value * 1e-3 / scene.regionWidth;
  const circularWavesOverlapFraction = slitFraction + Math.max( slitWindow, slitSeparationFraction / 2 );
  const hasReachedSlits = wavefrontFraction >= slitFraction;
  const hasPassedSlits = wavefrontFraction > slitFraction + slitWindow;
  const hasReachedScreen = wavefrontFraction >= 1;
  const checkpoint: QWIWaveProgressCheckpoint =
    hasReachedScreen ? 'full' :
    wavefrontFraction >= 0.75 ? 'threeQuarters' :
    wavefrontFraction >= 0.5 ? 'half' :
    wavefrontFraction >= 0.25 ? 'quarter' :
    'none';
  const stage: QWIWaveProgressStage =
    hasReachedScreen ? 'hittingScreen' :
    patternKind === 'noBarrier' ? 'directToScreen' :
    Math.abs( wavefrontFraction - slitFraction ) <= slitWindow ? 'atSlits' :
    !hasReachedSlits ? 'travelingToSlits' :
    patternKind === 'doubleSlitInterference' && wavefrontFraction < circularWavesOverlapFraction ? 'atSlits' :
    patternKind === 'doubleSlitInterference' ? 'interferingAfterSlits' :
    patternKind === 'whichPathDiffraction' ? 'whichPathAfterSlits' :
    'diffractingAfterSlits';

  return {
    stage: stage,
    checkpoint: checkpoint,
    wavefrontPercent: roundSymmetric( wavefrontFraction * 100 ),
    hasReachedSlits: hasReachedSlits,
    hasPassedSlits: hasPassedSlits,
    hasReachedScreen: hasReachedScreen
  };
};

export default class HighIntensityScreenView extends ScreenView {

  private readonly model: HighIntensityModel;
  private readonly waveVisualizationNode: WaveVisualizationNode;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly detectorPatternGraphLayerNode: DetectorPatternGraphLayerNode;
  private readonly doubleSlitNode: DoubleSlitNode;
  private readonly measurementToolsNode: MeasurementToolsLayerNode;
  private readonly timePlotNode: TimePlotNode;
  private readonly positionPlotNode: PositionPlotNode;

  public constructor( model: HighIntensityModel, providedOptions: HighIntensityScreenViewOptions ) {
    const options = optionize<HighIntensityScreenViewOptions, SelfOptions, ScreenViewOptions>()( {}, providedOptions );

    super( options );

    this.model = model;

    const tandem = options.tandem;
    let accessibleResponses: HighIntensityAccessibleResponses | null = null;

    // Keep this top-level sequence aligned with the visual layers: source controls, wave region,
    // detector readouts, detector screen controls, tools, and accessible description.
    const sourceControlNodes = this.createAndAddSourceControls( model, tandem );
    const waveRegionLayout = this.createWaveRegionLayout( sourceControlNodes.leftColumnWidth );
    const sourceBeamRightLimitXProperty = new NumberProperty( this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN );
    const sourceBeamCalloutNode = this.createAndAddSourceBeamCalloutNode(
      model,
      sourceControlNodes.leftColumnCenterX,
      waveRegionLayout,
      sourceBeamRightLimitXProperty,
      tandem
    );
    this.positionAndAddParticleMassAnnotation( sourceControlNodes.particleMassAnnotation, sourceBeamCalloutNode );

    const waveRegionNodes = this.createAndAddWaveRegionNodes( model, waveRegionLayout );
    this.detectorScreenNode = waveRegionNodes.detectorScreenNode;
    this.waveVisualizationNode = waveRegionNodes.waveVisualizationNode;
    this.doubleSlitNode = waveRegionNodes.doubleSlitNode;

    const bottomRow = this.createAndAddSlitControls( model, waveRegionLayout, tandem );
    this.detectorPatternGraphLayerNode = this.createAndAddDetectorPatternGraphLayerNode( model, this.detectorScreenNode, waveRegionLayout, tandem );

    const detectorScreenControls = this.createAndAddDetectorScreenControls(
      model,
      () => {
        assert && assert( accessibleResponses, 'Expected accessible responses to be initialized before clearing the screen.' );
        accessibleResponses!.clearScreenAndEmitResponse( () => model.sceneProperty.value.clearScreen() );
      },
      this.detectorPatternGraphLayerNode,
      this.detectorScreenNode,
      sourceBeamRightLimitXProperty,
      tandem
    );

    const measurementToolNodes = this.createAndAddMeasurementTools( model, waveRegionLayout, tandem );
    this.measurementToolsNode = measurementToolNodes.measurementToolsNode;
    this.timePlotNode = measurementToolNodes.timePlotNode;
    this.positionPlotNode = measurementToolNodes.positionPlotNode;

    const getAccessibleViewState = () => this.getAccessibleViewState();
    accessibleResponses = new HighIntensityAccessibleResponses( model, getAccessibleViewState );

    const screenViewDescription = this.createAndAddScreenViewDescription(
      model,
      sourceBeamCalloutNode,
      sourceControlNodes.sourceControlPanel,
      sourceControlNodes.sceneRadioButtonGroup,
      bottomRow,
      waveRegionNodes.doubleSlitNode,
      detectorScreenControls
    );

    this.addChild( accessibleResponses );
    this.setHighIntensityPDOMOrder( screenViewDescription, measurementToolNodes.measurementToolsNode, detectorScreenControls );

    this.screenSummaryContent = new QuantumWaveInterferenceScreenSummaryContent(
      model,
      model.currentSlitConfigurationProperty,
      {
        detectionMode: model.currentDetectionModeProperty,
        slitOrientation: 'topBottom',
        detectorScreenHasPatternProperty: DerivedProperty.deriveAny(
          [
            model.sceneProperty,
            model.currentIsEmittingProperty,
            model.currentDetectionModeProperty,
            model.currentTotalHitsProperty,
            model.accessibleStateStepProperty
          ],
          () => model.currentDetectionModeProperty.value === 'averageIntensity' ?
                model.currentIsEmittingProperty.value && model.sceneProperty.value.hasWavefrontReachedScreen() :
                model.currentTotalHitsProperty.value > 0
        ),
        currentDetailsContent: QWIAccessibleStateTemplate.createCurrentDetailsTemplateProperty(
          model,
          getAccessibleViewState
        )
      }
    );
  }

  /**
   * Gets the full High Intensity screen snapshot for agent-facing accessibility APIs. The returned state combines
   * model-derived experiment meaning with view-owned descriptions for the detector, graph, wave display, slit barrier,
   * and measurement tools.
   *
   * @returns current High Intensity accessible view state
   */
  public getAccessibleViewState(): HighIntensityAccessibleViewState {
    const measurementTools = this.measurementToolsNode.getAccessibleViewState().measurementTools;
    const slitBarrier = this.doubleSlitNode.getAccessibleViewState()?.slitBarrier;

    assert && assert( slitBarrier, 'Expected High Intensity slit-barrier view state.' );

    return Object.assign(
      this.getSemanticAccessibleViewState(),
      this.detectorScreenNode.getAccessibleViewState(),
      this.detectorPatternGraphLayerNode.getAccessibleViewState(),
      this.waveVisualizationNode.getAccessibleViewState(),
      {
        slitBarrier: slitBarrier!,
        measurementTools: measurementTools
      }
    );
  }

  /**
   * Gets the model-derived semantic fragment of the full High Intensity accessible view state.
   *
   * @returns semantic accessibility state for the current experiment
   */
  private getSemanticAccessibleViewState(): HighIntensitySemanticAccessibleViewState {
    const scene = this.model.sceneProperty.value;
    const slitConfiguration = scene.slitConfigurationProperty.value;
    const patternKind = getPatternKind( slitConfiguration );
    const isDoubleSlitInterference = patternKind === 'doubleSlitInterference';
    const detectorScreenHalfWidth = scene.regionWidth / 2;
    const bandAnalysis = BandAnalysis.analyzeTheoreticalPattern( scene, detectorScreenHalfWidth );
    const hitStage = BandAnalysis.getHitStage( scene.totalHitsProperty.value, isDoubleSlitInterference );
    const effectiveWavelengthMeters = scene.getEffectiveWavelength();
    const wavelengthColorZone = scene.sourceType === 'photons' ? getWavelengthColorZone( roundSymmetric( scene.wavelengthProperty.value ) ) : null;
    const waveProgress = getWaveProgress( scene, patternKind );

    return {
      sourceType: scene.sourceType,
      isPlaying: this.model.isPlayingProperty.value,
      clockSpeedDescription: getClockSpeedDescription( this.model ),
      isEmitting: scene.isEmittingProperty.value,
      isEmitterEnabled: scene.isEmitterEnabledProperty.value,
      isMaxHitsReached: scene.isMaxHitsReachedProperty.value,
      detectionMode: scene.detectionModeProperty.value,
      displayMode: this.model.isIntensityGraphVisibleProperty.value ? 'graph' : 'screen',
      screenBrightness: scene.screenBrightnessProperty.value,
      screenBrightnessPercent: roundSymmetric( scene.screenBrightnessProperty.value / scene.screenBrightnessProperty.range.max * 100 ),
      waveDisplayMode: scene.activeWaveDisplayModeProperty.value,
      slitConfiguration: slitConfiguration,
      patternKind: patternKind,
      isDoubleSlitInterference: isDoubleSlitInterference,
      wavelengthNM: roundSymmetric( scene.wavelengthProperty.value ),
      wavelengthColorZone: wavelengthColorZone,
      wavefrontSpacing: getWavefrontSpacing( scene, effectiveWavelengthMeters, wavelengthColorZone ),
      particleSpeedMetersPerSecond: roundSymmetric( scene.velocityProperty.value ),
      waveSpeedDescription: getWaveSpeedDescription( scene ),
      effectiveWavelengthPicometers: Number( toFixed( effectiveWavelengthMeters * 1e12, 2 ) ),
      slitSeparationMM: slitConfiguration === 'noBarrier' ? null : scene.slitSeparationProperty.value,
      slitSeparationMicrometers: slitConfiguration === 'noBarrier' ? null : Number( toFixed( scene.slitSeparationProperty.value * 1000, 2 ) ),
      bandSpacingDescription: getBandSpacingDescription( bandAnalysis.bandCount ),
      hitStage: hitStage,
      totalHits: scene.totalHitsProperty.value,
      patternFormation: getPatternFormation( scene, this.model ),
      waveProgress: waveProgress,
      leftDetectorHits: scene.leftDetectorHitsProperty.value,
      rightDetectorHits: scene.rightDetectorHitsProperty.value,
      numberOfSnapshots: scene.numberOfSnapshotsProperty.value
    };
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
   * Calculates the fixed wave-region coordinates shared by the source beam callout, wave area,
   * slit controls, graph, and measurement tools.
   *
   * @param leftColumnWidth - width of the source controls column
   * @returns coordinates for the wave region and slit controls
   */
  private createWaveRegionLayout( leftColumnWidth: number ): WaveRegionLayout {
    const waveRegionLeft = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + leftColumnWidth + 20;
    const baseWaveRegionTop = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN + SOURCE_BEAM_CALLOUT_CENTER_Y + CALLOUT_GAP;
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
   * Creates the source emitter, beam, mini-symbol, and callouts that connect the source to the main wave region.
   *
   * @param model - the screen model that owns source, barrier, and slit state
   * @param leftColumnCenterX - horizontal center for the source controls column
   * @param waveRegionLayout - coordinates for the main wave region
   * @param sourceBeamRightLimitXProperty - mutable right limit that responds to the detector-screen controls width
   * @param tandem - parent tandem for child instrumentation
   * @returns the source beam callout node, used for particle-mass annotation layout and accessible description
   */
  private createAndAddSourceBeamCalloutNode(
    model: HighIntensityModel,
    leftColumnCenterX: number,
    waveRegionLayout: WaveRegionLayout,
    sourceBeamRightLimitXProperty: NumberProperty,
    tandem: Tandem
  ): HighIntensitySourceBeamCalloutNode<HighIntensitySceneModel> {
    const sourceBeamCalloutNode = new HighIntensitySourceBeamCalloutNode(
      model,
      this.visibleBoundsProperty,
      sourceBeamRightLimitXProperty,
      {
        emitterCenterX: leftColumnCenterX,
        centerY: SOURCE_BEAM_CALLOUT_CENTER_Y,
        waveRegionLeft: waveRegionLayout.waveRegionLeft,
        waveRegionRight: waveRegionLayout.waveRegionRight,
        waveRegionTop: waveRegionLayout.waveRegionTop
      },
      tandem.createTandem( 'topRowNode' )
    );
    this.addChild( sourceBeamCalloutNode );

    return sourceBeamCalloutNode;
  }

  /**
   * Positions the particle mass annotation below the source emitter and adds it to the scene graph.
   *
   * @param particleMassAnnotation - annotation node that labels the current particle mass
   * @param sourceBeamCalloutNode - source beam callout node that provides the emitter bounds
   */
  private positionAndAddParticleMassAnnotation(
    particleMassAnnotation: ParticleMassAnnotationNode,
    sourceBeamCalloutNode: HighIntensitySourceBeamCalloutNode<HighIntensitySceneModel>
  ): void {
    const updateParticleMassAnnotationPosition = () => {
      particleMassAnnotation.centerX = sourceBeamCalloutNode.emitterCenterX;
      particleMassAnnotation.top = sourceBeamCalloutNode.emitterBottom + SOURCE_BEAM_CALLOUT_TO_MASS_LABEL_SPACING;
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
      doubleSlitNode: waveRegionNode.doubleSlitNode,
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
    return createAndAddSlitConfigurationControlsRow(
      model.currentSlitConfigurationProperty,
      model.sceneProperty,
      model.scenes,
      waveRegionLayout.waveRegionLeft,
      waveRegionLayout.slitControlsBottom,
      this,
      tandem,
      {
        topCoveredTandemName: 'topCoveredItem',
        bottomCoveredTandemName: 'bottomCoveredItem'
      }
    );
  }

  /**
   * Creates the detector-side intensity graph layer.
   *
   * @param model - the screen model that owns graph visibility and detection mode
   * @param detectorScreenNode - detector screen node that anchors the graph
   * @param waveRegionLayout - coordinates for positioning the graph beside the wave region
   * @param tandem - parent tandem for child instrumentation
   * @returns the graph layer retained by the ScreenView for stepping and reset
   */
  private createAndAddDetectorPatternGraphLayerNode(
    model: HighIntensityModel,
    detectorScreenNode: DetectorScreenNode,
    waveRegionLayout: WaveRegionLayout,
    tandem: Tandem
  ): DetectorPatternGraphLayerNode {
    const detectorPatternGraphLayerNode = new DetectorPatternGraphLayerNode(
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
    this.addChild( detectorPatternGraphLayerNode );

    return detectorPatternGraphLayerNode;
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
   * @param clearScreen - callback that clears the detector screen and emits the appropriate accessibility response
   * @param detectorPatternGraphLayerNode - graph layer reset by the detector-screen controls reset action
   * @param detectorScreenNode - detector screen node used for snapshot flash and reset
   * @param sourceBeamRightLimitXProperty - mutable right limit for the source beam callout
   * @param tandem - parent tandem for child instrumentation
   * @returns the detector screen controls, used by layout and accessible description
   */
  private createAndAddDetectorScreenControls(
    model: HighIntensityModel,
    clearScreen: () => void,
    detectorPatternGraphLayerNode: DetectorPatternGraphLayerNode,
    detectorScreenNode: DetectorScreenNode,
    sourceBeamRightLimitXProperty: NumberProperty,
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
      clearScreen: clearScreen,
      onSnapshotCaptured: () => detectorScreenNode.startSnapshotFlash(),
      onStepForward: () => this.timePlotNode.step( model.getNominalStepDt() ),
      slitOrientation: 'topBottom',
      resetView: () => resetDetectorScreenView(
        detectorPatternGraphLayerNode,
        this.timePlotNode,
        this.positionPlotNode,
        detectorScreenNode
      )
    } );

    this.addChild( detectorScreenControls );

    ManualConstraint.create( this, [ detectorScreenControls ], detectorScreenControlsProxy => {
      detectorScreenControlsProxy.right = this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;
      detectorScreenControlsProxy.top = QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN;
      sourceBeamRightLimitXProperty.value = detectorScreenControlsProxy.left - SOURCE_BEAM_RIGHT_PANEL_GAP;
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
        this.layoutBounds.maxX - QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN,
        this.layoutBounds.maxY - QuantumWaveInterferenceConstants.SCREEN_VIEW_Y_MARGIN
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
   * @param sourceBeamCalloutNode - source beam callout node included in the source description
   * @param sourceControlPanel - source controls included in the source description
   * @param sceneRadioButtonGroup - scene controls included in the source description
   * @param bottomRow - slit controls included in the slit description
   * @param doubleSlitNode - slit-position slider included in the slit description
   * @param detectorScreenControls - detector controls included in the detector-screen description
   * @returns the description node used for PDOM order
   */
  private createAndAddScreenViewDescription(
    model: HighIntensityModel,
    sourceBeamCalloutNode: HighIntensitySourceBeamCalloutNode<HighIntensitySceneModel>,
    sourceControlPanel: SourceControlPanel<HighIntensitySceneModel>,
    sceneRadioButtonGroup: SceneRadioButtonGroup<HighIntensitySceneModel>,
    bottomRow: SlitConfigurationControlsRow<SlitConfigurationWithNoBarrier>,
    doubleSlitNode: DoubleSlitNode,
    detectorScreenControls: DetectorScreenControls
  ): QuantumWaveInterferenceScreenViewDescription {
    const screenViewDescription = new QuantumWaveInterferenceScreenViewDescription(
      model,
      model.currentSlitConfigurationProperty, {
        detectionModeProperty: model.currentDetectionModeProperty,
        detectorScreenUpdateTriggerProperty: model.accessibleStateStepProperty,
        screenGraphVisibleProperty: model.isIntensityGraphVisibleProperty,
        slitOrientation: 'topBottom',
        sourceNodes: [ sourceBeamCalloutNode, sourceControlPanel, sceneRadioButtonGroup ],
        slitNodes: [ bottomRow, doubleSlitNode ],
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
      screenViewDescription.experimentSetupHeadingNode,
      screenViewDescription.sourceHeadingNode,
      screenViewDescription.slitsHeadingNode,
      this.detectorPatternGraphLayerNode,
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
