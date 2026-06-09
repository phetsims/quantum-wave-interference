// Copyright 2026, University of Colorado Boulder

/**
 * DoubleSlitNode renders the double slit barrier in the wave visualization region. It consists of:
 * - Three gray barrier rectangles (top, central, bottom) with gaps for two slits
 * - Covered slit overlays (darker fill when a slit is covered)
 * - Detector slit overlays (yellow stroke when a detector is on a slit)
 * - A green draggable double-headed arrow below the wave region for adjusting slit-to-screen distance
 *
 * The barrier position is set by slitPositionFractionProperty (fraction of wave region width).
 * Slit separation is mapped from the model range to a visible view range.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

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
import { type SlitBarrierViewStateFragment } from './description/QWIAccessibleViewState.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';
import SlitDetectorNode from './SlitDetectorNode.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

const BARRIER_VIEW_WIDTH = 12;
const CORNER_RADIUS = 0;
const BARRIER_FILL = '#939393';
const ARROW_WIDTH = 40;
const WAVE_REGION_FILL_INSET = 0.5;

const SLIT_POSITION_FRACTION_RANGE = new Range( 0.25, 0.75 );
const SLIT_POSITION_KEYBOARD_STEP = 0.01;
const SLIT_POSITION_SHIFT_KEYBOARD_STEP = 0.0025;
const SLIT_POSITION_PAGE_KEYBOARD_STEP = 0.05;
const SLIT_POSITION_DISTANCE_DECIMAL_PLACES = 2;
const SLIT_POSITION_RESPONSE_EPSILON = 1e-12;

type SlitPositionPosition = 'closest' | 'closer' | 'farther' | 'farthest';

const slitPositionSoundPlayer = new ValueChangeSoundPlayer( SLIT_POSITION_FRACTION_RANGE );

type AccessibleArrowNodeOptions = ArrowNodeOptions & AccessibleSliderOptions;

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

function getSlitToScreenDistance( regionWidth: number, slitPositionFraction: number ): number {
  const measuringTapeUnits = getMeasuringTapeUnits( regionWidth );
  return ( 1 - slitPositionFraction ) * WAVE_REGION_WIDTH * measuringTapeUnits.multiplier;
}

function getSlitPositionAccessibleDistance( regionWidth: number, slitPositionFraction: number ): string {
  const measuringTapeUnits = getMeasuringTapeUnits( regionWidth );
  return measuringTapeUnits.unit.getAccessibleString( getSlitToScreenDistance( regionWidth, slitPositionFraction ), {
    decimalPlaces: SLIT_POSITION_DISTANCE_DECIMAL_PLACES,
    showTrailingZeros: true,
    showIntegersAsIntegers: true
  } );
}

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

  return QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleContextResponse.format( {
    position: position
  } );
}

type SelfOptions = {
  isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isTopSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  isBottomSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  topDetectorCountProperty?: TReadOnlyProperty<number>;
  bottomDetectorCountProperty?: TReadOnlyProperty<number>;
};

export type DoubleSlitNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

export default class DoubleSlitNode extends Node {

  private readonly barrierTypeProperty: TReadOnlyProperty<BarrierType>;
  private readonly slitPositionFractionProperty: TReadOnlyProperty<number>;
  private readonly slitSeparationProperty: TReadOnlyProperty<number>;
  private readonly isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  private readonly isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  private readonly isTopSlitDetectorProperty: TReadOnlyProperty<boolean>;
  private readonly isBottomSlitDetectorProperty: TReadOnlyProperty<boolean>;

  public constructor(
    sceneProperty: TReadOnlyProperty<{ readonly regionWidth: number; readonly sourceType: SourceType }>,
    barrierTypeProperty: TReadOnlyProperty<BarrierType>,
    slitPositionFractionProperty: TProperty<number>,
    slitSeparationProperty: TReadOnlyProperty<number>,
    slitSeparationRangeProperty: TReadOnlyProperty<Range>,
    providedOptions: DoubleSlitNodeOptions
  ) {

    const options = optionize<DoubleSlitNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false,
      isTopSlitDetectorProperty: new TinyProperty( false ),
      isBottomSlitDetectorProperty: new TinyProperty( false ),
      topDetectorCountProperty: new TinyProperty( 0 ),
      bottomDetectorCountProperty: new TinyProperty( 0 )
    }, providedOptions );

    super( options );

    this.barrierTypeProperty = barrierTypeProperty;
    this.slitPositionFractionProperty = slitPositionFractionProperty;
    this.slitSeparationProperty = slitSeparationProperty;
    this.isTopSlitCoveredProperty = options.isTopSlitCoveredProperty;
    this.isBottomSlitCoveredProperty = options.isBottomSlitCoveredProperty;
    this.isTopSlitDetectorProperty = options.isTopSlitDetectorProperty;
    this.isBottomSlitDetectorProperty = options.isBottomSlitDetectorProperty;

    const topBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );
    const centralBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );
    const bottomBarrier = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: BARRIER_FILL
    } );

    const topCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );
    const bottomCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );

    const topSlitDetectorNode = new SlitDetectorNode( options.isTopSlitDetectorProperty, options.topDetectorCountProperty );
    const bottomSlitDetectorNode = new SlitDetectorNode( options.isBottomSlitDetectorProperty, options.bottomDetectorCountProperty );

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
    barrierContainer.clipArea = Shape.rectangle(
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_WIDTH - WAVE_REGION_FILL_INSET * 2,
      WAVE_REGION_HEIGHT - WAVE_REGION_FILL_INSET * 2
    );
    this.addChild( barrierContainer );

    const sourceTypeProperty = sceneProperty.derived( scene => scene.sourceType );
    let previousAccessibleSlitPositionFraction = slitPositionFractionProperty.value;

    const arrowNode = new AccessibleArrowNode( 0, 0, 0, 0, {
      doubleHead: true,
      fill: '#74ad67',
      headHeight: 14,
      headWidth: 14,
      tailWidth: 6,
      cursor: 'ew-resize',
      valueProperty: slitPositionFractionProperty,
      enabledRangeProperty: new TinyProperty( SLIT_POSITION_FRACTION_RANGE ),
      ariaOrientation: Orientation.HORIZONTAL,
      keyboardStep: SLIT_POSITION_KEYBOARD_STEP,
      shiftKeyboardStep: SLIT_POSITION_SHIFT_KEYBOARD_STEP,
      pageKeyboardStep: SLIT_POSITION_PAGE_KEYBOARD_STEP,
      constrainValue: ( value: number ) => SLIT_POSITION_FRACTION_RANGE.constrainValue( value ),
      startDrag: () => {
        previousAccessibleSlitPositionFraction = slitPositionFractionProperty.value;
      },
      drag: event => {
        if ( event.isFromPDOM() ) {
          slitPositionSoundPlayer.playSoundForValueChange(
            slitPositionFractionProperty.value,
            previousAccessibleSlitPositionFraction
          );
        }
        else {
          slitPositionSoundPlayer.playSoundIfThresholdReached(
            slitPositionFractionProperty.value,
            previousAccessibleSlitPositionFraction
          );
        }
        previousAccessibleSlitPositionFraction = slitPositionFractionProperty.value;
      },
      accessibleName: QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleHelpText.createProperty( {
        sourceType: sourceTypeProperty
      } ),
      createAriaValueText: ( value: number ) => {
        return QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleValue.format( {
          value: getSlitPositionAccessibleDistance( sceneProperty.value.regionWidth, value )
        } );
      },
      createContextResponseAlert: ( value, _newValue, valueOnStart ) =>
        getSlitPositionContextResponse( sceneProperty.value.regionWidth, value, valueOnStart ),
      descriptionDependencies: Array.from( new Set( [
        sceneProperty,
        ...micrometersUnit.getDependentProperties(),
        ...nanometersUnit.getDependentProperties(),
        ...QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleValue.getDependentProperties()
      ] ) )
    } );
    this.addChild( arrowNode );
    this.pdomOrder = [ arrowNode ];

    barrierContainer.cursor = 'ew-resize';

    let dragStartFraction = 0;
    let dragStartX = 0;

    const createDragListener = ( tandemName: string ) => new DragListener( {
      start: ( event, listener ) => {
        dragStartFraction = slitPositionFractionProperty.value;
        dragStartX = listener.parentPoint.x;
      },
      drag: ( event, listener ) => {
        const dx = listener.parentPoint.x - dragStartX;
        const fractionDelta = dx / WAVE_REGION_WIDTH;
        const oldSlitPositionFraction = slitPositionFractionProperty.value;
        slitPositionFractionProperty.value = SLIT_POSITION_FRACTION_RANGE.constrainValue( dragStartFraction + fractionDelta );
        slitPositionSoundPlayer.playSoundIfThresholdReached(
          slitPositionFractionProperty.value,
          oldSlitPositionFraction
        );
      },
      tandem: options.tandem.createTandem( tandemName )
    } );
    arrowNode.addInputListener( createDragListener( 'arrowDragListener' ) );
    barrierContainer.addInputListener( createDragListener( 'barrierDragListener' ) );

    Multilink.multilink(
      [ barrierTypeProperty, slitPositionFractionProperty, slitSeparationProperty, slitSeparationRangeProperty,
        options.isTopSlitCoveredProperty, options.isBottomSlitCoveredProperty,
        options.topDetectorCountProperty, options.bottomDetectorCountProperty ],
      ( barrierType, slitPositionFraction, slitSeparation, slitSeparationRange,
        isTopCovered, isBottomCovered ) => {

        const isDoubleSlit = barrierType === 'doubleSlit';
        barrierContainer.visible = isDoubleSlit;
        arrowNode.visible = isDoubleSlit;
        arrowNode.enabled = isDoubleSlit;

        if ( !isDoubleSlit ) {
          return;
        }

        const { displaySlitSeparation } = getDisplaySlitLayout(
          slitSeparation,
          slitSeparationRange.min,
          slitSeparationRange.max,
          WAVE_REGION_HEIGHT
        );

        const barrierX = slitPositionFraction * WAVE_REGION_WIDTH - BARRIER_VIEW_WIDTH / 2;
        const centerY = WAVE_REGION_HEIGHT / 2;

        const topSlitCenterY = centerY - displaySlitSeparation / 2;
        const bottomSlitCenterY = centerY + displaySlitSeparation / 2;

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

        topCover.setRect( barrierX, topBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS );
        bottomCover.setRect( barrierX, centralBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, CORNER_RADIUS, CORNER_RADIUS );
        topCover.visible = isTopCovered;
        bottomCover.visible = isBottomCovered;

        topSlitDetectorNode.layoutDetector( barrierX, topBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, 'above' );
        bottomSlitDetectorNode.layoutDetector( barrierX, centralBarrierBottom, BARRIER_VIEW_WIDTH, DISPLAY_SLIT_WIDTH, 'below' );

        const arrowY = WAVE_REGION_HEIGHT + 12;
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
        slitPositionFraction: this.slitPositionFractionProperty.value,
        slitSeparationMM: this.slitSeparationProperty.value,
        topSlitCovered: this.isTopSlitCoveredProperty.value,
        bottomSlitCovered: this.isBottomSlitCoveredProperty.value,
        topSlitDetector: this.isTopSlitDetectorProperty.value,
        bottomSlitDetector: this.isBottomSlitDetectorProperty.value
      }
    };
  }
}
