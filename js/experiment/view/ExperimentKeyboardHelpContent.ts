// Copyright 2026, University of Colorado Boulder

/**
 * Keyboard-help dialog content for the Experiment screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import BasicActionsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/BasicActionsKeyboardHelpSection.js';
import MoveDraggableItemsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/MoveDraggableItemsKeyboardHelpSection.js';
import SliderControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/SliderControlsKeyboardHelpSection.js';
import TimeControlsKeyboardHelpSection from '../../../../scenery-phet/js/keyboard/help/TimeControlsKeyboardHelpSection.js';
import TwoColumnKeyboardHelpContent from '../../../../scenery-phet/js/keyboard/help/TwoColumnKeyboardHelpContent.js';

export default class ExperimentKeyboardHelpContent extends TwoColumnKeyboardHelpContent {

  public constructor() {
    super(
      [
        new MoveDraggableItemsKeyboardHelpSection(),
        new SliderControlsKeyboardHelpSection()
      ],
      [
        new TimeControlsKeyboardHelpSection(),
        new BasicActionsKeyboardHelpSection( {
          withCheckboxContent: true
        } )
      ],
      {
        isDisposable: false
      }
    );
  }
}
