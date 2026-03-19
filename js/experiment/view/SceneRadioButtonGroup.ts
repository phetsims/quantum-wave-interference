// Copyright 2026, University of Colorado Boulder

/**
 * SceneRadioButtonGroup provides a 2x2 grid of radio buttons for selecting between the four source-type scenes
 * (Photons, Electrons, Neutrons, Helium atoms). Each button displays a source-type-specific icon with the
 * source name as a label beneath it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularRadioButtonGroup, { type RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import electron_svg from '../../../images/electron_svg.js';
import heliumAtom_svg from '../../../images/heliumAtom_svg.js';
import neutron_svg from '../../../images/neutron_svg.js';
import photon_svg from '../../../images/photon_svg.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import { type SourceType } from '../model/SourceType.js';

const LABEL_FONT = new PhetFont( 12 );
const ICON_MAX_WIDTH = 24;

// Per-icon scaling keeps the imported SVG artwork visually balanced in the 2x2 scene button grid.
const ICON_SCALE = {
  photons: 1.15,
  electrons: 1,
  neutrons: 0.85,
  heliumAtoms: 1.2
} as const satisfies Record<SourceType, number>;

const SOURCE_TYPE_IMAGE_MAP = {
  photons: photon_svg,
  electrons: electron_svg,
  neutrons: neutron_svg,
  heliumAtoms: heliumAtom_svg
} as const satisfies Record<SourceType, HTMLImageElement>;

// String properties for each source type
const SOURCE_TYPE_STRING_PROPERTIES = {
  photons: QuantumWaveInterferenceFluent.photonsStringProperty,
  electrons: QuantumWaveInterferenceFluent.electronsStringProperty,
  neutrons: QuantumWaveInterferenceFluent.neutronsStringProperty,
  heliumAtoms: QuantumWaveInterferenceFluent.heliumAtomsStringProperty
} as const satisfies Record<SourceType, typeof QuantumWaveInterferenceFluent.photonsStringProperty>;

export default class SceneRadioButtonGroup extends RectangularRadioButtonGroup<SceneModel> {

  public constructor( sceneProperty: Property<SceneModel>, scenes: SceneModel[], tandem: Tandem ) {

    const items: RectangularRadioButtonGroupItem<SceneModel>[] = scenes.map( scene => {
      const sourceType = scene.sourceType;
      const stringProperty = SOURCE_TYPE_STRING_PROPERTIES[ sourceType ];

      return {
        value: scene,
        createNode: () => new VBox( {
          spacing: 4,
          children: [
            new Image( SOURCE_TYPE_IMAGE_MAP[ sourceType ], {
              maxWidth: ICON_MAX_WIDTH,
              scale: ICON_SCALE[ sourceType ]
            } ),
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
}

quantumWaveInterference.register( 'SceneRadioButtonGroup', SceneRadioButtonGroup );
