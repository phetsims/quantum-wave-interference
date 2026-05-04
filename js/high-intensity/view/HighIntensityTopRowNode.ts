// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityTopRowNode renders the High Intensity screen's top play-area row: a per-scene emitter
 * source on the far left, beam graphics extending rightward through a mini wave-visualization symbol,
 * and a pair of callout lines that connect the mini symbol's top corners to the main wave region's
 * top corners (a zoom-in "viewing frustum" effect, analogous to TinyBox → ZoomedInBox in MOTHA).
 *
 * The mini symbol is a stylized representation of the wave region and detector screen (a neutral square
 * + a skewed detector rectangle) per the design mockups; it does not show live waves. The beam
 * is shown only while emitting and is colored by the active scene's wavelength (photons) or by the
 * shared particle beam color (matter particles).
 *
 * For visual fidelity with the Experiment screen, each matter-particle source uses its own emitter
 * palette (electrons → blue, neutrons → teal, helium → tan/orange). One LaserPointerNode is created
 * per scene; visibility is toggled with the active scene to avoid recoloring node children at runtime.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Property from '../../../../axon/js/Property.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import Shape from '../../../../kite/js/Shape.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { getViewSlitLayout } from '../../common/model/getViewSlitLayout.js';
import { type BarrierType } from '../../common/model/BarrierType.js';
import { type SourceType } from '../../common/model/SourceType.js';
import WaveVisualizationCanvasNode from '../../common/view/WaveVisualizationCanvasNode.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';

const EMITTER_SCALE = 1.5;

const EMITTER_BODY_WIDTH = 70 * EMITTER_SCALE;
const EMITTER_BODY_HEIGHT = 32 * EMITTER_SCALE;
const EMITTER_NOZZLE_WIDTH = 14 * EMITTER_SCALE;
const EMITTER_NOZZLE_HEIGHT = 26 * EMITTER_SCALE;
const EMITTER_BUTTON_RADIUS = 12 * EMITTER_SCALE;

const MINI_SYMBOL_SCALE = 0.5;
const MINI_SYMBOL_SQUARE_SIZE = 22 * MINI_SYMBOL_SCALE;
const MINI_SYMBOL_DETECTOR_WIDTH = 8 * MINI_SYMBOL_SCALE;
const MINI_SYMBOL_SKEW = 3 * MINI_SYMBOL_SCALE;
const MINI_BARRIER_FILL = '#939393';
const MINI_BARRIER_EDGE_INSET = 0.5;
const MINI_BARRIER_WIDTH = Math.max(
  1,
  12 / QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH * MINI_SYMBOL_SQUARE_SIZE
);


const HIGH_OPACITY_BEAM_STACK_HEIGHT = EMITTER_NOZZLE_HEIGHT * 0.85 * 0.9 * 0.85;
const DIM_RIGHT_BEAM_HEIGHT = MINI_SYMBOL_SQUARE_SIZE;
const HIGH_OPACITY_BEAM_ALPHA_SCALE = 0.6;
const DIM_RIGHT_BEAM_ALPHA_SCALE = 0.3;
const RIGHT_BEAM_FADE_WIDTH_SCALE = 0.25;

const CALLOUT_LINE_WIDTH = 0.75;
const CALLOUT_LINE_START_Y_OFFSET = 1;

type ParticleEmitterPalette = {
  topColor: string;
  bottomColor: string;
  highlightColor: string;
};

const PARTICLE_EMITTER_PALETTES: Record<Exclude<SourceType, 'photons'>, ParticleEmitterPalette> = {
  electrons: {
    topColor: 'rgb(100, 120, 180)',
    bottomColor: 'rgb(30, 40, 80)',
    highlightColor: 'rgb(160, 180, 230)'
  },
  neutrons: {
    topColor: 'rgb(92, 137, 144)',
    bottomColor: 'rgb(26, 63, 70)',
    highlightColor: 'rgb(168, 205, 208)'
  },
  heliumAtoms: {
    topColor: 'rgb(173, 138, 94)',
    bottomColor: 'rgb(84, 58, 30)',
    highlightColor: 'rgb(224, 194, 150)'
  }
};

type TopRowSceneLike = {
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  intensityProperty: TReadOnlyProperty<number>;
  isEmitterEnabledProperty: TReadOnlyProperty<boolean>;
  slitSeparationRange: Range;
};

export type HighIntensityTopRowLayout = {
  emitterCenterX: number;      // horizontal center of the emitter body + nozzle assembly
  topRowCenterY: number;       // vertical center of emitter + mini symbol + beam
  waveRegionLeft: number;      // x of main wave region's left edge
  waveRegionRight: number;     // x of main wave region's right edge (i.e. left + width)
  waveRegionTop: number;       // y of main wave region's top edge (target for callout lines)
};

