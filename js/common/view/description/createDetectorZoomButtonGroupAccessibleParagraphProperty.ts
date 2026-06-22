// Copyright 2026, University of Colorado Boulder

/**
 * Shared accessible paragraph for detector-screen zoom button groups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';

/**
 * Creates a reactive accessible paragraph describing how to use the detector-screen zoom buttons and the current zoom
 * level. The detector-screen scale model uses a 0-based index, but the help text presents human-readable 1-based zoom
 * levels.
 *
 * @param detectorScreenScaleIndexProperty - 0-based index into the discrete set of detector-screen zoom levels
 * @returns a string Property whose value updates whenever the scale index changes
 */
function createDetectorZoomButtonGroupAccessibleParagraphProperty( detectorScreenScaleIndexProperty: NumberProperty ): TReadOnlyProperty<string> {
  return QuantumWaveInterferenceFluent.a11y.detectorScreen.zoomButtonGroup.accessibleParagraph.createProperty( {
    level: new DerivedProperty(
      [ detectorScreenScaleIndexProperty ],
      detectorScreenScaleIndex => detectorScreenScaleIndex + 1
    )
  } );
}

export default createDetectorZoomButtonGroupAccessibleParagraphProperty;
