// Copyright 2026, University of Colorado Boulder

/**
 * Shared utility for analyzing interference/diffraction patterns in intensity data. Used by both
 * DetectorScreenDescriber and GraphDescriber to extract band counts, peak positions, spacing, and central band width
 * from either accumulated hit bins or theoretical intensity samples.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { clamp } from '../../../../../dot/js/util/clamp.js';
import { millimetersUnit } from '../../../../../scenery-phet/js/units/millimetersUnit.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDisplaySlitLayout } from '../../getDisplaySlitLayout.js';
import { hasAnyDetector, showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import type { Snapshot } from '../../model/Snapshot.js';

// Structural interface satisfied by both the Experiment screen scene (which exposes an explicit
// screenDistanceProperty) and the High Intensity / Single Particles scenes (which derive screen
// distance from regionWidth × barrierPositionFractionProperty).
// All length quantities are in mm unless otherwise noted. The two discriminated branches
// reflect the two concrete model types; callers must narrow via 'screenDistanceProperty' in scene.
type TheoreticalPatternScene = {
  getEffectiveWavelength(): number;
  slitWidth: number;
  slitSeparationProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
  slitSeparationRange?: { min: number; max: number };
  regionHeight?: number;
} & (
  {
    screenDistanceProperty: TReadOnlyProperty<number>;
  } | {
  regionWidth: number;
  barrierPositionFractionProperty: TReadOnlyProperty<number>;
} );

// Qualitative stage of hit accumulation, used by describers to select which description string to show and to throttle
// updates so they only fire at pedagogically meaningful thresholds.
export type HitStage = 'none' | 'few' | 'emerging' | 'developing' | 'clear';

// Seven-point qualitative scale for the spacing between adjacent double-slit bright bands,
// expressed as a fraction of the total detector-screen width. Used by describers to select
// the appropriate Fluent string for screen-reader output.
export type BandSpacingCategory = 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether';

// Three-point qualitative scale describing how the single-slit diffraction envelope shapes
// the double-slit interference pattern. 'brightestAtCenter' means the envelope is broad
// and all fringes appear roughly equal; the clustering variants indicate the envelope
// minima have moved inward enough to visibly group fringes into two dimmer side lobes.
export type EnvelopeCategory = 'brightestAtCenter' | 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections';

// Intermediate quantities produced by analyzeEnvelopeHeuristic. Exposed as a type so
// callers (e.g. High Intensity state logging) can inspect individual values for debugging
// without re-running the heuristic.
export type EnvelopeHeuristicAnalysis = {
  category: EnvelopeCategory;

  // Composite heuristic score driving the category thresholds (dimensionless). Higher
  // values indicate the envelope is more strongly grouping fringes into side lobes.
  score: number;

  // Dimensionless Fresnel-like separation: d_display² / (λ · L), where d_display is the
  // display-coordinate slit separation, λ is the effective wavelength (m), and L is the
  // slit-to-screen distance (m). Captures the ratio of geometric slit spacing to the
  // diffraction scale.
  fresnelSeparation: number;

  // Dimensionless ratio d_display / L. Measures how oblique the geometry is; large values
  // push the single-slit envelope minima toward the central fringe region.
  geometryRatio: number;

  // Smooth-step gate in [0, 1] applied to fresnelSeparation to suppress the envelope
  // effect at small geometryRatio values where the paraxial approximation holds well.
  geometryGate: number;

  // Slit-to-screen distance in meters.
  slitToScreenDistance: number;

  // Effective slit separation in display-model coordinates (same units as regionHeight).
  displaySlitSeparation: number;

  // Effective wavelength in meters used for this computation.
  effectiveWavelength: number;
};

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

const ENVELOPE_GEOMETRY_GATE_START = 0.45;
const ENVELOPE_GEOMETRY_GATE_END = 1.25;
const FAINT_SECTIONS_ENVELOPE_SCORE = 1.5;
const DISTINCT_SECTIONS_ENVELOPE_SCORE = 6;

function smoothStep( edge0: number, edge1: number, value: number ): number {
  const t = clamp( ( value - edge0 ) / ( edge1 - edge0 ), 0, 1 );
  return t * t * ( 3 - 2 * t );
}

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

function getEnvelopeCategory( envelopeScore: number ): EnvelopeCategory {
  return envelopeScore < FAINT_SECTIONS_ENVELOPE_SCORE ? 'brightestAtCenter' :
         envelopeScore < DISTINCT_SECTIONS_ENVELOPE_SCORE ? 'clusteringIntoTwoFaintSections' :
         'clusteringIntoTwoDistinctSections';
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
  private static analyzeEnvelopeHeuristic( scene: TheoreticalPatternScene ): EnvelopeHeuristicAnalysis | null {
    const lambda = scene.getEffectiveWavelength();
    const slitToScreenDistance = 'screenDistanceProperty' in scene ?
                                 scene.screenDistanceProperty.value :
                                 ( 1 - scene.barrierPositionFractionProperty.value ) * scene.regionWidth;

    if (
      lambda <= 0 ||
      slitToScreenDistance <= 0 ||
      scene.regionHeight === undefined ||
      scene.slitSeparationRange === undefined
    ) {
      return null;
    }

    const displaySlitSeparation = getDisplaySlitLayout(
      scene.slitSeparationProperty.value * 1e-3,
      scene.slitSeparationRange.min * 1e-3,
      scene.slitSeparationRange.max * 1e-3,
      scene.regionHeight
    ).displaySlitSeparation;

    const fresnelSeparation = displaySlitSeparation * displaySlitSeparation /
                              ( lambda * slitToScreenDistance );
    const geometryRatio = displaySlitSeparation / slitToScreenDistance;
    const geometryGate = smoothStep( ENVELOPE_GEOMETRY_GATE_START, ENVELOPE_GEOMETRY_GATE_END, geometryRatio );
    const score = fresnelSeparation * geometryGate;

    return {
      category: getEnvelopeCategory( score ),
      score: score,
      fresnelSeparation: fresnelSeparation,
      geometryRatio: geometryRatio,
      geometryGate: geometryGate,
      slitToScreenDistance: slitToScreenDistance,
      displaySlitSeparation: displaySlitSeparation,
      effectiveWavelength: lambda
    };
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
      'brightestAtCenter'
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

  // Pure formatter; live describers subscribe to physics, ruler, zoom, hit-stage, and Fluent-bundle changes before
  // calling this helper. Snapshot descriptions call it from immutable snapshot state.
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
                 spacing: millimetersUnit.getAccessibleString( analysis.averageSpacingMM, {
                   decimalPlaces: 1
                 } )
               } ) :
               QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerDoubleSlitArrangement.format( {
                 style: style,
                 spacing: millimetersUnit.getAccessibleString( analysis.averageSpacingMM, {
                   decimalPlaces: 1
                 } )
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
          centralWidth: millimetersUnit.getAccessibleString( analysis.centralWidthMM, {
            decimalPlaces: 1
          } )
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
