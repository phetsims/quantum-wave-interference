// Copyright 2026, University of Colorado Boulder

/**
 * LatticeWavePacketSolver evolves a Gaussian wave packet on a 2D lattice using the Modified
 * Richardson scheme for the time-dependent Schrödinger equation. This solver is the Single
 * Particles screen's alternative back-end, selectable via ?waveModel=lattice.
 *
 * The Modified Richardson scheme is a unitary (norm-preserving) split-operator method. A full
 * step does four directional sweeps (+y, −y, +x, −x), applies the barrier potential (zeroing
 * cells inside the barrier), then four more sweeps in reverse order — a symmetric split that
 * preserves time-reversibility. Each directional sweep updates every interior cell (i,j) using
 * one of its four neighbors, chosen by the cell's sublattice parity:
 *
 *   psi_new(i,j) = alpha * psi(i,j) + beta * psi( i + s*dx, j + s*dy )
 *   where s = +1 if (i+j) is even, s = -1 if (i+j) is odd.
 *
 * The complex coefficients alpha and beta are constants of epsilon = ℏ dt / m:
 *   alpha = ( 1/2 + (1/2) cos(ε/2) ) + i * ( -(1/2) sin(ε/2) )
 *   beta  = sin(ε/4)^2              + i * (  (1/2) sin(ε/2) )
 * Here epsilon is a display-scale tuning constant chosen so the packet traverses the grid in
 * roughly the same time as the analytical packet solver.
 *
 * Barriers are represented by zeroing the wavefunction at barrier cells each step. Absorbing
 * boundary conditions are implemented as a multiplicative damping layer near the top, bottom,
 * and right edges, preventing packet reflection from the grid boundary.
 *
 * Based on ModifiedRichardsonPropagator.java and RichardsonPropagator.java from the legacy
 * PhET Quantum Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { type ObstacleType } from './ObstacleType.js';
import { getDisplaySlitParameters } from './getDisplaySlitParameters.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

// Richardson epsilon — ℏ dt / m as a display-scale tuning constant. Larger values give faster
// packet motion; too large breaks the small-ε approximation to the continuum Schrödinger
// equation. 0.5 balances propagation speed against dispersion accuracy.
const EPSILON = 0.5;

// Visible wavelengths across the grid, matching the analytical packet solver's visual density.
const DISPLAY_WAVELENGTHS = 30;

// Initial Gaussian packet width as fractions of the grid.
const PACKET_SIGMA_X_FRACTION = 0.1;
const PACKET_SIGMA_Y_FRACTION = 0.18;

// Initial packet center x position as a fraction of the grid, so the packet starts visibly
// near the left edge without clipping into the damping-free left boundary.
const PACKET_X0_FRACTION = 0.15;

// Thickness of the absorbing damping layer at the top, bottom, and right edges.
const DAMPING_THICKNESS = 18;

// Barrier thickness in cells. The reference Java sim uses 3 cells at 100x100 grid;
// scaled proportionally to our 200x200 grid.
const BARRIER_THICKNESS = 6;

// Number of Richardson substeps executed per second of simulated time. Calibrated so that the
// packet center traverses the grid in roughly the analytical packet solver's traversal time.
const SUBSTEPS_PER_SECOND = 320;

export default class LatticeWavePacketSolver implements WaveSolver {

  public readonly gridWidth: number;
  public readonly gridHeight: number;

  private wavelength = 650e-9;
  private waveSpeed = 3e8;
  private obstacleType: ObstacleType = 'none';
  private slitSeparation = 0.25e-3;
  private slitWidth = 0.02e-3;
  private barrierFractionX = 0.5;
  private isTopSlitOpen = true;
  private isBottomSlitOpen = true;
  private isSourceOn = false;
  private regionWidth = 1.0;
  private regionHeight = 1.0;

  // Complex wavefunction on the lattice, interleaved [real, imaginary].
  private readonly psi: Float64Array;

  // Scratch buffer for stepIt (read-from psiCopy, write-to psi).
  private readonly psiCopy: Float64Array;

  private readonly barrierMask: Uint8Array;
  private readonly dampingCoefficients: Float64Array;
  private barrierDirty = true;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private readonly detectorAccumulator: Float64Array;
  private detectorAccumulatorCount = 0;
  private dirty = true;

  // Modified Richardson alpha/beta — scalar complex constants; sublattice parity chooses sign.
  private readonly alphaRe: number;
  private readonly alphaIm: number;
  private readonly betaRe: number;
  private readonly betaIm: number;

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    const totalCells = gridWidth * gridHeight;
    this.psi = new Float64Array( totalCells * 2 );
    this.psiCopy = new Float64Array( totalCells * 2 );

    this.barrierMask = new Uint8Array( totalCells );
    this.dampingCoefficients = new Float64Array( totalCells );

    this.amplitudeField = new Float64Array( totalCells * 2 );
    this.detectorDistribution = new Float64Array( gridHeight );
    this.detectorAccumulator = new Float64Array( gridHeight );

    this.alphaRe = 0.5 + 0.5 * Math.cos( EPSILON / 2 );
    this.alphaIm = -0.5 * Math.sin( EPSILON / 2 );
    const sinEps4 = Math.sin( EPSILON / 4 );
    this.betaRe = sinEps4 * sinEps4;
    this.betaIm = 0.5 * Math.sin( EPSILON / 2 );

    this.computeDampingCoefficients();
    this.initializePacket();
  }

  public setParameters( params: WaveSolverParameters ): void {
    if ( params.wavelength !== undefined ) { this.wavelength = params.wavelength; }
    if ( params.waveSpeed !== undefined ) { this.waveSpeed = params.waveSpeed; }
    if ( params.obstacleType !== undefined ) { this.obstacleType = params.obstacleType; }
    if ( params.slitSeparation !== undefined ) { this.slitSeparation = params.slitSeparation; }
    if ( params.slitWidth !== undefined ) { this.slitWidth = params.slitWidth; }
    if ( params.barrierFractionX !== undefined ) { this.barrierFractionX = params.barrierFractionX; }
    if ( params.isTopSlitOpen !== undefined ) { this.isTopSlitOpen = params.isTopSlitOpen; }
    if ( params.isBottomSlitOpen !== undefined ) { this.isBottomSlitOpen = params.isBottomSlitOpen; }
    if ( params.isSourceOn !== undefined ) { this.isSourceOn = params.isSourceOn; }
    if ( params.regionWidth !== undefined ) { this.regionWidth = params.regionWidth; }
    if ( params.regionHeight !== undefined ) { this.regionHeight = params.regionHeight; }
    this.barrierDirty = true;
    this.dirty = true;
  }

  public step( dt: number ): void {
    if ( this.barrierDirty ) {
      this.computeBarrierMask();
      this.barrierDirty = false;
    }

    const numSubsteps = Math.max( 1, roundSymmetric( dt * SUBSTEPS_PER_SECOND ) );
    const ix = this.gridWidth - 1 - DAMPING_THICKNESS;
    for ( let s = 0; s < numSubsteps; s++ ) {
      this.propagateOneStep();
      this.accumulateDetectorIntensity( ix );
    }

    this.dirty = true;
  }

  public reset(): void {
    this.psi.fill( 0 );
    this.psiCopy.fill( 0 );
    this.amplitudeField.fill( 0 );
    this.detectorDistribution.fill( 0 );
    this.detectorAccumulator.fill( 0 );
    this.detectorAccumulatorCount = 0;
    this.barrierDirty = true;
    this.initializePacket();
    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    const { gridWidth, gridHeight, psi } = this;
    const cxGrid = centerNorm.x * gridWidth;
    const cyGrid = centerNorm.y * gridHeight;
    const rGrid = radiusNorm * gridWidth;
    const rSqGrid = rGrid * rGrid;

    let totalBefore = 0;
    let totalOutside = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const dyCell = iy - cyGrid;
      const dyCellSq = dyCell * dyCell;
      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const dxCell = ix - cxGrid;
        const idx = ( iy * gridWidth + ix ) * 2;
        const re = psi[ idx ];
        const im = psi[ idx + 1 ];
        const prob = re * re + im * im;
        totalBefore += prob;

        if ( dxCell * dxCell + dyCellSq <= rSqGrid ) {
          psi[ idx ] = 0;
          psi[ idx + 1 ] = 0;
        }
        else {
          totalOutside += prob;
        }
      }
    }

    // Renormalize the surviving wavefunction in place; subsequent Schrödinger evolution naturally
    // diffuses the hole, so no projection state needs to be stored beyond this call.
    if ( totalOutside > 0 ) {
      const scale = Math.sqrt( totalBefore / totalOutside );
      for ( let i = 0; i < psi.length; i++ ) {
        psi[ i ] *= scale;
      }
    }

    this.dirty = true;
  }

  public hasWavesInRegion(): boolean {

    // The lattice holds the current packet regardless of the source's on/off state.
    return true;
  }

  public getAmplitudeField(): Float64Array {
    this.ensureComputed();
    return this.amplitudeField;
  }

  public getDetectorProbabilityDistribution(): Float64Array {
    this.ensureComputed();
    return this.detectorDistribution;
  }

  private ensureComputed(): void {
    if ( this.dirty ) {
      this.amplitudeField.set( this.psi );
      this.computeDetectorDistribution();
      this.dirty = false;
    }
  }

  private propagateOneStep(): void {
    this.stepIt( 0, -1 );
    this.stepIt( 0, 1 );
    this.stepIt( 1, 0 );
    this.stepIt( -1, 0 );
    this.applyBarrier();
    this.stepIt( -1, 0 );
    this.stepIt( 1, 0 );
    this.stepIt( 0, -1 );
    this.stepIt( 0, 1 );
    this.applyDamping();
  }

  private stepIt( dx: number, dy: number ): void {
    const { gridWidth, gridHeight, psi, psiCopy, alphaRe, alphaIm, betaRe, betaIm } = this;

    psiCopy.set( psi );

    for ( let iy = 1; iy < gridHeight - 1; iy++ ) {
      for ( let ix = 1; ix < gridWidth - 1; ix++ ) {
        const cellIdx = iy * gridWidth + ix;
        const idx = cellIdx * 2;

        const selfRe = psiCopy[ idx ];
        const selfIm = psiCopy[ idx + 1 ];

        const sign = ( ix + iy ) % 2 === 0 ? 1 : -1;
        const nIdx = ( ( iy + sign * dy ) * gridWidth + ( ix + sign * dx ) ) * 2;
        const nRe = psiCopy[ nIdx ];
        const nIm = psiCopy[ nIdx + 1 ];

        const aRe = alphaRe * selfRe - alphaIm * selfIm;
        const aIm = alphaRe * selfIm + alphaIm * selfRe;
        const bRe = betaRe * nRe - betaIm * nIm;
        const bIm = betaRe * nIm + betaIm * nRe;

        psi[ idx ] = aRe + bRe;
        psi[ idx + 1 ] = aIm + bIm;
      }
    }
  }

  private applyBarrier(): void {
    const { barrierMask, psi } = this;
    const n = barrierMask.length;
    for ( let cellIdx = 0; cellIdx < n; cellIdx++ ) {
      if ( barrierMask[ cellIdx ] ) {
        const idx = cellIdx * 2;
        psi[ idx ] = 0;
        psi[ idx + 1 ] = 0;
      }
    }
  }

  private applyDamping(): void {
    const { psi, dampingCoefficients } = this;
    const n = dampingCoefficients.length;
    for ( let cellIdx = 0; cellIdx < n; cellIdx++ ) {
      const damping = dampingCoefficients[ cellIdx ];
      if ( damping < 1 ) {
        const idx = cellIdx * 2;
        psi[ idx ] *= damping;
        psi[ idx + 1 ] *= damping;
      }
    }
  }

  private initializePacket(): void {
    const { gridWidth, gridHeight, psi } = this;

    const x0 = PACKET_X0_FRACTION * gridWidth;
    const y0 = 0.5 * gridHeight;
    const sigmaX = PACKET_SIGMA_X_FRACTION * gridWidth;
    const sigmaY = PACKET_SIGMA_Y_FRACTION * gridHeight;
    const invTwoSigmaXSq = 1 / ( 2 * sigmaX * sigmaX );
    const invTwoSigmaYSq = 1 / ( 2 * sigmaY * sigmaY );
    const k = 2 * Math.PI * DISPLAY_WAVELENGTHS / gridWidth;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const dy = iy - y0;
      const envY = Math.exp( -dy * dy * invTwoSigmaYSq );
      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const dxx = ix - x0;
        const env = envY * Math.exp( -dxx * dxx * invTwoSigmaXSq );
        if ( env < 1e-8 ) { continue; }
        const phase = k * ix;
        const idx = ( iy * gridWidth + ix ) * 2;
        psi[ idx ] = env * Math.cos( phase );
        psi[ idx + 1 ] = env * Math.sin( phase );
      }
    }
  }

  private computeBarrierMask(): void {
    const { gridWidth, gridHeight, barrierMask } = this;
    barrierMask.fill( 0 );

    if ( this.obstacleType === 'none' ) {
      return;
    }

    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const dy = this.regionHeight / gridHeight;
    const displayLambda = this.regionWidth / DISPLAY_WAVELENGTHS;
    const { displaySlitSep, displaySlitWidth } = getDisplaySlitParameters( this.wavelength, this.slitSeparation, displayLambda );

    const topSlitCenterY = displaySlitSep / 2;
    const bottomSlitCenterY = -displaySlitSep / 2;
    const halfSlitWidth = displaySlitWidth / 2;

    const halfThickness = BARRIER_THICKNESS / 2;
    const barrierStart = Math.max( 0, barrierIx - Math.floor( halfThickness ) );
    const barrierEnd = Math.min( gridWidth - 1, barrierIx + Math.ceil( halfThickness ) - 1 );

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const y = ( iy - gridHeight / 2 ) * dy;
      const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitCenterY ) < halfSlitWidth;
      const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitCenterY ) < halfSlitWidth;

      if ( !inTopSlit && !inBottomSlit ) {
        for ( let bx = barrierStart; bx <= barrierEnd; bx++ ) {
          barrierMask[ iy * gridWidth + bx ] = 1;
        }
      }
    }
  }

  private computeDampingCoefficients(): void {
    const { gridWidth, gridHeight, dampingCoefficients } = this;
    dampingCoefficients.fill( 1.0 );

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const distFromTop = iy;
      const distFromBottom = gridHeight - 1 - iy;
      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const distFromRight = gridWidth - 1 - ix;
        const minDist = Math.min( distFromTop, distFromBottom, distFromRight );

        if ( minDist < DAMPING_THICKNESS ) {
          const fraction = minDist / DAMPING_THICKNESS;
          dampingCoefficients[ iy * gridWidth + ix ] = fraction * fraction;
        }
      }
    }
  }

  private accumulateDetectorIntensity( ix: number ): void {
    const { gridWidth, gridHeight, psi, detectorAccumulator } = this;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const idx = ( iy * gridWidth + ix ) * 2;
      const re = psi[ idx ];
      const im = psi[ idx + 1 ];
      detectorAccumulator[ iy ] += re * re + im * im;
    }
    this.detectorAccumulatorCount++;
  }

  private computeDetectorDistribution(): void {
    const { gridHeight, detectorDistribution, detectorAccumulator, detectorAccumulatorCount } = this;

    if ( detectorAccumulatorCount === 0 ) {
      detectorDistribution.fill( 0 );
      return;
    }

    let maxProb = 0;
    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const avg = detectorAccumulator[ iy ] / detectorAccumulatorCount;
      detectorDistribution[ iy ] = avg;
      maxProb = Math.max( maxProb, avg );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        detectorDistribution[ iy ] /= maxProb;
      }
    }
  }
}
