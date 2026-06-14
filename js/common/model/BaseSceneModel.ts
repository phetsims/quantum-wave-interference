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

// NOTE: see other duplicate import block in quantum-wave-interference/js/experiment/model/SceneModel.ts. These models
// intentionally remain separate because Experiment uses a legacy analytical model while High Intensity/Single Particles
// share BaseSceneModel.
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
import { percentUnit } from '../../../../scenery-phet/js/units/percentUnit.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ObjectLiteralIO from '../../../../tandem/js/types/ObjectLiteralIO.js';
import { DISPLAY_SLIT_WIDTH, MAX_DISPLAY_SLIT_SEPARATION, MIN_DISPLAY_SLIT_SEPARATION } from '../getDisplaySlitLayout.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type DecoherenceEvent, type DecoherenceSlit } from './AnalyticalWaveKernelTypes.js';
import { type BarrierType, BarrierTypeValues } from './BarrierType.js';
import { type DetectionMode } from './DetectionMode.js';
import { hasAnyDetector, hasDetectorOnBottomSlit, hasDetectorOnTopSlit, isBottomSlitCovered, isTopSlitCovered, type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from './SlitConfiguration.js';
import { renumberSnapshots, type Snapshot, SnapshotIO } from './Snapshot.js';
import { type SourceType } from './SourceType.js';
import { type MatterWaveDisplayMode, MatterWaveDisplayModeValues, type PhotonWaveDisplayMode, PhotonWaveDisplayModeValues, type WaveDisplayMode } from './WaveDisplayMode.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverState } from './WaveSolver.js';

// Full normalized detector-screen half-span used by High Intensity and Single Particles hit scatter.
export const HIT_VERTICAL_EXTENT = 1;

// Preserve the former default visual slit spacing when converting the control range to physical units.
const DEFAULT_SLIT_SEPARATION_FRACTION = 9 / 19;

// Per-source-type physical constants used to initialize scene properties. All values are in SI units:
// particleMass in kg, particleSpeedRange and defaultParticleSpeed in m/s.
type SourceTypeConfig = {
  particleMass: number;
  particleSpeedRange: [ number, number ];
  defaultParticleSpeed: number;
};

const SOURCE_TYPE_CONFIG: Record<SourceType, SourceTypeConfig> = {
  photons: {
    particleMass: QuantumWaveInterferenceConstants.getParticleMass( 'photons' ),
    particleSpeedRange: [ 0, 0 ],
    defaultParticleSpeed: 0
  },
  electrons: {
    particleMass: QuantumWaveInterferenceConstants.getParticleMass( 'electrons' ),
    particleSpeedRange: [ 7e5, 1.5e6 ],
    defaultParticleSpeed: 1.1e6
  },
  neutrons: {
    particleMass: QuantumWaveInterferenceConstants.getParticleMass( 'neutrons' ),
    particleSpeedRange: [ 200, 800 ],
    defaultParticleSpeed: 500
  },
  heliumAtoms: {
    particleMass: QuantumWaveInterferenceConstants.getParticleMass( 'heliumAtoms' ),
    particleSpeedRange: [ 400, 2000 ],
    defaultParticleSpeed: 1200
  }
};

function getDefaultEffectiveWavelength( sourceType: SourceType ): number {
  const config = SOURCE_TYPE_CONFIG[ sourceType ];
  return sourceType === 'photons' ?
         QuantumWaveInterferenceConstants.DEFAULT_PHOTON_WAVELENGTH_NM * 1e-9 :
         QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( config.particleMass * config.defaultParticleSpeed );
}

// Constructor options that are specific to BaseSceneModel before merging with PhetioObjectOptions.
type SelfOptions = {
  sourceType: SourceType;
  defaultPhotonWaveDisplayMode?: PhotonWaveDisplayMode;
  defaultMatterWaveDisplayMode?: MatterWaveDisplayMode;

  // Override the auto-computed slit-separation range and default. Pass a function when the desired
  // range depends on the scene's regionHeight (computed in the constructor). Pass null to use the
  // default range derived from the display-pixel slit layout constants.
  slitSeparationConfig?: SlitSeparationConfig | ( ( regionHeight: number ) => SlitSeparationConfig ) | null;
};

// Public options type for constructing a BaseSceneModel subclass. Requires a tandem for PhET-iO instrumentation.
export type BaseSceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

// Physical slit-separation range and default for a scene, in millimeters. Passed via BaseSceneModelOptions and also
// exported so subclass scene model files (HighIntensitySceneModel, SingleParticlesSceneModel) can build per-source-type
// lookup tables keyed on SourceType.
export type SlitSeparationConfig = {
  range: Range;
  defaultValue: number;
};

// PhET-iO state object shape for BaseSceneModel. Serialized and restored by BaseSceneModelIO.
// subclassState is an opaque object delegated to applySubclassState() on the concrete subclass.
export type BaseSceneModelStateObject = {
  waveSolverState: WaveSolverState;
  hits: Array<{ x: number; y: number }>;
  wavefrontReached: boolean;
  decoherenceEvents: DecoherenceEvent[];
  subclassState: object;
};

export default abstract class BaseSceneModel extends PhetioObject {

  public readonly sourceType: SourceType;
  private readonly particleMass: number;
  public readonly slitWidth: number;
  public readonly particleSpeedRange: Range;
  public readonly slitSeparationRange: Range;
  public readonly regionWidth: number;
  public readonly regionHeight: number;
  private readonly defaultWaveSpeed: number;

  public readonly isEmittingProperty: BooleanProperty;
  public readonly wavelengthProperty: NumberProperty;
  public readonly particleSpeedProperty: NumberProperty;
  public readonly barrierTypeProperty: StringUnionProperty<BarrierType>;
  public readonly slitSeparationProperty: NumberProperty;
  public readonly barrierPositionFractionProperty: NumberProperty;
  public readonly slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier>;
  public readonly screenBrightnessProperty: NumberProperty;
  // Wave display mode for the photon scene, where 'amplitude' displays sqrt( re^2 + im^2 ).
  public readonly photonWaveDisplayModeProperty: StringUnionProperty<PhotonWaveDisplayMode>;

  // Wave display mode for matter-particle scenes, where 'amplitude' displays sqrt( re^2 + im^2 ).
  public readonly matterWaveDisplayModeProperty: StringUnionProperty<MatterWaveDisplayMode>;
  public readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  public readonly waveSolver: WaveSolver;
  public abstract readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;
  public abstract readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;
  public readonly leftDetectorHitsProperty: NumberProperty;
  public readonly rightDetectorHitsProperty: NumberProperty;
  public readonly hits: Vector2[];
  public readonly totalHitsProperty: NumberProperty;
  public readonly hitsChangedEmitter: TEmitter;

  // Snapshots are captured value records. Keep this as a Property<ArrayIO<SnapshotIO>>
  // so PhET-iO state save/restore replaces the whole immutable snapshot list and notifies
  // existing Property/DynamicProperty consumers.
  public readonly snapshotsProperty: Property<Snapshot[]>;
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Guard to prevent cascading clearScreen calls during reset
  private isResetting: boolean;
  private readonly decoherenceEvents: DecoherenceEvent[];

  protected constructor( waveSolver: WaveSolver, providedOptions: BaseSceneModelOptions ) {

    const options = optionize<BaseSceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false,
      defaultPhotonWaveDisplayMode: 'electricField',
      defaultMatterWaveDisplayMode: 'amplitude',
      slitSeparationConfig: null,
      phetioType: BaseSceneModel.BaseSceneModelIO,
      phetioDocumentation: 'Model for a single source-type scene, including wave solver state and detector screen data.',
      phetioState: true // provides its own state in the IOType
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;
    this.isResetting = false;
    const tandem = options.tandem;

    const config = SOURCE_TYPE_CONFIG[ this.sourceType ];
    this.waveSolver = waveSolver;
    this.particleMass = config.particleMass;
    this.particleSpeedRange = new Range( ...config.particleSpeedRange );
    this.decoherenceEvents = [];

    const defaultEffectiveWavelength = getDefaultEffectiveWavelength( this.sourceType );
    const displayScaleEffectiveWavelength = this.sourceType === 'neutrons' ?
                                            getDefaultEffectiveWavelength( 'electrons' ) :
                                            defaultEffectiveWavelength;

    // Size the region so that ~DISPLAY_WAVELENGTHS wavelengths are visible at the default
    // wavelength. The model aspect ratio matches the view so the measuring tape has the same scale
    // horizontally and vertically. For photons this is ~10 μm wide; for matter waves it auto-scales
    // down to the nm range. Neutrons intentionally use the electron display scale so equal
    // nanometer distances occupy equal view distances in both matter-particle scenes.
    const regionSize = displayScaleEffectiveWavelength * QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;
    this.regionWidth = regionSize;
    this.regionHeight = regionSize *
                        QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT /
                        QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;

    const slitSeparationMin = MIN_DISPLAY_SLIT_SEPARATION / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                              this.regionHeight * 1e3;
    const slitSeparationMax = MAX_DISPLAY_SLIT_SEPARATION / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                              this.regionHeight * 1e3;
    const defaultSlitSeparationConfig = {
      range: new Range( slitSeparationMin, slitSeparationMax ),
      defaultValue: slitSeparationMin + DEFAULT_SLIT_SEPARATION_FRACTION * ( slitSeparationMax - slitSeparationMin )
    };
    const slitSeparationConfig = typeof options.slitSeparationConfig === 'function' ?
                                 options.slitSeparationConfig( this.regionHeight ) :
                                 options.slitSeparationConfig || defaultSlitSeparationConfig;
    this.slitSeparationRange = slitSeparationConfig.range;
    this.slitWidth = DISPLAY_SLIT_WIDTH / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT *
                     this.regionHeight * 1e3;
    this.defaultWaveSpeed = this.sourceType === 'photons' ?
                            QuantumWaveInterferenceConstants.SPEED_OF_LIGHT :
                            config.defaultParticleSpeed;

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/model/SceneModel.ts. Hit counters stay in
    // each scene model because their clearing and serialization paths differ by model family.
    this.leftDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftDetectorHitsProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.rightDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightDetectorHitsProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' ),
      phetioFeatured: true
    } );

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/model/SceneModel.ts. Wavelength defaults
    // match across model families, but the surrounding source-type configuration differs.
    const defaultWavelengthNM = options.sourceType === 'photons' ?
                                QuantumWaveInterferenceConstants.DEFAULT_PHOTON_WAVELENGTH_NM :
                                0;
    this.wavelengthProperty = new NumberProperty( defaultWavelengthNM, {
      range: QuantumWaveInterferenceConstants.createWavelengthRangeNM( options.sourceType ),
      units: nanometersUnit,
      tandem: options.sourceType === 'photons' ? tandem.createTandem( 'wavelengthProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true
    } );

    this.particleSpeedProperty = new NumberProperty( config.defaultParticleSpeed, {
      range: this.particleSpeedRange,
      units: metersPerSecondUnit,
      tandem: options.sourceType === 'photons' ? Tandem.OPT_OUT : tandem.createTandem( 'particleSpeedProperty' ),
      phetioFeatured: true
    } );

    // Not instrumented: this is kept in sync with slitConfigurationProperty (see linkSlitConfigurationToBarrierType),
    // so it is fully recoverable from slitConfigurationProperty and would be redundant in the PhET-iO API and state.
    this.barrierTypeProperty = new StringUnionProperty<BarrierType>( 'doubleSlit', {
      validValues: BarrierTypeValues
    } );

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/model/SceneModel.ts. Slit separation is
    // initialized locally because each model family owns its own range/default calculation.
    this.slitSeparationProperty = new NumberProperty( slitSeparationConfig.defaultValue, {
      range: this.slitSeparationRange,
      units: millimetersUnit,
      tandem: tandem.createTandem( 'slitSeparationProperty' ),
      phetioFeatured: true
    } );

    this.barrierPositionFractionProperty = new NumberProperty( 0.5, {
      units: null,
      range: new Range( 0.25, 0.75 ),
      tandem: tandem.createTandem( 'barrierPositionFractionProperty' ),
      phetioFeatured: true
    } );

    this.slitConfigurationProperty = new StringUnionProperty<SlitConfigurationWithNoBarrier>( 'bothOpen', {
      validValues: SlitConfigurationWithNoBarrierValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' ),
      phetioFeatured: true
    } );

    this.screenBrightnessProperty = new NumberProperty( QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX * 0.5, {
      range: new Range( 0, QuantumWaveInterferenceConstants.SCREEN_BRIGHTNESS_MAX ),
      units: percentUnit,
      tandem: tandem.createTandem( 'screenBrightnessProperty' ),
      phetioFeatured: true
    } );

    // Both display-mode Properties exist on every scene so that view code can wire both combo boxes uniformly, but
    // only the one matching the scene's sourceType is ever shown, so only that one is instrumented.
    this.photonWaveDisplayModeProperty = new StringUnionProperty<PhotonWaveDisplayMode>(
      options.sourceType === 'photons' ? options.defaultPhotonWaveDisplayMode : 'electricField', {
        validValues: PhotonWaveDisplayModeValues,
        tandem: options.sourceType === 'photons' ? tandem.createTandem( 'photonWaveDisplayModeProperty' ) : Tandem.OPT_OUT,
        phetioFeatured: true,
        phetioDocumentation: 'How the photon wave is rendered. Amplitude displays sqrt( re^2 + im^2 ).'
      } );

    this.matterWaveDisplayModeProperty = new StringUnionProperty<MatterWaveDisplayMode>( options.defaultMatterWaveDisplayMode, {
      validValues: MatterWaveDisplayModeValues,
      tandem: options.sourceType === 'photons' ? Tandem.OPT_OUT : tandem.createTandem( 'matterWaveDisplayModeProperty' ),
      phetioFeatured: true,
      phetioDocumentation: 'How the matter wave is rendered. Amplitude displays sqrt( re^2 + im^2 ).'
    } );

    // Since sourceType is fixed per instance, just alias the relevant property
    this.activeWaveDisplayModeProperty = this.sourceType === 'photons'
                                         ? this.photonWaveDisplayModeProperty
                                         : this.matterWaveDisplayModeProperty;

    this.totalHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalHitsProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    this.snapshotsProperty = new Property<Snapshot[]>( [], {
      tandem: tandem.createTandem( 'snapshotsProperty' ),
      phetioValueType: ArrayIO( SnapshotIO ),
      phetioReadOnly: true,
      phetioDocumentation: 'The array of detector screen snapshots captured in this scene.'
    } );

    this.numberOfSnapshotsProperty = new DerivedProperty(
      [ this.snapshotsProperty ],
      snapshots => snapshots.length, {
        tandem: tandem.createTandem( 'numberOfSnapshotsProperty' ),
        phetioValueType: NumberIO
      }
    );

  }

  /**
   * Returns the effective wavelength in meters for the current source type and particle speed. For photons this is
   * the user-controlled wavelength (wavelengthProperty, stored in nm) converted to meters. For matter particles it
   * is the de Broglie wavelength h/(mv). Returns 0 when the particle speed is zero.
   */
  public getEffectiveWavelength(): number {
    if ( this.sourceType === 'photons' ) {
      return this.wavelengthProperty.value * 1e-9;
    }
    const velocity = this.particleSpeedProperty.value;
    return velocity === 0 ? 0 :
           QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * velocity );
  }

  private getEffectiveWaveSpeed(): number {
    return this.sourceType === 'photons' ? QuantumWaveInterferenceConstants.SPEED_OF_LIGHT : this.particleSpeedProperty.value;
  }

  /**
   * Converts a visual (display-coordinate) time step to the corresponding physical time step in seconds. The wave
   * solver animates in display units where the display propagation speed may differ from the actual particle/photon
   * speed; this method rescales visual time by the ratio of the two speeds so the stopwatch advances at the correct
   * physical rate. Returns 0 when either speed is non-positive or non-finite (e.g., photon speed at zero wavelength
   * or an uninitialised solver). Called by BaseScreenModel.step() and stepOnce() to advance the stopwatch.
   *
   * @param visualDt - display-coordinate time step, in display-time seconds
   * @returns physical time step in seconds, or 0 if the conversion is not valid
   */
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

  private isTopSlitOpen(): boolean {
    return !isTopSlitCovered( this.slitConfigurationProperty.value );
  }

  private isBottomSlitOpen(): boolean {
    return !isBottomSlitCovered( this.slitConfigurationProperty.value );
  }

  private isTopSlitDecoherent(): boolean {
    return hasDetectorOnTopSlit( this.slitConfigurationProperty.value );
  }

  private isBottomSlitDecoherent(): boolean {
    return hasDetectorOnBottomSlit( this.slitConfigurationProperty.value );
  }

  /**
   * Synchronizes the wave solver with BaseSceneModel-owned scene state. Call this after any model change that affects
   * solver inputs, including scene initialization, wave/slit/barrier parameter changes, source on/off changes,
   * decoherence event updates, reset, and PhET-iO state restore. This method only copies current model values into the
   * solver; it does not advance time, reset the solver, clear hits, create decoherence events, or mutate snapshots.
   * Subclasses that add solver parameters should override this method, call super.syncSolverParameters(), and then set
   * their subclass-specific parameters.
   */
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
      barrierFractionX: this.barrierPositionFractionProperty.value,
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

  /**
   * Returns whether significant wave amplitude has arrived at the detector screen. Once true the result is
   * permanently cached in wavefrontReached so subsequent calls are O(1). Used by subclasses to gate hit generation
   * and by renderers to decide whether to show the interference pattern.
   */
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

  /**
   * Samples a normalized detector-screen vertical position in [-1, 1] from the current probability distribution,
   * applying sub-bin uniform jitter to avoid discrete banding in hit patterns. When the distribution sums to zero
   * (no wave present yet) the result is uniformly random over the full span. Callers may pass a pre-fetched
   * distribution to avoid a redundant getDetectorProbabilityDistribution() call; otherwise the method fetches it
   * from the wave solver.
   *
   * @param distribution - optional pre-fetched probability distribution; fetched from the solver if omitted
   * @returns normalized vertical position in [-1, 1] where -1 is one edge and 1 is the opposite edge of the screen
   */
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

  /**
   * Creates the decoherence event for a slit-detector interaction at the provided solver time. Called by subclasses when
   * their screen-specific timing logic determines that the wave or wave packet has reached the slits. This method chooses
   * the slit that the interaction collapses to from the currently open slits, records the detector hit only when the
   * selected slit has a detector, and leaves all model mutation to the caller.
   *
   * @param slitConfiguration - current slit configuration, used to determine detector placement
   * @param time - solver time when the slit-detector interaction occurs
   * @returns the event to apply to the scene, or null when no detector event can occur
   */
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
      selectedSlit === 'topSlit' && hasDetectorOnTopSlit( slitConfiguration ) ? 'topSlit' :
      selectedSlit === 'bottomSlit' && hasDetectorOnBottomSlit( slitConfiguration ) ? 'bottomSlit' :
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

  private linkSlitConfigurationToBarrierType(
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

  /**
   * Wires the bidirectional sync between the provided slitConfigurationProperty and barrierTypeProperty, does an
   * initial solver-parameter sync, installs the clear-screen listeners for all base scene properties, and
   * registers a lazy-link that clears the screen whenever the slit configuration changes. Subclass constructors
   * call this once after all properties have been created.
   */
  protected setupSlitConfigurationListeners( slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier> ): void {
    this.linkSlitConfigurationToBarrierType( slitConfigurationProperty );
    this.syncSolverParameters();
    this.setupClearScreenListeners();
    slitConfigurationProperty.lazyLink( () => this.clearScreen() );
  }

  /**
   * Registers a one-time lazy-link so that the emitter is turned off automatically when the subclass's
   * isMaxHitsReachedProperty becomes true. Subclass constructors call this after the property is created.
   */
  protected stopEmitterWhenMaxHitsReached(): void {
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );
  }

  /**
   * Clears the current detector-screen run without resetting user controls or saved snapshots. This is called by the
   * Clear Screen button and by listeners for model parameters whose changes make the current wave state and accumulated
   * hits stale, including wavelength, particle speed, barrier type, slit separation, slit position, and slit configuration.
   *
   * The base implementation clears detector-screen hit positions, total hit count, on-slit detector counts, wavefront
   * status, decoherence event history, and the wave solver state/parameters, then emits hitsChangedEmitter so renderers
   * and descriptions can rebuild from an empty detector screen. Subclasses that keep additional run-specific state
   * should override this method, clear that state first, and then call super.clearScreen().
   */
  protected clearScreen(): void {
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

  private clearWaveState(): void {
    this.wavefrontReached = false;
    this.decoherenceEvents.length = 0;
    this.syncSolverParameters();
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  private setupClearScreenListeners(): void {
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.particleSpeedProperty.lazyLink( () => this.clearScreen() );
    this.barrierTypeProperty.lazyLink( () => this.clearScreen() );
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.barrierPositionFractionProperty.lazyLink( () => this.clearScreen() );

    this.isEmittingProperty.lazyLink( isEmitting => {
      if ( isEmitting ) {
        this.syncSolverParameters();
      }
      else {
        this.clearWaveStateWhenEmitterTurnsOff();
      }
    } );
  }

  /**
   * Called when the emitter is turned off after initialization. Clears only transient wave state that depends on the
   * source currently being on: wavefront status, decoherence event history, and the wave solver state/parameters. This
   * does not clear accumulated detector hits, detector counts, or snapshots; use clearScreen() for a user-facing scene
   * clear. Subclasses override this hook to reset screen-specific transient emission state, then call super so the
   * shared wave state is reset consistently.
   */
  protected clearWaveStateWhenEmitterTurnsOff(): void {
    this.clearWaveState();
  }

  /**
   * Captures an immutable snapshot of the current detector-screen state and appends it to snapshotsProperty. A
   * snapshot freezes the current detection mode, source type, wavelength, slit geometry, intensity distribution, and
   * other display parameters so it can be rendered independently alongside the live scene. Hit positions are copied
   * only for hits-mode snapshots. No-ops when the maximum snapshot count has already been reached. Called by subclass
   * takeSnapshot() overrides (e.g., HighIntensitySceneModel, SingleParticlesSceneModel) which supply the appropriate
   * detection mode and intensity.
   *
   * @param detectionMode - whether the snapshot records averaged intensity or individual particle hits
   * @param slitSetting - current slit configuration at the moment of capture
   * @param intensity - normalized display intensity value stored with the snapshot
   */
  protected takeSnapshot( detectionMode: DetectionMode, slitSetting: SlitConfigurationWithNoBarrier, intensity: number ): void {
    if ( this.snapshotsProperty.value.length >= QuantumWaveInterferenceConstants.MAX_SNAPSHOTS ) {
      return;
    }

    // Capture the solver's detector-screen probability distribution so an intensity-mode snapshot renders
    // the same pattern the user was looking at; for hits-mode there is no distribution to render.
    const intensityDistribution = detectionMode === 'intensity'
                                  ? Array.from( this.waveSolver.getDetectorProbabilityDistribution() )
                                  : [];

    const snapshot: Snapshot = {
      snapshotNumber: this.snapshotsProperty.value.length + 1,
      hits: detectionMode === 'hits' ? [ ...this.hits ] : [],
      detectionMode: detectionMode,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,

      // Barrier-to-screen distance (the screen sits at the far edge, x = regionWidth), used as the slit-to-screen
      // distance L when describers reconstruct the theoretical pattern. Must match the live analysis convention in
      // BandAnalysis.analyzeTheoreticalPattern.
      screenDistance: ( 1 - this.barrierPositionFractionProperty.value ) * this.regionWidth,
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

  // Deletes a specific snapshot and compacts the remaining snapshot labels to match their current display order.
  // NOTE: identical implementation in quantum-wave-interference/js/experiment/model/SceneModel.ts
  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = renumberSnapshots( this.snapshotsProperty.value.filter( s => s !== snapshot ) );
  }

  public abstract step( dt: number ): void;

  /**
   * Returns an opaque serializable object containing any subclass-specific state that should be persisted in the
   * PhET-iO state. The base-class implementation returns an empty object; subclasses override this to include their
   * additional state. Called by BaseSceneModelIO.toStateObject().
   */
  protected getSubclassState(): object {
    return {};
  }

  /**
   * Restores a BaseSceneModel to the provided PhET-iO state. Called from the BaseSceneModelIO applyState hook.
   * Replaces the wave solver state, clears and repopulates hit positions, restores the wavefront flag and
   * decoherence events, delegates subclass-specific state to applySubclassState(), then re-syncs solver parameters
   * and emits hitsChangedEmitter so all renderers and descriptions see the restored data.
   */
  private static applyBaseSceneModelState( model: BaseSceneModel, stateObject: BaseSceneModelStateObject ): void {
    model.waveSolver.setState( stateObject.waveSolverState );
    model.hits.length = 0;
    for ( const h of stateObject.hits ) {
      model.hits.push( new Vector2( h.x, h.y ) );
    }
    model.wavefrontReached = stateObject.wavefrontReached;
    model.decoherenceEvents.length = 0;
    model.decoherenceEvents.push( ...stateObject.decoherenceEvents.map( event => _.assign( {}, event ) ) );
    model.applySubclassState( stateObject.subclassState );
    model.syncSolverParameters();
    model.hitsChangedEmitter.emit();
  }

  /**
   * Restores subclass-specific PhET-iO state from the object returned by getSubclassState(). Called by
   * applyBaseSceneModelState() after the base-class state has been restored. The base-class implementation is a
   * no-op; subclasses override this to restore their additional state.
   */
  protected applySubclassState( stateObject: object ): void {
    // No-op in the base class.
  }

  /**
   * BaseSceneModelIO uses reference-type serialization: each scene model exists for the lifetime of the simulation, so
   * deserialization restores state on the existing model through applyState rather than creating a new instance with
   * fromStateObject.
   *
   * The nested state fields use data-type serialization. waveSolverState and subclassState are serialized as object
   * literals, while hits and decoherenceEvents are arrays of object literals. applyState passes waveSolverState to the
   * existing WaveSolver, clears and reconstructs hits as Vector2 instances, restores wavefrontReached, clears and copies
   * the decoherence events, and delegates subclassState to applySubclassState. It then synchronizes solver parameters
   * and emits hitsChangedEmitter so consumers observe the restored state.
   *
   * See https://github.com/phetsims/phet-io/blob/main/doc/phet-io-instrumentation-technical-guide.md#serialization
   * for details about PhET-iO serialization strategies.
   */
  private static readonly BaseSceneModelIO = new IOType<BaseSceneModel, BaseSceneModelStateObject>( 'BaseSceneModelIO', {
    valueType: BaseSceneModel,
    documentation: 'Serializes the wave solver state, hit positions, and transient wave records for a scene',
    toStateObject: ( model: BaseSceneModel ) => ( {
      waveSolverState: model.waveSolver.getState(),
      hits: model.hits.map( v => ( { x: v.x, y: v.y } ) ),
      wavefrontReached: model.wavefrontReached,
      decoherenceEvents: model.decoherenceEvents.map( event => _.assign( {}, event ) ),
      subclassState: model.getSubclassState()
    } ),
    stateSchema: {
      waveSolverState: ObjectLiteralIO,
      hits: ArrayIO( ObjectLiteralIO ),
      wavefrontReached: BooleanIO,
      decoherenceEvents: ArrayIO( ObjectLiteralIO ),
      subclassState: ObjectLiteralIO
    },
    applyState: ( model: BaseSceneModel, stateObject: BaseSceneModelStateObject ) => {
      BaseSceneModel.applyBaseSceneModelState( model, stateObject );
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
    this.particleSpeedProperty.reset();
    this.barrierTypeProperty.reset();
    this.slitSeparationProperty.reset();
    this.barrierPositionFractionProperty.reset();
    this.slitConfigurationProperty.reset();
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
