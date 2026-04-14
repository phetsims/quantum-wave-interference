// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensitySceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the High Intensity screen.
 *
 * Each scene independently tracks source state, obstacle state, slit geometry, wave display mode,
 * wave solver, detection mode, screen brightness, hit accumulation, and snapshots.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
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
import AnalyticalWaveSolver from '../../common/model/AnalyticalWaveSolver.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { type ObstacleType, ObstacleTypeValues } from '../../common/model/ObstacleType.js';
import { hasAnyDetector } from '../../common/model/SlitConfiguration.js';
import { hasDetectorOnSide } from '../../common/model/SlitConfiguration.js';
import { type SlitConfiguration, SlitConfigurationValues } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues } from '../../common/model/WaveDisplayMode.js';
import { type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues } from '../../common/model/WaveDisplayMode.js';
import { type WaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import type WaveSolver from '../../common/model/WaveSolver.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import Snapshot from '../../experiment/model/Snapshot.js';

const MAX_EMISSION_RATE = 100;
const MAX_REJECTION_ITERATIONS = 1000;
const SINGLE_OPEN_SLIT_INTENSITY_SCALE = 0.5;
const HIT_VERTICAL_EXTENT = 0.95;
const MAX_HITS = 25000;
const MAX_SNAPSHOTS = 4;
const TARGET_VISIBLE_FRINGES = 5;
const DEFAULT_PHOTON_WAVELENGTH_NM = 650;

type SelfOptions = {
  sourceType: SourceType;
};

export type HighIntensitySceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensitySceneModel extends PhetioObject {

  public readonly sourceType: SourceType;

  public readonly isEmittingProperty: BooleanProperty;
  public readonly wavelengthProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;
  public readonly intensityProperty: NumberProperty;
  public readonly obstacleTypeProperty: StringUnionProperty<ObstacleType>;
  public readonly slitConfigurationProperty: StringUnionProperty<SlitConfiguration>;
  public readonly slitSeparationProperty: NumberProperty;

  // Slit x-position as a fraction of the wave visualization region width (0 = left, 1 = right)
  public readonly slitPositionFractionProperty: NumberProperty;

  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;
  public readonly screenBrightnessProperty: NumberProperty;
  public readonly photonWaveDisplayModeProperty: StringUnionProperty<PhotonWaveDisplayMode>;
  public readonly matterWaveDisplayModeProperty: StringUnionProperty<MatterWaveDisplayMode>;
  public readonly slitWidth: number; // mm, constant per source type
  public readonly velocityRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly screenHalfWidth: number; // meters
  public readonly waveSolver: WaveSolver;

  public readonly hits: Vector2[];
  public readonly totalHitsProperty: NumberProperty;
  public readonly leftDetectorHitsProperty: NumberProperty;
  public readonly rightDetectorHitsProperty: NumberProperty;
  public readonly hitsChangedEmitter: TEmitter;

  // True when Hits mode has reached the hit cap
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // The active wave display mode for this scene, derived from source type
  public readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;

  // Whether the wave field should be rendered in the visualization region (satisfies WaveVisualizableScene)
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  // Snapshots
  public readonly snapshotsProperty: Property<Snapshot[]>;
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;
  private nextSnapshotNumber: number;

  private readonly particleMass: number;
  private hitAccumulator: number;

  // Physical dimensions of the wave visualization region (meters), set per source type
  private readonly regionWidth: number;
  private readonly regionHeight: number;

  // Effective slit-to-screen distance (meters) for interference calculations at the default slit position.
  // Chosen per source type so that ~5 fringes are visible on the detector screen at default parameters.
  private readonly baseEffectiveScreenDistance: number;

  public constructor( providedOptions: HighIntensitySceneModelOptions ) {

    const options = optionize<HighIntensitySceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;
    const tandem = options.tandem;

    // Per-source-type constants
    this.slitWidth = this.getSlitWidthForSourceType();
    this.screenHalfWidth = this.getScreenHalfWidthForSourceType();

    let defaultVelocity: number;
    let defaultSlitSeparation: number;

    if ( options.sourceType === 'photons' ) {
      this.particleMass = 0;
      this.velocityRange = new Range( 0, 0 );
      this.slitSeparationRange = new Range( 0.05, 0.5 ); // mm
      defaultVelocity = 0;
      defaultSlitSeparation = 0.25;
      this.regionWidth = 0.04; // 4 cm
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

    // L = screenHalfWidth * d / ( targetFringes * λ ), so ~TARGET_VISIBLE_FRINGES fringes fit per half-screen.
    const defaultLambda = options.sourceType === 'photons'
      ? DEFAULT_PHOTON_WAVELENGTH_NM * 1e-9
      : QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * defaultVelocity );
    this.baseEffectiveScreenDistance = this.screenHalfWidth * ( defaultSlitSeparation * 1e-3 ) /
                                      ( TARGET_VISIBLE_FRINGES * defaultLambda );

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();
    this.hitAccumulator = 0;

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    this.isWaveVisibleProperty = this.isEmittingProperty;

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

    this.intensityProperty = new NumberProperty( 0.5, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'intensityProperty' )
    } );

    this.obstacleTypeProperty = new StringUnionProperty<ObstacleType>( 'none', {
      validValues: ObstacleTypeValues,
      tandem: tandem.createTandem( 'obstacleTypeProperty' )
    } );

    this.slitConfigurationProperty = new StringUnionProperty<SlitConfiguration>( 'bothOpen', {
      validValues: SlitConfigurationValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' )
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

    this.detectionModeProperty = new StringUnionProperty<DetectionMode>( 'averageIntensity', {
      validValues: DetectionModeValues,
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this.screenBrightnessProperty = new NumberProperty( 0.125, {
      range: new Range( 0, 0.25 ),
      tandem: tandem.createTandem( 'screenBrightnessProperty' )
    } );

    this.photonWaveDisplayModeProperty = new StringUnionProperty<PhotonWaveDisplayMode>( 'electricField', {
      validValues: PhotonWaveDisplayModeValues,
      tandem: tandem.createTandem( 'photonWaveDisplayModeProperty' )
    } );

    this.matterWaveDisplayModeProperty = new StringUnionProperty<MatterWaveDisplayMode>( 'magnitude', {
      validValues: MatterWaveDisplayModeValues,
      tandem: tandem.createTandem( 'matterWaveDisplayModeProperty' )
    } );

    this.activeWaveDisplayModeProperty = new DerivedProperty(
      [ this.photonWaveDisplayModeProperty, this.matterWaveDisplayModeProperty ],
      ( photonMode, matterMode ) =>
        this.sourceType === 'photons' ? photonMode : matterMode
    );

    this.totalHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalHitsProperty' ),
      phetioReadOnly: true
    } );

    this.leftDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.rightDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits >= MAX_HITS
    );

    this.isEmitterEnabledProperty = this.isMaxHitsReachedProperty.derived( isMax => !isMax );

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

    // Create the wave solver based on the query parameter
    // Both solver types use the analytical solver for now; the lattice solver will be a separate implementation.
    // See https://github.com/phetsims/turing/issues/7
    this.waveSolver = new AnalyticalWaveSolver();

    this.syncSolverParameters();

    // Clear accumulated data when any parameter that affects the interference pattern changes.
    // clearScreen() also calls syncSolverParameters(), so no separate sync listeners needed for these.
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );
    this.intensityProperty.lazyLink( () => this.clearScreen() );
    this.obstacleTypeProperty.lazyLink( () => this.clearScreen() );
    this.slitConfigurationProperty.lazyLink( () => this.clearScreen() );
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.slitPositionFractionProperty.lazyLink( () => this.clearScreen() );

    // isEmittingProperty does not clear the screen but does need solver sync
    this.isEmittingProperty.lazyLink( () => this.syncSolverParameters() );

    // Stop the source when the hit cap is reached
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );
  }

  /**
   * Returns the effective wavelength in meters for interference calculations.
   */
  public getEffectiveWavelength(): number {
    if ( this.sourceType === 'photons' ) {
      return this.wavelengthProperty.value * 1e-9;
    }
    const velocity = this.velocityProperty.value;
    return velocity === 0 ? 0 :
           QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * velocity );
  }

  /**
   * Returns the effective wave speed in m/s.
   */
  public getEffectiveWaveSpeed(): number {
    return this.sourceType === 'photons' ? 3e8 : this.velocityProperty.value;
  }

  /**
   * Push current physical parameters to the wave solver.
   */
  private syncSolverParameters(): void {
    const slitConfig = this.slitConfigurationProperty.value;
    const isTopOpen = slitConfig !== 'leftCovered';
    const isBottomOpen = slitConfig !== 'rightCovered';

    this.waveSolver.setParameters( {
      wavelength: this.getEffectiveWavelength(),
      waveSpeed: this.getEffectiveWaveSpeed(),
      obstacleType: this.obstacleTypeProperty.value,
      slitSeparation: this.slitSeparationProperty.value * 1e-3,
      slitWidth: this.slitWidth * 1e-3,
      barrierFractionX: this.slitPositionFractionProperty.value,
      isTopSlitOpen: isTopOpen,
      isBottomSlitOpen: isBottomOpen,
      isSourceOn: this.isEmittingProperty.value,
      regionWidth: this.regionWidth,
      regionHeight: this.regionHeight
    } );
  }

  private getEffectiveScreenDistance(): number {
    return ( 1 - this.slitPositionFractionProperty.value ) * 2 * this.baseEffectiveScreenDistance;
  }

  /**
   * Computes the intensity at a given position on the detector screen.
   */
  public getIntensityAtPosition( positionOnScreen: number ): number {
    const lambda = this.getEffectiveWavelength();
    if ( lambda === 0 ) {
      return 0;
    }

    if ( this.obstacleTypeProperty.value === 'none' ) {
      return 1;
    }

    const slitSeparationMeters = this.slitSeparationProperty.value * 1e-3;
    const slitWidthMeters = this.slitWidth * 1e-3;
    const screenDistanceMeters = this.getEffectiveScreenDistance();

    const sinTheta = positionOnScreen / Math.sqrt( positionOnScreen * positionOnScreen + screenDistanceMeters * screenDistanceMeters );

    // Single-slit diffraction envelope
    const singleSlitArg = Math.PI * slitWidthMeters * sinTheta / lambda;
    const singleSlitFactor = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

    const slitConfig = this.slitConfigurationProperty.value;

    if ( slitConfig === 'leftCovered' || slitConfig === 'rightCovered' ) {
      const uncoveredSlitOffsetMeters = slitConfig === 'leftCovered' ? slitSeparationMeters / 2 :
                                        -slitSeparationMeters / 2;
      const shiftedPosition = positionOnScreen - uncoveredSlitOffsetMeters;
      const shiftedSinTheta = shiftedPosition /
                              Math.sqrt( shiftedPosition * shiftedPosition + screenDistanceMeters * screenDistanceMeters );
      const shiftedArg = Math.PI * slitWidthMeters * shiftedSinTheta / lambda;
      return SINGLE_OPEN_SLIT_INTENSITY_SCALE * (
        shiftedArg === 0 ? 1 : Math.pow( Math.sin( shiftedArg ) / shiftedArg, 2 )
      );
    }

    if ( hasAnyDetector( slitConfig ) ) {
      return singleSlitFactor;
    }

    // Both open: double-slit interference modulated by single-slit envelope
    const doubleSlitArg = Math.PI * slitSeparationMeters * sinTheta / lambda;
    const doubleSlitFactor = Math.pow( Math.cos( doubleSlitArg ), 2 );
    return doubleSlitFactor * singleSlitFactor;
  }

  /**
   * Clears accumulated hits and resets the wave solver.
   */
  public clearScreen(): void {
    this.hits.length = 0;
    this.hitAccumulator = 0;
    this.totalHitsProperty.value = 0;
    this.leftDetectorHitsProperty.value = 0;
    this.rightDetectorHitsProperty.value = 0;
    this.waveSolver.reset();
    this.syncSolverParameters();
    this.hitsChangedEmitter.emit();
  }

  /**
   * Takes a snapshot of the current detector screen state.
   */
  public takeSnapshot(): void {
    if ( this.snapshotsProperty.value.length >= MAX_SNAPSHOTS ) {
      return;
    }

    const snapshot = new Snapshot( this.nextSnapshotNumber++, [ ...this.hits ], {
      detectionMode: this.detectionModeProperty.value,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.slitPositionFractionProperty.value * this.regionWidth,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: this.slitConfigurationProperty.value,
      isEmitting: this.isEmittingProperty.value,
      brightness: this.screenBrightnessProperty.value,
      intensity: this.intensityProperty.value
    } );

    this.snapshotsProperty.value = [ ...this.snapshotsProperty.value, snapshot ];
  }

  /**
   * Deletes a specific snapshot.
   */
  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = this.snapshotsProperty.value.filter( s => s !== snapshot );
  }

  /**
   * Generates a random hit position using rejection sampling from the interference pattern.
   */
  private generateHitPosition(): number {
    for ( let i = 0; i < MAX_REJECTION_ITERATIONS; i++ ) {
      const physicalX = ( dotRandom.nextDouble() - 0.5 ) * 2 * this.screenHalfWidth;
      const probability = this.getIntensityAtPosition( physicalX );
      if ( dotRandom.nextDouble() < probability ) {
        return physicalX / this.screenHalfWidth;
      }
    }
    return 0;
  }

  /**
   * Steps the scene forward in time: advances the wave solver and accumulates hits.
   */
  public step( dt: number ): void {

    // Always step the wave solver so animation continues
    if ( this.isEmittingProperty.value ) {
      this.waveSolver.step( dt );
    }

    // Accumulate hits when emitting in hits mode
    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value ||
      dt > 0.5
    ) {
      return;
    }

    const rate = MAX_EMISSION_RATE * this.intensityProperty.value;
    this.hitAccumulator += rate * dt;
    const numHits = Math.floor( this.hitAccumulator );
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const slitConfig = this.slitConfigurationProperty.value;
    const isDetectorActive = hasAnyDetector( slitConfig );
    let actualHits = 0;
    let leftHits = 0;
    let rightHits = 0;

    for ( let i = 0; i < numHits; i++ ) {
      if ( this.totalHitsProperty.value + actualHits >= MAX_HITS ) {
        break;
      }

      const x = this.generateHitPosition();
      const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * HIT_VERTICAL_EXTENT;
      this.hits.push( new Vector2( x, y ) );
      actualHits++;

      if ( isDetectorActive ) {
        const side = dotRandom.nextDouble() < 0.5 ? 'left' : 'right';
        if ( hasDetectorOnSide( slitConfig, side ) ) {
          if ( side === 'left' ) { leftHits++; }
          else { rightHits++; }
        }
      }
    }

    if ( actualHits > 0 ) {
      this.totalHitsProperty.value += actualHits;
      if ( isDetectorActive ) {
        this.leftDetectorHitsProperty.value += leftHits;
        this.rightDetectorHitsProperty.value += rightHits;
      }
      this.hitsChangedEmitter.emit();
    }
  }

  /**
   * Resets all scene state to initial values.
   */
  public reset(): void {
    this.isEmittingProperty.reset();
    this.wavelengthProperty.reset();
    this.velocityProperty.reset();
    this.intensityProperty.reset();
    this.obstacleTypeProperty.reset();
    this.slitConfigurationProperty.reset();
    this.slitSeparationProperty.reset();
    this.slitPositionFractionProperty.reset();
    this.detectionModeProperty.reset();
    this.screenBrightnessProperty.reset();
    this.photonWaveDisplayModeProperty.reset();
    this.matterWaveDisplayModeProperty.reset();
    this.hits.length = 0;
    this.hitAccumulator = 0;
    this.totalHitsProperty.reset();
    this.leftDetectorHitsProperty.reset();
    this.rightDetectorHitsProperty.reset();
    this.waveSolver.reset();
    this.syncSolverParameters();
    this.snapshotsProperty.value = [];
    this.nextSnapshotNumber = 1;
    this.hitsChangedEmitter.emit();
  }

  private getSlitWidthForSourceType(): number {
    return this.sourceType === 'photons' ? 0.02 :
           this.sourceType === 'electrons' ? 0.00003 :
           this.sourceType === 'neutrons' ? 0.003 :
           this.sourceType === 'heliumAtoms' ? 0.0003 :
           ( () => { throw new Error( `Unrecognized sourceType: ${this.sourceType}` ); } )();
  }

  private getScreenHalfWidthForSourceType(): number {
    return this.sourceType === 'neutrons' || this.sourceType === 'heliumAtoms' ? 4e-4 : 0.02;
  }
}
