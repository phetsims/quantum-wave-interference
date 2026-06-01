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
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import ArrowNode, { type ArrowNodeOptions } from '../../../../scenery-phet/js/ArrowNode.js';
import { micrometersUnit } from '../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import AccessibleSlider, { type AccessibleSliderOptions } from '../../../../sun/js/accessibility/AccessibleSlider.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { DISPLAY_SLIT_WIDTH, getDisplaySlitLayout } from '../getDisplaySlitLayout.js';
import { type BarrierType } from '../model/BarrierType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
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

type SelfOptions = {
  isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isTopSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  isBottomSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  topDetectorCountProperty?: TReadOnlyProperty<number>;
  bottomDetectorCountProperty?: TReadOnlyProperty<number>;
};

export type DoubleSlitNodeOptions = SelfOptions & NodeOptions;

export default class DoubleSlitNode extends Node {

  public constructor(
    sceneProperty: TReadOnlyProperty<{ readonly regionWidth: number }>,
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
      accessibleName: QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleHelpTextStringProperty,
      createAriaValueText: ( value: number ) => {
        const measuringTapeUnits = getMeasuringTapeUnits( sceneProperty.value.regionWidth );
        const distance = ( 1 - value ) * WAVE_REGION_WIDTH * measuringTapeUnits.multiplier;

        return QuantumWaveInterferenceFluent.a11y.slitPositionSlider.accessibleValue.format( {
          value: measuringTapeUnits.unit.getAccessibleString( distance, {
            decimalPlaces: SLIT_POSITION_DISTANCE_DECIMAL_PLACES,
            showTrailingZeros: true,
            showIntegersAsIntegers: true
          } )
        } );
      },
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

    const createDragListener = () => new DragListener( {
      start: ( event, listener ) => {
        dragStartFraction = slitPositionFractionProperty.value;
        dragStartX = listener.parentPoint.x;
      },
      drag: ( event, listener ) => {
        const dx = listener.parentPoint.x - dragStartX;
        const fractionDelta = dx / WAVE_REGION_WIDTH;
        slitPositionFractionProperty.value = SLIT_POSITION_FRACTION_RANGE.constrainValue( dragStartFraction + fractionDelta );
      }
    } );
    arrowNode.addInputListener( createDragListener() );
    barrierContainer.addInputListener( createDragListener() );

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
}
