// Copyright 2026, University of Colorado Boulder

/**
 * SourceType enumerates the particle/photon types available in the simulation.
 * Each source type has its own wavelength/velocity range and mass.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';

export default class SourceType extends EnumerationValue {

  // Photon source - wavelength is controlled directly (visible spectrum)
  public static readonly PHOTONS = new SourceType( 'photons' );

  // Particle sources - wavelength is derived from de Broglie relation (lambda = h / mv)
  public static readonly ELECTRONS = new SourceType( 'electrons' );
  public static readonly NEUTRONS = new SourceType( 'neutrons' );
  public static readonly HELIUM_ATOMS = new SourceType( 'heliumAtoms' );

  public static readonly enumeration = new Enumeration( SourceType );

  public constructor( public readonly tandemName: string ) {
    super();
  }
}

quantumWaveInterference.register( 'SourceType', SourceType );
