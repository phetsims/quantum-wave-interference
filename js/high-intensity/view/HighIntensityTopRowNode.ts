// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityTopRowNode renders the High Intensity screen's top play-area row: a per-scene emitter
 * source on the far left, beam graphics extending rightward through a mini wave-visualization symbol,
 * and a pair of callout lines that connect the mini symbol's bottom corners to the main wave region's
 * top corners (a zoom-in "viewing frustum" effect, analogous to TinyBox → ZoomedInBox in MOTHA).
 *
 * The mini symbol is a stylized representation of the wave region and detector screen (a black square
 * + a skewed black detector rectangle) per the design mockups; it does not show live waves. The beam
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
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Shape from '../../../../kite/js/Shape.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Color from '../../../../scenery/js/util/Color.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import { type SourceType } from '../../common/model/SourceType.js';
import createRoundedPolygonShape from '../../common/view/createRoundedPolygonShape.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';

const EMITTER_BODY_WIDTH = 70;
const EMITTER_BODY_HEIGHT = 32;
const EMITTER_NOZZLE_WIDTH = 14;
const EMITTER_NOZZLE_HEIGHT = 26;
const EMITTER_BUTTON_RADIUS = 12;

const MINI_SYMBOL_SQUARE_SIZE = 22;
const MINI_SYMBOL_DETECTOR_WIDTH = 8;
const MINI_SYMBOL_SKEW = 3;


const BEAM_HEIGHT = EMITTER_NOZZLE_HEIGHT;
const BEAM_MAIN_ALPHA_SCALE = 0.35;
const BEAM_CUTOFF_ALPHA_SCALE = 0.12;
const BEAM_CUTOFF_EXTENSION = 70;

const CALLOUT_LINE_WIDTH = 0.75;

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
};

export type HighIntensityTopRowLayout = {
  emitterLeft: number;         // x of emitter body's left edge
  topRowCenterY: number;       // vertical center of emitter + mini symbol + beam
  waveRegionLeft: number;      // x of main wave region's left edge
  waveRegionRight: number;     // x of main wave region's right edge (i.e. left + width)
  waveRegionTop: number;       // y of main wave region's top edge (target for callout lines)
};

export default class HighIntensityTopRowNode<T extends TopRowSceneLike> extends Node {

  // Bottom y of the emitter body, so callers can stack controls below it without being
  // affected by the taller bounds of the callout lines that extend down to the wave region.
  public readonly emitterBottom: number;

  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    currentIsEmittingProperty: TProperty<boolean>,
    layout: HighIntensityTopRowLayout,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    const { emitterLeft, topRowCenterY, waveRegionLeft, waveRegionRight, waveRegionTop } = layout;

    // Mini wave-visualization symbol: a small black square + skewed detector, centered horizontally
    // above the main wave region so the callout lines form a symmetric "zoom in" frustum.
    // The detector is z-ordered behind the square and overlaps it, mirroring the main layout.
    const miniSquare = new Rectangle( 0, 0, MINI_SYMBOL_SQUARE_SIZE, MINI_SYMBOL_SQUARE_SIZE, {
      fill: 'black',
      stroke: 'white',
      lineWidth: 0.75,
      cornerRadius: 2
    } );

    const miniDetectorOverlap = 2;
    const miniDetectorShape = createRoundedPolygonShape( [
      { x: 0, y: MINI_SYMBOL_SKEW },
      { x: MINI_SYMBOL_DETECTOR_WIDTH, y: 0 },
      { x: MINI_SYMBOL_DETECTOR_WIDTH, y: MINI_SYMBOL_SQUARE_SIZE },
      { x: 0, y: MINI_SYMBOL_SQUARE_SIZE + MINI_SYMBOL_SKEW }
    ], 1 );
    const miniDetector = new Path( miniDetectorShape, { fill: 'gray' } );
    miniDetector.left = miniSquare.right - miniDetectorOverlap;
    miniDetector.centerY = miniSquare.centerY;

    const miniSymbol = new Node( { children: [ miniDetector, miniSquare ] } );
    miniSymbol.centerX = ( waveRegionLeft + waveRegionRight ) / 2;
    miniSymbol.centerY = topRowCenterY;

    // Callout lines: connect the bottom corners of the mini symbol to the top corners of the
    // main wave region / detector, creating a zoom-in viewing frustum similar to MOTHA's TinyBox.
    const calloutLines = new Path( new Shape()
      .moveTo( miniSymbol.left, miniSymbol.bottom )
      .lineTo( waveRegionLeft, waveRegionTop )
      .moveTo( miniSymbol.right, miniSymbol.bottom )
      .lineTo( waveRegionRight, waveRegionTop ), {
      stroke: QuantumWaveInterferenceColors.zoomCalloutStrokeProperty,
      lineWidth: CALLOUT_LINE_WIDTH
    } );

    // Beam graphics: main beam from emitter nozzle tip rightward through the mini symbol,
    // plus a dimmer cutoff segment extending past the mini symbol to suggest light blocked by
    // the detector-screen setup. Beam is hidden when the emitter is off.
    const beamTop = topRowCenterY - BEAM_HEIGHT / 2;
    const beamLeft = emitterLeft + EMITTER_BODY_WIDTH + EMITTER_NOZZLE_WIDTH;
    const mainBeamRight = miniSymbol.right;
    const mainBeam = new Rectangle( beamLeft, beamTop, mainBeamRight - beamLeft, BEAM_HEIGHT );
    const cutoffBeam = new Rectangle(
      mainBeamRight, beamTop,
      BEAM_CUTOFF_EXTENSION, BEAM_HEIGHT
    );
    const beamContainer = new Node( {
      children: [ mainBeam, cutoffBeam ],
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
          radius: EMITTER_BUTTON_RADIUS
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

    const currentWavelengthProperty = new DynamicProperty<number, number, T>( sceneProperty, {
      derive: scene => scene.wavelengthProperty
    } );
    const currentIntensityProperty = new DynamicProperty<number, number, T>( sceneProperty, {
      derive: scene => scene.intensityProperty
    } );

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
      mainBeam.fill = baseColor.withAlpha( BEAM_MAIN_ALPHA_SCALE * intensity );
      cutoffBeam.fill = baseColor.withAlpha( BEAM_CUTOFF_ALPHA_SCALE * intensity );
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
