// Copyright 2026, University of Colorado Boulder

/**
 * DetectorProbeNode is the detector probe for the Single Particles screen. It consists of:
 * - A draggable circular detector overlaid on the wave visualization region
 * - A probability percentage label inside the circle
 * - A curved wire connecting the circle to a control panel
 * - A control panel with a Detect/Reset button and detector size slider
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import InteractiveHighlightingNode from '../../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { type DetectorToolViewStateFragment } from '../../common/view/description/QuantumWaveInterferenceAccessibleViewState.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import CurrentDetectorTool from '../model/CurrentDetectorTool.js';
import SingleParticlesSceneModel from '../model/SingleParticlesSceneModel.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const LABEL_FONT = new PhetFont( 12 );

const CIRCLE_FILL_READY = new Color( 135, 206, 250, 0.3 );
const CIRCLE_FILL_NOT_DETECTED = new Color( 80, 80, 80, 0.5 );
const CIRCLE_STROKE = new Color( 50, 50, 50 );
const WIRE_STROKE = new Color( 100, 100, 100 );

// Keyboard drag deltas in view pixels per key press, consistent with other draggable tools in this sim.
const PROBE_KEYBOARD_DRAG_DELTA = 8;
const PROBE_KEYBOARD_SHIFT_DRAG_DELTA = 2;

/**
 * View/controller for the detector tool. The detector's position and radius are stored in model coordinates normalized
 * to the wave region: position components span the wave-region width/height, while radius is a fraction of the
 * wave-region width. This node maps those values into view coordinates, updates the tool labels and measurement-state
 * colors, and routes the dashed wire to the external control panel.
 *
 * The detector tool Properties are exposed by CurrentDetectorTool as DynamicProperties, so one DetectorProbeNode can stay
 * connected while the active Single Particles scene changes.
 */
export default class DetectorProbeNode extends Node {

  private readonly currentDetectorTool: CurrentDetectorTool;

