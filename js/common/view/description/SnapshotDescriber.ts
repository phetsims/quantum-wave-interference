// Copyright 2026, University of Colorado Boulder

/**
 * Produces an accessible paragraph for a detector-screen snapshot using the same qualitative description structure as
 * the live detector screen.
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import type { Snapshot } from '../../model/Snapshot.js';
import BandAnalysis from './BandAnalysis.js';
import { formatIntensityDescription, formatLiveHitsDescription } from './DetectorScreenDescriptionFormatter.js';

export default class SnapshotDescriber {

  /**
   * Returns a localized accessible-paragraph string describing a detector-screen snapshot.
   *
   * The description reuses the same wording as the live detector screen. For 'intensity' mode it describes the
   * intensity pattern (or reports "off" when the source is not emitting); for particle-detection modes it gives the
   * live hits description followed by the total hit count captured in the snapshot.
   *
   * @param snapshot - the snapshot whose data drives the description
   */
  public static getDescription( snapshot: Snapshot ): string {
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
    const liveDescription = formatLiveHitsDescription( hitStage, snapshot.slitSetting, analysis, undefined, true );

    // At 0 hits the live description already says the screen is empty, so the running-total sentence is omitted.
    return hitStage === 'none' ?
           liveDescription :
           QuantumWaveInterferenceFluent.a11y.detectorScreen.snapshotHitsParagraph.format( {
             description: liveDescription
           } );
  }
}
