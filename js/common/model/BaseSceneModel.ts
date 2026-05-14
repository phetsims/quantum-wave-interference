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
import { metersPerSecondUnit } from '../../../../scenery-phet/js/units/metersPerSecondUnit.js';
import { millimetersUnit } from '../../../../scenery-phet/js/units/millimetersUnit.js';
import { nanometersUnit } from '../../../../scenery-phet/js/units/nanometersUnit.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type DecoherenceEvent, type DecoherenceSlit } from './AnalyticalWaveKernel.js';
import { type BarrierType, BarrierTypeValues } from './BarrierType.js';
import { type DetectionMode } from './DetectionMode.js';
import { MAX_VIEW_SEPARATION, MIN_VIEW_SEPARATION, SLIT_VIEW_HEIGHT } from './getViewSlitLayout.js';
import { hasAnyDetector, hasDetectorOnSide, type SlitConfigurationWithNoBarrier } from './SlitConfiguration.js';
import { renumberSnapshots, type Snapshot, SnapshotIO } from './Snapshot.js';
import { type SourceType } from './SourceType.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues, type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues, type WaveDisplayMode } from './WaveDisplayMode.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverState } from './WaveSolver.js';

// Full normalized detector-screen half-span used by High Intensity and Single Particles hit scatter.
export const HIT_VERTICAL_EXTENT = 1;
export const MAX_HITS = 25000;
const MAX_SNAPSHOTS = 4;
const DEFAULT_PHOTON_WAVELENGTH_NM = 650;

// Number of wavelengths visible across the region at the default wavelength, used to size each
// scene's physical region. Photons end up at ~10 μm, matter waves scale down to nm-scale regions.
const DEFAULT_DISPLAY_WAVELENGTHS = 15;

// Preserve the former default visual slit spacing when converting the control range to physical units.
const DEFAULT_SLIT_SEPARATION_FRACTION = 9 / 19;

type SourceTypeConfig = {
  particleMass: number;
  velocityRange: [ number, number ];
  defaultVelocity: number;
};

const SOURCE_TYPE_CONFIG: Record<SourceType, SourceTypeConfig> = {
  photons: {
    particleMass: 0,
    velocityRange: [ 0, 0 ],
    defaultVelocity: 0
  },
  electrons: {
    particleMass: QuantumWaveInterferenceConstants.ELECTRON_MASS,
    velocityRange: [ 7e5, 1.5e6 ],
    defaultVelocity: 1.1e6
  },
  neutrons: {
    particleMass: QuantumWaveInterferenceConstants.NEUTRON_MASS,
    velocityRange: [ 200, 800 ],
    defaultVelocity: 500
  },
  heliumAtoms: {
    particleMass: QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS,
    velocityRange: [ 400, 2000 ],
    defaultVelocity: 1200
  }
};

type SelfOptions = {
  sourceType: SourceType;
  defaultPhotonWaveDisplayMode?: PhotonWaveDisplayMode;
  defaultMatterWaveDisplayMode?: MatterWaveDisplayMode;
};

export type BaseSceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

type BaseSceneModelStateObject = {
  waveSolverState: WaveSolverState;
  hits: Array<{ x: number; y: number }>;
  wavefrontReached: boolean;
};

export default abstract class BaseSceneModel extends PhetioObject {

  public readonly sourceType: SourceType;
  protected readonly particleMass: number;
  public readonly slitWidth: number;
  public readonly velocityRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly regionWidth: number;
  public readonly regionHeight: number;
  private readonly defaultEffectiveWavelength: number;
  protected readonly defaultWaveSpeed: number;

