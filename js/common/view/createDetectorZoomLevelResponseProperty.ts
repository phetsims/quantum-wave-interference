// Copyright 2026, University of Colorado Boulder

/**
 * Shared accessible response for detector-screen zoom buttons.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const createDetectorZoomLevelResponseProperty = ( detectorScreenScaleIndexProperty: NumberProperty ): TReadOnlyProperty<string> =>
  QuantumWaveInterferenceFluent.a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponse.createProperty( {
    level: new DerivedProperty(
      [ detectorScreenScaleIndexProperty ],
      detectorScreenScaleIndex => detectorScreenScaleIndex + 1
    ),
    max: detectorScreenScaleIndexProperty.range.max + 1
  } );

export default createDetectorZoomLevelResponseProperty;
