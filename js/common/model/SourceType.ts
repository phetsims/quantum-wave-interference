// Copyright 2026, University of Colorado Boulder

/**
 * SourceType enumerates the particle/photon types available in the simulation.
 * Each source type has its own wavelength/velocity range and mass.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

// Runtime array of all valid source-type strings, used as the canonical value set for PhET-iO StringUnionIO serialization.
export const SourceTypeValues = [ 'photons', 'electrons', 'neutrons', 'heliumAtoms' ] as const;

/**
 * Discriminator type shared across model and view to identify the active particle/photon species.
 * Drives wavelength ranges, particle mass, visual palettes, and accessible descriptions throughout the sim.
 */
export type SourceType = typeof SourceTypeValues[number];
