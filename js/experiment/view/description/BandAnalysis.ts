// Copyright 2026, University of Colorado Boulder

/**
 * Shared utility for analyzing interference/diffraction patterns in intensity data. Used by both
 * DetectorScreenDescriber and GraphDescriber to extract band counts, peak positions, spacing, and central band width
 * from either accumulated hit bins or theoretical intensity samples.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../../model/SceneModel.js';
import { isDoubleSlitConfiguration, SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import type { Snapshot } from '../../../common/model/Snapshot.js';

// Qualitative stage of hit accumulation, used by describers to select which description string to show and to throttle
// updates so they only fire at pedagogically meaningful thresholds.
export type HitStage = 'none' | 'few' | 'emerging' | 'developing' | 'clear';

// Results from analyzing an intensity distribution.
export type BandAnalysisResult = {
  bandCount: number;

  // Center positions of each detected band, in mm from screen center. Sorted left to right.
  peakPositionsMM: number[];

  // Average spacing between adjacent band centers, in mm. 0 if fewer than 2 bands.
  averageSpacingMM: number;

  // Full width of the central band at the threshold level, in mm.
  centralWidthMM: number;
};

export default class BandAnalysis {

  // Number of bins used when analyzing hit data
  private static readonly ANALYSIS_BIN_COUNT = 200;

  /**
   * Computes band information analytically from the interference/diffraction formula. For double slit,
   * interference maxima occur at y_n = n·λL/d, so the count of visible fringes is 2·floor(screenHalfWidth·d/(λL)) + 1.
   * For single slit (or which-path detector), only the broad central diffraction maximum is reported.
   * This avoids the resolution and smoothing artifacts of numerical peak detection.
   */
  public static analyzeTheoreticalPattern( scene: SceneModel ): BandAnalysisResult {
    return BandAnalysis.computeTheoreticalPattern(
      scene.getEffectiveWavelength(),
      scene.screenDistanceProperty.value,
      scene.screenHalfWidth,
      scene.slitWidth * 1e-3, // mm -> m
      scene.slitSettingProperty.value,
      scene.slitSeparationProperty.value * 1e-3 // mm -> m
    );
  }

  /**
   * Computes band information analytically from a snapshot's stored detector-screen state.
   */
  public static analyzeTheoreticalPatternFromSnapshot( snapshot: Snapshot ): BandAnalysisResult {
    return BandAnalysis.computeTheoreticalPattern(
      snapshot.effectiveWavelength,
      snapshot.screenDistance,
      snapshot.screenHalfWidth,
      SceneModel.getSlitWidth( snapshot.sourceType ) * 1e-3,
      snapshot.slitSetting,
      snapshot.slitSeparation * 1e-3
    );
  }

  /**
   * Shared analytic computation. For double slit, interference maxima occur at y_n = n·λL/d,
   * so the count of visible fringes is 2·floor(screenHalfWidth·d/(λL)) + 1. For single slit (or which-path detector),
   * only the broad central diffraction maximum is reported, with first zeros at y = ±λL/a.
   */
  private static computeTheoreticalPattern(
    lambda: number,
    screenDistanceMeters: number,
    screenHalfWidthM: number,
    slitWidthMeters: number,
    slitSetting: SlitConfigurationWithNoBarrier,
    slitSeparationMeters: number
  ): BandAnalysisResult {
    if ( lambda === 0 ) {
      return { bandCount: 0, peakPositionsMM: [], averageSpacingMM: 0, centralWidthMM: 0 };
    }

    if ( isDoubleSlitConfiguration( slitSetting ) ) {

      // Fringe spacing: Δy = λL/d
      const fringeSpacingM = lambda * screenDistanceMeters / slitSeparationMeters;
      const fringeSpacingMM = fringeSpacingM * 1000;

      // Count fringes visible on screen: central fringe at 0 plus n pairs on each side
      const nMax = Math.floor( screenHalfWidthM / fringeSpacingM );
      const bandCount = 2 * nMax + 1;

      const peakPositionsMM: number[] = [];
      for ( let n = -nMax; n <= nMax; n++ ) {
        peakPositionsMM.push( n * fringeSpacingMM );
      }

      return {
        bandCount: bandCount,
        peakPositionsMM: peakPositionsMM,
        averageSpacingMM: fringeSpacingMM,
        centralWidthMM: fringeSpacingMM
      };
    }
    else {

      // Single slit or which-path detector: broad central diffraction maximum.
      const centralHalfWidthM = lambda * screenDistanceMeters / slitWidthMeters;
      const centralWidthMM = 2 * centralHalfWidthM * 1000;

      return {
        bandCount: 1,
        peakPositionsMM: [ 0 ],
        averageSpacingMM: 0,
        centralWidthMM: centralWidthMM
      };
    }
  }

  /**
   * Returns the qualitative hit stage for the current number of accumulated hits.
   * Double-slit patterns require more hits to resolve (extra 'developing' stage at 51–200) because interference
   * fringes are finer than the broad single-slit diffraction envelope.
   */
  public static getHitStage( totalHits: number, isDoubleSlit: boolean ): HitStage {
    if ( totalHits === 0 ) { return 'none'; }
    if ( totalHits <= 10 ) { return 'few'; }
    if ( totalHits <= 50 ) { return 'emerging'; }
    if ( isDoubleSlit && totalHits <= 200 ) { return 'developing'; }
    return 'clear';
  }

  /**
   * Formats a spatial description for bands/peaks using either ruler-anchored or relative terms.
   * @param analysis - result from analyzeHitBins or analyzeTheoreticalPattern
   * @param isDoubleSlit - true for double-slit (interference fringes), false for single slit
   * @param isRulerVisible - whether the ruler is currently shown
   * @param usePeakLanguage - true for graph descriptions ("peaks"), false for screen descriptions ("bands")
   */
  public static formatSpatialDescription(
    analysis: BandAnalysisResult, isDoubleSlit: boolean, isRulerVisible: boolean, usePeakLanguage: boolean
  ): string {
    return BandAnalysis.formatSpatialDescriptionWithStyle( analysis, isDoubleSlit, isRulerVisible, usePeakLanguage, true );
  }

  /**
   * Formats only the relative/measurement arrangement of the visible double-slit bands/peaks. This supports
   * descriptions that mention the band count elsewhere in the same sentence.
   */
  public static formatSpatialArrangementDescription(
    analysis: BandAnalysisResult, isDoubleSlit: boolean, isRulerVisible: boolean, usePeakLanguage: boolean
  ): string {
    return BandAnalysis.formatSpatialDescriptionWithStyle( analysis, isDoubleSlit, isRulerVisible, usePeakLanguage, false );
  }

  private static formatSpatialDescriptionWithStyle(
    analysis: BandAnalysisResult,
    isDoubleSlit: boolean,
    isRulerVisible: boolean,
    usePeakLanguage: boolean,
    includeDoubleSlitCount: boolean
  ): string {
    if ( analysis.bandCount === 0 ) {
      return '';
    }

    const style = usePeakLanguage ? 'peaks' : 'bands';
    const hasRulerMeasurement = isRulerVisible &&
                                ( isDoubleSlit ? analysis.averageSpacingMM > 0 : analysis.centralWidthMM > 0 );

    if ( isDoubleSlit ) {
      if ( hasRulerMeasurement ) {
        return includeDoubleSlitCount ?
               QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerDoubleSlit.format( {
                 style: style,
                 count: analysis.bandCount,
                 spacing: toFixed( analysis.averageSpacingMM, 1 )
               } ) :
               QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerDoubleSlitArrangement.format( {
                 style: style,
                 spacing: toFixed( analysis.averageSpacingMM, 1 )
               } );
      }
      else {
        return includeDoubleSlitCount ?
               QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerDoubleSlit.format( {
                 style: style,
                 count: analysis.bandCount
               } ) :
               QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerDoubleSlitArrangement.format( {
                 style: style
               } );
      }
    }
    else {
      if ( hasRulerMeasurement ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerSingleSlit.format( {
          style: style,
          centralWidth: toFixed( analysis.centralWidthMM, 1 )
        } );
      }
      else {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerSingleSlit.format( {
          style: style
        } );
      }
    }
  }
}
