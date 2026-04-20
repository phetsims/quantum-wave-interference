// Copyright 2026, University of Colorado Boulder

/**
 * Maps physical slit-separation range to the display-coordinate slit layout used by the wave
 * solvers and DoubleSlitNode. Centralises the magic view constants (40 px min, 220 px max,
 * 22 px slit height at 350 px region height) so they live in one place.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { linear } from '../../../../dot/js/util/linear.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

export const MIN_VIEW_SEPARATION = 40;
export const MAX_VIEW_SEPARATION = 220;
export const SLIT_VIEW_HEIGHT = 22;

const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

export type ViewSlitLayout = {
  viewSlitSep: number;
  viewSlitWidth: number;
};

export function getViewSlitLayout(
  slitSeparation: number, slitSeparationMin: number, slitSeparationMax: number,
  regionHeight: number
): ViewSlitLayout {
  const sepRange = slitSeparationMax - slitSeparationMin;
  const sepFraction = sepRange > 0 ? ( slitSeparation - slitSeparationMin ) / sepRange : 0.5;
  const viewSepPixels = linear( 0, 1, MIN_VIEW_SEPARATION, MAX_VIEW_SEPARATION, sepFraction );
  const viewSlitSep = viewSepPixels / WAVE_REGION_HEIGHT * regionHeight;
  const viewSlitWidth = SLIT_VIEW_HEIGHT / WAVE_REGION_HEIGHT * regionHeight;
  return { viewSlitSep: viewSlitSep, viewSlitWidth: viewSlitWidth };
}
