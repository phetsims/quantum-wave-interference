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
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, MAX_HITS } from '../../common/model/BaseSceneModel.js';
import { createWavePacketSolver } from '../../common/model/createWaveSolver.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import { hasAnyDetector, hasDetectorOnSide, type SlitConfiguration } from '../../common/model/SlitConfiguration.js';

export const SingleParticlesSlitConfigurationValues = [
  'bothOpen',
  'leftCovered',
  'rightCovered',
  'leftDetector',
  'rightDetector',
  'bothDetectors'
] as const;
export type SingleParticlesSlitConfiguration = SlitConfiguration;

export const DetectorToolStateValues = [ 'ready', 'detected', 'notDetected' ] as const;
export type DetectorToolState = typeof DetectorToolStateValues[number];

const MIN_EMISSION_INTERVAL = 0.3;

export type SingleParticlesSceneModelOptions = BaseSceneModelOptions;

export default class SingleParticlesSceneModel extends BaseSceneModel {

  public readonly autoRepeatProperty: BooleanProperty;
  public readonly slitConfigurationProperty: StringUnionProperty<SingleParticlesSlitConfiguration>;

  // Single particles always use full amplitude (no intensity slider on this screen)
  public readonly waveAmplitudeScaleProperty: TReadOnlyProperty<number> = new Property<number>( 1 );

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

  // Sampled detection time (from truncated Gaussian) for the active packet
  private targetDetectionTime: number;

  // True while a completed packet is automatically turning the emitter off.
  private isEndingPacket: boolean;

  private hasCreatedPacketDecoherenceEvent: boolean;

  public constructor( providedOptions: SingleParticlesSceneModelOptions ) {

    super( createWavePacketSolver(), combineOptions<BaseSceneModelOptions>( {}, providedOptions ) );

    const tandem = providedOptions.tandem;

    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.targetDetectionTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.isEndingPacket = false;
    this.hasCreatedPacketDecoherenceEvent = false;

    this.autoRepeatProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'autoRepeatProperty' )
    } );

    this.slitConfigurationProperty = new StringUnionProperty<SingleParticlesSlitConfiguration>( 'bothOpen', {
      validValues: SingleParticlesSlitConfigurationValues,
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

    // Initial sync and listeners
    this.syncSolverParameters();
    this.setupClearScreenListeners();
    this.slitConfigurationProperty.lazyLink( () => this.clearScreen() );

    // Stop the source when the hit cap is reached
    this.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
      if ( isMaxHitsReached ) {
        this.isEmittingProperty.value = false;
      }
    } );

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
    this.hasCreatedPacketDecoherenceEvent = false;
    super.clearScreen();
  }

  protected override clearWaveStateWhenEmitterTurnsOff(): void {
    this.isPacketActiveProperty.value = false;
    if ( !this.isEndingPacket ) {
      this.detectorToolStateProperty.value = 'ready';
      this.detectorToolProbabilityProperty.value = 0;
    }
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
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
    this.timeSinceLastEmission = 0;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.clearDecoherenceEvents();
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  /**
   * Detection times follow the packet's horizontal probability density: Gaussian around
   * WAVE_PACKET_TRAVERSAL_TIME (packet center arrives at screen), width matches the packet's spatial
   * spread. Truncated at +/- 3 sigma to avoid non-physical negative times.
   */
  private sampleDetectionTime(): number {
    const effectiveTraversalTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME *
                                   ( 1 + QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS *
                                         QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION ) *
                                   this.defaultWaveSpeed / this.getEffectiveWaveSpeed();
    const sigma = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * effectiveTraversalTime;
    const maxDeviation = 3 * sigma;
    let deviation: number;
    do {
      deviation = dotRandom.nextGaussian() * sigma;
    } while ( Math.abs( deviation ) > maxDeviation );
    return effectiveTraversalTime + deviation;
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
      this.obstacleTypeProperty.value !== 'doubleSlit' ||
      !hasAnyDetector( slitConfig )
    ) {
      return;
    }

    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
    const slitArrivalTime = ( this.slitPositionFractionProperty.value * this.regionWidth - initialCenterX ) / propagationSpeed;

    if ( this.waveSolver.getTime() < slitArrivalTime ) {
      return;
    }

    const event = this.createDecoherenceEventForSlitConfiguration( slitConfig, slitArrivalTime );
    if ( event ) {
      this.addDecoherenceEvent( event );
    }
    this.hasCreatedPacketDecoherenceEvent = true;
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
    this.syncSolverParameters();
  }
}
