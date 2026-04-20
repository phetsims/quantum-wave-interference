// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create ScreenIcon instances for the three screens of the Quantum Wave Interference
 * simulation. Each icon is a programmatic illustration capturing the essence of its screen:
 *
 *   Experiment  – overhead view of double-slit barrier with circular wavefronts
 *   High Intensity – continuous interference fringe pattern on a detector screen
 *   Single Particles – individual particle hits forming an emerging interference pattern
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../../joist/js/ScreenIcon.js';
import Shape from '../../../../kite/js/Shape.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';

const ICON_SIZE = MINIMUM_HOME_SCREEN_ICON_SIZE;
const ICON_W = ICON_SIZE.width;
const ICON_H = ICON_SIZE.height;

const BARRIER_COLOR = '#939393';
const WAVE_REGION_COLOR = 'black';
const DEFAULT_WAVELENGTH_NM = 650;

const createDoubleSlitBarrier = (
  barrierX: number,
  barrierWidth: number,
  slitHeight: number,
  slitSeparation: number
): {
  topSlitY: number;
  bottomSlitY: number;
  topBarrier: Rectangle;
  centralBarrier: Rectangle;
  bottomBarrier: Rectangle;
} => {
  const centerY = ICON_H / 2;
  const topSlitY = centerY - slitSeparation / 2;
  const bottomSlitY = centerY + slitSeparation / 2;

  return {
    topSlitY: topSlitY,
    bottomSlitY: bottomSlitY,
    topBarrier: new Rectangle( barrierX, 0, barrierWidth, topSlitY - slitHeight / 2, {
      fill: BARRIER_COLOR
    } ),
    centralBarrier: new Rectangle( barrierX, topSlitY + slitHeight / 2, barrierWidth,
      slitSeparation - slitHeight, {
        fill: BARRIER_COLOR
      } ),
    bottomBarrier: new Rectangle( barrierX, bottomSlitY + slitHeight / 2, barrierWidth,
      ICON_H - ( bottomSlitY + slitHeight / 2 ), {
        fill: BARRIER_COLOR
      } )
  };
};

/**
 * Creates the Experiment screen icon: an overhead view of the double-slit experiment with
 * circular wavefront arcs emanating from the source point, a gray barrier with two slits,
 * and the black wave region background.
 */
export const createExperimentScreenIcon = (): ScreenIcon => {

  const background = new Rectangle( 0, 0, ICON_W, ICON_H, { fill: WAVE_REGION_COLOR } );

  const barrierX = ICON_W * 0.4;
  const barrierWidth = 8;
  const slitHeight = 20;
  const slitSeparation = 70;
  const centerY = ICON_H / 2;
  const {
    topSlitY,
    bottomSlitY,
    topBarrier,
    centralBarrier,
    bottomBarrier
  } = createDoubleSlitBarrier( barrierX, barrierWidth, slitHeight, slitSeparation );

  const waveColor = VisibleColor.wavelengthToColor( DEFAULT_WAVELENGTH_NM );

  // Circular wavefront arcs from the source (left edge)
  const sourceX = 0;
  const sourceY = centerY;
  const wavefronts = new Node();
  const numWavefronts = 8;
  const spacing = 30;
  for ( let i = 1; i <= numWavefronts; i++ ) {
    const radius = i * spacing;
    const arc = new Circle( radius, {
      stroke: waveColor.withAlpha( 0.6 - i * 0.05 ),
      lineWidth: 2,
      center: new Vector2( sourceX, sourceY )
    } );
    wavefronts.addChild( arc );
  }

  // Secondary wavefronts from each slit (diffracted waves)
  const slitWavefronts = new Node();
  const numSlitWaves = 6;
  const slitSpacing = 25;
  for ( const slitY of [ topSlitY, bottomSlitY ] ) {
    for ( let i = 1; i <= numSlitWaves; i++ ) {
      const radius = i * slitSpacing;
      const arc = new Circle( radius, {
        stroke: waveColor.withAlpha( 0.5 - i * 0.06 ),
        lineWidth: 1.5,
        center: new Vector2( barrierX + barrierWidth, slitY )
      } );
      slitWavefronts.addChild( arc );
    }
  }

  const iconNode = new Node( {
    children: [ background, wavefronts, topBarrier, centralBarrier, bottomBarrier, slitWavefronts ],
    clipArea: Shape.bounds( background.bounds )
  } );

  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: WAVE_REGION_COLOR
  } );
};

/**
 * Creates the High Intensity screen icon: vertical interference fringe bands on a dark background,
 * representing the continuous intensity pattern seen on the detector screen.
 */
