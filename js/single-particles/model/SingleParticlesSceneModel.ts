// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesSceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the Single Particles screen.
 *
 * Each scene independently tracks source state, obstacle state, slit geometry, wave display mode,
 * wave solver, screen brightness, hit accumulation, and snapshots.
 *
 * Key differences from HighIntensitySceneModel:
 * - Always in Hits mode (no detection mode toggle)
 * - No intensity control
 * - Single-packet emission with auto-repeat
 * - No slit detector configurations
 * - Supports a detector tool (only when obstacle is None)
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
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import AnalyticalWavePacketSolver, { PACKET_TRAVERSAL_TIME } from '../../common/model/AnalyticalWavePacketSolver.js';
import { type ObstacleType, ObstacleTypeValues } from '../../common/model/ObstacleType.js';
import { type SourceType } from '../../common/model/SourceType.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues } from '../../common/model/WaveDisplayMode.js';
import { type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues } from '../../common/model/WaveDisplayMode.js';
import { type WaveDisplayMode } from '../../common/model/WaveDisplayMode.js';
import type WaveSolver from '../../common/model/WaveSolver.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import Snapshot from '../../experiment/model/Snapshot.js';

export const SingleParticlesSlitConfigurationValues = [ 'bothOpen', 'leftCovered', 'rightCovered' ] as const;
export type SingleParticlesSlitConfiguration = typeof SingleParticlesSlitConfigurationValues[number];

export const DetectorToolStateValues = [ 'ready', 'detected', 'notDetected' ] as const;
export type DetectorToolState = typeof DetectorToolStateValues[number];

const MAX_REJECTION_ITERATIONS = 1000;
const HIT_VERTICAL_EXTENT = 0.95;
const MAX_HITS = 25000;
const MAX_SNAPSHOTS = 4;

// Minimum time between packet emissions (seconds of sim time)
const MIN_EMISSION_INTERVAL = 0.3;

type SelfOptions = {
  sourceType: SourceType;
};

