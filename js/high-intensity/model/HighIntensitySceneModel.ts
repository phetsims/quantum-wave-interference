// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensitySceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the High Intensity screen.
 *
 * Extends BaseSceneModel with High Intensity–specific state: detection mode, detector hit tracking per slit,
 * continuous hit accumulation, and full slit configuration
 * (including detector variants).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, MAX_HITS } from '../../common/model/BaseSceneModel.js';
import { createContinuousWaveSolver } from '../../common/model/createWaveSolver.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { hasAnyDetector, hasDetectorOnSide, type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from '../../common/model/SlitConfiguration.js';

// Number of particles per second at max intensity. TODO: This seems off by a factor of https://github.com/phetsims/quantum-wave-interference/issues/63
const MAX_EMISSION_RATE = 5;

// Valid model steps are capped at 0.5 seconds, so this is enough to preserve one slit-detector
// attempt per emitted particle at the maximum emission rate without dropping temporal bands.
const MAX_DECOHERENCE_EVENTS_PER_FRAME = 64;

// The screen model runs at 0.5x in Normal speed, so 2 seconds of effective model time produces
// a 4-second detector pattern formation time in Normal speed.
export const DETECTOR_PATTERN_FORMATION_DURATION = 2;

export type HighIntensitySceneModelOptions = BaseSceneModelOptions;

export default class HighIntensitySceneModel extends BaseSceneModel {

  public readonly slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier>;
  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;

  // True when Hits mode has reached the hit cap
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Whether the wave field should be rendered in the visualization region
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;
  private readonly _isWaveVisibleProperty: BooleanProperty;

  // Normalized progress for the detector-screen and chart intensity pattern exposure.
  public readonly detectorPatternFormationFactorProperty: TReadOnlyProperty<number>;
  private readonly _detectorPatternFormationFactorProperty: NumberProperty;

  public readonly waveAmplitudeScaleProperty: TReadOnlyProperty<number> = new Property<number>( 1 );

  private hitAccumulator: number;
  private nextDecoherenceEventTime: number | null;

