// Copyright 2026, University of Colorado Boulder

/**
 * Creates the grouped path-detector state for agent-facing accessible snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { hasDetectorOnSide, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type PathDetectorsViewState } from './QuantumWaveInterferenceAccessibleViewState.js';

/**
 * Groups path-detector visibility and counts by detector side. When no path detectors are present, the returned
 * object is intentionally minimal so inactive detector sections stay present but do not expose stale hit counts.
 *
 * @param slitConfiguration - current slit configuration
 * @param leftDetectorHits - hit count for the left path detector
 * @param rightDetectorHits - hit count for the right path detector
 * @returns grouped path-detector view state
 */
export default function createPathDetectorsViewState(
  slitConfiguration: SlitConfigurationWithNoBarrier,
  leftDetectorHits: number,
  rightDetectorHits: number
): PathDetectorsViewState {
  const hasLeftDetector = hasDetectorOnSide( slitConfiguration, 'left' );
  const hasRightDetector = hasDetectorOnSide( slitConfiguration, 'right' );

  return hasLeftDetector || hasRightDetector ? {
    visible: true,
    left: hasLeftDetector ? {
      visible: true,
      hits: leftDetectorHits
    } : {
      visible: false
    },
    right: hasRightDetector ? {
      visible: true,
      hits: rightDetectorHits
    } : {
      visible: false
    }
  } : {
    visible: false
  };
}
