// Copyright 2026, University of Colorado Boulder

/**
 * Shared detector-screen accessible-description formatting for the live detector screen and snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type WaveDisplayMode } from '../../model/WaveDisplayMode.js';
import { type BandAnalysisResult, type EnvelopeCategory, type HitStage } from './BandAnalysis.js';

export type QuantumWaveInterferencePatternKind = 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier';
export type QuantumWaveInterferencePatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';

type SingleSlitLocationKey = 'leftCovered' | 'rightCovered';

/**
 * Gets the detector-pattern kind used by shared accessible detector-pattern strings.
 * @param slitConfiguration - current slit configuration
 * @returns pattern kind for accessible detector-pattern descriptions
 */
export function getPatternKind( slitConfiguration: SlitConfigurationWithNoBarrier ): QuantumWaveInterferencePatternKind {
  return slitConfiguration === 'bothOpen' ? 'doubleSlitInterference' :
         ( slitConfiguration === 'leftCovered' || slitConfiguration === 'rightCovered' ) ? 'singleSlitDiffraction' :
         slitConfiguration === 'noBarrier' ? 'noBarrier' :
         'whichPathDiffraction';
}

function getSingleSlitLocationKey( slitConfiguration: SlitConfigurationWithNoBarrier ): SingleSlitLocationKey {
  return slitConfiguration === 'leftCovered' ? 'leftCovered' :
         'rightCovered';
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
 * @param slitSetting - current slit setting, used by single-slit branches
 * @param hitStage - current hit accumulation stage
 * @param bandSpacing - qualitative spacing between bright bands
 * @param envelope - qualitative single-slit envelope category; drives whether the pattern reads as a single central
 *   band or as two groups (one across from each slit) when the geometry separates them
 * @returns localized detector-pattern description
 */
export function formatDetectorPatternDescription(
  isEmitting: boolean,
  detectionMode: DetectionMode,
  patternFormation: QuantumWaveInterferencePatternFormation,
  patternKind: QuantumWaveInterferencePatternKind,
  waveDisplayMode: WaveDisplayMode = 'electricField',
  slitSetting: SingleSlitLocationKey = 'rightCovered',
  hitStage: HitStage = 'clear',
  bandSpacing: BandAnalysisResult[ 'spacingCategory' ] = 'somewhatCloseTogether',
  envelope: EnvelopeCategory = 'brightestAtCenter'
): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentState.detectorPattern.format( {
    isEmitting: isEmitting ? 'true' : 'false',
    detectionMode: detectionMode,
    patternFormation: patternFormation,
    patternKind: patternKind,
    waveDisplayMode: waveDisplayMode,
    slitSetting: slitSetting,
    hitStage: hitStage,
    bandSpacing: bandSpacing,
    envelope: envelope
  } );
}

/**
 * Formats the completed intensity detector pattern from the shared Screen 2 detector-pattern string.
 * @param slitConfiguration - current slit configuration
 * @param analysis - analyzed band/spacing data for the visible detector-screen region
 * @returns localized completed detector-pattern description
 */
export function formatCompleteIntensityDetectorPatternDescription(
  slitConfiguration: SlitConfigurationWithNoBarrier,
  analysis: BandAnalysisResult
): string {
  return formatDetectorPatternDescription(
    true,
    'intensity',
    'complete',
    getPatternKind( slitConfiguration ),
    'electricField',
    getSingleSlitLocationKey( slitConfiguration ),
    'clear',
    analysis.spacingCategory,
    analysis.envelopeCategory
  );
}

/**
 * Formats the accessible detector-screen description for intensity mode.
 * @param isDoubleSlit - whether the current slit configuration produces a double-slit interference pattern
 * @param isNoBarrier
 * @param analysis - analyzed band/spacing data for the visible detector-screen region
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatIntensityDescription(
  isDoubleSlit: boolean,
  isNoBarrier: boolean,
  analysis: BandAnalysisResult,
  spatialDescription: string,
  useSharedDetectorPatternDescription = false
): string {
  return isDoubleSlit && useSharedDetectorPatternDescription ?
         formatCompleteIntensityDetectorPatternDescription( 'bothOpen', analysis ) :
         isDoubleSlit ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
           spacing: analysis.spacingCategory,
           envelope: analysis.envelopeCategory
         } ) :
         isNoBarrier ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty.value :
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
           spatialDescription: spatialDescription
         } );
}

/**
 * Formats the accessible detector-screen description for the live detector screen in hits mode.
 * @param hitStage - qualitative stage of accumulated hit formation
 * @param isDoubleSlit - whether the current slit configuration produces a double-slit interference pattern
 * @param isNoBarrier - whether no barrier is between the source and detector screen
 * @param analysis
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatLiveHitsDescription(
  hitStage: HitStage,
  isDoubleSlit: boolean,
  isNoBarrier: boolean,
  analysis: Pick<BandAnalysisResult, 'spacingCategory' | 'envelopeCategory'>,
  spatialDescription = ''
): string {
  if ( hitStage === 'none' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value;
  }
  if ( hitStage === 'few' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value;
  }

  // NOTE: see other duplicate in formatSnapshotHitsDescription below. The live and snapshot descriptions intentionally
  // share the same hit-stage decision tree but target different Fluent strings and count arguments.
  if ( isDoubleSlit ) {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value :
           hitStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty.value :
           hitStage === 'clear' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsClear.format( {
                                  spacing: analysis.spacingCategory
                                } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
  else if ( isNoBarrier ) {
    return ( hitStage === 'emerging' || hitStage === 'developing' || hitStage === 'clear' ) ?
           QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoBarrierStringProperty.value :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
  else {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value :
           ( hitStage === 'developing' || hitStage === 'clear' ) ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClear.format( { spatialDescription: spatialDescription } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
}

/**
 * Formats the accessible detector-screen description for a saved snapshot in hits mode.
 * @param hitStage - qualitative stage of accumulated hit formation
 * @param isDoubleSlit - whether the snapshot slit configuration produces a double-slit interference pattern
 * @param isNoBarrier - whether no barrier is between the source and detector screen in the snapshot
 * @param hitCount - number of hits captured in the snapshot
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatSnapshotHitsDescription(
  hitStage: HitStage,
  isDoubleSlit: boolean,
  isNoBarrier: boolean,
  hitCount: number,
  spatialDescription: string
): string {
  if ( hitStage === 'none' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsNone.format( { hitCount: hitCount } );
  }
  if ( hitStage === 'few' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsFew.format( { hitCount: hitCount } );
  }

  // NOTE: see other duplicate in formatLiveHitsDescription above. The live and snapshot descriptions intentionally
  // share the same hit-stage decision tree but target different Fluent strings and count arguments.
  if ( isDoubleSlit ) {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsEmerging.format( { hitCount: hitCount } ) :
           hitStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsDeveloping.format( {
                                       hitCount: hitCount,
                                       spatialDescription: spatialDescription
                                     } ) :
           hitStage === 'clear' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsClear.format( {
                                  hitCount: hitCount,
                                  spatialDescription: spatialDescription
                                } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
  else if ( isNoBarrier ) {
    return ( hitStage === 'emerging' || hitStage === 'developing' || hitStage === 'clear' ) ?
           QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsNoBarrier.format( { hitCount: hitCount } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
  else {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmerging.format( { hitCount: hitCount } ) :
           ( hitStage === 'developing' || hitStage === 'clear' ) ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClear.format( {
                                                                   hitCount: hitCount,
                                                                   spatialDescription: spatialDescription
                                                                 } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
}
