// Copyright 2026, University of Colorado Boulder

/**
 * OverheadEmitterNode displays the source label, mass label,
 * and laser/particle emitter in the overhead perspective top row.
 * It toggles between a laser pointer (for photons) and a particle emitter (for electrons/neutrons/helium atoms) based
 * on the active scene.
 *
 * One LaserPointerNode is created per scene with a scene-specific palette, and visibility is toggled with the active
 * scene. Each emitter is instrumented under its scene's tandem, matching the per-scene emitterNode pattern used on
 * the High Intensity screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import MaxHitsReachedPanel from '../../common/view/MaxHitsReachedPanel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const SOURCE_SCALE = OVERHEAD_SCALE * 1.15;
const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 30;
const SOURCE_LABEL_CENTERING_GAP = 6 * OVERHEAD_SCALE;
const SOURCE_LABEL_GAP = 10 * OVERHEAD_SCALE;
const MASS_LABEL_FONT = new PhetFont( 12 );
const MASS_LABEL_TOP_MARGIN = 8;

const BASE_BODY_WIDTH = 88;
const BASE_BODY_HEIGHT = 40;
const BASE_NOZZLE_WIDTH = 16;
const BASE_NOZZLE_HEIGHT = 32;
const BASE_BUTTON_RADIUS = 14;
const BASE_EMITTER_LEFT = 20;

/**
 * Color palette used to paint a particle emitter body. Each SourceType (except photons) has its own entry in
 * PARTICLE_EMITTER_PALETTES so that each matter-particle scene's emitter is constructed with its own colors.
 */
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

// Glass-lens colors shared by all matter-particle emitters.
const GLASS_MAIN_COLOR = 'rgb(160, 190, 220)';
const GLASS_HIGHLIGHT_COLOR = 'white';
const GLASS_SHADOW_COLOR = 'rgb(100, 130, 160)';

export default class OverheadEmitterNode extends Node {

  // One emitter Node per scene, in the same order as model.scenes. The photon scene's emitter is a laser pointer;
  // each matter-particle scene's emitter has a glass lens and a scene-specific palette. Exposed so parent nodes can
  // observe emitter bounds for layout (e.g. aligning the SourceControlPanel) and include the emitters in the PDOM
  // order. Only the active scene's emitter is visible.
  public readonly emitterNodes: LaserPointerNode[];

  // Overlay panel that appears when the maximum particle-hit count is reached.
  // Exposed so parent nodes (e.g. ExperimentOverheadApparatusNode) can reposition it
  // after layout changes and include it in the PDOM order.
  public readonly maxHitsReachedPanel: MaxHitsReachedPanel;
  private readonly model: ExperimentModel;
  private emitterCenterX: number | null = null;
  private readonly updateEmitterLayout: () => void;

  public constructor( model: ExperimentModel, layoutBounds: Bounds2, sceneTandems: ReadonlyMap<object, Tandem>, tandem: Tandem ) {
    super( { isDisposable: false } );

    this.model = model;

    // Source label that changes with the selected scene
    const sourceLabelStringProperty = new DerivedProperty(
      [
        model.sceneProperty,
        QuantumWaveInterferenceFluent.photonSourceStringProperty,
        QuantumWaveInterferenceFluent.electronSourceStringProperty,
        QuantumWaveInterferenceFluent.neutronSourceStringProperty,
        QuantumWaveInterferenceFluent.heliumAtomSourceStringProperty
      ],
      ( scene, photonSource, electronSource, neutronSource, heliumAtomSource ) => {
        const sourceType = scene.sourceType;
        return sourceType === 'photons' ? photonSource :
               sourceType === 'electrons' ? electronSource :
               sourceType === 'neutrons' ? neutronSource :
               sourceType === 'heliumAtoms' ? heliumAtomSource :
               ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
      }
    );

    const emitterLeftBase = layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + BASE_EMITTER_LEFT;
    const baseEmitterWidth = BASE_BODY_WIDTH + BASE_NOZZLE_WIDTH;
    const scaledEmitterWidth = SOURCE_SCALE * ( BASE_BODY_WIDTH + BASE_NOZZLE_WIDTH );
    const emitterLeft = emitterLeftBase - ( scaledEmitterWidth - baseEmitterWidth ) / 2;

    const sourceLabel = new Text( sourceLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150,
      top: LABEL_Y
    } );
    this.addChild( sourceLabel );

    // Keep the emitter center at its pre-scale vertical position even if the source label rescales or changes height.
    const getEmitterCenterY = () => sourceLabel.height + LABEL_Y + SOURCE_LABEL_CENTERING_GAP +
                                    BASE_BODY_HEIGHT * OVERHEAD_SCALE / 2;

    // Particle mass label (empty for photons; hidden via the visible link below).
    // DerivedProperty so the label updates reactively on both scene change and locale change.
    const particleMassLabelStringProperty = new DerivedProperty( [
      model.sceneProperty,
      QuantumWaveInterferenceFluent.electronMassLabelStringProperty,
      QuantumWaveInterferenceFluent.neutronMassLabelStringProperty,
      QuantumWaveInterferenceFluent.heliumAtomMassLabelStringProperty
    ], ( scene, electronMass, neutronMass, heliumAtomMass ) => {
      const sourceType = scene.sourceType;
      return sourceType === 'electrons' ? electronMass :
             sourceType === 'neutrons' ? neutronMass :
             sourceType === 'heliumAtoms' ? heliumAtomMass :
             sourceType === 'photons' ? '' :
             ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
    } );

    const particleMassLabel = new RichText( particleMassLabelStringProperty, {
      font: MASS_LABEL_FONT,
      maxWidth: 200
    } );
    this.addChild( particleMassLabel );

