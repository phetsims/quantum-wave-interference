// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensitySceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the High Intensity screen.
 *
 * Extends BaseSceneModel with High Intensity–specific state: detection mode, detector hit tracking per slit,
 * continuous hit accumulation, and full slit configuration (including detector variants).
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
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, type SlitSeparationConfig } from '../../common/model/BaseSceneModel.js';
import { createContinuousWaveSolver } from '../../common/model/createWaveSolver.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { hasAnyDetector } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';

// Detector-screen hit dots created per model second in Hits mode.
export const DETECTOR_SCREEN_HIT_RATE = 40;

// On-slit detector/decoherence events created per model second for Detector Top/Bottom/Both.
export const SLIT_DETECTOR_EVENT_RATE = 5;

// Valid model steps are capped at 0.5 seconds, so this is well above the number of slit-detector
// events that can be created per frame at the current slit-detector event rate.
const MAX_DECOHERENCE_EVENTS_PER_FRAME = 64;

// Eased exponential detector-pattern formation timing, in model seconds. At Normal speed (0.35x),
// the pattern reaches visual stability at about 2.1 seconds of wall-clock time after detector arrival.
export const DETECTOR_PATTERN_FORMATION_TIME_CONSTANT = 0.20;
export const DETECTOR_PATTERN_FORMATION_EASE_POWER = 2;
export const DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD = 0.95;
export const DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD = 0.995;

const MICROMETER_TO_MM = 1E-3;
const NANOMETER_TO_MM = 1E-6;

const HIGH_INTENSITY_SLIT_SEPARATION_CONFIGS: Record<SourceType, SlitSeparationConfig> = {
  photons: {
    range: new Range( 1 * MICROMETER_TO_MM, 5 * MICROMETER_TO_MM ),
    defaultValue: 3 * MICROMETER_TO_MM
  },
  electrons: {
    range: new Range( 1 * NANOMETER_TO_MM, 5 * NANOMETER_TO_MM ),
    defaultValue: 3 * NANOMETER_TO_MM
  },
  neutrons: {
    range: new Range( 1 * NANOMETER_TO_MM, 5 * NANOMETER_TO_MM ),
    defaultValue: 3 * NANOMETER_TO_MM
  },
  heliumAtoms: {
    range: new Range( 0.10 * NANOMETER_TO_MM, 0.60 * NANOMETER_TO_MM ),
    defaultValue: 0.40 * NANOMETER_TO_MM
  }
};

export type HighIntensitySceneModelOptions = BaseSceneModelOptions;

type HighIntensitySceneModelStateObject = {
  hitAccumulator?: number;
  nextDecoherenceEventTime?: number | null;
};

export default class HighIntensitySceneModel extends BaseSceneModel {

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

  // TODO: This is unused but if I remove it, type checking fails, see https://github.com/phetsims/quantum-wave-interference/issues/135
  public readonly waveAmplitudeScaleProperty: TReadOnlyProperty<number> = new Property<number>( 1 );

  private hitAccumulator = 0;
  private nextDecoherenceEventTime: number | null = null;

