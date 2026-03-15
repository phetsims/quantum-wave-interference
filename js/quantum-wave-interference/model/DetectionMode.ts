// Copyright 2026, University of Colorado Boulder

/**
 * DetectionMode enumerates the display modes for the detector screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';

export default class DetectionMode extends EnumerationValue {

  // Shows the running average of the interference pattern as bright bands
  public static readonly AVERAGE_INTENSITY = new DetectionMode( 'averageIntensity' );

  // Shows individual detection events as dots
  public static readonly HITS = new DetectionMode( 'hits' );

  public static readonly enumeration = new Enumeration( DetectionMode );

  public constructor( public readonly tandemName: string ) {
    super();
  }
}

quantumWaveInterference.register( 'DetectionMode', DetectionMode );
