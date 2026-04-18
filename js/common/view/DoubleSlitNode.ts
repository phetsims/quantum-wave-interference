// Copyright 2026, University of Colorado Boulder

/**
 * DoubleSlitNode renders the double slit barrier in the wave visualization region. It consists of:
 * - Three gray barrier rectangles (top, central, bottom) with gaps for two slits
 * - Covered slit overlays (darker fill when a slit is covered)
 * - Detector slit overlays (yellow stroke when a detector is on a slit, High Intensity only)
 * - A green draggable double-headed arrow below the wave region for adjusting slit-to-screen distance
 *
 * The barrier position is set by slitPositionFractionProperty (fraction of wave region width).
 * Slit separation is mapped from the model range to a visible view range.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import TProperty from '../../../../axon/js/TProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import { linear } from '../../../../dot/js/util/linear.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import { type ObstacleType } from '../model/ObstacleType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

const BARRIER_VIEW_WIDTH = 20;
const CORNER_RADIUS = 2;
const BARRIER_FILL = '#939393';
const SLIT_VIEW_HEIGHT = 22;

const MIN_VIEW_SEPARATION = 40;
const MAX_VIEW_SEPARATION = 220;

const DETECTOR_OVERLAY_PADDING = 4;
const DETECTOR_OVERLAY_ALPHA = 0.4;

const SLIT_POSITION_FRACTION_RANGE = new Range( 0.2, 0.8 );

type SelfOptions = {
  isTopSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isBottomSlitCoveredProperty: TReadOnlyProperty<boolean>;
  isTopSlitDetectorProperty?: TReadOnlyProperty<boolean>;
  isBottomSlitDetectorProperty?: TReadOnlyProperty<boolean>;
};

export type DoubleSlitNodeOptions = SelfOptions & NodeOptions;

export default class DoubleSlitNode extends Node {

  public constructor(
    obstacleTypeProperty: TReadOnlyProperty<ObstacleType>,
    slitPositionFractionProperty: TProperty<number>,
    slitSeparationProperty: TReadOnlyProperty<number>,
    slitSeparationRangeProperty: TReadOnlyProperty<Range>,
    providedOptions: DoubleSlitNodeOptions
  ) {

    const options = optionize<DoubleSlitNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false,
      isTopSlitDetectorProperty: new TinyProperty( false ),
      isBottomSlitDetectorProperty: new TinyProperty( false )
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

    const topCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, SLIT_VIEW_HEIGHT, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );
    const bottomCover = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH, SLIT_VIEW_HEIGHT, CORNER_RADIUS, CORNER_RADIUS, {
      fill: QuantumWaveInterferenceColors.slitCoverFillProperty
    } );

    const detectorOverlayFillWithAlphaProperty = new DerivedProperty(
      [ QuantumWaveInterferenceColors.detectorOverlayFillProperty ],
      color => color.withAlpha( DETECTOR_OVERLAY_ALPHA )
    );

    const topDetector = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
      SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2, CORNER_RADIUS, CORNER_RADIUS, {
        fill: detectorOverlayFillWithAlphaProperty,
        stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
        lineWidth: 2
      } );
    const bottomDetector = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
      SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2, CORNER_RADIUS, CORNER_RADIUS, {
        fill: detectorOverlayFillWithAlphaProperty,
        stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
        lineWidth: 2
      } );

    const barrierContainer = new Node( {
      children: [ topBarrier, centralBarrier, bottomBarrier, topCover, bottomCover, topDetector, bottomDetector ]
    } );
    this.addChild( barrierContainer );

    const arrowNode = new ArrowNode( 0, 0, 0, 0, {
      doubleHead: true,
      fill: '#74ad67',
      headHeight: 14,
      headWidth: 14,
      tailWidth: 6,
      cursor: 'ew-resize'
    } );
    this.addChild( arrowNode );

    barrierContainer.cursor = 'ew-resize';

    let dragStartFraction = 0;
    let dragStartX = 0;

    const createDragListener = () => new DragListener( {
      start: event => {
        dragStartFraction = slitPositionFractionProperty.value;
        dragStartX = event.pointer.point.x;
      },
      drag: event => {
        const globalDx = event.pointer.point.x - dragStartX;
        const fractionDelta = globalDx / WAVE_REGION_WIDTH;
        slitPositionFractionProperty.value = SLIT_POSITION_FRACTION_RANGE.constrainValue( dragStartFraction + fractionDelta );
      }
    } );
    arrowNode.addInputListener( createDragListener() );
    barrierContainer.addInputListener( createDragListener() );

    Multilink.multilink(
      [ obstacleTypeProperty, slitPositionFractionProperty, slitSeparationProperty, slitSeparationRangeProperty,
        options.isTopSlitCoveredProperty, options.isBottomSlitCoveredProperty,
        options.isTopSlitDetectorProperty, options.isBottomSlitDetectorProperty ],
      ( obstacleType: ObstacleType, slitPositionFraction: number, slitSeparation: number, slitSeparationRange: Range,
        isTopCovered: boolean, isBottomCovered: boolean, isTopDetectorOn: boolean, isBottomDetectorOn: boolean ) => {

        const isDoubleSlit = obstacleType === 'doubleSlit';
        barrierContainer.visible = isDoubleSlit;
        arrowNode.visible = isDoubleSlit;

        if ( !isDoubleSlit ) {
          return;
        }

        const separationFraction = ( slitSeparation - slitSeparationRange.min ) /
                                   ( slitSeparationRange.max - slitSeparationRange.min );
        const viewSeparation = linear( 0, 1, MIN_VIEW_SEPARATION, MAX_VIEW_SEPARATION, separationFraction );

        const barrierX = slitPositionFraction * WAVE_REGION_WIDTH - BARRIER_VIEW_WIDTH / 2;
        const centerY = WAVE_REGION_HEIGHT / 2;

        const topSlitCenterY = centerY - viewSeparation / 2;
        const bottomSlitCenterY = centerY + viewSeparation / 2;

        const topBarrierBottom = topSlitCenterY - SLIT_VIEW_HEIGHT / 2;
        topBarrier.setRect( barrierX, 0, BARRIER_VIEW_WIDTH, Math.max( 0, topBarrierBottom ), CORNER_RADIUS, CORNER_RADIUS );

        const centralBarrierTop = topSlitCenterY + SLIT_VIEW_HEIGHT / 2;
        const centralBarrierBottom = bottomSlitCenterY - SLIT_VIEW_HEIGHT / 2;
        centralBarrier.setRect( barrierX, centralBarrierTop, BARRIER_VIEW_WIDTH,
          Math.max( 0, centralBarrierBottom - centralBarrierTop ), CORNER_RADIUS, CORNER_RADIUS );

        const bottomBarrierTop = bottomSlitCenterY + SLIT_VIEW_HEIGHT / 2;
        bottomBarrier.setRect( barrierX, bottomBarrierTop, BARRIER_VIEW_WIDTH,
          Math.max( 0, WAVE_REGION_HEIGHT - bottomBarrierTop ), CORNER_RADIUS, CORNER_RADIUS );

        topCover.setRect( barrierX, topBarrierBottom, BARRIER_VIEW_WIDTH, SLIT_VIEW_HEIGHT, CORNER_RADIUS, CORNER_RADIUS );
        bottomCover.setRect( barrierX, centralBarrierBottom, BARRIER_VIEW_WIDTH, SLIT_VIEW_HEIGHT, CORNER_RADIUS, CORNER_RADIUS );
        topCover.visible = isTopCovered;
        bottomCover.visible = isBottomCovered;

        topDetector.setRect(
          barrierX - DETECTOR_OVERLAY_PADDING,
          topBarrierBottom - DETECTOR_OVERLAY_PADDING,
          BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
          SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2,
          CORNER_RADIUS, CORNER_RADIUS
        );
        bottomDetector.setRect(
          barrierX - DETECTOR_OVERLAY_PADDING,
          centralBarrierBottom - DETECTOR_OVERLAY_PADDING,
          BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
          SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2,
          CORNER_RADIUS, CORNER_RADIUS
        );
        topDetector.visible = isTopDetectorOn;
        bottomDetector.visible = isBottomDetectorOn;

        const arrowY = WAVE_REGION_HEIGHT + 12;
        const arrowWidth = BARRIER_VIEW_WIDTH * 2;
        const barrierCenterX = barrierX + BARRIER_VIEW_WIDTH / 2;
        arrowNode.setTailAndTip( barrierCenterX - arrowWidth / 2, arrowY, barrierCenterX + arrowWidth / 2, arrowY );
      }
    );
  }
}
