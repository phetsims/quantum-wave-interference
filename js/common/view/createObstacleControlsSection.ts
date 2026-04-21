// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the obstacle heading and radio button group shared by the
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
import { type ObstacleType } from '../model/ObstacleType.js';

const LABEL_FONT = new PhetFont( 14 );

type ObstacleControlsSection = {
  obstacleControlsSection: VBox;
  obstacleRadioButtonGroup: AquaRadioButtonGroup<ObstacleType>;
};

const createObstacleControlsSection = (
  obstacleTypeProperty: PhetioProperty<ObstacleType>,
  tandem: Tandem
): ObstacleControlsSection => {
  const obstacleRadioButtonItems: AquaRadioButtonGroupItem<ObstacleType>[] = [
    {
      value: 'none',
      createNode: () => new Text( QuantumWaveInterferenceFluent.noneStringProperty, {
        font: LABEL_FONT,
        maxWidth: 120
      } ),
      tandemName: 'noneRadioButton'
    },
    {
      value: 'doubleSlit',
      createNode: () => new Text( QuantumWaveInterferenceFluent.doubleSlitStringProperty, {
        font: LABEL_FONT,
        maxWidth: 120
      } ),
      tandemName: 'doubleSlitRadioButton'
    }
  ];

  const obstacleHeading = new Text( QuantumWaveInterferenceFluent.obstacleStringProperty, {
    font: LABEL_FONT,
    maxWidth: 120
  } );

  const obstacleRadioButtonGroup = new AquaRadioButtonGroup<ObstacleType>(
    obstacleTypeProperty,
    obstacleRadioButtonItems,
    {
      spacing: 8,
      align: 'left',
      orientation: 'vertical',
      radioButtonOptions: { radius: 7 },
      accessibleName: QuantumWaveInterferenceFluent.obstacleStringProperty,
      tandem: tandem.createTandem( 'obstacleRadioButtonGroup' )
    }
  );

  const obstacleControlsSection = new VBox( {
    spacing: 6,
    align: 'left',
    layoutOptions: { align: 'center' },
    children: [ obstacleHeading, obstacleRadioButtonGroup ]
  } );

  return {
    obstacleControlsSection: obstacleControlsSection,
    obstacleRadioButtonGroup: obstacleRadioButtonGroup
  };
};

export default createObstacleControlsSection;
