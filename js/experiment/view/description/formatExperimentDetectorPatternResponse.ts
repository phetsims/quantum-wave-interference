// Copyright 2026, University of Colorado Boulder

/**
 * Formats the Experiment screen's detector-screen accessible responses for detection-mode switches.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../../../common/model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern } from '../../../common/model/SlitConfiguration.js';
import BandAnalysis from '../../../common/view/description/BandAnalysis.js';
import { formatCompleteIntensityDetectorPatternDescription, formatLiveHitsDescription, formatMeasuredBandSpacingDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';

/**
 * Formats the active Experiment scene's completed intensity detector pattern using its current physics state and full
 * detector width.
 *
 * @param model - Experiment model supplying the active scene
 * @returns localized completed intensity-pattern description
 */
export default function formatExperimentDetectorPatternResponse( model: ExperimentModel ): string {
  const scene = model.sceneProperty.value;
  const analysis = BandAnalysis.analyzeTheoreticalPattern(
    scene,
    scene.fullScreenHalfWidth
  );
  const bandSpacingDescription = model.isRulerVisibleProperty.value && showsDoubleSlitInterferencePattern( model.currentSlitConfigurationProperty.value ) ?
                                 formatMeasuredBandSpacingDescription( analysis.averageSpacingMM ) :
                                 undefined;

  return formatCompleteIntensityDetectorPatternDescription(
    model.currentSlitConfigurationProperty.value,
    analysis,
    bandSpacingDescription
  );
}

/**
 * Formats the live hits-pattern description for the active Experiment scene, based on the current accumulated hit
 * stage. This describes whatever is on the detector screen regardless of whether the source is currently emitting, so
 * leftover hits are still described after the source stops.
 *
 * @param model - Experiment model supplying the active scene
 * @returns localized live hits-pattern description for the current hit stage
 */
export function formatExperimentLiveHitsResponse( model: ExperimentModel ): string {
  const scene = model.sceneProperty.value;
  const isDoubleSlit = showsDoubleSlitInterferencePattern( model.currentSlitConfigurationProperty.value );
  const hitStage = BandAnalysis.getHitStage( model.currentTotalHitsProperty.value );

  // Use the theoretical pattern for spatial descriptions so they remain stable as hits accumulate.
  const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.fullScreenHalfWidth );
  const bandSpacingDescription = isDoubleSlit && model.isRulerVisibleProperty.value ?
                                 formatMeasuredBandSpacingDescription( analysis.averageSpacingMM ) :
                                 undefined;

  // The Experiment screen's slit configuration never represents a no-barrier setup (its type excludes 'noBarrier'),
  // matching the hit-stage response in ExperimentScreenViewDescription.
  return formatLiveHitsDescription(
    hitStage,
    model.currentSlitConfigurationProperty.value,
    analysis,
    bandSpacingDescription
  );
}

/**
 * Formats the detection-mode-switch context response for the Experiment screen's detector screen, describing the
 * current state for the selected mode so the Intensity and Hits buttons stay consistent with each other (and with the
 * High Intensity screen). Empty screens fall back to the shared "Screen is empty. Start particle source." response. In
 * Hits mode, "empty" means no hits have accumulated (totalHits === 0); leftover hits with the source off are still
 * described as the current pattern rather than reported as empty.
 *
 * @param model - Experiment model supplying the active scene state
 * @param mode - the detection mode whose current state should be described
 * @returns localized current-state context response for the selected detection mode
 */
export function formatExperimentDetectorScreenResponse( model: ExperimentModel, mode: DetectionMode ): string {
  const screenEmptyResponse = QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.screenEmptyStringProperty.value;

  return mode === 'intensity' ?
         ( model.currentIsEmittingProperty.value ? formatExperimentDetectorPatternResponse( model ) : screenEmptyResponse ) :
         ( model.currentTotalHitsProperty.value > 0 ? formatExperimentLiveHitsResponse( model ) : screenEmptyResponse );
}
