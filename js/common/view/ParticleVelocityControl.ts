// Copyright 2026, University of Colorado Boulder

/**
 * ParticleVelocityControl creates the speed control used by electron, neutron, and helium-atom source scenes.
 * The model stores speeds in meters per second. Fast electron ranges are displayed in kilometers per second for
 * readability, while slower particles use the NumberProperty's meters-per-second units.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import NumberControl from '../../../../scenery-phet/js/NumberControl.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { kilometersPerSecondUnit } from '../../../../scenery-phet/js/units/kilometersPerSecondUnit.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SourceType } from '../model/SourceType.js';
import { SOURCE_CONTROL_SLIDER_TRACK_HEIGHT, SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SOURCE_CONTROL_TICK_LABEL_FONT, SOURCE_CONTROL_TITLE_FONT } from './SourceControlPanelConstants.js';

type ParticleVelocityScene = {
  readonly sourceType: SourceType;
  readonly velocityProperty: NumberProperty;
  readonly velocityRange: Range;
};

/**
 * Returns the keyboard/button step size for a particle velocity control.
 */
function getVelocityDelta( sourceType: SourceType ): number {
  return sourceType === 'electrons' ? 10000 :
         sourceType === 'neutrons' ? 10 :
         sourceType === 'heliumAtoms' ? 50 :
         ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
}

/**
 * Returns a value formatter for electron velocity controls that display meters-per-second model values as
 * kilometers per second.
 */
function formatKilometersPerSecond( value: number ): { visualString: string; accessibleString: string } {
  const roundedValue = roundSymmetric( value / 1000 );
  return {
    visualString: kilometersPerSecondUnit.getVisualSymbolPatternString( roundedValue, {
      decimalPlaces: 0,
      showTrailingZeros: false,
      showIntegersAsIntegers: true
    } ),
    accessibleString: kilometersPerSecondUnit.getAccessibleString( roundedValue, {
      decimalPlaces: 0,
      showTrailingZeros: false,
      showIntegersAsIntegers: true
    } )
  };
}

/**
 * Formats a major-tick value. The tick labels intentionally omit units because the NumberControl readout supplies the
 * unit-bearing value.
 */
function formatTickLabel( value: number, useKilometersPerSecond: boolean ): string {
  return `${roundSymmetric( useKilometersPerSecond ? value / 1000 : value )}`;
}

export default class ParticleVelocityControl extends NumberControl {

  public constructor( scene: ParticleVelocityScene, tandem: Tandem ) {
    const velocityRange = scene.velocityRange;
    const useKilometersPerSecond = velocityRange.max >= 10000;

    super(
      QuantumWaveInterferenceFluent.particleSpeedStringProperty,
      scene.velocityProperty,
      velocityRange,
      {
        delta: getVelocityDelta( scene.sourceType ),
        titleNodeOptions: {
          font: SOURCE_CONTROL_TITLE_FONT,
          maxWidth: 100
        },
        numberDisplayOptions: useKilometersPerSecond ? {
          numberFormatter: formatKilometersPerSecond,

          // Retrigger the formatter when locale-dependent unit strings change.
          numberFormatterDependencies: [
            ...kilometersPerSecondUnit.getDependentProperties()
          ],
          textOptions: {
            font: new PhetFont( 14 )
          },
          maxWidth: 120
        } : {
          decimalPlaces: 0,
          textOptions: {
            font: new PhetFont( 14 )
          },
          maxWidth: 120
        },
        sliderOptions: {
          trackSize: new Dimension2( SOURCE_CONTROL_SLIDER_TRACK_WIDTH, SOURCE_CONTROL_SLIDER_TRACK_HEIGHT ),
          thumbSize: new Dimension2( 13, 22 ),
          majorTickLength: 12,
          majorTicks: [
            {
              value: velocityRange.min,
              label: new Text( formatTickLabel( velocityRange.min, useKilometersPerSecond ), {
                font: SOURCE_CONTROL_TICK_LABEL_FONT,
                maxWidth: 40
              } )
            },
            {
              value: velocityRange.max,
              label: new Text( formatTickLabel( velocityRange.max, useKilometersPerSecond ), {
                font: SOURCE_CONTROL_TICK_LABEL_FONT,
                maxWidth: 40
              } )
            }
          ]
        },
        layoutFunction: NumberControl.createLayoutFunction1( {
          arrowButtonsXSpacing: 8,
          ySpacing: 8
        } ),
        accessibleHelpText: QuantumWaveInterferenceFluent.a11y.particleSpeedSlider.accessibleHelpTextStringProperty,
        tandem: tandem.createTandem( `${scene.sourceType}VelocityControl` )
      }
    );
  }
}