export type SingleParticlesSceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SingleParticlesSceneModel extends PhetioObject {

  public readonly sourceType: SourceType;

  public readonly isEmittingProperty: BooleanProperty;
  public readonly autoRepeatProperty: BooleanProperty;
  public readonly wavelengthProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;
  public readonly obstacleTypeProperty: StringUnionProperty<ObstacleType>;
  public readonly slitConfigurationProperty: StringUnionProperty<SingleParticlesSlitConfiguration>;
  public readonly slitSeparationProperty: NumberProperty;

  // Slit x-position as a fraction of the wave visualization region width (0 = left, 1 = right)
  public readonly slitPositionFractionProperty: NumberProperty;

  public readonly screenBrightnessProperty: NumberProperty;
  public readonly photonWaveDisplayModeProperty: StringUnionProperty<PhotonWaveDisplayMode>;
  public readonly matterWaveDisplayModeProperty: StringUnionProperty<MatterWaveDisplayMode>;

  // Whether a wave packet is currently propagating through the visualization region
  public readonly isPacketActiveProperty: BooleanProperty;

  // Whether the wave field should be rendered in the visualization region (satisfies WaveVisualizableScene)
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  // Detector tool state — position/radius are in normalized coordinates (0–1) within the wave region
  public readonly detectorToolPositionProperty: Vector2Property;
  public readonly detectorToolRadiusProperty: NumberProperty;
  public readonly detectorToolStateProperty: StringUnionProperty<DetectorToolState>;
  public readonly detectorToolProbabilityProperty: NumberProperty;

  public readonly slitWidth: number;
  public readonly velocityRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly screenHalfWidth: number;
  public readonly waveSolver: WaveSolver;

  public readonly hits: Vector2[];
  public readonly totalHitsProperty: NumberProperty;
  public readonly hitsChangedEmitter: TEmitter;
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  public readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;

  // Snapshots
  public readonly snapshotsProperty: Property<Snapshot[]>;
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;
  private nextSnapshotNumber: number;

  private readonly particleMass: number;

  // Physical dimensions of the wave visualization region (meters), set per source type
  private readonly regionWidth: number;
  private readonly regionHeight: number;

  // Time since the last packet was emitted, used to enforce minimum emission interval
  private timeSinceLastEmission: number;

  // Progress of the current packet as fraction of traversal (0 = just emitted, 1 = at detector screen)
  private packetProgress: number;

  public constructor( providedOptions: SingleParticlesSceneModelOptions ) {

    const options = optionize<SingleParticlesSceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;
    const tandem = options.tandem;

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

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.packetProgress = 0;

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    this.autoRepeatProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'autoRepeatProperty' )
    } );

    this.isPacketActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPacketActiveProperty' ),
      phetioReadOnly: true
    } );

    this.isWaveVisibleProperty = this.isPacketActiveProperty;

    this.wavelengthProperty = new NumberProperty( options.sourceType === 'photons' ? 650 : 0, {
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

    this.slitConfigurationProperty = new StringUnionProperty<SingleParticlesSlitConfiguration>( 'bothOpen', {
      validValues: SingleParticlesSlitConfigurationValues,
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

    this.screenBrightnessProperty = new NumberProperty( 0.125, {
      range: new Range( 0, 0.25 ),
      tandem: tandem.createTandem( 'screenBrightnessProperty' )
    } );

    this.photonWaveDisplayModeProperty = new StringUnionProperty<PhotonWaveDisplayMode>( 'timeAveragedIntensity', {
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

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.totalHitsProperty ],
      totalHits => totalHits >= MAX_HITS
    );

    this.isEmitterEnabledProperty = new DerivedProperty(
      [ this.isMaxHitsReachedProperty, this.isPacketActiveProperty, this.autoRepeatProperty ],
      ( isMaxHits, isPacketActive, autoRepeat ) =>
        isMaxHits ? false :
        autoRepeat ? true :
        !isPacketActive
    );

    // Detector tool
    this.detectorToolPositionProperty = new Vector2Property( new Vector2( 0.5, 0.5 ), {
      tandem: tandem.createTandem( 'detectorToolPositionProperty' )
    } );

    this.detectorToolRadiusProperty = new NumberProperty( 0.1, {
      range: new Range( 0.03, 0.3 ),
      tandem: tandem.createTandem( 'detectorToolRadiusProperty' )
    } );

    this.detectorToolStateProperty = new StringUnionProperty<DetectorToolState>( 'ready', {
      validValues: DetectorToolStateValues,
      tandem: tandem.createTandem( 'detectorToolStateProperty' )
    } );

    this.detectorToolProbabilityProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'detectorToolProbabilityProperty' ),
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

    this.waveSolver = new AnalyticalWavePacketSolver();
    this.syncSolverParameters();

    // Clear accumulated data when any parameter that affects the interference pattern changes.
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );
    this.obstacleTypeProperty.lazyLink( () => this.clearScreen() );
    this.slitConfigurationProperty.lazyLink( () => this.clearScreen() );
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.slitPositionFractionProperty.lazyLink( () => this.clearScreen() );

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
    const screenDistanceMeters = this.slitPositionFractionProperty.value * this.regionWidth;

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
      return shiftedArg === 0 ? 1 : Math.pow( Math.sin( shiftedArg ) / shiftedArg, 2 );
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
    this.totalHitsProperty.value = 0;
    this.isPacketActiveProperty.value = false;
    this.packetProgress = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
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
      detectionMode: 'hits',
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.slitPositionFractionProperty.value * this.regionWidth,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: this.slitConfigurationProperty.value,
      isEmitting: this.isEmittingProperty.value,
      brightness: this.screenBrightnessProperty.value,
      intensity: 1
    } );

    this.snapshotsProperty.value = [ ...this.snapshotsProperty.value, snapshot ];
  }

  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = this.snapshotsProperty.value.filter( s => s !== snapshot );
  }

  /**
   * Emits a single wave packet from the source.
   */
  public emitPacket(): void {
    if ( this.isMaxHitsReachedProperty.value || this.isPacketActiveProperty.value ) {
      return;
    }
    this.isPacketActiveProperty.value = true;
    this.packetProgress = 0;
    this.timeSinceLastEmission = 0;
    this.waveSolver.reset();
    this.syncSolverParameters();
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
   * Steps the scene forward in time. Handles single-packet propagation and detection.
   */
  public step( dt: number ): void {
    this.timeSinceLastEmission += dt;

    if ( this.isPacketActiveProperty.value ) {
      this.waveSolver.step( dt );

      // Advance the packet across the visualization region using the visual traversal time
      this.packetProgress += dt / PACKET_TRAVERSAL_TIME;

      // Detection probability increases as the packet approaches the detector screen.
      // Use a probabilistic detection model: the packet is detected with probability proportional
      // to how far it has progressed, biased toward the screen position.
      const detectionProbabilityPerStep = this.packetProgress > 0.8 ?
                                          ( this.packetProgress - 0.8 ) / 0.2 * dt * 5 :
                                          0;

      if ( dotRandom.nextDouble() < detectionProbabilityPerStep || this.packetProgress >= 1.0 ) {
        this.detectPacket();
      }

      // Update detector tool probability while packet is active
      if ( this.isPacketActiveProperty.value && this.detectorToolStateProperty.value === 'ready' ) {
        this.detectorToolProbabilityProperty.value = this.computeDetectorProbability();
      }
    }
    else {
      this.detectorToolProbabilityProperty.value = 0;
    }

    // Auto-repeat: emit a new packet if conditions are met
    if (
      this.isEmittingProperty.value &&
      this.autoRepeatProperty.value &&
      !this.isPacketActiveProperty.value &&
      this.timeSinceLastEmission >= MIN_EMISSION_INTERVAL &&
      !this.isMaxHitsReachedProperty.value
    ) {
      this.emitPacket();
    }
  }

  /**
   * Detects the current packet: registers a hit and deactivates the packet.
   */
  private detectPacket(): void {
    if ( !this.isPacketActiveProperty.value ) {
      return;
    }

    const x = this.generateHitPosition();
    const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * HIT_VERTICAL_EXTENT;
    this.hits.push( new Vector2( x, y ) );
    this.totalHitsProperty.value++;
    this.isPacketActiveProperty.value = false;
    this.packetProgress = 0;
    this.hitsChangedEmitter.emit();

    // In single-shot mode (no auto-repeat), turn off emitting after the packet is detected
    if ( !this.autoRepeatProperty.value ) {
      this.isEmittingProperty.value = false;
    }
  }

  /**
   * Returns the detector circle parameters in grid coordinates.
   */
  private getDetectorCircleParams(): { cx: number; cy: number; rSq: number } {
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    return {
      cx: this.detectorToolPositionProperty.value.x * gw,
      cy: this.detectorToolPositionProperty.value.y * gh,
      rSq: ( this.detectorToolRadiusProperty.value * gw ) ** 2
    };
  }

  /**
   * Computes the fraction of total probability density |ψ|² inside the detector tool circle.
   */
  public computeDetectorProbability(): number {
    if ( !this.isPacketActiveProperty.value ) {
      return 0;
    }

    const field = this.waveSolver.getAmplitudeField();
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    const { cx, cy, rSq } = this.getDetectorCircleParams();

    let insideSum = 0;
    let totalSum = 0;

    for ( let iy = 0; iy < gh; iy++ ) {
      for ( let ix = 0; ix < gw; ix++ ) {
        const idx = ( iy * gw + ix ) * 2;
        const re = field[ idx ];
        const im = field[ idx + 1 ];
        const prob = re * re + im * im;
        totalSum += prob;

        const dxGrid = ix - cx;
        const dyGrid = iy - cy;
        if ( dxGrid * dxGrid + dyGrid * dyGrid <= rSq ) {
          insideSum += prob;
        }
      }
    }

    return totalSum > 0 ? insideSum / totalSum : 0;
  }

  /**
   * Performs a measurement with the detector tool. The particle is detected with probability
   * equal to the fraction of |ψ|² inside the circle. If detected, a hit is placed at the
   * detector position. If not detected, the wave inside the circle is zeroed and renormalized.
   */
  public performDetectorMeasurement(): void {
    if ( !this.isPacketActiveProperty.value || this.detectorToolStateProperty.value !== 'ready' ) {
      return;
    }

    const probability = this.computeDetectorProbability();
    const detected = dotRandom.nextDouble() < probability;

    if ( detected ) {
      this.detectorToolStateProperty.value = 'detected';
      this.isPacketActiveProperty.value = false;
      this.packetProgress = 0;
    }
    else {
      this.detectorToolStateProperty.value = 'notDetected';
      this.zeroWaveInsideDetector();
    }
  }

  /**
   * Zeros the wave function inside the detector circle and renormalizes the remainder,
   * implementing the "not detected" measurement projection.
   */
  private zeroWaveInsideDetector(): void {
    const field = this.waveSolver.getAmplitudeField();
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    const { cx, cy, rSq } = this.getDetectorCircleParams();

    let outsideSum = 0;

    for ( let iy = 0; iy < gh; iy++ ) {
      for ( let ix = 0; ix < gw; ix++ ) {
        const idx = ( iy * gw + ix ) * 2;
        const dxGrid = ix - cx;
        const dyGrid = iy - cy;

        if ( dxGrid * dxGrid + dyGrid * dyGrid <= rSq ) {
          field[ idx ] = 0;
          field[ idx + 1 ] = 0;
        }
        else {
          const re = field[ idx ];
          const im = field[ idx + 1 ];
          outsideSum += re * re + im * im;
        }
      }
    }

    if ( outsideSum > 0 ) {
      const scale = 1 / Math.sqrt( outsideSum );
      for ( let iy = 0; iy < gh; iy++ ) {
        for ( let ix = 0; ix < gw; ix++ ) {
          const idx = ( iy * gw + ix ) * 2;
          field[ idx ] *= scale;
          field[ idx + 1 ] *= scale;
        }
      }
    }

    this.waveSolver.invalidate();
  }

  public resetDetectorToolState(): void {
    this.detectorToolStateProperty.value = 'ready';
  }

  public reset(): void {
    this.isEmittingProperty.reset();
    this.autoRepeatProperty.reset();
    this.wavelengthProperty.reset();
    this.velocityProperty.reset();
    this.obstacleTypeProperty.reset();
    this.slitConfigurationProperty.reset();
    this.slitSeparationProperty.reset();
    this.slitPositionFractionProperty.reset();
    this.screenBrightnessProperty.reset();
    this.photonWaveDisplayModeProperty.reset();
    this.matterWaveDisplayModeProperty.reset();
    this.isPacketActiveProperty.reset();
    this.detectorToolPositionProperty.reset();
    this.detectorToolRadiusProperty.reset();
    this.detectorToolStateProperty.reset();
    this.detectorToolProbabilityProperty.reset();
    this.hits.length = 0;
    this.totalHitsProperty.reset();
    this.packetProgress = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
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