export const createHighIntensityScreenIcon = (): ScreenIcon => {

  const background = new Rectangle( 0, 0, ICON_W, ICON_H, { fill: WAVE_REGION_COLOR } );

  const waveColor = VisibleColor.wavelengthToColor( DEFAULT_WAVELENGTH_NM );

  // Create interference fringe pattern as vertical bands using a gradient
  const numFringes = 7;
  const gradient = new LinearGradient( 0, 0, 0, ICON_H );

  for ( let i = 0; i <= numFringes * 2; i++ ) {
    const fraction = i / ( numFringes * 2 );
    const fringePhase = Math.cos( ( fraction - 0.5 ) * numFringes * Math.PI );

    // Single-slit envelope: cosine falloff from center
    const envelope = Math.cos( ( fraction - 0.5 ) * Math.PI );
    const intensity = Math.pow( Math.abs( fringePhase ), 2 ) * Math.pow( Math.max( 0, envelope ), 2 );

    gradient.addColorStop( fraction, waveColor.withAlpha( intensity * 0.9 ) );
  }

  // The fringe pattern occupies the right portion of the icon (detector screen area)
  const fringeRect = new Rectangle( ICON_W * 0.55, 0, ICON_W * 0.45, ICON_H, {
    fill: gradient
  } );

  // Wave region with subtle wave indication on the left
  const waveGradient = new LinearGradient( 0, 0, ICON_W * 0.5, 0 );
  waveGradient.addColorStop( 0, waveColor.withAlpha( 0.15 ) );
  waveGradient.addColorStop( 0.7, waveColor.withAlpha( 0.05 ) );
  waveGradient.addColorStop( 1, 'transparent' );

  const waveHint = new Rectangle( 0, 0, ICON_W * 0.5, ICON_H, {
    fill: waveGradient
  } );

  // Barrier
  const barrierX = ICON_W * 0.48;
  const barrierWidth = 6;
  const slitHeight = 16;
  const slitSeparation = 60;
  const { topBarrier, centralBarrier, bottomBarrier } = createDoubleSlitBarrier(
    barrierX,
    barrierWidth,
    slitHeight,
    slitSeparation
  );

  // Thin detector screen line on the right edge
  const screenLine = new Line( ICON_W * 0.98, 0, ICON_W * 0.98, ICON_H, {
    stroke: '#aaa',
    lineWidth: 3
  } );

  const iconNode = new Node( {
    children: [ background, waveHint, topBarrier, centralBarrier, bottomBarrier, fringeRect, screenLine ],
    clipArea: Shape.bounds( background.bounds )
  } );

  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: WAVE_REGION_COLOR
  } );
};

/**
 * Creates the Single Particles screen icon: scattered particle hits forming an emerging
 * double-slit interference pattern on a dark detector screen background.
 */
export const createSingleParticlesScreenIcon = (): ScreenIcon => {

  const background = new Rectangle( 0, 0, ICON_W, ICON_H, { fill: WAVE_REGION_COLOR } );

  const waveColor = VisibleColor.wavelengthToColor( DEFAULT_WAVELENGTH_NM );
  const hitsNode = new Node();

  // Use a seeded random for reproducible icon across sessions
  const seed = 42;
  let rng = seed;
  const nextRandom = (): number => {
    rng = ( rng * 16807 + 0 ) % 2147483647;
    return rng / 2147483647;
  };

  const numHits = 200;
  const numFringes = 7;

  for ( let i = 0; i < numHits; i++ ) {

    // Sample y from interference pattern probability distribution via rejection sampling
    let y: number;
    let accepted = false;
    while ( !accepted ) {
      y = nextRandom();
      const fringePhase = Math.cos( ( y - 0.5 ) * numFringes * Math.PI );
      const envelope = Math.cos( ( y - 0.5 ) * Math.PI );
      const probability = Math.pow( Math.abs( fringePhase ), 2 ) * Math.pow( Math.max( 0, envelope ), 2 );

      if ( nextRandom() < probability ) {
        accepted = true;
      }
    }

    const x = ICON_W * 0.3 + nextRandom() * ICON_W * 0.6;
    const hitY = y! * ICON_H;

    const dot = new Circle( 2.5, {
      fill: waveColor.withAlpha( 0.7 + nextRandom() * 0.3 ),
      center: new Vector2( x, hitY )
    } );
    hitsNode.addChild( dot );
  }

  const iconNode = new Node( {
    children: [ background, hitsNode ],
    clipArea: Shape.bounds( background.bounds )
  } );

  return new ScreenIcon( iconNode, {
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1,
    fill: WAVE_REGION_COLOR
  } );
};
