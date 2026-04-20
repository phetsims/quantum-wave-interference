// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the wave display / wave function display combo box section used by
 * both the High Intensity and Single Particles screens. When the Photons scene is selected, it shows
 * photon display modes (Time-averaged Intensity, Electric Field). For matter-particle scenes, it shows
 * matter wave display modes (Magnitude, Real part, Imaginary part) under a "Wave Function Display" heading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const TITLE_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );

type WaveDisplayModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: string }>;
  currentPhotonWaveDisplayModeProperty: PhetioProperty<PhotonWaveDisplayMode>;
  currentMatterWaveDisplayModeProperty: PhetioProperty<MatterWaveDisplayMode>;
};

const createWaveDisplaySection = (
  model: WaveDisplayModel,
  listParent: Node,
  tandem: Tandem
): Node => {
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
    maxWidth: 170
  } );

  const photonWaveDisplayItems: ComboBoxItem<PhotonWaveDisplayMode>[] = [
    { value: 'timeAveragedIntensity', createNode: () => new Text( QuantumWaveInterferenceFluent.timeAveragedIntensityStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'timeAveragedIntensityItem' },
    { value: 'electricField', createNode: () => new Text( QuantumWaveInterferenceFluent.electricFieldStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'electricFieldItem' }
  ];

  const photonWaveDisplayComboBox = new ComboBox(
    model.currentPhotonWaveDisplayModeProperty,
    photonWaveDisplayItems,
    listParent,
    { tandem: tandem.createTandem( 'photonWaveDisplayComboBox' ), xMargin: 10, yMargin: 6 }
  );

  const matterWaveDisplayItems: ComboBoxItem<MatterWaveDisplayMode>[] = [
    { value: 'magnitude', createNode: () => new Text( QuantumWaveInterferenceFluent.magnitudeStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'magnitudeItem' },
    { value: 'realPart', createNode: () => new Text( QuantumWaveInterferenceFluent.realPartStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'realPartItem' },
    { value: 'imaginaryPart', createNode: () => new Text( QuantumWaveInterferenceFluent.imaginaryPartStringProperty, { font: COMBO_BOX_FONT, maxWidth: 160 } ), tandemName: 'imaginaryPartItem' }
  ];

  const matterWaveDisplayComboBox = new ComboBox(
    model.currentMatterWaveDisplayModeProperty,
    matterWaveDisplayItems,
    listParent,
    { tandem: tandem.createTandem( 'matterWaveDisplayComboBox' ), xMargin: 10, yMargin: 6 }
  );

  isPhotonsProperty.link( isPhotons => {
    photonWaveDisplayComboBox.visible = isPhotons;
    matterWaveDisplayComboBox.visible = !isPhotons;
  } );

  const comboBoxContainer = new Node( {
    children: [ photonWaveDisplayComboBox, matterWaveDisplayComboBox ],
    excludeInvisibleChildrenFromBounds: false
  } );

  return new VBox( {
    spacing: 6,
    align: 'left',
    children: [ waveDisplayTitle, comboBoxContainer ]
  } );
};

export default createWaveDisplaySection;
