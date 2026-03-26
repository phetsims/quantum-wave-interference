// Copyright 2026, University of Colorado Boulder

/**
 * Shared utility for analyzing interference/diffraction patterns in intensity data.
 * Used by both DetectorScreenDescriber and GraphDescriber to extract band counts,
 * peak positions, spacing, and central band width from either accumulated hit bins
 * or theoretical intensity samples.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../../../dot/js/Utils.js';
import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../../model/SceneModel.js';

// Qualitative stage of hit accumulation, used by describers to select which description
// string to show and to throttle updates so they only fire at pedagogically meaningful thresholds.
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

  /**
   * Analyzes the accumulated intensity bins to extract band information.
   * Used for hits-mode descriptions where data comes from accumulated detections.
   */
  public static analyzeHitBins( scene: SceneModel ): BandAnalysisResult {
    return BandAnalysis.analyzeArray(
      scene.intensityBins, scene.intensityBinsMax, scene.screenHalfWidth * 1000
    );
  }

  /**
   * Computes band information analytically from the interference/diffraction formula.
   * For double slit, interference maxima occur at y_n = n·λL/d, so the count of visible
   * fringes is 2·floor(screenHalfWidth·d/(λL)) + 1. For single slit (or which-path detector),
   * only the broad central diffraction maximum is reported. This avoids the resolution and
   * smoothing artifacts of numerical peak detection.
   */
  public static analyzeTheoreticalPattern( scene: SceneModel ): BandAnalysisResult {
    const lambda = scene.getEffectiveWavelength(); // m
    if ( lambda === 0 ) {
      return { bandCount: 0, peakPositionsMM: [], averageSpacingMM: 0, centralWidthMM: 0 };
    }

    const L = scene.screenDistanceProperty.value; // m
    const screenHalfWidthM = scene.screenHalfWidth;
    const a = scene.slitWidth * 1e-3; // mm → m
    const slitSetting = scene.slitSettingProperty.value;

    if ( slitSetting === 'bothOpen' ) {
      const d = scene.slitSeparationProperty.value * 1e-3; // mm → m

      // Fringe spacing: Δy = λL/d
      const fringeSpacingM = lambda * L / d;
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
      // First zeros at y = ±λL/a, so central width ≈ 2λL/a.
      const centralHalfWidthM = lambda * L / a;
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
   * Core analysis: smooth the data, find peaks, compute positions and spacing.
   * @param data - array of values (bin counts or intensity samples)
   * @param dataMax - maximum value in the array
   * @param screenHalfWidthMM - half-width of the detector screen in mm
   */
  private static analyzeArray(
    data: number[], dataMax: number, screenHalfWidthMM: number, thresholdFraction = 0.2
  ): BandAnalysisResult {
    const empty: BandAnalysisResult = {
      bandCount: 0, peakPositionsMM: [], averageSpacingMM: 0, centralWidthMM: 0
    };

    if ( dataMax === 0 ) {
      return empty;
    }

    const numBins = data.length;

    // Smooth with a moving average to filter out noise.
    const windowSize = 7;
    const halfWindow = ( windowSize - 1 ) / 2;
    const smoothed = new Array( numBins ).fill( 0 );
    let smoothedMax = 0;

    for ( let i = 0; i < numBins; i++ ) {
      let sum = 0;
      let count = 0;
      for ( let j = Math.max( 0, i - halfWindow ); j <= Math.min( numBins - 1, i + halfWindow ); j++ ) {
        sum += data[ j ];
        count++;
      }
      smoothed[ i ] = sum / count;
      if ( smoothed[ i ] > smoothedMax ) {
        smoothedMax = smoothed[ i ];
      }
    }

    if ( smoothedMax === 0 ) {
      return empty;
    }

    // A region is considered "bright" if it exceeds the threshold fraction of the smoothed peak.
    const threshold = smoothedMax * thresholdFraction;

    // Identify contiguous bright regions and record their weighted-center positions.
    const peakPositionsMM: number[] = [];
    let bandStart = -1;

    for ( let i = 0; i <= numBins; i++ ) {
      const inBand = i < numBins && smoothed[ i ] >= threshold;
      if ( inBand && bandStart === -1 ) {
        bandStart = i;
      }
      else if ( !inBand && bandStart !== -1 ) {
        let weightedSum = 0;
        let totalWeight = 0;
        for ( let j = bandStart; j < i; j++ ) {
          weightedSum += j * smoothed[ j ];
          totalWeight += smoothed[ j ];
        }
        const centerBin = totalWeight > 0 ? weightedSum / totalWeight : ( bandStart + i - 1 ) / 2;
        const fraction = centerBin / ( numBins - 1 );
        const positionMM = ( fraction - 0.5 ) * 2 * screenHalfWidthMM;
        peakPositionsMM.push( positionMM );
        bandStart = -1;
      }
    }

    const bandCount = peakPositionsMM.length;

    // Average spacing between adjacent bands.
    let averageSpacingMM = 0;
    if ( bandCount >= 2 ) {
      let totalSpacing = 0;
      for ( let i = 1; i < bandCount; i++ ) {
        totalSpacing += peakPositionsMM[ i ] - peakPositionsMM[ i - 1 ];
      }
      averageSpacingMM = totalSpacing / ( bandCount - 1 );
    }

    // Width of the central band (closest to 0 mm) at the threshold level.
    let centralWidthMM = 0;
    if ( bandCount > 0 ) {
      let closestIndex = 0;
      let closestDistance = Math.abs( peakPositionsMM[ 0 ] );
      for ( let i = 1; i < bandCount; i++ ) {
        const dist = Math.abs( peakPositionsMM[ i ] );
        if ( dist < closestDistance ) {
          closestDistance = dist;
          closestIndex = i;
        }
      }

      const centerBin = Utils.roundSymmetric(
        ( peakPositionsMM[ closestIndex ] / ( 2 * screenHalfWidthMM ) + 0.5 ) * ( numBins - 1 )
      );
      let left = centerBin;
      let right = centerBin;
      while ( left > 0 && smoothed[ left - 1 ] >= threshold ) { left--; }
      while ( right < numBins - 1 && smoothed[ right + 1 ] >= threshold ) { right++; }
      centralWidthMM = ( right - left ) / ( numBins - 1 ) * 2 * screenHalfWidthMM;
    }

    return {
      bandCount: bandCount,
      peakPositionsMM: peakPositionsMM,
      averageSpacingMM: averageSpacingMM,
      centralWidthMM: centralWidthMM
    };
  }

  /**
   * Returns the qualitative hit stage for the current number of accumulated hits.
   * Double-slit patterns require more hits to resolve (extra 'developing' stage at 51–200)
   * because interference fringes are finer than the broad single-slit diffraction envelope.
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
    if ( analysis.bandCount === 0 ) {
      return '';
    }

    if ( usePeakLanguage ) {
      if ( isDoubleSlit ) {
        if ( isRulerVisible && analysis.averageSpacingMM > 0 ) {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerPeaks.format( {
            numPeaks: analysis.bandCount,
            peakSpacing: toFixed( analysis.averageSpacingMM, 1 )
          } );
        }
        else {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerPeaks.format( { numPeaks: analysis.bandCount } );
        }
      }
      else {
        if ( isRulerVisible && analysis.centralWidthMM > 0 ) {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerPeaksSingleSlit.format( {
            centralWidth: toFixed( analysis.centralWidthMM, 1 )
          } );
        }
        else {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerPeaksSingleSlitStringProperty.value;
        }
      }
    }
    else {
      if ( isDoubleSlit ) {
        if ( isRulerVisible && analysis.averageSpacingMM > 0 ) {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerBands.format( {
            numBands: analysis.bandCount,
            bandSpacing: toFixed( analysis.averageSpacingMM, 1 )
          } );
        }
        else {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerBands.format( { numBands: analysis.bandCount } );
        }
      }
      else {
        if ( isRulerVisible && analysis.centralWidthMM > 0 ) {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.rulerBandsSingleSlit.format( {
            centralWidth: toFixed( analysis.centralWidthMM, 1 )
          } );
        }
        else {
          return QuantumWaveInterferenceFluent.a11y.detectorScreen.spatialDescription.noRulerBandsSingleSlitStringProperty.value;
        }
      }
    }
  }
}
