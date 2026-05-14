// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesSceneModel holds the state for one of the four source-type scenes (Photons, Electrons,
 * Neutrons, Helium atoms) on the Single Particles screen.
 *
 * Extends BaseSceneModel with Single Particles–specific state: single-packet emission with auto-repeat,
 * detector tool, restricted slit configurations (no detector variants), and always-Hits mode.
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
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { type GaussianPacketReEmission } from '../../common/model/AnalyticalWaveKernel.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, MAX_HITS } from '../../common/model/BaseSceneModel.js';
import { createWavePacketSolver } from '../../common/model/createWaveSolver.js';
import { getViewSlitLayout } from '../../common/model/getViewSlitLayout.js';
import { hasAnyDetector, hasDetectorOnSide, type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from '../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';

export const DetectorToolStateValues = [ 'ready', 'detected', 'notDetected' ] as const;
export type DetectorToolState = typeof DetectorToolStateValues[number];

const MIN_EMISSION_INTERVAL = 0.3;

export type ScreenDetectionTimingParameters = {
  startWeight: number;
  peakWeight: number;
  endWeight: number;
  leadingPower: number;
  trailingPower: number;
};

// Designer tuning for when a packet can collapse at the right-side detector screen.
// These weights describe how much of the packet's longitudinal probability has reached
// the detector screen. Weight 0.5 means the packet midpoint/center is at the screen.
// Weight 0.85 means about 85% of the packet has reached the screen.
//
// The sampled curve is zero outside [startWeight, endWeight], rises from startWeight to
// peakWeight, then trails off to endWeight. Raising startWeight prevents collapses until
// later in the packet lifecycle. Raising peakWeight makes the typical collapse later.
// Raising endWeight allows later trailing detections. Larger power values make that side
// of the curve sharper; smaller values make it broader.
//
// See doc/screen-detection-timing-tuner.html for an interactive tuning page. Its
// "Copy these parameters" button produces this object shape.
export const SCREEN_DETECTION_TIMING_PARAMETERS: ScreenDetectionTimingParameters = {
  startWeight: 0.5,
  peakWeight: 0.68,
  endWeight: 0.9,
  leadingPower: 1.8,
  trailingPower: 0.8
};
const ON_SLIT_DETECTION_TIME_SIGMA_X_FRACTION = 0.5;
const DETECTION_TIME_TRUNCATION_SIGMAS = 3;

// Display-only gain for the wave visualization on the Single Particles screen. This intentionally
// affects canvas brightness/saturation without changing wave propagation, detector probabilities, or hits.
const SINGLE_PARTICLES_WAVE_DISPLAY_GAIN = 1.75;

export type SingleParticlesSceneModelOptions = BaseSceneModelOptions;

export default class SingleParticlesSceneModel extends BaseSceneModel {

  public readonly autoRepeatProperty: BooleanProperty;
  public readonly slitConfigurationProperty: StringUnionProperty<SlitConfigurationWithNoBarrier>;

  // Single particles have no intensity slider, but use a display-only gain so the post-slit packet
  // remains visible in the wave region. This does not affect detector probabilities or hit sampling.
  public readonly waveAmplitudeScaleProperty: TReadOnlyProperty<number> = new Property<number>( SINGLE_PARTICLES_WAVE_DISPLAY_GAIN );

  // Whether a wave packet is currently propagating through the visualization region
  public readonly isPacketActiveProperty: BooleanProperty;

  // Whether the wave field should be rendered in the visualization region
  public readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;

  // Detector tool state — position/radius are in normalized coordinates (0–1) within the wave region
  public readonly detectorToolPositionProperty: Vector2Property;
  public readonly detectorToolRadiusProperty: NumberProperty;
  public readonly detectorToolStateProperty: StringUnionProperty<DetectorToolState>;
  public readonly detectorToolProbabilityProperty: NumberProperty;

  public readonly isMaxHitsReachedProperty: TReadOnlyProperty<boolean>;

  // False when the emitter button should be disabled
  public readonly isEmitterEnabledProperty: TReadOnlyProperty<boolean>;

  // Time since the last packet was emitted
  private timeSinceLastEmission: number;

  // Sampled detector-screen hit time for the active packet
  private targetDetectionTime: number;

  // Sampled which-slit detection time for the active packet
  private targetOnSlitDetectionTime: number;

  // Deterministic center-arrival time used as the mean for the active packet's on-slit detection sample
  private deterministicOnSlitArrivalTime: number;

  // True while a completed packet is automatically turning the emitter off.
  private isEndingPacket: boolean;

  private hasCreatedPacketDecoherenceEvent: boolean;
  private packetReEmission: GaussianPacketReEmission | null = null;

  public constructor( providedOptions: SingleParticlesSceneModelOptions ) {

    super( createWavePacketSolver(), combineOptions<BaseSceneModelOptions>( {}, providedOptions ) );

    const tandem = providedOptions.tandem;

    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.targetDetectionTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.targetOnSlitDetectionTime = Number.POSITIVE_INFINITY;
    this.deterministicOnSlitArrivalTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.isEndingPacket = false;
    this.hasCreatedPacketDecoherenceEvent = false;

    this.autoRepeatProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'autoRepeatProperty' )
    } );

    //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Identical to slitConfigurationProperty in HighIntensitySceneModel
    this.slitConfigurationProperty = new StringUnionProperty<SlitConfigurationWithNoBarrier>( 'bothOpen', {
      validValues: SlitConfigurationWithNoBarrierValues,
      tandem: tandem.createTandem( 'slitConfigurationProperty' )
    } );

    this.isPacketActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPacketActiveProperty' ),
      phetioReadOnly: true
    } );

    this.isWaveVisibleProperty = this.isPacketActiveProperty;

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
      //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 units?
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

    this.setupSlitConfigurationListeners( this.slitConfigurationProperty );
    this.stopEmitterWhenMaxHitsReached();

    // step() only recomputes probability while the sim is playing; also recompute when the detector
    // is moved or resized so the value reflects the current state while paused or mid-drag.
    const updateDetectorProbability = () => {
      if ( this.isPacketActiveProperty.value && this.detectorToolStateProperty.value === 'ready' ) {
        this.detectorToolProbabilityProperty.value = this.computeDetectorProbability();
      }
    };
    this.detectorToolPositionProperty.lazyLink( updateDetectorProbability );
    this.detectorToolRadiusProperty.lazyLink( updateDetectorProbability );
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
    this.isPacketActiveProperty.value = false;
    this.detectorToolStateProperty.value = 'ready';
    this.detectorToolProbabilityProperty.value = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.targetOnSlitDetectionTime = Number.POSITIVE_INFINITY;
    this.deterministicOnSlitArrivalTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.packetReEmission = null;
    super.clearScreen();
  }

  protected override clearWaveStateWhenEmitterTurnsOff(): void {
    this.isPacketActiveProperty.value = false;
    this.packetReEmission = null;
    if ( !this.isEndingPacket ) {
      this.detectorToolStateProperty.value = 'ready';
      this.detectorToolProbabilityProperty.value = 0;
    }
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.targetOnSlitDetectionTime = Number.POSITIVE_INFINITY;
    this.deterministicOnSlitArrivalTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.hasCreatedPacketDecoherenceEvent = false;
    super.clearWaveStateWhenEmitterTurnsOff();
  }

  public takeSingleParticlesSnapshot(): void {
    this.takeSnapshot( 'hits', this.slitConfigurationProperty.value, 1 );
  }

  /**
   * Emits a single wave packet from the source.
   */
  public emitPacket(): void {
    if ( this.isMaxHitsReachedProperty.value || this.isPacketActiveProperty.value ) {
      return;
    }
    this.isPacketActiveProperty.value = true;

    // A fresh packet gets a fresh detector reading; prevents the detector from staying stuck in
    // 'detected' or 'notDetected' for subsequent packets in auto-repeat mode.
    this.detectorToolStateProperty.value = 'ready';
    this.targetDetectionTime = this.sampleDetectionTime();
    this.deterministicOnSlitArrivalTime = this.getDeterministicSlitArrivalTime();
    this.targetOnSlitDetectionTime = this.sampleOnSlitDetectionTime( this.deterministicOnSlitArrivalTime );
    this.timeSinceLastEmission = 0;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.packetReEmission = null;
    this.clearDecoherenceEvents();
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  protected override syncSolverParameters(): void {
    super.syncSolverParameters();
    this.waveSolver.setParameters( {
      packetReEmission: this.packetReEmission
    } );
  }

  /**
   * Detection times follow the packet's horizontal probability density from the active packet source
   * to the detector screen. The packet starts at the standard negative sigma offset, so slit
   * re-emission gets the same envelope/timing as ordinary source emission with a shifted origin.
   * The sampled packet weight is intentionally later than the leading edge, documented at
   * SCREEN_DETECTION_TIMING_PARAMETERS.
   */
  private sampleDetectionTime(): number {
    return this.sampleDetectionDelayFromSourceX( 0 );
  }

  private sampleDetectionDelayFromSourceX( sourceX: number ): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
    const sampledScreenWeight = this.sampleScreenDetectionWeight();
    const sampledCenterOffset = SingleParticlesSceneModel.inverseStandardNormalCDF( sampledScreenWeight ) * sigmaX0;
    return ( this.regionWidth - sourceX - initialCenterX + sampledCenterOffset ) / propagationSpeed;
  }

  private sampleScreenDetectionWeight(): number {
    const parameters = SCREEN_DETECTION_TIMING_PARAMETERS;
    assert && assert(
    parameters.startWeight > 0 &&
    parameters.startWeight < parameters.peakWeight &&
    parameters.peakWeight < parameters.endWeight &&
    parameters.endWeight < 1,
      'screen detection weights should be ordered within (0, 1)'
    );
    assert && assert( parameters.leadingPower > 0 && parameters.trailingPower > 0, 'curve powers should be positive' );

    for ( let i = 0; i < 100; i++ ) {
      const candidate = parameters.startWeight +
                        dotRandom.nextDouble() * ( parameters.endWeight - parameters.startWeight );
      if ( dotRandom.nextDouble() < this.getScreenDetectionCurveDensity( candidate ) ) {
        return candidate;
      }
    }

    // Rejection sampling should normally accept quickly. Fall back to the most likely point
    // so pathological tuning values still produce a finite, designer-predictable result.
    return parameters.peakWeight;
  }

  private getScreenDetectionCurveDensity( weight: number ): number {
    const parameters = SCREEN_DETECTION_TIMING_PARAMETERS;

    if ( weight < parameters.startWeight || weight > parameters.endWeight ) {
      return 0;
    }
    if ( weight <= parameters.peakWeight ) {
      const leadingFraction = ( weight - parameters.startWeight ) /
                              ( parameters.peakWeight - parameters.startWeight );
      return Math.pow( clamp( leadingFraction, 0, 1 ), parameters.leadingPower );
    }

    const trailingFraction = ( parameters.endWeight - weight ) /
                             ( parameters.endWeight - parameters.peakWeight );
    return Math.pow( clamp( trailingFraction, 0, 1 ), parameters.trailingPower );
  }

  /**
   * Approximation for the standard normal quantile. Used to convert "fraction of packet weight
   * that has reached the screen" back into a packet-center offset in sigma_x units.
   */
  private static inverseStandardNormalCDF( probability: number ): number {
    const p = clamp( probability, 1e-12, 1 - 1e-12 );
    const a = [
      -3.969683028665376e+1,
      2.209460984245205e+2,
      -2.759285104469687e+2,
      1.383577518672690e+2,
      -3.066479806614716e+1,
      2.506628277459239
    ];
    const b = [
      -5.447609879822406e+1,
      1.615858368580409e+2,
      -1.556989798598866e+2,
      6.680131188771972e+1,
      -1.328068155288572e+1
    ];
    const c = [
      -7.784894002430293e-3,
      -3.223964580411365e-1,
      -2.400758277161838,
      -2.549732539343734,
      4.374664141464968,
      2.938163982698783
    ];
    const d = [
      7.784695709041462e-3,
      3.224671290700398e-1,
      2.445134137142996,
      3.754408661907416
    ];
    const lowTail = 0.02425;
    const highTail = 1 - lowTail;

    if ( p < lowTail ) {
      const q = Math.sqrt( -2 * Math.log( p ) );
      return ( ( ( ( ( c[ 0 ] * q + c[ 1 ] ) * q + c[ 2 ] ) * q + c[ 3 ] ) * q + c[ 4 ] ) * q + c[ 5 ] ) /
             ( ( ( ( d[ 0 ] * q + d[ 1 ] ) * q + d[ 2 ] ) * q + d[ 3 ] ) * q + 1 );
    }
    if ( p > highTail ) {
      const q = Math.sqrt( -2 * Math.log( 1 - p ) );
      return -( ( ( ( ( c[ 0 ] * q + c[ 1 ] ) * q + c[ 2 ] ) * q + c[ 3 ] ) * q + c[ 4 ] ) * q + c[ 5 ] ) /
             ( ( ( ( d[ 0 ] * q + d[ 1 ] ) * q + d[ 2 ] ) * q + d[ 3 ] ) * q + 1 );
    }

    const q = p - 0.5;
    const r = q * q;
    return ( ( ( ( ( a[ 0 ] * r + a[ 1 ] ) * r + a[ 2 ] ) * r + a[ 3 ] ) * r + a[ 4 ] ) * r + a[ 5 ] ) * q /
           ( ( ( ( ( b[ 0 ] * r + b[ 1 ] ) * r + b[ 2 ] ) * r + b[ 3 ] ) * r + b[ 4 ] ) * r + 1 );
  }

  private sampleOnSlitDetectionTime( deterministicSlitArrivalTime: number ): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const sigma = ON_SLIT_DETECTION_TIME_SIGMA_X_FRACTION * sigmaX0 / propagationSpeed;
    return this.sampleTruncatedGaussianTime( deterministicSlitArrivalTime, sigma );
  }

  private getDeterministicSlitArrivalTime(): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
    return ( this.slitPositionFractionProperty.value * this.regionWidth - initialCenterX ) / propagationSpeed;
  }

  private sampleTruncatedGaussianTime( mean: number, sigma: number ): number {
    const maxDeviation = DETECTION_TIME_TRUNCATION_SIGMAS * sigma;
    let deviation: number;
    do {
      deviation = dotRandom.nextGaussian() * sigma;
    } while ( Math.abs( deviation ) > maxDeviation );
    return mean + deviation;
  }

  /**
   * Steps the scene forward in time. Handles single-packet propagation and detection.
   */
  public step( dt: number ): void {
    this.timeSinceLastEmission += dt;

    if ( this.isPacketActiveProperty.value ) {
      this.waveSolver.step( dt );
      this.createPacketDecoherenceEventIfNeeded();

      if ( this.timeSinceLastEmission >= this.targetDetectionTime ) {
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

    // In non-auto-repeat mode, detectPacket() sets isEmitting to false, preventing re-emission.
    if (
      this.isEmittingProperty.value &&
      !this.isPacketActiveProperty.value &&
      this.timeSinceLastEmission >= MIN_EMISSION_INTERVAL &&
      !this.isMaxHitsReachedProperty.value
    ) {
      this.emitPacket();
    }
  }

  private createPacketDecoherenceEventIfNeeded(): void {
    const slitConfig = this.slitConfigurationProperty.value;
    if (
      this.hasCreatedPacketDecoherenceEvent ||
      this.barrierTypeProperty.value !== 'doubleSlit' ||
      !hasAnyDetector( slitConfig )
    ) {
      return;
    }

    const onSlitDetectionTime = this.targetOnSlitDetectionTime;

    if ( this.waveSolver.getTime() < onSlitDetectionTime ) {
      return;
    }

    const event = this.createDecoherenceEventForSlitConfiguration( slitConfig, onSlitDetectionTime );
    if ( event ) {
      if ( event.clickedDetectorSlit ) {
        this.startPacketReEmission( event.clickedDetectorSlit, onSlitDetectionTime );
      }
      else {
        this.addDecoherenceEvent( event );
      }
    }
    this.hasCreatedPacketDecoherenceEvent = true;
  }

  private startPacketReEmission( selectedSlit: 'topSlit' | 'bottomSlit', eventTime: number ): void {
    if ( selectedSlit === 'topSlit' ) {
      this.leftDetectorHitsProperty.value++;
    }
    else {
      this.rightDetectorHitsProperty.value++;
    }

    this.clearDecoherenceEvents();
    const packetReEmission = this.createPacketReEmission( selectedSlit, eventTime );
    this.packetReEmission = packetReEmission;
    this.targetDetectionTime = eventTime + Math.max(
      0,
      this.sampleDetectionDelayFromSourceX( packetReEmission.sourceX ) - ( packetReEmission.timeAdvance ?? 0 )
    );
    this.syncSolverParameters();
  }

  private createPacketReEmission( selectedSlit: 'topSlit' | 'bottomSlit', eventTime: number ): GaussianPacketReEmission {
    const { viewSlitSep, viewSlitWidth } = getViewSlitLayout(
      this.slitSeparationProperty.value * 1e-3,
      this.slitSeparationRange.min * 1e-3,
      this.slitSeparationRange.max * 1e-3,
      this.regionHeight
    );

    return {
      selectedSlit: selectedSlit,
      eventTime: eventTime,
      timeAdvance: this.getPacketReEmissionTimeAdvance( eventTime ),
      sourceX: this.slitPositionFractionProperty.value * this.regionWidth,
      centerY: selectedSlit === 'topSlit' ? -viewSlitSep / 2 : viewSlitSep / 2,
      width: viewSlitWidth
    };
  }

  private getPacketReEmissionTimeAdvance( eventTime: number ): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return 0;
    }

    const baseAdvance =
      QuantumWaveInterferenceConstants.WAVE_PACKET_RE_EMISSION_TIME_ADVANCE_SIGMAS *
      QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth /
      propagationSpeed;
    return Math.max( 0, baseAdvance + eventTime - this.deterministicOnSlitArrivalTime );
  }

  private detectPacket(): void {
    if ( !this.isPacketActiveProperty.value ) {
      return;
    }

    const x = this.generateHitPosition();
    const y = dotRandom.nextDouble() * HIT_VERTICAL_EXTENT;
    this.hits.push( new Vector2( x, y ) );
    this.totalHitsProperty.value++;
    this.endPacket();
    this.hitsChangedEmitter.emit();
  }

  // Shared so screen detection and detector-tool detection stop the emitter consistently.
  private endPacket(): void {
    this.isPacketActiveProperty.value = false;

    if ( !this.autoRepeatProperty.value ) {
      this.isEndingPacket = true;
      try {
        this.isEmittingProperty.value = false;
      }
      finally {
        this.isEndingPacket = false;
      }
    }
  }

  public computeDetectorProbability(): number {
    if ( !this.isPacketActiveProperty.value ) {
      return 0;
    }

    const field = this.waveSolver.getAmplitudeField();
    const gw = this.waveSolver.gridWidth;
    const gh = this.waveSolver.gridHeight;
    const cx = this.detectorToolPositionProperty.value.x * gw;
    const cy = this.detectorToolPositionProperty.value.y * gh;
    const rSq = ( this.detectorToolRadiusProperty.value * gw ) ** 2;

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

  public performDetectorMeasurement(): void {
    if ( !this.isPacketActiveProperty.value || this.detectorToolStateProperty.value !== 'ready' ) {
      return;
    }

    const probability = this.computeDetectorProbability();
    const detected = dotRandom.nextDouble() < probability;

    if ( detected ) {
      this.detectorToolStateProperty.value = 'detected';
      this.endPacket();
    }
    else {
      this.detectorToolStateProperty.value = 'notDetected';
      this.waveSolver.applyMeasurementProjection(
        this.detectorToolPositionProperty.value,
        this.detectorToolRadiusProperty.value
      );
    }
  }

  public resetDetectorToolState(): void {
    this.detectorToolStateProperty.value = 'ready';
  }

  public override reset(): void {
    super.reset();
    this.autoRepeatProperty.reset();
    this.slitConfigurationProperty.reset();
    this.isPacketActiveProperty.reset();
    this.detectorToolPositionProperty.reset();
    this.detectorToolRadiusProperty.reset();
    this.detectorToolStateProperty.reset();
    this.detectorToolProbabilityProperty.reset();
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.packetReEmission = null;
    this.syncSolverParameters();
  }
}
