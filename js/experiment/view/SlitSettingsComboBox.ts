// Copyright 2026, University of Colorado Boulder

/**
 * SlitSettingsComboBox is the ComboBox for selecting the experiment screen's slit configuration.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem, ComboBoxOptions } from '../../../../sun/js/ComboBox.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';

const COMBO_BOX_FONT = new PhetFont( 14 );

export type SlitSettingsComboBoxOptions = PickRequired<ComboBoxOptions, 'tandem'>;

export default class SlitSettingsComboBox extends ComboBox<SlitConfiguration> {

  public constructor(
    scene: SceneModel,
    comboBoxParent: Node,
    providedOptions: SlitSettingsComboBoxOptions
  ) {
    const comboBoxItems: ComboBoxItem<SlitConfiguration>[] = [
      {
        value: 'bothOpen',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.bothOpenStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'bothOpenItem'
      },
      {
        value: 'leftCovered',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.coverLeftStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'leftCoveredItem',
        separatorBefore: true
      },
      {
        value: 'rightCovered',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.coverRightStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'rightCoveredItem'
      },
      {
        value: 'leftDetector',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorLeftStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'leftDetectorItem',
        separatorBefore: true
      },
      {
        value: 'rightDetector',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorRightStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'rightDetectorItem'
      },
      {
        value: 'bothDetectors',
        createNode: () =>
          new Text( QuantumWaveInterferenceFluent.detectorBothStringProperty, {
            font: COMBO_BOX_FONT,
            maxWidth: 150
          } ),
        tandemName: 'bothDetectorsItem'
      }
    ];

    const slitSettingsContextResponseProperty = QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleContextResponse.createProperty( {
      slitSetting: scene.slitSettingProperty
    } );

    super(
      scene.slitSettingProperty,
      comboBoxItems,
      comboBoxParent,
      {
        xMargin: 16,
        yMargin: 8,
        listPosition: 'above',
        accessibleName: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleNameStringProperty,
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.slitSettingsComboBox.accessibleHelpTextStringProperty,
        accessibleContextResponse: slitSettingsContextResponseProperty,
        tandem: providedOptions.tandem
      }
    );
  }
}
