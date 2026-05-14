// Copyright 2026, University of Colorado Boulder

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Documentation is not up to PhET standards. Other than the header comment, there is no documentation.

/**
 * BaseAnalyticalWaveSolver owns the shared stateful WaveSolver adapter behavior for analytical solvers.
 * Subclasses provide the source model and any screen-specific detector/projection state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type AnalyticalBarrier, type AnalyticalSource, type AnalyticalWaveParameters, type DecoherenceEvent, evaluateAnalyticalLayeredSample, evaluateAnalyticalSample, type FieldSample, getRepresentativeComplex, type LayeredFieldSample } from './AnalyticalWaveKernel.js';
import { type BarrierType } from './BarrierType.js';
import { getViewSlitLayout } from './getViewSlitLayout.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;
const DISPLAY_WAVELENGTHS = QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;
const UNREACHED_SAMPLE: FieldSample = { kind: 'unreached' };
const UNREACHED_LAYERED_SAMPLE: LayeredFieldSample = { kind: 'unreached' };

export default abstract class BaseAnalyticalWaveSolver implements WaveSolver {

  public readonly gridWidth: number;
  public readonly gridHeight: number;
  public readonly defaultDisplayWavelengths = DISPLAY_WAVELENGTHS;

  protected wavelength = 650e-9;
  protected waveSpeed = 3e8;
  protected displaySpeedScale = 1;
  protected displayWavelengths = DISPLAY_WAVELENGTHS;
  protected barrierType: BarrierType = 'none';
  protected slitSeparation = 0.25e-3;
  protected slitSeparationMin = 0.25e-3;
  protected slitSeparationMax = 3e-3;
  protected slitWidth = 0.02e-3;
  protected barrierFractionX = 0.5;
  protected isTopSlitOpen = true;
  protected isBottomSlitOpen = true;
  protected isTopSlitDecoherent = false;
  protected isBottomSlitDecoherent = false;
  protected isSourceOn = false;
  protected regionWidth = 1.0;
  protected regionHeight = 1.0;
  protected time = 0;

  protected readonly amplitudeField: Float64Array;
  protected readonly fieldSamples: FieldSample[];
  protected readonly layeredFieldSamples: LayeredFieldSample[];
  protected readonly detectorDistribution: Float64Array;
  protected decoherenceEvents: readonly DecoherenceEvent[] = [];
  protected dirty = true;

  protected constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.fieldSamples = new Array<FieldSample>( gridWidth * gridHeight ).fill( UNREACHED_SAMPLE );
    this.layeredFieldSamples = new Array<LayeredFieldSample>( gridWidth * gridHeight ).fill( UNREACHED_LAYERED_SAMPLE );
    this.detectorDistribution = new Float64Array( gridHeight );
  }

  protected setIfDefined<T>( value: T | undefined, setter: ( value: T ) => void ): void {
    if ( value !== undefined ) {
      setter( value );
    }
  }

  public setParameters( params: WaveSolverParameters ): void {
    this.setIfDefined( params.wavelength, value => { this.wavelength = value; } );
    this.setIfDefined( params.waveSpeed, value => { this.waveSpeed = value; } );
    this.setIfDefined( params.displaySpeedScale, value => { this.displaySpeedScale = value; } );
    this.setIfDefined( params.displayWavelengths, value => { this.displayWavelengths = value; } );
    this.setIfDefined( params.barrierType, value => { this.barrierType = value; } );
    this.setIfDefined( params.slitSeparation, value => { this.slitSeparation = value; } );
    this.setIfDefined( params.slitSeparationMin, value => { this.slitSeparationMin = value; } );
    this.setIfDefined( params.slitSeparationMax, value => { this.slitSeparationMax = value; } );
    this.setIfDefined( params.slitWidth, value => { this.slitWidth = value; } );
    this.setIfDefined( params.barrierFractionX, value => { this.barrierFractionX = value; } );
    this.setIfDefined( params.isTopSlitOpen, value => { this.isTopSlitOpen = value; } );
    this.setIfDefined( params.isBottomSlitOpen, value => { this.isBottomSlitOpen = value; } );
    this.setIfDefined( params.isTopSlitDecoherent, value => { this.isTopSlitDecoherent = value; } );
    this.setIfDefined( params.isBottomSlitDecoherent, value => { this.isBottomSlitDecoherent = value; } );
    this.setIfDefined( params.isSourceOn, value => this.setSourceOn( value ) );
    this.setIfDefined( params.regionWidth, value => { this.regionWidth = value; } );
    this.setIfDefined( params.regionHeight, value => { this.regionHeight = value; } );
    this.setIfDefined( params.decoherenceEvents, value => { this.decoherenceEvents = value.slice(); } );
    this.dirty = true;
  }

  protected setSourceOn( isSourceOn: boolean ): void {
    this.isSourceOn = isSourceOn;
  }

  public step( dt: number ): void {
    this.time += dt;
    this.dirty = true;
  }

  public getTime(): number {
    return this.time;
  }

  protected ensureComputed(): void {
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

  public getLayeredFieldSampleAtGridCell( gridX: number, gridY: number ): LayeredFieldSample {
    this.ensureComputed();
    return this.layeredFieldSamples[ gridY * this.gridWidth + gridX ] || UNREACHED_LAYERED_SAMPLE;
  }

  public getDetectorProbabilityDistribution(): Float64Array {
    this.ensureComputed();
    return this.detectorDistribution;
  }

  public getDisplayPropagationSpeed(): number {
    return this.getDisplaySpeed();
  }

  public reset(): void {
    this.time = 0;
    this.isSourceOn = false;
    this.amplitudeField.fill( 0 );
    this.fieldSamples.fill( UNREACHED_SAMPLE );
    this.layeredFieldSamples.fill( UNREACHED_LAYERED_SAMPLE );
    this.detectorDistribution.fill( 0 );
    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public abstract getState(): WaveSolverState;

  public abstract setState( state: WaveSolverState ): void;

  public applyMeasurementProjection( _centerNorm: Vector2, _radiusNorm: number ): void {
    // No-op by default. Packet solvers override this for detector-tool projections.
  }

  public evaluate( x: number, y: number, t = this.time ): Complex {
    this.ensureComputed();
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  protected computeField(): void {
    const { gridWidth, gridHeight, amplitudeField, fieldSamples, layeredFieldSamples } = this;

    if ( !this.isSourceOn ) {
      amplitudeField.fill( 0 );
      fieldSamples.fill( UNREACHED_SAMPLE );
      layeredFieldSamples.fill( UNREACHED_LAYERED_SAMPLE );
      this.clearAdditionalFieldStateWhenSourceOff();
      return;
    }

    const parameters = this.createKernelParameters();
    this.beforeFieldSampleLoop( parameters );

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = this.getGridCellX( ix );
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const y = this.getGridCellY( iy );
        const sample = evaluateAnalyticalSample( parameters, x, y, this.time );
        const value = getRepresentativeComplex( sample );
        const layeredSample = evaluateAnalyticalLayeredSample( parameters, x, y, this.time );
        const cellIndex = iy * gridWidth + ix;
        const idx = cellIndex * 2;
        fieldSamples[ cellIndex ] = sample;
        layeredFieldSamples[ cellIndex ] = layeredSample;
        amplitudeField[ idx ] = value.real;
        amplitudeField[ idx + 1 ] = value.imaginary;
      }
    }
  }

  protected clearAdditionalFieldStateWhenSourceOff(): void {
    // Hook for subclasses with additional display caches.
  }

  protected beforeFieldSampleLoop( _parameters: AnalyticalWaveParameters ): void {
    // Hook for subclasses that update source/projection parameters before sampling.
  }

  protected createKernelParameters( includeDecoherenceEvents = true ): AnalyticalWaveParameters {
    const parameters: AnalyticalWaveParameters = {
      source: this.createKernelSource(),
      barrier: this.createKernelBarrier()
    };

    if ( includeDecoherenceEvents ) {
      parameters.decoherenceEvents = this.decoherenceEvents;
    }

    return parameters;
  }

  private createKernelBarrier(): AnalyticalBarrier {
    if ( this.barrierType !== 'doubleSlit' ) {
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
          coherenceGroup: this.isTopSlitDecoherent ? 'topSlitDetector' : this.getCoherentSlitsGroup()
        },
        {
          source: 'bottomSlit',
          centerY: viewSlitSep / 2,
          width: viewSlitWidth,
          isOpen: this.isBottomSlitOpen,
          coherenceGroup: this.isBottomSlitDecoherent ? 'bottomSlitDetector' : this.getCoherentSlitsGroup()
        }
      ]
    };
  }

  protected getDisplayWaveNumber(): number {
    return 2 * Math.PI * this.displayWavelengths / this.regionWidth;
  }

  protected getGridCellX( gridX: number ): number {
    const barrierIx = roundSymmetric( this.barrierFractionX * this.gridWidth );
    return this.barrierType === 'doubleSlit' && gridX === barrierIx ?
           this.barrierFractionX * this.regionWidth :
           gridX * this.regionWidth / this.gridWidth;
  }

  protected getGridCellY( gridY: number ): number {
    return ( gridY + 0.5 ) * this.regionHeight / this.gridHeight - this.regionHeight / 2;
  }

  protected getDisplaySlitGeometry(): { viewSlitSep: number; viewSlitWidth: number } {
    return getViewSlitLayout( this.slitSeparation, this.slitSeparationMin, this.slitSeparationMax, this.regionHeight );
  }

  protected abstract createKernelSource(): AnalyticalSource;

  protected abstract getCoherentSlitsGroup(): string;

  protected abstract getDisplaySpeed(): number;
}
