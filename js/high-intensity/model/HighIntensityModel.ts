// Copyright 2026, University of Colorado Boulder

/**
 * Model for the "High Intensity" screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import TModel from '../../../../joist/js/TModel.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensityModel implements TModel {

  public constructor( providedOptions: HighIntensityModelOptions ) {
    _.noop( providedOptions );
  }

  public reset(): void {
    // No-op
  }

  public step( dt: number ): void {
    // No-op
  }
}
