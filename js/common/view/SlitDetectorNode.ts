// Copyright 2026, University of Colorado Boulder

/**
 * SlitDetectorNode renders the detector overlay, detection flash, and count panel for one slit in DoubleSlitNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';

const CORNER_RADIUS = 0;
const DETECTOR_OVERLAY_LINE_WIDTH = 2;
const DETECTOR_OVERLAY_ALPHA = 0.4;
const DETECTOR_COUNT_FONT = new PhetFont( 12 );
const DETECTOR_COUNT_PANEL_X_MARGIN = 3;
const DETECTOR_COUNT_PANEL_Y_MARGIN = 2;
const DETECTOR_COUNT_PANEL_CORNER_RADIUS = 3;
const DETECTOR_COUNT_PANEL_OFFSET = 7;
const DETECTOR_COUNT_TEXT_MAX_WIDTH = 40;
const DETECTOR_FLASH_OPACITY = 0.85;
const DETECTOR_FLASH_DURATION = 0.18;

export type SlitDetectorCountPanelPlacement = 'above' | 'below';

export default class SlitDetectorNode extends Node {

  private readonly detectorOverlay: Rectangle;
  private readonly detectorFlash: Rectangle;
  private readonly detectorCountPanel: Panel;
  private detectorFlashAnimation: Animation | null = null;

  public constructor( isSlitDetectorProperty: TReadOnlyProperty<boolean>, detectorCountProperty: TReadOnlyProperty<number> ) {
    super();

    const detectorOverlayFillWithAlphaProperty = new DerivedProperty(
      [ QuantumWaveInterferenceColors.detectorOverlayFillProperty ],
      color => color.withAlpha( DETECTOR_OVERLAY_ALPHA )
    );

    this.detectorOverlay = new Rectangle( 0, 0, 0, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: detectorOverlayFillWithAlphaProperty,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      lineWidth: DETECTOR_OVERLAY_LINE_WIDTH
    } );
    this.addChild( this.detectorOverlay );

    this.detectorFlash = new Rectangle( 0, 0, 0, 0, CORNER_RADIUS, CORNER_RADIUS, {
      fill: 'white',
      opacity: 0,
      visible: false,
      pickable: false
    } );
    this.addChild( this.detectorFlash );

    const detectorCountStringProperty = new DerivedProperty(
      [ detectorCountProperty ],
      count => `${count}`
    );

    const detectorCountText = new Text( detectorCountStringProperty, {
      font: DETECTOR_COUNT_FONT,
      fill: 'black',
      maxWidth: DETECTOR_COUNT_TEXT_MAX_WIDTH
    } );

    this.detectorCountPanel = new Panel( detectorCountText, {
      fill: QuantumWaveInterferenceColors.detectorOverlayFillProperty,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      xMargin: DETECTOR_COUNT_PANEL_X_MARGIN,
      yMargin: DETECTOR_COUNT_PANEL_Y_MARGIN,
      cornerRadius: DETECTOR_COUNT_PANEL_CORNER_RADIUS,
      align: 'center'
    } );
    this.addChild( this.detectorCountPanel );

    isSlitDetectorProperty.link( isSlitDetectorOn => {
      this.visible = isSlitDetectorOn;
    } );

    detectorCountProperty.lazyLink( ( count, oldCount ) => {
      if ( count > oldCount ) {
        this.flashDetector();
      }
    } );
  }

  /**
   * Positions the detector overlay and count panel for the slit bounds in this Node's parent coordinate frame.
   * The overlay is inset by half of its stroke width so its stroke remains inside the slit bounds.
   *
   * @param x - Left edge of the slit bounds.
   * @param y - Top edge of the slit bounds.
   * @param width - Width of the slit bounds.
   * @param height - Height of the slit bounds.
   * @param countPanelPlacement - Whether the count panel should be positioned above or below the detector overlay.
   */
  public layoutDetector(
    x: number,
    y: number,
    width: number,
    height: number,
    countPanelPlacement: SlitDetectorCountPanelPlacement
  ): void {

    this.detectorOverlay.setRect(
      x + DETECTOR_OVERLAY_LINE_WIDTH / 2,
      y + DETECTOR_OVERLAY_LINE_WIDTH / 2,
      width - DETECTOR_OVERLAY_LINE_WIDTH,
      height - DETECTOR_OVERLAY_LINE_WIDTH,
      CORNER_RADIUS,
      CORNER_RADIUS
    );

    this.detectorFlash.setRect(
      this.detectorOverlay.left,
      this.detectorOverlay.top,
      this.detectorOverlay.width,
      this.detectorOverlay.height,
      CORNER_RADIUS,
      CORNER_RADIUS
    );

    this.detectorFlash.visible = this.detectorFlash.opacity > 0;
    this.detectorCountPanel.centerX = this.detectorOverlay.centerX;

    if ( countPanelPlacement === 'above' ) {
      this.detectorCountPanel.bottom = this.detectorOverlay.top - DETECTOR_COUNT_PANEL_OFFSET;
    }
    else {
      this.detectorCountPanel.top = this.detectorOverlay.bottom + DETECTOR_COUNT_PANEL_OFFSET;
    }
  }

  /**
   * Starts or restarts the detector flash animation after the count increases.
   */
  private flashDetector(): void {
    if ( this.detectorFlashAnimation ) {
      this.detectorFlashAnimation.stop();
    }

    this.detectorFlash.opacity = DETECTOR_FLASH_OPACITY;
    this.detectorFlash.visible = true;

    const flashAnimation = new Animation( {
      object: this.detectorFlash,
      attribute: 'opacity',
      from: DETECTOR_FLASH_OPACITY,
      to: 0,
      duration: DETECTOR_FLASH_DURATION,
      easing: Easing.LINEAR
    } );

    this.detectorFlashAnimation = flashAnimation;

    flashAnimation.endedEmitter.addListener( () => {
      if ( this.detectorFlashAnimation === flashAnimation ) {
        this.detectorFlashAnimation = null;
        this.detectorFlash.visible = false;
      }
      flashAnimation.dispose();
    } );

    flashAnimation.start();
  }
}