  public constructor( providedOptions: HighIntensitySceneModelOptions ) {

    super( createContinuousWaveSolver(), providedOptions );

    const tandem = providedOptions.tandem;

    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;

    this.slitConfigurationProperty = new StringUnionProperty<SlitConfigurationWithNoBarrier>( 'bothOpen', {
      validValues: SlitConfigurationWithNoBarrierValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' )
    } );

    this.detectionModeProperty = new StringUnionProperty<DetectionMode>( 'averageIntensity', {
      validValues: DetectionModeValues,
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this._isWaveVisibleProperty = new BooleanProperty( false );
    this.isWaveVisibleProperty = this._isWaveVisibleProperty;

    this._detectorPatternFormationFactorProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'detectorPatternFormationFactorProperty' ),
      phetioReadOnly: true
    } );
    this.detectorPatternFormationFactorProperty = this._detectorPatternFormationFactorProperty;

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits >= MAX_HITS
    );

    this.isEmitterEnabledProperty = this.isMaxHitsReachedProperty.derived( isMax => !isMax );

    this.setupSlitConfigurationListeners( this.slitConfigurationProperty );
    this.detectionModeProperty.lazyLink( detectionMode => {
      if ( detectionMode === 'averageIntensity' ) {
        this.resetDetectorPatternFormation();
      }
    } );
    this.stopEmitterWhenMaxHitsReached();
  }

  protected override isTopSlitOpen(): boolean {
    return this.slitConfigurationProperty.value !== 'leftCovered';
  }

  protected override isBottomSlitOpen(): boolean {
    return this.slitConfigurationProperty.value !== 'rightCovered';
  }

  protected override isTopSlitDecoherent(): boolean {
    return hasDetectorOnSide( this.slitConfigurationProperty.value, 'left' );
  }

  protected override isBottomSlitDecoherent(): boolean {
    return hasDetectorOnSide( this.slitConfigurationProperty.value, 'right' );
  }

  public override clearScreen(): void {
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    super.clearScreen();
    this._isWaveVisibleProperty.value = this.isEmittingProperty.value;
  }

  protected override clearWaveStateWhenEmitterTurnsOff(): void {
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    super.clearWaveStateWhenEmitterTurnsOff();
    this._isWaveVisibleProperty.value = false;
  }

  public takeHighIntensitySnapshot(): void {
    this.takeSnapshot( this.detectionModeProperty.value, this.slitConfigurationProperty.value, 1 );
  }

  /**
   * Steps the scene forward in time: advances the wave solver and accumulates hits.
   */
  public step( dt: number ): void {
    this.waveSolver.step( dt );

    this._isWaveVisibleProperty.value = this.isEmittingProperty.value;

    this.stepDetectorPatternFormation( dt );
    this.stepDecoherenceEvents( dt );

    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value ||
      dt > 0.5
    ) {
      return;
    }

    // Only accumulate hits after the wavefront has reached the detector screen
    if ( !this.hasWavefrontReachedScreen() ) {
      return;
    }

    const rate = this.getParticleEmissionRate();
    this.hitAccumulator += rate * dt;
    const numHits = Math.floor( this.hitAccumulator );
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const distribution = this.waveSolver.getDetectorProbabilityDistribution();
    let actualHits = 0;

    for ( let i = 0; i < numHits; i++ ) {
      if ( this.totalHitsProperty.value + actualHits >= MAX_HITS ) {
        break;
      }

      const x = this.generateHitPosition( distribution );
      const y = dotRandom.nextDouble() * HIT_VERTICAL_EXTENT;
      this.hits.push( new Vector2( x, y ) );
      actualHits++;
    }

    if ( actualHits > 0 ) {
      this.totalHitsProperty.value += actualHits;
      this.hitsChangedEmitter.emit();
    }
  }

  private stepDecoherenceEvents( dt: number ): void {
    if (
      !this.isEmittingProperty.value ||
      this.barrierTypeProperty.value !== 'doubleSlit' ||
      dt <= 0 ||
      dt > 0.5
    ) {
      return;
    }

    const slitConfig = this.slitConfigurationProperty.value;
    // Slit-detector attempts are tied to the same conceptual particles that create detector-screen
    // hit dots, so increasing intensity increases both rates in lockstep.
    const particleRate = this.getParticleEmissionRate();
    if ( !hasAnyDetector( slitConfig ) || particleRate <= 0 ) {
      this.nextDecoherenceEventTime = null;
      return;
    }

    const currentTime = this.waveSolver.getTime();
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return;
    }

    const slitArrivalTime = this.slitPositionFractionProperty.value * this.regionWidth / propagationSpeed;
    if ( currentTime < slitArrivalTime ) {
      return;
    }

    if ( this.nextDecoherenceEventTime === null || this.nextDecoherenceEventTime < slitArrivalTime ) {
      this.nextDecoherenceEventTime = slitArrivalTime;
    }

    let eventsCreated = 0;
    while (
      this.nextDecoherenceEventTime <= currentTime &&
      eventsCreated < MAX_DECOHERENCE_EVENTS_PER_FRAME
      ) {
      const event = this.createDecoherenceEventForSlitConfiguration( slitConfig, this.nextDecoherenceEventTime );
      if ( event ) {
        this.addDecoherenceEvent( event );
      }
      this.nextDecoherenceEventTime += this.getParticleEmissionInterval( particleRate );
      eventsCreated++;
    }

    if ( eventsCreated === 0 ) {
      this.pruneDecoherenceEvents();
    }
    else if ( eventsCreated >= MAX_DECOHERENCE_EVENTS_PER_FRAME ) {
      this.nextDecoherenceEventTime = currentTime + this.getParticleEmissionInterval( particleRate );
    }
  }

  private stepDetectorPatternFormation( dt: number ): void {
    if (
      this.detectionModeProperty.value !== 'averageIntensity' ||
      !this.isEmittingProperty.value ||
      dt <= 0 ||
      this._detectorPatternFormationFactorProperty.value >= 1
    ) {
      return;
    }

    // Exposure begins when there is actually detector-screen content, so the screen and chart
    // do not finish forming while the leading wavefront is still traveling.
    if ( !this.hasWavefrontReachedScreen() ) {
      return;
    }

    this._detectorPatternFormationFactorProperty.value = Math.min(
      1,
      this._detectorPatternFormationFactorProperty.value + dt / DETECTOR_PATTERN_FORMATION_DURATION
    );
  }

  private resetDetectorPatternFormation(): void {
    this._detectorPatternFormationFactorProperty.value = 0;
  }

  private getParticleEmissionRate(): number {
    return MAX_EMISSION_RATE;
  }

  private getParticleEmissionInterval( particleRate: number ): number {
    return 1 / particleRate;
  }

  public override reset(): void {
    super.reset();
    this.slitConfigurationProperty.reset();
    this.detectionModeProperty.reset();
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    this._isWaveVisibleProperty.reset();
    this.syncSolverParameters();
  }
}
