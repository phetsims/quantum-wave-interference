// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Single Particles screen. Manages four independent scene models (one per source type)
 * and shared state like time controls, tool visibility, and the currently selected scene.
 *
 * Key differences from HighIntensityModel:
 * - Always in Hits mode (no detection mode or intensity graph)
 * - Has hits graph, detector tool visibility
 * - No intensity control
 * - Single-packet emission with auto-repeat
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
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
import { type ObstacleType } from '../../common/model/ObstacleType.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode, type WaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import SingleParticlesSceneModel, { type SingleParticlesSlitConfiguration } from './SingleParticlesSceneModel.js';

type SelfOptions = EmptySelfOptions;

type SingleParticlesModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SingleParticlesModel implements TModel {

  public readonly photonsScene: SingleParticlesSceneModel;
  public readonly electronsScene: SingleParticlesSceneModel;
  public readonly neutronsScene: SingleParticlesSceneModel;
  public readonly heliumAtomsScene: SingleParticlesSceneModel;
  public readonly scenes: SingleParticlesSceneModel[];

  public readonly sceneProperty: Property<SingleParticlesSceneModel>;

  // DynamicProperties that follow fields of the active scene
  public readonly currentObstacleTypeProperty: DynamicProperty<ObstacleType, ObstacleType, SingleParticlesSceneModel>;
  public readonly currentSlitConfigurationProperty: DynamicProperty<SingleParticlesSlitConfiguration, SingleParticlesSlitConfiguration, SingleParticlesSceneModel>;
  public readonly currentIsEmittingProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentAutoRepeatProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentIsMaxHitsReachedProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentScreenBrightnessProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;
  public readonly currentWaveDisplayModeProperty: DynamicProperty<WaveDisplayMode, WaveDisplayMode, SingleParticlesSceneModel>;
  public readonly currentSlitSeparationProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;
  public readonly currentSlitPositionFractionProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;
  public readonly currentPhotonWaveDisplayModeProperty: DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, SingleParticlesSceneModel>;
  public readonly currentMatterWaveDisplayModeProperty: DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, SingleParticlesSceneModel>;
  public readonly currentIsPacketActiveProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;

  // Whether the detector tool checkbox is available (only when obstacle is None)
  public readonly isDetectorToolAvailableProperty: TReadOnlyProperty<boolean>;

  // Shared state: time controls (global, not scene-specific)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Tool visibility
  public readonly isHitsGraphVisibleProperty: BooleanProperty;
  public readonly isTapeMeasureVisibleProperty: BooleanProperty;
  public readonly isStopwatchVisibleProperty: BooleanProperty;
  public readonly isTimePlotVisibleProperty: BooleanProperty;
  public readonly isPositionPlotVisibleProperty: BooleanProperty;
  public readonly isDetectorToolVisibleProperty: BooleanProperty;

  // Tool positions
  public readonly tapeMeasurePositionProperty: Vector2Property;
  public readonly stopwatch: Stopwatch;

  public constructor( providedOptions: SingleParticlesModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    this.photonsScene = new SingleParticlesSceneModel( {
      sourceType: 'photons',
      tandem: scenesTandem.createTandem( 'photonsScene' )
    } );

    this.electronsScene = new SingleParticlesSceneModel( {
      sourceType: 'electrons',
      tandem: scenesTandem.createTandem( 'electronsScene' )
    } );

    this.neutronsScene = new SingleParticlesSceneModel( {
      sourceType: 'neutrons',
      tandem: scenesTandem.createTandem( 'neutronsScene' )
    } );

    this.heliumAtomsScene = new SingleParticlesSceneModel( {
      sourceType: 'heliumAtoms',
      tandem: scenesTandem.createTandem( 'heliumAtomsScene' )
    } );

    this.scenes = [
      this.photonsScene,
      this.electronsScene,
      this.neutronsScene,
      this.heliumAtomsScene
    ];

    this.sceneProperty = new Property<SingleParticlesSceneModel>( this.photonsScene, {
      validValues: this.scenes,
      tandem: tandem.createTandem( 'sceneProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    this.currentObstacleTypeProperty = new DynamicProperty<ObstacleType, ObstacleType, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'obstacleTypeProperty',
      bidirectional: true
    } );

    this.currentSlitConfigurationProperty = new DynamicProperty<SingleParticlesSlitConfiguration, SingleParticlesSlitConfiguration, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true
    } );

    this.currentIsEmittingProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isEmittingProperty',
      bidirectional: true
    } );

    this.currentAutoRepeatProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'autoRepeatProperty',
      bidirectional: true
    } );

    this.currentIsMaxHitsReachedProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isMaxHitsReachedProperty'
    } );

    this.currentScreenBrightnessProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'screenBrightnessProperty',
      bidirectional: true
    } );

    this.currentWaveDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'activeWaveDisplayModeProperty'
    } );

    this.currentSlitSeparationProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'slitSeparationProperty',
      bidirectional: true
    } );

    this.currentSlitPositionFractionProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'slitPositionFractionProperty',
      bidirectional: true
    } );

    this.currentPhotonWaveDisplayModeProperty = new DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'photonWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentMatterWaveDisplayModeProperty = new DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'matterWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentIsPacketActiveProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isPacketActiveProperty'
    } );

    this.isDetectorToolAvailableProperty = new DerivedProperty(
      [ this.currentObstacleTypeProperty ],
      obstacleType => obstacleType === 'none'
    );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    // Tool visibility
    const toolsTandem = tandem.createTandem( 'tools' );

    this.isHitsGraphVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isHitsGraphVisibleProperty' )
    } );

    this.isTapeMeasureVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isTapeMeasureVisibleProperty' )
    } );

    this.isStopwatchVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isStopwatchVisibleProperty' )
    } );

    this.isTimePlotVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isTimePlotVisibleProperty' )
    } );

    this.isPositionPlotVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isPositionPlotVisibleProperty' )
    } );

    this.isDetectorToolVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isDetectorToolVisibleProperty' )
    } );

    // Hide the detector tool when it becomes unavailable (obstacle is not None)
    this.isDetectorToolAvailableProperty.link( ( isAvailable: boolean ) => {
      if ( !isAvailable ) {
        this.isDetectorToolVisibleProperty.value = false;
      }
    } );

    this.tapeMeasurePositionProperty = new Vector2Property( new Vector2( 300, 300 ), {
      tandem: toolsTandem.createTandem( 'tapeMeasurePositionProperty' )
    } );

    this.stopwatch = new Stopwatch( {
      position: new Vector2( 60, 420 ),
      tandem: toolsTandem.createTandem( 'stopwatch' ),
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      }
    } );
  }

  public reset(): void {

    // Reset all scenes
    this.scenes.forEach( scene => scene.reset() );

    // Reset shared state
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();

    // Reset tool visibility
    this.isHitsGraphVisibleProperty.reset();
    this.isTapeMeasureVisibleProperty.reset();
    this.isStopwatchVisibleProperty.reset();
    this.isTimePlotVisibleProperty.reset();
    this.isPositionPlotVisibleProperty.reset();
    this.isDetectorToolVisibleProperty.reset();
    this.tapeMeasurePositionProperty.reset();
    this.stopwatch.reset();

    // Reset selected scene last so listeners see reset scenes
    this.sceneProperty.reset();
  }

  /**
   * Steps the model forward in time. Only the active scene is stepped.
   */
  public step( dt: number ): void {
    if ( !this.isPlayingProperty.value ) {
      return;
    }

    const timeSpeed = this.timeSpeedProperty.value;
    const effectiveDt = timeSpeed === TimeSpeed.SLOW ? dt * 0.25 :
                        timeSpeed === TimeSpeed.FAST ? dt * 4 :
                        timeSpeed === TimeSpeed.NORMAL ? dt :
                        ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();

    this.sceneProperty.value.step( effectiveDt );
    this.stopwatch.step( effectiveDt );
  }
}
