// Copyright 2026, University of Colorado Boulder

/**
 * Abstract base model for the High Intensity and Single Particles screens. Subclasses provide
 * screen-specific Properties and override takeSnapshot() and resetToolVisibility().
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
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
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import { type BarrierType } from './BarrierType.js';
import type BaseSceneModel from './BaseSceneModel.js';
import type { Snapshot } from './Snapshot.js';
import TimeSpeedProperty from './TimeSpeedProperty.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues, type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues, type WaveDisplayMode, WaveDisplayModeValues } from './WaveDisplayMode.js';

const NOMINAL_DT = 1 / 60;
const SLOW_TIME_SPEED_FACTOR = 0.15;

/**
 * Construction options for the shared detector-screen model. The tandem instruments the model's shared Properties
 * and tools.
 */
type BaseScreenModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

/**
 * Dimensionless multipliers that convert elapsed animation time to visual simulation time for the screen's normal
 * and fast time-speed settings. The slow multiplier is shared by both screens.
 */
type TimeSpeedFactors = {
  normal: number;
  fast: number;
};

export default abstract class BaseScreenModel<T extends BaseSceneModel> implements TModel {

  public readonly scenes: T[];
  public readonly sceneProperty: Property<T>;

  // DynamicProperties that follow fields of the active scene
  public readonly currentBarrierTypeProperty: DynamicProperty<BarrierType, BarrierType, BaseSceneModel>;
  public readonly currentIsEmittingProperty: DynamicProperty<boolean, boolean, BaseSceneModel>;
  public readonly currentIsMaxHitsReachedProperty: DynamicProperty<boolean, boolean, BaseSceneModel>;
  public readonly currentIsEmitterEnabledProperty: DynamicProperty<boolean, boolean, BaseSceneModel>;
  public readonly currentWavelengthProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentParticleSpeedProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentScreenBrightnessProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentWaveDisplayModeProperty: DynamicProperty<WaveDisplayMode, WaveDisplayMode, BaseSceneModel>;
  public readonly currentSlitSeparationProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentSlitPositionFractionProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentLeftDetectorHitsProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentRightDetectorHitsProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentTotalHitsProperty: DynamicProperty<number, number, BaseSceneModel>;
  public readonly currentPhotonWaveDisplayModeProperty: DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, BaseSceneModel>;
  public readonly currentMatterWaveDisplayModeProperty: DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, BaseSceneModel>;
  public readonly currentSnapshotsProperty: DynamicProperty<Snapshot[], Snapshot[], BaseSceneModel>;
  public readonly currentNumberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Shared state: time controls (global, not scene-specific)
  public readonly isPlayingProperty: BooleanProperty;
  public readonly timeSpeedProperty: TimeSpeedProperty;

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
  private readonly normalTimeSpeedFactor: number;
  private readonly fastTimeSpeedFactor: number;

