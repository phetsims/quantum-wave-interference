// Copyright 2026, University of Colorado Boulder

/**
 * Formats the Experiment screen's completed intensity pattern for accessible responses.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BandAnalysis from '../../../common/view/description/BandAnalysis.js';
import { formatCompleteIntensityDetectorPatternDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';

/**
 * Formats the active Experiment scene's detector pattern using its current physics state and detector-screen zoom.
 *
 * @param model - Experiment model supplying the active scene and detector-screen scale
 * @returns localized completed intensity-pattern description
 */
export default function formatExperimentDetectorPatternResponse( model: ExperimentModel ): string {
  const scene = model.sceneProperty.value;
  const analysis = BandAnalysis.analyzeTheoreticalPattern(
    scene,
    getDetectorScreenHalfWidthForScaleIndex( model.detectorScreenScaleIndexProperty.value )
  );

  return formatCompleteIntensityDetectorPatternDescription( model.currentSlitConfigurationProperty.value, analysis );
}
