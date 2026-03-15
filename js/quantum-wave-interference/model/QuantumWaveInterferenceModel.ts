// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Quantum Wave Interference simulation. Manages four independent scene models
 * (one per source type) and shared state like time controls and the ruler visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import TModel from '../../../../joist/js/TModel.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import SceneModel from './SceneModel.js';
import SourceType from './SourceType.js';

type SelfOptions = EmptySelfOptions;

type QuantumWaveInterferenceModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class QuantumWaveInterferenceModel implements TModel {

  // The four scene models, one per source type
  public readonly photonsScene: SceneModel;
  public readonly electronsScene: SceneModel;
  public readonly neutronsScene: SceneModel;
  public readonly heliumAtomsScene: SceneModel;
  public readonly scenes: SceneModel[];

  // The currently selected scene
  public readonly sceneProperty: Property<SceneModel>;

  // Shared state: time controls
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Shared state: ruler visibility
  public readonly isRulerVisibleProperty: BooleanProperty;

  public constructor( providedOptions: QuantumWaveInterferenceModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    this.photonsScene = new SceneModel( {
      sourceType: SourceType.PHOTONS,
      tandem: scenesTandem.createTandem( 'photonsScene' )
    } );

    this.electronsScene = new SceneModel( {
      sourceType: SourceType.ELECTRONS,
      tandem: scenesTandem.createTandem( 'electronsScene' )
    } );

    this.neutronsScene = new SceneModel( {
      sourceType: SourceType.NEUTRONS,
      tandem: scenesTandem.createTandem( 'neutronsScene' )
    } );

    this.heliumAtomsScene = new SceneModel( {
      sourceType: SourceType.HELIUM_ATOMS,
      tandem: scenesTandem.createTandem( 'heliumAtomsScene' )
    } );

    this.scenes = [
      this.photonsScene,
      this.electronsScene,
      this.neutronsScene,
      this.heliumAtomsScene
    ];

    this.sceneProperty = new Property<SceneModel>( this.photonsScene, {
      validValues: this.scenes,
      tandem: tandem.createTandem( 'sceneProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    this.isPlayingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    this.isRulerVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isRulerVisibleProperty' )
    } );
  }

  /**
   * Resets the model.
   */
  public reset(): void {

    // Reset all scenes
    this.scenes.forEach( scene => scene.reset() );

    // Reset shared state
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.isRulerVisibleProperty.reset();

    // Reset selected scene last so listeners see reset scenes
    this.sceneProperty.reset();
  }

  /**
   * Steps the model forward in time.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    if ( this.isPlayingProperty.value ) {

      // Apply time speed multiplier
      let effectiveDt: number;
      if ( this.timeSpeedProperty.value === TimeSpeed.SLOW ) {
        effectiveDt = dt * 0.25;
      }
      else if ( this.timeSpeedProperty.value === TimeSpeed.FAST ) {
        effectiveDt = dt * 4;
      }
      else {
        effectiveDt = dt;
      }

      // Only step the active scene
      this.sceneProperty.value.step( effectiveDt );
    }
  }
}

quantumWaveInterference.register( 'QuantumWaveInterferenceModel', QuantumWaveInterferenceModel );
