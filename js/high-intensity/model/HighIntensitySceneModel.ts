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

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import AnalyticalWaveSolver from '../../common/model/AnalyticalWaveSolver.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, type SlitSeparationConfig } from '../../common/model/BaseSceneModel.js';
import { type DetectionMode, DetectionModeValues } from '../../common/model/DetectionMode.js';
import { hasAnyDetector } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import QuantumWaveInterferenceQueryParameters from '../../common/QuantumWaveInterferenceQueryParameters.js';

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

// Options type alias — no additional options beyond the base; exposed so callers (e.g. HighIntensityModel) can
// type their providedOptions without importing BaseSceneModelOptions directly.
export type HighIntensitySceneModelOptions = BaseSceneModelOptions;

// Subclass-specific PhET-iO state persisted alongside the base-class state. hitAccumulator retains the fractional
// hit count carried between frames, and nextDecoherenceEventTime is the scheduled model-time for the next
// slit-detector event (null when no event is pending or the emitter is off).
type HighIntensitySceneModelStateObject = {
  hitAccumulator?: number;
  nextDecoherenceEventTime?: number | null;
};

export default class HighIntensitySceneModel extends BaseSceneModel {

  // Controls how the detector screen and chart display accumulated data. 'averageIntensity' shows the
  // continuous wave-interference pattern; 'hits' accumulates individual particle dots. Linked by the view
  // (HighIntensityScreenView, ScreenSettingsPanel) and proxied through HighIntensityModel.currentDetectionModeProperty.
  public readonly detectionModeProperty: StringUnionProperty<DetectionMode>;

  // True when Hits mode has reached the hit cap
  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Whether the wave field should be rendered in the visualization region
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  // Normalized progress for the detector-screen and chart intensity pattern exposure.
  public readonly detectorPatternFormationFactorProperty: TReadOnlyProperty<number>;
  private readonly _detectorPatternFormationFactorProperty: NumberProperty;

  private hitAccumulator = 0;
  private nextDecoherenceEventTime: number | null = null;

  public constructor( providedOptions: HighIntensitySceneModelOptions ) {

    super( new AnalyticalWaveSolver(
      QuantumWaveInterferenceQueryParameters.waveSolverGridSize,
      QuantumWaveInterferenceQueryParameters.waveSolverGridSize
    ), combineOptions<BaseSceneModelOptions>( {
      slitSeparationConfig: HIGH_INTENSITY_SLIT_SEPARATION_CONFIGS[ providedOptions.sourceType ]
    }, providedOptions ) );

    const tandem = providedOptions.tandem;

    this.detectionModeProperty = new StringUnionProperty<DetectionMode>( 'averageIntensity', {
      validValues: DetectionModeValues,
      tandem: tandem.createTandem( 'detectionModeProperty' )
    } );

    this.isWaveVisibleProperty = this.isEmittingProperty;

    this._detectorPatternFormationFactorProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'detectorPatternFormationFactorProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );
    this.detectorPatternFormationFactorProperty = this._detectorPatternFormationFactorProperty;

    this.isMaxHitsReachedProperty = new DerivedProperty( [ this.detectionModeProperty, this.totalHitsProperty ],
      ( detectionMode, totalHits ) => detectionMode === 'hits' && totalHits >= QuantumWaveInterferenceQueryParameters.maxHits, {
        tandem: tandem.createTandem( 'isMaxHitsReachedProperty' ),
        phetioValueType: BooleanIO,
        phetioFeatured: true,
        phetioDocumentation: 'Whether the detector screen has reached the maximum number of hits, which turns off the source.'
      } );

    this.isEmitterEnabledProperty = this.isMaxHitsReachedProperty.derived( isMax => !isMax );

    this.setupSlitConfigurationListeners( this.slitConfigurationProperty );
    this.stopEmitterWhenMaxHitsReached();
  }

  public override clearScreen(): void {
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    super.clearScreen();
  }

  protected override clearWaveStateWhenEmitterTurnsOff(): void {
    this.hitAccumulator = 0;
    this.nextDecoherenceEventTime = null;
    this.resetDetectorPatternFormation();
    super.clearWaveStateWhenEmitterTurnsOff();
  }

  /**
   * Captures a snapshot of the current detector-screen state into the scene's snapshot history, using the current
   * detection mode and slit configuration at full intensity (1.0). Called by HighIntensityModel when the user
   * triggers a snapshot (e.g. via the snapshot button).
   */
  public takeHighIntensitySnapshot(): void {
    this.takeSnapshot( this.detectionModeProperty.value, this.slitConfigurationProperty.value, 1 );
  }