export default class HighIntensityTopRowNode<T extends TopRowSceneLike> extends Node {

  // Bottom y of the emitter body, so callers can stack controls below it without being
  // affected by the taller bounds of the callout lines that extend down to the wave region.
  public readonly emitterBottom: number;
  public readonly emitterCenterX: number;

  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    barrierTypeProperty: TReadOnlyProperty<BarrierType>,
    slitPositionFractionProperty: TReadOnlyProperty<number>,
    slitSeparationProperty: TReadOnlyProperty<number>,
    currentIsEmittingProperty: TProperty<boolean>,
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    beamRightLimitXProperty: TReadOnlyProperty<number>,
    layout: HighIntensityTopRowLayout,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    const { emitterCenterX, topRowCenterY, waveRegionLeft, waveRegionRight, waveRegionTop } = layout;
    const emitterLeft = emitterCenterX - ( EMITTER_BODY_WIDTH + EMITTER_NOZZLE_WIDTH ) / 2;

    // Mini wave-visualization symbol: a small neutral square + skewed detector, centered horizontally
    // above the main wave region so the callout lines form a symmetric "zoom in" frustum.
    // The detector is z-ordered behind the square and overlaps it, mirroring the main layout.
    const miniSquare = new Rectangle( 0, 0, MINI_SYMBOL_SQUARE_SIZE, MINI_SYMBOL_SQUARE_SIZE, {
      fill: WaveVisualizationCanvasNode.BACKGROUND_COLOR,
      stroke: 'white',
      lineWidth: 0.5
    } );

