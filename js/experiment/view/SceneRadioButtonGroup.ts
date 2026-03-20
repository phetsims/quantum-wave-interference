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
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import RectangularRadioButtonGroup, { type RectangularRadioButtonGroupItem } from '../../../../sun/js/buttons/RectangularRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import electron_svg from '../../../images/electron_svg.js';
import heliumAtom_svg from '../../../images/heliumAtom_svg.js';
import neutron_svg from '../../../images/neutron_svg.js';
import photon_svg from '../../../images/photon_svg.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import { type SourceType } from '../model/SourceType.js';

const LABEL_FONT = new PhetFont( 12 );
const ICON_MAX_WIDTH = 24;
const ICON_SLOT_WIDTH = 30;
const ICON_SLOT_HEIGHT = 30;
const BUTTON_SIDE_LENGTH = 50;
const LABEL_WIDTH = 80;
const LABEL_HEIGHT = 16;
const GRID_COLUMNS = 2;
const GRID_HORIZONTAL_SPACING = 12;
const GRID_VERTICAL_SPACING = 12;
const GRID_PREFERRED_WIDTH = GRID_COLUMNS * LABEL_WIDTH + ( GRID_COLUMNS - 1 ) * GRID_HORIZONTAL_SPACING + 1;
const SELECTED_BUTTON_FILL = '#e6f4ff';

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
        createNode: () => {
          const iconNode = new Image( SOURCE_TYPE_IMAGE_MAP[ sourceType ], {
            maxWidth: ICON_MAX_WIDTH,
            scale: ICON_SCALE[ sourceType ]
          } );

          const iconSlotNode = new Rectangle( 0, 0, ICON_SLOT_WIDTH, ICON_SLOT_HEIGHT, {
            fill: null,
            stroke: null,
            children: [ iconNode ]
          } );
          iconNode.center = iconSlotNode.center;

          return iconSlotNode;
        },
        label: new AlignBox( new Text( stringProperty, {
          font: LABEL_FONT,
          maxWidth: LABEL_WIDTH
        } ), {
          xAlign: 'center',
          yAlign: 'center',
          preferredWidth: LABEL_WIDTH,
          preferredHeight: LABEL_HEIGHT
        } ),
        tandemName: `${sourceType}RadioButton`
      };
    } );

    super( sceneProperty, items, {
      orientation: 'horizontal',
      wrap: true,
      labelAlign: 'bottom',
      labelSpacing: 4,
      preferredWidth: GRID_PREFERRED_WIDTH,
      spacing: GRID_HORIZONTAL_SPACING,
      lineSpacing: GRID_VERTICAL_SPACING,
      radioButtonOptions: {
        baseColor: SELECTED_BUTTON_FILL,
        xMargin: 10,
        yMargin: 10,
        minWidth: BUTTON_SIDE_LENGTH,
        minHeight: BUTTON_SIDE_LENGTH,
        buttonAppearanceStrategyOptions: {
          deselectedFill: 'white',
          selectedStroke: '#73bce1',
          selectedLineWidth: 2
        }
      },
      tandem: tandem
    } );
  }
}
