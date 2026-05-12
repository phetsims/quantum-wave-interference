// Copyright 2026, University of Colorado Boulder

/**
 * Stateful WaveSolver adapter for the pure analytical Gaussian-packet kernel.
 *
 * The packet solver owns screen state such as current time, cached grids, and detector-tool
 * measurement projections. Each field value is evaluated by AnalyticalWaveKernel, which reports
 * explicit field status and independent coherent components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type AnalyticalSource, type AnalyticalWaveParameters, type GaussianPacketReEmission, type MeasurementProjection, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import BaseAnalyticalWaveSolver from './BaseAnalyticalWaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const EPSILON = 1e-12;
const MEASUREMENT_BITE_SHRINK_DURATION = 0.75;

// Designer-tunable width of the smooth transition from blanked detector interior to untouched wave,
// in view pixels. This feather is applied inside the detector edge only, so failed-detection effects
// remain local and do not attenuate the wave packet outside the detector footprint.
const MEASUREMENT_BITE_EDGE_FEATHER_PIXELS = 5;

const copyPacketReEmission = ( reEmission: GaussianPacketReEmission ): GaussianPacketReEmission => ( {
  selectedSlit: reEmission.selectedSlit,
  eventTime: reEmission.eventTime,
  timeAdvance: reEmission.timeAdvance,
  sourceX: reEmission.sourceX,
  centerY: reEmission.centerY,
  width: reEmission.width
} );

export default class AnalyticalWavePacketSolver extends BaseAnalyticalWaveSolver {

  private readonly measurementProjections: MeasurementProjection[] = [];
  private packetReEmission: GaussianPacketReEmission | null = null;

  public constructor( gridWidth?: number, gridHeight?: number ) {
    super( gridWidth, gridHeight );
  }

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

  protected override ensureComputed(): void {
    if ( this.dirty ) {
      this.computeField();
      this.computeDetectorDistribution();
      this.dirty = false;
    }
  }

  public override reset(): void {
    super.reset();
    this.measurementProjections.length = 0;
    this.packetReEmission = null;
  }

  public getState(): WaveSolverState {
    return {
      time: this.time,
      measurementProjections: this.measurementProjections.map( projection => ( {
        centerX: projection.centerX,
        centerY: projection.centerY,
        radius: projection.radius,
        edgeFeather: projection.edgeFeather,
        measurementTime: projection.measurementTime,
        renormScale: projection.renormScale,
        shrinkDuration: projection.shrinkDuration
      } ) ),
      packetReEmission: this.packetReEmission ? copyPacketReEmission( this.packetReEmission ) : null
    };
  }

  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.measurementProjections.length = 0;

    const projections = state.measurementProjections || state.biteGaussians || [];
    for ( const projection of projections ) {
      this.measurementProjections.push( {
        centerX: projection.centerX ?? projection.worldX0,
        centerY: projection.centerY ?? projection.worldY,
        radius: projection.radius ?? Math.sqrt( 1 / projection.invSigmaSq ),
        edgeFeather: projection.edgeFeather ?? this.getMeasurementBiteEdgeFeather(),
        measurementTime: projection.measurementTime,
        renormScale: projection.renormScale ?? 1,
        shrinkDuration: projection.shrinkDuration ?? MEASUREMENT_BITE_SHRINK_DURATION
      } );
    }

    this.packetReEmission = state.packetReEmission ? copyPacketReEmission( state.packetReEmission ) : null;
    this.dirty = true;
  }

  public override applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    this.measurementProjections.push( {
      centerX: centerNorm.x * this.regionWidth,
      centerY: ( centerNorm.y - 0.5 ) * this.regionHeight,
      radius: radiusNorm * this.regionWidth,
      edgeFeather: this.getMeasurementBiteEdgeFeather(),
      measurementTime: this.time,
      renormScale: 1,
      shrinkDuration: MEASUREMENT_BITE_SHRINK_DURATION
    } );

    this.dirty = true;
  }

  protected override clearAdditionalFieldStateWhenSourceOff(): void {
    this.detectorDistribution.fill( 0 );
  }

  protected override beforeFieldSampleLoop(): void {
    this.updateMeasurementProjectionRenormScales();
  }

  private computeDetectorDistribution(): void {
    if ( !this.isSourceOn ) {
      this.detectorDistribution.fill( 0 );
      return;
    }

    const parameters = this.createKernelParameters( false );
    const dy = this.regionHeight / this.gridHeight;
    let maxProb = 0;

    for ( let iy = 0; iy < this.gridHeight; iy++ ) {
      const y = ( iy + 0.5 ) * dy - this.regionHeight / 2;
      const prob = computeSampleIntensity( evaluateAnalyticalSample( parameters, this.regionWidth, y, this.time ) );
      this.detectorDistribution[ iy ] = prob;
      maxProb = Math.max( maxProb, prob );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < this.gridHeight; iy++ ) {
        this.detectorDistribution[ iy ] /= maxProb;
      }
    }
  }

  protected override createKernelParameters( includeDecoherenceEvents = true ): AnalyticalWaveParameters {
    const parameters = super.createKernelParameters( includeDecoherenceEvents );
    parameters.projections = this.measurementProjections;
    parameters.packetReEmission = this.packetReEmission;

    return parameters;
  }

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

    const unprojectedParameters = this.createKernelParametersWithProjections( [] );
    const projectedParameters = this.createKernelParametersWithProjections( this.measurementProjections );
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

  private createKernelParametersWithProjections( projections: MeasurementProjection[] ): AnalyticalWaveParameters {
    const parameters = this.createKernelParameters();
    parameters.projections = projections;
    return parameters;
  }

  private getMeasurementBiteEdgeFeather(): number {
    return MEASUREMENT_BITE_EDGE_FEATHER_PIXELS / QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH * this.regionWidth;
  }

  protected override getCoherentSlitsGroup(): string {
    return 'slits';
  }

  // Actual packet speed in display-model coordinates. WAVE_PACKET_TRAVERSAL_TIME sets the baseline
  // default-speed crossing time; displaySpeedScale makes non-default particle velocities cross faster
  // or slower while preserving that baseline timing at displaySpeedScale = 1.
  protected override getDisplaySpeed(): number {
    return ( this.regionWidth / QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }

  // Display time required for the packet center to cross the region at the current scaled display speed.
  private getEffectiveTraversalTime(): number {
    return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME / Math.max( this.displaySpeedScale, EPSILON );
  }
}
