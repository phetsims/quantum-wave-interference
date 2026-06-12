// Copyright 2026, University of Colorado Boulder

/**
 * ToolCheckbox creates a tool visibility checkbox, used by both the High Intensity
 * and Single Particles screen views for tool panels (measuring tape, stopwatch, time plot, etc.).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const LABEL_FONT = new PhetFont( 14 );
const CHECKBOX_BOX_WIDTH = 16;

// Checkbox's check shape extends beyond boxWidth in layout bounds.
const CHECKBOX_LAYOUT_BOX_WIDTH = 20;
const CHECKBOX_LABEL_SPACING = 6;

export default class ToolCheckbox extends Checkbox {

  /**
   * @param property - whether the tool is visible, toggled by this checkbox
   * @param stringProperty - the checkbox label
   * @param tandem
   * @param accessibleHelpText - screen reader help text describing what the tool is for
   * @param visibleProperty - controls whether this checkbox itself is shown, e.g., a GatedVisibleProperty when the
   *                          tool is only available in certain configurations
   */
  public constructor(
    property: BooleanProperty,
    stringProperty: TReadOnlyProperty<string>,
    tandem: Tandem,
    accessibleHelpText?: TReadOnlyProperty<string>,
    visibleProperty?: TReadOnlyProperty<boolean>
  ) {
    const labelMaxWidth = QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH -
                          CHECKBOX_LAYOUT_BOX_WIDTH -
                          CHECKBOX_LABEL_SPACING;
    const label = new Text( stringProperty, {
      font: LABEL_FONT,
      maxWidth: labelMaxWidth
    } );

    super( property, label, {
      boxWidth: CHECKBOX_BOX_WIDTH,
      spacing: CHECKBOX_LABEL_SPACING,
      touchAreaXDilation: 5,
      touchAreaYDilation: 4,
      mouseAreaXDilation: 5,
      mouseAreaYDilation: 4,
      accessibleHelpText: accessibleHelpText,
      visibleProperty: visibleProperty,
      tandem: tandem
    } );
  }
}
