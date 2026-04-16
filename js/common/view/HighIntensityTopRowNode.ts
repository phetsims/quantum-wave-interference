// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityTopRowNode renders the High Intensity screen's top play-area row: a per-scene emitter
 * source on the left, beam graphics extending across to a mini wave-visualization symbol on the right.
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
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type SourceType } from '../model/SourceType.js';
import linkSceneVisibility from './linkSceneVisibility.js';

const EMITTER_BODY_WIDTH = 70;
const EMITTER_BODY_HEIGHT = 32;
const EMITTER_NOZZLE_WIDTH = 14;
const EMITTER_NOZZLE_HEIGHT = 26;
const EMITTER_BUTTON_RADIUS = 12;
const EMITTER_NOZZLE_OVERLAP = 4;

const MINI_SYMBOL_SQUARE_SIZE = 22;
const MINI_SYMBOL_DETECTOR_WIDTH = 8;
const MINI_SYMBOL_SKEW = 3;
const MINI_SYMBOL_GAP = 2;

const BEAM_HEIGHT = EMITTER_NOZZLE_HEIGHT;
const BEAM_MAIN_ALPHA_SCALE = 0.35;
const BEAM_CUTOFF_ALPHA_SCALE = 0.12;
const BEAM_CUTOFF_EXTENSION = 30;

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

export default class HighIntensityTopRowNode<T extends TopRowSceneLike> extends Node {

  public constructor(
    sceneProperty: Property<T>,
    scenes: T[],
    currentIsEmittingProperty: TProperty<boolean>,
    waveRegionLeft: number,
    topRowCenterY: number,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    // Mini wave-visualization symbol on the right: a small black square + a skewed black detector rectangle.
    const miniSquare = new Rectangle( 0, 0, MINI_SYMBOL_SQUARE_SIZE, MINI_SYMBOL_SQUARE_SIZE, {
      fill: 'black',
      cornerRadius: 2
    } );

    const detectorShape = new Shape()
      .moveTo( MINI_SYMBOL_SKEW, 0 )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH + MINI_SYMBOL_SKEW, 0 )
      .lineTo( MINI_SYMBOL_DETECTOR_WIDTH, MINI_SYMBOL_SQUARE_SIZE )
      .lineTo( 0, MINI_SYMBOL_SQUARE_SIZE )
      .close();
    const miniDetector = new Path( detectorShape, { fill: 'black' } );
    miniDetector.left = miniSquare.right + MINI_SYMBOL_GAP;

    const miniSymbol = new Node( {
      children: [ miniSquare, miniDetector ],
      centerY: topRowCenterY
    } );
    miniSymbol.left = waveRegionLeft + QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH - MINI_SYMBOL_SKEW / 2;

    // Beam graphics: main beam from emitter to the mini symbol, dimmer cutoff beam past it.
    const beamLeft = waveRegionLeft + EMITTER_NOZZLE_OVERLAP;
    const beamTop = topRowCenterY - BEAM_HEIGHT / 2;

    const mainBeam = new Rectangle( beamLeft, beamTop, miniSymbol.left - beamLeft, BEAM_HEIGHT );
    const cutoffBeam = new Rectangle(
      miniSymbol.left, beamTop,
      miniSymbol.width + BEAM_CUTOFF_EXTENSION, BEAM_HEIGHT
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
    emitterContainer.right = beamLeft;
    emitterContainer.centerY = topRowCenterY;

    // Z-order: beam behind emitter and mini symbol.
    this.addChild( beamContainer );
    this.addChild( emitterContainer );
    this.addChild( miniSymbol );

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
