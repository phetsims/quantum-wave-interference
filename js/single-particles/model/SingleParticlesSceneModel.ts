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
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import { getDisplaySlitLayout } from '../../common/getDisplaySlitLayout.js';
import { type GaussianPacketReEmission } from '../../common/model/AnalyticalWaveKernel.js';
import AnalyticalWavePacketSolver from '../../common/model/AnalyticalWavePacketSolver.js';
import BaseSceneModel, { type BaseSceneModelOptions, HIT_VERTICAL_EXTENT, type SlitSeparationConfig } from '../../common/model/BaseSceneModel.js';
import inverseStandardNormalCDF from '../../common/model/inverseStandardNormalCDF.js';
import { hasAnyDetector } from '../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../../common/QuantumWaveInterferenceQueryParameters.js';

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

// Designer tuning for when a packet can collapse at a detector plane.
// These weights describe how much of the packet's longitudinal probability has reached
// that plane. Weight 0.5 means the packet midpoint/center is at the plane.
// Weight 0.85 means about 85% of the packet has reached the plane.
//
// The sampled curve is zero outside [startWeight, endWeight], rises from startWeight to
// peakWeight, then trails off to endWeight. Raising startWeight prevents collapses until
// later in the packet lifecycle. Raising peakWeight makes the typical collapse later.
// Raising endWeight allows later trailing detections. Larger power values make that side
// of the curve sharper; smaller values make it broader.
export const SCREEN_DETECTION_TIMING_PARAMETERS: ScreenDetectionTimingParameters = {
  startWeight: 0.30,
  peakWeight: 0.50,
  endWeight: 0.70,
  leadingPower: 1.0,
  trailingPower: 1.0
};

// Display-only gain for the wave visualization on the Single Particles screen. This intentionally
// affects canvas brightness/saturation without changing wave propagation, detector probabilities, or hits.
const SINGLE_PARTICLES_WAVE_DISPLAY_GAIN = 1.75;
const MICROMETER_TO_MM = 1e-3;
const NANOMETER_TO_MM = 1e-6;

const SINGLE_PARTICLES_SLIT_SEPARATION_CONFIGS: Record<SourceType, SlitSeparationConfig> = {
  photons: {
    range: new Range( 1 * MICROMETER_TO_MM, 3 * MICROMETER_TO_MM ),
    defaultValue: 2 * MICROMETER_TO_MM
  },
  electrons: {
    range: new Range( 1 * NANOMETER_TO_MM, 3 * NANOMETER_TO_MM ),
    defaultValue: 2 * NANOMETER_TO_MM
  },
  neutrons: {
    range: new Range( 1 * NANOMETER_TO_MM, 3 * NANOMETER_TO_MM ),
    defaultValue: 2 * NANOMETER_TO_MM
  },
  heliumAtoms: {
    range: new Range( 0.10 * NANOMETER_TO_MM, 0.50 * NANOMETER_TO_MM ),
    defaultValue: 0.30 * NANOMETER_TO_MM
  }
};

export type SingleParticlesSceneModelOptions = BaseSceneModelOptions;

export default class SingleParticlesSceneModel extends BaseSceneModel {

  public readonly autoRepeatProperty: BooleanProperty;

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

  // Deterministic center-arrival time used as the re-emission timing reference for on-slit detection.
  private deterministicOnSlitArrivalTime: number;

  // True while a completed packet is automatically turning the emitter off.
  private isEndingPacket: boolean;

  private hasCreatedPacketDecoherenceEvent: boolean;
  private packetReEmission: GaussianPacketReEmission | null = null;

