// Copyright 2026, University of Colorado Boulder

/**
 * DetectorToolNode is the detector tool for the Single Particles screen. It consists of:
 * - A draggable circular detector overlaid on the wave visualization region
 * - A probability percentage label inside the circle
 * - A curved wire connecting the circle to a control panel
 * - A control panel with a Detect/Reset button, detector size slider, and detector mode radio buttons
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import type SceneryEvent from '../../../../scenery/js/input/SceneryEvent.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import AquaRadioButtonGroup, { type AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const LABEL_FONT = new PhetFont( 12 );

const CIRCLE_FILL_READY = new Color( 135, 206, 250, 0.3 );
const CIRCLE_FILL_DETECTED = new Color( 100, 255, 100, 0.5 );
const CIRCLE_FILL_NOT_DETECTED = new Color( 80, 80, 80, 0.5 );
const CIRCLE_STROKE = new Color( 50, 50, 50 );
const WIRE_STROKE = new Color( 100, 100, 100 );

const DetectorModeValues = [ 'destructive', 'nonDestructive' ] as const;
type DetectorMode = typeof DetectorModeValues[number];

export default class DetectorToolNode extends Node {

  //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Coupling to SingleParticlesModel suggests that the
  // model could benefit from having a CurrentDetectorTool class to pull together the 6 (?) related Properties that
  // are currently at the top-level of SingleParticlesModel.
  public constructor(
    model: SingleParticlesModel,
    waveRegionLeft: number,
    waveRegionTop: number,
    getControlPanelCenterX: () => number,
    getControlPanelCenterY: () => number,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    const circleNode = new Circle( 1, {
      fill: CIRCLE_FILL_READY,
      stroke: CIRCLE_STROKE,
      lineWidth: 2,
      cursor: 'pointer'
    } );

    const probabilityText = new Text( '', {
      font: LABEL_FONT,
      fill: 'white',
      maxWidth: 60
    } );

    const stateText = new Text( '', {
      font: new PhetFont( { size: 11, weight: 'bold' } ),
      fill: 'white',
      maxWidth: 70
    } );

    const circleLabelsNode = new VBox( {
      children: [ probabilityText, stateText ],
      spacing: 2,
      align: 'center'
    } );

    const circleContainer = new Node( {
      children: [ circleNode, circleLabelsNode ]
    } );

    this.addChild( circleContainer );

    const wirePath = new Path( null, {
      stroke: WIRE_STROKE,
      lineWidth: 2,
      lineDash: [ 4, 4 ]
    } );
    this.addChild( wirePath );

    // --- Control panel ---

    const detectButtonTextProperty = new DerivedProperty(
      [ model.currentDetectorToolStateProperty,
        QuantumWaveInterferenceFluent.detectStringProperty,
        QuantumWaveInterferenceFluent.resetDetectorStringProperty ],
      ( state, detectString, resetString ) =>
        state === 'ready' ? detectString : resetString
    );

    const detectButton = new RectangularPushButton( {
      content: new Text( detectButtonTextProperty, {
        font: new PhetFont( 13 ),
        maxWidth: 80
      } ),
      baseColor: QuantumWaveInterferenceColors.snapshotButtonBaseColorProperty,
      listener: () => {
        if ( model.currentDetectorToolStateProperty.value === 'ready' ) {
          model.sceneProperty.value.performDetectorMeasurement();
        }
        else {
          model.sceneProperty.value.resetDetectorToolState();
        }
      },
      tandem: tandem.createTandem( 'detectButton' )
    } );

    const sizeLabel = new Text( QuantumWaveInterferenceFluent.detectorSizeStringProperty, {
      font: LABEL_FONT,
      maxWidth: 90
    } );

    const sizeSlider = new HSlider(
      model.currentDetectorToolRadiusProperty,
      model.photonsScene.detectorToolRadiusProperty.range,
      {
        trackSize: new Dimension2( 80, 3 ),
        thumbSize: new Dimension2( 11, 18 ),
        tandem: tandem.createTandem( 'sizeSlider' )
      }
    );

    const sizeControl = new VBox( {
      children: [ sizeLabel, sizeSlider ],
      spacing: 4,
      align: 'center'
    } );

    const detectorModeProperty = new StringUnionProperty<DetectorMode>( 'destructive', {
      validValues: DetectorModeValues,
      tandem: tandem.createTandem( 'detectorModeProperty' )
    } );

    const detectorModeItems: AquaRadioButtonGroupItem<DetectorMode>[] = [
      {
        value: 'destructive',
        createNode: () => new Text( QuantumWaveInterferenceFluent.destructiveStringProperty, {
          font: LABEL_FONT,
          maxWidth: 100
        } ),
        tandemName: 'destructiveRadioButton'
      },
      {
        value: 'nonDestructive',
        createNode: () => new Text( QuantumWaveInterferenceFluent.nonDestructiveStringProperty, {
          font: LABEL_FONT,
          maxWidth: 100
        } ),
        tandemName: 'nonDestructiveRadioButton'
      }
    ];

    const detectorModeRadioButtonGroup = new AquaRadioButtonGroup<DetectorMode>( detectorModeProperty, detectorModeItems, {
      spacing: 8,
      align: 'left',
      orientation: 'vertical',
      radioButtonOptions: { radius: 7 },
      tandem: tandem.createTandem( 'detectorModeRadioButtonGroup' )
    } );

    const panelContent = new HBox( {
      children: [ detectButton, sizeControl, detectorModeRadioButtonGroup ],
      spacing: 15,
      align: 'center'
    } );

    const controlPanel = new Panel( panelContent, {
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      xMargin: 10,
      yMargin: 8,
      cornerRadius: 6
    } );
    this.addChild( controlPanel );

    // --- Update circle position, size, and wire from model ---

    const updateCircle = () => {
      const pos = model.currentDetectorToolPositionProperty.value;
      const radius = model.currentDetectorToolRadiusProperty.value;

      const viewX = waveRegionLeft + pos.x * WAVE_REGION_WIDTH;
      const viewY = waveRegionTop + pos.y * WAVE_REGION_HEIGHT;
      const viewRadius = radius * WAVE_REGION_WIDTH;

      circleNode.radius = Math.max( viewRadius, 5 );
      circleContainer.x = viewX;
      circleContainer.y = viewY;
      circleLabelsNode.center = Vector2.ZERO;

      const panelCX = controlPanel.centerX;
      const panelTY = controlPanel.top;
      const midY = ( viewY + viewRadius + panelTY ) / 2;

      const wireShape = new Shape()
        .moveTo( viewX, viewY + viewRadius )
        .cubicCurveTo( viewX, midY, panelCX, midY, panelCX, panelTY );
      wirePath.shape = wireShape;
    };

    const updateControlPanelPosition = () => {
      controlPanel.centerX = getControlPanelCenterX();
      controlPanel.centerY = getControlPanelCenterY();
      updateCircle();
    };
    controlPanel.localBoundsProperty.link( updateControlPanelPosition );

    // --- Drag listener for the circle ---

    const dragListener = new DragListener( {
      drag: ( event: SceneryEvent ) => {
        const parentPoint = circleContainer.globalToParentPoint( event.pointer.point );
        const normalizedX = ( parentPoint.x - waveRegionLeft ) / WAVE_REGION_WIDTH;
        const normalizedY = ( parentPoint.y - waveRegionTop ) / WAVE_REGION_HEIGHT;
        model.currentDetectorToolPositionProperty.value = new Vector2(
          clamp( normalizedX, 0.05, 0.95 ),
          clamp( normalizedY, 0.05, 0.95 )
        );
      },
      tandem: tandem.createTandem( 'dragListener' )
    } );
    circleContainer.addInputListener( dragListener );

    // --- Update probability label and circle fill ---

    const updateProbabilityLabel = () => {
      const state = model.currentDetectorToolStateProperty.value;
      const probability = model.currentDetectorToolProbabilityProperty.value;

      if ( state === 'detected' ) {
        probabilityText.string = '';
        stateText.string = QuantumWaveInterferenceFluent.particleDetectedStringProperty.value;
        circleNode.fill = CIRCLE_FILL_DETECTED;
      }
      else if ( state === 'notDetected' ) {
        probabilityText.string = '';
        stateText.string = QuantumWaveInterferenceFluent.notDetectedStringProperty.value;
        circleNode.fill = CIRCLE_FILL_NOT_DETECTED;
      }
      else {
        probabilityText.string = percentUnit.getVisualSymbolPatternString( probability * 100, {
          decimalPlaces: 1,
          showTrailingZeros: true
        } );
        stateText.string = '';
        circleNode.fill = CIRCLE_FILL_READY;
      }
      circleLabelsNode.center = Vector2.ZERO;
    };

    Multilink.multilinkAny(
      [
        model.currentDetectorToolStateProperty,
        model.currentDetectorToolProbabilityProperty,
        QuantumWaveInterferenceFluent.particleDetectedStringProperty,
        QuantumWaveInterferenceFluent.notDetectedStringProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => updateProbabilityLabel()
    );

    model.currentDetectorToolPositionProperty.link( () => updateCircle() );
    model.currentDetectorToolRadiusProperty.link( () => updateCircle() );

    Multilink.multilink(
      [ model.isDetectorToolVisibleProperty, model.isDetectorToolAvailableProperty ],
      ( isVisible, isAvailable ) => {
        this.visible = isVisible && isAvailable;
      }
    );
  }
}
