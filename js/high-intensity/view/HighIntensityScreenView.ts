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
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Shape from '../../../../kite/js/Shape.js';
import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import createMeasurementToolNodes from '../../common/view/createMeasurementToolNodes.js';
import createObstacleControlsRow from '../../common/view/createObstacleControlsRow.js';
import createRightControlsColumn from '../../common/view/createRightControlsColumn.js';
import createToolCheckbox from '../../common/view/createToolCheckbox.js';
import ToolIcons from '../../common/view/ToolIcons.js';
import DoubleSlitNode from '../../common/view/DoubleSlitNode.js';
import SceneRadioButtonGroup from '../../common/view/SceneRadioButtonGroup.js';
import SidewaysGraphNode from '../../common/view/SidewaysGraphNode.js';
import SourceControlPanel from '../../common/view/SourceControlPanel.js';
import WaveVisualizationNode from '../../common/view/WaveVisualizationNode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import HighIntensitySceneModel from '../model/HighIntensitySceneModel.js';
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

const EMITTER_BODY_WIDTH = 70;
const EMITTER_BODY_HEIGHT = 32;
const EMITTER_NOZZLE_WIDTH = 14;
const EMITTER_NOZZLE_HEIGHT = 26;
const EMITTER_BUTTON_RADIUS = 12;

const TOP_ROW_CENTER_Y = 30;
const BEAM_HEIGHT = EMITTER_NOZZLE_HEIGHT;
const MINI_SYMBOL_SQUARE_SIZE = 22;
const MINI_SYMBOL_DETECTOR_WIDTH = 8;
const MINI_SYMBOL_SKEW = 3;
const MINI_SYMBOL_GAP = 2;
const BEAM_MAIN_ALPHA_SCALE = 0.35;
const BEAM_CUTOFF_ALPHA_SCALE = 0.12;
const BEAM_CUTOFF_EXTENSION = 30;
const EMITTER_NOZZLE_OVERLAP = 4;
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
    leftControlsVBox.top = TOP_ROW_CENTER_Y + EMITTER_BODY_HEIGHT / 2 + LEFT_CONTROLS_TOP_GAP;
    this.addChild( leftControlsVBox );

    const waveRegionLeft = leftControlsVBox.right + 20;
    const waveRegionTop = Y_MARGIN + 50;

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

    // Mini wave visualization symbol: a small black square + skewed detector-screen rectangle
    const miniSquare = new Rectangle( 0, 0, MINI_SYMBOL_SQUARE_SIZE, MINI_SYMBOL_SQUARE_SIZE, {
      fill: 'black',
      cornerRadius: 2
    } );

    const detectorShape = new Shape()
      .moveTo( MINI_SYMBOL_SKEW, 0 )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH + MINI_SYMBOL_SKEW, 0 )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH, MINI_SYMBOL_SQUARE_SIZE )
      .lineTo( 0, MINI_SYMBOL_SQUARE_SIZE )
      .close();
    const miniDetector = new Path( detectorShape, { fill: 'black' } );
    miniDetector.left = miniSquare.right + MINI_SYMBOL_GAP;

    const miniSymbol = new Node( {
      children: [ miniSquare, miniDetector ],
      centerY: TOP_ROW_CENTER_Y
    } );
    miniSymbol.left = waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH - MINI_SYMBOL_SKEW / 2;

    // Beam graphics: main beam (brighter) from emitter to mini symbol, cut-off beam (dimmer) past it
    const beamLeft = waveRegionLeft + EMITTER_NOZZLE_OVERLAP;
    const beamTop = TOP_ROW_CENTER_Y - BEAM_HEIGHT / 2;

    const mainBeam = new Rectangle( beamLeft, beamTop, miniSymbol.left - beamLeft, BEAM_HEIGHT );

    const cutoffBeam = new Rectangle(
      miniSymbol.left, beamTop,
      miniSymbol.width + BEAM_CUTOFF_EXTENSION, BEAM_HEIGHT
    );

    const beamContainer = new Node( {
      children: [ mainBeam, cutoffBeam ],
      visible: false
    } );

    // Z-order: beam behind everything, then emitter and mini symbol on top
    this.addChild( beamContainer );

    emitterContainer.right = beamLeft;
    emitterContainer.centerY = TOP_ROW_CENTER_Y;
    this.addChild( emitterContainer );
    this.addChild( miniSymbol );

    const updateBeam = () => {
      const scene = model.sceneProperty.value;
      const isEmitting = scene.isEmittingProperty.value;
      beamContainer.visible = isEmitting;

      if ( !isEmitting ) {
        return;
      }

      const baseColor = scene.sourceType === 'photons'
                         ? VisibleColor.wavelengthToColor( scene.wavelengthProperty.value )
                         : QuantumWaveInterferenceColors.particleBeamColorProperty.value;
      const intensity = scene.intensityProperty.value;

      mainBeam.fill = baseColor.withAlpha( BEAM_MAIN_ALPHA_SCALE * intensity );
      cutoffBeam.fill = baseColor.withAlpha( BEAM_CUTOFF_ALPHA_SCALE * intensity );
    };

    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.isEmittingProperty.unlink( updateBeam );
        oldScene.wavelengthProperty.unlink( updateBeam );
        oldScene.intensityProperty.unlink( updateBeam );
      }
      newScene.isEmittingProperty.link( updateBeam );
      newScene.wavelengthProperty.link( updateBeam );
      newScene.intensityProperty.link( updateBeam );
    } );

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

    this.sidewaysGraphNode = new SidewaysGraphNode( model.sceneProperty, {
      detectionModeProperty: model.currentDetectionModeProperty,
      axisLabelStringProperty: graphAxisLabelProperty,
      tandem: tandem.createTandem( 'sidewaysGraphNode' )
    } );
    this.addChild( this.sidewaysGraphNode );

    // When the graph is visible, shrink the detector screen horizontally to 50% and position the graph beside it
    model.isIntensityGraphVisibleProperty.link( isVisible => {
      this.sidewaysGraphNode.visible = isVisible;
      if ( isVisible ) {
        this.detectorScreenNode.setScaleMagnitude( 0.5, 1 );
        this.sidewaysGraphNode.left = this.detectorScreenNode.right + 2;
        this.sidewaysGraphNode.top = waveRegionTop;
      }
      else {
        this.detectorScreenNode.setScaleMagnitude( 1, 1 );
      }
    } );

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
      clearScreen: () => model.sceneProperty.value.clearScreen()
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
