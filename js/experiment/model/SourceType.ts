// Copyright 2026, University of Colorado Boulder

/**
 * SourceType enumerates the particle/photon types available in the simulation.
 * Each source type has its own wavelength/velocity range and mass.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export const SourceTypeValues = [ 'photons', 'electrons', 'neutrons', 'heliumAtoms' ] as const;

export type SourceType = typeof SourceTypeValues[number];
