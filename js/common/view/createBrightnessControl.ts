// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates the screen brightness label and slider, used by both the
 * High Intensity and Single Particles screen views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type PhetioProperty from '../../../../axon/js/PhetioProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const LABEL_FONT = new PhetFont( 14 );

const createBrightnessControl = (
  screenBrightnessProperty: PhetioProperty<number>,
  tandem: Tandem
): VBox => {
  const brightnessLabel = new Text( QuantumWaveInterferenceFluent.screenBrightnessStringProperty, {
    font: LABEL_FONT,
    maxWidth: 140
  } );
  const brightnessRange = new Range( 0, QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX );
  const brightnessMax = QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX;
  const brightnessSlider = new HSlider( screenBrightnessProperty, brightnessRange, {
    trackSize: new Dimension2( 130, 3 ),
    thumbSize: new Dimension2( 13, 22 ),
    majorTickLength: 12,
    minorTickLength: 8,
    createAriaValueText: value => percentUnit.getAccessibleString(
      value / brightnessMax * 100,
      { decimalPlaces: 0, showTrailingZeros: false, showIntegersAsIntegers: true }
    ),
    tandem: tandem.createTandem( 'brightnessSlider' )
  } );

  const MINOR_TICKS_PER_SECTION = 4;
  const majorValues = [ 0, brightnessMax / 2, brightnessMax ];
  majorValues.forEach( value => brightnessSlider.addMajorTick( value ) );
  for ( let section = 0; section < majorValues.length - 1; section++ ) {
    const lo = majorValues[ section ];
    const hi = majorValues[ section + 1 ];
    for ( let i = 1; i <= MINOR_TICKS_PER_SECTION; i++ ) {
      brightnessSlider.addMinorTick( lo + ( hi - lo ) * i / ( MINOR_TICKS_PER_SECTION + 1 ) );
    }
  }
  return new VBox( {
    spacing: 2,
    children: [ brightnessLabel, brightnessSlider ]
  } );
};

export default createBrightnessControl;