  public readonly isEmittingProperty: BooleanProperty;
  public readonly wavelengthProperty: NumberProperty;
  public readonly velocityProperty: NumberProperty;
  public readonly barrierTypeProperty: StringUnionProperty<BarrierType>;
  public readonly slitSeparationProperty: NumberProperty;
  public readonly slitPositionFractionProperty: NumberProperty;
  public readonly screenBrightnessProperty: NumberProperty;
  public readonly photonWaveDisplayModeProperty: StringUnionProperty<PhotonWaveDisplayMode>;
  public readonly matterWaveDisplayModeProperty: StringUnionProperty<MatterWaveDisplayMode>;
  public readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  public readonly waveSolver: WaveSolver;
  public abstract readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;
  public readonly leftDetectorHitsProperty: NumberProperty;
  public readonly rightDetectorHitsProperty: NumberProperty;
  public readonly hits: Vector2[];
  public readonly totalHitsProperty: NumberProperty;
  public readonly hitsChangedEmitter: TEmitter;
  public readonly snapshotsProperty: Property<Snapshot[]>; // TODO: Use ObservableArray? See https://github.com/phetsims/tandem/issues/279
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Guard to prevent cascading clearScreen calls during reset
  private isResetting: boolean;
  private readonly decoherenceEvents: DecoherenceEvent[];

  protected constructor( waveSolver: WaveSolver, providedOptions: BaseSceneModelOptions ) {

    const options = optionize<BaseSceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false,
      defaultPhotonWaveDisplayMode: 'electricField',
      defaultMatterWaveDisplayMode: 'magnitude',
      phetioType: BaseSceneModel.BaseSceneModelIO
      //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Should this be phetioState: false, or does it have state of its own?
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;
    this.isResetting = false;
    const tandem = options.tandem;

    const config = SOURCE_TYPE_CONFIG[ this.sourceType ];
    this.waveSolver = waveSolver;
    this.particleMass = config.particleMass;
    this.velocityRange = new Range( ...config.velocityRange );
    this.decoherenceEvents = [];

    this.defaultEffectiveWavelength = this.sourceType === 'photons' ?
                                      DEFAULT_PHOTON_WAVELENGTH_NM * 1e-9 :
                                      QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * config.defaultVelocity );

    // Size the region so that ~DEFAULT_DISPLAY_WAVELENGTHS wavelengths are visible at the default
    // wavelength. The model aspect ratio matches the view so the measuring tape has the same scale
    // horizontally and vertically. For photons this is ~10 μm wide; for matter waves it auto-scales
    // down to the nm range.
    const regionSize = this.defaultEffectiveWavelength * DEFAULT_DISPLAY_WAVELENGTHS;
    this.regionWidth = regionSize;
    this.regionHeight = regionSize *
                        QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT /
                        QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

    const slitSeparationMin = MIN_VIEW_SEPARATION / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                              this.regionHeight * 1e3;
    const slitSeparationMax = MAX_VIEW_SEPARATION / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                              this.regionHeight * 1e3;
    const defaultSlitSeparation = slitSeparationMin +
                                  DEFAULT_SLIT_SEPARATION_FRACTION * ( slitSeparationMax - slitSeparationMin );
    this.slitSeparationRange = new Range( slitSeparationMin, slitSeparationMax );
    this.slitWidth = SLIT_VIEW_HEIGHT / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                     this.regionHeight * 1e3;
    this.defaultWaveSpeed = this.sourceType === 'photons' ? 3e8 : config.defaultVelocity;

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();

    this.leftDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.rightDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    this.wavelengthProperty = new NumberProperty( options.sourceType === 'photons' ? DEFAULT_PHOTON_WAVELENGTH_NM : 0, {
      range: QuantumWaveInterferenceConstants.createWavelengthRangeNM( options.sourceType ),
      units: nanometersUnit,
      tandem: tandem.createTandem( 'wavelengthProperty' )
    } );

    this.velocityProperty = new NumberProperty( config.defaultVelocity, {
      range: this.velocityRange,
      units: metersPerSecondUnit,
      tandem: tandem.createTandem( 'velocityProperty' )
    } );

    this.barrierTypeProperty = new StringUnionProperty<BarrierType>( 'doubleSlit', {
      validValues: BarrierTypeValues,
      tandem: tandem.createTandem( 'barrierTypeProperty' )
    } );

