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
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';

const LABEL_FONT = new PhetFont( 16 );
const LABEL_Y = 30;

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

    const sourceLabel = new Text( sourceLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: 150,
      left: layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + 20,
      top: LABEL_Y
    } );
    this.addChild( sourceLabel );

    // Particle mass label (hidden for photons)
    const MASS_LABEL_FONT = new PhetFont( 15 );
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

    const emitterLeft = layoutBounds.minX + QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN + 20;

    this.laserPointerNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( 88, 40 ),
      nozzleSize: new Dimension2( 16, 32 ),
      buttonOptions: {
        baseColor: 'red',
        radius: 14
      },
      left: emitterLeft,
      tandem: tandem.createTandem( 'laserPointerNode' )
    } );
    this.addChild( this.laserPointerNode );

    this.particleEmitterNode = new LaserPointerNode( isEmittingProperty, {
      bodySize: new Dimension2( 88, 40 ),
      nozzleSize: new Dimension2( 16, 32 ),
      topColor: 'rgb(100, 120, 180)',
      bottomColor: 'rgb(30, 40, 80)',
      highlightColor: 'rgb(160, 180, 230)',
      buttonOptions: {
        baseColor: 'red',
        radius: 14
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
      activeEmitter.top = sourceLabel.bottom + 6;
      particleMassLabel.top = activeEmitter.bottom + 4;
    };

    model.sceneProperty.link( updateEmitterLayout );
  }
}
