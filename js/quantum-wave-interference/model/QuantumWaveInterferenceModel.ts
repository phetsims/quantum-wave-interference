// Copyright 2026, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TModel from '../../../../joist/js/TModel.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class QuantumWaveInterferenceModel implements TModel {

  public constructor( providedOptions: QuantumWaveInterferenceModelOptions ) {
    // no-op
  }

  /**
   * Resets the model.
   */
  public reset(): void {
    // no-op
  }

  /**
   * Steps the model.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    // no-op
  }
}

quantumWaveInterference.register( 'QuantumWaveInterferenceModel', QuantumWaveInterferenceModel );