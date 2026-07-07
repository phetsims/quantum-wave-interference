// Copyright 2026, University of Colorado Boulder

/**
 * DoubleSlitNode renders the double slit barrier in the wave visualization region. It consists of:
 * - Three gray barrier rectangles (top, central, bottom) with gaps for two slits
 * - Covered slit overlays (darker fill when a slit is covered)
 * - Detector slit overlays (yellow stroke when a detector is on a slit)
 * - A visual-only barrier-to-screen distance indicator below the wave region
 * - A green draggable double-headed arrow below the distance indicator for adjusting slit-to-screen distance
 *
 * The barrier position is set by barrierPositionFractionProperty (fraction of wave region width).
 * Slit separation is mapped from the model range to a visible view range.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import { equalsEpsilon } from '../../../../dot/js/util/equalsEpsilon.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ArrowNode, { type ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import AccessibleSlider, { type AccessibleSliderOptions } from '../../../../sun/js/accessibility/AccessibleSlider.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { DISPLAY_SLIT_WIDTH, getDisplaySlitLayout } from '../getDisplaySlitLayout.js';
import { type BarrierType } from '../model/BarrierType.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import BarrierScreenDistanceIndicatorNode from './BarrierScreenDistanceIndicatorNode.js';
import { type SlitBarrierViewStateFragment } from './description/QuantumWaveInterferenceAccessibleViewState.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';
import SlitDetectorNode from './SlitDetectorNode.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

const BARRIER_VIEW_WIDTH = 12;
const CORNER_RADIUS = 0;
const BARRIER_FILL = '#939393';
const ARROW_WIDTH = 40;
const WAVE_REGION_FILL_INSET = 0.5;

const SLIT_POSITION_FRACTION_RANGE = QuantumWaveInterferenceConstants.BARRIER_POSITION_FRACTION_RANGE;
const SLIT_POSITION_KEYBOARD_STEP = 0.01;
const SLIT_POSITION_SHIFT_KEYBOARD_STEP = 0.0025;
const SLIT_POSITION_PAGE_KEYBOARD_STEP = 0.05;
const SLIT_POSITION_DISTANCE_DECIMAL_PLACES = 2;
const SLIT_POSITION_RESPONSE_EPSILON = 1e-12;

type SlitPositionPosition = 'closest' | 'closer' | 'farther' | 'farthest';

const slitPositionSoundPlayer = new ValueChangeSoundPlayer( SLIT_POSITION_FRACTION_RANGE );

type AccessibleArrowNodeOptions = ArrowNodeOptions & AccessibleSliderOptions;

/**
 * A double-headed ArrowNode that also participates in the PDOM as a slider, enabling keyboard adjustment of
 * the slit-to-screen distance. Combines ArrowNode's visual representation with AccessibleSlider's keyboard
 * and screen-reader behavior at mixin index 4.
 */
class AccessibleArrowNode extends AccessibleSlider( ArrowNode, 4 ) {
  public constructor(
    tailX: number,
    tailY: number,
    tipX: number,
    tipY: number,
    providedOptions: AccessibleArrowNodeOptions
  ) {
    super( tailX, tailY, tipX, tipY, providedOptions );
  }
}

/**
 * Computes the physical slit-to-screen distance from the current slit position.
 * The result is in the unit system returned by getMeasuringTapeUnits (either nm or µm depending on regionWidth).
 *
 * @param regionWidth - wave-region width in model units, used to select nm vs µm display units
 * @param slitPositionFraction - fraction of wave-region width where the barrier sits (0 = left, 1 = right)
 * @returns distance from barrier to right edge of wave region, in the scene's measuring-tape units
 */
function getSlitToScreenDistance( regionWidth: number, slitPositionFraction: number ): number {
  const measuringTapeUnits = getMeasuringTapeUnits( regionWidth );
  return ( 1 - slitPositionFraction ) * WAVE_REGION_WIDTH * measuringTapeUnits.multiplier;
}

/**
 * Returns a localized, formatted string describing the slit-to-screen distance for use in PDOM aria-valuetext.
 * Includes trailing zeros and shows integers as integers so the value is unambiguous to screen-reader users.
 *
 * @param regionWidth - wave-region width in model units, forwarded to getMeasuringTapeUnits
 * @param slitPositionFraction - fraction of wave-region width where the barrier sits
 * @returns accessible distance string, e.g. "3.50 µm"
 */
