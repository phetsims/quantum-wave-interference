// Copyright 2026, University of Colorado Boulder

/**
 * Shared accessible response for detector-screen zoom buttons.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';

/**
 * Creates a reactive string Property used as the accessibleContextResponse for the detector-screen zoom buttons.
 * The response announces the current zoom level and maximum in human-readable (1-based) terms, while the underlying
 * model uses a 0-based index. Both `level` and `max` are therefore offset by +1 relative to the raw index.
 *
 * @param detectorScreenScaleIndexProperty - 0-based index into the discrete set of detector-screen zoom levels
 * @returns a string Property whose value updates whenever the scale index changes
 */
function createDetectorZoomLevelResponseProperty( detectorScreenScaleIndexProperty: NumberProperty ): TReadOnlyProperty<string> {
  return QuantumWaveInterferenceFluent.a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponse.createProperty( {
    level: new DerivedProperty(
      [ detectorScreenScaleIndexProperty ],
      detectorScreenScaleIndex => detectorScreenScaleIndex + 1
    ),
    max: detectorScreenScaleIndexProperty.range.max + 1
  } );
}

export default createDetectorZoomLevelResponseProperty;
