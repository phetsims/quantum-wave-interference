// Copyright 2026, University of Colorado Boulder

/**
 * BrightnessControl creates the screen brightness label and slider, used by both the
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

export default class BrightnessControl extends VBox {

  public constructor( screenBrightnessProperty: PhetioProperty<number>, tandem: Tandem ) {
    const brightnessLabel = new Text( QuantumWaveInterferenceFluent.screenBrightnessStringProperty, {
      font: LABEL_FONT,
      maxWidth: 140
    } );
    const brightnessRange = new Range( 0, QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX );
    const brightnessSlider = new HSlider( screenBrightnessProperty, brightnessRange, {
      trackSize: new Dimension2( 130, 3 ),
      thumbSize: new Dimension2( 13, 22 ),
      createAriaValueText: value => percentUnit.getAccessibleString(
        value / QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX * 100,
        { decimalPlaces: 0, showTrailingZeros: false, showIntegersAsIntegers: true }
      ),
      tandem: tandem.createTandem( 'brightnessSlider' )
    } );

    super( {
      spacing: 2,
      children: [ brightnessLabel, brightnessSlider ]
    } );
  }
}
