// Copyright 2026, University of Colorado Boulder

/**
 * TimePlotDataSeries stores the fixed-rate samples used by TimePlotNode. It tracks simulation time
 * in solver-time coordinates, but stores chart x-values as elapsed plot time so the visible trace
 * continues smoothly while old samples scroll off the one-second window.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import SchemaOrientedIOType from '../../../../tandem/js/types/SchemaOrientedIOType.js';
import { type CoreRecord } from '../../../../tandem/js/types/StateSchema.js';
import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';

const MAX_TIME_WINDOW = 1; // seconds of data shown
const MAX_SAMPLES = QuantumWaveInterferenceQueryParameters.timePlotMaxSamples;
const TIME_SAMPLE_INTERVAL = MAX_TIME_WINDOW / MAX_SAMPLES;
const TIME_EPSILON = 1e-12;

const TIME_PLOT_DATA_POINT_SCHEMA = {
  time: NumberIO,
  value: NumberIO
};

export type TimePlotDataPoint = CoreRecord<typeof TIME_PLOT_DATA_POINT_SCHEMA>;

type TimePlotDataSeriesStateObject = {
  dataPoints: TimePlotDataPoint[];
  elapsedTime: number;
  previousSolverTime: number | null;
  nextSampleSolverTime: number | null;
};

type TimePlotSampleFunction = ( solverTime: number ) => number;

type SelfOptions = {
  stateAppliedListener?: () => void;
};

type TimePlotDataSeriesOptions = SelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

const TimePlotDataPointIO = new SchemaOrientedIOType<TimePlotDataPoint, typeof TIME_PLOT_DATA_POINT_SCHEMA>(
  'TimePlotDataPointIO', {
    documentation: 'Serialization for a time plot sample.',
    stateSchema: TIME_PLOT_DATA_POINT_SCHEMA
  } );

export default class TimePlotDataSeries extends PhetioObject {

  private readonly dataPoints: TimePlotDataPoint[];
  private readonly stateAppliedListener: () => void;
  private elapsedTime: number;
  private previousSolverTime: number | null;
  private nextSampleSolverTime: number | null;

  public constructor( providedOptions: TimePlotDataSeriesOptions ) {
    const options = optionize<TimePlotDataSeriesOptions, SelfOptions, PhetioObjectOptions>()( {
      isDisposable: false,
      phetioType: TimePlotDataSeries.TimePlotDataSeriesIO,
      phetioDocumentation: 'Stores the samples and timing state for the wave quantity versus time plot.',
      phetioState: true,
      stateAppliedListener: _.noop
    }, providedOptions );

    super( options );

    this.dataPoints = [];
    this.stateAppliedListener = options.stateAppliedListener;
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

  /**
   * Applies serialized data-series state during PhET-iO state restore and notifies the owning plot
   * node so it can redraw from the restored samples.
   *
   * @param stateObject - serialized samples and timing fields for the time plot
   */
  private applyStateObject( stateObject: TimePlotDataSeriesStateObject ): void {
    this.dataPoints.length = 0;
    this.dataPoints.push( ...stateObject.dataPoints.map( point => _.assign( {}, point ) ) );
    this.elapsedTime = stateObject.elapsedTime;
    this.previousSolverTime = stateObject.previousSolverTime;
    this.nextSampleSolverTime = stateObject.nextSampleSolverTime;
    this.stateAppliedListener();
  }

  /**
   * IOType for the stored time-plot samples and the timing bookkeeping that maps solver time to
   * chart time. Reference serialization is used because the data series instance persists for the
   * life of the owning TimePlotNode.
   */
  public static readonly TimePlotDataSeriesIO = new IOType<TimePlotDataSeries, TimePlotDataSeriesStateObject>(
    'TimePlotDataSeriesIO', {
      valueType: TimePlotDataSeries,
      documentation: 'Serializes the plotted samples and timing state for a time plot.',
      stateSchema: {
        dataPoints: ArrayIO( TimePlotDataPointIO ),
        elapsedTime: NumberIO,
        previousSolverTime: NullableIO( NumberIO ),
        nextSampleSolverTime: NullableIO( NumberIO )
      },
      toStateObject: dataSeries => ( {
        dataPoints: dataSeries.dataPoints.map( point => _.assign( {}, point ) ),
        elapsedTime: dataSeries.elapsedTime,
        previousSolverTime: dataSeries.previousSolverTime,
        nextSampleSolverTime: dataSeries.nextSampleSolverTime
      } ),
      applyState: ( dataSeries, stateObject ) => {
        dataSeries.applyStateObject( stateObject );
      }
    } );
}