function getSlitPositionAccessibleDistance( regionWidth: number, slitPositionFraction: number ): string {
  const measuringTapeUnits = getMeasuringTapeUnits( regionWidth );
  return measuringTapeUnits.unit.getAccessibleString( getSlitToScreenDistance( regionWidth, slitPositionFraction ), {
    decimalPlaces: SLIT_POSITION_DISTANCE_DECIMAL_PLACES,
    showTrailingZeros: true,
    showIntegersAsIntegers: true
  } );
}

/**
 * Returns a localized context-response string describing the direction of barrier movement after a drag gesture,
 * or null when the distance has not meaningfully changed (within SLIT_POSITION_RESPONSE_EPSILON). The caller
 * additionally suppresses this directional response while the source is emitting and the sim is playing, since the
 * transition describer announces "Source restarted." plus the advancing wave in that case instead.
 * Used as the createContextResponseAlert callback on the accessible arrow slider.
 *
 * @param regionWidth - wave-region width in model units
 * @param slitPositionFraction - fraction at the end of the drag
 * @param slitPositionFractionOnStart - fraction at the start of the drag
 * @returns localized direction string ("closer", "farther", "closest", "farthest"), or null if no response needed
 */
function getSlitPositionContextResponse(
  regionWidth: number,
  slitPositionFraction: number,
  slitPositionFractionOnStart: number
): string | null {
  const distance = getSlitToScreenDistance( regionWidth, slitPositionFraction );
  const distanceOnStart = getSlitToScreenDistance( regionWidth, slitPositionFractionOnStart );

  if ( equalsEpsilon( distance, distanceOnStart, SLIT_POSITION_RESPONSE_EPSILON ) ) {
    return null;
  }

  const position: SlitPositionPosition =
    equalsEpsilon( slitPositionFraction, SLIT_POSITION_FRACTION_RANGE.max, SLIT_POSITION_RESPONSE_EPSILON ) ? 'closest' :
    equalsEpsilon( slitPositionFraction, SLIT_POSITION_FRACTION_RANGE.min, SLIT_POSITION_RESPONSE_EPSILON ) ? 'farthest' :
    distance < distanceOnStart ? 'closer' :
    'farther';

  return QuantumWaveInterferenceFluent.a11y.barrierPositionSlider.accessibleContextResponse.format( {
    position: position
  } );
}

/**
 * DoubleSlitNode-specific options. Required properties drive slit-cover overlays; optional detector properties
 * enable the yellow detector-indicator overlay on each slit (default to false/0 when absent).
 */
type SelfOptions = {
  isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isTopSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  isBottomSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  topDetectorCountProperty?: TReadOnlyProperty<number>;
  bottomDetectorCountProperty?: TReadOnlyProperty<number>;
};

/** Options for DoubleSlitNode. Callers may pass additionalDoubleSlitOptions via WaveRegionNode to inject detector state. */
export type DoubleSlitNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

export default class DoubleSlitNode extends Node {

  private readonly barrierTypeProperty: TReadOnlyProperty<BarrierType>;
  private readonly barrierPositionFractionProperty: TReadOnlyProperty<number>;
  private readonly slitSeparationProperty: TReadOnlyProperty<number>;
  private readonly isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  private readonly isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  private readonly isTopSlitDetectorProperty: TReadOnlyProperty<boolean>;
  private readonly isBottomSlitDetectorProperty: TReadOnlyProperty<boolean>;

