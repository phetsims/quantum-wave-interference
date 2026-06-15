// Copyright 2026, University of Colorado Boulder

/**
 * Maps physical slit-separation range to the display-coordinate slit geometry used by the wave
 * solvers and view nodes. This lives in common, not model or view, because the solvers
 * operate in display-model coordinates and the view must render the same slit geometry.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { linear } from '../../../dot/js/util/linear.js';
import QuantumWaveInterferenceConstants from './QuantumWaveInterferenceConstants.js';

// Canonical slit dimensions in pixel coordinates at WAVE_REGION_HEIGHT scale.
// BaseSceneModel converts these to physical units when constructing the slitSeparation range,
// so changing these constants shifts both the model range and the rendered geometry together.
export const MIN_DISPLAY_SLIT_SEPARATION = 40;
export const MAX_DISPLAY_SLIT_SEPARATION = 220;
export const DISPLAY_SLIT_WIDTH = 22;

const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

/**
 * Display-coordinate slit geometry, in the same units as regionHeight. Both fields are center-to-center
 * separation and slit opening width, scaled to the actual wave-region height of the caller.
 */
export type DisplaySlitLayout = {
  displaySlitSeparation: number;
  displaySlitWidth: number;
};

/**
 * Converts a physical slit-separation value into display-coordinate slit geometry.
 *
 * The physical separation is mapped linearly to the canonical pixel range
 * [MIN_DISPLAY_SLIT_SEPARATION, MAX_DISPLAY_SLIT_SEPARATION], then scaled by
 * regionHeight / WAVE_REGION_HEIGHT so the result matches the caller's actual wave-region
 * height. When slitSeparationMax === slitSeparationMin (or the range is non-positive), the
 * fraction defaults to 0.5 (mid-range display separation) to avoid division by zero.
 *
 * Called by BaseWaveSolver (to position interference sources) and DoubleSlitNode
 * (to render the barrier openings).
 *
 * @param slitSeparation - current physical slit separation, in the same units as the min/max
 * @param slitSeparationMin - minimum of the physical separation range
 * @param slitSeparationMax - maximum of the physical separation range
 * @param regionHeight - actual pixel height of the wave region; output values are in these units
 */
export function getDisplaySlitLayout(
  slitSeparation: number, slitSeparationMin: number, slitSeparationMax: number,
  regionHeight: number
): DisplaySlitLayout {
  const separationRange = slitSeparationMax - slitSeparationMin;
  const separationFraction = separationRange > 0 ? ( slitSeparation - slitSeparationMin ) / separationRange : 0.5;
  const displaySeparationPixels = linear(
    0,
    1,
    MIN_DISPLAY_SLIT_SEPARATION,
    MAX_DISPLAY_SLIT_SEPARATION,
    separationFraction
  );
  const displaySlitSeparation = displaySeparationPixels / WAVE_REGION_HEIGHT * regionHeight;
  const displaySlitWidth = DISPLAY_SLIT_WIDTH / WAVE_REGION_HEIGHT * regionHeight;
  return { displaySlitSeparation: displaySlitSeparation, displaySlitWidth: displaySlitWidth };
}
