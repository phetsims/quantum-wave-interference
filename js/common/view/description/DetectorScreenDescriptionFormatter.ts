// Copyright 2026, University of Colorado Boulder

/**
 * Shared detector-screen accessible-description formatting for the live detector screen and snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { millimetersUnit } from '../../../../../scenery-phet/js/units/millimetersUnit.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type WaveDisplayMode } from '../../model/WaveDisplayMode.js';
import { type BandAnalysisResult, type EnvelopeCategory, type HitStage } from './BandAnalysis.js';
import { getPatternKind, type QuantumWaveInterferencePatternKind } from './getPatternKind.js';

export type QuantumWaveInterferencePatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';

const MINIMUM_NUMERIC_BAND_SPACING_MM = 0.1;

/**
 * Formats one of the existing qualitative band-spacing categories for insertion into detector-screen descriptions.
 * @param spacingCategory - qualitative spacing between bright bands from BandAnalysis
 * @returns localized qualitative band-spacing phrase
 */
export function formatQualitativeBandSpacingDescription( spacingCategory: BandAnalysisResult[ 'spacingCategory' ] ): string {
  return QuantumWaveInterferenceFluent.a11y.detectorScreen.bandSpacingDescription.format( {
    spacing: spacingCategory
  } );
}

/**
 * Formats a measured band-spacing phrase for Screen 1 descriptions when the ruler is visible.
 * @param averageSpacingMM - average distance between adjacent bright-band centers, in millimeters
 * @returns localized measured band-spacing phrase
 */
export function formatMeasuredBandSpacingDescription( averageSpacingMM: number ): string {
  if ( averageSpacingMM < MINIMUM_NUMERIC_BAND_SPACING_MM ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.measuredBandSpacingLessThanOneTenthDescriptionStringProperty.value;
  }

  return QuantumWaveInterferenceFluent.a11y.detectorScreen.measuredBandSpacingDescription.format( {
    spacing: millimetersUnit.getAccessibleString( averageSpacingMM, {
      decimalPlaces: 1
    } )
  } );
}

/**
 * Formats the shared detector-pattern description used by Screen 2 context responses and by Screen 1 when it needs
 * the same dynamic wave-pattern wording.
 * @param isEmitting - whether the source is emitting
 * @param detectionMode - current detector mode
 * @param patternFormation - current pattern formation stage
 * @param patternKind - kind of detector pattern produced by the current setup
 * @param waveDisplayMode - current wave display mode; defaults to electric field for callers where the selected
 *   branch does not use wave display mode
 * @param hitStage - current hit accumulation stage
 * @param bandSpacing - qualitative spacing between bright bands
 * @param envelope - qualitative single-slit envelope category; drives whether the pattern reads as a single central
 *   band or as two groups (one across from each slit) when the geometry separates them
 * @param bandSpacingDescription - optional preformatted spacing phrase for ruler-based double-slit steady-state descriptions
 * @param allowDoubleSlitClustering - whether double-slit branches may use envelope-based grouping language
 * @returns localized detector-pattern description
 */
export function formatDetectorPatternDescription(
  isEmitting: boolean,
  detectionMode: DetectionMode,
  patternFormation: QuantumWaveInterferencePatternFormation,
  patternKind: QuantumWaveInterferencePatternKind,
  waveDisplayMode: WaveDisplayMode = 'electricField',
  hitStage: HitStage = 'steadyStatePattern',
  bandSpacing: BandAnalysisResult[ 'spacingCategory' ] = 'somewhatCloseTogether',
  envelope: EnvelopeCategory = 'brightestAtCenter',
  bandSpacingDescription?: string,
  allowDoubleSlitClustering = false
): string {
  if (
    bandSpacingDescription &&
    isEmitting &&
    patternKind === 'doubleSlitInterference' &&
    ( !allowDoubleSlitClustering || envelope === 'brightestAtCenter' )
  ) {
    if ( detectionMode === 'intensity' && patternFormation === 'complete' ) {
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
        spacingDescription: bandSpacingDescription
      } );
    }
    if ( detectionMode === 'hits' && hitStage === 'steadyStatePattern' ) {
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSteadyStatePattern.format( {
        spacingDescription: bandSpacingDescription
      } );
    }
  }

  return QuantumWaveInterferenceFluent.a11y.waveExperimentState.detectorPattern.format( {
    isEmitting: isEmitting ? 'true' : 'false',
    detectionMode: detectionMode,
    patternFormation: patternFormation,
    patternKind: patternKind,
    hitStage: hitStage,
    spacing: bandSpacing,
    envelope: envelope,
    doubleSlitClustering: allowDoubleSlitClustering ? 'true' : 'false'
  } );
}

