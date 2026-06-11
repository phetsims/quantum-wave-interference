// Copyright 2026, University of Colorado Boulder

/**
 * Maps the TimeSpeed enumeration to the qualitative clock-speed terms used in accessible descriptions. Shared by
 * the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TimeSpeed from '../../../../../scenery-phet/js/TimeSpeed.js';

// Categorical speed of the simulation clock (TimeSpeed enum), used for screen-reader narration.
// 'normal' corresponds to TimeSpeed.NORMAL; differs from the wave-speed description, which reflects physics.
export type QuantumWaveInterferenceClockSpeedDescription = 'slow' | 'normal' | 'fast';

/**
 * Gets the qualitative clock-speed term for the given TimeSpeed, for use as a Fluent message argument in
 * accessible state descriptions and context responses (e.g. "Source started on normal speed.").
 *
 * @param timeSpeed - the current TimeSpeed enumeration value
 * @returns the lowercase clock-speed term
 */
export function getClockSpeedDescription( timeSpeed: TimeSpeed ): QuantumWaveInterferenceClockSpeedDescription {
  return timeSpeed === TimeSpeed.SLOW ? 'slow' :
         timeSpeed === TimeSpeed.NORMAL ? 'normal' :
         timeSpeed === TimeSpeed.FAST ? 'fast' :
         ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
}
