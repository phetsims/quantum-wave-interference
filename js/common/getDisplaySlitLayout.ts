// Copyright 2026, University of Colorado Boulder

/**
 * Maps physical slit-separation range to the display-coordinate slit geometry used by the wave
 * solvers and view nodes. This lives in common, not model or view, because the analytical solvers
 * operate in display-model coordinates and the view must render the same slit geometry.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { linear } from '../../../dot/js/util/linear.js';
import QuantumWaveInterferenceConstants from './QuantumWaveInterferenceConstants.js';

export const MIN_DISPLAY_SLIT_SEPARATION = 40;
export const MAX_DISPLAY_SLIT_SEPARATION = 220;
export const DISPLAY_SLIT_WIDTH = 22;

const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

export type DisplaySlitLayout = {
  displaySlitSeparation: number;
  displaySlitWidth: number;
};

export function getDisplaySlitLayout(
  slitSeparation: number, slitSeparationMin: number, slitSeparationMax: number,
  regionHeight: number
): DisplaySlitLayout {
  const sepRange = slitSeparationMax - slitSeparationMin;
  const sepFraction = sepRange > 0 ? ( slitSeparation - slitSeparationMin ) / sepRange : 0.5;
  const displaySeparationPixels = linear(
    0,
    1,
    MIN_DISPLAY_SLIT_SEPARATION,
    MAX_DISPLAY_SLIT_SEPARATION,
    sepFraction
  );
  const displaySlitSeparation = displaySeparationPixels / WAVE_REGION_HEIGHT * regionHeight;
  const displaySlitWidth = DISPLAY_SLIT_WIDTH / WAVE_REGION_HEIGHT * regionHeight;
  return { displaySlitSeparation: displaySlitSeparation, displaySlitWidth: displaySlitWidth };
}
