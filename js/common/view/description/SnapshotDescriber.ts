// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative description structure as
 * the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { showsDoubleSlitInterferencePattern } from '../../model/SlitConfiguration.js';
import type { Snapshot } from '../../model/Snapshot.js';
import BandAnalysis from './BandAnalysis.js';
import { formatIntensityDescription, formatSnapshotHitsDescription } from './DetectorScreenDescriptionFormatter.js';

export default class SnapshotDescriber {

  /**
   * Returns a localized accessible-paragraph string describing a detector-screen snapshot.
   *
   * The description follows the same qualitative band-analysis structure used for the live detector screen.
   * For 'averageIntensity' mode it describes the intensity pattern (or reports "off" when the source is not
   * emitting); for particle-detection modes it describes the hit count and spatial arrangement.
   *
   * @param snapshot - the snapshot whose data drives the description
   * @param screenHalfWidth - half the visible detector-screen width in model units, used to bin the pattern into
   *   qualitative bands. Defaults to the value recorded in the snapshot, but callers that display the snapshot at
   *   a different scale (e.g. the SnapshotsDialog, which uses the current detector-screen scale index) pass the
   *   current visible half-width so the band boundaries match the displayed scale.
   */
  public static getDescription( snapshot: Snapshot, screenHalfWidth = snapshot.screenHalfWidth ): string {
    const isDoubleSlit = showsDoubleSlitInterferencePattern( snapshot.slitSetting );

    if ( snapshot.detectionMode === 'averageIntensity' ) {
      if ( !snapshot.isEmitting ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot, screenHalfWidth );
      const spatialDescription = isDoubleSlit ?
                                 BandAnalysis.formatSpatialArrangementDescription( analysis, isDoubleSlit, false, false ) :
                                 BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

      return formatIntensityDescription( isDoubleSlit, snapshot.slitSetting === 'noBarrier', analysis, spatialDescription );
    }

    const hitCount = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( hitCount, isDoubleSlit );
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot, screenHalfWidth );
    const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

    return formatSnapshotHitsDescription( hitStage, isDoubleSlit, snapshot.slitSetting === 'noBarrier', hitCount, spatialDescription );
  }
}
