// Copyright 2026, University of Colorado Boulder

/**
 * GPUWavePacketSolver evolves a Gaussian wave packet on a 2D lattice using WebGL2 fragment
 * shaders. Implements the WaveSolver interface as a drop-in replacement for
 * LatticeWavePacketSolver with a configurable visible resolution (default 256x256) and
 * GPU-accelerated display rendering.
 *
 * Two propagation schemes are used depending on particle type:
 *
 * - **Modified Richardson** (electrons, neutrons, helium): Solves the Schrödinger equation
 *   using 8 directional sweeps per substep with complex-valued α/β coefficients. The
 *   wavefunction is intrinsically complex (Re + Im), and the dispersion relation ω = ℏk²/2m
 *   is dispersive — wave packets spread as they propagate, which is physically correct for
 *   massive particles.
 *
 * - **Classical wave FDTD** (photons): Solves the classical wave equation
 *   ψ(t+1) = 2ψ(t) − ψ(t−1) + c²∇²ψ(t) using a second-order central-difference scheme.
 *   The wavefunction is real-valued (imaginary part stays zero), and the dispersion relation
 *   ω = c|k| is non-dispersive — wave packets maintain their shape as they propagate, which
 *   is physically correct for light in vacuum. Requires 3 time levels (current, previous,
 *   output) instead of Richardson's 2 ping-pong textures. This matches the legacy Java QWI's
 *   ClassicalWavePropagator and the CPU LatticeWaveSolver.
 *
 * Key techniques ported from the legacy Java QWI simulation:
 *
 * - Two-wave absorptive barrier: a second "source" wavefunction evolves without the barrier,
 *   and after each substep the pre-barrier (gun-side) region of the actual wavefunction is
 *   overwritten with the source values, suppressing back-reflections from the slit barrier.
 *
 * - Offscreen damping layer: the simulation grid is extended by a DAMPING_MARGIN on all four
 *   sides beyond the visible region, so the boundary-absorbing layer is never rendered.
 *
 * - Per-frame (not per-substep) detector column readback, to avoid GPU-CPU sync stalls.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import { getViewSlitLayout } from './getViewSlitLayout.js';
import { type ObstacleType } from './ObstacleType.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';
import { type SourceType } from './SourceType.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';
import GPUContext from './gpu/GPUContext.js';
import { BARRIER_FRAG } from './gpu/RichardsonShaders.js';
import { CLEANUP_FRAG } from './gpu/RichardsonShaders.js';
import { DAMPING_FRAG } from './gpu/RichardsonShaders.js';
import { DISPLAY_FRAG } from './gpu/RichardsonShaders.js';
import { FULLSCREEN_VERT } from './gpu/RichardsonShaders.js';
import { RICHARDSON_STEP_FRAG } from './gpu/RichardsonShaders.js';

// Richardson epsilon — matches CPU LatticeWavePacketSolver's value. Larger values propagate
// faster per substep but amplify the Modified-Richardson dispersion error.
const GPU_EPSILON = 0.5;

// Visible wavelengths across the visible region, matching LatticeWavePacketSolver / analytical.
const DISPLAY_WAVELENGTHS = 30;

// Initial Gaussian packet parameters as fractions of the visible region.
const PACKET_SIGMA_FRACTION = 0.1;
const PACKET_X0_FRACTION = 0.1;

// Target wall-clock traversal time across the visible region, matching the analytical solver.
const TRAVERSAL_TIME_SECONDS = 1.5;

// Fraction of visible size used as the offscreen damping margin on each side (matches Java's
// 10-cell damping at 100x100 = 10% margin).
const DAMPING_MARGIN_FRACTION = 0.5;

const NEGATIVE_PHOTON_SCALE = 0.3;

const BARRIER_THICKNESS_AT_200 = 6;

type UniformLocations = Record<string, WebGLUniformLocation | null>;
type PingPongResources = {
  inputTex: WebGLTexture;
  outputFBO: WebGLFramebuffer;
};

export default class GPUWavePacketSolver implements WaveSolver {

  public readonly gridWidth: number;
  public readonly gridHeight: number;

  public readonly totalSize: number;
  public readonly dampingMargin: number;
  private readonly barrierThickness: number;
  private readonly substepsPerSecond: number;
  private readonly amplitudeScale: number;

  private readonly gpu: GPUContext;
  public readonly canvas: HTMLCanvasElement;

  // Ping-pong wavefunction textures for the "actual" wave (with barrier).
  private readonly actualTexA: WebGLTexture;
  private readonly actualTexB: WebGLTexture;
  private readonly actualFboA: WebGLFramebuffer;
  private readonly actualFboB: WebGLFramebuffer;
  private actualReadFromA = true;

  // Ping-pong wavefunction textures for the "source" wave (propagates without the barrier).
  // Used by the two-wave absorptive trick to suppress barrier back-reflections.
  private readonly sourceTexA: WebGLTexture;
  private readonly sourceTexB: WebGLTexture;
  private readonly sourceFboA: WebGLFramebuffer;
  private readonly sourceFboB: WebGLFramebuffer;
  private sourceReadFromA = true;

  // Static textures (one cell per grid point, covering the full TOTAL_SIZE grid including margin)
  private readonly barrierTex: WebGLTexture;
  private readonly dampingTex: WebGLTexture;

  // Shader programs and cached uniform locations
  private readonly richardsonProgram: WebGLProgram;
  private readonly richardsonUniforms: UniformLocations;
  private readonly barrierProgram: WebGLProgram;
  private readonly barrierUniforms: UniformLocations;
  private readonly dampingProgram: WebGLProgram;
  private readonly dampingUniforms: UniformLocations;
  private readonly cleanupProgram: WebGLProgram;
  private readonly cleanupUniforms: UniformLocations;
  private readonly displayProgram: WebGLProgram;
  private readonly displayUniforms: UniformLocations;

  // Richardson alpha/beta constants
  private readonly alphaRe: number;
  private readonly alphaIm: number;
  private readonly betaRe: number;
  private readonly betaIm: number;

  // Solver parameters
  private obstacleType: ObstacleType = 'none';
  private slitSeparation = 0.25e-3;
  private slitSeparationMin = 0;
  private slitSeparationMax = 1;
  private slitWidth = 0.02e-3;
  private barrierFractionX = 0.5;
  private isTopSlitOpen = true;
  private isBottomSlitOpen = true;
  private isSourceOn = false;
  private regionWidth = 8e-6;
  private regionHeight = 8e-6;

  // Current barrier x index in the extended grid (used for the cleanup shader's source-copy region)
  private barrierIxTotal: number;

  // State flags
  private barrierDirty = true;
  private amplitudeFieldDirty = true;

  // Detector distribution (sized to visible region)
  private readonly detectorDistribution: Float64Array;
  private readonly detectorAccumulator: Float64Array;
  private detectorAccumulatorCount = 0;

  // Readback buffers
  private readonly amplitudeFieldF64: Float64Array;
  private readonly detectorColumnBuffer: Float32Array;
  private readonly visibleReadbackBuffer: Float32Array;
  private readonly fullGridScratch: Float32Array;

  public constructor() {
    this.gridWidth = QuantumWaveInterferenceQueryParameters.gpuLatticeSize;
    this.gridHeight = this.gridWidth;

    this.dampingMargin = roundSymmetric( DAMPING_MARGIN_FRACTION * this.gridWidth );
    this.totalSize = this.gridWidth + 2 * this.dampingMargin;

    // Calibrate substeps per second so the visible traversal time matches the analytical solver.
    // Group velocity per substep = ε * k, with k = 2π * DISPLAY_WAVELENGTHS / VISIBLE_SIZE.
    // Time to traverse the visible region = VISIBLE_SIZE / (group velocity per substep * substepsPerSecond).
    const k = 2 * Math.PI * DISPLAY_WAVELENGTHS / this.gridWidth;
    this.substepsPerSecond = this.gridWidth / ( GPU_EPSILON * k * TRAVERSAL_TIME_SECONDS );

    // Scale barrier thickness to match visible-cell scale of the CPU reference (6 cells at 200).
    this.barrierThickness = Math.max( 1, roundSymmetric( BARRIER_THICKNESS_AT_200 * this.gridWidth / 200 ) );

    // Amplitude scale for display — inverse of the peak of the initial normalized Gaussian.
    // Peak |ψ|² ≈ 1/(2π σ²), so scale = sqrt(2π σ²) = σ√(2π) makes peak |ψ_scaled| ≈ 1.
    const sigma = PACKET_SIGMA_FRACTION * this.gridWidth;
    this.amplitudeScale = Math.sqrt( 2 * Math.PI * sigma * sigma );

    // In dev mode the canvas is sized to the full grid so renderFullGrid() can show damping margins.
    const canvasSize = phet.chipper.queryParameters.dev ? this.totalSize : this.gridWidth;
    this.gpu = new GPUContext( canvasSize, canvasSize );
    this.canvas = this.gpu.canvas;
    const { gl } = this.gpu;

    // Compile shaders
    this.richardsonProgram = this.gpu.compileProgram( FULLSCREEN_VERT, RICHARDSON_STEP_FRAG );
    this.barrierProgram = this.gpu.compileProgram( FULLSCREEN_VERT, BARRIER_FRAG );
    this.dampingProgram = this.gpu.compileProgram( FULLSCREEN_VERT, DAMPING_FRAG );
    this.cleanupProgram = this.gpu.compileProgram( FULLSCREEN_VERT, CLEANUP_FRAG );
    this.displayProgram = this.gpu.compileProgram( FULLSCREEN_VERT, DISPLAY_FRAG );

    // Cache uniform locations
    this.richardsonUniforms = this.getUniforms( this.richardsonProgram,
      [ 'u_psi', 'u_direction', 'u_alpha', 'u_beta' ] );
    this.barrierUniforms = this.getUniforms( this.barrierProgram, [ 'u_psi', 'u_barrier' ] );
    this.dampingUniforms = this.getUniforms( this.dampingProgram, [ 'u_psi', 'u_damping' ] );
    this.cleanupUniforms = this.getUniforms( this.cleanupProgram,
      [ 'u_actual', 'u_source', 'u_damping', 'u_barrierIx' ] );
    this.displayUniforms = this.getUniforms( this.displayProgram,
      [ 'u_psi', 'u_damping', 'u_displayMode', 'u_showDamping', 'u_baseColor', 'u_negColor', 'u_amplitudeScale', 'u_sampleOffset' ] );

    // Set static sampler unit bindings
    gl.useProgram( this.richardsonProgram );
    gl.uniform1i( this.richardsonUniforms.u_psi, 0 );
    gl.useProgram( this.barrierProgram );
    gl.uniform1i( this.barrierUniforms.u_psi, 0 );
    gl.uniform1i( this.barrierUniforms.u_barrier, 1 );
    gl.useProgram( this.dampingProgram );
    gl.uniform1i( this.dampingUniforms.u_psi, 0 );
    gl.uniform1i( this.dampingUniforms.u_damping, 1 );
    gl.useProgram( this.cleanupProgram );
    gl.uniform1i( this.cleanupUniforms.u_actual, 0 );
    gl.uniform1i( this.cleanupUniforms.u_source, 1 );
    gl.uniform1i( this.cleanupUniforms.u_damping, 2 );
    gl.useProgram( this.displayProgram );
    gl.uniform1i( this.displayUniforms.u_psi, 0 );
    gl.uniform1i( this.displayUniforms.u_damping, 1 );
    gl.uniform1i( this.displayUniforms.u_showDamping, 0 );

    // Create actual + source ping-pong textures and FBOs at TOTAL_SIZE.
    this.actualTexA = this.gpu.createRG32FTexture( this.totalSize, this.totalSize );
    this.actualTexB = this.gpu.createRG32FTexture( this.totalSize, this.totalSize );
    this.actualFboA = this.gpu.createFBO( this.actualTexA );
    this.actualFboB = this.gpu.createFBO( this.actualTexB );

    this.sourceTexA = this.gpu.createRG32FTexture( this.totalSize, this.totalSize );
    this.sourceTexB = this.gpu.createRG32FTexture( this.totalSize, this.totalSize );
    this.sourceFboA = this.gpu.createFBO( this.sourceTexA );
    this.sourceFboB = this.gpu.createFBO( this.sourceTexB );

    // Create barrier and damping textures at TOTAL_SIZE.
    this.barrierTex = this.gpu.createR8Texture( this.totalSize, this.totalSize );
    this.dampingTex = this.gpu.createR32FTexture( this.totalSize, this.totalSize );

    // Modified Richardson constants
    this.alphaRe = 0.5 + 0.5 * Math.cos( GPU_EPSILON / 2 );
    this.alphaIm = -0.5 * Math.sin( GPU_EPSILON / 2 );
    const sinEps4 = Math.sin( GPU_EPSILON / 4 );
    this.betaRe = sinEps4 * sinEps4;
    this.betaIm = 0.5 * Math.sin( GPU_EPSILON / 2 );

    // Allocate readback buffers
    const visibleCells = this.gridWidth * this.gridWidth;
    this.detectorDistribution = new Float64Array( this.gridWidth );
    this.detectorAccumulator = new Float64Array( this.gridWidth );
    this.amplitudeFieldF64 = new Float64Array( visibleCells * 2 );
    this.detectorColumnBuffer = new Float32Array( this.gridWidth * 2 );
    this.visibleReadbackBuffer = new Float32Array( visibleCells * 2 );
    this.fullGridScratch = new Float32Array( this.totalSize * this.totalSize * 2 );

    this.barrierIxTotal = this.dampingMargin + roundSymmetric( 0.5 * this.gridWidth );

    this.computeDampingTexture();
    this.initializePacket();
  }

  private getUniforms( program: WebGLProgram, names: string[] ): UniformLocations {
    const result: UniformLocations = {};
    for ( const name of names ) {
      result[ name ] = this.gpu.gl.getUniformLocation( program, name );
    }
    return result;
  }

  private setIfDefined<T>( value: T | undefined, setter: ( value: T ) => void ): void {
    if ( value !== undefined ) {
      setter( value );
    }
  }

  private getPingPongResources(
    readFromA: boolean,
    texA: WebGLTexture,
    texB: WebGLTexture,
    fboA: WebGLFramebuffer,
    fboB: WebGLFramebuffer
  ): PingPongResources {
    return {
      inputTex: readFromA ? texA : texB,
      outputFBO: readFromA ? fboB : fboA
    };
  }

  private getActualPingPongResources(): PingPongResources {
    return this.getPingPongResources(
      this.actualReadFromA,
      this.actualTexA,
      this.actualTexB,
      this.actualFboA,
      this.actualFboB
    );
  }

  private getSourcePingPongResources(): PingPongResources {
    return this.getPingPongResources(
      this.sourceReadFromA,
      this.sourceTexA,
      this.sourceTexB,
      this.sourceFboA,
      this.sourceFboB
    );
  }

  public setParameters( params: WaveSolverParameters ): void {
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
    this.barrierDirty = true;
    this.amplitudeFieldDirty = true;
  }

  public step( dt: number ): void {
    if ( this.barrierDirty ) {
      this.uploadBarrierTexture();
      this.barrierDirty = false;
    }

    const numSubsteps = Math.max( 1, roundSymmetric( dt * this.substepsPerSecond ) );

    for ( let s = 0; s < numSubsteps; s++ ) {
      this.propagateOneStep();
    }

    // One detector readback per frame (not per substep) — avoids GPU-CPU sync stalls.
    this.accumulateDetectorIntensity( numSubsteps );

    this.amplitudeFieldDirty = true;
  }

  /**
   * Full two-wave Richardson substep:
   *   - 8 Richardson sweeps + 1 damping pass on the source wave (no barrier).
   *   - 8 Richardson sweeps with a barrier pass in the middle + 1 cleanup pass on the actual wave.
   * The cleanup pass overwrites the gun-side region of the actual wave with the clean source
   * values (killing back-reflections from the barrier) and applies damping in the same shader.
   *
   * Ping-pong accounting:
   *   - Source: 8 Richardson (8 flips) + 1 damping (1 flip) = 9 flips per substep.
   *   - Actual: 4 Richardson + 1 barrier + 4 Richardson (9 flips) + 1 cleanup (1 flip) = 10 flips per substep.
   * The per-substep source-side flip is tracked by `sourceReadFromA` and toggles every call.
   */
  private propagateOneStep(): void {
    // Source wave: no barrier, just Richardson sweeps + damping.
    this.sourceRichardsonPass( 0, -1 );
    this.sourceRichardsonPass( 0, 1 );
    this.sourceRichardsonPass( 1, 0 );
    this.sourceRichardsonPass( -1, 0 );
    this.sourceRichardsonPass( -1, 0 );
    this.sourceRichardsonPass( 1, 0 );
    this.sourceRichardsonPass( 0, -1 );
    this.sourceRichardsonPass( 0, 1 );
    this.sourceDampingPass();

    // Actual wave: symmetric split with barrier in the middle.
    this.actualRichardsonPass( 0, -1 );
    this.actualRichardsonPass( 0, 1 );
    this.actualRichardsonPass( 1, 0 );
    this.actualRichardsonPass( -1, 0 );
    this.actualBarrierPass();
    this.actualRichardsonPass( -1, 0 );
    this.actualRichardsonPass( 1, 0 );
    this.actualRichardsonPass( 0, -1 );
    this.actualRichardsonPass( 0, 1 );
    this.actualCleanupPass();
  }

  private actualRichardsonPass( dx: number, dy: number ): void {
    const { gl } = this.gpu;
    const { inputTex, outputFBO } = this.getActualPingPongResources();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );

    gl.useProgram( this.richardsonProgram );
    gl.uniform2i( this.richardsonUniforms.u_direction, dx, dy );
    gl.uniform2f( this.richardsonUniforms.u_alpha, this.alphaRe, this.alphaIm );
    gl.uniform2f( this.richardsonUniforms.u_beta, this.betaRe, this.betaIm );

    this.gpu.fullscreenPass( this.richardsonProgram, outputFBO, this.totalSize, this.totalSize );
    this.actualReadFromA = !this.actualReadFromA;
  }

  private sourceRichardsonPass( dx: number, dy: number ): void {
    const { gl } = this.gpu;
    const { inputTex, outputFBO } = this.getSourcePingPongResources();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );

    gl.useProgram( this.richardsonProgram );
    gl.uniform2i( this.richardsonUniforms.u_direction, dx, dy );
    gl.uniform2f( this.richardsonUniforms.u_alpha, this.alphaRe, this.alphaIm );
    gl.uniform2f( this.richardsonUniforms.u_beta, this.betaRe, this.betaIm );

    this.gpu.fullscreenPass( this.richardsonProgram, outputFBO, this.totalSize, this.totalSize );
    this.sourceReadFromA = !this.sourceReadFromA;
  }

  private actualBarrierPass(): void {
    const { gl } = this.gpu;
    const { inputTex, outputFBO } = this.getActualPingPongResources();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, this.barrierTex );

    this.gpu.fullscreenPass( this.barrierProgram, outputFBO, this.totalSize, this.totalSize );
    this.actualReadFromA = !this.actualReadFromA;
  }

  private sourceDampingPass(): void {
    const { gl } = this.gpu;
    const { inputTex, outputFBO } = this.getSourcePingPongResources();

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );

    this.gpu.fullscreenPass( this.dampingProgram, outputFBO, this.totalSize, this.totalSize );
    this.sourceReadFromA = !this.sourceReadFromA;
  }

  private actualCleanupPass(): void {
    const { gl } = this.gpu;
    const actualInput = this.actualReadFromA ? this.actualTexA : this.actualTexB;
    const actualOutputFBO = this.actualReadFromA ? this.actualFboB : this.actualFboA;
    const sourceInput = this.sourceReadFromA ? this.sourceTexA : this.sourceTexB;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, actualInput );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, sourceInput );
    gl.activeTexture( gl.TEXTURE2 );
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );

    gl.useProgram( this.cleanupProgram );
    gl.uniform1i( this.cleanupUniforms.u_barrierIx, this.barrierIxTotal );

    this.gpu.fullscreenPass( this.cleanupProgram, actualOutputFBO, this.totalSize, this.totalSize );
    this.actualReadFromA = !this.actualReadFromA;
  }

  /**
   * Reads the detector column from the actual wavefunction once per frame. The column is sampled
   * just inside the right edge of the visible region. Each cell contributes its |ψ|² weighted by
   * the number of substeps that frame, so the running average approximates what a per-substep
   * sampling would produce but without the per-substep GPU stall.
   */
  private accumulateDetectorIntensity( substepWeight: number ): void {
    const currentFBO = this.actualReadFromA ? this.actualFboA : this.actualFboB;
    const detectorIx = this.dampingMargin + this.gridWidth - 1;
    const yStart = this.dampingMargin;

    this.gpu.readPixelsRG( currentFBO, detectorIx, yStart, 1, this.gridWidth, this.detectorColumnBuffer );

    for ( let iy = 0; iy < this.gridWidth; iy++ ) {
      const re = this.detectorColumnBuffer[ iy * 2 ];
      const im = this.detectorColumnBuffer[ iy * 2 + 1 ];
      this.detectorAccumulator[ iy ] += ( re * re + im * im ) * substepWeight;
    }
    this.detectorAccumulatorCount += substepWeight;
  }

  public getAmplitudeField(): Float64Array {
    if ( this.amplitudeFieldDirty ) {
      const currentFBO = this.actualReadFromA ? this.actualFboA : this.actualFboB;
      // Read just the visible region (not the extended grid).
      this.gpu.readPixelsRG( currentFBO, this.dampingMargin, this.dampingMargin,
        this.gridWidth, this.gridWidth, this.visibleReadbackBuffer );
      for ( let i = 0; i < this.visibleReadbackBuffer.length; i++ ) {
        this.amplitudeFieldF64[ i ] = this.visibleReadbackBuffer[ i ];
      }
      this.amplitudeFieldDirty = false;
    }
    return this.amplitudeFieldF64;
  }

  public getDetectorProbabilityDistribution(): Float64Array {
    this.computeDetectorDistribution();
    return this.detectorDistribution;
  }

  private computeDetectorDistribution(): void {
    if ( this.detectorAccumulatorCount === 0 ) {
      this.detectorDistribution.fill( 0 );
      return;
    }

    let maxProb = 0;
    for ( let iy = 0; iy < this.gridWidth; iy++ ) {
      const avg = this.detectorAccumulator[ iy ] / this.detectorAccumulatorCount;
      this.detectorDistribution[ iy ] = avg;
      maxProb = Math.max( maxProb, avg );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < this.gridWidth; iy++ ) {
        this.detectorDistribution[ iy ] /= maxProb;
      }
    }
  }

  public reset(): void {
    this.detectorAccumulator.fill( 0 );
    this.detectorAccumulatorCount = 0;
    this.detectorDistribution.fill( 0 );
    this.amplitudeFieldF64.fill( 0 );
    this.barrierDirty = true;
    this.amplitudeFieldDirty = true;
    this.actualReadFromA = true;
    this.sourceReadFromA = true;
    this.initializePacket();
  }

  public getState(): WaveSolverState {
    const totalPixels = this.totalSize * this.totalSize;
    const buf = new Float32Array( totalPixels * 2 );

    const actualFbo = this.actualReadFromA ? this.actualFboA : this.actualFboB;
    this.gpu.readPixelsRG( actualFbo, 0, 0, this.totalSize, this.totalSize, buf );
    const actualData = Array.from( buf );

    const sourceFbo = this.sourceReadFromA ? this.sourceFboA : this.sourceFboB;
    this.gpu.readPixelsRG( sourceFbo, 0, 0, this.totalSize, this.totalSize, buf );
    const sourceData = Array.from( buf );

    return {
      actualData: actualData,
      sourceData: sourceData,
      detectorAccumulatorCount: this.detectorAccumulatorCount,
      detectorAccumulator: Array.from( this.detectorAccumulator )
    };
  }

  public setState( state: WaveSolverState ): void {
    const actualBuf = new Float32Array( state.actualData );
    const actualTex = this.actualReadFromA ? this.actualTexA : this.actualTexB;
    this.gpu.uploadRG32F( actualTex, this.totalSize, this.totalSize, actualBuf );

    const sourceBuf = new Float32Array( state.sourceData );
    const sourceTex = this.sourceReadFromA ? this.sourceTexA : this.sourceTexB;
    this.gpu.uploadRG32F( sourceTex, this.totalSize, this.totalSize, sourceBuf );

    this.detectorAccumulatorCount = state.detectorAccumulatorCount;
    this.detectorAccumulator.set( state.detectorAccumulator );
    this.barrierDirty = true;
    this.amplitudeFieldDirty = true;
  }

  public invalidate(): void {
    this.amplitudeFieldDirty = true;
  }

  public hasWavesInRegion(): boolean {
    return true;
  }

  /**
   * Projects the actual and source wavefunctions onto the complement of a disk in normalized
   * visible coordinates, then renormalizes — used when the detector tool measures position.
   * Both wave textures are updated so the source wave stays consistent with the actual.
   */
  public applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    this.applyMeasurementProjectionOnTexture(
      this.actualReadFromA ? this.actualFboA : this.actualFboB,
      this.actualReadFromA ? this.actualTexA : this.actualTexB,
      centerNorm, radiusNorm
    );
    this.applyMeasurementProjectionOnTexture(
      this.sourceReadFromA ? this.sourceFboA : this.sourceFboB,
      this.sourceReadFromA ? this.sourceTexA : this.sourceTexB,
      centerNorm, radiusNorm
    );
    this.amplitudeFieldDirty = true;
  }

  private applyMeasurementProjectionOnTexture( fbo: WebGLFramebuffer, tex: WebGLTexture,
                                               centerNorm: Vector2, radiusNorm: number ): void {
    // Read the full extended grid, project, and upload back. Coordinates are normalized to the
    // visible region, so offset into the extended grid by dampingMargin.
    this.gpu.readPixelsRG( fbo, 0, 0, this.totalSize, this.totalSize, this.fullGridScratch );

    const cxGrid = this.dampingMargin + centerNorm.x * this.gridWidth;
    const cyGrid = this.dampingMargin + centerNorm.y * this.gridWidth;
    const rGrid = radiusNorm * this.gridWidth;
    const rSqGrid = rGrid * rGrid;

    let totalBefore = 0;
    let totalOutside = 0;

    for ( let iy = 0; iy < this.totalSize; iy++ ) {
      const dyCell = iy - cyGrid;
      const dyCellSq = dyCell * dyCell;
      for ( let ix = 0; ix < this.totalSize; ix++ ) {
        const dxCell = ix - cxGrid;
        const idx = ( iy * this.totalSize + ix ) * 2;
        const re = this.fullGridScratch[ idx ];
        const im = this.fullGridScratch[ idx + 1 ];
        const prob = re * re + im * im;
        totalBefore += prob;

        if ( dxCell * dxCell + dyCellSq <= rSqGrid ) {
          this.fullGridScratch[ idx ] = 0;
          this.fullGridScratch[ idx + 1 ] = 0;
        }
        else {
          totalOutside += prob;
        }
      }
    }

    if ( totalOutside > 0 ) {
      const scale = Math.sqrt( totalBefore / totalOutside );
      for ( let i = 0; i < this.fullGridScratch.length; i++ ) {
        this.fullGridScratch[ i ] *= scale;
      }
    }

    this.gpu.uploadRG32F( tex, this.totalSize, this.totalSize, this.fullGridScratch );
  }

  private setupDisplayUniforms( displayMode: WaveDisplayMode, sourceType: SourceType, wavelengthNm: number ): void {
    const { gl } = this.gpu;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, this.actualReadFromA ? this.actualTexA : this.actualTexB );

    gl.useProgram( this.displayProgram );

    const modeIndex = displayMode === 'magnitude' ? 0 :
                      displayMode === 'realPart' ? 1 :
                      displayMode === 'imaginaryPart' ? 2 :
                      displayMode === 'electricField' ? 3 :
                      4; // timeAveragedIntensity
    gl.uniform1i( this.displayUniforms.u_displayMode, modeIndex );
    gl.uniform1f( this.displayUniforms.u_amplitudeScale, this.amplitudeScale );

    let baseR: number;
    let baseG: number;
    let baseB: number;
    let negR: number;
    let negG: number;
    let negB: number;

    if ( sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( wavelengthNm );
      baseR = color.red / 255;
      baseG = color.green / 255;
      baseB = color.blue / 255;
      negR = ( 1 - baseR ) * NEGATIVE_PHOTON_SCALE;
      negG = ( 1 - baseG ) * NEGATIVE_PHOTON_SCALE;
      negB = ( 1 - baseB ) * NEGATIVE_PHOTON_SCALE;
    }
    else {
      baseR = 200 / 255;
      baseG = 200 / 255;
      baseB = 200 / 255;
      negR = 80 / 255;
      negG = 120 / 255;
      negB = 200 / 255;
    }

    gl.uniform3f( this.displayUniforms.u_baseColor, baseR, baseG, baseB );
    gl.uniform3f( this.displayUniforms.u_negColor, negR, negG, negB );
  }

  /**
   * Renders the wavefunction to the WebGL canvas using the display shader, sampling only the
   * visible region (offset by dampingMargin).
   */
  public renderDisplay( displayMode: WaveDisplayMode, sourceType: SourceType, wavelengthNm: number ): void {
    const { gl } = this.gpu;
    this.setupDisplayUniforms( displayMode, sourceType, wavelengthNm );
    gl.uniform2i( this.displayUniforms.u_sampleOffset, this.dampingMargin, this.dampingMargin );
    gl.uniform1i( this.displayUniforms.u_showDamping, 0 );
    this.gpu.fullscreenPass( this.displayProgram, null, this.gridWidth, this.gridWidth );
  }

  /**
   * Renders the entire simulation grid (including damping margins) to the WebGL canvas with a
   * subtle overlay showing damping strength. Dev-mode only.
   */
  public renderFullGrid( displayMode: WaveDisplayMode, sourceType: SourceType, wavelengthNm: number ): void {
    const { gl } = this.gpu;
    this.setupDisplayUniforms( displayMode, sourceType, wavelengthNm );
    gl.uniform2i( this.displayUniforms.u_sampleOffset, 0, 0 );
    gl.uniform1i( this.displayUniforms.u_showDamping, 1 );

    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );

    this.gpu.fullscreenPass( this.displayProgram, null, this.totalSize, this.totalSize );
  }

  /**
   * Initializes the Gaussian wave packet into both the actual and source wave textures on the
   * extended grid. Packet coordinates are specified in visible-region units and offset by
   * dampingMargin to land inside the visible window. Normalized so Σ|ψ|² = 1 over TOTAL_SIZE².
   */
  private initializePacket(): void {
    const data = this.fullGridScratch;
    data.fill( 0 );

    const x0 = this.dampingMargin + PACKET_X0_FRACTION * this.gridWidth;
    const y0 = this.dampingMargin + 0.5 * this.gridWidth;
    const sigma = PACKET_SIGMA_FRACTION * this.gridWidth;
    const invTwoSigmaSq = 1 / ( 2 * sigma * sigma );
    const k = 2 * Math.PI * DISPLAY_WAVELENGTHS / this.gridWidth;

    for ( let iy = 0; iy < this.totalSize; iy++ ) {
      const dy = iy - y0;
      const envY = Math.exp( -dy * dy * invTwoSigmaSq );
      if ( envY < 1e-8 ) { continue; }
      for ( let ix = 0; ix < this.totalSize; ix++ ) {
        const dxx = ix - x0;
        const env = envY * Math.exp( -dxx * dxx * invTwoSigmaSq );
        if ( env < 1e-8 ) { continue; }
        const phase = k * ( ix - this.dampingMargin );
        const idx = ( iy * this.totalSize + ix ) * 2;
        data[ idx ] = env * Math.cos( phase );
        data[ idx + 1 ] = env * Math.sin( phase );
      }
    }

    // Normalize over the whole extended grid.
    let totalProb = 0;
    for ( let i = 0; i < data.length; i += 2 ) {
      totalProb += data[ i ] * data[ i ] + data[ i + 1 ] * data[ i + 1 ];
    }
    if ( totalProb > 0 ) {
      const scale = 1 / Math.sqrt( totalProb );
      for ( let i = 0; i < data.length; i++ ) {
        data[ i ] *= scale;
      }
    }

    // Upload to both actual and source texture A (the initial ping-pong "read" slot).
    this.gpu.uploadRG32F( this.actualTexA, this.totalSize, this.totalSize, data );
    this.gpu.uploadRG32F( this.sourceTexA, this.totalSize, this.totalSize, data );

    // Clear texture B for both ping-pong pairs.
    const zeros = new Float32Array( this.totalSize * this.totalSize * 2 );
    this.gpu.uploadRG32F( this.actualTexB, this.totalSize, this.totalSize, zeros );
    this.gpu.uploadRG32F( this.sourceTexB, this.totalSize, this.totalSize, zeros );

    this.actualReadFromA = true;
    this.sourceReadFromA = true;
  }

  private uploadBarrierTexture(): void {
    const barrierData = new Uint8Array( this.totalSize * this.totalSize );

    // Store the current barrier x for the cleanup shader even when obstacle is 'none'.
    const barrierIxVisible = roundSymmetric( this.barrierFractionX * this.gridWidth );
    this.barrierIxTotal = this.dampingMargin + barrierIxVisible;

    if ( this.obstacleType === 'none' ) {
      this.gpu.uploadR8( this.barrierTex, this.totalSize, this.totalSize, barrierData );
      return;
    }

    const { viewSlitSep, viewSlitWidth } = getViewSlitLayout(
      this.slitSeparation, this.slitSeparationMin, this.slitSeparationMax, this.regionHeight
    );

    const dy = this.regionHeight / this.gridWidth;
    const topSlitCenterY = -viewSlitSep / 2;
    const bottomSlitCenterY = viewSlitSep / 2;
    const halfSlitWidth = viewSlitWidth / 2;

    const halfThickness = this.barrierThickness / 2;
    const barrierStart = Math.max( 0, this.barrierIxTotal - Math.floor( halfThickness ) );
    const barrierEnd = Math.min( this.totalSize - 1, this.barrierIxTotal + Math.ceil( halfThickness ) - 1 );

    // Iterate visible y rows and write into the extended grid, offset by dampingMargin.
    for ( let iyVisible = 0; iyVisible < this.gridWidth; iyVisible++ ) {
      const iyTotal = iyVisible + this.dampingMargin;
      const y = ( iyVisible - this.gridWidth / 2 ) * dy;
      const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitCenterY ) < halfSlitWidth;
      const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitCenterY ) < halfSlitWidth;

      if ( !inTopSlit && !inBottomSlit ) {
        for ( let bx = barrierStart; bx <= barrierEnd; bx++ ) {
          barrierData[ iyTotal * this.totalSize + bx ] = 255;
        }
      }
    }

    // Extend the barrier into the top and bottom damping margin so the wave can't sneak around it.
    for ( let iy = 0; iy < this.dampingMargin; iy++ ) {
      for ( let bx = barrierStart; bx <= barrierEnd; bx++ ) {
        barrierData[ iy * this.totalSize + bx ] = 255;
        barrierData[ ( this.totalSize - 1 - iy ) * this.totalSize + bx ] = 255;
      }
    }

    this.gpu.uploadR8( this.barrierTex, this.totalSize, this.totalSize, barrierData );
  }

  /**
   * Damping coefficient = 1 inside the visible window, falling off quadratically to 0 at the
   * outer edge of the extended grid. This absorbs both the forward-propagating wave leaving the
   * right edge and any back-reflections that leak past the cleanup-shader mask.
   */
  private computeDampingTexture(): void {
    const data = new Float32Array( this.totalSize * this.totalSize );
    data.fill( 1 );

    const { gl } = this.gpu;
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, this.totalSize, this.totalSize, gl.RED, gl.FLOAT, data );
  }
}
