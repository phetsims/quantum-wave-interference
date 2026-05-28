// Copyright 2026, University of Colorado Boulder

/**
 * Factory for the slit configuration ComboBoxItem array shared between the High Intensity and
 * Single Particles screen views. The two screens use slightly different tandem names for the
 * "covered/closed" items (preserved for PhET-iO API compatibility).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { ComboBoxItem } from '../../../../sun/js/ComboBox.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';

const COMBO_BOX_FONT = new PhetFont( 14 );
const MAX_WIDTH = 120;

export type SlitConfigComboItemTandems = {
  topCoveredTandemName: 'topCoveredItem' | 'topClosedItem';
  bottomCoveredTandemName: 'bottomCoveredItem' | 'bottomClosedItem';
};

export default function createSlitConfigComboItems(
  tandems: SlitConfigComboItemTandems
): ComboBoxItem<SlitConfigurationWithNoBarrier>[] {
  const item = ( value: SlitConfigurationWithNoBarrier, stringProperty: typeof QuantumWaveInterferenceFluent.bothOpenStringProperty, tandemName: string, separatorBefore?: boolean ): ComboBoxItem<SlitConfigurationWithNoBarrier> => ( {
    value: value,
    createNode: () => new Text( stringProperty, { font: COMBO_BOX_FONT, maxWidth: MAX_WIDTH } ),
    tandemName: tandemName,
    separatorBefore: separatorBefore
  } );

  return [
    item( 'bothOpen', QuantumWaveInterferenceFluent.bothOpenStringProperty, 'bothOpenItem' ),

    // The model keys use Experiment's overhead left/right slit names; these shared front-facing controls label those
    // same slits as top/bottom.
    item( 'leftCovered', QuantumWaveInterferenceFluent.coverTopStringProperty, tandems.topCoveredTandemName, true ),
    item( 'rightCovered', QuantumWaveInterferenceFluent.coverBottomStringProperty, tandems.bottomCoveredTandemName ),
    item( 'leftDetector', QuantumWaveInterferenceFluent.detectorTopStringProperty, 'topDetectorItem', true ),
    item( 'rightDetector', QuantumWaveInterferenceFluent.detectorBottomStringProperty, 'bottomDetectorItem' ),
    item( 'bothDetectors', QuantumWaveInterferenceFluent.detectorBothStringProperty, 'bothDetectorsItem' ),
    item( 'noBarrier', QuantumWaveInterferenceFluent.noBarrierStringProperty, 'noBarrierItem', true )
  ];
}
