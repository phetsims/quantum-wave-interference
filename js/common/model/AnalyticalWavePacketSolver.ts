// Copyright 2026, University of Colorado Boulder

/**
 * Stateful WaveSolver adapter for the pure analytical Gaussian-packet kernel.
 *
 * The packet solver owns screen state such as current time, cached grids, and detector-probe
 * measurement projections. Each field value is evaluated by AnalyticalWaveKernel, which reports
 * explicit field status and independent coherent components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { computeSampleIntensity } from './AnalyticalFieldSample.js';
import { evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import { type AnalyticalSource, type AnalyticalWaveParameters, type GaussianPacketReEmission, type MeasurementProjection } from './AnalyticalWaveKernelTypes.js';
import BaseAnalyticalWaveSolver from './BaseAnalyticalWaveSolver.js';
import { type AnalyticalWavePacketSolverState, type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const EPSILON = 1e-12;

// Designer-tunable width of the smooth transition from blanked detector interior to untouched wave,
// in view pixels. This feather is applied inside the detector edge only, so failed-detection effects
// remain local and do not attenuate the wave packet outside the detector footprint.
const MEASUREMENT_BITE_EDGE_FEATHER_PIXELS = 5;

function copyPacketReEmission( reEmission: GaussianPacketReEmission ): GaussianPacketReEmission {
  return {
    selectedSlit: reEmission.selectedSlit,
    eventTime: reEmission.eventTime,
    timeAdvance: reEmission.timeAdvance,
    sourceX: reEmission.sourceX,
    centerY: reEmission.centerY,
    width: reEmission.width
  };
}

export default class AnalyticalWavePacketSolver extends BaseAnalyticalWaveSolver {

  /**
   * Detector-probe measurement projections that have been applied to the current emitted packet. Each projection
   * suppresses the wave inside the failed-detection region after its measurement time, then renormalizes the
   * remaining packet intensity. The array instance is retained so kernel parameters can safely reference it while
   * entries are cleared or replaced during reset and state restore.
   */
  private readonly measurementProjections: MeasurementProjection[] = [];

  /**
   * Description of the packet re-emitted from a selected slit after an initial interaction with the barrier. When this
   * changes to a new event time, any existing measurement projections are discarded because they belonged to the
   * previously emitted packet.
   */
  private packetReEmission: GaussianPacketReEmission | null = null;

  /**
   * Creates a Gaussian wave-packet solver with optional visualization-grid dimensions.
   *
   * @param gridWidth - Number of grid cells in the horizontal direction.
   * @param gridHeight - Number of grid cells in the vertical direction.
   */
  public constructor( gridWidth?: number, gridHeight?: number ) {
    super( gridWidth, gridHeight );
  }

  /**
   * Applies any provided solver parameters and marks cached field data dirty. A new packet re-emission event
   * clears existing measurement projections because those projections were applied to the previous emitted packet.
   *
   * @param params - Partial solver parameters to apply.
   */
  public override setParameters( params: WaveSolverParameters ): void {
    super.setParameters( params );
    this.setIfDefined( params.packetReEmission, value => {
      const previousEventTime = this.packetReEmission?.eventTime;
      this.packetReEmission = value ? copyPacketReEmission( value ) : null;
      if ( value && previousEventTime !== value.eventTime ) {
        this.measurementProjections.length = 0;
      }
    } );
    this.dirty = true;
  }

  /**
   * Recomputes all cached field and detector data when the solver has been invalidated.
   */
  protected override ensureComputed(): void {
    if ( this.dirty ) {
      this.computeField();
      this.computeDetectorDistribution();
      this.dirty = false;
    }
  }

  /**
   * Restores the solver to its initial state, including packet-specific measurement projections and re-emission state.
   */
  public override reset(): void {
    super.reset();
    this.measurementProjections.length = 0;
    this.packetReEmission = null;
  }

  /**
   * Gets a serializable snapshot of the packet solver state.
   *
   * @returns State containing time, measurement projections, and packet re-emission information.
   */
  public getState(): AnalyticalWavePacketSolverState {
    return {
      time: this.time,
      measurementProjections: this.measurementProjections.map( projection => ( {
        centerX: projection.centerX,
        centerY: projection.centerY,
        radius: projection.radius,
        edgeFeather: projection.edgeFeather,
        measurementTime: projection.measurementTime,
        renormScale: projection.renormScale
      } ) ),
      packetReEmission: this.packetReEmission ? copyPacketReEmission( this.packetReEmission ) : null
    };
  }

  /**
   * Restores packet solver state from serialized data. This accepts both current measurement-projection state
   * and legacy bite-gaussian state so older saved data can still be loaded.
   *
   * @param state - Serialized wave solver state to restore.
   */
  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.measurementProjections.length = 0;

    if ( 'measurementProjections' in state ) {
      for ( const projection of state.measurementProjections ) {
        this.measurementProjections.push( {
          centerX: projection.centerX,
          centerY: projection.centerY,
          radius: projection.radius,
          edgeFeather: projection.edgeFeather,
          measurementTime: projection.measurementTime,
          renormScale: projection.renormScale
        } );
      }
    }
    else if ( 'biteGaussians' in state ) {
      for ( const projection of state.biteGaussians ) {
        this.measurementProjections.push( {
          centerX: projection.worldX0,
          centerY: projection.worldY,
          radius: Math.sqrt( 1 / projection.invSigmaSq ),
          edgeFeather: projection.edgeFeather ?? this.getMeasurementBiteEdgeFeather(),
          measurementTime: projection.measurementTime,
          renormScale: projection.renormScale ?? 1
        } );
      }
    }

    this.packetReEmission = 'packetReEmission' in state && state.packetReEmission ? copyPacketReEmission( state.packetReEmission ) : null;
    this.dirty = true;
  }

  /**
   * Applies a detector-probe measurement projection to the packet wavefunction. The normalized center is converted
   * into model coordinates, the normalized radius is converted to model width, and the field cache is invalidated.
   *
   * @param centerNorm - Projection center in normalized wave-region coordinates.
   * @param radiusNorm - Projection radius as a fraction of the wave-region width.
   */
  public override applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    this.measurementProjections.push( {
      centerX: centerNorm.x * this.regionWidth,
      centerY: ( centerNorm.y - 0.5 ) * this.regionHeight,
      radius: radiusNorm * this.regionWidth,
      edgeFeather: this.getMeasurementBiteEdgeFeather(),
      measurementTime: this.time,
      renormScale: 1
    } );

    this.dirty = true;
  }

  /**
   * Reports whether this solver can return independently layered field samples.
   *
   * @returns true because packet samples can contain independent coherent components.
   */
  public override usesLayeredFieldSamples(): boolean {
    return true;
  }

  /**
   * Clears packet-specific cached field state when the source is off.
   */
  protected override clearAdditionalFieldStateWhenSourceOff(): void {
    this.detectorDistribution.fill( 0 );
  }

  /**
   * Updates projection renormalization before the field grid is sampled.
   */
  protected override beforeFieldSampleLoop(): void {
    this.updateMeasurementProjectionRenormScales();
  }

  /**
   * Recomputes the cached normalized detector probability distribution at the current solver time.
   */
  private computeDetectorDistribution(): void {
    this.computeNormalizedDetectorDistribution( this.detectorDistribution, false );
  }

  /**
   * Updates projection renormalization before detector-edge samples are evaluated.
   */
  protected override beforeDetectorDistributionSampling(): void {
    this.updateMeasurementProjectionRenormScales();
  }

  /**
   * Creates analytical-kernel parameters for this packet solver, including active measurement projections
   * and packet re-emission state.
   *
   * @param includeDecoherenceEvents - Whether decoherence events should be included in the parameters.
   * @param projections - Measurement projections to include, or the solver's active projections by default.
   * @returns Parameters to pass to the analytical wave kernel.
   */
  protected override createKernelParameters(
    includeDecoherenceEvents = true,
    projections: MeasurementProjection[] = this.measurementProjections
  ): AnalyticalWaveParameters {
    const parameters = super.createKernelParameters( includeDecoherenceEvents );
    parameters.projections = projections;
    parameters.packetReEmission = this.packetReEmission;

    return parameters;
  }

  /**
   * Creates the Gaussian-packet source definition used by the analytical kernel.
   *
   * @returns A Gaussian-packet source configured for the current region size and display speed.
   */
  protected override createKernelSource(): AnalyticalSource {
    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const sigmaY0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_Y_FRACTION * this.regionHeight;

    return {
      kind: 'gaussianPacket',
      isActive: this.isSourceOn,
      waveNumber: this.getDisplayWaveNumber(),
      speed: this.getDisplaySpeed(),
      initialCenterX: -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0,
      centerY: 0,
      sigmaX0: sigmaX0,
      sigmaY0: sigmaY0,
      longitudinalSpreadTime: QuantumWaveInterferenceConstants.WAVE_PACKET_LONGITUDINAL_SPREAD_TRAVERSALS * this.getEffectiveTraversalTime(),
      transverseSpreadTime: QuantumWaveInterferenceConstants.WAVE_PACKET_TRANSVERSE_SPREAD_TRAVERSALS * this.getEffectiveTraversalTime()
    };
  }

  /**
   * Updates the active measurement projection's renormalization scale so total integrated intensity is preserved.
   * Earlier projection scales are reset before recomputing the latest active projection at the provided time.
   *
   * @param t - Solver time at which to evaluate projected and unprojected packet intensities.
   */
  private updateMeasurementProjectionRenormScales( t = this.time ): void {
    if ( this.measurementProjections.length === 0 || !this.isSourceOn ) {
      return;
    }

    for ( let i = 0; i < this.measurementProjections.length; i++ ) {
      this.measurementProjections[ i ].renormScale = 1;
    }

    let lastActiveProjection: MeasurementProjection | null = null;
    for ( let i = 0; i < this.measurementProjections.length; i++ ) {
      if ( t + EPSILON >= this.measurementProjections[ i ].measurementTime ) {
        lastActiveProjection = this.measurementProjections[ i ];
      }
    }

    if ( !lastActiveProjection ) {
      return;
    }

    const unprojectedParameters = this.createKernelParameters( true, [] );
    const projectedParameters = this.createKernelParameters();
    let unprojectedTotal = 0;
    let projectedTotal = 0;

    for ( let ix = 0; ix < this.gridWidth; ix++ ) {
      const x = this.getGridCellX( ix );
      for ( let iy = 0; iy < this.gridHeight; iy++ ) {
        const y = this.getGridCellY( iy );
        unprojectedTotal += computeSampleIntensity( evaluateAnalyticalSample( unprojectedParameters, x, y, t ) );
        projectedTotal += computeSampleIntensity( evaluateAnalyticalSample( projectedParameters, x, y, t ) );
      }
    }

    lastActiveProjection.renormScale = projectedTotal > EPSILON && unprojectedTotal > EPSILON ?
                                       Math.sqrt( unprojectedTotal / projectedTotal ) :
                                       1;
  }

  /**
   * Gets the detector measurement edge-feather distance in current model coordinates.
   *
   * @returns Feather distance scaled from view pixels into the current wave-region width.
   */
  private getMeasurementBiteEdgeFeather(): number {
    return MEASUREMENT_BITE_EDGE_FEATHER_PIXELS / QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH * this.regionWidth;
  }

  /**
   * Gets the coherence-group name shared by packet components from open slits.
   *
   * @returns The common coherence-group identifier for slit components.
   */
  protected override getCoherentSlitsGroup(): string {
    return 'slits';
  }

  /**
   * Gets the actual packet speed in display-model coordinates. WAVE_PACKET_TRAVERSAL_TIME sets the baseline
   * default-speed crossing time; displaySpeedScale makes non-default particle velocities cross faster or slower
   * while preserving that baseline timing at displaySpeedScale = 1.
   *
   * @returns Packet speed in display-model coordinates.
   */
  protected override getDisplaySpeed(): number {
    return ( this.regionWidth / QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }

  /**
   * Gets the display time required for the packet center to cross the region at the current scaled display speed.
   *
   * @returns Effective traversal time in solver display-time units.
   */
  private getEffectiveTraversalTime(): number {
    return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME / Math.max( this.displaySpeedScale, EPSILON );
  }
}
