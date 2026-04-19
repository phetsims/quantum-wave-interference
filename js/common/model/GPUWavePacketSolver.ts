// Copyright 2026, University of Colorado Boulder

/**
 * GPUWavePacketSolver evolves a Gaussian wave packet on a 2D lattice using the Modified
 * Richardson scheme, accelerated with WebGL2 fragment shaders. Implements the WaveSolver
 * interface as a drop-in replacement for LatticeWavePacketSolver with higher resolution
 * (512x512 vs 200x200) and GPU-accelerated display rendering.
 *
 * Each timestep runs multiple Richardson substeps on the GPU using ping-pong textures.
 * The wavefunction lives entirely on the GPU; CPU readback occurs only for the detector
 * column (per frame) and full field readback (for measurement projection, rare).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type ObstacleType } from './ObstacleType.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters } from './WaveSolver.js';
import { type SourceType } from './SourceType.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';
import GPUContext from './gpu/GPUContext.js';
import { BARRIER_FRAG } from './gpu/RichardsonShaders.js';
import { DAMPING_FRAG } from './gpu/RichardsonShaders.js';
import { DISPLAY_FRAG } from './gpu/RichardsonShaders.js';
import { FULLSCREEN_VERT } from './gpu/RichardsonShaders.js';
import { RICHARDSON_STEP_FRAG } from './gpu/RichardsonShaders.js';

const GPU_GRID_SIZE = 512;
const GPU_EPSILON = 1.0;
const DISPLAY_WAVELENGTHS = 30;
const PACKET_SIGMA_X_FRACTION = 0.1;
const PACKET_SIGMA_Y_FRACTION = 0.18;
const PACKET_X0_FRACTION = 0.15;

// Substeps per second calibrated so the packet traversal time matches the analytical solver (~1.5s).
// Derived from: SUBSTEPS = gridWidth^2 / (CPU_SUBSTEPS * CPU_gridWidth^2 / CPU_SUBSTEPS) scaled by epsilon ratio.
const SUBSTEPS_PER_SECOND = 930;

const BARRIER_THICKNESS = roundSymmetric( 6 * GPU_GRID_SIZE / 200 );
const DAMPING_THICKNESS = roundSymmetric( 18 * GPU_GRID_SIZE / 200 );

// View-matching constants from DoubleSlitNode
const MIN_VIEW_SEPARATION = 40;
const MAX_VIEW_SEPARATION = 220;
const WAVE_REGION_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const SLIT_VIEW_HEIGHT = 22;

const NEGATIVE_PHOTON_SCALE = 0.3;

const AMPLITUDE_SCALE = Math.sqrt(
  2 * Math.PI * PACKET_SIGMA_X_FRACTION * GPU_GRID_SIZE * PACKET_SIGMA_Y_FRACTION * GPU_GRID_SIZE
);

type UniformLocations = Record<string, WebGLUniformLocation | null>;

export default class GPUWavePacketSolver implements WaveSolver {

  public readonly gridWidth = GPU_GRID_SIZE;
  public readonly gridHeight = GPU_GRID_SIZE;

  private readonly gpu: GPUContext;
  public readonly canvas: HTMLCanvasElement;

  // Ping-pong wavefunction textures and FBOs
  private readonly psiTexA: WebGLTexture;
  private readonly psiTexB: WebGLTexture;
  private readonly fboA: WebGLFramebuffer;
  private readonly fboB: WebGLFramebuffer;
  private readFromA = true;

  // Static textures
  private readonly barrierTex: WebGLTexture;
  private readonly dampingTex: WebGLTexture;

  // Shader programs and cached uniform locations
  private readonly richardsonProgram: WebGLProgram;
  private readonly richardsonUniforms: UniformLocations;
  private readonly barrierProgram: WebGLProgram;
  private readonly barrierUniforms: UniformLocations;
  private readonly dampingProgram: WebGLProgram;
  private readonly dampingUniforms: UniformLocations;
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

  // State flags
  private barrierDirty = true;
  private amplitudeFieldDirty = true;

  // Detector distribution
  private readonly detectorDistribution: Float64Array;
  private readonly detectorAccumulator: Float64Array;
  private detectorAccumulatorCount = 0;

  // Readback buffers
  private readonly amplitudeFieldF64: Float64Array;
  private readonly columnReadbackBuffer: Float32Array;
  private readonly fullReadbackBuffer: Float32Array;

  public constructor() {
    this.gpu = new GPUContext( GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.canvas = this.gpu.canvas;
    const { gl } = this.gpu;

    // Compile shaders
    this.richardsonProgram = this.gpu.compileProgram( FULLSCREEN_VERT, RICHARDSON_STEP_FRAG );
    this.barrierProgram = this.gpu.compileProgram( FULLSCREEN_VERT, BARRIER_FRAG );
    this.dampingProgram = this.gpu.compileProgram( FULLSCREEN_VERT, DAMPING_FRAG );
    this.displayProgram = this.gpu.compileProgram( FULLSCREEN_VERT, DISPLAY_FRAG );

    // Cache uniform locations
    this.richardsonUniforms = this.getUniforms( this.richardsonProgram,
      [ 'u_psi', 'u_direction', 'u_alpha', 'u_beta' ] );
    this.barrierUniforms = this.getUniforms( this.barrierProgram, [ 'u_psi', 'u_barrier' ] );
    this.dampingUniforms = this.getUniforms( this.dampingProgram, [ 'u_psi', 'u_damping' ] );
    this.displayUniforms = this.getUniforms( this.displayProgram,
      [ 'u_psi', 'u_displayMode', 'u_baseColor', 'u_negColor', 'u_amplitudeScale' ] );

    // Set static sampler unit bindings
    gl.useProgram( this.richardsonProgram );
    gl.uniform1i( this.richardsonUniforms.u_psi, 0 );
    gl.useProgram( this.barrierProgram );
    gl.uniform1i( this.barrierUniforms.u_psi, 0 );
    gl.uniform1i( this.barrierUniforms.u_barrier, 1 );
    gl.useProgram( this.dampingProgram );
    gl.uniform1i( this.dampingUniforms.u_psi, 0 );
    gl.uniform1i( this.dampingUniforms.u_damping, 1 );
    gl.useProgram( this.displayProgram );
    gl.uniform1i( this.displayUniforms.u_psi, 0 );

    // Create psi textures and FBOs
    this.psiTexA = this.gpu.createRG32FTexture( GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.psiTexB = this.gpu.createRG32FTexture( GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.fboA = this.gpu.createFBO( this.psiTexA );
    this.fboB = this.gpu.createFBO( this.psiTexB );

    // Create barrier and damping textures
    this.barrierTex = this.gpu.createR8Texture( GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.dampingTex = this.gpu.createR32FTexture( GPU_GRID_SIZE, GPU_GRID_SIZE );

    // Richardson constants
    this.alphaRe = 0.5 + 0.5 * Math.cos( GPU_EPSILON / 2 );
    this.alphaIm = -0.5 * Math.sin( GPU_EPSILON / 2 );
    const sinEps4 = Math.sin( GPU_EPSILON / 4 );
    this.betaRe = sinEps4 * sinEps4;
    this.betaIm = 0.5 * Math.sin( GPU_EPSILON / 2 );

    // Allocate readback buffers
    const totalCells = GPU_GRID_SIZE * GPU_GRID_SIZE;
    this.detectorDistribution = new Float64Array( GPU_GRID_SIZE );
    this.detectorAccumulator = new Float64Array( GPU_GRID_SIZE );
    this.amplitudeFieldF64 = new Float64Array( totalCells * 2 );
    this.columnReadbackBuffer = new Float32Array( GPU_GRID_SIZE * 2 );
    this.fullReadbackBuffer = new Float32Array( totalCells * 2 );

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

  public setParameters( params: WaveSolverParameters ): void {
    if ( params.obstacleType !== undefined ) { this.obstacleType = params.obstacleType; }
    if ( params.slitSeparation !== undefined ) { this.slitSeparation = params.slitSeparation; }
    if ( params.slitSeparationMin !== undefined ) { this.slitSeparationMin = params.slitSeparationMin; }
    if ( params.slitSeparationMax !== undefined ) { this.slitSeparationMax = params.slitSeparationMax; }
    if ( params.slitWidth !== undefined ) { this.slitWidth = params.slitWidth; }
    if ( params.barrierFractionX !== undefined ) { this.barrierFractionX = params.barrierFractionX; }
    if ( params.isTopSlitOpen !== undefined ) { this.isTopSlitOpen = params.isTopSlitOpen; }
    if ( params.isBottomSlitOpen !== undefined ) { this.isBottomSlitOpen = params.isBottomSlitOpen; }
    if ( params.isSourceOn !== undefined ) { this.isSourceOn = params.isSourceOn; }
    if ( params.regionWidth !== undefined ) { this.regionWidth = params.regionWidth; }
    if ( params.regionHeight !== undefined ) { this.regionHeight = params.regionHeight; }
    this.barrierDirty = true;
    this.amplitudeFieldDirty = true;
  }

  public step( dt: number ): void {
    if ( this.barrierDirty ) {
      this.uploadBarrierTexture();
      this.barrierDirty = false;
    }

    const numSubsteps = Math.max( 1, roundSymmetric( dt * SUBSTEPS_PER_SECOND ) );
    const detectorIx = this.gridWidth - 1 - DAMPING_THICKNESS;

    for ( let s = 0; s < numSubsteps; s++ ) {
      this.propagateOneStep();
      this.accumulateDetectorIntensity( detectorIx );
    }

    this.amplitudeFieldDirty = true;
  }

  private propagateOneStep(): void {
    this.richardsonPass( 0, -1 );
    this.richardsonPass( 0, 1 );
    this.richardsonPass( 1, 0 );
    this.richardsonPass( -1, 0 );
    this.barrierPass();
    this.richardsonPass( -1, 0 );
    this.richardsonPass( 1, 0 );
    this.richardsonPass( 0, -1 );
    this.richardsonPass( 0, 1 );
    this.dampingPass();
  }

  private richardsonPass( dx: number, dy: number ): void {
    const { gl } = this.gpu;
    const inputTex = this.readFromA ? this.psiTexA : this.psiTexB;
    const outputFBO = this.readFromA ? this.fboB : this.fboA;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );

    gl.useProgram( this.richardsonProgram );
    gl.uniform2i( this.richardsonUniforms.u_direction, dx, dy );
    gl.uniform2f( this.richardsonUniforms.u_alpha, this.alphaRe, this.alphaIm );
    gl.uniform2f( this.richardsonUniforms.u_beta, this.betaRe, this.betaIm );

    this.gpu.fullscreenPass( this.richardsonProgram, outputFBO, GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.readFromA = !this.readFromA;
  }

  private barrierPass(): void {
    const { gl } = this.gpu;
    const inputTex = this.readFromA ? this.psiTexA : this.psiTexB;
    const outputFBO = this.readFromA ? this.fboB : this.fboA;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, this.barrierTex );

    this.gpu.fullscreenPass( this.barrierProgram, outputFBO, GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.readFromA = !this.readFromA;
  }

  private dampingPass(): void {
    const { gl } = this.gpu;
    const inputTex = this.readFromA ? this.psiTexA : this.psiTexB;
    const outputFBO = this.readFromA ? this.fboB : this.fboA;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, inputTex );
    gl.activeTexture( gl.TEXTURE1 );
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );

    this.gpu.fullscreenPass( this.dampingProgram, outputFBO, GPU_GRID_SIZE, GPU_GRID_SIZE );
    this.readFromA = !this.readFromA;
  }

  private accumulateDetectorIntensity( detectorIx: number ): void {
    const currentFBO = this.readFromA ? this.fboA : this.fboB;
    this.gpu.readPixelsRG( currentFBO, detectorIx, 0, 1, GPU_GRID_SIZE, this.columnReadbackBuffer );

    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const re = this.columnReadbackBuffer[ iy * 2 ];
      const im = this.columnReadbackBuffer[ iy * 2 + 1 ];
      this.detectorAccumulator[ iy ] += re * re + im * im;
    }
    this.detectorAccumulatorCount++;
  }

  public getAmplitudeField(): Float64Array {
    if ( this.amplitudeFieldDirty ) {
      const currentFBO = this.readFromA ? this.fboA : this.fboB;
      this.gpu.readPixelsRG( currentFBO, 0, 0, GPU_GRID_SIZE, GPU_GRID_SIZE, this.fullReadbackBuffer );
      for ( let i = 0; i < this.fullReadbackBuffer.length; i++ ) {
        this.amplitudeFieldF64[ i ] = this.fullReadbackBuffer[ i ];
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
    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const avg = this.detectorAccumulator[ iy ] / this.detectorAccumulatorCount;
      this.detectorDistribution[ iy ] = avg;
      maxProb = Math.max( maxProb, avg );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
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
    this.readFromA = true;
    this.initializePacket();
  }

  public invalidate(): void {
    this.amplitudeFieldDirty = true;
  }

  public hasWavesInRegion(): boolean {
    return true;
  }

  public applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    const currentFBO = this.readFromA ? this.fboA : this.fboB;
    this.gpu.readPixelsRG( currentFBO, 0, 0, GPU_GRID_SIZE, GPU_GRID_SIZE, this.fullReadbackBuffer );

    const cxGrid = centerNorm.x * GPU_GRID_SIZE;
    const cyGrid = centerNorm.y * GPU_GRID_SIZE;
    const rGrid = radiusNorm * GPU_GRID_SIZE;
    const rSqGrid = rGrid * rGrid;

    let totalBefore = 0;
    let totalOutside = 0;

    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const dyCell = iy - cyGrid;
      const dyCellSq = dyCell * dyCell;
      for ( let ix = 0; ix < GPU_GRID_SIZE; ix++ ) {
        const dxCell = ix - cxGrid;
        const idx = ( iy * GPU_GRID_SIZE + ix ) * 2;
        const re = this.fullReadbackBuffer[ idx ];
        const im = this.fullReadbackBuffer[ idx + 1 ];
        const prob = re * re + im * im;
        totalBefore += prob;

        if ( dxCell * dxCell + dyCellSq <= rSqGrid ) {
          this.fullReadbackBuffer[ idx ] = 0;
          this.fullReadbackBuffer[ idx + 1 ] = 0;
        }
        else {
          totalOutside += prob;
        }
      }
    }

    if ( totalOutside > 0 ) {
      const scale = Math.sqrt( totalBefore / totalOutside );
      for ( let i = 0; i < this.fullReadbackBuffer.length; i++ ) {
        this.fullReadbackBuffer[ i ] *= scale;
      }
    }

    // Upload modified wavefunction back to GPU
    const currentTex = this.readFromA ? this.psiTexA : this.psiTexB;
    this.gpu.uploadRG32F( currentTex, GPU_GRID_SIZE, GPU_GRID_SIZE, this.fullReadbackBuffer );
    this.amplitudeFieldDirty = true;
  }

  /**
   * Renders the wavefunction to the WebGL canvas using the display shader. Called by
   * WaveVisualizationCanvasNode to get GPU-rendered output.
   */
  public renderDisplay( displayMode: WaveDisplayMode, sourceType: SourceType, wavelengthNm: number ): void {
    const { gl } = this.gpu;
    const currentTex = this.readFromA ? this.psiTexA : this.psiTexB;

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, currentTex );

    gl.useProgram( this.displayProgram );

    const modeIndex = displayMode === 'magnitude' ? 0 :
                      displayMode === 'realPart' ? 1 :
                      displayMode === 'imaginaryPart' ? 2 :
                      displayMode === 'electricField' ? 3 :
                      4; // timeAveragedIntensity
    gl.uniform1i( this.displayUniforms.u_displayMode, modeIndex );
    gl.uniform1f( this.displayUniforms.u_amplitudeScale, AMPLITUDE_SCALE );

    let baseR: number; let baseG: number; let