    this.maxHitsReachedPanel = new MaxHitsReachedPanel( tandem.createTandem( 'maxHitsReachedPanel' ) );
    this.addChild( this.maxHitsReachedPanel );

    model.sceneProperty.link( scene => {
      particleMassLabel.visible = scene.sourceType !== 'photons';
    } );

    const isEmittingProperty = model.currentIsEmittingProperty;
    const isEmittingStringProperty = isEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );

    const isMaxHitsReachedProperty = model.currentIsMaxHitsReachedProperty;

    // One LaserPointerNode per scene with a scene-specific palette. Visibility is toggled per scene
    // so we never recolor nodes at runtime — each emitter is constructed once with its final colors.
    this.emitterNodes = model.scenes.map( scene => {
      const palette = scene.sourceType === 'photons' ? null : PARTICLE_EMITTER_PALETTES[ scene.sourceType ];
      return new LaserPointerNode( isEmittingProperty, {
        bodySize: new Dimension2( BASE_BODY_WIDTH * SOURCE_SCALE, BASE_BODY_HEIGHT * SOURCE_SCALE ),
        nozzleSize: new Dimension2( BASE_NOZZLE_WIDTH * SOURCE_SCALE, BASE_NOZZLE_HEIGHT * SOURCE_SCALE ),
        topColor: palette ? palette.topColor : undefined,
        bottomColor: palette ? palette.bottomColor : undefined,
        highlightColor: palette ? palette.highlightColor : undefined,
        hasGlass: palette !== null,
        glassOptions: {
          mainColor: GLASS_MAIN_COLOR,
          highlightColor: GLASS_HIGHLIGHT_COLOR,
          shadowColor: GLASS_SHADOW_COLOR,
          heightProportion: 0.7,
          proportionStickingOut: 0.3
        },
        buttonOptions: {
          baseColor: 'red',
          radius: BASE_BUTTON_RADIUS * SOURCE_SCALE,
          valueUpSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
          valueDownSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),
          accessibleName: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleName.createProperty( {
            sourceType: scene.sourceType
          } ),
          accessibleHelpText: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleHelpText.createProperty( {
            isEmitting: isEmittingStringProperty,
            sourceType: scene.sourceType
          } ),

          // The sim disables the button when the hit cap is reached, so clients may not control it.
          enabledPropertyOptions: { phetioReadOnly: true }
        },
        left: emitterLeft,
        visible: scene === model.sceneProperty.value,

        // The sim shows exactly one emitter, for the active scene, so clients may not control visibility.
        visiblePropertyOptions: { phetioReadOnly: true },
        tandem: sceneTandems.get( scene )!.createTandem( 'emitterNode' ),
        tandemNameSuffix: 'emitterNode'
      } );
    } );
    this.emitterNodes.forEach( emitterNode => this.addChild( emitterNode ) );

    model.currentIsEmitterEnabledProperty.link( isEnabled => {
      this.emitterNodes.forEach( emitterNode => {
        emitterNode.enabled = isEnabled;
        if ( emitterNode.onOffButton ) {
          emitterNode.onOffButton.enabled = isEnabled;
        }
      } );
    } );

    isMaxHitsReachedProperty.link( isMaxHitsReached => {
      this.maxHitsReachedPanel.visible = isMaxHitsReached;
    } );

    // Toggle visibility and position based on scene
    this.updateEmitterLayout = () => {
      const scene = model.sceneProperty.value;

      this.emitterNodes.forEach( ( emitterNode, index ) => {
        emitterNode.visible = model.scenes[ index ] === scene;
      } );

      const targetEmitterCenterX = this.emitterCenterX ?? this.emitterNodes[ 0 ].centerX;
      this.emitterNodes.forEach( emitterNode => {
        emitterNode.centerX = targetEmitterCenterX;
      } );

      const activeEmitter = this.getActiveEmitterNode();
      activeEmitter.centerY = getEmitterCenterY();
      sourceLabel.centerX = targetEmitterCenterX;
      sourceLabel.bottom = activeEmitter.top - SOURCE_LABEL_GAP;
      particleMassLabel.centerX = targetEmitterCenterX;
      particleMassLabel.top = activeEmitter.bottom + MASS_LABEL_TOP_MARGIN * OVERHEAD_SCALE;
      this.maxHitsReachedPanel.centerY = activeEmitter.centerY;
    };

    sourceLabel.localBoundsProperty.link( this.updateEmitterLayout );
    particleMassLabel.localBoundsProperty.link( this.updateEmitterLayout );
    model.sceneProperty.link( this.updateEmitterLayout );
  }

  /**
   * Returns the emitter Node that corresponds to the active scene. Used by parents to align other elements
   * (slit centerline, max-hits panel, beam geometry) with the emitter that is currently shown.
   */
  public getActiveEmitterNode(): LaserPointerNode {
    return this.emitterNodes[ this.model.scenes.indexOf( this.model.sceneProperty.value ) ];
  }

  /**
   * Pins the horizontal center of all emitters (and the labels above/below them) to the given
   * x-coordinate in this node's parent coordinate frame.  Called by ExperimentScreenView (via
   * ExperimentOverheadApparatusNode) to keep the emitter centred under the SourceControlPanel.
   * Immediately triggers a full layout update so positions take effect before the next frame.
   */
  public setEmitterCenterX( emitterCenterX: number ): void {
    this.emitterCenterX = emitterCenterX;
    this.updateEmitterLayout();
  }

  /**
   * Returns the active emitter's output point in this node's coordinate frame.
   * LaserPointerNode's origin is the center of the output nozzle, which is the correct beam centerline.
   *
   * @returns output-nozzle center point in this node's coordinate frame
   */
  public getActiveEmitterOutputPoint(): Vector2 {
    return this.getActiveEmitterNode().localToParentPoint( Vector2.ZERO );
  }
}
