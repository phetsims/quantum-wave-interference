// Copyright 2026, University of Colorado Boulder

/**
 * BaseSceneModel is the abstract base class for scene models shared between the High Intensity and
 * Single Particles screens. It holds source-type-specific constants, shared properties, the wave
 * solver, hit management, snapshot management, and physics calculations.
 *
 * Subclasses add screen-specific properties and implement abstract methods for intensity calculations.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type DetectionMode } from './DetectionMode.js';
import { type ObstacleType, ObstacleTypeValues } from './ObstacleType.js';
import { type SlitConfiguration } from './SlitConfiguration.js';
import { type SourceType } from './SourceType.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues } from './WaveDisplayMode.js';
import { type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues } from './WaveDisplayMode.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';
import type WaveSolver from './WaveSolver.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import Snapshot from '../../experiment/model/Snapshot.js';

export const MAX_REJECTION_ITERATIONS = 1000;
export const HIT_VERTICAL_EXTENT = 0.95;
export const MAX_HITS = 25000;
const MAX_SNAPSHOTS = 4;
const TARGET_VISIBLE_FRINGES = 5;
const DEFAULT_PHOTON_WAVELENGTH_NM = 650;

type SelfOptions = {
  sourceType: SourceType;
  defaultPhotonWaveDisplayMode?: PhotonWaveDisplayMode;
};

export type BaseSceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default abstract class BaseSceneModel extends PhetioObject {

  public readonly sourceType: SourceType;
  protected readonly particleMass: number;
  public readonly slitWidth: number;
  public readonly screenHalfWidth: number;
  public readonly velocityRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly regionWidth: number;
  public readonly regionHeight: number;
  protected readonly baseEffectiveScreenDistance: number;

  public readonly isEmittingProperty: BooleanProperty;
  public readonly wavelengthProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;
  public readonly obstacleTypeProperty: StringUnionProperty<ObstacleType>;
  public readonly slitSeparationProperty: NumberProperty;
  public readonly slitPositionFractionProperty: NumberProperty;
  public readonly screenBrightnessProperty: NumberProperty;
  public readonly photonWaveDisplayModeProperty: StringUnionProperty<PhotonWaveDisplayMode>;
  public readonly matterWaveDisplayModeProperty: StringUnionProperty<MatterWaveDisplayMode>;
  public readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  public readonly waveSolver: WaveSolver;
  public readonly hits: Vector2[];
  public readonly totalHitsProperty: NumberProperty;
  public readonly hitsChangedEmitter: TEmitter;
  public readonly snapshotsProperty: Property<Snapshot[]>;
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;
  protected nextSnapshotNumber: number;

  // Guard to prevent cascading clearScreen calls during reset
  private isResetting: boolean;

  protected constructor( waveSolver: WaveSolver, providedOptions: BaseSceneModelOptions ) {

    const options = optionize<BaseSceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false,
      defaultPhotonWaveDisplayMode: 'electricField'
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;
    this.isResetting = false;
    const tandem = options.tandem;

    this.slitWidth = getSlitWidthForSourceType( this.sourceType );
    this.screenHalfWidth = getScreenHalfWidthForSourceType( this.sourceType );
    this.waveSolver = waveSolver;

    let defaultVelocity: number;
    let defaultSlitSeparation: number;

    if ( options.sourceType === 'photons' ) {
      this.particleMass = 0;
      this.velocityRange = new Range( 0, 0 );
      this.slitSeparationRange = new Range( 0.05, 0.5 );
      defaultVelocity = 0;
      defaultSlitSeparation = 0.25;
      this.regionWidth = 0.04;
      this.regionHeight = 0.04;
    }
    else if ( options.sourceType === 'electrons' ) {
      this.particleMass = QuantumWaveInterferenceConstants.ELECTRON_MASS;
      this.velocityRange = new Range( 7e5, 1.5e6 );
      this.slitSeparationRange = new Range( 0.0001, 0.0009 );
      defaultVelocity = 1.1e6;
      defaultSlitSeparation = 0.0005;
      this.regionWidth = 8e-4;
      this.regionHeight = 8e-4;
    }
    else if ( options.sourceType === 'neutrons' ) {
      this.particleMass = QuantumWaveInterferenceConstants.NEUTRON_MASS;
      this.velocityRange = new Range( 200, 800 );
      this.slitSeparationRange = new Range( 0.01, 0.07 );
      defaultVelocity = 500;
      defaultSlitSeparation = 0.04;
      this.regionWidth = 8e-4;
      this.regionHeight = 8e-4;
    }
    else {
      this.particleMass = QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS;
      this.velocityRange = new Range( 400, 2000 );
      this.slitSeparationRange = new Range( 0.001, 0.007 );
      defaultVelocity = 1200;
      defaultSlitSeparation = 0.004;
      this.regionWidth = 8e-4;
      this.regionHeight = 8e-4;
    }

    const defaultLambda = options.sourceType === 'photons'
      ? DEFAULT_PHOTON_WAVELENGTH_NM * 1e-9
      : QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * defaultVelocity );
    this.baseEffectiveScreenDistance = this.screenHalfWidth * ( defaultSlitSeparation * 1e-3 ) /
                                      ( TARGET_VISIBLE_FRINGES * defaultLambda );

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    this.wavelengthProperty = new NumberProperty( options.sourceType === 'photons' ? DEFAULT_PHOTON_WAVELENGTH_NM : 0, {
      range: options.sourceType === 'photons' ? new Range( 380, 780 ) : new Range( 0, 0 ),
      units: 'nm',
      tandem: tandem.createTandem( 'wavelengthProperty' )
    } );

    this.velocityProperty = new NumberProperty( defaultVelocity, {
      range: this.velocityRange,
      units: 'm/s',
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    this.obstacleTypeProperty = new StringUnionProperty<ObstacleType>( 'none', {
      validValues: ObstacleTypeValues,
      tandem: tandem.createTandem( 'obstacleTypeProperty' )
    } );

    this.slitSeparationProperty = new NumberProperty( defaultSlitSeparation, {
      range: this.slitSeparationRange,
      units: 'mm',
      tandem: tandem.createTandem( 'slitSeparationProperty' )
    } );

    this.slitPositionFractionProperty = new NumberProperty( 0.5, {
      range: new Range( 0.2, 0.8 ),
      tandem: tandem.createTandem( 'slitPositionFractionProperty' )
    } );

    this.screenBrightnessProperty = new NumberProperty( 0.125, {
      range: new Range( 0, 0.25 ),
      tandem: tandem.createTandem( 'screenBrightnessProperty' )
    } );

    this.photonWaveDisplayModeProperty = new StringUnionProperty<PhotonWaveDisplayMode>(
      options.sourceType === 'photons' ? options.defaultPhotonWaveDisplayMode : 'electricField', {
        validValues: PhotonWaveDisplayModeValues,
        tandem: tandem.createTandem( 'photonWaveDisplayModeProperty' )
      } );

    this.matterWaveDisplayModeProperty = new StringUnionProperty<MatterWaveDisplayMode>( 'magnitude', {
      validValues: MatterWaveDisplayModeValues,
      tandem: tandem.createTandem( 'matterWaveDisplayModeProperty' )
    } );

    // Since sourceType is fixed per instance, just alias the relevant property
    this.activeWaveDisplayModeProperty = this.sourceType === 'photons'
      ? this.photonWaveDisplayModeProperty
      : this.matterWaveDisplayModeProperty;

    this.totalHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalHitsProperty' ),
      phetioReadOnly: true
    } );

    this.snapshotsProperty = new Property<Snapshot[]>( [], {
      tandem: tandem.createTandem( 'snapshotsProperty' ),
      phetioValueType: ArrayIO( Snapshot.SnapshotIO )
    } );

    this.numberOfSnapshotsProperty = new DerivedProperty(
      [ this.snapshotsProperty ],
      snapshots => snapshots.length, {
        tandem: tandem.createTandem( 'numberOfSnapshotsProperty' ),
        phetioValueType: NumberIO
      }
    );

    this.nextSnapshotNumber = 1;
  }

  public getEffectiveWavelength(): number {
    if ( this.sourceType === 'photons' ) {
      return this.wavelengthProperty.value * 1e-9;
    }
    const velocity = this.velocityProperty.value;
    return velocity === 0 ? 0 :
           QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * velocity );
  }

  public getEffectiveWaveSpeed(): number {
    return this.sourceType === 'photons' ? 3e8 : this.velocityProperty.value;
  }

  protected getEffectiveScreenDistance(): number {
    return ( 1 - this.slitPositionFractionProperty.value ) * 2 * this.baseEffectiveScreenDistance;
  }

  protected abstract isTopSlitOpen(): boolean;

  protected abstract isBottomSlitOpen(): boolean;

  public abstract getIntensityAtPosition( positionOnScreen: number ): number;

  protected computeDoubleSlitIntensity( positionOnScreen: number ): number {
    const lambda = this.getEffectiveWavelength();
    if ( lambda === 0 ) {
      return 0;
    }

    const slitSeparationMeters = this.slitSeparationProperty.value * 1e-3;
    const slitWidthMeters = this.slitWidth * 1e-3;
    const screenDistanceMeters = this.getEffectiveScreenDistance();

    const sinTheta = positionOnScreen / Math.sqrt( positionOnScreen * positionOnScreen + screenDistanceMeters * screenDistanceMeters );

    const singleSlitArg = Math.PI * slitWidthMeters * sinTheta / lambda;
    const singleSlitFactor = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

    const doubleSlitArg = Math.PI * slitSeparationMeters * sinTheta / lambda;
    const doubleSlitFactor = Math.pow( Math.cos( doubleSlitArg ), 2 );
    return doubleSlitFactor * singleSlitFactor;
  }

  protected computeSingleSlitIntensity( positionOnScreen: number, slitOffsetMeters: number ): number {
    const lambda = this.getEffectiveWavelength();
    if ( lambda === 0 ) {
      return 0;
    }

    const slitWidthMeters = this.slitWidth * 1e-3;
    const screenDistanceMeters = this.getEffectiveScreenDistance();
    const shiftedPosition = positionOnScreen - slitOffsetMeters;
    const shiftedSinTheta = shiftedPosition /
                            Math.sqrt( shiftedPosition * shiftedPosition + screenDistanceMeters * screenDistanceMeters );
    const shiftedArg = Math.PI * slitWidthMeters * shiftedSinTheta / lambda;
    return shiftedArg === 0 ? 1 : Math.pow( Math.sin( shiftedArg ) / shiftedArg, 2 );
  }

  protected syncSolverParameters(): void {
    this.waveSolver.setParameters( {
      wavelength: this.getEffectiveWavelength(),
      waveSpeed: this.getEffectiveWaveSpeed(),
      obstacleType: this.obstacleTypeProperty.value,
      slitSeparation: this.slitSeparationProperty.value * 1e-3,
      slitWidth: this.slitWidth * 1e-3,
      barrierFractionX: this.slitPositionFractionProperty.value,
      isTopSlitOpen: this.isTopSlitOpen(),
      isBottomSlitOpen: this.isBottomSlitOpen(),
      isSourceOn: this.isEmittingProperty.value,
      regionWidth: this.regionWidth,
      regionHeight: this.regionHeight
    } );
  }

  protected generateHitPosition(): number {
    for ( let i = 0; i < MAX_REJECTION_ITERATIONS; i++ ) {
      const physicalX = ( dotRandom.nextDouble() - 0.5 ) * 2 * this.screenHalfWidth;
      const probability = this.getIntensityAtPosition( physicalX );
      if ( dotRandom.nextDouble() < probability ) {
        return physicalX / this.screenHalfWidth;
      }
    }
    return 0;
  }

  public clearScreen(): void {
    if ( this.isResetting ) {
      return;
    }
    this.hits.length = 0;
    this.totalHitsProperty.value = 0;
    this.waveSolver.reset();
    this.syncSolverParameters();
    this.hitsChangedEmitter.emit();
  }

  protected setupClearScreenListeners(): void {
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );
    this.obstacleTypeProperty.lazyLink( () => this.clearScreen() );
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.slitPositionFractionProperty.lazyLink( () => this.clearScreen() );

    this.isEmittingProperty.lazyLink( () => this.syncSolverParameters() );
  }

  public takeSnapshot( detectionMode: DetectionMode, slitSetting: SlitConfiguration, intensity: number ): void {
    if ( this.snapshotsProperty.value.length >= MAX_SNAPSHOTS ) {
      return;
    }

    const snapshot = new Snapshot( this.nextSnapshotNumber++, [ ...this.hits ], {
      detectionMode: detectionMode,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.slitPositionFractionProperty.value * this.regionWidth,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: slitSetting,
      isEmitting: this.isEmittingProperty.value,
      brightness: this.screenBrightnessProperty.value,
      intensity: intensity
    } );

    this.snapshotsProperty.value = [ ...this.snapshotsProperty.value, snapshot ];
  }

  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = this.snapshotsProperty.value.filter( s => s !== snapshot );
  }

  /**
   * Resets base properties with a guard to prevent cascading clearScreen calls from property listeners.
   * Subclasses should override reset() and call super.reset() at the start.
   */
  public reset(): void {
    this.isResetting = true;

    this.isEmittingProperty.reset();
    this.wavelengthProperty.reset();
    this.velocityProperty.reset();
    this.obstacleTypeProperty.reset();
    this.slitSeparationProperty.reset();
    this.slitPositionFractionProperty.reset();
    this.screenBrightnessProperty.reset();
    this.photonWaveDisplayModeProperty.reset();
    this.matterWaveDisplayModeProperty.reset();
    this.hits.length = 0;
    this.totalHitsProperty.reset();
    this.waveSolver.reset();
    this.snapshotsProperty.value = [];
    this.nextSnapshotNumber = 1;

    this.isResetting = false;
    this.hitsChangedEmitter.emit();
  }
}

function getSlitWidthForSourceType( sourceType: SourceType ): number {
  return sourceType === 'photons' ? 0.02 :
         sourceType === 'electrons' ? 0.00003 :
         sourceType === 'neutrons' ? 0.003 :
         sourceType === 'heliumAtoms' ? 0.0003 :
         ( () => { throw new Error( `Unrecognized sourceType: ${sourceType}` ); } )();
}

function getScreenHalfWidthForSourceType( sourceType: SourceType ): number {
  return sourceType === 'neutrons' || sourceType === 'heliumAtoms' ? 4e-4 : 0.02;
}
