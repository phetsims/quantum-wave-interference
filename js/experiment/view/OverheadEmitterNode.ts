// Copyright 2026, University of Colorado Boulder

/**
 * OverheadEmitterNode displays the source label, mass label,
 * and laser/particle emitter in the overhead perspective top row.
 * It toggles between a laser pointer (for photons) and a particle emitter (for electrons/neutrons/helium atoms) based
 * on the active scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
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
const EMITTER_HIGHLIGHT_COLOR_STOP = 0.3;
const GLASS_HIGHLIGHT_DIAMETER_RATIO = 0.5;
const GLASS_HIGHLIGHT_OFFSET = -0.4;

/**
 * Color palette used to paint a particle emitter body and its glass-lens highlight.
 * Each SourceType (except photons) has its own entry in PARTICLE_EMITTER_PALETTES so that
 * the emitter appearance updates when the active scene changes.
 */
type ParticleEmitterPalette = {
  topColor: string;
  bottomColor: string;
  highlightColor: string;
  glassMainColor: string;
  glassHighlightColor: string;
  glassShadowColor: string;
};

const PARTICLE_EMITTER_PALETTES: Record<Exclude<SourceType, 'photons'>, ParticleEmitterPalette> = {
  electrons: {
    topColor: 'rgb(100, 120, 180)',
    bottomColor: 'rgb(30, 40, 80)',
    highlightColor: 'rgb(160, 180, 230)',
    glassMainColor: 'rgb(160, 190, 220)',
    glassHighlightColor: 'white',
    glassShadowColor: 'rgb(100, 130, 160)'
  },
  neutrons: {
    topColor: 'rgb(92, 137, 144)',
    bottomColor: 'rgb(26, 63, 70)',
    highlightColor: 'rgb(168, 205, 208)',
    glassMainColor: 'rgb(160, 190, 220)',
    glassHighlightColor: 'white',
    glassShadowColor: 'rgb(100, 130, 160)'
  },
  heliumAtoms: {
    topColor: 'rgb(173, 138, 94)',
    bottomColor: 'rgb(84, 58, 30)',
    highlightColor: 'rgb(224, 194, 150)',
    glassMainColor: 'rgb(160, 190, 220)',
    glassHighlightColor: 'white',
    glassShadowColor: 'rgb(100, 130, 160)'
  }
};

function createEmitterGradient( height: number, palette: ParticleEmitterPalette ): LinearGradient {
  return new LinearGradient( 0, 0, 0, height )
    .addColorStop( 0, palette.topColor )
    .addColorStop( EMITTER_HIGHLIGHT_COLOR_STOP, palette.highlightColor )
    .addColorStop( 1, palette.bottomColor );
}

function createGlassGradient( glassNode: ShadedSphereNode, palette: ParticleEmitterPalette ): RadialGradient {
  const radius = glassNode.radius;
  const highlightX = radius * GLASS_HIGHLIGHT_OFFSET;
  const highlightY = radius * GLASS_HIGHLIGHT_OFFSET;

  return new RadialGradient( highlightX, highlightY, 0, highlightX, highlightY, radius * 2 )
    .addColorStop( 0, palette.glassHighlightColor )
    .addColorStop( GLASS_HIGHLIGHT_DIAMETER_RATIO, palette.glassMainColor )
    .addColorStop( 1, palette.glassShadowColor );
}

export default class OverheadEmitterNode extends Node {

  // Shown when the active scene uses photons. Exposed so callers can read its position for
  // layout (e.g. aligning the SourceControlPanel) and include it in the PDOM order.
  public readonly laserPointerNode: LaserPointerNode;

  // Shown when the active scene uses particles (electrons, neutrons, or helium atoms).
  // Exposed for PDOM order and position queries by parent nodes.
  public readonly particleEmitterNode: LaserPointerNode;

  // Overlay panel that appears when the maximum particle-hit count is reached.
  // Exposed so parent nodes (e.g. ExperimentOverheadApparatusNode) can reposition it
  // after layout changes and include it in the PDOM order.
  public readonly maxHitsReachedPanel: MaxHitsReachedPanel;
  private emitterCenterX: number | null = null;
  private readonly updateEmitterLayout: () => void;

  public constructor( model: ExperimentModel, layoutBounds: Bounds2, tandem: Tandem ) {
    super( { isDisposable: false } );

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

    // Track the active scene's source type for accessible name
    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );

    // Accessible name for the emitter button, changes with the active source type
    const emitterAccessibleNameProperty = QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleName.createProperty( {
      sourceType: sourceTypeProperty
    } );

