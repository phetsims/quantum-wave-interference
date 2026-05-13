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
import Vector2, { type Vector2StateObject } from '../../../../dot/js/Vector2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import GetSetButtonsIO from '../../../../tandem/js/types/GetSetButtonsIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import { getExactAnalyticalDetectorIntensity } from '../../common/model/AnalyticalDetectorPattern.js';
import { renumberSnapshots, type Snapshot, SnapshotIO } from '../../common/model/Snapshot.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { getFullDetectorScreenHalfWidth } from './DetectorScreenScale.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { hasAnyDetector, hasDetectorOnSide, type SlitConfiguration, SlitConfigurationValues } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';

// Maximum emission rate in hits per second at full intensity
const MAX_EMISSION_RATE = 100;

// Maximum iterations for rejection sampling to prevent infinite loops
const MAX_REJECTION_ITERATIONS = 1000;

// Vertical extent of the hit distribution on the detector screen, as a fraction of the full height. Keeping this as a
// named constant makes the normalized hit coordinate convention explicit, even though it is currently the full height.
const HIT_VERTICAL_EXTENT = 1;

const SLIT_WIDTH_BY_SOURCE_TYPE: Record<SourceType, number> = {
  photons: 0.02, // 20 μm
  electrons: 0.00006, // 0.06 μm
  neutrons: 0.00006, // 0.06 μm
  heliumAtoms: 0.00006 // 0.06 μm
};

type SelfOptions = {
  sourceType: SourceType;
};

