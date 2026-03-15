// Copyright 2026, University of Colorado Boulder

/**
 * SlitSetting enumerates the possible configurations of the double slit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../../phet-core/js/EnumerationValue.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';

export default class SlitSetting extends EnumerationValue {

  public static readonly BOTH_OPEN = new SlitSetting( 'bothOpen' );
  public static readonly LEFT_COVERED = new SlitSetting( 'leftCovered' );
  public static readonly RIGHT_COVERED = new SlitSetting( 'rightCovered' );
  public static readonly LEFT_DETECTOR = new SlitSetting( 'leftDetector' );
  public static readonly RIGHT_DETECTOR = new SlitSetting( 'rightDetector' );

  public static readonly enumeration = new Enumeration( SlitSetting );

  public constructor( public readonly tandemName: string ) {
    super();
  }
}

quantumWaveInterference.register( 'SlitSetting', SlitSetting );
