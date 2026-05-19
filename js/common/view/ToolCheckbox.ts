// Copyright 2026, University of Colorado Boulder

/**
 * ToolCheckbox creates a tool visibility checkbox, used by both the High Intensity
 * and Single Particles screen views for tool panels (tape measure, stopwatch, time plot, etc.).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const LABEL_FONT = new PhetFont( 14 );
const CHECKBOX_BOX_WIDTH = 16;

// Checkbox's check shape extends beyond boxWidth in layout bounds.
const CHECKBOX_LAYOUT_BOX_WIDTH = 20;
const CHECKBOX_LABEL_SPACING = 6;
const LABEL_ICON_SPACING = 6;

export default class ToolCheckbox extends Checkbox {

  public constructor(
    property: BooleanProperty,
    stringProperty: TReadOnlyProperty<string>,
    tandem: Tandem,
    icon?: Node,
    accessibleHelpText?: TReadOnlyProperty<string>
  ) {
    const labelMaxWidth = Math.max( 1, QuantumWaveInterferenceConstants.RIGHT_PANEL_CONTENT_WIDTH -
                                       CHECKBOX_LAYOUT_BOX_WIDTH -
                                       CHECKBOX_LABEL_SPACING -
                                       ( icon ? LABEL_ICON_SPACING + icon.width : 0 ) );
    const label = new Text( stringProperty, { font: LABEL_FONT, maxWidth: labelMaxWidth, layoutOptions: { grow: 1 } } );
    const content = icon ?
                    new HBox( { children: [ label, icon ], spacing: LABEL_ICON_SPACING } ) :
                    label;

    super( property, content, {
      boxWidth: CHECKBOX_BOX_WIDTH,
      spacing: CHECKBOX_LABEL_SPACING,
      accessibleHelpText: accessibleHelpText,
      layoutOptions: { stretch: true },
      tandem: tandem
    } );
  }
}