  public constructor(
    sceneProperty: TReadOnlyProperty<{ readonly regionWidth: number; readonly sourceType: SourceType }>,
    barrierTypeProperty: TReadOnlyProperty<BarrierType>,
    barrierPositionFractionProperty: TProperty<number>,
    slitSeparationProperty: TReadOnlyProperty<number>,
    slitSeparationDisplayRangeProperty: TReadOnlyProperty<Range>,
    currentIsEmittingProperty: TReadOnlyProperty<boolean>,
    isPlayingProperty: TReadOnlyProperty<boolean>,
    providedOptions: DoubleSlitNodeOptions
  ) {

    const options = optionize<DoubleSlitNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false,

      // Slit-detector overlays are opt-in (used by the which-path detector feature on the front-facing screens);
      // default to absent so callers that do not show detectors need not supply these.
      isTopSlitDetectorProperty: new TinyProperty( false ),
      isBottomSlitDetectorProperty: new TinyProperty( false ),
      topDetectorCountProperty: new TinyProperty( 0 ),
      bottomDetectorCountProperty: new TinyProperty( 0 ),

      // This Node's visibleProperty only controls whether the barrier rectangles are painted; the presence of a
      // barrier is model state (currentBarrierTypeProperty), so the view visibleProperty is not instrumented.
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( options );

    // PhET-iO clients can set this false to lock the barrier position.
    const isInteractiveProperty = new BooleanProperty( true, {
      tandem: options.tandem.createTandem( 'isInteractiveProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'When false, the double slit cannot be moved by the user: the drag arrow is hidden ' +
                           'and mouse, touch, and keyboard interaction are disabled. The barrier remains visible.'
    } );

    // Block mouse/touch input while locked, and cancel any drag that is already in progress.
    isInteractiveProperty.link( isInteractive => {
      this.pickable = isInteractive ? null : false;
      !isInteractive && this.interruptSubtreeInput();
    } );

    // Retain the model Properties that getAccessibleViewState() reads back for accessibility snapshots.
    this.barrierTypeProperty = barrierTypeProperty;
    this.barrierPositionFractionProperty = barrierPositionFractionProperty;
    this.slitSeparationProperty = slitSeparationProperty;
    this.isTopSlitCoveredProperty = options.isTopSlitCoveredProperty;
    this.isBottomSlitCoveredProperty = options.isBottomSlitCoveredProperty;
    this.isTopSlitDetectorProperty = options.isTopSlitDetectorProperty;
    this.isBottomSlitDetectorProperty = options.isBottomSlitDetectorProperty;

    // The three gray barrier rectangles: the solid material above, between, and below the two slits. All are created
    // empty here and given their positions/heights by the layout Multilink below (which depends on slit separation,
    // barrier position, and slit width).
    const topBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );
    const centralBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );
    const bottomBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );

    // Darker overlays that fill a slit opening when that slit is covered; shown/hidden by the layout Multilink.
    const topCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );
    const bottomCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );

    // Yellow detector indicators (with hit counts) drawn at a slit when a which-path detector is placed on it.
    const topSlitDetectorNode = new SlitDetectorNode( options.isTopSlitDetectorProperty, options.topDetectorCountProperty );
    const bottomSlitDetectorNode = new SlitDetectorNode( options.isBottomSlitDetectorProperty, options.bottomDetectorCountProperty );

    // Group the barrier pieces so they are shown/hidden and clipped together.
    const barrierContainer = new Node( {
      children: [
        topBarrier,
        centralBarrier,
        bottomBarrier,
        topCover,
        bottomCover,
        topSlitDetectorNode,
        bottomSlitDetectorNode
      ]
    } );

    // Clip to the wave region (slightly inset) so no barrier piece paints over the region's border.
    barrierContainer.clipArea = Shape.rectangle(
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_WIDTH - WAVE_REGION_FILL_INSET * 2,
      WAVE_REGION_HEIGHT - WAVE_REGION_FILL_INSET * 2
    );
    this.addChild( barrierContainer );

    const sourceTypeProperty = sceneProperty.derived( scene => scene.sourceType );

    // Tracks the value at the previous sound-feedback step so the slit-position sound plays for the right delta.
    let previousAccessibleSlitPositionFraction = barrierPositionFractionProperty.value;

    // Draggable double-headed arrow below the wave region. It also acts as a PDOM slider, so the barrier position
    // (and hence the slit-to-screen distance) can be adjusted with the keyboard. barrierPositionFractionProperty is
    // its value; the visual arrow is repositioned to track the barrier in the layout Multilink below.
    const arrowNode = new AccessibleArrowNode( 0, 0, 0, 0, {
      doubleHead: true,
      fill: '#74ad67',
      headHeight: 14,
      headWidth: 14,
      tailWidth: 6,
      cursor: 'ew-resize',
      valueProperty: barrierPositionFractionProperty,
      enabledRangeProperty: new TinyProperty( SLIT_POSITION_FRACTION_RANGE ),
      ariaOrientation: Orientation.HORIZONTAL,
      keyboardStep: SLIT_POSITION_KEYBOARD_STEP,
      shiftKeyboardStep: SLIT_POSITION_SHIFT_KEYBOARD_STEP,
      pageKeyboardStep: SLIT_POSITION_PAGE_KEYBOARD_STEP,
      constrainValue: ( value: number ) => SLIT_POSITION_FRACTION_RANGE.constrainValue( value ),
      startDrag: () => {
        previousAccessibleSlitPositionFraction = barrierPositionFractionProperty.value;
      },
      drag: event => {

        // Keyboard changes are discrete, so play the sound for every step; pointer changes are continuous, so only
        // play when the value crosses the next sound threshold (avoids a continuous tone while dragging).
        if ( event.isFromPDOM() ) {
          slitPositionSoundPlayer.playSoundForValueChange(
            barrierPositionFractionProperty.value,
            previousAccessibleSlitPositionFraction
          );
        }
        else {
          slitPositionSoundPlayer.playSoundIfThresholdReached(
            barrierPositionFractionProperty.value,
            previousAccessibleSlitPositionFraction
          );
        }
        previousAccessibleSlitPositionFraction = barrierPositionFractionProperty.value;
      },
      accessibleName: QuantumWaveInterferenceFluent.a11y.barrierPositionSlider.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.barrierPositionSlider.accessibleHelpText.createProperty( {
        sourceType: sourceTypeProperty
      } ),
      createAriaValueText: ( value: number ) => {
        return QuantumWaveInterferenceFluent.a11y.barrierPositionSlider.accessibleValue.format( {
          value: getSlitPositionAccessibleDistance( sceneProperty.value.regionWidth, value )
        } );
      },
      // Speak the directional "closer/farther from screen" response only when the wave is not actively restarting: while
      // the source is emitting AND the sim is playing, moving the barrier restarts the wave and the transition describer
      // announces "Source restarted." plus the advancing wave instead. While paused (even if emitting), no restart is
      // announced, so the directional response still plays.
      createContextResponseAlert: ( value, _newValue, valueOnStart ) =>
        ( currentIsEmittingProperty.value && isPlayingProperty.value ) ? null :
        getSlitPositionContextResponse( sceneProperty.value.regionWidth, value, valueOnStart ),
      descriptionDependencies: Array.from( new Set( [
        sceneProperty,
        currentIsEmittingProperty,
        isPlayingProperty,
        ...micrometersUnit.getDependentProperties(),
        ...nanometersUnit.getDependentProperties(),
        ...QuantumWaveInterferenceFluent.a11y.barrierPositionSlider.accessibleValue.getDependentProperties()
      ] ) )
    } );
    this.addChild( arrowNode );
    this.pdomOrder = [ arrowNode ];

    const barrierScreenDistanceIndicatorNode = new BarrierScreenDistanceIndicatorNode(
      sceneProperty,
      barrierTypeProperty,
      barrierPositionFractionProperty
    );
    this.addChild( barrierScreenDistanceIndicatorNode );

    barrierContainer.cursor = 'ew-resize';

    // Pointer dragging of the barrier. The arrow and the barrier rectangles each get their own listener (and tandem)
    // but share this behavior: horizontal pointer motion is converted to a fraction delta and applied to
    // barrierPositionFractionProperty, clamped to the allowed range, relative to where the drag started.
    let dragStartFraction = 0;
    let dragStartX = 0;

    const createDragListener = ( tandemName: string ) => new DragListener( {
      start: ( event, listener ) => {
        dragStartFraction = barrierPositionFractionProperty.value;
        dragStartX = listener.parentPoint.x;
      },
      drag: ( event, listener ) => {
        const dx = listener.parentPoint.x - dragStartX;
        const fractionDelta = dx / WAVE_REGION_WIDTH;
        const oldSlitPositionFraction = barrierPositionFractionProperty.value;
        barrierPositionFractionProperty.value = SLIT_POSITION_FRACTION_RANGE.constrainValue( dragStartFraction + fractionDelta );
        slitPositionSoundPlayer.playSoundIfThresholdReached(
          barrierPositionFractionProperty.value,
          oldSlitPositionFraction
        );
      },
      tandem: options.tandem.createTandem( tandemName )
    } );
    arrowNode.addInputListener( createDragListener( 'arrowDragListener' ) );
    barrierContainer.addInputListener( createDragListener( 'barrierDragListener' ) );

    // Lay out all barrier geometry whenever anything that affects it changes: barrier type, position, slit separation
    // (and its display range, which can change per scene), the cover/detector state, or interactivity.
    Multilink.multilink(
      [ barrierTypeProperty, barrierPositionFractionProperty, slitSeparationProperty, slitSeparationDisplayRangeProperty,
        options.isTopSlitCoveredProperty, options.isBottomSlitCoveredProperty,
        options.topDetectorCountProperty, options.bottomDetectorCountProperty, isInteractiveProperty ],
      ( barrierType, slitPositionFraction, slitSeparation, slitSeparationDisplayRange,
        isTopCovered, isBottomCovered ) => {

        // The barrier is only drawn for the 'doubleSlit' type; for 'none' hide everything and skip layout.
        const isDoubleSlit = barrierType === 'doubleSlit';
        barrierContainer.visible = isDoubleSlit;

        // Hiding the arrow also removes its slider from the PDOM, so keyboard interaction is disabled while locked.
        arrowNode.visible = isDoubleSlit && isInteractiveProperty.value;
        arrowNode.enabled = isDoubleSlit;

        if ( !isDoubleSlit ) {
          return;
        }

        // Map the physical slit separation to a view distance between the two slit centers.
        const { displaySlitSeparation } = getDisplaySlitLayout(
          slitSeparation,
          slitSeparationDisplayRange.min,
          slitSeparationDisplayRange.max,
          WAVE_REGION_HEIGHT
        );

        // Horizontal placement of the barrier column (centered on the slit-position fraction), and the vertical
        // centers of the two slit openings, symmetric about the region's vertical center.
        const barrierX = slitPositionFraction * WAVE_REGION_WIDTH - BARRIER_VIEW_WIDTH / 2;
        const centerY = WAVE_REGION_HEIGHT / 2;

        const topSlitCenterY = centerY - displaySlitSeparation / 2;
        const bottomSlitCenterY = centerY + displaySlitSeparation / 2;

        // Size the three solid segments to fill the column except for the two slit openings (each DISPLAY_SLIT_WIDTH
        // tall, centered on a slit center). Math.max( 0, ... ) guards against negative heights at extreme separations.
        const topBarrierBottom = topSlitCenterY - DISPLAY_SLIT_WIDTH / 2;
        topBarrier.setRect(
          barrierX,
          0,
          BARRIER_VIEW_WIDTH,
          Math.max( 0, topBarrierBottom ),
          CORNER_RADIUS,
          CORNER_RADIUS
        );

        const centralBarrierTop = topSlitCenterY + DISPLAY_SLIT_WIDTH / 2;
        const centralBarrierBottom = bottomSlitCenterY - DISPLAY_SLIT_WIDTH / 2;
        centralBarrier.setRect( barrierX, centralBarrierTop, BARRIER_VIEW_WIDTH,
          Math.max( 0, centralBarrierBottom - centralBarrierTop ), CORNER_RADIUS, CORNER_RADIUS );

        const bottomBarrierTop = bottomSlitCenterY + DISPLAY_SLIT_WIDTH / 2;
        bottomBarrier.setRect(
          barrierX,
          bottomBarrierTop,
          BARRIER_VIEW_WIDTH,
          Math.max( 0, WAVE_REGION_HEIGHT - bottomBarrierTop ),
          CORNER_RADIUS,
          CORNER_RADIUS
        );

        // Position each cover over its slit opening and show it only when that slit is covered.
        topCover.setRect( barrierX, topBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS );
        bottomCover.setRect( barrierX, centralBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS );
        topCover.visible = isTopCovered;
        bottomCover.visible = isBottomCovered;

        // Align each detector indicator to its slit opening (drawn above the top slit, below the bottom slit).
        topSlitDetectorNode.layoutDetector( barrierX, topBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, 'above' );
        bottomSlitDetectorNode.layoutDetector( barrierX, centralBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, 'below' );

        // Center the drag arrow horizontally on the barrier, below the distance indicator.
        const arrowY = WAVE_REGION_HEIGHT + 26;
        const barrierCenterX = barrierX + BARRIER_VIEW_WIDTH / 2;
        arrowNode.setTailAndTip( barrierCenterX - ARROW_WIDTH / 2, arrowY, barrierCenterX + ARROW_WIDTH / 2, arrowY );
      }
    );
  }

  /**
   * Gets sparse slit-barrier view state for agent-facing accessibility snapshots.
   *
   * @returns slit-barrier view state
   */
  public getAccessibleViewState(): SlitBarrierViewStateFragment | null {
    if ( this.barrierTypeProperty.value !== 'doubleSlit' ) {
      return {
        slitBarrier: {
          barrierType: this.barrierTypeProperty.value
        }
      };
    }

    return {
      slitBarrier: {
        barrierType: this.barrierTypeProperty.value,
        slitPositionFraction: this.barrierPositionFractionProperty.value,
        slitSeparationMM: this.slitSeparationProperty.value,
        topSlitCovered: this.isTopSlitCoveredProperty.value,
        bottomSlitCovered: this.isBottomSlitCoveredProperty.value,
        topSlitDetector: this.isTopSlitDetectorProperty.value,
        bottomSlitDetector: this.isBottomSlitDetectorProperty.value
      }
    };
  }
}