    // NOTE: identical implementation in quantum-wave-interference/js/experiment/model/SceneModel.ts
    this.slitSeparationProperty = new NumberProperty( defaultSlitSeparation, {
      range: this.slitSeparationRange,
      units: millimetersUnit,
      tandem: tandem.createTandem( 'slitSeparationProperty' )
    } );

    this.slitPositionFractionProperty = new NumberProperty( 0.5, {
      //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 units?
      range: new Range( 0.25, 0.75 ),
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

    this.matterWaveDisplayModeProperty = new StringUnionProperty<MatterWaveDisplayMode>( options.defaultMatterWaveDisplayMode, {
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
      phetioValueType: ArrayIO( SnapshotIO )
    } );

    this.numberOfSnapshotsProperty = new DerivedProperty(
      [ this.snapshotsProperty ],
      snapshots => snapshots.length, {
        tandem: tandem.createTandem( 'numberOfSnapshotsProperty' ),
        phetioValueType: NumberIO
      }
    );

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

  public getPhysicalDt( visualDt: number ): number {
    const displayPropagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    const effectiveWaveSpeed = this.getEffectiveWaveSpeed();

    return visualDt > 0 &&
           Number.isFinite( displayPropagationSpeed ) &&
           Number.isFinite( effectiveWaveSpeed ) &&
           displayPropagationSpeed > 0 &&
           effectiveWaveSpeed > 0 ?
           displayPropagationSpeed * visualDt / effectiveWaveSpeed :
           0;
  }

  protected abstract isTopSlitOpen(): boolean;

  protected abstract isBottomSlitOpen(): boolean;

  protected isTopSlitDecoherent(): boolean { return false; }

  protected isBottomSlitDecoherent(): boolean { return false; }

  protected syncSolverParameters(): void {
    const effectiveWavelength = this.getEffectiveWavelength();
    const displayWavelengths = effectiveWavelength > 0 ?
                               this.regionWidth / effectiveWavelength :
                               this.waveSolver.defaultDisplayWavelengths;
    this.waveSolver.setParameters( {
      wavelength: effectiveWavelength,
      waveSpeed: this.getEffectiveWaveSpeed(),

      // The analytical solvers animate waves in display coordinates. displaySpeedScale maps the
      // current physical speed to display speed by comparing it to this scene's default speed. For
      // wave packets, AnalyticalWavePacketSolver applies this scale to
      // regionWidth / WAVE_PACKET_TRAVERSAL_TIME.
      displaySpeedScale: this.getEffectiveWaveSpeed() / this.defaultWaveSpeed,
      displayWavelengths: displayWavelengths,
      barrierType: this.barrierTypeProperty.value,
      slitSeparation: this.slitSeparationProperty.value * 1e-3,
      slitSeparationMin: this.slitSeparationRange.min * 1e-3,
      slitSeparationMax: this.slitSeparationRange.max * 1e-3,
      slitWidth: this.slitWidth * 1e-3,
      barrierFractionX: this.slitPositionFractionProperty.value,
      isTopSlitOpen: this.isTopSlitOpen(),
      isBottomSlitOpen: this.isBottomSlitOpen(),
      isTopSlitDecoherent: this.isTopSlitDecoherent(),
      isBottomSlitDecoherent: this.isBottomSlitDecoherent(),
      isSourceOn: this.isEmittingProperty.value,
      regionWidth: this.regionWidth,
      regionHeight: this.regionHeight,
      decoherenceEvents: this.decoherenceEvents
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

  protected clearDecoherenceEvents(): void {
    this.decoherenceEvents.length = 0;
    this.syncSolverParameters();
  }

  protected addDecoherenceEvent( event: DecoherenceEvent ): void {
    this.decoherenceEvents.push( event );
    if ( event.clickedDetectorSlit === 'topSlit' ) {
      this.leftDetectorHitsProperty.value++;
    }
    else if ( event.clickedDetectorSlit === 'bottomSlit' ) {
      this.rightDetectorHitsProperty.value++;
    }

    this.pruneDecoherenceEvents();
    this.syncSolverParameters();
  }

  protected pruneDecoherenceEvents(): void {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    const visibleHistoryDuration = propagationSpeed > 0 ? this.regionWidth / propagationSpeed + 0.25 : 2;
    const oldestVisibleTime = this.waveSolver.getTime() - visibleHistoryDuration;
    const removeBeforeTime = oldestVisibleTime - 0.1;
    let removeCount = 0;

    while ( removeCount < this.decoherenceEvents.length && this.decoherenceEvents[ removeCount ].time < removeBeforeTime ) {
      removeCount++;
    }

    if ( removeCount > 0 ) {
      this.decoherenceEvents.splice( 0, removeCount );
      this.syncSolverParameters();
    }
  }

  protected createDecoherenceEventForSlitConfiguration(
    slitConfiguration: SlitConfigurationWithNoBarrier,
    time: number
  ): DecoherenceEvent | null {
    if ( !hasAnyDetector( slitConfiguration ) ) {
      return null;
    }

    const topOpen = this.isTopSlitOpen();
    const bottomOpen = this.isBottomSlitOpen();

    let selectedSlit: DecoherenceSlit;
    if ( topOpen && !bottomOpen ) {
      selectedSlit = 'topSlit';
    }
    else if ( bottomOpen && !topOpen ) {
      selectedSlit = 'bottomSlit';
    }
    else if ( topOpen && bottomOpen ) {
      selectedSlit = dotRandom.nextDouble() < 0.5 ? 'topSlit' : 'bottomSlit';
    }
    else {
      return null;
    }

    const clickedDetectorSlit =
      selectedSlit === 'topSlit' && hasDetectorOnSide( slitConfiguration, 'left' ) ? 'topSlit' :
      selectedSlit === 'bottomSlit' && hasDetectorOnSide( slitConfiguration, 'right' ) ? 'bottomSlit' :
      undefined;

    return clickedDetectorSlit ? {
      time: time,
      selectedSlit: selectedSlit,
      clickedDetectorSlit: clickedDetectorSlit
    } : {
      time: time,
      selectedSlit: selectedSlit
    };
  }

  protected linkSlitConfigurationToBarrierType(
    slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier>
  ): void {

    slitConfigurationProperty.link( slitConfiguration => {
      this.barrierTypeProperty.value = slitConfiguration === 'noBarrier' ? 'none' : 'doubleSlit';
    } );

    this.barrierTypeProperty.link( barrierType => {
      if ( barrierType === 'none' ) {
        slitConfigurationProperty.value = 'noBarrier';
      }
      else if ( slitConfigurationProperty.value === 'noBarrier' ) {
        slitConfigurationProperty.value = 'bothOpen';
      }
    } );
  }

  protected setupSlitConfigurationListeners( slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier> ): void {
    this.linkSlitConfigurationToBarrierType( slitConfigurationProperty );
    this.syncSolverParameters();
    this.setupClearScreenListeners();
    slitConfigurationProperty.lazyLink( () => this.clearScreen() );
  }

  protected stopEmitterWhenMaxHitsReached(): void {
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );
  }

  public clearScreen(): void {
    if ( this.isResetting ) {
      return;
    }
    this.hits.length = 0;
    this.totalHitsProperty.value = 0;
    this.leftDetectorHitsProperty.value = 0;
    this.rightDetectorHitsProperty.value = 0;
    this.clearWaveState();
    this.hitsChangedEmitter.emit();
  }

  protected clearWaveState(): void {
    this.wavefrontReached = false;
    this.decoherenceEvents.length = 0;
    this.syncSolverParameters();
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  protected setupClearScreenListeners(): void {
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );
    this.barrierTypeProperty.lazyLink( () => this.clearScreen() );
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.slitPositionFractionProperty.lazyLink( () => this.clearScreen() );

    this.isEmittingProperty.lazyLink( isEmitting => {
      if ( isEmitting ) {
        this.syncSolverParameters();
      }
      else {
        this.clearWaveStateWhenEmitterTurnsOff();
      }
    } );
  }

  protected clearWaveStateWhenEmitterTurnsOff(): void {
    this.clearWaveState();
  }

  public takeSnapshot( detectionMode: DetectionMode, slitSetting: SlitConfigurationWithNoBarrier, intensity: number ): void {
    if ( this.snapshotsProperty.value.length >= MAX_SNAPSHOTS ) {
      return;
    }

    // Capture the solver's detector-screen probability distribution so an intensity-mode snapshot renders
    // the same pattern the user was looking at; for hits-mode there is no distribution to render.
    const intensityDistribution = detectionMode === 'averageIntensity'
                                  ? Array.from( this.waveSolver.getDetectorProbabilityDistribution() )
                                  : [];

    const snapshot: Snapshot = {
      snapshotNumber: this.snapshotsProperty.value.length + 1,
      hits: [ ...this.hits ],
      detectionMode: detectionMode,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.slitPositionFractionProperty.value * this.regionWidth,
      screenHalfWidth: this.regionWidth / 2,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: slitSetting,
      isEmitting: this.isEmittingProperty.value,
      brightness: this.screenBrightnessProperty.value,
      intensity: intensity,
      slitWidth: this.slitWidth,
      intensityDistribution: intensityDistribution
    };

    this.snapshotsProperty.value = [ ...this.snapshotsProperty.value, snapshot ];
  }

  // Delete a specific snapshot and compact the remaining snapshot labels to match their current display order.
  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = renumberSnapshots(
      this.snapshotsProperty.value.filter( s => s !== snapshot )
    );
  }

  public abstract step( dt: number ): void;

  // TODO https://github.com/phetsims/quantum-wave-interference/issues/118 IOType documentation is supposed to identify the type of serialization.
  public static readonly BaseSceneModelIO = new IOType<BaseSceneModel, BaseSceneModelStateObject>( 'BaseSceneModelIO', {
    valueType: BaseSceneModel,
    documentation: 'Serializes the wave solver state and hit positions for a scene',
    toStateObject: ( model: BaseSceneModel ) => ( {
      waveSolverState: model.waveSolver.getState(),
      hits: model.hits.map( v => ( { x: v.x, y: v.y } ) ),
      wavefrontReached: model.wavefrontReached
    } ),
    stateSchema: {
      waveSolverState: ObjectLiteralIO,
      hits: ArrayIO( ObjectLiteralIO ),
      wavefrontReached: IOType.ObjectIO
    },
    applyState: ( model: BaseSceneModel, stateObject: BaseSceneModelStateObject ) => {
      model.waveSolver.setState( stateObject.waveSolverState );
      model.hits.length = 0;
      for ( const h of stateObject.hits ) {
        model.hits.push( new Vector2( h.x, h.y ) );
      }
      model.wavefrontReached = stateObject.wavefrontReached;
      model.hitsChangedEmitter.emit();
    }
  } );

  /**
   * Resets base properties with a guard to prevent cascading clearScreen calls from property listeners.
   * Subclasses should override reset() and call super.reset() at the start.
   */
  public reset(): void {
    this.isResetting = true;

    this.isEmittingProperty.reset();
    this.wavelengthProperty.reset();
    this.velocityProperty.reset();
    this.barrierTypeProperty.reset();
    this.slitSeparationProperty.reset();
    this.slitPositionFractionProperty.reset();
    this.screenBrightnessProperty.reset();
    this.photonWaveDisplayModeProperty.reset();
    this.matterWaveDisplayModeProperty.reset();
    this.leftDetectorHitsProperty.reset();
    this.rightDetectorHitsProperty.reset();
    this.hits.length = 0;
    this.totalHitsProperty.reset();
    this.wavefrontReached = false;
    this.decoherenceEvents.length = 0;
    this.waveSolver.reset();
    this.snapshotsProperty.value = [];

    this.isResetting = false;
    this.hitsChangedEmitter.emit();
  }
}
