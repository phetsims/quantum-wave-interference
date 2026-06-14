// Copyright 2026, University of Colorado Boulder

/**
 * BaseAnalyticalWaveSolver owns the shared stateful WaveSolver adapter behavior for analytical solvers.
 * Subclasses provide the source model and any screen-specific detector/projection state.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Complex from '../../../../dot/js/Complex.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import { getDisplaySlitLayout } from '../getDisplaySlitLayout.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { computeSampleIntensity, getRepresentativeComplex } from './AnalyticalFieldSample.js';
import { evaluateAnalyticalSample, evaluateAnalyticalSamples } from './AnalyticalWaveKernel.js';
import { type AnalyticalBarrier, type AnalyticalSource, type AnalyticalWaveParameters, type DecoherenceEvent, type FieldSample, type LayeredFieldSample } from './AnalyticalWaveKernelTypes.js';
import { type BarrierType } from './BarrierType.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;
const DISPLAY_WAVELENGTHS = QuantumWaveInterferenceConstants.DISPLAY_WAVELENGTHS;

// Shared sentinel samples used for grid cells the source wave has not reached yet.
const UNREACHED_SAMPLE: FieldSample = { kind: 'unreached' };
const UNREACHED_LAYERED_SAMPLE: LayeredFieldSample = { kind: 'unreached' };

export default abstract class BaseAnalyticalWaveSolver implements WaveSolver {

  /**
   * Number of horizontal cells in the cached visualization grid.
   */
  public readonly gridWidth: number;

  /**
   * Number of vertical cells in the cached visualization grid and detector distribution.
   */
  public readonly gridHeight: number;

  /**
   * Fallback number of display wavelengths across the wave region when caller parameters do not override it.
   * TODO: Do caller parameters sometimes override it? If so, keep it! If not, delete all this indirection. https://github.com/phetsims/quantum-wave-interference/issues/135
   */
  public readonly defaultDisplayWavelengths = DISPLAY_WAVELENGTHS;

  /**
   * Effective physical wavelength in meters. Scene models update this from the selected particle or light source.
   */
  private wavelength = QuantumWaveInterferenceConstants.DEFAULT_PHOTON_WAVELENGTH_NM * 1e-9;

  /**
   * Effective physical propagation speed in meters per second.
   */
  private waveSpeed = QuantumWaveInterferenceConstants.SPEED_OF_LIGHT;

  /**
   * Ratio between the current physical speed and the screen's default speed, used to scale display-time propagation.
   */
  protected displaySpeedScale = 1;

  /**
   * Number of wavelengths shown across the solver region in display coordinates.
   */
  private displayWavelengths = DISPLAY_WAVELENGTHS;

  /**
   * Active barrier configuration for kernel sampling.
   */
  private barrierType: BarrierType = 'none';

  /**
   * Physical center-to-center slit separation in meters.
   */
  private slitSeparation = 0.25e-3;

  /**
   * Minimum physical center-to-center slit separation in meters, used for display-coordinate scaling.
   */
  private slitSeparationMin = 0.25e-3;

  /**
   * Maximum physical center-to-center slit separation in meters, used for display-coordinate scaling.
   */
  private slitSeparationMax = 3e-3;

  /**
   * Physical slit aperture width in meters.
   */
  private slitWidth = 0.02e-3;

  /**
   * Horizontal barrier position as a fraction of regionWidth.
   */
  private barrierFractionX = 0.5;

  /**
   * Whether the upper slit aperture passes the field.
   */
  private isTopSlitOpen = true;

  /**
   * Whether the lower slit aperture passes the field.
   */
  private isBottomSlitOpen = true;

  /**
   * Whether the upper slit is treated as decohered from coherent open slits.
   */
  private isTopSlitDecoherent = false;

  /**
   * Whether the lower slit is treated as decohered from coherent open slits.
   */
  private isBottomSlitDecoherent = false;

  /**
   * Whether the source is currently emitting into the solver region.
   */
  protected isSourceOn = false;

  /**
   * Width of the solver region in display-model coordinates.
   */
  protected regionWidth = 1.0;

  /**
   * Height of the solver region in display-model coordinates.
   */
  protected regionHeight = 1.0;

  /**
   * Current solver time in model seconds.
   */
  protected time = 0;

  /**
   * Cached complex amplitude grid stored as interleaved real and imaginary components.
   */
  private readonly amplitudeField: Float64Array;

  /**
   * Cached model-facing field samples for each grid cell at the current solver time.
   */
  private readonly fieldSamples: FieldSample[];

  /**
   * Cached renderer-facing layered field samples for each grid cell when a subclass supports layered samples.
   */
  private readonly layeredFieldSamples: LayeredFieldSample[];

  /**
   * Cached normalized detector probability distribution at the detector edge.
   */
  protected readonly detectorDistribution: Float64Array;

  /**
   * Reusable buffer for detector distributions requested at a non-native sample count.
   */
  private sampledDetectorDistribution: Float64Array | null = null;

  /**
   * Time-ordered which-path detector records that the analytical kernel applies to field samples.
   */
  protected decoherenceEvents: readonly DecoherenceEvent[] = [];

  /**
   * Whether cached field and detector data must be recomputed before the next read.
   */
  protected dirty = true;

  /**
   * Creates a base analytical solver and allocates all shared grid and detector caches.
   *
   * @param gridWidth - Number of grid cells in the horizontal direction.
   * @param gridHeight - Number of grid cells in the vertical direction.
   */
  protected constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.fieldSamples = new Array<FieldSample>( gridWidth * gridHeight ).fill( UNREACHED_SAMPLE );
    this.layeredFieldSamples = new Array<LayeredFieldSample>( gridWidth * gridHeight ).fill( UNREACHED_LAYERED_SAMPLE );
    this.detectorDistribution = new Float64Array( gridHeight );
  }

  /**
   * Applies a parameter value only when the caller supplied one. setParameters() uses this so omitted fields leave
   * existing solver state unchanged.
   *
   * @param value - Optional value from the parameter update.
   * @param setter - Callback that stores the value when it is defined.
   */
  protected setIfDefined<T>( value: T | undefined, setter: ( value: T ) => void ): void {
    if ( value !== undefined ) {
      setter( value );
    }
  }

  /**
   * Applies partial scene parameters to the solver and invalidates cached samples. Undefined fields are ignored so
   * scene models can send focused updates without restating the full solver configuration.
   *
   * @param params - Partial solver parameter update.
   */
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

  /**
   * Updates source-emission state. Subclasses override this to manage state tied to source transitions, such as
   * wavefront start time or detector accumulators.
   *
   * @param isSourceOn - Whether the source should emit into the solver region.
   */
  protected setSourceOn( isSourceOn: boolean ): void {
    this.isSourceOn = isSourceOn;
  }

  /**
   * Advances solver time and marks cached samples dirty so the next read reflects the new time.
   *
   * @param dt - Time step in model seconds.
   */
  public step( dt: number ): void {
    this.time += dt;
    this.dirty = true;
  }

  /**
   * Gets the current solver time.
   *
   * @returns Current solver time in model seconds.
   */
  public getTime(): number {
    return this.time;
  }

  /**
   * Recomputes cached field data when it is dirty. Subclasses override this when detector caches must be recomputed
   * with the field cache.
   */
  protected ensureComputed(): void {
    if ( this.dirty ) {
      this.computeField();
      this.dirty = false;
    }
  }

  /**
   * Gets the cached complex amplitude grid, recomputing it first if needed. Values are stored as real/imaginary pairs
   * in row-major grid-cell order.
   *
   * @returns Interleaved real and imaginary amplitude values for the visualization grid.
   */
  public getAmplitudeField(): Float64Array {
    this.ensureComputed();
    return this.amplitudeField;
  }

  /**
   * Gets the analytical field sample for a grid cell at the current solver time.
   *
   * @param gridX - Horizontal grid-cell index.
   * @param gridY - Vertical grid-cell index.
   * @returns Field sample for the requested grid cell, or an unreached sample when the index is outside the cache.
   */
  public getFieldSampleAtGridCell( gridX: number, gridY: number ): FieldSample {
    this.ensureComputed();
    return this.fieldSamples[ gridY * this.gridWidth + gridX ] || UNREACHED_SAMPLE;
  }

  /**
   * Reports whether cached layered samples are meaningful for this solver. The base solver can synthesize a single
   * opaque layer from ordinary field samples, so subclasses opt in only when they need independent renderer layers.
   *
   * @returns false for the base implementation.
   */
  public usesLayeredFieldSamples(): boolean {
    return false;
  }

  /**
   * Gets the layered analytical field sample for a grid cell. Subclasses that use layered samples return their cache;
   * otherwise this adapts the ordinary field sample into a one-layer representation.
   *
   * @param gridX - Horizontal grid-cell index.
   * @param gridY - Vertical grid-cell index.
   * @returns Layered field sample for the requested grid cell.
   */
  public getLayeredFieldSampleAtGridCell( gridX: number, gridY: number ): LayeredFieldSample {
    this.ensureComputed();
    const cellIndex = gridY * this.gridWidth + gridX;
    if ( this.usesLayeredFieldSamples() ) {
      return this.layeredFieldSamples[ cellIndex ] || UNREACHED_LAYERED_SAMPLE;
    }

    const sample = this.fieldSamples[ cellIndex ] || UNREACHED_SAMPLE;
    return sample.kind === 'field' ? {
      kind: 'field',
      layers: [ {
        order: 0,
        alpha: 1,
        components: sample.components
      } ]
    } : sample;
  }

  /**
   * Gets the normalized detector probability distribution at the current solver time. Requests at the native grid
   * height return the solver's shared detector buffer; other sample counts use a resampled reusable buffer.
   *
   * @param sampleCount - Number of detector rows to sample.
   * @returns Normalized detector probability distribution.
   */
  public getDetectorProbabilityDistribution( sampleCount = this.gridHeight ): Float64Array {
    if ( sampleCount !== this.gridHeight ) {
      return this.getSampledDetectorProbabilityDistribution( sampleCount );
    }

    this.ensureComputed();
    return this.detectorDistribution;
  }

  /**
   * Gets a normalized detector probability distribution sampled at a caller-specified row count.
   *
   * @param sampleCount - Number of detector rows to sample.
   * @returns Reusable buffer containing the normalized detector distribution.
   */
  protected getSampledDetectorProbabilityDistribution( sampleCount: number ): Float64Array {
    if ( !this.sampledDetectorDistribution || this.sampledDetectorDistribution.length !== sampleCount ) {
      this.sampledDetectorDistribution = new Float64Array( sampleCount );
    }

    this.computeNormalizedDetectorDistribution( this.sampledDetectorDistribution );
    return this.sampledDetectorDistribution;
  }

  /**
   * Samples detector-edge intensity into a provided buffer and normalizes it by the maximum sampled probability.
   *
   * @param distribution - Buffer to overwrite with normalized detector probabilities.
   * @param updateBeforeSampling - Whether subclass detector-sampling hooks should run before evaluation.
   */
  protected computeNormalizedDetectorDistribution( distribution: Float64Array, updateBeforeSampling = true ): void {
    if ( !this.isSourceOn ) {
      distribution.fill( 0 );
      return;
    }

    if ( updateBeforeSampling ) {
      this.beforeDetectorDistributionSampling();
    }

    const sampleCount = distribution.length;
    const parameters = this.createKernelParameters( false );
    const dy = this.regionHeight / sampleCount;
    let maxProb = 0;

    for ( let iy = 0; iy < sampleCount; iy++ ) {
      const y = ( iy + 0.5 ) * dy - this.regionHeight / 2;
      const prob = computeSampleIntensity( evaluateAnalyticalSample( parameters, this.regionWidth, y, this.time ) );
      distribution[ iy ] = prob;
      maxProb = Math.max( maxProb, prob );
    }

    this.normalizeDetectorDistribution( distribution, maxProb );
  }

  /**
   * Normalizes a detector distribution in place by its maximum probability.
   *
   * @param distribution - Detector distribution to normalize.
   * @param maxProb - Maximum unnormalized probability in the distribution.
   */
  protected normalizeDetectorDistribution( distribution: Float64Array, maxProb: number ): void {
    if ( maxProb > 0 ) {
      for ( let i = 0; i < distribution.length; i++ ) {
        distribution[ i ] /= maxProb;
      }
    }
  }

  /**
   * Hook called immediately before detector-edge samples are evaluated. Subclasses use this to update derived state
   * that depends on the current sampling time.
   */
  protected beforeDetectorDistributionSampling(): void {
    // Hook for subclasses that update state before detector-edge sampling.
  }

  /**
   * Gets the propagation speed used for display-coordinate wave motion.
   *
   * @returns Display-model propagation speed from the subclass source model.
   */
  public getDisplayPropagationSpeed(): number {
    return this.getDisplaySpeed();
  }

  /**
   * Restores shared solver state to its initial values and clears all cached field and detector data.
   */
  public reset(): void {
    this.time = 0;
    this.isSourceOn = false;
    this.amplitudeField.fill( 0 );
    this.fieldSamples.fill( UNREACHED_SAMPLE );
    this.layeredFieldSamples.fill( UNREACHED_LAYERED_SAMPLE );
    this.detectorDistribution.fill( 0 );
    this.dirty = true;
  }

  /**
   * Marks cached samples dirty so the next query recomputes field and detector data.
   */
  public invalidate(): void {
    this.dirty = true;
  }

  /**
   * Gets a serializable snapshot of subclass-specific solver state.
   *
   * @returns Solver state for PhET-iO state save/restore.
   */
  public abstract getState(): WaveSolverState;

  /**
   * Restores subclass-specific solver state and invalidates any affected caches.
   *
   * @param state - Serialized wave solver state to restore.
   */
  public abstract setState( state: WaveSolverState ): void;

  /**
   * Applies a detector-probe measurement projection. Continuous analytical solvers have no projection state, so this
   * base implementation is intentionally empty; packet solvers override it.
   *
   * @param _centerNorm - Projection center in normalized wave-region coordinates.
   * @param _radiusNorm - Projection radius as a fraction of wave-region width.
   */
  public applyMeasurementProjection( _centerNorm: Vector2, _radiusNorm: number ): void {
    // No-op by default. Packet solvers override this for detector-probe projections.
  }

  /**
   * Evaluates the analytical field at continuous model coordinates and reduces it to the legacy representative complex
   * value used by the WaveSolver API.
   *
   * @param x - Horizontal model coordinate measured from the source side of the wave region.
   * @param y - Vertical model coordinate with y = 0 at the center of the wave region.
   * @param t - Solver time to evaluate, in model seconds.
   * @returns Representative complex amplitude at the requested coordinates and time.
   */
  public evaluate( x: number, y: number, t = this.time ): Complex {
    this.ensureComputed();
    return getRepresentativeComplex( evaluateAnalyticalSample( this.createKernelParameters(), x, y, t ) );
  }

  /**
   * Recomputes the cached amplitude and field-sample grids at the current solver time. When the source is off, all
   * shared grid caches are cleared and subclass-specific field caches can be cleared by hook.
   */
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
    const usesLayeredFieldSamples = this.usesLayeredFieldSamples();
    this.beforeFieldSampleLoop( parameters );

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = this.getGridCellX( ix );
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const y = this.getGridCellY( iy );
        const cellIndex = iy * gridWidth + ix;
        const idx = cellIndex * 2;
        const samples = usesLayeredFieldSamples ? evaluateAnalyticalSamples( parameters, x, y, this.time ) : null;
        const sample = samples ? samples.sample : evaluateAnalyticalSample( parameters, x, y, this.time );
        const value = getRepresentativeComplex( sample );

        fieldSamples[ cellIndex ] = sample;
        if ( samples ) {
          layeredFieldSamples[ cellIndex ] = samples.layeredSample;
        }
        amplitudeField[ idx ] = value.real;
        amplitudeField[ idx + 1 ] = value.imaginary;
      }
    }
  }

  /**
   * Hook called when computeField() clears the shared grid caches because the source is off. Subclasses use this to
   * clear additional caches that are not owned by the base solver.
   */
  protected clearAdditionalFieldStateWhenSourceOff(): void {
    // Hook for subclasses with additional display caches.
  }

  /**
   * Hook called after kernel parameters are created and before the grid field samples are evaluated.
   *
   * @param _parameters - Analytical-kernel parameters that will be used for field sampling.
   */
  protected beforeFieldSampleLoop( _parameters: AnalyticalWaveParameters ): void {
    // Hook for subclasses that update source/projection parameters before sampling.
  }

  /**
   * Creates the analytical-kernel parameter object for the current solver state.
   *
   * @param includeDecoherenceEvents - Whether which-path detector records should be included.
   * @returns Source, barrier, and optional decoherence data for analytical field evaluation.
   */
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

  /**
   * Creates the analytical-kernel barrier definition from the current slit and decoherence state.
   *
   * @returns Barrier description for analytical field evaluation.
   */
  private createKernelBarrier(): AnalyticalBarrier {
    if ( this.barrierType !== 'doubleSlit' ) {
      return { kind: 'none' };
    }

    const { displaySlitSeparation, displaySlitWidth } = this.getDisplaySlitGeometry();
    return {
      kind: 'doubleSlit',
      barrierX: this.barrierFractionX * this.regionWidth,
      slits: [
        {
          source: 'topSlit',
          centerY: -displaySlitSeparation / 2,
          width: displaySlitWidth,
          isOpen: this.isTopSlitOpen,
          coherenceGroup: this.isTopSlitDecoherent ? 'topSlitDetector' : this.getCoherentSlitsGroup()
        },
        {
          source: 'bottomSlit',
          centerY: displaySlitSeparation / 2,
          width: displaySlitWidth,
          isOpen: this.isBottomSlitOpen,
          coherenceGroup: this.isBottomSlitDecoherent ? 'bottomSlitDetector' : this.getCoherentSlitsGroup()
        }
      ]
    };
  }

  /**
   * Gets the display-scale wave number for the current region width and wavelength count.
   *
   * @returns Wave number in radians per display-model distance unit.
   */
  protected getDisplayWaveNumber(): number {
    return 2 * Math.PI * this.displayWavelengths / this.regionWidth;
  }

  /**
   * Converts a horizontal grid-cell index to a display-model x coordinate. The cell aligned with the barrier is
   * snapped exactly to barrierFractionX so barrier samples are evaluated on the aperture plane.
   *
   * @param gridX - Horizontal grid-cell index.
   * @returns Horizontal display-model coordinate for the grid-cell sample.
   */
  protected getGridCellX( gridX: number ): number {
    const barrierIx = roundSymmetric( this.barrierFractionX * this.gridWidth );
    return this.barrierType === 'doubleSlit' && gridX === barrierIx ?
           this.barrierFractionX * this.regionWidth :
           gridX * this.regionWidth / this.gridWidth;
  }

  /**
   * Converts a vertical grid-cell index to a display-model y coordinate centered on the wave region.
   *
   * @param gridY - Vertical grid-cell index.
   * @returns Vertical display-model coordinate for the grid-cell sample.
   */
  protected getGridCellY( gridY: number ): number {
    return ( gridY + 0.5 ) * this.regionHeight / this.gridHeight - this.regionHeight / 2;
  }

  /**
   * Gets slit geometry in display-model coordinates by mapping the physical slit controls into the current region.
   *
   * @returns Display-coordinate slit separation and aperture width.
   */
  private getDisplaySlitGeometry(): { displaySlitSeparation: number; displaySlitWidth: number } {
    return getDisplaySlitLayout( this.slitSeparation, this.slitSeparationMin, this.slitSeparationMax, this.regionHeight );
  }

  /**
   * Creates the analytical-kernel source definition for the subclass's wave model.
   *
   * @returns Source description for analytical field evaluation.
   */
  protected abstract createKernelSource(): AnalyticalSource;

  /**
   * Gets the coherence-group identifier shared by coherent open slits for the subclass's source model.
   *
   * @returns Coherence-group identifier used by analytical-kernel slit components.
   */
  protected abstract getCoherentSlitsGroup(): string;

  /**
   * Gets the subclass's propagation speed in display-model coordinates.
   *
   * @returns Display-model propagation speed.
   */
  protected abstract getDisplaySpeed(): number;
}
