// Copyright 2026, University of Colorado Boulder

/**
 * Shared visual message shown next to the source emitter when the detector screen reaches the maximum number of hits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';

export default class MaxHitsReachedPanel extends Panel {

  public constructor( tandem: Tandem ) {
    const maxHitsReachedText = new Text( QuantumWaveInterferenceFluent.maximumHitsReachedStringProperty, {
      font: new PhetFont( 13 ),
      maxWidth: 120
    } );

    super( maxHitsReachedText, {
      xMargin: 8,
      yMargin: 6,
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.panelStrokeProperty,
      cornerRadius: 5,
      visible: false,
      pickable: false,
      accessibleParagraph: QuantumWaveInterferenceFluent.maximumHitsReachedStringProperty,

      // Visibility tracks the model's isMaxHitsReachedProperty, so clients may not control it.
      visiblePropertyOptions: { phetioReadOnly: true },
      tandem: tandem
    } );
  }
}
