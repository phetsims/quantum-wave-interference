// Copyright 2026, University of Colorado Boulder

/**
 * SceneModel holds the state for one of the four source-type scenes (Photons, Electrons, Neutrons, Helium atoms).
 * Each scene maintains independent state for the emitter, slit geometry, detector screen, and accumulated data.
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
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import GetSetButtonsIO from '../../../../tandem/js/types/GetSetButtonsIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import { type DetectionMode, DetectionModeValues } from './DetectionMode.js';
import { type SlitSetting, SlitSettingValues } from './SlitSetting.js';
import Snapshot from './Snapshot.js';
import { type SourceType } from './SourceType.js';

// Physical constants
const PLANCK_CONSTANT = 6.626e-34; // J·s

// Particle masses in kg
const ELECTRON_MASS = 9.109e-31;
const NEUTRON_MASS = 1.675e-27;
const HELIUM_ATOM_MASS = 6.646e-27;

// Maximum emission rate in hits per second at full intensity
const MAX_EMISSION_RATE = 100;

// Maximum number of hit positions to retain in the hits array. When the array exceeds this
// size by HITS_TRIM_MARGIN, it is trimmed back to MAX_HITS_RETAINED from the front. This
// prevents unbounded memory growth while the intensityBins continue accumulating correctly.
// The trim margin amortizes the cost of array splicing across many frames.
const MAX_HITS_RETAINED = 100000;
const HITS_TRIM_MARGIN = 2000;

// Maximum iterations for rejection sampling to prevent infinite loops
const MAX_REJECTION_ITERATIONS = 1000;

// Number of bins for the intensity accumulator (used for Average Intensity display)
const INTENSITY_BIN_COUNT = 200;

type SelfOptions = {
  sourceType: SourceType;
};

export type SceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SceneModel extends PhetioObject {

  public static readonly SCREEN_BRIGHTNESS_MAX = 0.25;

  public readonly sourceType: SourceType;

  // Whether the emitter is on
  public readonly isEmittingProperty: BooleanProperty;

  // Wavelength in nm (for photons, directly controlled; for particles, derived from velocity)
  public readonly wavelengthProperty: NumberProperty;

  // Velocity in m/s (for particles only; photons always travel at c)
  public readonly velocityProperty: NumberProperty;

  // Intensity: 0 to 1 (controls beam opacity and emission rate)
  public readonly intensityProperty: NumberProperty;

  // Slit separation in mm (center-to-center distance between the two slits)
  public readonly slitSeparationProperty: NumberProperty;

  // Screen distance in m (distance from the double slit to the detector screen)
  public readonly screenDistanceProperty: NumberProperty;

  // Slit configuration
  public readonly slitSettingProperty: StringUnionProperty<SlitSetting>;

  // Detection mode (Average Intensity vs Hits)
  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;

  // Screen brightness: 0 to SCREEN_BRIGHTNESS_MAX
  public readonly screenBrightnessProperty: NumberProperty;

  // Slit width in mm (constant per source type, determined by the physics)
  public readonly slitWidth: number;

  // The mass of the particle (kg), or 0 for photons
  public readonly particleMass: number;

  // Total number of hits accumulated on the detector screen
  public readonly totalHitsProperty: NumberProperty;

  // Number of hits detected by the which-path detector (when LEFT_DETECTOR or RIGHT_DETECTOR is active).
  // Approximately half of all hits pass through the monitored slit.
  public readonly detectorHitsProperty: NumberProperty;

  // Ranges for velocity (m/s) - specific to each particle type
  public readonly velocityRange: Range;

  // Ranges for slit separation (mm) and screen distance (m)
  public readonly slitSeparationRange: Range;
  public readonly screenDistanceRange: Range;

  // Physical half-width of the detector screen in meters, chosen per source type
  // so that ~10 interference fringes are visible at default settings
  public readonly screenHalfWidth: number;

  // Accumulated hit positions on the detector screen. Each Vector2 has x in [-1,1] (horizontal,
  // determined by interference pattern probability) and y in [-1,1] (vertical, uniformly random).
  public readonly hits: Vector2[];

  // Intensity accumulator bins for the Average Intensity display. Each bin tracks the count of
  // hits that landed in that horizontal region. The bins span the full screen width [-1, 1].
  // This enables Average Intensity mode to build up over time rather than showing the theoretical
  // pattern instantly, matching the design requirement that time controls affect aggregation rate.
  public readonly intensityBins: number[];

  // The maximum value in intensityBins, tracked incrementally for efficient normalization
  public intensityBinsMax: number;

  // Emitter that fires when the hits array changes (new hits added or cleared)
  public readonly hitsChangedEmitter: TEmitter;

  // Snapshots captured from this scene's detector screen
  public readonly snapshotsProperty: Property<Snapshot[]>;

  // Number of snapshots currently stored
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Counter for generating unique snapshot numbers
  private nextSnapshotNumber: number;

  // Fractional hit accumulator for sub-frame hit tracking
  private hitAccumulator: number;

  public constructor( providedOptions: SceneModelOptions ) {

    const options = optionize<SceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      phetioType: SceneModel.SceneModelIO,
      phetioDocumentation: 'Model for a single source-type scene, including detector screen data.'
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;

    // Set per-source-type constants. screenHalfWidth is the physical half-width of the detector
    // screen in meters, chosen so that approximately 10 fringes are visible at default settings.
    // defaultScreenDistance and defaultVelocity are set per source type to match the design mockup.
    let defaultScreenDistance: number;
    let defaultVelocity: number;
    let defaultSlitSeparation: number;

    if ( options.sourceType === 'photons' ) {
      this.particleMass = 0;
      this.slitWidth = 0.02; // mm (20 μm)
      this.velocityRange = new Range( 0, 0 ); // Not used for photons
      this.slitSeparationRange = new Range( 0.05, 0.5 ); // mm
      this.screenDistanceRange = new Range( 0.4, 0.8 ); // m
      this.screenHalfWidth = 0.02; // 20 mm (40 mm total width; 10 mm scale bar spans ~1/4 of screen)
      defaultScreenDistance = this.screenDistanceRange.max;
      defaultVelocity = 0;
      defaultSlitSeparation = 0.25;
    }
    else if ( options.sourceType === 'electrons' ) {
      this.particleMass = ELECTRON_MASS;
      this.slitWidth = 0.00003; // mm (0.03 μm)
      this.velocityRange = new Range( 7e5, 1.5e6 ); // m/s (700–1500 km/s per design mockup)
      this.slitSeparationRange = new Range( 0.0001, 0.0009 ); // mm (0.1–0.9 μm)
      this.screenDistanceRange = new Range( 0.4, 0.8 ); // m (per design mockup)
      this.screenHalfWidth = 0.02; // 20 mm (40 mm total width; 10 mm scale bar spans ~1/4 of screen)
      defaultScreenDistance = this.screenDistanceRange.max;
      defaultVelocity = 1.1e6; // 1100 km/s
      defaultSlitSeparation = 0.0005; // 0.5 μm
    }
    else if ( options.sourceType === 'neutrons' ) {
      this.particleMass = NEUTRON_MASS;
      this.slitWidth = 0.003; // mm (3 μm)
      this.velocityRange = new Range( 200, 800 ); // m/s
      this.slitSeparationRange = new Range( 0.01, 0.07 ); // mm (10–70 μm)
      this.screenDistanceRange = new Range( 0.4, 0.8 ); // m
      this.screenHalfWidth = 4e-4; // 0.4 mm (0.8 mm total width; scale bar spans ~1/4 of screen)
      defaultScreenDistance = this.screenDistanceRange.max;
      defaultVelocity = 500;
      defaultSlitSeparation = 0.04; // mm (40 μm)
    }
    else {
      // Helium atoms
      this.particleMass = HELIUM_ATOM_MASS;
      this.slitWidth = 0.0003; // mm (0.3 μm)
      this.velocityRange = new Range( 400, 2000 ); // m/s
      this.slitSeparationRange = new Range( 0.001, 0.007 ); // mm (1–7 μm)
      this.screenDistanceRange = new Range( 0.4, 0.8 ); // m
      this.screenHalfWidth = 4e-4; // 0.4 mm (0.8 mm total width; scale bar spans ~1/4 of screen)
      defaultScreenDistance = this.screenDistanceRange.max;
      defaultVelocity = 1200;
      defaultSlitSeparation = 0.004; // mm (4 μm)
    }

    this.hits = [];
    this.intensityBins = new Array<number>( INTENSITY_BIN_COUNT ).fill( 0 );
    this.intensityBinsMax = 0;
    this.hitsChangedEmitter = new Emitter();
    this.hitAccumulator = 0;

    const tandem = options.tandem;

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    // Wavelength in nm. For photons, this is directly controlled via a slider. For particles, this property is
    // not used directly — the effective wavelength is computed from velocity via de Broglie relation.
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

    this.intensityProperty = new NumberProperty( 0.5, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'intensityProperty' )
    } );

    this.slitSeparationProperty = new NumberProperty( defaultSlitSeparation, {
      range: this.slitSeparationRange,
      units: 'mm',
      tandem: tandem.createTandem( 'slitSeparationProperty' )
    } );

    this.screenDistanceProperty = new NumberProperty( defaultScreenDistance, {
      range: this.screenDistanceRange,
      units: 'm',
      tandem: tandem.createTandem( 'screenDistanceProperty' )
    } );

    this.slitSettingProperty = new StringUnionProperty<SlitSetting>( 'bothOpen', {
      validValues: SlitSettingValues,
      tandem: tandem.createTandem( 'slitSettingProperty' )
    } );

    this.detectionModeProperty = new StringUnionProperty<DetectionMode>( 'averageIntensity', {
      validValues: DetectionModeValues,
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this.screenBrightnessProperty = new NumberProperty( SceneModel.SCREEN_BRIGHTNESS_MAX * 0.5, {
      range: new Range( 0, SceneModel.SCREEN_BRIGHTNESS_MAX ),
      tandem: tandem.createTandem( 'screenBrightnessProperty' )
    } );

    this.totalHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalHitsProperty' ),
      phetioReadOnly: true
    } );

    this.detectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'detectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.snapshotsProperty = new Property<Snapshot[]>( [], {
      tandem: tandem.createTandem( 'snapshotsProperty' ),
      phetioValueType: ArrayIO( Snapshot.SnapshotIO ),
      phetioDocumentation: 'The array of detector screen snapshots captured in this scene.'
    } );

    this.numberOfSnapshotsProperty = new DerivedProperty(
      [ this.snapshotsProperty ],
      snapshots => snapshots.length, {
        tandem: tandem.createTandem( 'numberOfSnapshotsProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'The number of snapshots currently stored in this scene.'
      }
    );

    this.nextSnapshotNumber = 1;

    // Keep nextSnapshotNumber consistent when state is restored via phet-io.
    this.snapshotsProperty.lazyLink( snapshots => {
      if ( snapshots.length > 0 ) {
        const maxNumber = Math.max( ...snapshots.map( s => s.snapshotNumber ) );
        this.nextSnapshotNumber = Math.max( this.nextSnapshotNumber, maxNumber + 1 );
      }
    } );

    // Clear accumulated data when any parameter that affects the interference pattern changes.
    // Accumulated hits are based on the probability distribution at the time of generation, so
    // they become inconsistent (and pedagogically misleading) if the pattern changes beneath them.
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.screenDistanceProperty.lazyLink( () => this.clearScreen() );
    this.slitSettingProperty.lazyLink( () => this.clearScreen() );
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );

    // Switching between Average Intensity and Hits should start a fresh accumulation.
    this.detectionModeProperty.lazyLink( () => this.clearScreen() );
  }

  /**
   * Returns the effective wavelength in meters for the interference calculation.
   * For photons, this is the wavelength in nm converted to m.
   * For particles, this is the de Broglie wavelength: lambda = h / (m * v).
   */
  public getEffectiveWavelength(): number {
    if ( this.sourceType === 'photons' ) {
      return this.wavelengthProperty.value * 1e-9; // nm to m
    }
    else {
      const velocity = this.velocityProperty.value;
      if ( velocity === 0 ) {
        return 0;
      }
      return PLANCK_CONSTANT / ( this.particleMass * velocity );
    }
  }

  /**
   * Computes the intensity at a given position on the detector screen.
   * Uses the double-slit interference formula: I = I0 * cos²(π d sinθ / λ) * sinc²(π a sinθ / λ)
   * where d = slit separation, a = slit width, λ = wavelength, θ = angle from center.
   *
   * @param y - position on screen in meters, relative to center
   */
  public getIntensityAtPosition( y: number ): number {
    const lambda = this.getEffectiveWavelength();
    if ( lambda === 0 ) {
      return 0;
    }

    const d = this.slitSeparationProperty.value * 1e-3; // mm to m
    const a = this.slitWidth * 1e-3; // mm to m
    const L = this.screenDistanceProperty.value; // m

    // For small angles: sinθ ≈ tanθ = y / L
    const sinTheta = y / Math.sqrt( y * y + L * L );

    // Single-slit diffraction envelope: sinc²(π a sinθ / λ)
    const singleSlitArg = Math.PI * a * sinTheta / lambda;
    const singleSlitFactor = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

    const slitSetting = this.slitSettingProperty.value;

    if ( slitSetting === 'leftCovered' || slitSetting === 'rightCovered' ) {
      // Single slit: only diffraction envelope, no interference
      return singleSlitFactor;
    }

    if ( slitSetting === 'leftDetector' || slitSetting === 'rightDetector' ) {
      // Which-path detection destroys interference: sum of two single-slit patterns
      // (no cross-term), result is essentially a broad single-slit-like pattern
      return singleSlitFactor;
    }

    // Both open: double-slit interference modulated by single-slit envelope
    // I = cos²(π d sinθ / λ) * sinc²(π a sinθ / λ)
    const doubleSlitArg = Math.PI * d * sinTheta / lambda;
    const doubleSlitFactor = Math.pow( Math.cos( doubleSlitArg ), 2 );

    return doubleSlitFactor * singleSlitFactor;
  }

  /**
   * Clears accumulated hits and intensity data from the detector screen.
   */
  public clearScreen(): void {
    this.hits.length = 0;
    this.intensityBins.fill( 0 );
    this.intensityBinsMax = 0;
    this.hitAccumulator = 0;
    this.totalHitsProperty.value = 0;
    this.detectorHitsProperty.value = 0;
    this.hitsChangedEmitter.emit();
  }

  /**
   * Takes a snapshot of the current detector screen state. Maximum of 4 snapshots per scene.
   */
  public takeSnapshot(): void {
    if ( this.snapshotsProperty.value.length >= SceneModel.MAX_SNAPSHOTS ) {
      return;
    }

    const snapshot = new Snapshot( this.nextSnapshotNumber++, {
      hits: this.hits,
      detectionMode: this.detectionModeProperty.value,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.screenDistanceProperty.value,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: this.slitSettingProperty.value,
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

  // Maximum number of snapshots that can be stored per scene
  public static readonly MAX_SNAPSHOTS = 4;

  // Number of bins used for the intensity accumulator
  public static readonly INTENSITY_BIN_COUNT = INTENSITY_BIN_COUNT;

  public reset(): void {
    this.isEmittingProperty.reset();
    this.wavelengthProperty.reset();
    this.velocityProperty.reset();
    this.intensityProperty.reset();
    this.slitSeparationProperty.reset();
    this.screenDistanceProperty.reset();
    this.slitSettingProperty.reset();
    this.detectionModeProperty.reset();
    this.screenBrightnessProperty.reset();
    this.hits.length = 0;
    this.intensityBins.fill( 0 );
    this.intensityBinsMax = 0;
    this.hitAccumulator = 0;
    this.totalHitsProperty.reset();
    this.detectorHitsProperty.reset();
    this.snapshotsProperty.value = [];
    this.nextSnapshotNumber = 1;
    this.hitsChangedEmitter.emit();
  }

  /**
   * Generates a random horizontal position on the detector screen using rejection sampling.
   * The position is drawn from a probability distribution matching the interference pattern intensity.
   * Returns a normalized value in [-1, 1].
   */
  private generateHitPosition(): number {
    for ( let i = 0; i < MAX_REJECTION_ITERATIONS; i++ ) {

      // Propose a random position across the full screen width
      const physicalX = ( dotRandom.nextDouble() - 0.5 ) * 2 * this.screenHalfWidth;

      // Accept with probability proportional to intensity at this position
      const probability = this.getIntensityAtPosition( physicalX );
      if ( dotRandom.nextDouble() < probability ) {
        return physicalX / this.screenHalfWidth; // Normalize to [-1, 1]
      }
    }

    // Fallback: return center position if rejection sampling fails to converge
    return 0;
  }

  public step( dt: number ): void {
    if ( !this.isEmittingProperty.value ) {
      return;
    }

    // Skip unreasonably large dt (e.g., returning from a background tab)
    if ( dt > 0.5 ) {
      return;
    }

    // Compute number of hits to generate this frame based on intensity and emission rate
    const rate = MAX_EMISSION_RATE * this.intensityProperty.value;
    this.hitAccumulator += rate * dt;
    const numHits = Math.floor( this.hitAccumulator );
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const slitSetting = this.slitSettingProperty.value;
    const isDetectorActive = slitSetting === 'leftDetector' || slitSetting === 'rightDetector';
    let detectorHitsThisFrame = 0;

    for ( let i = 0; i < numHits; i++ ) {

      // Horizontal position determined by interference pattern probability distribution
      const x = this.generateHitPosition();

      // Vertical position uniformly random across screen height (with small padding)
      const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * 0.95; // [-0.95, 0.95] to leave padding

      this.hits.push( new Vector2( x, y ) );

      // Accumulate into intensity bins for the Average Intensity display
      const binIndex = Math.min( INTENSITY_BIN_COUNT - 1,
        Math.max( 0, Math.floor( ( x + 1 ) / 2 * INTENSITY_BIN_COUNT ) ) );
      this.intensityBins[ binIndex ]++;
      if ( this.intensityBins[ binIndex ] > this.intensityBinsMax ) {
        this.intensityBinsMax = this.intensityBins[ binIndex ];
      }

      // When a which-path detector is active, each particle has ~50% probability of going
      // through the monitored slit (the one with the detector on it).
      if ( isDetectorActive && dotRandom.nextDouble() < 0.5 ) {
        detectorHitsThisFrame++;
      }
    }

    this.totalHitsProperty.value += numHits;
    if ( isDetectorActive ) {
      this.detectorHitsProperty.value += detectorHitsThisFrame;
    }

    // Cap the hits array to prevent unbounded memory growth. The intensityBins accumulator
    // is unaffected since it tracks bin counts independently of the hits array. The render
    // cap in DetectorScreenCanvasNode (MAX_RENDERED_HITS = 20000) ensures visual correctness
    // even when old hits are removed. We trim when the array exceeds the cap by a margin to
    // amortize the O(n) splice cost across many frames.
    if ( this.hits.length > MAX_HITS_RETAINED + HITS_TRIM_MARGIN ) {
      this.hits.splice( 0, this.hits.length - MAX_HITS_RETAINED );
    }

    this.hitsChangedEmitter.emit();
  }

  /**
   * IOType for SceneModel that serializes the live detector screen data (hits, intensity bins,
   * hit accumulator, and next snapshot number) which are plain arrays/numbers not covered by
   * the individual instrumented Properties.
   */
  public static readonly SceneModelIO = new IOType<SceneModel, SceneModelStateObject>( 'SceneModelIO', {
    valueType: SceneModel,
    supertype: GetSetButtonsIO,
    stateSchema: {
      hits: IOType.ObjectIO, // Flat number[] [x0, y0, x1, y1, ...]
      intensityBins: IOType.ObjectIO, // number[]
      intensityBinsMax: NumberIO,
      hitAccumulator: NumberIO,
      nextSnapshotNumber: NumberIO
    },
    toStateObject: ( model: SceneModel ): SceneModelStateObject => {
      // Pack hits into a flat array for efficient serialization
      const flatHits: number[] = new Array( model.hits.length * 2 );
      for ( let i = 0; i < model.hits.length; i++ ) {
        flatHits[ i * 2 ] = model.hits[ i ].x;
        flatHits[ i * 2 + 1 ] = model.hits[ i ].y;
      }
      return {
        hits: flatHits,
        intensityBins: [ ...model.intensityBins ],
        intensityBinsMax: model.intensityBinsMax,
        hitAccumulator: model.hitAccumulator,
        nextSnapshotNumber: model.nextSnapshotNumber
      };
    },
    applyState: ( model: SceneModel, state: SceneModelStateObject ) => {

      // Restore hits from flat array
      model.hits.length = 0;
      for ( let i = 0; i < state.hits.length; i += 2 ) {
        model.hits.push( new Vector2( state.hits[ i ], state.hits[ i + 1 ] ) );
      }

      // Restore intensity bins
      for ( let i = 0; i < state.intensityBins.length; i++ ) {
        model.intensityBins[ i ] = state.intensityBins[ i ];
      }
      model.intensityBinsMax = state.intensityBinsMax;

      model.hitAccumulator = state.hitAccumulator;
      model.nextSnapshotNumber = state.nextSnapshotNumber;

      model.hitsChangedEmitter.emit();
    }
  } as IntentionalAny );
}

type SceneModelStateObject = {
  hits: number[];
  intensityBins: number[];
  intensityBinsMax: number;
  hitAccumulator: number;
  nextSnapshotNumber: number;
};
