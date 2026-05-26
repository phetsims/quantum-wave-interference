// Copyright 2026, University of Colorado Boulder

/**
 * TimePlotDataSeries stores the fixed-rate samples used by TimePlotNode. It tracks simulation time
 * in solver-time coordinates, but stores chart x-values as elapsed plot time so the visible trace
 * continues smoothly while old samples scroll off the one-second window.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';

const MAX_TIME_WINDOW = 1; // seconds of data shown
const MAX_SAMPLES = QuantumWaveInterferenceQueryParameters.timePlotMaxSamples;
const TIME_SAMPLE_INTERVAL = MAX_TIME_WINDOW / MAX_SAMPLES;
const TIME_EPSILON = 1e-12;

export type TimePlotDataPoint = {
  time: number;
  value: number;
};

type TimePlotSampleFunction = ( solverTime: number ) => number;

export default class TimePlotDataSeries {

  private readonly dataPoints: TimePlotDataPoint[];
  private elapsedTime: number;
  private previousSolverTime: number | null;
  private nextSampleSolverTime: number | null;

  public constructor() {
    this.dataPoints = [];
    this.elapsedTime = 0;
    this.previousSolverTime = null;
    this.nextSampleSolverTime = null;
  }

  /**
   * Gets the stored points in chart coordinates. The returned array must be treated as read-only;
   * use reset() and stepAtSolverTime() to mutate the series.
   */
  public get points(): readonly TimePlotDataPoint[] {
    return this.dataPoints;
  }

  /**
   * Clears all stored samples and timing state. The next call to stepAtSolverTime() will seed a
   * new trace from the current solver time.
   */
  public reset(): void {
    this.dataPoints.length = 0;
    this.elapsedTime = 0;
    this.previousSolverTime = null;
    this.nextSampleSolverTime = null;
  }

  /**
   * Returns whether the solver time has moved backward relative to the previous sample step.
   * This occurs after scene resets or solver replacement, and the time plot must restart instead
   * of connecting old samples to the rewound solver state.
   */
  public hasSolverTimeRewound( currentSolverTime: number ): boolean {
    return this.previousSolverTime !== null && currentSolverTime + TIME_EPSILON < this.previousSolverTime;
  }

  /**
   * Advances the series to currentSolverTime, adding samples at fixed solver-time intervals.
   *
   * Samples are not taken once per animation frame because frame dt can vary with browser load.
   * Fixed solver-time intervals keep the chart density and phase history stable across frame rates.
   * If a large time jump occurs, samples before the visible one-second window are skipped.
   *
   * @param currentSolverTime - current time reported by the wave solver
   * @param sampleFunction - returns the displayed value for a requested solver time
   * @returns whether points or timing state changed and the chart should be refreshed
   */
  public stepAtSolverTime( currentSolverTime: number, sampleFunction: TimePlotSampleFunction ): boolean {
    if ( this.hasSolverTimeRewound( currentSolverTime ) ) {
      this.reset();
    }

    if ( this.previousSolverTime === null ) {
      this.addPoint( currentSolverTime, this.elapsedTime, sampleFunction );
      this.previousSolverTime = currentSolverTime;
      this.nextSampleSolverTime = currentSolverTime + TIME_SAMPLE_INTERVAL;
      return true;
    }

    if ( currentSolverTime <= this.previousSolverTime + TIME_EPSILON ) {
      return false;
    }

    const previousSolverTime = this.previousSolverTime;
    const previousElapsedTime = this.elapsedTime;
    const solverDt = currentSolverTime - previousSolverTime;
    this.elapsedTime += solverDt;

    let nextSampleSolverTime = this.nextSampleSolverTime || previousSolverTime + TIME_SAMPLE_INTERVAL;
    const minVisibleSolverTime = currentSolverTime - MAX_TIME_WINDOW;

    // If a large time jump occurred, skip directly to the visible part of the chart window.
    if ( nextSampleSolverTime < minVisibleSolverTime ) {
      const intervalsToSkip = Math.floor( ( minVisibleSolverTime - nextSampleSolverTime ) / TIME_SAMPLE_INTERVAL );
      nextSampleSolverTime += intervalsToSkip * TIME_SAMPLE_INTERVAL;
      while ( nextSampleSolverTime < minVisibleSolverTime ) {
        nextSampleSolverTime += TIME_SAMPLE_INTERVAL;
      }
    }

    while ( nextSampleSolverTime <= currentSolverTime + TIME_EPSILON ) {
      const plotTime = previousElapsedTime + nextSampleSolverTime - previousSolverTime;
      this.addPoint( nextSampleSolverTime, plotTime, sampleFunction );
      nextSampleSolverTime += TIME_SAMPLE_INTERVAL;
    }

    this.previousSolverTime = currentSolverTime;
    this.nextSampleSolverTime = nextSampleSolverTime;
    this.trimToVisibleWindow();

    return true;
  }

  /**
   * Gets the one-second chart x-axis window for the current samples.
   *
   * @returns minTime and maxTime in elapsed plot-time coordinates
   */
  public getChartTimeRange(): { minTime: number; maxTime: number } {
    const latestPoint = this.dataPoints[ this.dataPoints.length - 1 ];
    const maxTime = latestPoint ? latestPoint.time : MAX_TIME_WINDOW;
    const minTime = Math.max( 0, maxTime - MAX_TIME_WINDOW );

    return {
      minTime: minTime,
      maxTime: minTime + MAX_TIME_WINDOW
    };
  }

  /**
   * Adds one sampled point to the series.
   *
   * @param solverTime - time to pass to the wave solver
   * @param plotTime - elapsed chart time used for the point's x-coordinate
   * @param sampleFunction - returns the displayed value for solverTime
   */
  private addPoint( solverTime: number, plotTime: number, sampleFunction: TimePlotSampleFunction ): void {
    this.dataPoints.push( {
      time: plotTime,
      value: sampleFunction( solverTime )
    } );
  }

  /**
   * Removes samples outside the visible one-second time window and enforces the query-parameter
   * controlled sample cap.
   */
  private trimToVisibleWindow(): void {
    const minTime = this.elapsedTime - MAX_TIME_WINDOW;
    while ( this.dataPoints.length > 0 && this.dataPoints[ 0 ].time < minTime ) {
      this.dataPoints.shift();
    }
    while ( this.dataPoints.length > MAX_SAMPLES ) {
      this.dataPoints.shift();
    }
  }
}