export type SceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SceneModel extends PhetioObject {

  public static readonly SCREEN_BRIGHTNESS_MAX = 0.25;

  /**
   * Slit width in mm for a given source type.
   */
  public static getSlitWidth( sourceType: SourceType ): number {
    return SLIT_WIDTH_BY_SOURCE_TYPE[ sourceType ];
  }

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
  public readonly slitSettingProperty: StringUnionProperty<SlitConfiguration>;

  // Detection mode (Average Intensity vs Hits)
  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;

  // Screen brightness: 0 to SCREEN_BRIGHTNESS_MAX
  public readonly screenBrightnessProperty: NumberProperty;

  // Slit width in mm (constant per source type, determined by the physics)
  public readonly slitWidth: number;

  // The mass of the particle (kg), or 0 for photons
  private readonly particleMass: number;

  // Total number of hits accumulated on the detector screen
  public readonly totalHitsProperty: NumberProperty;

  // Number of hits detected by the which-path detector (when LEFT_DETECTOR or RIGHT_DETECTOR is active).
  // Approximately half of all hits pass through the monitored slit.
  public readonly leftDetectorHitsProperty: NumberProperty;
  public readonly rightDetectorHitsProperty: NumberProperty;
  private readonly detectorHitsProperty: NumberProperty;

  // True when Hits mode has reached the per-scene hit cap.
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled because the hit cap has been reached.
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Ranges for velocity (m/s) - specific to each particle type
  public readonly velocityRange: Range;

  // Ranges for slit separation (mm) and screen distance (m)
  public readonly slitSeparationRange: Range;
  public readonly screenDistanceRange: Range;

  // Accumulated hit positions on the detector screen. Each Vector2 has x in [-1,1] (horizontal,
  // determined by interference pattern probability) and y in [-1,1] (vertical, uniformly random).
  public readonly hits: Vector2[];

  // Emitter that fires when the hits array changes (new hits added or cleared)
  public readonly hitsChangedEmitter: TEmitter;

  // Snapshots captured from this scene's detector screen
  public readonly snapshotsProperty: Property<Snapshot[]>;

  // Number of snapshots currently stored
  public readonly numberOfSnapshotsProperty: TReadOnlyProperty<number>;

  // Fractional hit accumulator for sub-frame hit tracking
  private hitAccumulator: number;

  public constructor( providedOptions: SceneModelOptions ) {

    const options = optionize<SceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false,
      phetioType: SceneModel.SceneModelIO,
      phetioDocumentation: 'Model for a single source-type scene, including detector screen data.'
      //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Should this be phetioState: false, or does it have state of its own?
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;

    // Set per-source-type constants. defaultVelocity and defaultSlitSeparation are set per source type.
    let defaultVelocity: number;
    let defaultSlitSeparation: number;

    this.slitWidth = SceneModel.getSlitWidth( options.sourceType );

    // Screen distance range is the same for all source types.
    this.screenDistanceRange = new Range( 0.4, 0.8 ); // m
    const defaultScreenDistance = 0.6;

    if ( options.sourceType === 'photons' ) {
      this.particleMass = 0;
      this.velocityRange = new Range( 0, 0 ); // Not used for photons
      this.slitSeparationRange = new Range( 0.05, 0.5 ); // mm
      defaultVelocity = 0;
      defaultSlitSeparation = 0.25;
    }
    else if ( options.sourceType === 'electrons' ) {
      this.particleMass = QuantumWaveInterferenceConstants.ELECTRON_MASS;
      this.velocityRange = new Range( 2e5, 1e6 ); // m/s (200–1000 km/s)
      this.slitSeparationRange = new Range( 0.0001, 0.002 ); // mm (0.1–2.0 μm)
      defaultVelocity = 6e5; // 600 km/s
      defaultSlitSeparation = 0.001; // 1 μm
    }
    else if ( options.sourceType === 'neutrons' ) {
      this.particleMass = QuantumWaveInterferenceConstants.NEUTRON_MASS;
      this.velocityRange = new Range( 200, 1000 ); // m/s
      this.slitSeparationRange = new Range( 0.0001, 0.002 ); // mm (0.1–2.0 μm)
      defaultVelocity = 600;
      defaultSlitSeparation = 0.001; // mm (1 μm)
    }
    else {
      // Helium atoms
      this.particleMass = QuantumWaveInterferenceConstants.HELIUM_ATOM_MASS;
      //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Next 4 lines are the same as lines 183-186, maybe that's OK.
      this.velocityRange = new Range( 200, 1000 ); // m/s
      this.slitSeparationRange = new Range( 0.0001, 0.002 ); // mm (0.1–2.0 μm)
      defaultVelocity = 600;
      defaultSlitSeparation = 0.001; // mm (1 μm)
    }

    this.hits = [];
    this.hitsChangedEmitter = new Emitter();
    this.hitAccumulator = 0;

    const tandem = options.tandem;

    this.isEmittingProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isEmittingProperty' )
    } );

    // Wavelength in nm. For photons, this is directly controlled via a slider. For particles, this property is
    // not used directly — the effective wavelength is computed from velocity via de Broglie relation.
    // For non-photons, the wavelength is derived from velocity via de Broglie (see getEffectiveWavelength),
    // so this property's range is [0,0] and its value is unused directly.
    this.wavelengthProperty = new NumberProperty( options.sourceType === 'photons' ? 650 : 0, {
      //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Option values are the same as BaseModel's wavelengthProperty
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

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Identical to BaseModel.slitSeparationProperty
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

    this.slitSettingProperty = new StringUnionProperty<SlitConfiguration>( 'bothOpen', {
      validValues: SlitConfigurationValues,
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

    this.leftDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'leftDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.rightDetectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'rightDetectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.detectorHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'detectorHitsProperty' ),
      phetioReadOnly: true
    } );

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) =>
        detectionMode === 'hits' && totalHits >= ExperimentConstants.MAX_HITS
    );

    this.isEmitterEnabledProperty = this.isMaxHitsReachedProperty.derived( isMaxHitsReached => !isMaxHitsReached );

    this.snapshotsProperty = new Property<Snapshot[]>( [], {
      tandem: tandem.createTandem( 'snapshotsProperty' ),
      phetioValueType: ArrayIO( SnapshotIO ),
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

    // Clear accumulated data when any parameter that affects the interference pattern changes.
    // Accumulated hits are based on the probability distribution at the time of generation,
    // so they become inconsistent (and pedagogically misleading) if the pattern changes beneath them.
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.screenDistanceProperty.lazyLink( () => this.clearScreen() );
    this.slitSettingProperty.lazyLink( () => this.clearScreen() );
    this.wavelengthProperty.lazyLink( () => this.clearScreen() );
    this.velocityProperty.lazyLink( () => this.clearScreen() );

    // When the hit cap is reached in Hits mode, stop the source and require the user to clear the screen.
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );
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

      affirm( this.velocityProperty.value !== undefined, 'Non-photon scenes must have a velocity' );
      const velocity = this.velocityProperty.value;
      if ( velocity === 0 ) {
        return 0;
      }
      return QuantumWaveInterferenceConstants.PLANCK_CONSTANT / ( this.particleMass * velocity );
    }
  }

  /**
   * Computes the intensity at a given position on the detector screen.
   * Uses the double-slit interference formula: I = I0 * cos²(π d sinθ / λ) * sinc²(π a sinθ / λ)
   * where d = slit separation, a = slit width, λ = wavelength, θ = angle from center.
   *
   * @param positionOnScreen - position on screen in meters, relative to center
   */
  public getIntensityAtPosition( positionOnScreen: number ): number {
    const lambda = this.getEffectiveWavelength();

    // Convert mm-scale slit geometry to meters before evaluating the shared Fraunhofer detector formula.
    return getExactAnalyticalDetectorIntensity( {
      positionOnScreen: positionOnScreen,
      effectiveWavelength: lambda,
      screenDistance: this.screenDistanceProperty.value,
      slitWidth: this.slitWidth * 1E-3,
      slitSeparation: this.slitSeparationProperty.value * 1E-3,
      slitSetting: this.slitSettingProperty.value
    } );
  }

  /**
   * Clears accumulated hits and intensity data from the detector screen.
   */
  public clearScreen(): void {
    this.hits.length = 0;
    this.hitAccumulator = 0;
    this.totalHitsProperty.value = 0;
    this.leftDetectorHitsProperty.value = 0;
    this.rightDetectorHitsProperty.value = 0;
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

    const snapshot: Snapshot = {
      snapshotNumber: this.snapshotsProperty.value.length + 1,
      hits: [ ...this.hits ],
      detectionMode: this.detectionModeProperty.value,
      sourceType: this.sourceType,
      wavelength: this.wavelengthProperty.value,
      slitSeparation: this.slitSeparationProperty.value,
      screenDistance: this.screenDistanceProperty.value,
      screenHalfWidth: this.fullScreenHalfWidth,
      effectiveWavelength: this.getEffectiveWavelength(),
      slitSetting: this.slitSettingProperty.value,
      isEmitting: this.isEmittingProperty.value,
      brightness: this.screenBrightnessProperty.value,
      intensity: this.intensityProperty.value,
      slitWidth: this.slitWidth,

      // Experiment screen renders its own intensity snapshots from closed-form Fraunhofer formulas via
      // its private SnapshotNode — no solver distribution to capture.
      intensityDistribution: []
    };

    this.snapshotsProperty.value = [ ...this.snapshotsProperty.value, snapshot ];
  }

  //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Same as BaseSceneModel deleteSnapshot
  /**
   * Deletes a specific snapshot and compacts the remaining snapshot labels to match their current display order.
   */
  public deleteSnapshot( snapshot: Snapshot ): void {
    this.snapshotsProperty.value = renumberSnapshots( this.snapshotsProperty.value.filter( s => s !== snapshot ) );
  }

  // Maximum number of snapshots that can be stored per scene
  public static readonly MAX_SNAPSHOTS = 4;

  /**
   * Resets all scene state to initial values: Properties, accumulated data, and snapshots.
   */
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
    this.hitAccumulator = 0;
    this.totalHitsProperty.reset();
    this.leftDetectorHitsProperty.reset();
    this.rightDetectorHitsProperty.reset();
    this.detectorHitsProperty.reset();
    this.snapshotsProperty.value = [];
    this.hitsChangedEmitter.emit();
  }

  /**
   * Generates a random horizontal position on the detector screen using rejection sampling.
   * The position is drawn from a probability distribution matching the interference pattern intensity.
   * Returns a normalized value in [-1, 1].
   *
   * The rejection rate depends on the slit geometry; typical double-slit patterns accept ~30-60% of proposals.
   * The MAX_REJECTION_ITERATIONS fallback is hit extremely rarely (< 0.01% of calls) and only for near-zero intensity
   * configurations.
   */
  private generateHitPosition(): number {
    for ( let i = 0; i < MAX_REJECTION_ITERATIONS; i++ ) {

      // Propose a random position across the full detector screen width. Zoom only changes the visible region.
      const physicalX = ( dotRandom.nextDouble() - 0.5 ) * 2 * this.fullScreenHalfWidth;

      // Accept with probability proportional to intensity at this position
      const probability = this.getIntensityAtPosition( physicalX );
      if ( dotRandom.nextDouble() < probability ) {
        return physicalX / this.fullScreenHalfWidth; // Normalize to full detector screen coordinates, [-1, 1]
      }
    }

    // Fallback: return center position if rejection sampling fails to converge
    return 0;
  }

  public step( dt: number ): void {
    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value
    ) {
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
    const isDetectorActive = hasAnyDetector( slitSetting );
    let actualHitsAddedThisFrame = 0;
    let leftDetectorHitsThisFrame = 0;
    let rightDetectorHitsThisFrame = 0;

    for ( let i = 0; i < numHits; i++ ) {

      if ( this.totalHitsProperty.value + actualHitsAddedThisFrame >= ExperimentConstants.MAX_HITS ) {
        break;
      }

      // Horizontal position determined by interference pattern probability distribution
      const x = this.generateHitPosition();

      // Vertical position uniformly random across screen height (with small padding)
      const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * HIT_VERTICAL_EXTENT;

      this.hits.push( new Vector2( x, y ) );
      actualHitsAddedThisFrame++;

      // When a which-path detector is active, each particle has ~50% probability of going through the monitored slit
      // (the one with the detector on it).
      if ( isDetectorActive ) {
        const detectorSide = dotRandom.nextDouble() < 0.5 ? 'left' : 'right';
        if ( hasDetectorOnSide( slitSetting, detectorSide ) ) {
          if ( detectorSide === 'left' ) {
            leftDetectorHitsThisFrame++;
          }
          else {
            rightDetectorHitsThisFrame++;
          }
        }
      }
    }

    if ( actualHitsAddedThisFrame === 0 ) {
      if ( this.isMaxHitsReachedProperty.value ) {
        this.isEmittingProperty.value = false;
      }
      return;
    }

    this.totalHitsProperty.value += actualHitsAddedThisFrame;
    if ( isDetectorActive ) {
      this.leftDetectorHitsProperty.value += leftDetectorHitsThisFrame;
      this.rightDetectorHitsProperty.value += rightDetectorHitsThisFrame;
      this.detectorHitsProperty.value = this.leftDetectorHitsProperty.value + this.rightDetectorHitsProperty.value;
    }

    if ( this.isMaxHitsReachedProperty.value ) {
      this.isEmittingProperty.value = false;
    }

    this.hitsChangedEmitter.emit();
  }

  //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 IOType documentation is supposed to identify the type of serialization.
  /**
   * IOType for SceneModel that serializes the live detector screen data (hits and hit accumulator)
   * which are plain arrays/numbers not covered by the individual instrumented Properties.
   */
  private static readonly SceneModelIO = new IOType<SceneModel, SceneModelStateObject>( 'SceneModelIO', {
    valueType: SceneModel,
    supertype: GetSetButtonsIO,
    stateSchema: {
      hits: ArrayIO( Vector2.Vector2IO ),
      hitAccumulator: NumberIO
    },
    toStateObject: ( model: SceneModel ): SceneModelStateObject => {
      return {
        hits: model.hits.map( v => v.toStateObject() ),
        hitAccumulator: model.hitAccumulator
      };
    },
    applyState: ( model: SceneModel, state: SceneModelStateObject ) => {

      model.hits.length = 0;
      model.hits.push( ...state.hits.map( s => Vector2.fromStateObject( s ) ) );

      model.hitAccumulator = state.hitAccumulator;

      model.hitsChangedEmitter.emit();
    }
  } );

  /**
   * Physical half-width of the full detector screen in meters. This getter keeps model and view call sites readable
   * while delegating the shared scale constants to DetectorScreenScale.
   */
  public get fullScreenHalfWidth(): number {
    return getFullDetectorScreenHalfWidth();
  }
}

type SceneModelStateObject = {
  hits: Vector2StateObject[];
  hitAccumulator: number;
};