  public constructor( providedOptions: HighIntensitySceneModelOptions ) {

    super( createContinuousWaveSolver(), combineOptions<BaseSceneModelOptions>( {
      slitSeparationConfig: HIGH_INTENSITY_SLIT_SEPARATION_CONFIGS[ providedOptions.sourceType ]
    }, providedOptions ) );

    const tandem = providedOptions.tandem;

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

    this.isMaxHitsReachedProperty = new DerivedProperty( [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits >= QuantumWaveInterferenceConstants.MAX_HITS
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

    // TODO: Should this be done synchronously, or is there a good reason to do it in step only, see https://github.com/phetsims/quantum-wave-interference/issues/135
    // What if the sim is paused?
    this._isWaveVisibleProperty.value = this.isEmittingProperty.value;

    this.stepDetectorPatternFormation( dt );
    this.stepDecoherenceEvents( dt );

    // TODO: Document early return, see https://github.com/phetsims/quantum-wave-interference/issues/135
    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value ||
      dt > 0.5
    ) {
      return;
    }

    // Only accumulate hits after the wavefront has reached the detector screen
    // TODO: Invert this if statement, like if hasWavefrontReachedScreen(){this.accumulateHits()}, see https://github.com/phetsims/quantum-wave-interference/issues/135
    if ( !this.hasWavefrontReachedScreen() ) {
      return;
    }

    // TODO: Document each term in the hit accumulator computations, see https://github.com/phetsims/quantum-wave-interference/issues/135
    const rate = this.getDetectorScreenHitRate();
    this.hitAccumulator += rate * dt;
    const numHits = Math.floor( this.hitAccumulator );
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const distribution = this.waveSolver.getDetectorProbabilityDistribution();
    let actualHits = 0;

    for ( let i = 0; i < numHits; i++ ) {
      if ( this.totalHitsProperty.value + actualHits >= QuantumWaveInterferenceConstants.MAX_HITS ) {
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

  // TODO: Documentation, see https://github.com/phetsims/quantum-wave-interference/issues/135
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
    const detectorEventRate = this.getSlitDetectorEventRate();
    if ( !hasAnyDetector( slitConfig ) || detectorEventRate <= 0 ) {
      this.nextDecoherenceEventTime = null;
      return;
    }

    const currentTime = this.waveSolver.getTime();
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return;
    }

    // The solver clock can advance while the source is off. Use the source-on time so slit-detector
    // events are scheduled relative to the emitted wavefront, not absolute solver time.
    const waveSolverState = this.waveSolver.getState();
    const sourceOnTime = 'sourceOnTime' in waveSolverState && typeof waveSolverState.sourceOnTime === 'number' ?
                         waveSolverState.sourceOnTime :
                         null;
    if ( sourceOnTime === null ) {
      return;
    }

    // First possible slit-detector event occurs when the wavefront emitted at sourceOnTime reaches the slits.
    const slitArrivalTime = sourceOnTime + this.slitPositionFractionProperty.value * this.regionWidth / propagationSpeed;
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
      this.nextDecoherenceEventTime += this.getIntervalForRate( detectorEventRate );
      eventsCreated++;
    }

    if ( eventsCreated === 0 ) {
      this.pruneDecoherenceEvents();
    }
    else if ( eventsCreated >= MAX_DECOHERENCE_EVENTS_PER_FRAME ) {
      this.nextDecoherenceEventTime = currentTime + this.getIntervalForRate( detectorEventRate );
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

    const easedFormationFactor = Math.pow(
      this._detectorPatternFormationFactorProperty.value,
      1 / DETECTOR_PATTERN_FORMATION_EASE_POWER
    );
    const nextEasedFormationFactor = 1 - ( 1 - easedFormationFactor ) *
                                     Math.exp( -dt / DETECTOR_PATTERN_FORMATION_TIME_CONSTANT );
    const nextFormationFactor = Math.pow( nextEasedFormationFactor, DETECTOR_PATTERN_FORMATION_EASE_POWER );

    this._detectorPatternFormationFactorProperty.value =
      nextFormationFactor >= DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD ? 1 : nextFormationFactor;
  }

  private resetDetectorPatternFormation(): void {
    this._detectorPatternFormationFactorProperty.value = 0;
  }

  private getDetectorScreenHitRate(): number {
    return DETECTOR_SCREEN_HIT_RATE;
  }

  private getSlitDetectorEventRate(): number {
    return SLIT_DETECTOR_EVENT_RATE;
  }

  private getIntervalForRate( rate: number ): number {
    return 1 / rate;
  }

  protected override getSubclassState(): HighIntensitySceneModelStateObject {
    return {
      hitAccumulator: this.hitAccumulator,
      nextDecoherenceEventTime: this.nextDecoherenceEventTime
    };
  }

  protected override applySubclassState( stateObject: HighIntensitySceneModelStateObject ): void {
    this.hitAccumulator = typeof stateObject.hitAccumulator === 'number' ? stateObject.hitAccumulator : 0;
    this.nextDecoherenceEventTime =
      typeof stateObject.nextDecoherenceEventTime === 'number' || stateObject.nextDecoherenceEventTime === null ?
      stateObject.nextDecoherenceEventTime :
      null;
  }

  public override reset(): void {
    super.reset();
    this.detectionModeProperty.reset();
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    this._isWaveVisibleProperty.reset();
    this.syncSolverParameters();
  }
}
