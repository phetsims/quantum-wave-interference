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
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import { getViewSlitLayout, SLIT_VIEW_HEIGHT } from '../model/getViewSlitLayout.js';
import { type ObstacleType } from '../model/ObstacleType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const WAVE_REGION_WIDTH = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

const BARRIER_VIEW_WIDTH = 12;
const CORNER_RADIUS = 0;
const BARRIER_FILL = '#939393';
const ARROW_WIDTH = 40;
const WAVE_REGION_FILL_INSET = 0.5;

const DETECTOR_OVERLAY_PADDING = 4;
const DETECTOR_OVERLAY_ALPHA = 0.4;
const DETECTOR_COUNT_FONT = new PhetFont( 13 );
const DETECTOR_FLASH_OPACITY = 0.85;
const DETECTOR_FLASH_DURATION = 0.18;

const SLIT_POSITION_FRACTION_RANGE = new Range( 0.25, 0.75 );

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
    obstacleTypeProperty: TReadOnlyProperty<ObstacleType>,
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
    const topDetectorFlash = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
      SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2, CORNER_RADIUS, CORNER_RADIUS, {
        fill: 'white',
        opacity: 0,
        visible: false,
        pickable: false
      } );
    const bottomDetectorFlash = new Rectangle( 0, 0, BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2,
      SLIT_VIEW_HEIGHT + DETECTOR_OVERLAY_PADDING * 2, CORNER_RADIUS, CORNER_RADIUS, {
        fill: 'white',
        opacity: 0,
        visible: false,
        pickable: false
      } );

    const topDetectorCountStringProperty = new DerivedProperty(
      [ options.topDetectorCountProperty ],
      count => `${count}`
    );
    const bottomDetectorCountStringProperty = new DerivedProperty(
      [ options.bottomDetectorCountProperty ],
      count => `${count}`
    );

    const topDetectorCountText = new Text( topDetectorCountStringProperty, {
      font: DETECTOR_COUNT_FONT,
      fill: 'black',
      maxWidth: BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2 - 2
    } );
    const bottomDetectorCountText = new Text( bottomDetectorCountStringProperty, {
      font: DETECTOR_COUNT_FONT,
      fill: 'black',
      maxWidth: BARRIER_VIEW_WIDTH + DETECTOR_OVERLAY_PADDING * 2 - 2
    } );

    const barrierContainer = new Node( {
      children: [
        topBarrier,
        centralBarrier,
        bottomBarrier,
        topCover,
        bottomCover,
        topDetector,
        bottomDetector,
        topDetectorFlash,
        bottomDetectorFlash,
        topDetectorCountText,
        bottomDetectorCountText
      ]
    } );
    barrierContainer.clipArea = Shape.rectangle(
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_FILL_INSET,
      WAVE_REGION_WIDTH - WAVE_REGION_FILL_INSET * 2,
      WAVE_REGION_HEIGHT - WAVE_REGION_FILL_INSET * 2
    );
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

    let topDetectorFlashAnimation: Animation | null = null;
    let bottomDetectorFlashAnimation: Animation | null = null;

    const flashDetector = ( detectorFlash: Rectangle, isTopDetector: boolean ) => {
      const previousAnimation = isTopDetector ? topDetectorFlashAnimation : bottomDetectorFlashAnimation;
      if ( previousAnimation ) {
        previousAnimation.stop();
      }

      detectorFlash.opacity = DETECTOR_FLASH_OPACITY;
      detectorFlash.visible = true;

      const flashAnimation = new Animation( {
        object: detectorFlash,
        attribute: 'opacity',
        from: DETECTOR_FLASH_OPACITY,
        to: 0,
        duration: DETECTOR_FLASH_DURATION,
        easing: Easing.LINEAR
      } );

      if ( isTopDetector ) {
        topDetectorFlashAnimation = flashAnimation;
      }
      else {
        bottomDetectorFlashAnimation = flashAnimation;
      }

      flashAnimation.endedEmitter.addListener( () => {
        if ( isTopDetector && topDetectorFlashAnimation === flashAnimation ) {
          topDetectorFlashAnimation = null;
          detectorFlash.visible = false;
        }
        else if ( !isTopDetector && bottomDetectorFlashAnimation === flashAnimation ) {
          bottomDetectorFlashAnimation = null;
          detectorFlash.visible = false;
        }
        flashAnimation.dispose();
      } );

      flashAnimation.start();
    };

    options.topDetectorCountProperty.lazyLink( ( count, oldCount ) => {
      if ( count > oldCount ) {
        flashDetector( topDetectorFlash, true );
      }
    } );
    options.bottomDetectorCountProperty.lazyLink( ( count, oldCount ) => {
      if ( count > oldCount ) {
        flashDetector( bottomDetectorFlash, false );
      }
    } );

    Multilink.multilink(
      [ obstacleTypeProperty, slitPositionFractionProperty, slitSeparationProperty, slitSeparationRangeProperty,
        options.isTopSlitCoveredProperty, options.isBottomSlitCoveredProperty,
        options.isTopSlitDetectorProperty, options.isBottomSlitDetectorProperty ],
      ( obstacleType, slitPositionFraction, slitSeparation, slitSeparationRange,
        isTopCovered, isBottomCovered, isTopDetectorOn, isBottomDetectorOn ) => {

        const isDoubleSlit = obstacleType === 'doubleSlit';
        barrierContainer.visible = isDoubleSlit;
        arrowNode.visible = isDoubleSlit;

        if ( !isDoubleSlit ) {
          return;
        }

        const { viewSlitSep: viewSeparation } = getViewSlitLayout(
          slitSeparation,
          slitSeparationRange.min,
          slitSeparationRange.max,
          WAVE_REGION_HEIGHT
        );

        const barrierX = slitPositionFraction * WAVE_REGION_WIDTH - BARRIER_VIEW_WIDTH / 2;
        const centerY = WAVE_REGION_HEIGHT / 2;

        const topSlitCenterY = centerY - viewSeparation / 2;
        const bottomSlitCenterY = centerY + viewSeparation / 2;

        const topBarrierBottom = topSlitCenterY - SLIT_VIEW_HEIGHT / 2;
        topBarrier.setRect(
          barrierX,
          0,
          BARRIER_VIEW_WIDTH,
          Math.max( 0, topBarrierBottom ),
          CORNER_RADIUS,
          CORNER_RADIUS
        );

        const centralBarrierTop = topSlitCenterY + SLIT_VIEW_HEIGHT / 2;
        const centralBarrierBottom = bottomSlitCenterY - SLIT_VIEW_HEIGHT / 2;
        centralBarrier.setRect( barrierX, centralBarrierTop, BARRIER_VIEW_WIDTH,
          Math.max( 0, centralBarrierBottom - centralBarrierTop ), CORNER_RADIUS, CORNER_RADIUS );

        const bottomBarrierTop = bottomSlitCenterY + SLIT_VIEW_HEIGHT / 2;
        bottomBarrier.setRect(
          barrierX,
          bottomBarrierTop,
          BARRIER_VIEW_WIDTH,
          Math.max( 0, WAVE_REGION_HEIGHT - bottomBarrierTop ),
          CORNER_RADIUS,
          CORNER_RADIUS
        );

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
        topDetectorFlash.setRect(
          topDetector.left,
          topDetector.top,
          topDetector.width,
          topDetector.height,
          CORNER_RADIUS, CORNER_RADIUS
        );
        bottomDetectorFlash.setRect(
          bottomDetector.left,
          bottomDetector.top,
          bottomDetector.width,
          bottomDetector.height,
          CORNER_RADIUS, CORNER_RADIUS
        );
        topDetectorFlash.visible = isTopDetectorOn && topDetectorFlash.opacity > 0;
        bottomDetectorFlash.visible = isBottomDetectorOn && bottomDetectorFlash.opacity > 0;
        topDetectorCountText.visible = isTopDetectorOn;
        bottomDetectorCountText.visible = isBottomDetectorOn;
        topDetectorCountText.centerX = topDetector.centerX;
        topDetectorCountText.centerY = topDetector.centerY;
        bottomDetectorCountText.centerX = bottomDetector.centerX;
        bottomDetectorCountText.centerY = bottomDetector.centerY;

        const arrowY = WAVE_REGION_HEIGHT + 12;
        const barrierCenterX = barrierX + BARRIER_VIEW_WIDTH / 2;
        arrowNode.setTailAndTip( barrierCenterX - ARROW_WIDTH / 2, arrowY, barrierCenterX + ARROW_WIDTH / 2, arrowY );
      }
    );
  }
}