  public constructor( providedOptions: SingleParticlesSceneModelOptions ) {

    super( new AnalyticalWavePacketSolver(
      QuantumWaveInterferenceQueryParameters.waveSolverGridSize,
      QuantumWaveInterferenceQueryParameters.waveSolverGridSize
    ), combineOptions<BaseSceneModelOptions>( {
      slitSeparationConfig: SINGLE_PARTICLES_SLIT_SEPARATION_CONFIGS[ providedOptions.sourceType ]
    }, providedOptions ) );

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

    this.isPacketActiveProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isPacketActiveProperty' ),
      phetioReadOnly: true
    } );

    this.isWaveVisibleProperty = this.isPacketActiveProperty;

    this.isMaxHitsReachedProperty = new DerivedProperty(
      [ this.totalHitsProperty ],
      totalHits => totalHits >= QuantumWaveInterferenceQueryParameters.maxHits
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
      tandem: tandem.createTandem( 'detectorToolPositionProperty' ),
      units: null // The detector radius is stored as a normalized fraction of the wave-region width, not a physical length.
    } );

    this.detectorToolRadiusProperty = new NumberProperty( 0.1, {
      range: new Range( 0.03, 0.3 ),
      units: null, // The detector radius is stored as a normalized fraction of the wave-region width, not a physical length.
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

  /**
   * Clears the visible Single Particles run state without resetting user controls or saved snapshots. This is called by
   * the Clear Screen button and by BaseSceneModel when wave, slit, or barrier parameters change. This cancels any active
   * packet, resets detector-tool result/probability state, clears packet timing and on-slit re-emission state, and turns
   * off the emitter unless auto-repeat is enabled. In auto-repeat mode, clearing cancels the current packet while leaving
   * the source on so step() can emit the next packet. The base implementation clears detector-screen hits, detector
   * counts, shared wave state, and emits the hit-change notification.
   */
  public override clearScreen(): void {
    this.isPacketActiveProperty.value = false;
    this.detectorToolStateProperty.value = 'ready';
    this.detectorToolProbabilityProperty.value = 0;
    this.timeSinceLastEmission = MIN_EMISSION_INTERVAL;
    this.targetOnSlitDetectionTime = Number.POSITIVE_INFINITY;
    this.deterministicOnSlitArrivalTime = QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.packetReEmission = null;

    if ( !this.autoRepeatProperty.value ) {
      this.isEmittingProperty.value = false;
    }

    super.clearScreen();
  }

  /**
   * Clears transient Single Particles wave state when isEmittingProperty changes to false. This path is used when the
   * user turns off the emitter, when max hits forces the emitter off, and when a non-auto-repeat packet ends. It cancels
   * the active packet, clears pending slit detection/re-emission state, and resets the detector-tool readout unless the
   * call is part of the normal packet-ending flow, where the detected/notDetected result should remain visible. The base
   * implementation then clears the shared solver/decoherence state.
   */
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
    this.targetOnSlitDetectionTime = this.sampleDetectionDelayToTargetX(
      this.slitPositionFractionProperty.value * this.regionWidth,
      0
    );
    this.timeSinceLastEmission = 0;
    this.hasCreatedPacketDecoherenceEvent = false;
    this.packetReEmission = null;
    this.clearDecoherenceEvents();
    this.waveSolver.reset();
    this.syncSolverParameters();
  }

  /**
   * Synchronizes the wave solver with the current Single Particles scene state. This is called after model changes
   * that affect solver inputs, including packet emission, slit/decoherence changes, reset, and PhET-iO state restore.
   * The base implementation owns shared wave parameters; this override adds the current packet re-emission descriptor
   * so a slit-detector collapse can continue as a packet sourced from the selected slit. This method does not advance
   * time, reset the solver, or create packet/decoherence events.
   */
  protected override syncSolverParameters(): void {
    super.syncSolverParameters();
    this.waveSolver.setParameters( {
      packetReEmission: this.packetReEmission
    } );
  }

  /**
   * Detection times follow the packet's horizontal probability density from the active packet source
   * to a detector plane. The packet starts at the standard negative sigma offset, so slit re-emission
   * gets the same envelope/timing as ordinary source emission with a shifted origin.
   * The sampled packet weight is intentionally later than the leading edge, documented at
   * SCREEN_DETECTION_TIMING_PARAMETERS.
   */
  private sampleDetectionTime(): number {
    return this.sampleDetectionDelayToTargetX( this.regionWidth, 0 );
  }

  private sampleDetectionDelayToTargetX( targetX: number, sourceX: number ): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
    const detectionWeight = this.sampleScreenDetectionWeight();
    const sampledCenterOffset = inverseStandardNormalCDF( detectionWeight ) * sigmaX0;
    return ( targetX - sourceX - initialCenterX + sampledCenterOffset ) / propagationSpeed;
  }

  /**
   * Samples a packet-weight threshold from the designer timing curve using acceptance-rejection sampling.
   * A candidate weight is drawn uniformly from the active interval, then accepted with probability equal to
   * the curve density at that candidate. The bounded retry count prevents pathological parameter choices
   * from locking the sim: very large leading/trailing powers or invalid values that create little to no
   * positive-density area could make every candidate miss within the retry budget.
   *
   * @returns the sampled fraction of the packet's longitudinal probability that has reached the detector plane
   */
  private sampleScreenDetectionWeight(): number {
    const parameters = SCREEN_DETECTION_TIMING_PARAMETERS;
    affirm(
      parameters.startWeight > 0 &&
      parameters.startWeight < parameters.peakWeight &&
      parameters.peakWeight < parameters.endWeight &&
      parameters.endWeight < 1,
      'screen detection weights should be ordered within (0, 1)'
    );
    affirm( parameters.leadingPower > 0 && parameters.trailingPower > 0, 'curve powers should be positive' );

    // Acceptance-rejection sampling from the screen detection timing curve.
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

  private getDeterministicSlitArrivalTime(): number {
    const propagationSpeed = this.waveSolver.getDisplayPropagationSpeed();
    if ( propagationSpeed <= 0 ) {
      return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME;
    }

    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
    return ( this.slitPositionFractionProperty.value * this.regionWidth - initialCenterX ) / propagationSpeed;
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

  /**
   * Creates the one allowed slit-detector interaction for the active packet, if its sampled on-slit detection time has
   * been reached. This is called from step() once per frame after the wave solver advances, so the interaction is based
   * on solver time rather than frame count. It only acts for double-slit configurations with slit detectors, and
   * hasCreatedPacketDecoherenceEvent ensures each emitted packet handles this interaction at most once.
   *
   * When the sampled slit does not have a detector, this adds a decoherence event so the solver can render the packet as
   * having collapsed to that slit. When the sampled slit has a detector, this records the detector hit and starts packet
   * re-emission from that slit instead of adding a normal decoherence event. In either case, once the sampled interaction
   * time has been reached, this marks the packet's slit interaction as handled for this emission.
   */
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

  /**
   * Starts the second phase of a single-particle packet after an on-slit detector has clicked. This is called from
   * createPacketDecoherenceEventIfNeeded() when the active packet reaches its sampled on-slit detection time and
   * createDecoherenceEventForSlitConfiguration() chooses a slit that has a detector. It records the slit detector hit,
   * replaces ordinary decoherence-event rendering with a Gaussian packet re-emitted from the selected slit, reschedules
   * the final detector-screen hit from that slit position, and pushes the re-emission descriptor to the solver.
   *
   * @param selectedSlit - slit whose detector clicked and from which the packet should be re-emitted
   * @param eventTime - solver time when the on-slit detector interaction occurred
   */
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
      this.sampleDetectionDelayToTargetX( this.regionWidth, packetReEmission.sourceX ) - ( packetReEmission.timeAdvance ?? 0 )
    );
    this.syncSolverParameters();
  }

  private createPacketReEmission( selectedSlit: 'topSlit' | 'bottomSlit', eventTime: number ): GaussianPacketReEmission {
    const { displaySlitSeparation, displaySlitWidth } = getDisplaySlitLayout(
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
      centerY: selectedSlit === 'topSlit' ? -displaySlitSeparation / 2 : displaySlitSeparation / 2,
      width: displaySlitWidth
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

  /**
   * Computes the instantaneous probability that the active packet would be detected by the detector tool at its current
   * position and size. This is called while stepping the active packet, when the detector tool is moved or resized, and
   * when the user performs a detector-tool measurement. It integrates the squared complex amplitude inside the detector
   * circle and normalizes by the total squared amplitude in the wave region. This method only reads current state and
   * does not collapse, project, advance, or otherwise mutate the packet.
   *
   * @returns the normalized detector probability in [ 0, 1 ], or 0 when no packet is active or the field has no total
   * probability
   */
  public computeDetectorProbability(): number {
    if ( !this.isPacketActiveProperty.value ) {
      return 0;
    }

    const amplitudeField = this.waveSolver.getAmplitudeField();
    const gridWidth = this.waveSolver.gridWidth;
    const gridHeight = this.waveSolver.gridHeight;
    const detectorCenterX = this.detectorToolPositionProperty.value.x * gridWidth;
    const detectorCenterY = this.detectorToolPositionProperty.value.y * gridHeight;
    const detectorRadiusSquared = ( this.detectorToolRadiusProperty.value * gridWidth ) ** 2;

    let detectorProbabilityDensitySum = 0;
    let totalProbabilityDensitySum = 0;

    // The amplitude field is a row-major, interleaved complex array: [ real0, imaginary0, real1, imaginary1, ... ].
    // For each grid cell, the detection probability density is proportional to |wave function|^2.
    // Accumulate the probability density over the full field for normalization, and separately over the
    // detector's circular footprint. Because every sample has the same cell area, that area factor cancels in the final
    // detectorProbabilityDensitySum / totalProbabilityDensitySum ratio.
    for ( let gridY = 0; gridY < gridHeight; gridY++ ) {
      for ( let gridX = 0; gridX < gridWidth; gridX++ ) {
        const amplitudeIndex = ( gridY * gridWidth + gridX ) * 2;
        const realAmplitude = amplitudeField[ amplitudeIndex ];
        const imaginaryAmplitude = amplitudeField[ amplitudeIndex + 1 ];
        const probabilityDensity = realAmplitude * realAmplitude + imaginaryAmplitude * imaginaryAmplitude;
        totalProbabilityDensitySum += probabilityDensity;

        const detectorDeltaX = gridX - detectorCenterX;
        const detectorDeltaY = gridY - detectorCenterY;
        if ( detectorDeltaX * detectorDeltaX + detectorDeltaY * detectorDeltaY <= detectorRadiusSquared ) {
          detectorProbabilityDensitySum += probabilityDensity;
        }
      }
    }

    return totalProbabilityDensitySum > 0 ? detectorProbabilityDensitySum / totalProbabilityDensitySum : 0;
  }

  /**
   * Performs one detector-tool measurement of the active packet using the detector tool's current position and size.
   * This is called when the user activates the detector tool. It only acts while a packet is active and the detector
   * tool is ready. The measurement probability comes from computeDetectorProbability(), then a random sample determines
   * the outcome. A successful detection sets the detector tool state to detected and ends the packet. A failed detection
   * sets the state to notDetected and applies a measurement projection that removes the detected region from the
   * wavefunction and renormalizes the remainder for subsequent propagation.
   */
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