  /**
   * @param currentDetectorTool - detector tool model for the active Single Particles scene
   * @param waveRegionLeft - left edge of the wave visualization region in this node's parent coordinate frame
   * @param waveRegionTop - top edge of the wave visualization region in this node's parent coordinate frame
   * @param getControlPanelCenterX - callback for the panel center x-coordinate, evaluated after layout changes
   * @param getControlPanelCenterY - callback for the panel center y-coordinate, evaluated after layout changes
   * @param tandem - instrumentation root for detector-tool controls
   */
  public constructor(
    currentDetectorTool: CurrentDetectorTool,
    waveRegionLeft: number,
    waveRegionTop: number,
    getControlPanelCenterX: () => number,
    getControlPanelCenterY: () => number,
    tandem: Tandem
  ) {
    super( {
      isDisposable: false,

      // Core description mirroring the visual readout inside the probe circle: the detection chance while ready,
      // or the measurement result. The probability is formatted to match the visual percent readout.
      accessibleParagraph: QuantumWaveInterferenceFluent.a11y.detectorProbe.accessibleParagraph.createProperty( {
        state: currentDetectorTool.stateProperty,
        probability: new DerivedProperty( [ currentDetectorTool.probabilityProperty ],
          probability => toFixed( probability * 100, 1 ) )
      } )
    } );

    this.currentDetectorTool = currentDetectorTool;

    const circleFillProperty = new DerivedProperty(
      [ currentDetectorTool.stateProperty, QuantumWaveInterferenceColors.detectorToolDetectedFillProperty ],
      ( state, detectedFill ) =>
        state === 'detected' ? detectedFill :
        state === 'notDetected' ? CIRCLE_FILL_NOT_DETECTED :
        CIRCLE_FILL_READY
    );

    const circleNode = new Circle( 1, {
      fill: circleFillProperty,
      stroke: CIRCLE_STROKE,
      lineWidth: 2,
      cursor: 'pointer'
    } );

    const probabilityText = new Text( '', {

      // 20% larger than LABEL_FONT for better readability of the percentage readout
      font: new PhetFont( 14.4 ),
      fill: 'white',
      maxWidth: 60,
      pickable: false
    } );

    const stateText = new RichText( '', {
      font: new PhetFont( 14 ),
      fill: 'white',
      align: 'center',
      maxWidth: 80,
      pickable: false
    } );

    // The probe circle is focusable and movable with both the pointer and the keyboard, and shows an
    // interactive highlight on pointer hover.
    const circleContainer = new InteractiveHighlightingNode( combineOptions<NodeOptions>( {
      children: [ circleNode, probabilityText, stateText ],
      accessibleName: QuantumWaveInterferenceFluent.a11y.detectorProbe.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorProbe.accessibleHelpTextStringProperty
    }, AccessibleDraggableOptions ) );

    this.addChild( circleContainer );

    const wirePath = new Path( null, {
      stroke: WIRE_STROKE,
      lineWidth: 2,
      lineDash: [ 4, 4 ]
    } );
    this.addChild( wirePath );

    // --- Control panel ---

    // Both labels share an AlignGroup so the button is sized to the larger of the two strings and does not
    // change size when the state toggles between 'Detect' and 'Reset Detector'.
    const detectButtonTextAlignGroup = new AlignGroup();

    const textOptions = {
      font: new PhetFont( 13 ),
      maxWidth: 80
    };
    const detectTextBox = detectButtonTextAlignGroup.createBox(
      new Text( QuantumWaveInterferenceFluent.detectStringProperty, textOptions ), {
        visibleProperty: new DerivedProperty( [ currentDetectorTool.stateProperty ], state => state === 'ready' )
      } );

    const resetTextBox = detectButtonTextAlignGroup.createBox(
      new Text( QuantumWaveInterferenceFluent.resetDetectorStringProperty, textOptions ), {
        visibleProperty: new DerivedProperty( [ currentDetectorTool.stateProperty ], state => state !== 'ready' )
      } );

    const detectButton = new RectangularPushButton( {
      content: new Node( { children: [ detectTextBox, resetTextBox ] } ),

      // The visual label is two stacked Text nodes, so the accessible name must be provided explicitly and
      // track the same state.
      accessibleName: new DerivedProperty(
        [ currentDetectorTool.stateProperty,
          QuantumWaveInterferenceFluent.detectStringProperty,
          QuantumWaveInterferenceFluent.resetDetectorStringProperty ],
        ( state, detectString, resetString ) => state === 'ready' ? detectString : resetString
      ),
      baseColor: QuantumWaveInterferenceColors.snapshotButtonBaseColorProperty,
      listener: () => {
        if ( currentDetectorTool.stateProperty.value === 'ready' ) {
          currentDetectorTool.performMeasurement();
        }
        else {
          currentDetectorTool.resetState();
        }
      },
      tandem: tandem.createTandem( 'detectButton' )
    } );

    const sizeLabel = new Text( QuantumWaveInterferenceFluent.detectorSizeStringProperty, {
      font: LABEL_FONT,
      maxWidth: 90
    } );

    const sizeSlider = new HSlider(
      currentDetectorTool.radiusProperty,
      currentDetectorTool.radiusRange,
      {
        trackSize: new Dimension2( 80, 3 ),
        thumbSize: new Dimension2( 11, 18 ),

        // The visual label is a separate Text node, so the slider needs the same string as its accessible name.
        accessibleName: QuantumWaveInterferenceFluent.detectorSizeStringProperty,
        tandem: tandem.createTandem( 'sizeSlider' )
      }
    );

    const sizeControl = new VBox( {
      children: [ sizeLabel, sizeSlider ],
      spacing: 4,
      align: 'center'
    } );

    const panelContent = new HBox( {
      children: [ detectButton, sizeControl ],
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
      const pos = currentDetectorTool.positionProperty.value;
      const radius = currentDetectorTool.radiusProperty.value;

      const viewX = waveRegionLeft + pos.x * WAVE_REGION_WIDTH;
      const viewY = waveRegionTop + pos.y * WAVE_REGION_HEIGHT;
      const viewRadius = radius * WAVE_REGION_WIDTH;

      circleNode.radius = Math.max( viewRadius, 5 );
      const circleLabelMaxWidth = 2 * circleNode.radius - 4;
      probabilityText.maxWidth = circleLabelMaxWidth;
      stateText.maxWidth = circleLabelMaxWidth;
      circleContainer.x = viewX;
      circleContainer.y = viewY;
      probabilityText.center = Vector2.ZERO;
      stateText.center = Vector2.ZERO;

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
    // All parts of the detector circle must stay inside the wave region, so the draggable center bounds
    // shrink as the radius grows. Tracks the active scene's radius through the DynamicProperty.
    const dragBoundsProperty = new DerivedProperty( [ currentDetectorTool.radiusProperty ],
      radius => SingleParticlesSceneModel.getDetectorToolCenterBounds( radius ) );

    // Pointer dragging, with grab/release sound effects.
    const dragListener = new SoundDragListener( {
      positionProperty: currentDetectorTool.positionProperty,
      transform: detectorToolModelViewTransform,
      dragBoundsProperty: dragBoundsProperty,
      tandem: tandem.createTandem( 'dragListener' )
    } );
    circleContainer.addInputListener( dragListener );

    // Keyboard dragging via arrow/WASD keys, with the same grab/release sound effects. Drag deltas are in view
    // pixels and are converted to normalized model coordinates through the transform.
    const keyboardDragListener = new SoundKeyboardDragListener( {
      positionProperty: currentDetectorTool.positionProperty,
      transform: detectorToolModelViewTransform,
      dragBoundsProperty: dragBoundsProperty,
      dragDelta: PROBE_KEYBOARD_DRAG_DELTA,
      shiftDragDelta: PROBE_KEYBOARD_SHIFT_DRAG_DELTA,
      tandem: tandem.createTandem( 'keyboardDragListener' )
    } );
    circleContainer.addInputListener( keyboardDragListener );

    // --- Update probability label and circle fill ---

    /**
     * Displays either the ready-state detection probability or the final measurement result. Locale and unit
     * dependencies are included in the Multilink below so the label updates when translated strings or percent
     * formatting change.
     */
    const updateProbabilityLabel = () => {
      const state = currentDetectorTool.stateProperty.value;
      const probability = currentDetectorTool.probabilityProperty.value;

      if ( state === 'detected' ) {
        probabilityText.string = '';
        stateText.string = QuantumWaveInterferenceFluent.particleDetectedStringProperty.value;
      }
      else if ( state === 'notDetected' ) {
        probabilityText.string = '';
        stateText.string = QuantumWaveInterferenceFluent.notDetectedStringProperty.value;
      }
      else {
        probabilityText.string = percentUnit.getVisualSymbolPatternString( probability * 100, {
          decimalPlaces: 1,
          showTrailingZeros: true
        } );
        stateText.string = '';
      }
      probabilityText.center = Vector2.ZERO;
      stateText.center = Vector2.ZERO;
    };

    Multilink.multilinkAny(
      [
        currentDetectorTool.stateProperty,
        currentDetectorTool.probabilityProperty,
        QuantumWaveInterferenceFluent.particleDetectedStringProperty,
        QuantumWaveInterferenceFluent.notDetectedStringProperty,
        ...percentUnit.getDependentProperties()
      ],
      () => updateProbabilityLabel()
    );

    currentDetectorTool.positionProperty.link( () => updateCircle() );
    currentDetectorTool.radiusProperty.link( () => updateCircle() );

    Multilink.multilink(
      [ currentDetectorTool.isVisibleProperty, currentDetectorTool.isAvailableProperty ],
      ( isVisible, isAvailable ) => {
        this.visible = isVisible && isAvailable;
      }
    );

    // Probe first: it selects the measurement region, while the panel holds its controls. The wire is visual only.
    this.pdomOrder = [ circleContainer, controlPanel ];
  }

  /**
   * Gets detector-tool view state for agent-facing accessibility snapshots.
   *
   * @returns detector-tool view state
   */
  public getAccessibleViewState(): DetectorToolViewStateFragment {
    const position = this.currentDetectorTool.positionProperty.value;

    return {
      detectorTool: {
        available: this.currentDetectorTool.isAvailableProperty.value,
        visible: this.currentDetectorTool.isVisibleProperty.value && this.currentDetectorTool.isAvailableProperty.value,
        state: this.currentDetectorTool.stateProperty.value,
        probability: this.currentDetectorTool.probabilityProperty.value,
        radius: this.currentDetectorTool.radiusProperty.value,
        position: {
          x: position.x,
          y: position.y
        }
      }
    };
  }
}
