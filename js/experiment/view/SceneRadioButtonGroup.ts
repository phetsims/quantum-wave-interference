// Copyright 2026, University of Colorado Boulder

/**
 * SceneRadioButtonGroup provides a 2x2 grid of radio buttons for selecting between the four source-type scenes
 * (Photons, Electrons, Neutrons, Helium atoms). Each button displays a source-type-specific icon with the
 * source name as a label beneath it:
 * - Photons: a red sine wave representing a light wave
 * - Electrons, Neutrons, Helium atoms: 3D-looking ShadedSphereNode particles
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedSphereNode from '../../../../scenery-phet/js/ShadedSphereNode.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularRadioButtonGroup, { type RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import { type SourceType } from '../model/SourceType.js';

// Icon dimensions
const SPHERE_DIAMETER = 18;
const LABEL_FONT = new PhetFont( 12 );

// String properties for each source type
const SOURCE_TYPE_STRING_PROPERTIES = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

export default class SceneRadioButtonGroup extends RectangularRadioButtonGroup<SceneModel> {

  public constructor( sceneProperty: Property<SceneModel>, scenes: SceneModel[], tandem: Tandem ) {

    const items: RectangularRadioButtonGroupItem<SceneModel>[] = scenes.map( scene => {
      const sourceType = scene.sourceType;
      const stringProperty = SOURCE_TYPE_STRING_PROPERTIES[ sourceType ];
      const icon = SceneRadioButtonGroup.createIcon( sourceType );

      return {
        value: scene,
        createNode: () => new VBox( {
          spacing: 4,
          children: [
            icon,
            new Text( stringProperty, { font: LABEL_FONT, maxWidth: 80 } )
          ]
        } ),
        tandemName: `${sourceType}RadioButton`
      };
    } );

    super( sceneProperty, items, {
      orientation: 'horizontal',
      wrap: true,
      preferredWidth: 250,
      spacing: 10,
      lineSpacing: 8,
      radioButtonOptions: {
        baseColor: 'white',
        xMargin: 10,
        yMargin: 8,
        buttonAppearanceStrategyOptions: {
          selectedStroke: '#73bce1',
          selectedLineWidth: 2
        }
      },
      tandem: tandem
    } );
  }

  /**
   * Creates the icon for a given source type.
   * Photons get a sine wave representing a light wave.
   * Particles get a 3D-looking shaded sphere.
   */
  private static createIcon( sourceType: SourceType ): Node {
    if ( sourceType === 'photons' ) {
      return SceneRadioButtonGroup.createPhotonWaveIcon();
    }
    else if ( sourceType === 'electrons' ) {
      return new ShadedSphereNode( SPHERE_DIAMETER, {
        mainColor: '#3366cc',
        highlightColor: '#aaccff'
      } );
    }
    else if ( sourceType === 'neutrons' ) {
      return new ShadedSphereNode( SPHERE_DIAMETER, {
        mainColor: '#888888',
        highlightColor: '#dddddd'
      } );
    }
    else {
      // Helium atoms
      return new ShadedSphereNode( SPHERE_DIAMETER, {
        mainColor: '#339966',
        highlightColor: '#88ddaa'
      } );
    }
  }

  /**
   * Creates a sine wave icon for the photon scene. The wave is drawn as a smooth
   * red sinusoidal curve, representing the wave nature of light.
   */
  private static createPhotonWaveIcon(): Node {
    const waveWidth = 24;
    const waveHeight = 14;
    const shape = new Shape();

    // Draw a sine wave with ~1.5 complete cycles
    const numPoints = 40;
    for ( let i = 0; i <= numPoints; i++ ) {
      const x = ( i / numPoints ) * waveWidth;
      const y = waveHeight / 2 * Math.sin( ( i / numPoints ) * Math.PI * 3 );
      if ( i === 0 ) {
        shape.moveTo( x, y );
      }
      else {
        shape.lineTo( x, y );
      }
    }

    return new Path( shape, {
      stroke: '#cc0000',
      lineWidth: 2.5,
      lineCap: 'round'
    } );
  }
}

quantumWaveInterference.register( 'SceneRadioButtonGroup', SceneRadioButtonGroup );
