// Copyright 2026, University of Colorado Boulder

/**
 * Shared utility for analyzing interference/diffraction patterns in intensity data. Used by both
 * DetectorScreenDescriber and GraphDescriber to extract band counts, peak positions, spacing, and central band width
 * from either accumulated hit bins or theoretical intensity samples.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { millimetersUnit } from '../../../../../scenery-phet/js/units/millimetersUnit.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { analyzeEnvelopeHeuristic, type EnvelopeCategory, type EnvelopeHeuristicAnalysis, type EnvelopeHeuristicScene } from '../../model/DetectorPatternEnvelope.js';
import { hasAnyDetector, showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import type { Snapshot } from '../../model/Snapshot.js';

/**
 * Structural interface satisfied by both the Experiment screen scene (which exposes an explicit
 * screenDistanceProperty) and the High Intensity / Single Particles scenes (which derive screen
 * distance from regionWidth × barrierPositionFractionProperty).
 * All length quantities are in mm unless otherwise noted. The two discriminated branches
 * reflect the two concrete model types; callers must narrow via 'screenDistanceProperty' in scene.
 */
type TheoreticalPatternScene = {
  getEffectiveWavelength(): number;
  slitWidth: number;
  slitSeparationProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
  slitSeparationRange?: { min: number; max: number };
  regionHeight?: number;
} & EnvelopeHeuristicScene;

// Qualitative stage of hit accumulation, used by describers to select which description string to show and to throttle
// updates so they only fire at pedagogically meaningful thresholds.
export type HitStage = 'none' | 'few' | 'emerging' | 'developing' | 'steadyStatePattern';

type NonEmptyHitStage = Exclude<HitStage, 'none'>;

type HitStageThreshold = {

  // Inclusive minimum number of hits needed to use this stage.
  minimumHits: number;
  hitStage: NonEmptyHitStage;
};

// Hit-stage thresholds, as inclusive minima:
// 1+   few        individual scattered hits
// 188+ emerging   faint bands begin forming
// 300+ developing bands become more distinct
// 563+ steadyStatePattern stable band-spacing description, filled from the current geometry
const HIT_STAGE_THRESHOLDS: readonly HitStageThreshold[] = [
  { minimumHits: 1, hitStage: 'few' },
  { minimumHits: 188, hitStage: 'emerging' },
  { minimumHits: 300, hitStage: 'developing' },
  { minimumHits: 563, hitStage: 'steadyStatePattern' }
];

// Seven-point qualitative scale for the spacing between adjacent double-slit bright bands,
// expressed as a fraction of the total detector-screen width. Used by describers to select
// the appropriate Fluent string for screen-reader output.
export type BandSpacingCategory = 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether';

export type { EnvelopeCategory, EnvelopeHeuristicAnalysis };

// Results from analyzing an intensity distribution.
export type BandAnalysisResult = {
  bandCount: number;

  // Center positions of each detected band, in mm from screen center. Sorted left to right.
  peakPositionsMM: number[];

  // Average spacing between adjacent band centers, in mm. 0 if fewer than 2 bands.
  averageSpacingMM: number;

  // Full width of the central band at the threshold level, in mm.
  centralWidthMM: number;

  // Full detector-screen width in mm. Used for qualitative spacing descriptions.
  screenWidthMM: number;

  // Qualitative description of the average spacing between adjacent double-slit bright bands.
  spacingCategory: BandSpacingCategory;

  // Qualitative description of the single-slit envelope shaping the double-slit pattern.
  envelopeCategory: EnvelopeCategory;
};

function getSpacingCategory( averageSpacingMM: number, screenWidthMM: number ): BandSpacingCategory {
  const spacingFraction = screenWidthMM > 0 ? averageSpacingMM / screenWidthMM : 0;

  // Keep the default double-slit photon pattern in the middle of this seven-point scale.
  return spacingFraction >= 0.5 ? 'extremelyFarApart' :
         spacingFraction >= 0.33 ? 'veryFarApart' :
         spacingFraction >= 0.16 ? 'farApart' :
         spacingFraction >= 0.08 ? 'somewhatCloseTogether' :
         spacingFraction >= 0.05 ? 'closeTogether' :
         spacingFraction >= 0.03 ? 'veryCloseTogether' :
         'extremelyCloseTogether';
}

function getHitStageFromThresholds( totalHits: number, thresholds: readonly HitStageThreshold[] ): HitStage {
  for ( let i = thresholds.length - 1; i >= 0; i-- ) {
    if ( totalHits >= thresholds[ i ].minimumHits ) {
      return thresholds[ i ].hitStage;
    }
  }

  return 'none';
}

export default class BandAnalysis {

  /**
   * Computes band information analytically from the interference/diffraction formula. For double slit,
   * interference maxima occur at y_n = n·λL/d, so the count of visible fringes is 2·floor(screenHalfWidth·d/(λL)) + 1.
   * For single slit (or which-path detector), only the broad central diffraction maximum is reported.
   * This avoids the resolution and smoothing artifacts of numerical peak detection.
   */
  public static analyzeTheoreticalPattern( scene: TheoreticalPatternScene, screenHalfWidth: number ): BandAnalysisResult {
    const screenDistance = 'screenDistanceProperty' in scene ?
                           scene.screenDistanceProperty.value :
                           ( 1 - scene.barrierPositionFractionProperty.value ) * scene.regionWidth;
    const slitSetting = scene.slitConfigurationProperty.value;

    return BandAnalysis.computeTheoreticalPattern(
      scene.getEffectiveWavelength(),
      screenDistance,
      screenHalfWidth,
      scene.slitWidth * 1e-3, // mm -> m
      slitSetting,
      scene.slitSeparationProperty.value * 1e-3, // mm -> m
      BandAnalysis.analyzeEnvelopeHeuristic( scene )?.category || 'brightestAtCenter'
    );
  }

