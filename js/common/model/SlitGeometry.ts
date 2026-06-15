// Copyright 2026, University of Colorado Boulder

/**
 * Slit geometry helpers for the wave kernel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type WaveSlit } from './WaveKernelTypes.js';

/**
 * Returns the y coordinate on a slit aperture that is closest to a sample point.
 *
 * Diffraction and causal pass-time calculations use the nearest point on the finite aperture rather
 * than the slit center so wavefronts originate from the full opening. This pure helper is useful
 * whenever downstream propagation needs a shortest distance to an aperture segment.
 */
export function getClosestYOnSlit( y: number, slit: WaveSlit ): number {
  const halfWidth = slit.width / 2;
  const yMin = slit.centerY - halfWidth;
  const yMax = slit.centerY + halfWidth;
  return Math.max( yMin, Math.min( yMax, y ) );
}
