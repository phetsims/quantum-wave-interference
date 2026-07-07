// Copyright 2026, University of Colorado Boulder

/**
 * WaveDisplaySection is the wave display / wave function display combo box section used by
 * both the High Intensity and Single Particles screens. When the Photons scene is selected, it shows
 * photon display modes (Amplitude, Electric Field). For matter-particle scenes, it shows
 * matter wave display modes (Amplitude, Real part) under a "Wave Function Display" heading.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import GatedVisibleProperty from '../../../../axon/js/GatedVisibleProperty.js';
import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const TITLE_FONT = new PhetFont( 14 );
const COMBO_BOX_FONT = new PhetFont( 14 );
const COMBO_BOX_X_MARGIN = 10;
const COMBO_BOX_Y_MARGIN = 6;
const COMBO_BOX_LINE_WIDTH = 1;

// ComboBoxButton lays out text, x margins, a separator, and a square arrow area based on item height.
const COMBO_BOX_ITEM_HEIGHT = new Text( 'test', { font: COMBO_BOX_FONT } ).height;
const COMBO_BOX_ARROW_AREA_WIDTH = COMBO_BOX_ITEM_HEIGHT + 2 * COMBO_BOX_Y_MARGIN;
const COMBO_BOX_CHROME_WIDTH = 2 * COMBO_BOX_X_MARGIN + COMBO_BOX_LINE_WIDTH + COMBO_BOX_ARROW_AREA_WIDTH;
const COMBO_BOX_ITEM_TEXT_MAX_WIDTH = QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH - COMBO_BOX_CHROME_WIDTH;

/**
 * Model interface required by WaveDisplaySection. Callers (e.g. DetectorScreenControls) pass in a slice of the
 * screen model that satisfies this shape. sceneProperty determines which combo box is visible (photon vs matter),
 * and the two mode properties back the respective combo box selections and are wired through to PhET-iO.
 */
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

    const createComboBoxText = ( stringProperty: TReadOnlyProperty<string> ) => new Text( stringProperty, {
      font: COMBO_BOX_FONT,
      maxWidth: COMBO_BOX_ITEM_TEXT_MAX_WIDTH
    } );

    const photonWaveDisplayItems: ComboBoxItem<PhotonWaveDisplayMode>[] = [
      { value: 'electricField', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.electricFieldStringProperty ), tandemName: 'electricFieldItem' },

      // Amplitude displays sqrt( re^2 + im^2 ) for all source types.
      { value: 'amplitude', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.amplitudeStringProperty ), tandemName: 'amplitudeItem' }
    ];

    const photonWaveDisplayControlTandem = tandem.createTandem( 'photonWaveDisplayControl' );
    const photonWaveDisplayComboBox = new ComboBox(
      model.currentPhotonWaveDisplayModeProperty,
      photonWaveDisplayItems,
      listParent,
      {
        accessibleName: QuantumWaveInterferenceFluent.waveDisplayStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.photonWaveDisplayComboBox.accessibleHelpTextStringProperty,
        tandem: photonWaveDisplayControlTandem.createTandem( 'comboBox' ),
        phetioVisiblePropertyInstrumented: false,

        // Unfeatured to match currentPhotonWaveDisplayModeProperty. Clients observe the mode through the featured
        // currentWaveDisplayModeProperty instead.
        phetioFeatured: false,
        xMargin: COMBO_BOX_X_MARGIN,
        yMargin: COMBO_BOX_Y_MARGIN
      }
    );
    affirm( photonWaveDisplayComboBox.width <= QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH + 1e-6,
      `photonWaveDisplayComboBox.width=${photonWaveDisplayComboBox.width} exceeds RIGHT_PANEL_WIDTH=${QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH}` );

    const photonWaveDisplayControl = new VBox( {
      spacing: 6,
      align: 'center',
      children: [
        new Text( QuantumWaveInterferenceFluent.waveDisplayStringProperty, {
          font: TITLE_FONT,
          maxWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH
        } ),
        photonWaveDisplayComboBox
      ],
      tandem: photonWaveDisplayControlTandem,

      // Gate visibility on the photons scene so that clients cannot show this control in a matter scene.
      // Clients customize visibility through the featured selfVisibleProperty instead.
      visibleProperty: new GatedVisibleProperty( isPhotonsProperty, photonWaveDisplayControlTandem, {
        phetioFeatured: true
      } )
    } );

    const matterWaveDisplayItems: ComboBoxItem<MatterWaveDisplayMode>[] = [
      { value: 'realPart', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.realPartStringProperty ), tandemName: 'realPartItem' },

      // Amplitude displays sqrt( re^2 + im^2 ) for all source types.
      { value: 'amplitude', createNode: () => createComboBoxText( QuantumWaveInterferenceFluent.amplitudeStringProperty ), tandemName: 'amplitudeItem' }
    ];

    const matterWaveDisplayControlTandem = tandem.createTandem( 'matterWaveDisplayControl' );
    const matterWaveDisplayComboBox = new ComboBox(
      model.currentMatterWaveDisplayModeProperty,
      matterWaveDisplayItems,
      listParent,
      {
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.matterWaveDisplayComboBox.accessibleHelpTextStringProperty,
        tandem: matterWaveDisplayControlTandem.createTandem( 'comboBox' ),
        phetioVisiblePropertyInstrumented: false,

        // Unfeatured to match currentMatterWaveDisplayModeProperty. Clients observe the mode through the featured
        // currentWaveDisplayModeProperty instead.
        phetioFeatured: false,
        xMargin: COMBO_BOX_X_MARGIN,
        yMargin: COMBO_BOX_Y_MARGIN
      }
    );
    affirm( matterWaveDisplayComboBox.width <= QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH + 1e-6,
      `matterWaveDisplayComboBox.width=${matterWaveDisplayComboBox.width} exceeds RIGHT_PANEL_WIDTH=${QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH}` );

    const matterWaveDisplayControl = new VBox( {
      spacing: 6,
      align: 'center',
      children: [
        new Text( QuantumWaveInterferenceFluent.waveFunctionDisplayStringProperty, {
          font: TITLE_FONT,
          maxWidth: QuantumWaveInterferenceConstants.RIGHT_PANEL_WIDTH
        } ),
        matterWaveDisplayComboBox
      ],
      tandem: matterWaveDisplayControlTandem,

      // Gate visibility on the matter scenes so that clients cannot show this control in the photons scene.
      // Clients customize visibility through the featured selfVisibleProperty instead.
      visibleProperty: new GatedVisibleProperty( DerivedProperty.not( isPhotonsProperty ), matterWaveDisplayControlTandem, {
        phetioFeatured: true
      } )
    } );

    // Match the alternate controls' widths while allowing the selected control to collapse when hidden by a client.
    const controlAlignGroup = new AlignGroup( { matchVertical: false } );
    const photonWaveDisplayControlBox = controlAlignGroup.createBox( photonWaveDisplayControl, {
      xAlign: 'center',
      visibleProperty: photonWaveDisplayControl.visibleProperty
    } );
    const matterWaveDisplayControlBox = controlAlignGroup.createBox( matterWaveDisplayControl, {
      xAlign: 'center',
      visibleProperty: matterWaveDisplayControl.visibleProperty
    } );

    // ToggleNode controls these wrappers, leaving each control's client-controlled visibleProperty untouched.
    const photonWaveDisplaySceneNode = new Node( {
      children: [ photonWaveDisplayControlBox ],
      excludeInvisibleChildrenFromBounds: true
    } );
    const matterWaveDisplaySceneNode = new Node( {
      children: [ matterWaveDisplayControlBox ],
      excludeInvisibleChildrenFromBounds: true
    } );

    const controlToggleNode = new ToggleNode( isPhotonsProperty, [
      { value: true, createNode: () => photonWaveDisplaySceneNode },
      { value: false, createNode: () => matterWaveDisplaySceneNode }
    ], {
      unselectedChildrenSceneGraphStrategy: 'excluded'
    } );

    super( {
      align: 'center',
      children: [ controlToggleNode ]
    } );
  }
}
