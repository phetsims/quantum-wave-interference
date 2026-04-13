// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative description structure as
 * the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { isDoubleSlitConfiguration } from '../../model/SlitConfiguration.js';
import Snapshot from '../../model/Snapshot.js';
import BandAnalysis from './BandAnalysis.js';

export default class SnapshotDescriber {

  public static getDescription( snapshot: Snapshot ): string {
    const isDoubleSlit = isDoubleSlitConfiguration( snapshot.slitSetting );

    if ( snapshot.detectionMode === 'averageIntensity' ) {
      if ( !snapshot.isEmitting ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );
      const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

      return isDoubleSlit ?
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( {
               spatialDescription: spatialDescription
             } ) :
             QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( {
               spatialDescription: spatialDescription
             } );
    }

    const hitCount = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( hitCount, isDoubleSlit );
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );
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