baseB: number;
    let negR: number; let negG: number; let
negB: number;

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

    this.gpu.fullscreenPass( this.displayProgram, null, GPU_GRID_SIZE, GPU_GRID_SIZE );
  }

  private initializePacket(): void {
    const data = new Float32Array( GPU_GRID_SIZE * GPU_GRID_SIZE * 2 );

    const x0 = PACKET_X0_FRACTION * GPU_GRID_SIZE;
    const y0 = 0.5 * GPU_GRID_SIZE;
    const sigmaX = PACKET_SIGMA_X_FRACTION * GPU_GRID_SIZE;
    const sigmaY = PACKET_SIGMA_Y_FRACTION * GPU_GRID_SIZE;
    const invTwoSigmaXSq = 1 / ( 2 * sigmaX * sigmaX );
    const invTwoSigmaYSq = 1 / ( 2 * sigmaY * sigmaY );
    const k = 2 * Math.PI * DISPLAY_WAVELENGTHS / GPU_GRID_SIZE;

    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const dy = iy - y0;
      const envY = Math.exp( -dy * dy * invTwoSigmaYSq );
      for ( let ix = 0; ix < GPU_GRID_SIZE; ix++ ) {
        const dxx = ix - x0;
        const env = envY * Math.exp( -dxx * dxx * invTwoSigmaXSq );
        if ( env < 1e-8 ) { continue; }
        const phase = k * ix;
        const idx = ( iy * GPU_GRID_SIZE + ix ) * 2;
        data[ idx ] = env * Math.cos( phase );
        data[ idx + 1 ] = env * Math.sin( phase );
      }
    }

    // Normalize
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

    // Upload to texture A
    this.gpu.uploadRG32F( this.psiTexA, GPU_GRID_SIZE, GPU_GRID_SIZE, data );

    // Clear texture B
    const zeros = new Float32Array( GPU_GRID_SIZE * GPU_GRID_SIZE * 2 );
    this.gpu.uploadRG32F( this.psiTexB, GPU_GRID_SIZE, GPU_GRID_SIZE, zeros );
    this.readFromA = true;
  }

  private uploadBarrierTexture(): void {
    const barrierData = new Uint8Array( GPU_GRID_SIZE * GPU_GRID_SIZE );

    if ( this.obstacleType === 'none' ) {
      this.gpu.uploadR8( this.barrierTex, GPU_GRID_SIZE, GPU_GRID_SIZE, barrierData );
      return;
    }

    // View-matching slit separation
    const sepRange = this.slitSeparationMax - this.slitSeparationMin;
    const sepFraction = sepRange > 0 ? ( this.slitSeparation - this.slitSeparationMin ) / sepRange : 0.5;
    const viewSlitSepPixels = MIN_VIEW_SEPARATION + sepFraction * ( MAX_VIEW_SEPARATION - MIN_VIEW_SEPARATION );
    const viewSlitSep = viewSlitSepPixels / WAVE_REGION_HEIGHT * this.regionHeight;
    const viewSlitWidth = SLIT_VIEW_HEIGHT / WAVE_REGION_HEIGHT * this.regionHeight;

    const dy = this.regionHeight / GPU_GRID_SIZE;
    const topSlitCenterY = -viewSlitSep / 2;
    const bottomSlitCenterY = viewSlitSep / 2;
    const halfSlitWidth = viewSlitWidth / 2;

    const barrierIx = roundSymmetric( this.barrierFractionX * GPU_GRID_SIZE );
    const halfThickness = BARRIER_THICKNESS / 2;
    const barrierStart = Math.max( 0, barrierIx - Math.floor( halfThickness ) );
    const barrierEnd = Math.min( GPU_GRID_SIZE - 1, barrierIx + Math.ceil( halfThickness ) - 1 );

    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const y = ( iy - GPU_GRID_SIZE / 2 ) * dy;
      const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitCenterY ) < halfSlitWidth;
      const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitCenterY ) < halfSlitWidth;

      if ( !inTopSlit && !inBottomSlit ) {
        for ( let bx = barrierStart; bx <= barrierEnd; bx++ ) {
          barrierData[ iy * GPU_GRID_SIZE + bx ] = 255;
        }
      }
    }

    this.gpu.uploadR8( this.barrierTex, GPU_GRID_SIZE, GPU_GRID_SIZE, barrierData );
  }

  private computeDampingTexture(): void {
    const data = new Float32Array( GPU_GRID_SIZE * GPU_GRID_SIZE );
    data.fill( 1.0 );

    for ( let iy = 0; iy < GPU_GRID_SIZE; iy++ ) {
      const distFromTop = iy;
      const distFromBottom = GPU_GRID_SIZE - 1 - iy;
      for ( let ix = 0; ix < GPU_GRID_SIZE; ix++ ) {
        const distFromRight = GPU_GRID_SIZE - 1 - ix;
        const minDist = Math.min( distFromTop, distFromBottom, distFromRight );

        if ( minDist < DAMPING_THICKNESS ) {
          const fraction = minDist / DAMPING_THICKNESS;
          data[ iy * GPU_GRID_SIZE + ix ] = fraction * fraction;
        }
      }
    }

    const { gl } = this.gpu;
    gl.bindTexture( gl.TEXTURE_2D, this.dampingTex );
    gl.texSubImage2D( gl.TEXTURE_2D, 0, 0, 0, GPU_GRID_SIZE, GPU_GRID_SIZE, gl.RED, gl.FLOAT, data );
  }
}