    const miniDetectorOverlap = 2;
    const miniDetectorShape = new Shape()
      .moveTo( 0, MINI_SYMBOL_SKEW )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH, 0 )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH, MINI_SYMBOL_SQUARE_SIZE )
      .lineTo( 0, MINI_SYMBOL_SQUARE_SIZE + MINI_SYMBOL_SKEW )
      .close();
    const miniDetector = new Path( miniDetectorShape, {
      fill: WaveVisualizationCanvasNode.BACKGROUND_COLOR
    } );
    miniDetector.left = miniSquare.right - miniDetectorOverlap;
    miniDetector.centerY = miniSquare.centerY;

    const miniTopBarrier = new Rectangle( 0, 0, MINI_BARRIER_WIDTH, 0, {
      fill: MINI_BARRIER_FILL
    } );
    const miniCentralBarrier = new Rectangle( 0, 0, MINI_BARRIER_WIDTH, 0, {
      fill: MINI_BARRIER_FILL
    } );
    const miniBottomBarrier = new Rectangle( 0, 0, MINI_BARRIER_WIDTH, 0, {
      fill: MINI_BARRIER_FILL
    } );
    const miniDoubleSlitNode = new Node( {
      children: [ miniTopBarrier, miniCentralBarrier, miniBottomBarrier ],
      clipArea: Shape.rectangle( 0, 0, MINI_SYMBOL_SQUARE_SIZE, MINI_SYMBOL_SQUARE_SIZE )
    } );

    const miniSymbol = new Node( { children: [ miniDetector, miniSquare, miniDoubleSlitNode ] } );
    miniSymbol.centerX = ( waveRegionLeft + waveRegionRight ) / 2;
    miniSymbol.centerY = topRowCenterY;

    // Callout lines from the top corners of the mini wave area (not the detector) to the
    // main wave region corners.
    const squareLeft = miniSymbol.x + miniSquare.left;
    const squareRight = miniSymbol.x + miniSquare.right;
    const squareTop = miniSymbol.y + miniSquare.top;
    const calloutLineStartY = squareTop + CALLOUT_LINE_START_Y_OFFSET;
    const calloutLines = new Path( new Shape()
      .moveTo( squareLeft, calloutLineStartY )
      .lineTo( waveRegionLeft, waveRegionTop )
      .moveTo( squareRight, calloutLineStartY )
      .lineTo( waveRegionRight, waveRegionTop ), {
      stroke: QuantumWaveInterferenceColors.zoomCalloutStrokeProperty,
      lineWidth: CALLOUT_LINE_WIDTH
    } );

    // Beam graphics: one full-height high-opacity beam coming out of the emitter, two high-opacity
    // right-side branches above and below the mini wave square, and a dimmer right-side beam aligned
    // with the square itself. Beam is hidden when the emitter is off.
    const emitterBeamLeft = emitterLeft + EMITTER_BODY_WIDTH + EMITTER_NOZZLE_WIDTH;
    const targetOuterRightBeamHeight = HIGH_OPACITY_BEAM_STACK_HEIGHT / 3 * 0.9;
    const miniWaveBoxTop = squareTop;
    const miniWaveBoxBottom = squareTop + MINI_SYMBOL_SQUARE_SIZE;
    const emitterBeamTop = roundSymmetric( miniWaveBoxTop - targetOuterRightBeamHeight );
    const emitterBeamBottom = roundSymmetric( miniWaveBoxBottom + targetOuterRightBeamHeight );
    const emitterBeamHeight = emitterBeamBottom - emitterBeamTop;
    const upperRightBeamTop = emitterBeamTop;
    const upperRightBeamHeight = miniWaveBoxTop - upperRightBeamTop;
    const lowerRightBeamTop = miniWaveBoxBottom;
    const lowerRightBeamHeight = emitterBeamBottom - lowerRightBeamTop;
    const emitterBeamRight = squareLeft;
    const emitterBeam = new Rectangle(
      emitterBeamLeft,
      emitterBeamTop,
      emitterBeamRight - emitterBeamLeft,
      emitterBeamHeight
    );
    const upperRightBeam = new Rectangle( emitterBeamRight, upperRightBeamTop, 0, upperRightBeamHeight );
    const lowerRightBeam = new Rectangle( emitterBeamRight, lowerRightBeamTop, 0, lowerRightBeamHeight );
    const dimRightBeamLeft = squareRight;
    const dimRightBeam = new Rectangle( dimRightBeamLeft, miniWaveBoxTop, 0, DIM_RIGHT_BEAM_HEIGHT );
    const rightBeamFadeOverlayHeight = emitterBeamBottom - emitterBeamTop;
    const rightBeamFadeOverlay = new Rectangle( dimRightBeamLeft, emitterBeamTop, 0, rightBeamFadeOverlayHeight, {
      pickable: false
    } );
    const beamContainer = new Node( {
      children: [ emitterBeam, upperRightBeam, lowerRightBeam, dimRightBeam, rightBeamFadeOverlay ],
      visible: false
    } );

    // One LaserPointerNode per scene with a scene-specific palette. Visibility is toggled per scene
    // so we never recolor nodes at runtime — each emitter is constructed once with its final colors.
    const emittersTandem = tandem.createTandem( 'emitters' );

    const emitterChildren: LaserPointerNode[] = scenes.map( scene => {
      const palette = scene.sourceType === 'photons' ? null : PARTICLE_EMITTER_PALETTES[ scene.sourceType ];
      return new LaserPointerNode( currentIsEmittingProperty, {
        bodySize: new Dimension2( EMITTER_BODY_WIDTH, EMITTER_BODY_HEIGHT ),
        nozzleSize: new Dimension2( EMITTER_NOZZLE_WIDTH, EMITTER_NOZZLE_HEIGHT ),
        topColor: palette ? palette.topColor : undefined,
        bottomColor: palette ? palette.bottomColor : undefined,
        highlightColor: palette ? palette.highlightColor : undefined,
        hasGlass: palette !== null,
        buttonOptions: {
          baseColor: 'red',
          radius: EMITTER_BUTTON_RADIUS,
          valueUpSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
          valueDownSoundPlayer: sharedSoundPlayers.get( 'toggleOn' )
        },
        visible: false,
        tandem: emittersTandem.createTandem( `${scene.sourceType}EmitterNode` )
      } );
    } );

    const emitterContainer = new Node( { children: emitterChildren } );
    emitterContainer.left = emitterLeft;
    emitterContainer.centerY = topRowCenterY;

    // Z-order: callout lines and beam behind the mini symbol and emitter so their geometry reads cleanly.
    this.addChild( calloutLines );
    this.addChild( beamContainer );
    this.addChild( miniSymbol );
    this.addChild( emitterContainer );

    this.emitterBottom = emitterContainer.bottom;
    this.emitterCenterX = emitterCenterX;

    Multilink.multilink( [ visibleBoundsProperty, beamRightLimitXProperty ], ( visibleBounds, beamRightLimitX ) => {
      const rightBeamLimitX = Math.min( visibleBounds.maxX, beamRightLimitX );
      const rightBranchWidth = Math.max( 0, rightBeamLimitX - emitterBeamRight );
      const dimRightBeamWidth = Math.max( 0, rightBeamLimitX - dimRightBeamLeft );
      const rightBeamFadeOverlayWidth = dimRightBeamWidth * RIGHT_BEAM_FADE_WIDTH_SCALE;
      const rightBeamFadeOverlayLeft = rightBeamLimitX - rightBeamFadeOverlayWidth;
      upperRightBeam.setRect( emitterBeamRight, upperRightBeamTop, rightBranchWidth, upperRightBeamHeight );
      lowerRightBeam.setRect( emitterBeamRight, lowerRightBeamTop, rightBranchWidth, lowerRightBeamHeight );
      dimRightBeam.setRect(
        dimRightBeamLeft,
        miniWaveBoxTop,
        dimRightBeamWidth,
        DIM_RIGHT_BEAM_HEIGHT
      );
      rightBeamFadeOverlay.setRect(
        rightBeamFadeOverlayLeft,
        emitterBeamTop,
        rightBeamFadeOverlayWidth,
        rightBeamFadeOverlayHeight
      );
      rightBeamFadeOverlay.fill = new LinearGradient( rightBeamFadeOverlayLeft, 0, rightBeamLimitX, 0 )
        .addColorStop( 0, new Color( 255, 255, 255, 0 ) )
        .addColorStop( 1, 'white' );
    } );

    const currentWavelengthProperty = new DynamicProperty<number, number, T>( sceneProperty, {
      derive: scene => scene.wavelengthProperty
    } );
    const currentIntensityProperty = new DynamicProperty<number, number, T>( sceneProperty, {
      derive: scene => scene.intensityProperty
    } );
    Multilink.multilink(
      [ sceneProperty, barrierTypeProperty, slitPositionFractionProperty, slitSeparationProperty ],
      ( scene, barrierType, slitPositionFraction, slitSeparation ) => {
        miniDoubleSlitNode.visible = barrierType === 'doubleSlit';

        if ( barrierType !== 'doubleSlit' ) {
          return;
        }

        const { viewSlitSep, viewSlitWidth } = getViewSlitLayout(
          slitSeparation,
          scene.slitSeparationRange.min,
          scene.slitSeparationRange.max,
          MINI_SYMBOL_SQUARE_SIZE
        );

        const barrierX = slitPositionFraction * MINI_SYMBOL_SQUARE_SIZE - MINI_BARRIER_WIDTH / 2;
        const centerY = MINI_SYMBOL_SQUARE_SIZE / 2;
        const slitHeight = Math.max( 1, viewSlitWidth );
        const topSlitCenterY = centerY - viewSlitSep / 2;
        const bottomSlitCenterY = centerY + viewSlitSep / 2;

        const topBarrierBottom = topSlitCenterY - slitHeight / 2;
        const centralBarrierTop = topSlitCenterY + slitHeight / 2;
        const centralBarrierBottom = bottomSlitCenterY - slitHeight / 2;
        const bottomBarrierTop = bottomSlitCenterY + slitHeight / 2;

        miniTopBarrier.setRect(
          barrierX,
          MINI_BARRIER_EDGE_INSET,
          MINI_BARRIER_WIDTH,
          Math.max( 0, topBarrierBottom - MINI_BARRIER_EDGE_INSET )
        );
        miniCentralBarrier.setRect(
          barrierX,
          centralBarrierTop,
          MINI_BARRIER_WIDTH,
          Math.max( 0, centralBarrierBottom - centralBarrierTop )
        );
        miniBottomBarrier.setRect(
          barrierX,
          bottomBarrierTop,
          MINI_BARRIER_WIDTH,
          Math.max( 0, MINI_SYMBOL_SQUARE_SIZE - MINI_BARRIER_EDGE_INSET - bottomBarrierTop )
        );
      }
    );

    Multilink.multilink( [
      currentIsEmittingProperty,
      sceneProperty,
      currentWavelengthProperty,
      currentIntensityProperty,
      QuantumWaveInterferenceColors.particleBeamColorProperty
    ], ( isEmitting, scene, wavelength, intensity, particleBeamColor ) => {
      beamContainer.visible = isEmitting;
      if ( !isEmitting ) {
        return;
      }

      const baseColor: Color = scene.sourceType === 'photons'
                               ? VisibleColor.wavelengthToColor( wavelength )
                               : particleBeamColor;
      emitterBeam.fill = baseColor.withAlpha( HIGH_OPACITY_BEAM_ALPHA_SCALE * intensity );
      upperRightBeam.fill = baseColor.withAlpha( HIGH_OPACITY_BEAM_ALPHA_SCALE * intensity );
      lowerRightBeam.fill = baseColor.withAlpha( HIGH_OPACITY_BEAM_ALPHA_SCALE * intensity );
      dimRightBeam.fill = baseColor.withAlpha( DIM_RIGHT_BEAM_ALPHA_SCALE * intensity );
    } );

    linkSceneVisibility( sceneProperty, scenes, emitterChildren );

    const currentEnabledProperty = new DynamicProperty<boolean, boolean, T>( sceneProperty, {
      derive: scene => scene.isEmitterEnabledProperty
    } );
    currentEnabledProperty.link( isEnabled => {
      emitterChildren.forEach( emitter => { emitter.enabled = isEnabled; } );
    } );
  }
}
