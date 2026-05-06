// Copyright 2026, University of Colorado Boulder

/**
 * Abstract base model for the High Intensity and Single Particles screens. Subclasses provide
 * screen-specific Properties and override takeSnapshot() and resetToolVisibility().
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import TModel from '../../../../joist/js/TModel.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import TimeSpeed from '../../../../scenery-phet/js/TimeSpeed.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import { type BarrierType } from './BarrierType.js';
import { type MatterWaveDisplayMode, type PhotonWaveDisplayMode, type WaveDisplayMode } from './WaveDisplayMode.js';
import Snapshot from './Snapshot.js';
import type BaseSceneModel from './BaseSceneModel.js';

const NOMINAL_DT = 1 / 60;
const SLOW_TIME_SPEED_FACTOR = 0.25;
const NORMAL_TIME_SPEED_FACTOR = 0.5;

type BaseScreenModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class BaseScreenModel<T extends BaseSceneModel> implements TModel {

  public readonly scenes: T[];
  public readonly sceneProperty: Property<T>;

  // DynamicProperties that follow fields of the active scene
  public readonly currentBarrierTypeProperty: DynamicProperty<BarrierType, BarrierType, BaseSceneModel>;
  public readonly currentIsEmittingProperty: DynamicProperty<boolean, boolean, BaseSceneModel>;
  public readonly currentIsMaxHitsReachedProperty: DynamicProperty<boolean, boolean, BaseSceneModel>;
  public readonly currentScreenBrightnessProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentWaveDisplayModeProperty: DynamicProperty<WaveDisplayMode, WaveDisplayMode, BaseSceneModel>;
  public readonly currentSlitSeparationProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentSlitPositionFractionProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentPhotonWaveDisplayModeProperty: DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, BaseSceneModel>;
  public readonly currentMatterWaveDisplayModeProperty: DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, BaseSceneModel>;
  public readonly currentSnapshotsProperty: DynamicProperty<Snapshot[], Snapshot[], BaseSceneModel>;
  public readonly currentNumberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Shared state: time controls (global, not scene-specific)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: EnumerationProperty<TimeSpeed>;

  // Tool visibility (shared across both screens)
  public readonly isTapeMeasureVisibleProperty: BooleanProperty;
  public readonly isStopwatchVisibleProperty: BooleanProperty;
  public readonly isTimePlotVisibleProperty: BooleanProperty;
  public readonly isPositionPlotVisibleProperty: BooleanProperty;

  // Tool positions
  public readonly tapeMeasureBasePositionProperty: Vector2Property;
  public readonly tapeMeasureTipPositionProperty: Vector2Property;
  public readonly stopwatch: Stopwatch;

  protected readonly toolsTandem;
  private readonly fastTimeSpeedFactor: number;

  protected constructor( scenes: T[], fastTimeSpeedFactor: number, providedOptions: BaseScreenModelOptions ) {

    const tandem = providedOptions.tandem;

    this.scenes = scenes;
    this.fastTimeSpeedFactor = fastTimeSpeedFactor;

    this.sceneProperty = new Property<T>( scenes[ 0 ], {
      validValues: scenes,
      tandem: tandem.createTandem( 'sceneProperty' ),
      phetioValueType: ReferenceIO( IOType.ObjectIO )
    } );

    this.currentBarrierTypeProperty = new DynamicProperty<BarrierType, BarrierType, BaseSceneModel>( this.sceneProperty, {
      derive: 'barrierTypeProperty',
      bidirectional: true
    } );

    this.currentIsEmittingProperty = new DynamicProperty<boolean, boolean, BaseSceneModel>( this.sceneProperty, {
      derive: 'isEmittingProperty',
      bidirectional: true
    } );

    this.currentIsMaxHitsReachedProperty = new DynamicProperty<boolean, boolean, BaseSceneModel>( this.sceneProperty, {
      derive: 'isMaxHitsReachedProperty'
    } );

    this.currentScreenBrightnessProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'screenBrightnessProperty',
      bidirectional: true
    } );

    this.currentWaveDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'activeWaveDisplayModeProperty'
    } );

    this.currentSlitSeparationProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'slitSeparationProperty',
      bidirectional: true
    } );

    this.currentSlitPositionFractionProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'slitPositionFractionProperty',
      bidirectional: true
    } );

    this.currentPhotonWaveDisplayModeProperty = new DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'photonWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentMatterWaveDisplayModeProperty = new DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'matterWaveDisplayModeProperty',
      bidirectional: true
    } );

    this.currentSnapshotsProperty = new DynamicProperty<Snapshot[], Snapshot[], BaseSceneModel>( this.sceneProperty, {
      derive: 'snapshotsProperty',
      bidirectional: true
    } );

    this.currentNumberOfSnapshotsProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'numberOfSnapshotsProperty'
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' )
    } );

    this.timeSpeedProperty = new EnumerationProperty( TimeSpeed.NORMAL, {
      validValues: [ TimeSpeed.SLOW, TimeSpeed.NORMAL, TimeSpeed.FAST ],
      tandem: tandem.createTandem( 'timeSpeedProperty' )
    } );

    this.toolsTandem = tandem.createTandem( 'tools' );

    this.isTapeMeasureVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isTapeMeasureVisibleProperty' )
    } );

    this.isStopwatchVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isStopwatchVisibleProperty' )
    } );

    this.isTimePlotVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isTimePlotVisibleProperty' )
    } );

    this.isPositionPlotVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isPositionPlotVisibleProperty' )
    } );

    this.tapeMeasureBasePositionProperty = new Vector2Property( new Vector2( 300, 300 ), {
      tandem: this.toolsTandem.createTandem( 'tapeMeasureBasePositionProperty' )
    } );

    this.tapeMeasureTipPositionProperty = new Vector2Property( new Vector2( 370, 300 ), {
      tandem: this.toolsTandem.createTandem( 'tapeMeasureTipPositionProperty' )
    } );

    this.stopwatch = new Stopwatch( {
      position: new Vector2( 60, 420 ),
      tandem: this.toolsTandem.createTandem( 'stopwatch' ),
      timePropertyOptions: {
        range: Stopwatch.ZERO_TO_ALMOST_SIXTY
      }
    } );
  }

  public abstract takeSnapshot(): void;

  public deleteSnapshot( snapshot: Snapshot ): void {
    this.sceneProperty.value.deleteSnapshot( snapshot );
  }

  public reset(): void {
    this.scenes.forEach( scene => scene.reset() );

    this.isPlayingProperty.reset();
    this.timeSpeedProperty.reset();

    this.resetToolVisibility();
    this.isTapeMeasureVisibleProperty.reset();
    this.isStopwatchVisibleProperty.reset();
    this.isTimePlotVisibleProperty.reset();
    this.isPositionPlotVisibleProperty.reset();

    this.tapeMeasureBasePositionProperty.reset();
    this.tapeMeasureTipPositionProperty.reset();
    this.stopwatch.reset();

    this.sceneProperty.reset();
  }

  protected abstract resetToolVisibility(): void;

  public getNominalStepDt(): number {
    return NOMINAL_DT;
  }

  public getEffectiveDt( dt: number ): number {
    if ( !this.isPlayingProperty.value ) {
      return 0;
    }

    const timeSpeed = this.timeSpeedProperty.value;
    return timeSpeed === TimeSpeed.SLOW ? dt * SLOW_TIME_SPEED_FACTOR :
           timeSpeed === TimeSpeed.FAST ? dt * this.fastTimeSpeedFactor :
           timeSpeed === TimeSpeed.NORMAL ? dt * NORMAL_TIME_SPEED_FACTOR :
           ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
  }

  public stepOnce(): void {
    this.sceneProperty.value.step( NOMINAL_DT );
    this.stopwatch.step( NOMINAL_DT );
  }

  public step( dt: number ): void {
    const effectiveDt = this.getEffectiveDt( dt );
    if ( effectiveDt === 0 ) {
      return;
    }

    this.sceneProperty.value.step( effectiveDt );
    this.stopwatch.step( effectiveDt );
  }
}
