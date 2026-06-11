// Copyright 2026, University of Colorado Boulder

/**
 * Maps a slit configuration to the kind of interference/diffraction pattern it produces. Shared by the accessible
 * descriptions on the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';

// The type of interference/diffraction pattern produced by the current slit configuration.
// 'noBarrier' means the barrier is absent and particles travel directly to the screen.
export type QuantumWaveInterferencePatternKind = 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier';

/**
 * Gets the pattern kind for the given slit configuration, for use in accessible state descriptions and context
 * responses. Slit-detector configurations report 'whichPathDiffraction' because which-path information destroys
 * the double-slit interference pattern.
 *
 * @param slitConfiguration - the current slit configuration, including the no-barrier case
 * @returns the kind of pattern the configuration produces on the detector screen
 */
export function getPatternKind( slitConfiguration: SlitConfigurationWithNoBarrier ): QuantumWaveInterferencePatternKind {
  return slitConfiguration === 'noBarrier' ? 'noBarrier' :
         showsDoubleSlitInterferencePattern( slitConfiguration ) ? 'doubleSlitInterference' :
         ( slitConfiguration === 'leftDetector' || slitConfiguration === 'rightDetector' || slitConfiguration === 'bothDetectors' ) ? 'whichPathDiffraction' :
         'singleSlitDiffraction';
}
