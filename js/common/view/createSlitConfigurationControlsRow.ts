// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the slit configuration combo box and slit separation NumberControl
 * for the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import createSlitSeparationNumberControl from './createSlitSeparationNumberControl.js';
import linkSceneVisibility from './linkSceneVisibility.js';

const TITLE_FONT = new PhetFont( 14 );
const SLIT_SEPARATION_Y_OFFSET = -10;

const createSlitConfigurationControlsRow = <T extends string>(
  slitConfigurationProperty: PhetioProperty<T>,
  slitConfigItems: ComboBoxItem<T>[],
  sceneProperty: TReadOnlyProperty<BaseSceneModel>,
  scenes: BaseSceneModel[],
  waveRegionLeft: number,
  controlsTop: number,
  listParent: Node,
  tandem: Tandem
): Node => {
  const slitConfigTitle = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
    font: TITLE_FONT,
    maxWidth: 150
  } );

  const slitConfigurationComboBox = new ComboBox( slitConfigurationProperty, slitConfigItems, listParent, {
    tandem: tandem.createTandem( 'slitConfigurationComboBox' ),
    xMargin: 10,
    yMargin: 6,
    listPosition: 'above',
    accessibleName: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty,
    accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleHelpTextStringProperty
  } );

  const slitConfigSection = new VBox( {
    spacing: 6,
    align: 'left',
    children: [ slitConfigTitle, slitConfigurationComboBox ]
  } );

  const slitSeparationNodes: Node[] = scenes.map( scene =>
    createSlitSeparationNumberControl( scene, tandem )
  );

  const slitSeparationContainer = new Node( {
    children: slitSeparationNodes,
    excludeInvisibleChildrenFromBounds: false
  } );
  linkSceneVisibility( sceneProperty, scenes, slitSeparationNodes );

  const slitControlsNode = new Node( {
    children: [ slitConfigSection, slitSeparationContainer ],
    excludeInvisibleChildrenFromBounds: false
  } );

  slitConfigurationProperty.link( slitConfiguration => {
    slitSeparationContainer.visible = slitConfiguration !== 'noBarrier';
  } );

  slitConfigSection.left = 0;
  slitConfigSection.top = 0;

  slitSeparationContainer.right = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
  slitSeparationContainer.top = SLIT_SEPARATION_Y_OFFSET;

  slitControlsNode.left = waveRegionLeft;
  slitControlsNode.top = controlsTop;

  return slitControlsNode;
};

export default createSlitConfigurationControlsRow;
