// Copyright 2026, University of Colorado Boulder

/**
 * SceneRadioButtonGroup provides a 2x2 grid of radio buttons for selecting between the four source-type scenes
 * (Photons, Electrons, Neutrons, Helium atoms). Each button displays a colored circle icon with the source name
 * as a label beneath it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import RectangularRadioButtonGroup, { type RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import SceneModel from '../model/SceneModel.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';

// Icon colors for each source type, matching typical PhET conventions for these particle types
const SOURCE_TYPE_COLORS: Record<string, string> = {
  photons: '#ff0000',
  electrons: '#3399ff',
  neutrons: '#888888',
  heliumAtoms: '#00cc66'
};

// String properties for each source type
const SOURCE_TYPE_STRING_PROPERTIES = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
};

const ICON_RADIUS = 8;
const LABEL_FONT = new PhetFont( 12 );

export default class SceneRadioButtonGroup extends RectangularRadioButtonGroup<SceneModel> {

  public constructor( sceneProperty: Property<SceneModel>, scenes: SceneModel[], tandem: Tandem ) {

    const items: RectangularRadioButtonGroupItem<SceneModel>[] = scenes.map( scene => {
      const sourceType = scene.sourceType;
      const color = SOURCE_TYPE_COLORS[ sourceType.tandemName ];
      const stringProperty = SOURCE_TYPE_STRING_PROPERTIES[ sourceType.tandemName as keyof typeof SOURCE_TYPE_STRING_PROPERTIES ];

      return {
        value: scene,
        createNode: () => new VBox( {
          spacing: 4,
          children: [
            new Circle( ICON_RADIUS, { fill: color } ),
            new Text( stringProperty, { font: LABEL_FONT, maxWidth: 80 } )
          ]
        } ),
        tandemName: `${sourceType.tandemName}RadioButton`
      };
    } );

    super( sceneProperty, items, {
      orientation: 'horizontal',
      wrap: true,
      preferredWidth: 180,
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
}

quantumWaveInterference.register( 'SceneRadioButtonGroup', SceneRadioButtonGroup );
