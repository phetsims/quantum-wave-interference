// Copyright 2026, University of Colorado Boulder

/**
 * Stateful WaveSolver adapter for the pure analytical continuous-wave kernel.
 *
 * The PhET model still needs cached amplitude grids, detector accumulation, source on/off timing,
 * serialization, and the legacy single-complex WaveSolver API. The physics evaluation itself lives
 * in AnalyticalWaveKernel and returns richer field samples with independent coherent components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type AnalyticalObstacle, type AnalyticalWaveParameters, type ComplexValue, type FieldSample, computeSampleIntensity, evaluateAnalyticalSample, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import { type ObstacleType } from './ObstacleType.js';
import { getViewSlitLayout } from './getViewSlitLayout.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

const DISPLAY_WAVELENGTHS = QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;
const DISPLAY_TRAVERSAL_TIME = 2.0;
const UNREACHED_SAMPLE: FieldSample = { kind: 'unreached' };

export default class AnalyticalWaveSolver implements WaveSolver {

  public readonly gridWidth: number;
  public readonly gridHeight: number;
  public readonly defaultDisplayWavelengths = DISPLAY_WAVELENGTHS;

  private wavelength = 650e-9;
  private waveSpeed = 3e8;
  private displaySpeedScale = 1;
  private displayWavelengths = DISPLAY_WAVELENGTHS;
  private obstacleType: ObstacleType = 'none';
  private slitSeparation = 0.25e-3;
  private slitSeparationMin = 0.25e-3;
  private slitSeparationMax = 3e-3;
  private slitWidth = 0.02e-3;
  private barrierFractionX = 0.5;
  private isTopSlitOpen = true;
  private isBottomSlitOpen = true;
  private isTopSlitDecoherent = false;
  private isBottomSlitDecoherent = false;
  private isSourceOn = false;
  private regionWidth = 1.0;
  private regionHeight = 1.0;
  private time = 0;

  private sourceOnTime: number | null = null;
  private sourceOffTime: number | null = null;

  private readonly amplitudeField: Float64Array;
  private readonly fieldSamples: FieldSample[];
  private readonly detectorDistribution: Float64Array;
  private readonly detectorAccumulator: Float64Array;
  private detectorAccumulatorCount = 0;
  private dirty = true;

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.fieldSamples = new Array<FieldSample>( gridWidth * gridHeight ).fill( UNREACHED_SAMPLE );
    this.detectorDistribution = new Float64Array( gridHeight );
    this.detectorAccumulator = new Float64Array( gridHeight );
  }

  private setIfDefined<T>( value: T | undefined, setter: ( value: T ) => void ): void {
    if ( value !== undefined ) {
      setter( value );
    }
  }

  public setParameters( params: WaveSolverParameters ): void {
    this.setIfDefined( params.wavelength, value => { this.wavelength = value; } );
    this.setIfDefined( params.waveSpeed, value => { this.waveSpeed = value; } );
    this.setIfDefined( params.displaySpeedScale, value => { this.displaySpeedScale = value; } );
    this.setIfDefined( params.displayWavelengths, value => { this.displayWavelengths = value; } );
    this.setIfDefined( params.obstacleType, value => { this.obstacleType = value; } );
    this.setIfDefined( params.slitSeparation, value => { this.slitSeparation = value; } );
    this.setIfDefined( params.slitSeparationMin, value => { this.slitSeparationMin = value; } );
    this.setIfDefined( params.slitSeparationMax, value => { this.slitSeparationMax = value; } );
    this.setIfDefined( params.slitWidth, value => { this.slitWidth = value; } );
    this.setIfDefined( params.barrierFractionX, value => { this.barrierFractionX = value; } );
    this.setIfDefined( params.isTopSlitOpen, value => { this.isTopSlitOpen = value; } );
    this.setIfDefined( params.isBottomSlitOpen, value => { this.isBottomSlitOpen = value; } );
    this.setIfDefined( params.isTopSlitDecoherent, value => { this.isTopSlitDecoherent = value; } );
    this.setIfDefined( params.isBottomSlitDecoherent, value => { this.isBottomSlitDecoherent = value; } );
    if ( params.isSourceOn !== undefined ) {
      if ( this.isSourceOn && !params.isSourceOn ) {
        this.sourceOffTime = this.time;
      }
      else if ( !this.isSourceOn && params.isSourceOn ) {
        this.sourceOnTime = this.time;
        this.sourceOffTime = null;
        this.detectorAccumulator.fill( 0 );
        this.detectorAccumulatorCount = 0;
      }
      this.isSourceOn = params.isSourceOn;
    }
    this.setIfDefined( params.regionWidth, value => { this.regionWidth = value; } );
    this.setIfDefined( params.regionHeight, value => { this.regionHeight = value; } );
    this.dirty = true;
  }

  public step( dt: number ): void {
    this.time += dt;
    this.dirty = true;

    if ( dt <= 0 ) {
      return;
    }

    if ( this.isSourceOn || this.hasWavesInRegion() ) {
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

  private ensureComputed(): void {
    if ( this.dirty ) {
      this.computeField();
      this.dirty = false;
    }
  }

  public getAmplitudeField(): Float64Array {
    this.ensureComputed();
    return this.amplitudeField;
  }

  public getFieldSampleAtGridCell( gridX: number, gridY: number ): FieldSample {
    this.ensureComputed();
    return this.fieldSamples[ gridY * this.gridWidth + gridX ] || UNREACHED_SAMPLE;
  }

  public getDetectorProbabilityDistribution(): Float64Array {
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

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < this.gridHeight; iy++ ) {
        this.detectorDistribution[ iy ] /= maxProb;
      }
    }

    return this.detectorDistribution;
  }

  public reset(): void {
    this.time = 0;
    this.sourceOnTime = null;
    this.sourceOffTime = null;
    this.amplitudeField.fill( 0 );
    this.fieldSamples.fill( UNREACHED_SAMPLE );
    this.detectorDistribution.fill( 0 );
    this.detectorAccumulator.fill( 0 );
    this.detectorAccumulatorCount = 0;
    this.dirty = true;
  }

  public getState(): WaveSolverState {
    return {
      time: this.time,
      sourceOnTime: this.sourceOnTime,
      sourceOffTime: this.sourceOffTime,
      detectorAccumulator: Array.from( this.detectorAccumulator ),
      detectorAccumulatorCount: this.detectorAccumulatorCount
    };
  }

  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.sourceOnTime = state.sourceOnTime;
    this.sourceOffTime = state.sourceOffTime;
    if ( state.detectorAccumulator ) {
      this.detectorAccumulator.set( state.detectorAccumulator );
      this.detectorAccumulatorCount = state.detectorAccumulatorCount;
    }
    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection(): void {
    // No-op: the detector tool is only present on the Single Particles screen.
  }

  public hasWavesInRegion(): boolean {
    if ( this.isSourceOn ) {
      return true;
    }
    if ( this.sourceOffTime === null ) {
      return false;
    }

    const displaySpeed = this.getDisplaySpeed();
    return displaySpeed > 0 && this.time - this.sourceOffTime <= this.getMaximumRegionPathLength() / displaySpeed;
  }

  public evaluate( x: number, y: number, t = this.time ): ComplexValue {
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  private computeField(): void {
    const { gridWidth, gridHeight, amplitudeField, fieldSamples } = this;

    if ( !this.isSourceOn && !this.hasWavesInRegion() ) {
      amplitudeField.fill( 0 );
      fieldSamples.fill( UNREACHED_SAMPLE );
      return;
    }

    const parameters = this.createKernelParameters();

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = this.getGridCellX( ix );
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const y = this.getGridCellY( iy );
        const sample = evaluateAnalyticalSample( parameters, x, y, this.time );
        const value = getRepresentativeComplex( sample );
        const cellIndex = iy * gridWidth + ix;
        const idx = cellIndex * 2;
        fieldSamples[ cellIndex ] = sample;
        amplitudeField[ idx ] = value.re;
        amplitudeField[ idx + 1 ] = value.im;
      }
    }
  }

  private computeInstantaneousDetectorDistribution(): void {
    const parameters = this.createKernelParameters();
    const dy = this.regionHeight / this.gridHeight;

    for ( let iy = 0; iy < this.gridHeight; iy++ ) {
      const y = ( iy + 0.5 ) * dy - this.regionHeight / 2;
      this.detectorDistribution[ iy ] = computeSampleIntensity(
        evaluateAnalyticalSample( parameters, this.regionWidth, y, this.time )
      );
    }
  }

  private createKernelParameters(): AnalyticalWaveParameters {
    return {
      source: {
        kind: 'plane',
        waveNumber: this.getDisplayWaveNumber(),
        speed: this.getDisplaySpeed(),
        startTime: this.sourceOnTime,
        stopTime: this.sourceOffTime
      },
      obstacle: this.createKernelObstacle()
    };
  }

  private createKernelObstacle(): AnalyticalObstacle {
    if ( this.obstacleType !== 'doubleSlit' ) {
      return { kind: 'none' };
    }

    const { viewSlitSep, viewSlitWidth } = this.getDisplaySlitGeometry();
    return {
      kind: 'doubleSlit',
      barrierX: this.barrierFractionX * this.regionWidth,
      slits: [
        {
          source: 'topSlit',
          centerY: -viewSlitSep / 2,
          width: viewSlitWidth,
          isOpen: this.isTopSlitOpen,
          coherenceGroup: this.isTopSlitDecoherent ? 'topSlitDetector' : 'coherentSlits'
        },
        {
          source: 'bottomSlit',
          centerY: viewSlitSep / 2,
          width: viewSlitWidth,
          isOpen: this.isBottomSlitOpen,
          coherenceGroup: this.isBottomSlitDecoherent ? 'bottomSlitDetector' : 'coherentSlits'
        }
      ]
    };
  }

  private getMaximumRegionPathLength(): number {
    if ( this.obstacleType !== 'doubleSlit' ) {
      return this.regionWidth;
    }

    const barrierX = this.barrierFractionX * this.regionWidth;
    const { viewSlitSep } = this.getDisplaySlitGeometry();
    const openSlitCenters = [
      ...( this.isTopSlitOpen ? [ -viewSlitSep / 2 ] : [] ),
      ...( this.isBottomSlitOpen ? [ viewSlitSep / 2 ] : [] )
    ];

    if ( openSlitCenters.length === 0 ) {
      return barrierX;
    }

    const xPastBarrier = this.regionWidth - barrierX;
    let maxPath = barrierX;
    for ( let i = 0; i < openSlitCenters.length; i++ ) {
      const slitCenterY = openSlitCenters[ i ];
      maxPath = Math.max(
        maxPath,
        barrierX + Math.sqrt( xPastBarrier * xPastBarrier + ( -this.regionHeight / 2 - slitCenterY ) ** 2 ),
        barrierX + Math.sqrt( xPastBarrier * xPastBarrier + ( this.regionHeight / 2 - slitCenterY ) ** 2 )
      );
    }
    return maxPath;
  }

  private getDisplayWaveNumber(): number {
    return 2 * Math.PI * this.displayWavelengths / this.regionWidth;
  }

  private getDisplaySpeed(): number {
    return ( this.regionWidth / DISPLAY_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }

  private getGridCellX( gridX: number ): number {
    const barrierIx = roundSymmetric( this.barrierFractionX * this.gridWidth );
    return this.obstacleType === 'doubleSlit' && gridX === barrierIx ?
           this.barrierFractionX * this.regionWidth :
           gridX * this.regionWidth / this.gridWidth;
  }

  private getGridCellY( gridY: number ): number {
    return ( gridY + 0.5 ) * this.regionHeight / this.gridHeight - this.regionHeight / 2;
  }

  private getDisplaySlitGeometry(): { viewSlitSep: number; viewSlitWidth: number } {
    return getViewSlitLayout( this.slitSeparation, this.slitSeparationMin, this.slitSeparationMax, this.regionHeight );
  }
}
