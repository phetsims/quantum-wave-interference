// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative description structure as
 * the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { showsDoubleSlitInterferencePattern } from '../../../common/model/SlitConfiguration.js';
import type { Snapshot } from '../../../common/model/Snapshot.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';
import BandAnalysis from './BandAnalysis.js';
import { formatIntensityDescription, formatSnapshotHitsDescription } from './DetectorScreenDescriptionFormatter.js';

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

      return formatIntensityDescription( isDoubleSlit, analysis, spatialDescription );
    }

    const hitCount = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( hitCount, isDoubleSlit );
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot, screenHalfWidth );
    const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

    return formatSnapshotHitsDescription( hitStage, isDoubleSlit, hitCount, spatialDescription );
  }
}