  /**
   * Steps the scene forward in time: advances the wave solver and accumulates hits.
   */
  public step( dt: number ): void {
    this.waveSolver.step( dt );

    this.stepDetectorPatternFormation( dt );
    this.stepDecoherenceEvents( dt );

    // Detector-screen hits are only produced while the source is on in Hits mode and the hit cap has not been reached.
    // Large frame deltas are ignored instead of creating a burst of stale hits after pauses or tab throttling.
    if (
      !this.isEmittingProperty.value ||
      this.detectionModeProperty.value !== 'hits' ||
      this.isMaxHitsReachedProperty.value ||
      dt > 0.5
    ) {
      return;
    }

    // Only accumulate hits after the wavefront has reached the detector screen.
    if ( this.hasWavefrontReachedScreen() ) {
      this.accumulateHits( dt );
    }
  }

  /**
   * Accumulates detector-screen hits for the elapsed model time. Fractional hit counts are retained across frames, and
   * whole accumulated hits are converted into detector-screen dots sampled from the current probability distribution.
   *
   * @param dt - elapsed model time for this frame, in seconds
   */
  private accumulateHits( dt: number ): void {
    // rate is the detector-screen hit creation rate in hits per model second for the current scene.
    const rate = DETECTOR_SCREEN_HIT_RATE;

    // rate * dt converts the continuous hit rate into the expected number of hits for this frame. The accumulator
    // preserves fractional hits across frames so non-integer per-frame rates still produce the correct average rate.
    this.hitAccumulator += rate * dt;

    // Only whole accumulated hits are generated as detector-screen dots on this frame.
    const numHits = Math.floor( this.hitAccumulator );

    // Retain the fractional remainder for future frames.
    this.hitAccumulator -= numHits;

    if ( numHits === 0 ) {
      return;
    }

    const distribution = this.waveSolver.getDetectorProbabilityDistribution();
    let actualHits = 0;

    for ( let i = 0; i < numHits; i++ ) {
      if ( this.totalHitsProperty.value + actualHits >= QuantumWaveInterferenceQueryParameters.maxHits ) {
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

  /**
   * Advances the continuous high-intensity slit-detector/decoherence scheduler. When an emitted wavefront reaches the
   * double-slit barrier and one or more slit detectors are present, this creates model-time detector records at
   * SLIT_DETECTOR_EVENT_RATE. Those records are stored as decoherence events so the analytical solver can render the
   * selected slit bands and attenuate the opposite slit contribution. Creating an event also increments the appropriate
   * slit detector hit count through addDecoherenceEvent().
   *
   * The scheduler uses solver time and the source-on time so events are aligned with the emitted wavefront instead of
   * absolute elapsed solver time. Large or non-positive frame steps are ignored to avoid generating a burst of stale
   * detector records after pauses, tab throttling, or invalid animation deltas.
   *
   * @param dt - elapsed model time for this frame, in seconds
   */
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
    const detectorEventRate = SLIT_DETECTOR_EVENT_RATE;
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

  /**
   * Advances the eased detector-pattern formation factor toward 1. The factor drives the opacity/exposure of the
   * detector-screen texture and the chart pattern overlay in the view, so the pattern appears to "develop" gradually
   * after the wavefront reaches the screen rather than snapping in immediately.
   *
   * Uses an eased exponential approach: the stored value is linearized by un-applying the ease power, stepped with
   * a standard RC-filter decay toward 1, then re-eased. Once the factor exceeds
   * DETECTOR_PATTERN_FORMATION_SNAP_TO_COMPLETE_THRESHOLD it is clamped to 1 to avoid an infinite asymptote.
   * No-ops when the emitter is off, dt ≤ 0, or the pattern is already fully formed.
   *
   * @param dt - elapsed model time for this frame, in seconds
   */
  private stepDetectorPatternFormation( dt: number ): void {
    if (
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

  /**
   * Resets the detector-pattern formation factor to 0 so the pattern overlay re-develops from scratch on the next
   * emission. Called by clearScreen() and clearWaveStateWhenEmitterTurnsOff().
   */
  private resetDetectorPatternFormation(): void {
    this._detectorPatternFormationFactorProperty.value = 0;
  }

  /**
   * Converts a per-second event rate into the model-time interval between successive events, in seconds.
   * @param rate - events per model second (must be positive)
   */
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
    this.syncSolverParameters();
  }
}
