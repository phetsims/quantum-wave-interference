// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the barrier heading and radio button group shared by the
 * High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButtonGroup, { AquaRadioButtonGroupItem } from '../../../../sun/js/AquaRadioButtonGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type BarrierType } from '../model/BarrierType.js';

const LABEL_FONT = new PhetFont( 14 );

type BarrierControlsSection = {
  barrierControlsSection: VBox;
  barrierRadioButtonGroup: AquaRadioButtonGroup<BarrierType>;
};

const createBarrierControlsSection = (
  barrierTypeProperty: PhetioProperty<BarrierType>,
  tandem: Tandem
): BarrierControlsSection => {
  const barrierRadioButtonItems: AquaRadioButtonGroupItem<BarrierType>[] = [
    {
      value: 'doubleSlit',
      createNode: () => new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
        font: LABEL_FONT,
        maxWidth: 120
      } ),
      tandemName: 'doubleSlitRadioButton'
    },
    {
      value: 'none',
      createNode: () => new Text( QuantumWaveInterferenceFluent.noneStringProperty, {
        font: LABEL_FONT,
        maxWidth: 120
      } ),
      tandemName: 'noneRadioButton'
    }
  ];

  const barrierHeading = new Text( QuantumWaveInterferenceFluent.barrierStringProperty, {
    font: LABEL_FONT,
    maxWidth: 120
  } );

  const barrierRadioButtonGroup = new AquaRadioButtonGroup<BarrierType>(
    barrierTypeProperty,
    barrierRadioButtonItems,
    {
      spacing: 8,
      align: 'left',
      orientation: 'vertical',
      radioButtonOptions: { radius: 7 },
      accessibleName: QuantumWaveInterferenceFluent.barrierStringProperty,
      tandem: tandem.createTandem( 'barrierRadioButtonGroup' )
    }
  );

  const barrierControlsSection = new VBox( {
    spacing: 6,
    align: 'left',
    layoutOptions: { align: 'center' },
    children: [ barrierHeading, barrierRadioButtonGroup ]
  } );

  return {
    barrierControlsSection: barrierControlsSection,
    barrierRadioButtonGroup: barrierRadioButtonGroup
  };
};

export default createBarrierControlsSection;
