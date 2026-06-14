// Copyright 2026, University of Colorado Boulder

/**
 * Stateful WaveSolver adapter for the pure analytical continuous-wave kernel.
 *
 * The PhET model still needs cached amplitude grids, detector accumulation, source-on timing,
 * serialization, and the combined single-complex WaveSolver API. The physics evaluation itself lives
 * in AnalyticalWaveKernel and returns richer field samples with independent coherent components.
 *
 * For High Intensity, this solver also caches LayeredFieldSample values. Those layered samples are
 * a rendering-oriented companion to FieldSample: they preserve which selected-slit particle band is
 * visible at each grid cell so the canvas renderer can composite transparent layers in z order. The
 * ordinary FieldSample cache remains the model-facing path for amplitude grids, detector intensity,
 * graphing, tests, and the combined representative-complex API.
 *
 * Keeping both caches here is deliberate during this experimental phase. The scene model still owns
 * the time-ordered detector records, the kernel defines their particle-chain interpretation, and the
 * rasterizer owns visual compositing. The solver's role is only to evaluate those descriptions on
 * the fixed grid once per dirty frame.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';
import { computeSampleIntensity, getRepresentativeComplex } from './AnalyticalFieldSample.js';
import { evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import { type AnalyticalSource } from './AnalyticalWaveKernelTypes.js';
import BaseAnalyticalWaveSolver from './BaseAnalyticalWaveSolver.js';
import { type AnalyticalWaveSolverState, type WaveSolverState } from './WaveSolver.js';

const DISPLAY_TRAVERSAL_TIME = 2.0;
const EDGE_TAPER_CELLS = 4;

export default class AnalyticalWaveSolver extends BaseAnalyticalWaveSolver {

  /**
   * Solver time when the continuous source was most recently turned on. The analytical kernel uses this as the
   * wavefront emission time so cells ahead of the leading edge remain unreached.
   */
  private sourceOnTime: number | null = null;

  /**
   * Running sum of instantaneous detector intensities, one entry per detector grid row. High Intensity displays
   * the time-averaged detector pattern, so each positive step contributes the current detector edge intensity.
   */
  private readonly detectorAccumulator: Float64Array;

  /**
   * Number of instantaneous detector distributions included in detectorAccumulator.
   */
  private detectorAccumulatorCount = 0;

  /**
   * Creates a continuous-wave analytical solver with optional visualization-grid dimensions.
   *
   * @param gridWidth - Number of grid cells in the horizontal direction.
   * @param gridHeight - Number of grid cells in the vertical direction.
   */
  public constructor( gridWidth?: number, gridHeight?: number ) {
    super( gridWidth, gridHeight );
    this.detectorAccumulator = new Float64Array( this.gridHeight );
  }

  /**
   * Updates the source-on state and clears detector averaging state at source transitions. Starting the source records
   * the emission time for the analytical wavefront; stopping the source clears the displayed detector pattern.
   *
   * @param isSourceOn - Whether the source should emit.
   */
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

  /**
   * Advances solver time and, while the source is on, accumulates the instantaneous detector distribution into the
   * running average used by the High Intensity detector screen.
   *
   * @param dt - Time step in model seconds. Non-positive values advance base state only and do not add detector samples.
   */
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

  /**
   * Gets the normalized detector probability distribution. For the native grid height this returns the accumulated
   * time average; other sample counts are evaluated directly through the base resampling path.
   *
   * @param sampleCount - Number of detector rows to return.
   * @returns Normalized detector probability distribution with values scaled by the maximum sampled probability.
   */
  public override getDetectorProbabilityDistribution( sampleCount = this.gridHeight ): Float64Array {
    if ( sampleCount !== this.gridHeight ) {
      return this.getSampledDetectorProbabilityDistribution( sampleCount );
    }

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

    this.normalizeDetectorDistribution( this.detectorDistribution, maxProb );

    return this.detectorDistribution;
  }

  /**
   * Restores the continuous-wave solver to its initial state and clears source timing and detector averaging data.
   */
  public override reset(): void {
    super.reset();
    this.sourceOnTime = null;
    this.detectorAccumulator.fill( 0 );
    this.detectorAccumulatorCount = 0;
  }

  /**
   * Gets a serializable snapshot of the continuous-wave solver state.
   *
   * @returns State containing solver time, source emission time, and detector averaging data.
   */
  public getState(): AnalyticalWaveSolverState {
    return {
      time: this.time,
      sourceOnTime: this.sourceOnTime,
      detectorAccumulator: Array.from( this.detectorAccumulator ),
      detectorAccumulatorCount: this.detectorAccumulatorCount
    };
  }

  /**
   * Restores continuous-wave solver state from serialized data and invalidates cached field data.
   *
   * @param state - Serialized wave solver state to restore.
   */
  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.sourceOnTime = 'sourceOnTime' in state ? state.sourceOnTime : null;
    if ( 'detectorAccumulator' in state ) {
      this.detectorAccumulator.set( state.detectorAccumulator );
      this.detectorAccumulatorCount = state.detectorAccumulatorCount;
    }
    this.dirty = true;
  }

  /**
   * Evaluates the continuous-wave field at model coordinates and reduces the analytical sample to the combined
   * representative complex value used by the WaveSolver API.
   *
   * @param x - Horizontal model coordinate measured from the source side of the wave region.
   * @param y - Vertical model coordinate with y = 0 at the center of the wave region.
   * @param t - Solver time to evaluate, in model seconds.
   * @returns Representative complex amplitude at the requested coordinates and time.
   */
  public override evaluate( x: number, y: number, t = this.time ): Complex {
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  /**
   * Reports whether the current field needs independently layered samples for renderer compositing.
   *
   * @returns true when decoherence events are present and selected-slit particle bands need separate layers.
   */
  public override usesLayeredFieldSamples(): boolean {
    return this.decoherenceEvents.length > 0;
  }

  /**
   * Computes the instantaneous detector-edge intensity at the current solver time without mutating the running
   * accumulator. Samples are taken at the right edge of the wave region.
   */
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

  /**
   * Creates the continuous plane-wave source definition used by the analytical kernel.
   *
   * @returns A plane-wave source configured for the current wave number, display speed, emission time, and edge taper.
   */
  protected override createKernelSource(): AnalyticalSource {
    return {
      kind: 'plane',
      waveNumber: this.getDisplayWaveNumber(),
      speed: this.getDisplaySpeed(),
      startTime: this.sourceOnTime,
      edgeTaperDistance: EDGE_TAPER_CELLS * this.regionWidth / this.gridWidth
    };
  }

  /**
   * Gets the coherence-group name shared by continuous-wave components from open slits.
   *
   * @returns The common coherence-group identifier for slit components.
   */
  protected override getCoherentSlitsGroup(): string {
    return 'coherentSlits';
  }

  /**
   * Gets the continuous-wave speed in display-model coordinates. DISPLAY_TRAVERSAL_TIME sets the default crossing
   * time, and displaySpeedScale makes non-default particle velocities cross faster or slower.
   *
   * @returns Continuous-wave speed in display-model coordinates.
   */
  protected override getDisplaySpeed(): number {
    return ( this.regionWidth / DISPLAY_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }
}