  /**
   * Computes the qualitative single-slit envelope category used for double-slit detector-screen descriptions.
   * This is shared by the live detector-screen paragraph and High Intensity accessible-state logging so both report
   * the same category for the same model state.
   *
   * @param scene - scene supplying front-facing detector-screen geometry
   * @returns detailed envelope heuristic analysis, or null when the scene cannot support the front-facing heuristic
   */
  public static analyzeEnvelopeHeuristic( scene: TheoreticalPatternScene ): EnvelopeHeuristicAnalysis | null {
    return analyzeEnvelopeHeuristic( scene );
  }

  /**
   * Computes band information analytically from a snapshot's stored detector-screen state.
   */
  public static analyzeTheoreticalPatternFromSnapshot(
    snapshot: Snapshot,
    screenHalfWidth = snapshot.screenHalfWidth
  ): BandAnalysisResult {
    return BandAnalysis.computeTheoreticalPattern(
      snapshot.effectiveWavelength,
      snapshot.screenDistance,
      screenHalfWidth,
      snapshot.slitWidth * 1e-3,
      snapshot.slitSetting,
      snapshot.slitSeparation * 1e-3,
      snapshot.envelopeCategory
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
    slitSeparationMeters: number,
    envelopeCategory: EnvelopeCategory
  ): BandAnalysisResult {
    const screenWidthMM = screenHalfWidthM * 2000;

    if ( lambda === 0 ) {
      return {
        bandCount: 0,
        peakPositionsMM: [],
        averageSpacingMM: 0,
        centralWidthMM: 0,
        screenWidthMM: screenWidthMM,
        spacingCategory: 'extremelyCloseTogether',
        envelopeCategory: 'brightestAtCenter'
      };
    }

    if ( showsDoubleSlitInterferencePattern( slitSetting ) ) {

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
        centralWidthMM: fringeSpacingMM,
        screenWidthMM: screenWidthMM,
        spacingCategory: getSpacingCategory( fringeSpacingMM, screenWidthMM ),
        envelopeCategory: envelopeCategory
      };
    }
    else {

      // Single slit or which-path detector: broad central diffraction maximum.
      const centralHalfWidthM = lambda * screenDistanceMeters / slitWidthMeters;
      const centralWidthMM = 2 * centralHalfWidthM * 1000;

      // A genuinely covered slit always shows a single central diffraction lobe. The which-path detector case keeps
      // both slits open, so its two un-interfered single-slit beams can split into two groups as the geometry
      // separates them; surface the heuristic envelope category so describers can report the clustering.
      return {
        bandCount: 1,
        peakPositionsMM: [ 0 ],
        averageSpacingMM: 0,
        centralWidthMM: centralWidthMM,
        screenWidthMM: screenWidthMM,
        spacingCategory: 'extremelyFarApart',
        envelopeCategory: hasAnyDetector( slitSetting ) ? envelopeCategory : 'brightestAtCenter'
      };
    }
  }

  /**
   * Returns the qualitative hit stage for the current number of accumulated hits.
   * @param totalHits - number of accumulated detector hits
   */
  public static getHitStage( totalHits: number ): HitStage {
    return getHitStageFromThresholds( totalHits, HIT_STAGE_THRESHOLDS );
  }

  /**
   * Formats a spatial description of the graph peaks using either ruler-anchored or relative terms.
   *
   * Pure formatter; live describers subscribe to physics, ruler, zoom, hit-stage, and Fluent-bundle changes before
   * calling this helper.
   *
   * @param analysis - result from analyzeHitBins or analyzeTheoreticalPattern
   * @param isDoubleSlit - true for double-slit (interference fringes), false for single slit
   * @param isRulerVisible - whether the ruler is currently shown
   */
  public static formatSpatialDescription(
    analysis: BandAnalysisResult, isDoubleSlit: boolean, isRulerVisible: boolean
  ): string {
    if ( analysis.bandCount === 0 ) {
      return '';
    }

    const hasRulerMeasurement = isRulerVisible &&
                                ( isDoubleSlit ? analysis.averageSpacingMM > 0 : analysis.centralWidthMM > 0 );

    if ( isDoubleSlit ) {
      return hasRulerMeasurement ?
             QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerDoubleSlit.format( {
               count: analysis.bandCount,
               spacing: millimetersUnit.getAccessibleString( analysis.averageSpacingMM, {
                 decimalPlaces: 1
               } )
             } ) :
             QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerDoubleSlit.format( {
               count: analysis.bandCount
             } );
    }
    else {
      return hasRulerMeasurement ?
             QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerSingleSlit.format( {
               centralWidth: millimetersUnit.getAccessibleString( analysis.centralWidthMM, {
                 decimalPlaces: 1
               } )
             } ) :
             QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerSingleSlitStringProperty.value;
    }
  }
}
