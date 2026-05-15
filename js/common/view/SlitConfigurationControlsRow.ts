// Copyright 2026, University of Colorado Boulder

/**
 * SlitConfigurationControlsRow creates the slit configuration combo box and slit separation NumberControl
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
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import type BaseSceneModel from '../model/BaseSceneModel.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import linkSceneVisibility from './linkSceneVisibility.js';
import SlitSeparationNumberControl from './SlitSeparationNumberControl.js';

const TITLE_FONT = new PhetFont( 14 );

export default class SlitConfigurationControlsRow<T extends string> extends Node {

  private readonly slitSeparationContainer: Node;

  public constructor(
    slitConfigurationProperty: PhetioProperty<T>,
    slitConfigItems: ComboBoxItem<T>[],
    sceneProperty: TReadOnlyProperty<BaseSceneModel>,
    scenes: BaseSceneModel[],
    waveRegionLeft: number,
    controlsBottom: number,
    listParent: Node,
    tandem: Tandem
  ) {
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
      new SlitSeparationNumberControl( scene, tandem )
    );

    // Owns one scene-specific slit separation control per scene. linkSceneVisibility keeps only the
    // active scene's control visible, while this container is hidden entirely when there is no barrier.
    const slitSeparationContainer = new Node( {
      children: slitSeparationNodes,
      excludeInvisibleChildrenFromBounds: false
    } );
    linkSceneVisibility( sceneProperty, scenes, slitSeparationNodes );

    super( {
      children: [ slitConfigSection, slitSeparationContainer ],
      excludeInvisibleChildrenFromBounds: false
    } );
    this.slitSeparationContainer = slitSeparationContainer;

    slitConfigurationProperty.link( slitConfiguration => {
      slitSeparationContainer.visible = slitConfiguration !== 'noBarrier';
    } );

    const updateLayout = () => {
      slitSeparationContainer.right = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
      slitSeparationContainer.bottom = 0;

      slitConfigSection.left = 0;
      slitConfigSection.centerY = slitSeparationContainer.centerY;

      this.left = waveRegionLeft;
      this.bottom = controlsBottom;
    };
    slitConfigSection.localBoundsProperty.link( updateLayout );
    slitSeparationContainer.localBoundsProperty.link( updateLayout );
  }

  public getSlitSeparationControlCenterY(): number {
    return this.y + this.slitSeparationContainer.centerY;
  }

  public getSlitSeparationControlCenterX(): number {
    return this.x + this.slitSeparationContainer.centerX;
  }
}
