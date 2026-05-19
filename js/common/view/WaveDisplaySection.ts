// Copyright 2026, University of Colorado Boulder

/**
 * WaveDisplaySection is the wave display / wave function display combo box section used by
 * both the High Intensity and Single Particles screens. When the Photons scene is selected, it shows
 * photon display modes (Amplitude, Electric Field). For matter-particle scenes, it shows
 * matter wave display modes (Amplitude, Real part, Imaginary part) under a "Wave Function Display" heading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const TITLE_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );
const COMBO_BOX_X_MARGIN = 10;
const COMBO_BOX_Y_MARGIN = 6;

// ComboBox adds margins, a separator, and an arrow area around item text.
const COMBO_BOX_ITEM_TEXT_MAX_WIDTH = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH - 50;

type WaveDisplayModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: string }>;
  currentPhotonWaveDisplayModeProperty: PhetioProperty<PhotonWaveDisplayMode>;
  currentMatterWaveDisplayModeProperty: PhetioProperty<MatterWaveDisplayMode>;
};

export default class WaveDisplaySection extends VBox {

  public constructor( model: WaveDisplayModel, listParent: Node, tandem: Tandem ) {
    const isPhotonsProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.sourceType === 'photons'
    );

    const waveDisplayTitleProperty = new DerivedProperty(
      [ isPhotonsProperty, QuantumWaveInterferenceFluent.waveDisplayStringProperty, QuantumWaveInterferenceFluent.waveFunctionDisplayStringProperty ],
      ( isPhotons, waveDisplay, waveFunctionDisplay ) =>
        isPhotons ? waveDisplay : waveFunctionDisplay
    );

    const waveDisplayTitle = new Text( waveDisplayTitleProperty, {
      font: TITLE_FONT,
      maxWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH
    } );

    const createComboBoxText = ( stringProperty: TReadOnlyProperty<string> ) => new Text( stringProperty, {
      font: COMBO_BOX_FONT,
      maxWidth: COMBO_BOX_ITEM_TEXT_MAX_WIDTH
    } );

    const photonWaveDisplayItems: ComboBoxItem<PhotonWaveDisplayMode>[] = [
      { value: 'electricField', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.electricFieldStringProperty ), tandemName: 'electricFieldItem' },
      { value: 'timeAveragedIntensity', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.amplitudeStringProperty ), tandemName: 'timeAveragedIntensityItem' }
    ];

    const photonWaveDisplayComboBox = new ComboBox(
      model.currentPhotonWaveDisplayModeProperty,
      photonWaveDisplayItems,
      listParent,
      {
        accessibleName: QuantumWaveInterferenceFluent.waveDisplayStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.photonWaveDisplayComboBox.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( 'photonWaveDisplayComboBox' ),
        xMargin: COMBO_BOX_X_MARGIN,
        yMargin: COMBO_BOX_Y_MARGIN
      }
    );

    const matterWaveDisplayItems: ComboBoxItem<MatterWaveDisplayMode>[] = [
      { value: 'realPart', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.realPartStringProperty ), tandemName: 'realPartItem' },
      { value: 'imaginaryPart', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.imaginaryPartStringProperty ), tandemName: 'imaginaryPartItem' },
      { value: 'magnitude', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.amplitudeStringProperty ), tandemName: 'magnitudeItem' }
    ];

    const matterWaveDisplayComboBox = new ComboBox(
      model.currentMatterWaveDisplayModeProperty,
      matterWaveDisplayItems,
      listParent,
      {
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.matterWaveDisplayComboBox.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( 'matterWaveDisplayComboBox' ),
        xMargin: COMBO_BOX_X_MARGIN,
        yMargin: COMBO_BOX_Y_MARGIN
      }
    );

    // Center both alternate combo boxes in the same dynamic bounds so the visible one lines up with the time controls.
    const comboBoxAlignGroup = new AlignGroup( { matchVertical: false } );
    const photonWaveDisplayComboBoxBox = comboBoxAlignGroup.createBox( photonWaveDisplayComboBox, {
      xAlign: 'center'
    } );
    const matterWaveDisplayComboBoxBox = comboBoxAlignGroup.createBox( matterWaveDisplayComboBox, {
      xAlign: 'center'
    } );

    isPhotonsProperty.link( isPhotons => {
      photonWaveDisplayComboBox.visible = isPhotons;
      matterWaveDisplayComboBox.visible = !isPhotons;
    } );

    const comboBoxContainer = new Node( {
      children: [ photonWaveDisplayComboBoxBox, matterWaveDisplayComboBoxBox ],
      excludeInvisibleChildrenFromBounds: false
    } );

    super( {
      spacing: 6,
      align: 'center',
      children: [ waveDisplayTitle, comboBoxContainer ]
    } );
  }
}
