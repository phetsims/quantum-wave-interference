// Copyright 2026, University of Colorado Boulder

/**
 * Shared color palettes for matter-particle emitters. Each non-photon SourceType gets its own three-stop palette so a
 * scene's emitter (a LaserPointerNode body) is visually distinct from the default photon yellow. Photons return null,
 * meaning "use the default photon appearance".
 *
 * Used by every emitter view that tints its LaserPointerNode by source type (e.g. OverheadEmitterNode on the
 * Experiment screen and HighIntensitySourceBeamThumbnailNode on the High Intensity screen) so the colors stay in sync.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type SourceType } from '../model/SourceType.js';

/**
 * The three LaserPointerNode body colors that distinguish one matter-particle emitter from another.
 */
export type ParticleEmitterPalette = {
  topColor: string;
  bottomColor: string;
  highlightColor: string;
};

const PARTICLE_EMITTER_PALETTES: Record<Exclude<SourceType, 'photons'>, ParticleEmitterPalette> = {
  electrons: {
    topColor: 'rgb(100, 120, 180)',
    bottomColor: 'rgb(30, 40, 80)',
    highlightColor: 'rgb(160, 180, 230)'
  },
  neutrons: {
    topColor: 'rgb(92, 137, 144)',
    bottomColor: 'rgb(26, 63, 70)',
    highlightColor: 'rgb(168, 205, 208)'
  },
  heliumAtoms: {
    topColor: 'rgb(173, 138, 94)',
    bottomColor: 'rgb(84, 58, 30)',
    highlightColor: 'rgb(224, 194, 150)'
  }
};

/**
 * Returns the emitter palette for the given source type, or null for photons (which use the default photon appearance).
 *
 * @param sourceType - the active scene's source type
 * @returns the matching palette, or null when the source emits photons
 */
export default function getParticleEmitterPalette( sourceType: SourceType ): ParticleEmitterPalette | null {
  return sourceType === 'photons' ? null : PARTICLE_EMITTER_PALETTES[ sourceType ];
}