    const buttonOptions = {
      baseColor: 'red',
      radius: BASE_BUTTON_RADIUS * SOURCE_SCALE,
      valueUpSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueDownSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),
      accessibleName: emitterAccessibleNameProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleHelpText.createProperty( {
        isEmitting: isEmittingStringProperty,
        sourceType: sourceTypeProperty
      } ),
      accessibleContextResponseOff: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleContextResponseOffStringProperty
    };

    this.laserPointerNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( BASE_BODY_WIDTH * SOURCE_SCALE, BASE_BODY_HEIGHT * SOURCE_SCALE ),
      nozzleSize: new Dimension2( BASE_NOZZLE_WIDTH * SOURCE_SCALE, BASE_NOZZLE_HEIGHT * SOURCE_SCALE ),
      buttonOptions: buttonOptions,
      left: emitterLeft,
      tandem: tandem.createTandem( 'laserPointerNode' )
    } );
    this.addChild( this.laserPointerNode );

    this.particleEmitterNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( BASE_BODY_WIDTH * SOURCE_SCALE, BASE_BODY_HEIGHT * SOURCE_SCALE ),
      nozzleSize: new Dimension2( BASE_NOZZLE_WIDTH * SOURCE_SCALE, BASE_NOZZLE_HEIGHT * SOURCE_SCALE ),
      topColor: PARTICLE_EMITTER_PALETTES.electrons.topColor,
      bottomColor: PARTICLE_EMITTER_PALETTES.electrons.bottomColor,
      highlightColor: PARTICLE_EMITTER_PALETTES.electrons.highlightColor,
      buttonOptions: buttonOptions,
      hasGlass: true,
      glassOptions: {
        mainColor: PARTICLE_EMITTER_PALETTES.electrons.glassMainColor,
        highlightColor: PARTICLE_EMITTER_PALETTES.electrons.glassHighlightColor,
        shadowColor: PARTICLE_EMITTER_PALETTES.electrons.glassShadowColor,
        heightProportion: 0.7,
        proportionStickingOut: 0.3
      },
      left: emitterLeft,
      visible: false,
      tandem: tandem.createTandem( 'particleEmitterNode' ),
      tandemNameSuffix: 'particleEmitterNode'
    } );
    this.addChild( this.particleEmitterNode );

    model.currentIsEmitterEnabledProperty.link( isEnabled => {
      this.laserPointerNode.enabled = isEnabled;
      this.particleEmitterNode.enabled = isEnabled;
      if ( this.laserPointerNode.onOffButton ) {
        this.laserPointerNode.onOffButton.enabled = isEnabled;
      }
      if ( this.particleEmitterNode.onOffButton ) {
        this.particleEmitterNode.onOffButton.enabled = isEnabled;
      }
    } );

    isMaxHitsReachedProperty.link( isMaxHitsReached => {
      this.maxHitsReachedPanel.visible = isMaxHitsReached;
    } );

    const applyParticleEmitterPalette = ( sourceType: SourceType ) => {
      if ( sourceType === 'photons' ) {
        return;
      }

      const palette = PARTICLE_EMITTER_PALETTES[ sourceType ];

      // Re-color the emitter body and glass highlights to match the new particle type's palette.
      // Uses instanceof to distinguish the body rectangles from the glass sphere overlays.
      this.particleEmitterNode.children.forEach( child => {
        if ( child instanceof Rectangle ) {
          child.fill = createEmitterGradient( child.height, palette );
        }
        else if ( child instanceof ShadedSphereNode ) {
          child.fill = createGlassGradient( child, palette );
        }
      } );
    };

    // Toggle visibility and position based on scene
    this.updateEmitterLayout = () => {
      const sourceType = model.sceneProperty.value.sourceType;
      const isPhoton = sourceType === 'photons';
      this.laserPointerNode.visible = isPhoton;
      this.particleEmitterNode.visible = !isPhoton;

      applyParticleEmitterPalette( sourceType );

      const targetEmitterCenterX = this.emitterCenterX ?? this.laserPointerNode.centerX;
      this.laserPointerNode.centerX = targetEmitterCenterX;
      this.particleEmitterNode.centerX = targetEmitterCenterX;

      const activeEmitter = isPhoton ? this.laserPointerNode : this.particleEmitterNode;
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
   * Pins the horizontal center of both emitters (and the labels above/below them) to the given
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
   * @param sourceType - active source type
   * @returns output-nozzle center point in this node's coordinate frame
   */
  public getActiveEmitterOutputPoint( sourceType: SourceType ): Vector2 {
    const activeEmitter = sourceType === 'photons' ? this.laserPointerNode : this.particleEmitterNode;
    return activeEmitter.localToParentPoint( Vector2.ZERO );
  }
}