/**
 * Formats the completed intensity detector pattern from the shared Screen 2 detector-pattern string.
 * @param slitConfiguration - current slit configuration
 * @param analysis - analyzed band/spacing data for the visible detector-screen region
 * @param bandSpacingDescription - optional preformatted spacing phrase for ruler-based descriptions
 * @param allowDoubleSlitClustering - whether double-slit branches may use envelope-based grouping language
 * @returns localized completed detector-pattern description
 */
export function formatCompleteIntensityDetectorPatternDescription(
  slitConfiguration: SlitConfigurationWithNoBarrier,
  analysis: BandAnalysisResult,
  bandSpacingDescription?: string,
  allowDoubleSlitClustering = false
): string {
  return formatDetectorPatternDescription(
    true,
    'intensity',
    'complete',
    getPatternKind( slitConfiguration ),
    'electricField',
    'steadyStatePattern',
    analysis.spacingCategory,
    analysis.envelopeCategory,
    bandSpacingDescription,
    allowDoubleSlitClustering
  );
}

/**
 * Formats the accessible detector-screen description for intensity mode.
 * @param slitConfiguration - current slit configuration
 * @param analysis - analyzed band/spacing data for the visible detector-screen region
 * @param useSharedDetectorPatternDescription - whether to reuse the shared detector-pattern wording
 * @param bandSpacingDescription - optional preformatted spacing phrase for ruler-based descriptions
 * @param allowDoubleSlitClustering - whether double-slit branches may use envelope-based grouping language
 * @returns localized accessible paragraph text
 */
export function formatIntensityDescription(
  slitConfiguration: SlitConfigurationWithNoBarrier,
  analysis: BandAnalysisResult,
  useSharedDetectorPatternDescription = false,
  bandSpacingDescription: string = formatQualitativeBandSpacingDescription( analysis.spacingCategory ),
  allowDoubleSlitClustering = false
): string {
  const isDoubleSlit = getPatternKind( slitConfiguration ) === 'doubleSlitInterference';

  return useSharedDetectorPatternDescription ?
         formatCompleteIntensityDetectorPatternDescription( slitConfiguration, analysis, bandSpacingDescription, allowDoubleSlitClustering ) :
         isDoubleSlit ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
           spacingDescription: bandSpacingDescription
         } ) :
         slitConfiguration === 'noBarrier' ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty.value :
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
           envelope: analysis.envelopeCategory
         } );
}

/**
 * Formats the accessible detector-screen description for the live detector screen in hits mode.
 * @param hitStage - qualitative stage of accumulated hit formation
 * @param slitConfiguration - current slit configuration
 * @param analysis
 * @param bandSpacingDescription - optional preformatted spacing phrase for ruler-based descriptions
 * @param allowDoubleSlitClustering - whether double-slit branches may use envelope-based grouping language
 * @returns localized accessible paragraph text
 */
export function formatLiveHitsDescription(
  hitStage: HitStage,
  slitConfiguration: SlitConfigurationWithNoBarrier,
  analysis: Pick<BandAnalysisResult, 'spacingCategory' | 'envelopeCategory'>,
  bandSpacingDescription: string = formatQualitativeBandSpacingDescription( analysis.spacingCategory ),
  allowDoubleSlitClustering = false
): string {
  if ( hitStage === 'none' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value;
  }
  if ( hitStage === 'few' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value;
  }

  const patternKind = getPatternKind( slitConfiguration );

  if ( patternKind === 'doubleSlitInterference' ) {
    if ( allowDoubleSlitClustering ) {
      return ( hitStage === 'emerging' || hitStage === 'developing' || hitStage === 'steadyStatePattern' ) ?
             formatDetectorPatternDescription(
               true,
               'hits',
               'collectingHits',
               patternKind,
               'electricField',
               hitStage,
               analysis.spacingCategory,
               analysis.envelopeCategory,
               bandSpacingDescription,
               true
             ) :
             ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
    }

    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value :
           hitStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty.value :
           hitStage === 'steadyStatePattern' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSteadyStatePattern.format( {
                                             spacingDescription: bandSpacingDescription
                                           } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
  else {
    return ( hitStage === 'emerging' || hitStage === 'developing' || hitStage === 'steadyStatePattern' ) ?
           formatDetectorPatternDescription(
             true,
             'hits',
             'collectingHits',
             patternKind,
             'electricField',
             hitStage,
             analysis.spacingCategory,
             analysis.envelopeCategory
           ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
}
