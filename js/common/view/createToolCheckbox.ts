// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates a tool visibility checkbox, used by both the High Intensity
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

const LABEL_FONT = new PhetFont( 14 );

const createToolCheckbox = (
  property: BooleanProperty,
  stringProperty: TReadOnlyProperty<string>,
  tandem: Tandem,
  icon?: Node
): Checkbox => {
  const label = new Text( stringProperty, { font: LABEL_FONT, maxWidth: 120 } );
  const content = icon ?
                  new HBox( { children: [ label, icon ], spacing: 6 } ) :
                  label;
  return new Checkbox( property, content, {
    boxWidth: 16,
    spacing: 6,
    tandem: tandem
  } );
};

export default createToolCheckbox;
