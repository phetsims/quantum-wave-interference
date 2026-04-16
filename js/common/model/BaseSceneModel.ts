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
import Snapshot from './Snapshot.js';

export const HIT_VERTICAL_EXTENT = 0.95;
export const MAX_HITS = 25000;
const MAX_SNAPSHOTS = 4;
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
  public readonly velocityRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly regionWidth: number;
  public readonly regionHeight: number;

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
    this.waveSolver = waveSolver;

    let defaultVelocity: number;
    let defaultSlitSeparation: number;

    if ( options.sourceType === 'photons' ) {
      this.particleMass = 0;
      this.velocityRange = new Range( 0, 0 );
      this.slitSeparationRange = new Range( 0.0002, 0.003 );
      defaultVelocity = 0;
      defaultSlitSeparation = 0.003;
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

  protected abstract isTopSlitOpen(): boolean;

  protected abstract isBottomSlitOpen(): boolean;

  protected isTopSlitDecoherent(): boolean { return false; }

  protected isBottomSlitDecoherent(): boolean { return false; }

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
      isTopSlitDecoherent: this.isTopSlitDecoherent(),
      isBottomSlitDecoherent: this.isBottomSlitDecoherent(),
      isSourceOn: this.isEmittingProperty.value,
      regionWidth: this.regionWidth,
      regionHeight: this.regionHeight
    } );
  }

  private wavefrontReached = false;

  public hasWavefrontReachedScreen(): boolean {
    if ( this.wavefrontReached ) {
      return true;
    }
    const distribution = this.waveSolver.getDetectorProbabilityDistribution();
    if ( distribution.some( v => v > 1e-6 ) ) {
      this.wavefrontReached = true;
      return true;
    }
    return false;
  }

  protected generateHitPosition( distribution?: Float64Array ): number {
    if ( !distribution ) {
      distribution = this.waveSolver.getDetectorProbabilityDistribution();
    }
    const n = distribution.length;

    let totalSum = 0;
    for ( let i = 0; i < n; i++ ) {
      totalSum += distribution[ i ];
    }

    if ( totalSum <= 0 ) {
      return ( dotRandom.nextDouble() - 0.5 ) * 2;
    }

    const threshold = dotRandom.nextDouble() * totalSum;
    let runningSum = 0;
    let selectedBin = n - 1;
    for ( let i = 0; i < n; i++ ) {
      runningSum += distribution[ i ];
      if ( runningSum >= threshold ) {
        selectedBin = i;
        break;
      }
    }

    // Sub-bin jitter to avoid discrete banding in hit patterns
    const binWidth = 2.0 / n;
    const binCenter = ( ( selectedBin + 0.5 ) / n ) * 2 - 1;
    return binCenter + ( dotRandom.nextDouble() - 0.5 ) * binWidth;
  }

  public clearScreen(): void {
    if ( this.isResetting ) {
      return;
    }
    this.hits.length = 0;
    this.totalHitsProperty.value = 0;
    this.wavefrontReached = false;
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

    // Capture the solver's detector-screen probability distribution so an intensity-mode snapshot renders
    // the same pattern the user was looking at; for hits-mode there is no distribution to render.
    const intensityDistribution = detectionMode === 'averageIntensity'
                                  ? Array.from( this.waveSolver.getDetectorProbabilityDistribution() )
                                  : [];

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
      intensity: intensity,
      intensityDistribution: intensityDistribution
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
    this.wavefrontReached = false;
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

