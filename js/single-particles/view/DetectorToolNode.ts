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
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
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
const DETECTOR_TOOL_DRAG_BOUNDS = new Bounds2( 0.05, 0.05, 0.95, 0.95 );

const DetectorModeValues = [ 'destructive', 'nonDestructive' ] as const;
type DetectorMode = typeof DetectorModeValues[number];

/**
 * View/controller for the detector tool. The detector's position and radius are stored in model coordinates normalized
 * to the wave region: position components span the wave-region width/height, while radius is a fraction of the
 * wave-region width. This node maps those values into view coordinates, updates the tool labels and measurement-state
 * colors, and routes the dashed wire to the external control panel.
 *
 * The detector tool Properties are exposed by SingleParticlesModel as DynamicProperties, so one DetectorToolNode can
 * stay connected while the active Single Particles scene changes.
 */
export default class DetectorToolNode extends Node {

  //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Coupling to SingleParticlesModel suggests that the
  // model could benefit from having a CurrentDetectorTool class to pull together the 6 (?) related Properties that
  // are currently at the top-level of SingleParticlesModel.
  /**
   * @param model - Single Particles model that provides the active scene's detector-tool Properties
   * @param waveRegionLeft - left edge of the wave visualization region in this node's parent coordinate frame
   * @param waveRegionTop - top edge of the wave visualization region in this node's parent coordinate frame
   * @param getControlPanelCenterX - callback for the panel center x-coordinate, evaluated after layout changes
   * @param getControlPanelCenterY - callback for the panel center y-coordinate, evaluated after layout changes
   * @param tandem - instrumentation root for detector-tool controls
   */
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

    /**
     * Synchronizes the circle geometry and dashed wire with the detector model values. The wire starts at the bottom of
     * the circular detector and terminates at the top center of the control panel, so this must also run when panel
     * bounds change due to dynamic layout or localization.
     */
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

      wirePath.shape = new Shape()
        .moveTo( viewX, viewY + viewRadius )
        .cubicCurveTo( viewX, midY, panelCX, midY, panelCX, panelTY );
    };

    // Reposition the panel after its contents change size, then reroute the wire to match the new panel bounds.
    const updateControlPanelPosition = () => {
      controlPanel.centerX = getControlPanelCenterX();
      controlPanel.centerY = getControlPanelCenterY();
      updateCircle();
    };
    controlPanel.localBoundsProperty.link( updateControlPanelPosition );

    // --- Drag listener for the circle ---

    // DragListener writes normalized model coordinates even though pointer positions are in view coordinates.
    const detectorToolModelViewTransform = ModelViewTransform2.createRectangleMapping(
      new Bounds2( 0, 0, 1, 1 ),
      new Bounds2( waveRegionLeft, waveRegionTop, waveRegionLeft + WAVE_REGION_WIDTH, waveRegionTop + WAVE_REGION_HEIGHT )
    );
    const dragListener = new DragListener( {
      positionProperty: model.currentDetectorToolPositionProperty,
      transform: detectorToolModelViewTransform,
      dragBoundsProperty: new Property( DETECTOR_TOOL_DRAG_BOUNDS ),
      tandem: tandem.createTandem( 'dragListener' )
    } );
    circleContainer.addInputListener( dragListener );

    // --- Update probability label and circle fill ---

    /**
     * Displays either the ready-state detection probability or the final measurement result. Locale and unit
     * dependencies are included in the Multilink below so the label updates when translated strings or percent
     * formatting change.
     */
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
