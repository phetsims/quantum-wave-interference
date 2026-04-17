// Copyright 2026, University of Colorado Boulder

/**
 * Used by the time plot and position plot tools to position their zero baseline correctly:
 * unipolar signals (magnitude, time-averaged intensity — values in [0, +∞)) have a baseline at
 * the bottom of the chart; bipolar signals (real part, imaginary part, electric field — values
 * in (-∞, +∞)) have a baseline at the vertical center.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type WaveDisplayMode } from './WaveDisplayMode.js';

export type WaveDisplayModePolarity = 'unipolar' | 'bipolar';

export default function getDisplayModePolarity( mode: WaveDisplayMode ): WaveDisplayModePolarity {
  return mode === 'magnitude' || mode === 'timeAveragedIntensity' ? 'unipolar' : 'bipolar';
}
