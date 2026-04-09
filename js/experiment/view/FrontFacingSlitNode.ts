// Copyright 2026, University of Colorado Boulder

/**
 * FrontFacingSlitNode is the zoomed-in front-facing view of the double slits. It shows a black rounded rectangle
 * with two white vertical rectangles representing the slits. Above the left slit is a double-headed arrow
 * displaying the slit width (constant per source type). Below the view is a double-headed arrow displaying
 * the slit separation (updates with the slit separation control).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import { hasDetectorOnSide } from '../model/SlitConfiguration.js';

const VIEW_WIDTH = ExperimentConstants.FRONT_FACING_SLIT_VIEW_WIDTH;
const VIEW_HEIGHT = ExperimentConstants.FRONT_FACING_ROW_HEIGHT;
const VIEW_CORNER_RADIUS = 10;

// Slit visual dimensions
const BASE_SLIT_HEIGHT = 130; // Previous slit height, used to derive padding behavior
const BASE_SLIT_VERTICAL_PADDING = ( VIEW_HEIGHT - BASE_SLIT_HEIGHT ) / 2;
const SLIT_VERTICAL_PADDING = BASE_SLIT_VERTICAL_PADDING / 2;
const SLIT_HEIGHT = VIEW_HEIGHT - 2 * SLIT_VERTICAL_PADDING; // Height of the white slit rectangles
const HORIZONTAL_PADDING = 10; // Left/right padding for mapping physical x positions into the view

// Span arrow constants for slit separation (full-size span below the view)
const SPAN_ARROW_OPTIONS = {
  headHeight: 5,
  headWidth: 5,
  tailWidth: 1,
  doubleHead: true,
  fill: 'black',
  stroke: null as string | null
};

// Smaller arrow options for the slit width span (compact span above one slit)
const SLIT_WIDTH_ARROW_OPTIONS = {
  headHeight: 3,
  headWidth: 3,
  tailWidth: 0.75,
  doubleHead: true,
  fill: 'black',
  stroke: null as string | null
};

const SPAN_TICK_LENGTH = 8;
const SPAN_FONT = new PhetFont( 12 );
const DEFAULT_SOURCE_INTENSITY = 0.5;
const MIN_BEAM_OVERLAY_ALPHA = 0.15;
const DEFAULT_BEAM_OVERLAY_ALPHA = 0.15 + 0.35 * DEFAULT_SOURCE_INTENSITY;
const MAX_BEAM_OVERLAY_ALPHA = 0.8;
const DETECTOR_PADDING = 3;
const DETECTOR_WIRE_HEIGHT = 6;
const DETECTOR_WIRE_FILL = 'rgb( 140, 140, 140 )';
const DETECTOR_OVERLAY_FILL_ALPHA = 0.3;
const DETECTOR_OVERLAY_STROKE_WIDTH = 2;

// Match slit-separation readout precision to SlitControlPanel.
const getDecimalPlacesForValue = ( value: number ): number => {
  if ( value === Math.floor( value ) ) {
    return 0;
  }
  const str = value.toString();
  const decimalIndex = str.indexOf( '.' );
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
};

const getRangeDecimalPlaces = ( min: number, max: number ): number => {
  return Math.max( getDecimalPlacesForValue( min ), getDecimalPlacesForValue( max ) );
};

type SpanNodeParts = {
  arrow: ArrowNode;
  leftTick: Line;
  rightTick: Line;
  text: Text;
  node: Node;
};

/**
 * Creates a horizontal double-headed span (arrow + endpoint ticks + label) used to annotate
 * the slit width and slit separation in the front-facing slit view. The arrow tail/tip and
 * tick positions are repositioned by the caller.
 */
