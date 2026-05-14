// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Quantum Wave Interference simulation.
 * Manages four independent scene models (one per source type) and shared state like time controls and the ruler
 * visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import TModel from '../../../../joist/js/TModel.js';
import { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import { DEFAULT_DETECTOR_SCREEN_SCALE_INDEX, DETECTOR_SCREEN_SCALE_OPTIONS } from './DetectorScreenScale.js';
import SceneModel from './SceneModel.js';

type SelfOptions = EmptySelfOptions;

type ExperimentModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class ExperimentModel implements TModel {

  // The four scene models, one per source type
  private readonly photonsScene: SceneModel;
  private readonly electronsScene: SceneModel;
  private readonly neutronsScene: SceneModel;
  private readonly heliumAtomsScene: SceneModel;
  public readonly scenes: SceneModel[];

  // The currently selected scene
  public readonly sceneProperty: Property<SceneModel>;

  // DynamicProperties that follow fields of the active scene.
  // Centralized here so view code can share a single instance instead of re-deriving the same wrapper in each view
  // component.
  public readonly currentSlitSettingProperty: DynamicProperty<SlitConfiguration, SlitConfiguration, SceneModel>;
  public readonly currentDetectionModeProperty: DynamicProperty<DetectionMode, DetectionMode, SceneModel>;
  public readonly currentIsEmittingProperty: DynamicProperty<boolean, boolean, SceneModel>;
  public readonly currentIsMaxHitsReachedProperty: DynamicProperty<boolean, boolean, SceneModel>;
  public readonly currentScreenBrightnessProperty: DynamicProperty<number, number, SceneModel>;

  // Shared horizontal detector-screen zoom level for all Experiment scene views and snapshots.
  public readonly detectorScreenScaleIndexProperty: NumberProperty;

  // Shared state: time controls
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Shared state: ruler visibility and position
  public readonly isRulerVisibleProperty: BooleanProperty;
  public readonly rulerPositionProperty: Vector2Property;

  // Shared state: stopwatch for timing experiments
  public readonly stopwatch: Stopwatch;

  public constructor( providedOptions: ExperimentModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    this.photonsScene = new SceneModel( {
      sourceType: 'photons',
      tandem: scenesTandem.createTandem( 'photonsScene' )
    } );

    this.electronsScene = new SceneModel( {
      sourceType: 'electrons',
      tandem: scenesTandem.createTandem( 'electronsScene' )
    } );

    this.neutronsScene = new SceneModel( {
      sourceType: 'neutrons',
      tandem: scenesTandem.createTandem( 'neutronsScene' )
    } );

    this.heliumAtomsScene = new SceneModel( {
      sourceType: 'heliumAtoms',
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

    this.currentSlitSettingProperty = new DynamicProperty<SlitConfiguration, SlitConfiguration, SceneModel>( this.sceneProperty, {
      derive: 'slitSettingProperty'
    } );

    this.currentDetectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, SceneModel>( this.sceneProperty, {
      derive: 'detectionModeProperty',
      bidirectional: true
    } );

    this.currentIsEmittingProperty = new DynamicProperty<boolean, boolean, SceneModel>( this.sceneProperty, {
      derive: 'isEmittingProperty',
      bidirectional: true
    } );

    this.currentIsMaxHitsReachedProperty = new DynamicProperty<boolean, boolean, SceneModel>( this.sceneProperty, {
      derive: 'isMaxHitsReachedProperty'
    } );

    this.currentScreenBrightnessProperty = new DynamicProperty<number, number, SceneModel>( this.sceneProperty, {
      derive: 'screenBrightnessProperty',
      bidirectional: true
    } );

    this.detectorScreenScaleIndexProperty = new NumberProperty( DEFAULT_DETECTOR_SCREEN_SCALE_INDEX, {
      range: new Range( 0, DETECTOR_SCREEN_SCALE_OPTIONS.length - 1 ),
      numberType: 'Integer',
      tandem: tandem.createTandem( 'detectorScreenScaleIndexProperty' )
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Same as BaseScreenModel
    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    this.isRulerVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isRulerVisibleProperty' )
    } );

    // Initial ruler position: centered in the layout bounds, below the middle row
    this.rulerPositionProperty = new Vector2Property( new Vector2( 300, 350 ), {
      tandem: tandem.createTandem( 'rulerPositionProperty' )
    } );

    this.stopwatch = new Stopwatch( {
      position: new Vector2( 60, 420 ),
      tandem: tandem.createTandem( 'stopwatch' ),
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      }
    } );

  }

  /**
   * Resets the model.
   */
  public reset(): void {

    // Reset all scenes
    this.scenes.forEach( scene => scene.reset() );

    // Reset shared state
    this.detectorScreenScaleIndexProperty.reset();
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();
    this.isRulerVisibleProperty.reset();
    this.rulerPositionProperty.reset();
    this.stopwatch.reset();

    // Reset selected scene last so listeners see reset scenes
    this.sceneProperty.reset();
  }

  /**
   * Advances the simulation by a fixed time step, stepping the active scene and the stopwatch.
   * Called directly by the step-forward button (bypassing the isPlaying check and time speed
   * multiplier), following the pattern in quantum-measurement's stepForwardInTime.
   * @param dt - time step, in seconds
   */
  private stepForwardInTime( dt: number ): void {
    this.sceneProperty.value.step( dt );
    this.stopwatch.step( dt );
  }

  /**
   * Steps the model forward in time during continuous play. Applies the time speed multiplier
   * and only runs when the simulation is playing.
   * @param dt - time step, in seconds
   */
  public step( dt: number ): void {
    if ( this.isPlayingProperty.value ) {

      // Apply time speed multiplier
      const timeSpeed = this.timeSpeedProperty.value;
      const effectiveDt = timeSpeed === TimeSpeed.SLOW ? dt * 0.25 :
                          timeSpeed === TimeSpeed.FAST ? dt * 4 :
                          timeSpeed === TimeSpeed.NORMAL ? dt :
                          ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();

      this.stepForwardInTime( effectiveDt );
    }
  }
}
