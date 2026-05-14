// Copyright 2026, University of Colorado Boulder

/**
 * RulerCheckbox controls visibility of the detector ruler on the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const LABEL_FONT = new PhetFont( 14 );

export type RulerCheckboxOptions = PickRequired<CheckboxOptions, 'tandem'>;

export default class RulerCheckbox extends Checkbox {

  public constructor( isRulerVisibleProperty: BooleanProperty, providedOptions: RulerCheckboxOptions ) {
    const rulerCheckboxLabel = new Text( QuantumWaveInterferenceFluent.rulerStringProperty, {
      font: LABEL_FONT,
      maxWidth: 80
    } );

    super( isRulerVisibleProperty, rulerCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleHelpTextStringProperty,
      accessibleContextResponseChecked: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty,
      accessibleContextResponseUnchecked: QuantumWaveInterferenceFluent.a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty,
      tandem: providedOptions.tandem
    } );
  }
}
