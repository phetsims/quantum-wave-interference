// Copyright 2026, University of Colorado Boulder

/**
 * Shared detector-screen accessible-description formatting for the live detector screen and snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type BandAnalysisResult, type HitStage } from './BandAnalysis.js';

/**
 * Formats the accessible detector-screen description for average-intensity mode.
 * @param isDoubleSlit - whether the current slit configuration produces a double-slit interference pattern
 * @param analysis - analyzed band/spacing data for the visible detector-screen region
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatIntensityDescription(
  isDoubleSlit: boolean,
  analysis: BandAnalysisResult,
  spatialDescription: string
): string {
  return isDoubleSlit ?
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
           bandCount: analysis.bandCount,
           spatialDescription: spatialDescription
         } ) :
         QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
           spatialDescription: spatialDescription
         } );
}

/**
 * Formats the accessible detector-screen description for the live detector screen in hits mode.
 * @param hitStage - qualitative stage of accumulated hit formation
 * @param isDoubleSlit - whether the current slit configuration produces a double-slit interference pattern
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatLiveHitsDescription(
  hitStage: HitStage,
  isDoubleSlit: boolean,
  spatialDescription: string
): string {
  if ( hitStage === 'none' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value;
  }
  if ( hitStage === 'few' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value;
  }

  if ( isDoubleSlit ) {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value :
           hitStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDeveloping.format( { spatialDescription: spatialDescription } ) :
           hitStage === 'clear' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsClear.format( { spatialDescription: spatialDescription } ) :
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
 * @param hitCount - number of hits captured in the snapshot
 * @param spatialDescription - localized spatial description of the visible pattern
 * @returns localized accessible paragraph text
 */
export function formatSnapshotHitsDescription(
  hitStage: HitStage,
  isDoubleSlit: boolean,
  hitCount: number,
  spatialDescription: string
): string {
  if ( hitStage === 'none' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsNone.format( { hitCount: hitCount } );
  }
  if ( hitStage === 'few' ) {
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsFew.format( { hitCount: hitCount } );
  }

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
  else {
    return hitStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmerging.format( { hitCount: hitCount } ) :
           ( hitStage === 'developing' || hitStage === 'clear' ) ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClear.format( {
             hitCount: hitCount,
             spatialDescription: spatialDescription
                                                                 } ) :
           ( () => { throw new Error( `Unrecognized hitStage: ${hitStage}` ); } )();
  }
}
