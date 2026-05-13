// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative description structure as
 * the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';
import { showsDoubleSlitInterferencePattern } from '../../../common/model/SlitConfiguration.js';
import type { Snapshot } from '../../../common/model/Snapshot.js';
import BandAnalysis from './BandAnalysis.js';

export default class SnapshotDescriber {

  public static getDescription( snapshot: Snapshot, detectorScreenScaleIndex: number ): string {
    const isDoubleSlit = showsDoubleSlitInterferencePattern( snapshot.slitSetting );
    const screenHalfWidth = getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndex );

    if ( snapshot.detectionMode === 'averageIntensity' ) {
      if ( !snapshot.isEmitting ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot, screenHalfWidth );
      const spatialDescription = isDoubleSlit ?
                                 BandAnalysis.formatSpatialArrangementDescription( analysis, isDoubleSlit, false, false ) :
                                 BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

      //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Same as DetectorScreenDescriber line 62
      return isDoubleSlit ?
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
               bandCount: analysis.bandCount,
               spatialDescription: spatialDescription
             } ) :
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
               spatialDescription: spatialDescription
             } );
    }

    const hitCount = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( hitCount, isDoubleSlit );
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot, screenHalfWidth );
    const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

    if ( isDoubleSlit ) {
      if ( hitStage === 'none' ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsNone.format( { hitCount: hitCount } );
      }
      if ( hitStage === 'few' ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsFew.format( { hitCount: hitCount } );
      }
      if ( hitStage === 'emerging' ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsEmerging.format( { hitCount: hitCount } );
      }
      if ( hitStage === 'developing' ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsDeveloping.format( {
          hitCount: hitCount,
          spatialDescription: spatialDescription
        } );
      }
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsClear.format( {
        hitCount: hitCount,
        spatialDescription: spatialDescription
      } );
    }

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Lots of duplication here with if statements starting at line 70.
    if ( hitStage === 'none' ) {
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsNone.format( { hitCount: hitCount } );
    }
    if ( hitStage === 'few' ) {
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsFew.format( { hitCount: hitCount } );
    }
    if ( hitStage === 'emerging' ) {
      return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmerging.format( { hitCount: hitCount } );
    }
    return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClear.format( {
      hitCount: hitCount,
      spatialDescription: spatialDescription
    } );
  }
}
