// Copyright 2026, University of Colorado Boulder

/**
 * OverheadEmitterNode displays the source label, mass label, and laser/particle emitter in the
 * overhead perspective top row. It toggles between a laser pointer (for photons) and a particle
 * emitter (for electrons/neutrons/helium atoms) based on the active scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import LaserPointerNode from '../../../../scenery-phet/js/LaserPointerNode.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const LABEL_FONT = new PhetFont( 14 * OVERHEAD_SCALE );
const LABEL_Y = 30;
const MASS_LABEL_FONT = new PhetFont( 15 * OVERHEAD_SCALE );

const BASE_BODY_WIDTH = 88;
const BASE_BODY_HEIGHT = 40;
const BASE_NOZZLE_WIDTH = 16;
const BASE_NOZZLE_HEIGHT = 32;
const BASE_BUTTON_RADIUS = 14;
const BASE_EMITTER_LEFT = 20;

export default class OverheadEmitterNode extends Node {

  public readonly laserPointerNode: LaserPointerNode;
  public readonly particleEmitterNode: LaserPointerNode;

  public constructor( model: ExperimentModel, layoutBounds: Bounds2, tandem: Tandem ) {
    super();

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
        if ( scene.sourceType === 'photons' ) {
          return photonSource;
        }
        else if ( scene.sourceType === 'electrons' ) {
          return electronSource;
        }
        else if ( scene.sourceType === 'neutrons' ) {
          return neutronSource;
        }
        else {
          return heliumAtomSource;
        }
      }
    );

    const emitterLeftBase = layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + BASE_EMITTER_LEFT;
    const baseEmitterWidth = BASE_BODY_WIDTH + BASE_NOZZLE_WIDTH;
    const scaledEmitterWidth = OVERHEAD_SCALE * ( BASE_BODY_WIDTH + BASE_NOZZLE_WIDTH );
    const emitterLeft = emitterLeftBase - ( scaledEmitterWidth - baseEmitterWidth ) / 2;

    const sourceLabel = new Text( sourceLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150,
      left: emitterLeft,
      top: LABEL_Y
    } );
    this.addChild( sourceLabel );

    // Particle mass label (hidden for photons)
    const massLabelMap: Record<string, string> = {
      electrons: 'm<sub>e</sub> = 9.1\u00D710<sup>\u221231</sup> kg',
      neutrons: 'm<sub>n</sub> = 1.7\u00D710<sup>\u221227</sup> kg',
      heliumAtoms: 'm<sub>He</sub> = 6.6\u00D710<sup>\u221227</sup> kg'
    };

    const particleMassLabel = new RichText( '', {
      font: MASS_LABEL_FONT,
      left: sourceLabel.left,
      maxWidth: 200
    } );
    this.addChild( particleMassLabel );

    model.sceneProperty.link( scene => {
      const isParticle = scene.sourceType !== 'photons';
      particleMassLabel.visible = isParticle;
      if ( isParticle ) {
        particleMassLabel.string = massLabelMap[ scene.sourceType ];
      }
    } );

    // DynamicProperty that follows the active scene's isEmittingProperty
    const isEmittingProperty = new DynamicProperty<boolean, boolean, SceneModel>( model.sceneProperty, {
      derive: scene => scene.isEmittingProperty,
      bidirectional: true
    } );

    this.laserPointerNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( BASE_BODY_WIDTH * OVERHEAD_SCALE, BASE_BODY_HEIGHT * OVERHEAD_SCALE ),
      nozzleSize: new Dimension2( BASE_NOZZLE_WIDTH * OVERHEAD_SCALE, BASE_NOZZLE_HEIGHT * OVERHEAD_SCALE ),
      buttonOptions: {
        baseColor: 'red',
        radius: BASE_BUTTON_RADIUS * OVERHEAD_SCALE
      },
      left: emitterLeft,
      tandem: tandem.createTandem( 'laserPointerNode' )
    } );
    this.addChild( this.laserPointerNode );

    this.particleEmitterNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( BASE_BODY_WIDTH * OVERHEAD_SCALE, BASE_BODY_HEIGHT * OVERHEAD_SCALE ),
      nozzleSize: new Dimension2( BASE_NOZZLE_WIDTH * OVERHEAD_SCALE, BASE_NOZZLE_HEIGHT * OVERHEAD_SCALE ),
      topColor: 'rgb(100, 120, 180)',
      bottomColor: 'rgb(30, 40, 80)',
      highlightColor: 'rgb(160, 180, 230)',
      buttonOptions: {
        baseColor: 'red',
        radius: BASE_BUTTON_RADIUS * OVERHEAD_SCALE
      },
      hasGlass: true,
      glassOptions: {
        mainColor: 'rgb(160, 190, 220)',
        highlightColor: 'white',
        shadowColor: 'rgb(100, 130, 160)',
        heightProportion: 0.7,
        proportionStickingOut: 0.3
      },
      left: emitterLeft,
      visible: false,
      tandem: tandem.createTandem( 'particleEmitterNode' )
    } );
    this.addChild( this.particleEmitterNode );

    // Toggle visibility and position based on scene
    const updateEmitterLayout = () => {
      const isPhoton = model.sceneProperty.value.sourceType === 'photons';
      this.laserPointerNode.visible = isPhoton;
      this.particleEmitterNode.visible = !isPhoton;

      const activeEmitter = isPhoton ? this.laserPointerNode : this.particleEmitterNode;
      activeEmitter.top = sourceLabel.bottom + 6 * OVERHEAD_SCALE;
      particleMassLabel.top = activeEmitter.bottom + 4 * OVERHEAD_SCALE;
    };

    model.sceneProperty.link( updateEmitterLayout );
  }
}