  protected constructor( scenes: T[], timeSpeedFactors: TimeSpeedFactors, providedOptions: BaseScreenModelOptions ) {

    const tandem = providedOptions.tandem;

    this.scenes = scenes;
    this.normalTimeSpeedFactor = timeSpeedFactors.normal;
    this.fastTimeSpeedFactor = timeSpeedFactors.fast;

    this.sceneProperty = new Property<T>( scenes[ 0 ], {
      validValues: scenes,
      tandem: tandem.createTandem( 'sceneProperty' ),
      phetioFeatured: true,
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

    this.currentIsEmitterEnabledProperty = new DynamicProperty<boolean, boolean, BaseSceneModel>( this.sceneProperty, {
      derive: 'isEmitterEnabledProperty'
    } );

    this.currentWavelengthProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'wavelengthProperty'
    } );

    this.currentParticleSpeedProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'particleSpeedProperty'
    } );

    this.currentScreenBrightnessProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'screenBrightnessProperty',
      bidirectional: true
    } );

    this.currentWaveDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'activeWaveDisplayModeProperty',
      tandem: tandem.createTandem( 'currentWaveDisplayModeProperty' ),
      phetioFeatured: true,
      phetioReadOnly: true,
      phetioState: false,
      phetioDocumentation: 'The wave display mode currently shown in the wave area, unified across photon and matter ' +
                           'scenes. To change the mode, set currentPhotonWaveDisplayModeProperty or ' +
                           'currentMatterWaveDisplayModeProperty.',
      phetioValueType: StringUnionIO( WaveDisplayModeValues ),
      validValues: WaveDisplayModeValues
    } );

    this.currentSlitSeparationProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'slitSeparationProperty',
      bidirectional: true
    } );

    this.currentSlitPositionFractionProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'slitPositionFractionProperty',
      bidirectional: true
    } );

    this.currentLeftDetectorHitsProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'leftDetectorHitsProperty'
    } );

    this.currentRightDetectorHitsProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'rightDetectorHitsProperty'
    } );

    this.currentTotalHitsProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'totalHitsProperty'
    } );

    this.currentPhotonWaveDisplayModeProperty = new DynamicProperty<PhotonWaveDisplayMode, PhotonWaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'photonWaveDisplayModeProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentPhotonWaveDisplayModeProperty' ),
      phetioFeatured: false,
      phetioValueType: StringUnionIO( PhotonWaveDisplayModeValues ),
      validValues: PhotonWaveDisplayModeValues
    } );

    this.currentMatterWaveDisplayModeProperty = new DynamicProperty<MatterWaveDisplayMode, MatterWaveDisplayMode, BaseSceneModel>( this.sceneProperty, {
      derive: 'matterWaveDisplayModeProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentMatterWaveDisplayModeProperty' ),
      phetioFeatured: false,
      phetioValueType: StringUnionIO( MatterWaveDisplayModeValues ),
      validValues: MatterWaveDisplayModeValues
    } );

    this.currentSnapshotsProperty = new DynamicProperty<Snapshot[], Snapshot[], BaseSceneModel>( this.sceneProperty, {
      derive: 'snapshotsProperty',
      bidirectional: true
    } );

    this.currentNumberOfSnapshotsProperty = new DynamicProperty<number, number, BaseSceneModel>( this.sceneProperty, {
      derive: 'numberOfSnapshotsProperty'
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' ),
      phetioFeatured: true
    } );

    this.timeSpeedProperty = new TimeSpeedProperty( tandem.createTandem( 'timeSpeedProperty' ) );

    this.toolsTandem = tandem.createTandem( 'tools' );

    this.isTapeMeasureVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isTapeMeasureVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isStopwatchVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isStopwatchVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isTimePlotVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isTimePlotVisibleProperty' ),
      phetioFeatured: true
    } );

    this.isPositionPlotVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isPositionPlotVisibleProperty' ),
      phetioFeatured: true
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

  /**
   * Deletes a snapshot from the active scene. Used by shared view code that works with the current scene through this
   * screen-level model instead of directly owning a scene model reference.
   *
   * @param snapshot - snapshot to delete from the active scene
   */
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

  /**
   * Returns the fixed visual time interval used by the step-forward control, in seconds. Screen views use this value
   * to keep their time plots synchronized with stepOnce().
   *
   * @returns the nominal visual time step, in seconds
   */
  public getNominalStepDt(): number {
    return NOMINAL_DT;
  }

  /**
   * Converts elapsed animation-frame time to the visual simulation time used to advance the active scene.
   * Returns zero while playback is paused. Otherwise, the elapsed time is scaled by the selected time speed
   * and the screen-specific speed factors so the wave animation advances at the intended visual rate.
   *
   * @param dt - elapsed real time, in seconds
   * @returns the visual simulation time step, in seconds, for the active scene
   */
  public getEffectiveDt( dt: number ): number {
    if ( !this.isPlayingProperty.value ) {
      return 0;
    }

    const timeSpeed = this.timeSpeedProperty.value;
    return timeSpeed === TimeSpeed.SLOW ? dt * SLOW_TIME_SPEED_FACTOR :
           timeSpeed === TimeSpeed.FAST ? dt * this.fastTimeSpeedFactor :
           timeSpeed === TimeSpeed.NORMAL ? dt * this.normalTimeSpeedFactor :
           ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
  }

  /**
   * Advances the active scene by one nominal visual time step when the step-forward control is pressed, independent
   * of the play state and selected time speed. The stopwatch advances by the corresponding physical time reported by
   * the scene, in seconds, when that interval is positive.
   */
  public stepOnce(): void {
    const scene = this.sceneProperty.value;
    scene.step( NOMINAL_DT );

    const physicalDt = scene.getPhysicalDt( NOMINAL_DT );
    if ( physicalDt > 0 ) {
      this.stopwatch.step( physicalDt );
    }
  }

  /**
   * Advances the active scene for one animation frame. joist supplies elapsed real time in seconds, which is converted
   * to visual simulation time using the play state and selected time-speed scaling. The stopwatch advances by the
   * corresponding physical time reported by the scene, in seconds. Neither the scene nor stopwatch advances while
   * paused, and the stopwatch does not advance when the scene reports a nonpositive physical interval.
   *
   * @param dt - elapsed real time since the previous animation frame, in seconds
   */
  public step( dt: number ): void {
    const effectiveDt = this.getEffectiveDt( dt );
    if ( effectiveDt === 0 ) {
      return;
    }

    const scene = this.sceneProperty.value;
    scene.step( effectiveDt );

    const physicalDt = scene.getPhysicalDt( effectiveDt );
    if ( physicalDt > 0 ) {
      this.stopwatch.step( physicalDt );
    }
  }
}
