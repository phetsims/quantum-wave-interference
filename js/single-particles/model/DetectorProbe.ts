// Copyright 2026, University of Colorado Boulder

/**
 * DetectorProbe is the circular measurement tool on the Single Particles screen. Each scene owns one probe.
 * The probe's position and radius are stored in normalized coordinates (0–1) within the wave region, the state
 * tracks the most recent measurement result, and the probability reports the chance that the active packet
 * would be found inside the probe circle.
 *
 * The probability itself is computed by the owning SingleParticlesSceneModel (it integrates the wave solver's
 * amplitude field) and is injected as a callback, so this class stays free of solver details.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';

export const DetectorProbeStateValues = [ 'ready', 'detected', 'notDetected' ] as const;

// 'ready' — waiting for a measurement; 'detected' — the particle was found in the detector circle;
// 'notDetected' — measurement was performed and the particle was not found.
export type DetectorProbeState = typeof DetectorProbeStateValues[number];

export default class DetectorProbe {

  // Center of the probe circle, in normalized (0–1) wave-region coordinates.
  public readonly positionProperty: Vector2Property;

  // Radius of the probe circle, as a normalized fraction of the wave-region width.
  public readonly radiusProperty: NumberProperty;

  // Most recent measurement result, see DetectorProbeState.
  public readonly stateProperty: StringUnionProperty<DetectorProbeState>;

  // Probability that the active packet would be detected inside the probe circle, in [ 0, 1 ].
  public readonly probabilityProperty: NumberProperty;

  // Computes the instantaneous detection probability for the active packet; injected by the owning scene
  // because the computation integrates the wave solver's amplitude field.
  private readonly computeProbability: () => number;

  /**
   * @param isPacketActiveProperty - whether a wave packet is currently propagating in the owning scene
   * @param computeProbability - computes the detection probability for the active packet at the probe's
   *   current position and size; returns 0 when no packet is active
   * @param tandem - the organizational 'detectorProbe' tandem under which the Properties are instrumented
   */
  public constructor(
    isPacketActiveProperty: TReadOnlyProperty<boolean>,
    computeProbability: () => number,
    tandem: Tandem
  ) {
    this.computeProbability = computeProbability;

    this.positionProperty = new Vector2Property( new Vector2( 0.5, 0.5 ), {
      tandem: tandem.createTandem( 'positionProperty' ),
      units: null, // The detector position is stored as a normalized fraction of the wave-region size, not a physical length.
      phetioFeatured: true
    } );

    this.radiusProperty = new NumberProperty( 0.1, {
      range: new Range( 0.06, 0.3 ),
      units: null, // The detector radius is stored as a normalized fraction of the wave-region width, not a physical length.
      tandem: tandem.createTandem( 'radiusProperty' ),
      phetioFeatured: true
    } );

    this.stateProperty = new StringUnionProperty<DetectorProbeState>( 'ready', {
      validValues: DetectorProbeStateValues,
      tandem: tandem.createTandem( 'stateProperty' ),
      phetioFeatured: true
    } );

    this.probabilityProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'probabilityProperty' ),
      phetioReadOnly: true,
      phetioFeatured: true
    } );

    // Keep the entire detector circle inside the wave region: growing the radius pushes the center inward.
    // Registered before the geometry handler below so that handler always reads an already-clamped position.
    // Not guarded during PhET-iO state restore — notifications are deferred until all values are applied,
    // so clamping a valid saved state is a no-op (closestPointTo returns the same object when contained).
    this.radiusProperty.lazyLink( radius => {
      const centerBounds = DetectorProbe.getCenterBounds( radius );
      this.positionProperty.value = centerBounds.closestPointTo( this.positionProperty.value );
    } );

    // Moving or resizing the detector invalidates a completed measurement, so auto-reset to 'ready'.
    // While ready, recompute the probability so the readout tracks the probe while paused or mid-drag
    // (the scene's step() only recomputes while the sim is playing). Skipped during PhET-iO state restore so a
    // saved 'detected'/'notDetected' result is not clobbered by position/radius notifications.
    const handleGeometryChange = () => {
      if ( isSettingPhetioStateProperty.value ) {
        return;
      }
      if ( this.stateProperty.value !== 'ready' ) {
        this.resetMeasurementState();
      }
      else if ( isPacketActiveProperty.value ) {
        this.probabilityProperty.value = this.computeProbability();
      }
    };
    this.positionProperty.lazyLink( handleGeometryChange );
    this.radiusProperty.lazyLink( handleGeometryChange );
  }

  /**
   * Resets the measurement result to 'ready' and updates the probability for the current packet, if one is active.
   */
  public resetMeasurementState(): void {
    this.probabilityProperty.value = this.computeProbability();
    this.stateProperty.value = 'ready';
  }

  /**
   * Bounds for the detector probe's center, in normalized wave-region coordinates, such that the entire
   * detector circle stays inside the wave region. The radius is stored as a fraction of the wave-region
   * width, so its vertical half-extent in normalized y is radius * width / height.
   *
   * @param radius - detector probe radius, as a normalized fraction of the wave-region width
   * @returns allowed bounds for the detector probe's center
   */
  public static getCenterBounds( radius: number ): Bounds2 {
    const verticalHalfExtent = radius * QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH /
                               QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    return new Bounds2( radius, verticalHalfExtent, 1 - radius, 1 - verticalHalfExtent );
  }

  /**
   * Restores the probe to its initial position, size, measurement state, and probability. Called by the
   * owning scene's reset().
   */
  public reset(): void {
    this.positionProperty.reset();
    this.radiusProperty.reset();
    this.stateProperty.reset();
    this.probabilityProperty.reset();
  }
}
