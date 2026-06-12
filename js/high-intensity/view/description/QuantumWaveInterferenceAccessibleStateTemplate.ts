// Copyright 2026, University of Colorado Boulder

/**
 * Centralizes the complete set of Property dependencies required when deriving High Intensity accessible state
 * descriptions. Callers (e.g., HighIntensityExperimentSetupSequenceItems) invoke createDependencies() to obtain the
 * deduplicated list of model, locale, and localized-unit Properties whose changes must trigger recomputation of any
 * description that samples getAccessibleViewState().
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { metersPerSecondUnit } from '../../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import { picometersUnit } from '../../../../../scenery-phet/js/units/picometersUnit.js';
import { WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';

export default class QuantumWaveInterferenceAccessibleStateTemplate {

  /**
   * Creates the Property dependency list for derived descriptions that read the full High Intensity accessible state.
   * Callers use this when their derivation samples getAccessibleViewState() and must update for model, locale, and
   * localized-unit changes.
   *
   * @param model - High Intensity model that owns the accessible state dependencies
   * @returns dependencies that should trigger recomputation of High Intensity accessible-state descriptions
   */
  public static createDependencies( model: HighIntensityModel ): TReadOnlyProperty<unknown>[] {
    return Array.from( new Set( [
      model.sceneProperty,
      model.currentIsEmittingProperty,
      model.currentIsEmitterEnabledProperty,
      model.currentIsMaxHitsReachedProperty,
      model.currentDetectionModeProperty,
      model.isIntensityGraphVisibleProperty,
      model.currentScreenBrightnessProperty,
      model.currentWaveDisplayModeProperty,
      model.currentSlitConfigurationProperty,
      model.currentWavelengthProperty,
      model.currentParticleSpeedProperty,
      model.currentSlitSeparationProperty,
      model.currentLeftDetectorHitsProperty,
      model.currentRightDetectorHitsProperty,
      model.currentTotalHitsProperty,
      model.currentNumberOfSnapshotsProperty,
      model.accessibleStateStepProperty,
      model.isMeasuringTapeVisibleProperty,
      model.isStopwatchVisibleProperty,
      model.isTimePlotVisibleProperty,
      model.isPositionPlotVisibleProperty,
      model.isPlayingProperty,
      model.timeSpeedProperty,
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.overview.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceStatus.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceBeam.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.photonDetail.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.particleDetail.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.slits.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.detectorPattern.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.waveProgress.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.displayTools.getDependentProperties(),
      ...WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES,
      ...micrometersUnit.getDependentProperties(),
      ...metersPerSecondUnit.getDependentProperties(),
      ...nanometersUnit.getDependentProperties(),
      ...picometersUnit.getDependentProperties()
    ] ) );
  }
}
