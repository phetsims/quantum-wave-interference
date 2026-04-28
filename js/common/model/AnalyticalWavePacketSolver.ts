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

import type Complex from '../../../../dot/js/Complex.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type AnalyticalObstacle, type AnalyticalWaveParameters, type FieldSample, type MeasurementProjection, computeSampleIntensity, evaluateAnalyticalSample, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import { type ObstacleType } from './ObstacleType.js';
import { getViewSlitLayout } from './getViewSlitLayout.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

const DISPLAY_WAVELENGTHS = QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;

const EPSILON = 1e-12;
const UNREACHED_SAMPLE: FieldSample = { kind: 'unreached' };

export default class AnalyticalWavePacketSolver implements WaveSolver {

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
  private isSourceOn = false;
  private regionWidth = 1.0;
  private regionHeight = 1.0;
  private time = 0;

  private readonly amplitudeField: Float64Array;
  private readonly fieldSamples: FieldSample[];
  private readonly detectorDistribution: Float64Array;
  private dirty = true;

  private readonly measurementProjections: MeasurementProjection[] = [];

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.fieldSamples = new Array<FieldSample>( gridWidth * gridHeight ).fill( UNREACHED_SAMPLE );
    this.detectorDistribution = new Float64Array( gridHeight );
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
    this.setIfDefined( params.isSourceOn, value => { this.isSourceOn = value; } );
    this.setIfDefined( params.regionWidth, value => { this.regionWidth = value; } );
    this.setIfDefined( params.regionHeight, value => { this.regionHeight = value; } );
    this.dirty = true;
  }

  public step( dt: number ): void {
    this.time += dt;
    this.dirty = true;
  }

  public getTime(): number {
    return this.time;
  }

  private ensureComputed(): void {
    if ( this.dirty ) {
      this.computeField();
      this.computeDetectorDistribution();
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
    this.ensureComputed();
    return this.detectorDistribution;
  }

  public reset(): void {
    this.time = 0;
    this.isSourceOn = false;
    this.amplitudeField.fill( 0 );
    this.fieldSamples.fill( UNREACHED_SAMPLE );
    this.detectorDistribution.fill( 0 );
    this.measurementProjections.length = 0;
    this.dirty = true;
  }

  public getState(): WaveSolverState {
    return {
      time: this.time,
      measurementProjections: this.measurementProjections.map( projection => ( {
        centerX: projection.centerX,
        centerY: projection.centerY,
        radius: projection.radius,
        measurementTime: projection.measurementTime,
        renormScale: projection.renormScale
      } ) )
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
        measurementTime: projection.measurementTime,
        renormScale: projection.renormScale ?? 1
      } );
    }

    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    this.ensureComputed();

    const { gridWidth, gridHeight, amplitudeField } = this;
    const cxGrid = centerNorm.x * gridWidth;
    const cyGrid = centerNorm.y * gridHeight;
    const rGrid = radiusNorm * gridWidth;
    const rSqGrid = rGrid * rGrid;

    let probInCircle = 0;
    let totalProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const dyCell = iy + 0.5 - cyGrid;
      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const dxCell = ix + 0.5 - cxGrid;
        const idx = ( iy * gridWidth + ix ) * 2;
        const re = amplitudeField[ idx ];
        const im = amplitudeField[ idx + 1 ];
        const prob = re * re + im * im;
        totalProb += prob;
        if ( dxCell * dxCell + dyCell * dyCell <= rSqGrid ) {
          probInCircle += prob;
        }
      }
    }

    const remainingProb = Math.max( 0, totalProb - probInCircle );
    const renormScale = remainingProb > EPSILON ? Math.sqrt( totalProb / remainingProb ) : 1;
    this.measurementProjections.push( {
      centerX: centerNorm.x * this.regionWidth,
      centerY: ( centerNorm.y - 0.5 ) * this.regionHeight,
      radius: radiusNorm * this.regionWidth,
      measurementTime: this.time,
      renormScale: renormScale
    } );

    this.dirty = true;
  }

  public evaluate( x: number, y: number, t = this.time ): Complex {
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  private computeField(): void {
    const { gridWidth, gridHeight, amplitudeField, fieldSamples } = this;

    if ( !this.isSourceOn ) {
      amplitudeField.fill( 0 );
      fieldSamples.fill( UNREACHED_SAMPLE );
      this.detectorDistribution.fill( 0 );
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
        amplitudeField[ idx ] = value.real;
        amplitudeField[ idx + 1 ] = value.imaginary;
      }
    }
  }

  private computeDetectorDistribution(): void {
    if ( !this.isSourceOn ) {
      this.detectorDistribution.fill( 0 );
      return;
    }

    const parameters = this.createKernelParameters();
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

  private createKernelParameters(): AnalyticalWaveParameters {
    const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * this.regionWidth;
    const sigmaY0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_Y_FRACTION * this.regionHeight;

    return {
      source: {
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
      },
      obstacle: this.createKernelObstacle(),
      projections: this.measurementProjections
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
          coherenceGroup: 'slits'
        },
        {
          source: 'bottomSlit',
          centerY: viewSlitSep / 2,
          width: viewSlitWidth,
          isOpen: this.isBottomSlitOpen,
          coherenceGroup: 'slits'
        }
      ]
    };
  }

  private getDisplayWaveNumber(): number {
    return 2 * Math.PI * this.displayWavelengths / this.regionWidth;
  }

  private getDisplaySpeed(): number {
    return ( this.regionWidth / QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME ) * this.displaySpeedScale;
  }

  private getEffectiveTraversalTime(): number {
    return QuantumWaveInterferenceConstants.WAVE_PACKET_TRAVERSAL_TIME / Math.max( this.displaySpeedScale, EPSILON );
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
