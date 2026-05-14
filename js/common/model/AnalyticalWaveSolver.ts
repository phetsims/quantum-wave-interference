// Copyright 2026, University of Colorado Boulder

/**
 * Stateful WaveSolver adapter for the pure analytical continuous-wave kernel.
 *
 * The PhET model still needs cached amplitude grids, detector accumulation, source-on timing,
 * serialization, and the legacy single-complex WaveSolver API. The physics evaluation itself lives
 * in AnalyticalWaveKernel and returns richer field samples with independent coherent components.
 *
 * For High Intensity, this solver also caches LayeredFieldSample values. Those layered samples are
 * a rendering-oriented companion to FieldSample: they preserve which selected-slit particle band is
 * visible at each grid cell so the canvas renderer can composite transparent layers in z order. The
 * ordinary FieldSample cache remains the model-facing path for amplitude grids, detector intensity,
 * graphing, tests, and the legacy representative-complex API.
 *
 * Keeping both caches here is deliberate during this experimental phase. The scene model still owns
 * the time-ordered detector records, the kernel defines their particle-chain interpretation, and the
 * rasterizer owns visual compositing. The solver's role is only to evaluate those descriptions on
 * the fixed grid once per dirty frame.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';
import { type AnalyticalSource, computeSampleIntensity, evaluateAnalyticalSample, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import BaseAnalyticalWaveSolver from './BaseAnalyticalWaveSolver.js';
import { type WaveSolverState } from './WaveSolver.js';

const DISPLAY_TRAVERSAL_TIME = 2.0;
const EDGE_TAPER_CELLS = 4;

//TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Documentation is not up to PhET standards for fields and methods.

export default class AnalyticalWaveSolver extends BaseAnalyticalWaveSolver {

  private sourceOnTime: number | null = null;

  private readonly detectorAccumulator: Float64Array;
  private detectorAccumulatorCount = 0;

  public constructor( gridWidth?: number, gridHeight?: number ) {
    super( gridWidth, gridHeight );
    this.detectorAccumulator = new Float64Array( this.gridHeight );
  }

  protected override setSourceOn( isSourceOn: boolean ): void {
    if ( !this.isSourceOn && isSourceOn ) {
      this.sourceOnTime = this.time;
      this.detectorAccumulator.fill( 0 );
      this.detectorAccumulatorCount = 0;
    }
    else if ( this.isSourceOn && !isSourceOn ) {
      this.detectorDistribution.fill( 0 );
      this.detectorAccumulator.fill( 0 );
      this.detectorAccumulatorCount = 0;
    }
    this.isSourceOn = isSourceOn;
  }

  public override step( dt: number ): void {
    super.step( dt );

    if ( dt <= 0 ) {
      return;
    }

    if ( this.isSourceOn ) {
      this.computeInstantaneousDetectorDistribution();
      for ( let iy = 0; iy < this.gridHeight; iy++ ) {
        this.detectorAccumulator[ iy ] += this.detectorDistribution[ iy ];
      }
      this.detectorAccumulatorCount++;
    }
    else if ( this.detectorAccumulatorCount > 0 ) {
      this.detectorAccumulator.fill( 0 );
      this.detectorAccumulatorCount = 0;
    }
  }

  public override getDetectorProbabilityDistribution(): Float64Array {
    if ( this.detectorAccumulatorCount === 0 ) {
      this.detectorDistribution.fill( 0 );
      return this.detectorDistribution;
    }

    let maxProb = 0;
    for ( let iy = 0; iy < this.gridHeight; iy++ ) {
      const avg = this.detectorAccumulator[ iy ] / this.detectorAccumulatorCount;
      this.detectorDistribution[ iy ] = avg;
      maxProb = Math.max( maxProb, avg );
    }

    //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Duplicate if statement in AnalyticalWavePacketSolver.ts
    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < this.gridHeight; iy++ ) {
        this.detectorDistribution[ iy ] /= maxProb;
      }
    }

    return this.detectorDistribution;
  }

  public override reset(): void {
    super.reset();
    this.sourceOnTime = null;
    this.detectorAccumulator.fill( 0 );
    this.detectorAccumulatorCount = 0;
  }

  public getState(): WaveSolverState {
    return {
      time: this.time,
      sourceOnTime: this.sourceOnTime,
      detectorAccumulator: Array.from( this.detectorAccumulator ),
      detectorAccumulatorCount: this.detectorAccumulatorCount
    };
  }

  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.sourceOnTime = state.sourceOnTime;
    if ( state.detectorAccumulator ) {
      this.detectorAccumulator.set( state.detectorAccumulator );
      this.detectorAccumulatorCount = state.detectorAccumulatorCount;
    }
    this.dirty = true;
  }

  public override evaluate( x: number, y: number, t = this.time ): Complex {
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  private computeInstantaneousDetectorDistribution(): void {
    const parameters = this.createKernelParameters( false );
    const dy = this.regionHeight / this.gridHeight;

    for ( let iy = 0; iy < this.gridHeight; iy++ ) {
      const y = ( iy + 0.5 ) * dy - this.regionHeight / 2;
      this.detectorDistribution[ iy ] = computeSampleIntensity(
        evaluateAnalyticalSample( parameters, this.regionWidth, y, this.time )
      );
    }
  }

  protected override createKernelSource(): AnalyticalSource {
    return {
      kind: 'plane',
      waveNumber: this.getDisplayWaveNumber(),
      speed: this.getDisplaySpeed(),
      startTime: this.sourceOnTime,
      edgeTaperDistance: EDGE_TAPER_CELLS * this.regionWidth / this.gridWidth
    };
  }

  protected override getCoherentSlitsGroup(): string {
    return 'coherentSlits';
  }

  protected override getDisplaySpeed(): number {
    return ( this.regionWidth / DISPLAY_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }
}