const createSpanNode = (
  labelStringProperty: TReadOnlyProperty<string>,
  arrowOptions: typeof SPAN_ARROW_OPTIONS | typeof SLIT_WIDTH_ARROW_OPTIONS,
  textMaxWidth: number
): SpanNodeParts => {
  const arrow = new ArrowNode( 0, 0, 1, 0, arrowOptions );
  const leftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
    stroke: 'black',
    lineWidth: 1
  } );
  const rightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, {
    stroke: 'black',
    lineWidth: 1
  } );
  const text = new Text( labelStringProperty, {
    font: SPAN_FONT,
    maxWidth: textMaxWidth
  } );
  const node = new Node( {
    children: [ arrow, leftTick, rightTick, text ]
  } );
  return { arrow: arrow, leftTick: leftTick, rightTick: rightTick, text: text, node: node };
};

type SelfOptions = EmptySelfOptions;

type FrontFacingSlitNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class FrontFacingSlitNode extends Node {
  public constructor( sceneModel: SceneModel, providedOptions: FrontFacingSlitNodeOptions ) {
    const options = optionize<FrontFacingSlitNodeOptions, SelfOptions, NodeOptions>()(
      {},
      providedOptions
    );

    super( options );

    const barrierNode = new Node();
    this.addChild( barrierNode );

    // Black rounded rectangle background
    const backgroundRect = new Rectangle(
      0,
      0,
      VIEW_WIDTH,
      VIEW_HEIGHT,
      VIEW_CORNER_RADIUS,
      VIEW_CORNER_RADIUS,
      {
        fill: 'black',
        stroke: null
      }
    );
    barrierNode.addChild( backgroundRect );

    const behindGlowSlitsLayer = new Node();
    barrierNode.addChild( behindGlowSlitsLayer );

    // Beam color overlay: shown when the source is emitting, tinting the black barrier
    // with the beam color to indicate light/particles hitting the slit barrier.
    // Clipped to the background rectangle shape.
    const beamOverlay = new Rectangle(
      0,
      0,
      VIEW_WIDTH,
      VIEW_HEIGHT,
      VIEW_CORNER_RADIUS,
      VIEW_CORNER_RADIUS,
      {
        fill: 'red',
        visible: false
      }
    );
    barrierNode.addChild( beamOverlay );

    const frontSlitsLayer = new Node();
    barrierNode.addChild( frontSlitsLayer );

    const particleBeamColorProperty = QuantumWaveInterferenceColors.particleBeamColorProperty;

    // Two white slit rectangles, centered vertically in the view.
    // When the source is emitting, the slits glow with the beam color to show
    // light/particles passing through the openings.
    const slitY = ( VIEW_HEIGHT - SLIT_HEIGHT ) / 2;

    const leftSlit = new Rectangle( 0, slitY, 1, SLIT_HEIGHT, {
      fill: 'white'
    } );
    frontSlitsLayer.addChild( leftSlit );

    const rightSlit = new Rectangle( 0, slitY, 1, SLIT_HEIGHT, {
      fill: 'white'
    } );
    frontSlitsLayer.addChild( rightSlit );

    // Update beam overlay visibility, color, and slit glow based on emitter state
    const updateBeamOverlay = () => {
      const isEmitting = sceneModel.isEmittingProperty.value;
      const intensity = sceneModel.intensityProperty.value;

      if ( !isEmitting ) {
        beamOverlay.visible = false;
        return;
      }

      beamOverlay.visible = true;
      const beamColor = sceneModel.sourceType === 'photons'
                        ? VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value )
                        : particleBeamColorProperty.value;

      // Keep the exact same appearance at the default intensity (0.5). Above default,
      // increase alpha more aggressively so the displayed color is less dark and closer
      // to the true source hue instead of channel-clipped brightening.
      // Piecewise-linear alpha: ramp from MIN to DEFAULT below the midpoint, DEFAULT to MAX above.
      const belowMidpoint = intensity <= DEFAULT_SOURCE_INTENSITY;
      const fraction = belowMidpoint
        ? intensity / DEFAULT_SOURCE_INTENSITY
        : ( intensity - DEFAULT_SOURCE_INTENSITY ) / ( 1 - DEFAULT_SOURCE_INTENSITY );
      const alpha = belowMidpoint
        ? MIN_BEAM_OVERLAY_ALPHA + ( DEFAULT_BEAM_OVERLAY_ALPHA - MIN_BEAM_OVERLAY_ALPHA ) * fraction
        : DEFAULT_BEAM_OVERLAY_ALPHA + ( MAX_BEAM_OVERLAY_ALPHA - DEFAULT_BEAM_OVERLAY_ALPHA ) * fraction;
      beamOverlay.fill = beamColor.withAlpha( alpha );
    };

    sceneModel.isEmittingProperty.link( updateBeamOverlay );
    sceneModel.intensityProperty.link( updateBeamOverlay );
    sceneModel.wavelengthProperty.link( updateBeamOverlay );

    // Format slit width label: use μm for values < 0.01 mm, mm otherwise.
    // Slit width is constant per scene; the label is a DerivedProperty so it re-renders on locale change.
    const slitWidthMM = sceneModel.slitWidth;
    let slitWidthLabelStringProperty: TReadOnlyProperty<string>;
    if ( slitWidthMM >= 0.01 ) {
      slitWidthLabelStringProperty = new DerivedProperty(
        [ QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty ],
        pattern => StringUtils.fillIn( pattern, { value: toFixed( slitWidthMM, slitWidthMM >= 0.1 ? 1 : 2 ) } )
      );
    }
    else {
      const { slitWidthUM, decimalPlaces } = ExperimentConstants.slitWidthMMToMicrometers( slitWidthMM );
      slitWidthLabelStringProperty = new DerivedProperty(
        [ QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty ],
        pattern => StringUtils.fillIn( pattern, { value: toFixed( slitWidthUM, decimalPlaces ) } )
      );
    }

    // Slit-separation label: matches the slit-separation control readout formatting (unit and
    // decimal precision determined by the slider range for this scene). Reactive on both the
    // separation value and the locale-dependent pattern strings.
    const slitSeparationRange = sceneModel.slitSeparationRange;
    const usesMicrometers = slitSeparationRange.max <= 0.1;
    const separationLabelStringProperty = new DerivedProperty(
      [
        sceneModel.slitSeparationProperty,
        QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty,
        QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty
      ],
      ( separationMM, umPattern, mmPattern ) => {
        if ( usesMicrometers ) {
          const valueUM = separationMM * 1000;
          const decimalPlaces = getRangeDecimalPlaces( slitSeparationRange.min * 1000, slitSeparationRange.max * 1000 );
          return StringUtils.fillIn( umPattern, { value: toFixed( valueUM, decimalPlaces ) } );
        }
        else {
          const decimalPlaces = getRangeDecimalPlaces( slitSeparationRange.min, slitSeparationRange.max );
          return StringUtils.fillIn( mmPattern, { value: toFixed( separationMM, decimalPlaces ) } );
        }
      }
    );

    // --- Slit width span (above the left slit) ---
    const slitWidthSpan = createSpanNode( slitWidthLabelStringProperty, SLIT_WIDTH_ARROW_OPTIONS, 80 );
    this.addChild( slitWidthSpan.node );

    // --- Slit separation span (below the view) ---
    const separationSpan = createSpanNode( separationLabelStringProperty, SPAN_ARROW_OPTIONS, 120 );
    this.addChild( separationSpan.node );

    const { arrow: slitWidthArrow, leftTick: slitWidthLeftTick, rightTick: slitWidthRightTick, text: slitWidthText, node: slitWidthSpanNode } = slitWidthSpan;
    const { arrow: separationArrow, leftTick: separationLeftTick, rightTick: separationRightTick, text: separationText, node: separationSpanNode } = separationSpan;

    // Use one horizontal physical-to-view scale for slit positions and slit widths so the
    // front-facing slit rectangles are spatially consistent with the separation readout.
    // For photons, at maximum slider value, center-to-center slit separation spans the full
    // drawable width (minus horizontal padding), per design request.
    const maxSeparationPadding = sceneModel.sourceType === 'photons' ? 2 * HORIZONTAL_PADDING : HORIZONTAL_PADDING;
    const scaleDenominatorMM = sceneModel.sourceType === 'photons' ? sceneModel.slitSeparationRange.max
                                                                   : sceneModel.slitSeparationRange.max + sceneModel.slitWidth;
    const mmToViewX = ( VIEW_WIDTH - 2 * maxSeparationPadding ) / scaleDenominatorMM;
    const slitVisualWidth = sceneModel.slitWidth * mmToViewX;

    // Update slit positions and span indicators when slit separation changes
    const updateSlits = () => {
      const separationMM = sceneModel.slitSeparationProperty.value;

      // Position slits symmetrically about center using physical center-to-center separation.
      const centerX = VIEW_WIDTH / 2;
      const halfSeparationView = ( separationMM * mmToViewX ) / 2;
      const halfSlitWidthView = slitVisualWidth / 2;
      leftSlit.setRect(
        centerX - halfSeparationView - halfSlitWidthView,
        slitY,
        slitVisualWidth,
        SLIT_HEIGHT
      );
      rightSlit.setRect(
        centerX + halfSeparationView - halfSlitWidthView,
        slitY,
        slitVisualWidth,
        SLIT_HEIGHT
      );

      // Update slit width span (above the left slit).
      // Per the design mockup, tick marks flank the slit edges and the label is to the right.
      const slitLeft = leftSlit.left;
      const slitRight = leftSlit.right;
      const spanWidth = slitRight - slitLeft;

      if ( spanWidth > 5 ) {
        slitWidthArrow.setTailAndTip( slitLeft, 0, slitRight, 0 );
        slitWidthArrow.visible = true;
      }
      else {
        // Arrow too small to render nicely, hide it but keep ticks and label
        slitWidthArrow.visible = false;
      }
      slitWidthLeftTick.x = slitLeft;
      slitWidthRightTick.x = slitRight;

      // Position label to the right of the right tick mark, but don't overflow past the view width
      slitWidthText.left = slitRight + 5;
      if ( slitWidthText.right > VIEW_WIDTH ) {
        slitWidthText.right = VIEW_WIDTH;
      }
      slitWidthText.centerY = 0;
      slitWidthSpanNode.bottom = -4;

      // Update slit separation span (below the view).
      // Per the design mockup, the label is to the right of the right tick mark.
      const sepLeft = leftSlit.centerX;
      const sepRight = rightSlit.centerX;

      separationArrow.setTailAndTip( sepLeft, 0, sepRight, 0 );
      separationLeftTick.x = sepLeft;
      separationRightTick.x = sepRight;

      // Position the label to the right of the right tick mark, matching the
      // slit width span label style above the view (per the design mockup).
      separationText.left = sepRight + 5;
      separationText.centerY = 0;
      separationSpanNode.top = VIEW_HEIGHT + 2;
    };

    sceneModel.slitSeparationProperty.link( updateSlits );

    // Re-run layout when label widths change due to locale switches.
    slitWidthLabelStringProperty.lazyLink( updateSlits );
    separationLabelStringProperty.lazyLink( updateSlits );

    // Detector indicator rectangles (yellow/orange translucent overlays, distinct from gray covers)
    const DETECTOR_COLOR = QuantumWaveInterferenceColors.detectorOverlayFillProperty.value.withAlpha( DETECTOR_OVERLAY_FILL_ALPHA );
    const leftDetector = new Rectangle( 0, slitY, 1, SLIT_HEIGHT, {
      fill: DETECTOR_COLOR,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      lineWidth: DETECTOR_OVERLAY_STROKE_WIDTH,
      visible: false
    } );
    this.addChild( leftDetector );

    const rightDetector = new Rectangle( 0, slitY, 1, SLIT_HEIGHT, {
      fill: DETECTOR_COLOR,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      lineWidth: DETECTOR_OVERLAY_STROKE_WIDTH,
      visible: false
    } );
    this.addChild( rightDetector );

    const leftDetectorWire = new Rectangle( 0, 0, 1, DETECTOR_WIRE_HEIGHT, {
      fill: DETECTOR_WIRE_FILL,
      stroke: null,
      visible: false
    } );
    this.addChild( leftDetectorWire );

    const rightDetectorWire = new Rectangle( 0, 0, 1, DETECTOR_WIRE_HEIGHT, {
      fill: DETECTOR_WIRE_FILL,
      stroke: null,
      visible: false
    } );
    this.addChild( rightDetectorWire );

    const updateCoveredSlitAppearance = () => {
      const slitSetting = sceneModel.slitSettingProperty.value;
      const isEmitting = sceneModel.isEmittingProperty.value;
      const leftCovered = slitSetting === 'leftCovered';
      const rightCovered = slitSetting === 'rightCovered';

      const moveSlitToLayer = ( slit: Rectangle, targetLayer: Node ): void => {
        if ( behindGlowSlitsLayer.hasChild( slit ) ) {
          behindGlowSlitsLayer.removeChild( slit );
        }
        if ( frontSlitsLayer.hasChild( slit ) ) {
          frontSlitsLayer.removeChild( slit );
        }
        targetLayer.addChild( slit );
      };

      leftSlit.fill = leftCovered ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';
      rightSlit.fill = rightCovered ? QuantumWaveInterferenceColors.slitCoverFillProperty : 'white';

      if ( leftCovered && isEmitting ) {
        moveSlitToLayer( leftSlit, behindGlowSlitsLayer );
      }
      else {
        moveSlitToLayer( leftSlit, frontSlitsLayer );
      }

      if ( rightCovered && isEmitting ) {
        moveSlitToLayer( rightSlit, behindGlowSlitsLayer );
      }
      else {
        moveSlitToLayer( rightSlit, frontSlitsLayer );
      }
    };

    // Update covered-slit appearance and detector visibility based on slit setting.
    // Note: QuantumWaveInterferenceColors.slitCoverFillProperty is handled by the fill property auto-subscription.
    Multilink.multilink(
      [ sceneModel.slitSettingProperty, sceneModel.slitSeparationProperty, sceneModel.isEmittingProperty ],
      slitSetting => {
        updateCoveredSlitAppearance();
        leftDetector.visible = hasDetectorOnSide( slitSetting, 'left' );
        rightDetector.visible = hasDetectorOnSide( slitSetting, 'right' );
        leftDetectorWire.visible = hasDetectorOnSide( slitSetting, 'left' );
        rightDetectorWire.visible = hasDetectorOnSide( slitSetting, 'right' );

        // Expand the detector graphics evenly in x and y relative to the slit rectangles,
        // then draw a horizontal wire from the outer detector edge to the slit-view boundary.
        leftDetector.setRect(
          leftSlit.rectX - DETECTOR_PADDING,
          slitY - DETECTOR_PADDING,
          leftSlit.rectWidth + 2 * DETECTOR_PADDING,
          SLIT_HEIGHT + 2 * DETECTOR_PADDING
        );
        rightDetector.setRect(
          rightSlit.rectX - DETECTOR_PADDING,
          slitY - DETECTOR_PADDING,
          rightSlit.rectWidth + 2 * DETECTOR_PADDING,
          SLIT_HEIGHT + 2 * DETECTOR_PADDING
        );

        leftDetectorWire.setRect(
          0,
          leftDetector.centerY - DETECTOR_WIRE_HEIGHT / 2,
          leftDetector.left,
          DETECTOR_WIRE_HEIGHT
        );
        rightDetectorWire.setRect(
          rightDetector.right,
          rightDetector.centerY - DETECTOR_WIRE_HEIGHT / 2,
          VIEW_WIDTH - rightDetector.right,
          DETECTOR_WIRE_HEIGHT
        );
      }
    );
  }
}
