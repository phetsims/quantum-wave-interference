// Copyright 2026, University of Colorado Boulder

/**
 * TimeSpeedProperty is the shared time-speed model Property for Quantum Wave Interference screens.
 * It centralizes the default time speed and the supported TimeSpeed values so screens with playback controls
 * use the same PhET-iO metadata and reset behavior.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import Tandem from '../../../../tandem/js/Tandem.js';

export default class TimeSpeedProperty extends EnumerationProperty<TimeSpeed> {

  public constructor( tandem: Tandem ) {
    super( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem
    } );
  }
}
