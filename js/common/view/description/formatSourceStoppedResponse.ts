// Copyright 2026, University of Colorado Boulder

/**
 * Shared source-off response formatting for Quantum Wave Interference screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../../model/DetectionMode.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';

/**
 * Formats the source-off context response. Hits data remain visible only in Hits mode after at least one hit has
 * accumulated, so only that case gets the extra sentence.
 * @param detectionMode - current detector mode
 * @param totalHits - number of hits currently on the active detector screen/graph
 * @returns localized source-off context response
 */
export default function formatSourceStoppedResponse( detectionMode: DetectionMode, totalHits: number ): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.sourceStopped.format( {
    hasHitsData: detectionMode === 'hits' && totalHits > 0 ? 'true' : 'false'
  } );
}
