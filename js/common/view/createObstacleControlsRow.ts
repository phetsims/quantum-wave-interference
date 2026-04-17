// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the obstacle controls row containing the obstacle combo box,
 * slit configuration combo box, and slit separation NumberControl. Used by both the
 * High Intensity and Single Particles screens.
 *
 * The slit configuration items differ between screens (High Intensity has detector variants,
 * Single Particles does not), so they are passed as a parameter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type ObstacleType } from '../model/ObstacleType.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import createSlitSeparationNumberControl from './createSlitSeparationNumberControl.js';
import linkSceneVisibility from './linkSceneVisibility.js';

const TITLE_FONT = new PhetFont( { size: 14, weight: 'bold' } );
const COMBO_BOX_FONT = new PhetFont( 14 );
const X_MARGIN = QuantumWaveInterferenceConstants.SCREEN_VIEW_X_MARGIN;

type CreateObstacleControlsRowOptions = {
  additionalTopConstraintNode?: Node;
};

const createObstacleControlsRow = <T extends string>(
  obstacleTypeProperty: PhetioProperty<ObstacleType>,
  slitConfigurationProperty: PhetioProperty<T>,
  slitConfigItems: ComboBoxItem<T>[],
  sceneProperty: TReadOnlyProperty<BaseSceneModel>,
  scenes: BaseSceneModel[],
  waveRegionTop: number,
  listParent: Node,
  tandem: Tandem,
  options?: CreateObstacleControlsRowOptions
): Node => {

  const obstacleTitle = new Text( QuantumWaveInterferenceFluent.obstacleStringProperty, {
    font: TITLE_FONT,
    maxWidth: 120
  } );

  const obstacleComboBoxItems: ComboBoxItem<ObstacleType>[] = [
    { value: 'none', createNode: () => new Text( QuantumWaveInterferenceFluent.noneStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'noneItem' },
    { value: 'doubleSlit', createNode: () => new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, { font: COMBO_BOX_FONT, maxWidth: 120 } ), tandemName: 'doubleSlitItem' }
  ];

  const obstacleComboBox = new ComboBox( obstacleTypeProperty, obstacleComboBoxItems, listParent, {
    tandem: tandem.createTandem( 'obstacleComboBox' ),
    xMargin: 10,
    yMargin: 6
  } );

  const obstacleSection = new VBox( {
    spacing: 6,
    align: 'left',
    children: [ obstacleTitle, obstacleComboBox ]
  } );

  const slitConfigTitle = new Text( QuantumWaveInterferenceFluent.slitConfigurationStringProperty, {
    font: TITLE_FONT,
    maxWidth: 150
  } );

  const slitConfigurationComboBox = new ComboBox( slitConfigurationProperty, slitConfigItems, listParent, {
    tandem: tandem.createTandem( 'slitConfigurationComboBox' ),
    xMargin: 10,
    yMargin: 6
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

  const slitSection = new HBox( {
    spacing: 20,
    align: 'bottom',
    children: [ slitConfigSection, slitSeparationContainer ]
  } );

  obstacleTypeProperty.link( obstacleType => {
    slitSection.visible = obstacleType === 'doubleSlit';
  } );

  const bottomRow = new HBox( {
    spacing: 20,
    align: 'bottom',
    children: [ obstacleSection, slitSection ]
  } );
  bottomRow.left = X_MARGIN;

  const waveRegionBottom = waveRegionTop + QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT + 8;
  const additionalNode = options?.additionalTopConstraintNode;
  if ( additionalNode ) {
    const updateTop = () => {
      bottomRow.top = Math.max( waveRegionBottom, additionalNode.bottom + 8 );
    };
    additionalNode.boundsProperty.link( updateTop );
  }
  else {
    bottomRow.top = waveRegionBottom;
  }

  return bottomRow;
};

export default createObstacleControlsRow;
