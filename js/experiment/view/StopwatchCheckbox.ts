// Copyright 2026, University of Colorado Boulder

/**
 * StopwatchCheckbox controls visibility of the stopwatch on the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox, { CheckboxOptions } from '../../../../sun/js/Checkbox.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const LABEL_FONT = new PhetFont( 14 );

export type StopwatchCheckboxOptions = PickRequired<CheckboxOptions, 'tandem'>;

export default class StopwatchCheckbox extends Checkbox {
  public readonly labelNode: Text;

  public constructor( isStopwatchVisibleProperty: Property<boolean>, providedOptions: StopwatchCheckboxOptions ) {
    const stopwatchCheckboxLabel = new Text( QuantumWaveInterferenceFluent.stopwatchStringProperty, {
      font: LABEL_FONT,
      maxWidth: 80
    } );

    super( isStopwatchVisibleProperty, stopwatchCheckboxLabel, {
      boxWidth: 16,
      spacing: 6,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleHelpTextStringProperty,
      accessibleContextResponseChecked: QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty,
      accessibleContextResponseUnchecked: QuantumWaveInterferenceFluent.a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty,
      tandem: providedOptions.tandem
    } );

    this.labelNode = stopwatchCheckboxLabel;
  }
}
