// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the High Intensity screen. Manages four independent scene models (one per source type)
 * and shared state like time controls, tool visibility, and the currently selected scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
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
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type ObstacleType } from '../../common/model/ObstacleType.js';
import { type SlitConfiguration } from '../../common/model/SlitConfiguration.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode, type WaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import Snapshot from '../../experiment/model/Snapshot.js';
import HighIntensitySceneModel from './HighIntensitySceneModel.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensityModel implements TModel {

  // The four scene models, one per source type
  public readonly photonsScene: HighIntensitySceneModel;
  public readonly electronsScene: HighIntensitySceneModel;
  public readonly neutronsScene: HighIntensitySceneModel;
  public readonly heliumAtomsScene: HighIntensitySceneModel;
  public readonly scenes: HighIntensitySceneModel[];

  // The currently selected scene
  public readonly sceneProperty: Property<HighIntensitySceneModel>;

  // DynamicProperties that follow fields of the active scene
  public readonly currentObstacleTypeProperty: DynamicProperty<ObstacleType, ObstacleType, HighIntensitySceneModel>;
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfiguration, SlitConfiguration, HighIntensitySceneModel>;
  public readonly currentDetectionModeProperty: DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>;
  public readonly currentIsEmittingProperty: DynamicProperty<boolean, boolean, HighIntensitySceneModel>;
  public readonly currentIsMaxHitsReachedProperty: DynamicProperty<boolean, boolean, HighIntensitySceneModel>;
  public readonly currentScreenBrightnessProperty: DynamicProperty<number, number, HighIntensitySceneModel>;
  public readonly currentWaveDisplayModeProperty: DynamicProperty<WaveDisplayMode, WaveDisplayMode, HighIntensitySceneModel>;
  public readonly currentSlitSeparationProperty: DynamicProperty<number, number, HighIntensitySceneModel>;
  public readonly currentSlitPositionFractionProperty: DynamicProperty<number, number, HighIntensitySceneModel>;
  public readonly currentPhotonWaveDisplayModeProperty: DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, HighIntensitySceneModel>;
  public readonly currentMatterWaveDisplayModeProperty: DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, HighIntensitySceneModel>;
  public readonly currentSnapshotsProperty: DynamicProperty<Snapshot[], Snapshot[], HighIntensitySceneModel>;
  public readonly currentNumberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Shared state: time controls (global, not scene-specific)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Tool visibility (global, not scene-specific per design)
  public readonly isIntensityGraphVisibleProperty: BooleanProperty;
  public readonly isTapeMeasureVisibleProperty: BooleanProperty;
  public readonly isStopwatchVisibleProperty: BooleanProperty;
  public readonly isTimePlotVisibleProperty: BooleanProperty;
  public readonly isPositionPlotVisibleProperty: BooleanProperty;

  // Tool positions
  public readonly tapeMeasurePositionProperty: Vector2Property;
  public readonly stopwatch: Stopwatch;

  public constructor( providedOptions: HighIntensityModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    this.photonsScene = new HighIntensitySceneModel( {
      sourceType: 'photons',
      tandem: scenesTandem.createTandem( 'photonsScene' )
    } );

    this.electronsScene = new HighIntensitySceneModel( {
      sourceType: 'electrons',
      tandem: scenesTandem.createTandem( 'electronsScene' )
    } );

    this.neutronsScene = new HighIntensitySceneModel( {
      sourceType: 'neutrons',
      tandem: scenesTandem.createTandem( 'neutronsScene' )
    } );

    this.heliumAtomsScene = new HighIntensitySceneModel( {
      sourceType: 'heliumAtoms',
      tandem: scenesTandem.createTandem( 'heliumAtomsScene' )
    } );

    this.scenes = [
      this.photonsScene,
      this.electronsScene,
      this.neutronsScene,
      this.heliumAtomsScene
    ];

    this.sceneProperty = new Property<HighIntensitySceneModel>( this.photonsScene, {
      validValues: this.scenes,
      tandem: tandem.createTandem( 'sceneProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    this.currentObstacleTypeProperty = new DynamicProperty<ObstacleType, ObstacleType, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'obstacleTypeProperty',
      bidirectional: true
    } );

    this.currentSlitConfigurationProperty = new DynamicProperty<SlitConfiguration, SlitConfiguration, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true
    } );

    this.currentDetectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'detectionModeProperty',
      bidirectional: true
    } );

    this.currentIsEmittingProperty = new DynamicProperty<boolean, boolean, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'isEmittingProperty',
      bidirectional: true
    } );

    this.currentIsMaxHitsReachedProperty = new DynamicProperty<boolean, boolean, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'isMaxHitsReachedProperty'
    } );

    this.currentScreenBrightnessProperty = new DynamicProperty<number, number, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'screenBrightnessProperty',
      bidirectional: true
    } );

    this.currentWaveDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'activeWaveDisplayModeProperty'
    } );

    this.currentSlitSeparationProperty = new DynamicProperty<number, number, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'slitSeparationProperty',
      bidirectional: true
    } );

    this.currentSlitPositionFractionProperty = new DynamicProperty<number, number, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'slitPositionFractionProperty',
      bidirectional: true
    } );

    this.currentPhotonWaveDisplayModeProperty = new DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'photonWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentMatterWaveDisplayModeProperty = new DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'matterWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentSnapshotsProperty = new DynamicProperty<Snapshot[], Snapshot[], HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'snapshotsProperty',
      bidirectional: true
    } );

    this.currentNumberOfSnapshotsProperty = new DynamicProperty<number, number, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'numberOfSnapshotsProperty'
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    // Tool visibility
    const toolsTandem = tandem.createTandem( 'tools' );

    this.isIntensityGraphVisibleProperty = new BooleanProperty( false, {
      tandem: toolsTandem.createTandem( 'isIntensityGraphVisibleProperty' )
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

  public takeSnapshot(): void {
    this.sceneProperty.value.takeSnapshot();
  }

  public deleteSnapshot( snapshot: Snapshot ): void {
    this.sceneProperty.value.deleteSnapshot( snapshot );
  }

  public reset(): void {

    // Reset all scenes
    this.scenes.forEach( scene => scene.reset() );

    // Reset shared state
    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();

    // Reset tool visibility
    this.isIntensityGraphVisibleProperty.reset();
    this.isTapeMeasureVisibleProperty.reset();
    this.isStopwatchVisibleProperty.reset();
    this.isTimePlotVisibleProperty.reset();
    this.isPositionPlotVisibleProperty.reset();
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
