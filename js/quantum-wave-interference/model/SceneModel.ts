// Copyright 2026, University of Colorado Boulder

/**
 * SceneModel holds the state for one of the four source-type scenes (Photons, Electrons, Neutrons, Helium atoms).
 * Each scene maintains independent state for the emitter, slit geometry, detector screen, and accumulated data.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import DetectionMode from './DetectionMode.js';
import SlitSetting from './SlitSetting.js';
import SourceType from './SourceType.js';

// Physical constants
const PLANCK_CONSTANT = 6.626e-34; // J·s

// Particle masses in kg
const ELECTRON_MASS = 9.109e-31;
const NEUTRON_MASS = 1.675e-27;
const HELIUM_ATOM_MASS = 6.646e-27;

// Maximum emission rate in hits per second at full intensity
const MAX_EMISSION_RATE = 200;

// Maximum iterations for rejection sampling to prevent infinite loops
const MAX_REJECTION_ITERATIONS = 1000;

type SelfOptions = {
  sourceType: SourceType;
};

export type SceneModelOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SceneModel extends PhetioObject {

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
  public readonly slitSettingProperty: EnumerationProperty<SlitSetting>;

  // Detection mode (Average Intensity vs Hits)
  public readonly detectionModeProperty: EnumerationProperty<DetectionMode>;

  // Screen brightness: 0 to 1
  public readonly screenBrightnessProperty: NumberProperty;

  // Slit width in mm (constant per source type, determined by the physics)
  public readonly slitWidth: number;

  // The mass of the particle (kg), or 0 for photons
  public readonly particleMass: number;

  // Total number of hits accumulated on the detector screen
  public readonly totalHitsProperty: NumberProperty;

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

  // Emitter that fires when the hits array changes (new hits added or cleared)
  public readonly hitsChangedEmitter: TEmitter;

  // Fractional hit accumulator for sub-frame hit tracking
  private hitAccumulator: number;

  public constructor( providedOptions: SceneModelOptions ) {

    const options = optionize<SceneModelOptions, SelfOptions, PhetioObjectOptions>()( {
      phetioState: false
    }, providedOptions );

    super( options );

    this.sourceType = options.sourceType;

    // Set per-source-type constants. screenHalfWidth is the physical half-width of the detector
    // screen in meters, chosen so that approximately 10 fringes are visible at default settings.
    if ( options.sourceType === SourceType.PHOTONS ) {
      this.particleMass = 0;
      this.slitWidth = 0.1; // mm
      this.velocityRange = new Range( 0, 0 ); // Not used for photons
      this.slitSeparationRange = new Range( 0.2, 1.0 ); // mm
      this.screenDistanceRange = new Range( 0.4, 0.8 ); // m
      this.screenHalfWidth = 0.005; // 5 mm
    }
    else if ( options.sourceType === SourceType.ELECTRONS ) {
      this.particleMass = ELECTRON_MASS;
      this.slitWidth = 0.001; // mm (1 μm, typical for electron diffraction)
      this.velocityRange = new Range( 1e5, 1e7 ); // m/s
      this.slitSeparationRange = new Range( 0.002, 0.01 ); // mm
      this.screenDistanceRange = new Range( 0.1, 0.5 ); // m
      this.screenHalfWidth = 5e-5; // 0.05 mm
    }
    else if ( options.sourceType === SourceType.NEUTRONS ) {
      this.particleMass = NEUTRON_MASS;
      this.slitWidth = 0.01; // mm
      this.velocityRange = new Range( 200, 2000 ); // m/s (thermal to cold neutrons)
      this.slitSeparationRange = new Range( 0.02, 0.1 ); // mm
      this.screenDistanceRange = new Range( 0.5, 5.0 ); // m
      this.screenHalfWidth = 1e-4; // 0.1 mm
    }
    else {
      // Helium atoms
      this.particleMass = HELIUM_ATOM_MASS;
      this.slitWidth = 0.001; // mm
      this.velocityRange = new Range( 500, 3000 ); // m/s
      this.slitSeparationRange = new Range( 0.002, 0.01 ); // mm
      this.screenDistanceRange = new Range( 0.5, 2.0 ); // m
      this.screenHalfWidth = 1e-4; // 0.1 mm
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
    this.wavelengthProperty = new NumberProperty( options.sourceType === SourceType.PHOTONS ? 650 : 0, {
      range: options.sourceType === SourceType.PHOTONS ? new Range( 380, 780 ) : new Range( 0, 0 ),
      units: 'nm',
      tandem: tandem.createTandem( 'wavelengthProperty' )
    } );

    this.velocityProperty = new NumberProperty(
      options.sourceType !== SourceType.PHOTONS ?
      ( this.velocityRange.min + this.velocityRange.max ) / 2 : 0, {
        range: this.velocityRange,
        units: 'm/s',
        tandem: tandem.createTandem( 'velocityProperty' )
      }
    );

    this.intensityProperty = new NumberProperty( 0.5, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'intensityProperty' )
    } );

    this.slitSeparationProperty = new NumberProperty( this.slitSeparationRange.max, {
      range: this.slitSeparationRange,
      units: 'mm',
      tandem: tandem.createTandem( 'slitSeparationProperty' )
    } );

    this.screenDistanceProperty = new NumberProperty(
      ( this.screenDistanceRange.min + this.screenDistanceRange.max ) / 2, {
        range: this.screenDistanceRange,
        units: 'm',
        tandem: tandem.createTandem( 'screenDistanceProperty' )
      }
    );

    this.slitSettingProperty = new EnumerationProperty( SlitSetting.BOTH_OPEN, {
      tandem: tandem.createTandem( 'slitSettingProperty' )
    } );

    this.detectionModeProperty = new EnumerationProperty( DetectionMode.AVERAGE_INTENSITY, {
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this.screenBrightnessProperty = new NumberProperty( 0.5, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'screenBrightnessProperty' )
    } );

    this.totalHitsProperty = new NumberProperty( 0, {
      tandem: tandem.createTandem( 'totalHitsProperty' ),
      phetioReadOnly: true
    } );

    // Clear accumulated data when slit settings change
    this.slitSeparationProperty.lazyLink( () => this.clearScreen() );
    this.screenDistanceProperty.lazyLink( () => this.clearScreen() );
    this.slitSettingProperty.lazyLink( () => this.clearScreen() );
  }

  /**
   * Returns the effective wavelength in meters for the interference calculation.
   * For photons, this is the wavelength in nm converted to m.
   * For particles, this is the de Broglie wavelength: lambda = h / (m * v).
   */
  public getEffectiveWavelength(): number {
    if ( this.sourceType === SourceType.PHOTONS ) {
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

    if ( slitSetting === SlitSetting.LEFT_COVERED || slitSetting === SlitSetting.RIGHT_COVERED ) {
      // Single slit: only diffraction envelope, no interference
      return singleSlitFactor;
    }

    if ( slitSetting === SlitSetting.LEFT_DETECTOR || slitSetting === SlitSetting.RIGHT_DETECTOR ) {
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
    this.hitAccumulator = 0;
    this.totalHitsProperty.value = 0;
    this.hitsChangedEmitter.emit();
  }

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

    for ( let i = 0; i < numHits; i++ ) {

      // Horizontal position determined by interference pattern probability distribution
      const x = this.generateHitPosition();

      // Vertical position uniformly random across screen height (with small padding)
      const y = ( dotRandom.nextDouble() - 0.5 ) * 2 * 0.95; // [-0.95, 0.95] to leave padding

      this.hits.push( new Vector2( x, y ) );
    }

    this.totalHitsProperty.value = this.hits.length;
    this.hitsChangedEmitter.emit();
  }
}

quantumWaveInterference.register( 'SceneModel', SceneModel );
