// Copyright 2026, University of Colorado Boulder

/**
 * FrontFacingSlitNode is the zoomed-in front-facing view of the double slits. It shows a black rounded rectangle
 * with two white vertical rectangles representing the slits. Above the left slit is a double-headed arrow
 * displaying the slit width (constant per source type). Below the view is a double-headed arrow displaying
 * the slit separation (updates with the slit separation control).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import ArrowNode from '../../../../scenery-phet/js/ArrowNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import SceneModel from '../model/SceneModel.js';
import SlitSetting from '../model/SlitSetting.js';

// Dimensions of the front-facing slit view
const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 250;
const VIEW_CORNER_RADIUS = 10;

// Slit visual dimensions
const SLIT_HEIGHT = 200; // Height of the white slit rectangles
const SLIT_VISUAL_WIDTH = 6; // Width of each slit rectangle in view coordinates

// Span arrow constants
const SPAN_ARROW_OPTIONS = {
  headHeight: 5,
  headWidth: 5,
  tailWidth: 1,
  doubleHead: true,
  fill: 'black',
  stroke: null as string | null
};

const SPAN_TICK_LENGTH = 8;
const SPAN_FONT = new PhetFont( 12 );

type SelfOptions = EmptySelfOptions;

type FrontFacingSlitNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class FrontFacingSlitNode extends Node {

  public constructor( sceneModel: SceneModel, providedOptions: FrontFacingSlitNodeOptions ) {

    const options = optionize<FrontFacingSlitNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Black rounded rectangle background
    const backgroundRect = new Rectangle( 0, 0, VIEW_WIDTH, VIEW_HEIGHT, VIEW_CORNER_RADIUS, VIEW_CORNER_RADIUS, {
      fill: 'black',
      stroke: '#333',
      lineWidth: 1
    } );
    this.addChild( backgroundRect );

    // Two white slit rectangles, centered vertically in the view
    const slitY = ( VIEW_HEIGHT - SLIT_HEIGHT ) / 2;

    const leftSlit = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: 'white'
    } );
    this.addChild( leftSlit );

    const rightSlit = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: 'white'
    } );
    this.addChild( rightSlit );

    // Cover rectangles for when a slit is covered
    const leftCover = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: '#555',
      visible: false
    } );
    this.addChild( leftCover );

    const rightCover = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: '#555',
      visible: false
    } );
    this.addChild( rightCover );

    // --- Slit width span (above the left slit) ---
    const slitWidthArrow = new ArrowNode( 0, 0, 1, 0, SPAN_ARROW_OPTIONS );
    const slitWidthLeftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    const slitWidthRightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );

    // Format slit width label
    const slitWidthMM = sceneModel.slitWidth;
    let slitWidthLabel: string;
    if ( slitWidthMM >= 0.01 ) {
      slitWidthLabel = `${toFixed( slitWidthMM, slitWidthMM >= 0.1 ? 1 : 2 )} mm`;
    }
    else {
      slitWidthLabel = `${toFixed( slitWidthMM * 1000, 0 )} μm`;
    }
    const slitWidthText = new Text( slitWidthLabel, {
      font: SPAN_FONT,
      maxWidth: 80
    } );

    const slitWidthSpanNode = new Node( {
      children: [ slitWidthArrow, slitWidthLeftTick, slitWidthRightTick, slitWidthText ]
    } );
    this.addChild( slitWidthSpanNode );

    // --- Slit separation span (below the view) ---
    const separationArrow = new ArrowNode( 0, 0, 1, 0, SPAN_ARROW_OPTIONS );
    const separationLeftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    const separationRightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );

    const separationText = new Text( '', {
      font: SPAN_FONT,
      maxWidth: 120
    } );

    const separationSpanNode = new Node( {
      children: [ separationArrow, separationLeftTick, separationRightTick, separationText ]
    } );
    this.addChild( separationSpanNode );

    // Update slit positions and span indicators when slit separation changes
    const updateSlits = () => {
      const separationMM = sceneModel.slitSeparationProperty.value;
      const range = sceneModel.slitSeparationRange;

      // Map slit separation to view spacing: fraction of available width
      // Reserve space for the slits themselves and some padding
      const maxVisualSpacing = VIEW_WIDTH - SLIT_VISUAL_WIDTH * 2 - 20; // max gap between slit centers
      const minVisualSpacing = SLIT_VISUAL_WIDTH + 8; // min gap so slits don't overlap
      const fraction = ( separationMM - range.min ) / ( range.max - range.min );
      const visualSpacing = minVisualSpacing + fraction * ( maxVisualSpacing - minVisualSpacing );

      // Position slits symmetrically about center
      const centerX = VIEW_WIDTH / 2;
      leftSlit.centerX = centerX - visualSpacing / 2;
      rightSlit.centerX = centerX + visualSpacing / 2;

      // Position covers to match slits
      leftCover.x = leftSlit.x;
      rightCover.x = rightSlit.x;

      // Update slit width span (above the left slit)
      const slitLeft = leftSlit.left;
      const slitRight = leftSlit.right;
      const spanWidth = slitRight - slitLeft;

      if ( spanWidth > 12 ) {
        slitWidthArrow.setTailAndTip( slitLeft, 0, slitRight, 0 );
        slitWidthArrow.visible = true;
      }
      else {
        // Arrow too small to render nicely, hide it
        slitWidthArrow.visible = false;
      }
      slitWidthLeftTick.x = slitLeft;
      slitWidthRightTick.x = slitRight;
      slitWidthText.centerX = ( slitLeft + slitRight ) / 2;
      slitWidthText.bottom = -4;
      slitWidthSpanNode.bottom = slitY - 4;

      // Update slit separation span (below the view)
      const sepLeft = leftSlit.centerX;
      const sepRight = rightSlit.centerX;

      separationArrow.setTailAndTip( sepLeft, 0, sepRight, 0 );
      separationLeftTick.x = sepLeft;
      separationRightTick.x = sepRight;

      // Format separation value
      if ( separationMM >= 0.01 ) {
        separationText.string = `${toFixed( separationMM, separationMM >= 0.1 ? 1 : 3 )} mm`;
      }
      else {
        separationText.string = `${toFixed( separationMM * 1000, 0 )} μm`;
      }
      separationText.centerX = ( sepLeft + sepRight ) / 2;
      separationText.top = 4;
      separationSpanNode.top = VIEW_HEIGHT + 4;
    };

    sceneModel.slitSeparationProperty.link( updateSlits );

    // Update cover visibility based on slit setting
    Multilink.multilink( [ sceneModel.slitSettingProperty ], slitSetting => {
      leftCover.visible = ( slitSetting === SlitSetting.LEFT_COVERED );
      rightCover.visible = ( slitSetting === SlitSetting.RIGHT_COVERED );
    } );
  }
}

quantumWaveInterference.register( 'FrontFacingSlitNode', FrontFacingSlitNode );
