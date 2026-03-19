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
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Color from '../../../../scenery/js/util/Color.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import SceneModel from '../model/SceneModel.js';

const VIEW_WIDTH = QuantumWaveInterferenceConstants.FRONT_FACING_SLIT_VIEW_WIDTH;
const VIEW_HEIGHT = QuantumWaveInterferenceConstants.FRONT_FACING_ROW_HEIGHT;
const VIEW_CORNER_RADIUS = 10;

// Slit visual dimensions
const SLIT_HEIGHT = 130; // Height of the white slit rectangles
const SLIT_VISUAL_WIDTH = 8; // Width of each slit rectangle in view coordinates

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

    // Beam color overlay: shown when the source is emitting, tinting the black barrier
    // with the beam color to indicate light/particles hitting the slit barrier.
    // Clipped to the background rectangle shape.
    const beamOverlay = new Rectangle( 0, 0, VIEW_WIDTH, VIEW_HEIGHT, VIEW_CORNER_RADIUS, VIEW_CORNER_RADIUS, {
      fill: 'red',
      visible: false
    } );
    this.addChild( beamOverlay );

    // Particle beam color (gray for all non-photon particles)
    const PARTICLE_BEAM_COLOR = new Color( 180, 180, 180 );

    // Two white slit rectangles, centered vertically in the view.
    // When the source is emitting, the slits glow with the beam color to show
    // light/particles passing through the openings.
    const slitY = ( VIEW_HEIGHT - SLIT_HEIGHT ) / 2;

    const leftSlit = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: 'white'
    } );
    this.addChild( leftSlit );

    const rightSlit = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: 'white'
    } );
    this.addChild( rightSlit );

    // Update beam overlay visibility, color, and slit glow based on emitter state
    const updateBeamOverlay = () => {
      const isEmitting = sceneModel.isEmittingProperty.value;
      const intensity = sceneModel.intensityProperty.value;

      if ( !isEmitting ) {
        beamOverlay.visible = false;
        leftSlit.fill = 'white';
        rightSlit.fill = 'white';
        return;
      }

      beamOverlay.visible = true;
      const beamColor = sceneModel.sourceType === 'photons'
                         ? VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value )
                         : PARTICLE_BEAM_COLOR;
      beamOverlay.fill = beamColor.withAlpha( 0.15 + 0.35 * intensity );

      // Slit openings glow with a brighter version of the beam color
      leftSlit.fill = beamColor.withAlpha( 0.5 + 0.5 * intensity );
      rightSlit.fill = beamColor.withAlpha( 0.5 + 0.5 * intensity );
    };

    sceneModel.isEmittingProperty.link( updateBeamOverlay );
    sceneModel.intensityProperty.link( updateBeamOverlay );
    sceneModel.wavelengthProperty.link( updateBeamOverlay );

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
    const slitWidthArrow = new ArrowNode( 0, 0, 1, 0, SLIT_WIDTH_ARROW_OPTIONS );
    const slitWidthLeftTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );
    const slitWidthRightTick = new Line( 0, -SPAN_TICK_LENGTH / 2, 0, SPAN_TICK_LENGTH / 2, { stroke: 'black', lineWidth: 1 } );

    // Format slit width label: use μm for values < 0.01 mm, mm otherwise.
    // Determine decimal places for μm display based on the actual value.
    const slitWidthMM = sceneModel.slitWidth;
    let slitWidthLabel: string;
    if ( slitWidthMM >= 0.01 ) {
      slitWidthLabel = `${toFixed( slitWidthMM, slitWidthMM >= 0.1 ? 1 : 2 )} mm`;
    }
    else {
      const slitWidthUM = slitWidthMM * 1000;
      const umDecimalPlaces = slitWidthUM >= 1 ? 0 : ( slitWidthUM >= 0.1 ? 1 : 2 );
      slitWidthLabel = `${toFixed( slitWidthUM, umDecimalPlaces )} μm`;
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

      // Format separation value: use μm for values ≤ 0.1 mm for readability.
      // Always use 1 decimal place for consistency with the design mockup (e.g., "1.0 μm" not "1 μm").
      if ( separationMM > 0.1 ) {
        separationText.string = `${toFixed( separationMM, 1 )} mm`;
      }
      else {
        const valueUM = separationMM * 1000;
        separationText.string = `${toFixed( valueUM, 1 )} μm`;
      }

      // Position the label to the right of the right tick mark, matching the
      // slit width span label style above the view (per the design mockup).
      separationText.left = sepRight + 5;
      separationText.centerY = 0;
      separationSpanNode.top = VIEW_HEIGHT + 2;
    };

    sceneModel.slitSeparationProperty.link( updateSlits );

    // Detector indicator rectangles (yellow/orange translucent overlays, distinct from gray covers)
    const DETECTOR_COLOR = new Color( 255, 200, 50, 0.6 );
    const leftDetector = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: DETECTOR_COLOR,
      stroke: new Color( 200, 150, 0 ),
      lineWidth: 1,
      visible: false
    } );
    this.addChild( leftDetector );

    const rightDetector = new Rectangle( 0, slitY, SLIT_VISUAL_WIDTH, SLIT_HEIGHT, {
      fill: DETECTOR_COLOR,
      stroke: new Color( 200, 150, 0 ),
      lineWidth: 1,
      visible: false
    } );
    this.addChild( rightDetector );

    // Update cover and detector visibility based on slit setting
    Multilink.multilink( [ sceneModel.slitSettingProperty, sceneModel.slitSeparationProperty ], slitSetting => {
      leftCover.visible = ( slitSetting === 'leftCovered' );
      rightCover.visible = ( slitSetting === 'rightCovered' );
      leftDetector.visible = ( slitSetting === 'leftDetector' );
      rightDetector.visible = ( slitSetting === 'rightDetector' );

      // Position detectors to match slit positions
      leftDetector.x = leftSlit.x;
      rightDetector.x = rightSlit.x;
    } );
  }
}

quantumWaveInterference.register( 'FrontFacingSlitNode', FrontFacingSlitNode );
