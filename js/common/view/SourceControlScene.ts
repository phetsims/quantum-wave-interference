// Copyright 2026, University of Colorado Boulder

/**
 * SourceControlScene is the minimal scene-model interface required by SourceControlPanel.
 * The concrete Experiment, High Intensity, and Single Particles scenes expose additional state, but the source controls
 * only need source type plus the numeric Properties that drive wavelength, speed, and optional source strength.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import { type SourceType } from '../model/SourceType.js';

type SourceControlScene = {
  readonly sourceType: SourceType;
  readonly wavelengthProperty: NumberProperty;
  readonly particleSpeedProperty: NumberProperty;
  readonly particleSpeedRange: Range;

  // Scenes omit both Properties when their source strength is fixed, which hides the source-strength slider.
  readonly sourceIntensityProperty?: NumberProperty;
  readonly emissionRateProperty?: NumberProperty;
};

export default SourceControlScene;
