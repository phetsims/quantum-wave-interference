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
   * For 'intensity' mode it describes the intensity pattern (or reports "off" when the source is not
   * emitting); for particle-detection modes it describes the hit count and spatial arrangement.
   *
   * @param snapshot - the snapshot whose data drives the description
   */
  public static getDescription( snapshot: Snapshot ): string {
    const isDoubleSlit = showsDoubleSlitInterferencePattern( snapshot.slitSetting );

    if ( snapshot.detectionMode === 'intensity' ) {
      if ( !snapshot.isEmitting ) {
        return QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
      }

      const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );

      return formatIntensityDescription( snapshot.slitSetting, analysis, true, undefined, true );
    }

    const hitCount = snapshot.hits.length;
    const hitStage = BandAnalysis.getHitStage( hitCount );
    const analysis = BandAnalysis.analyzeTheoreticalPatternFromSnapshot( snapshot );
    const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, false, false );

    return formatSnapshotHitsDescription( hitStage, snapshot.slitSetting, analysis, hitCount, spatialDescription );
  }
}
