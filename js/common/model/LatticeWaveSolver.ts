// Copyright 2026, University of Colorado Boulder

/**
 * LatticeWaveSolver evolves the wave on a discrete 2D grid using a finite-difference time-domain (FDTD)
 * approach for the classical wave equation. This solver provides an alternative to the analytical
 * Fraunhofer-based solver, selectable via ?waveModel=lattice.
 *
 * The update rule is the standard second-order central-difference scheme for the 2D wave equation:
 *   u(t+1) = 2*u(t) - u(t-1) + c^2 * [ u(i+1,j,t) + u(i-1,j,t) + u(i,j+1,t) + u(i,j-1,t) - 4*u(i,j,t) ]
 *
 * where c is the Courant number. For stability, c <= 1/sqrt(2).
 *
 * The solver operates in normalized lattice units (cells/step) rather than SI units. The physical
 * wavelength is mapped to a fixed number of display wavelengths across the grid, similar to the
 * approach used by AnalyticalWaveSolver. The Courant number is a fixed constant (0.5).
 *
 * Based on the legacy Java ClassicalWavePropagator.java from the original PhET Wave Interference simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { type ObstacleType } from './ObstacleType.js';
import { getDisplaySlitParameters } from './getDisplaySlitParameters.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

// Courant number — must satisfy c <= 1/sqrt(2) ≈ 0.707 for 2D stability.
const COURANT_NUMBER = 0.5;

const DAMPING_THICKNESS = 20;

// Number of visible wavelengths across the grid, matching the analytical solver's visual density
const DISPLAY_WAVELENGTHS = 10;

// Fixed number of lattice sub-steps per frame call, independent of physical time scale
const STEPS_PER_FRAME = 4;


export default class LatticeWaveSolver implements WaveSolver {

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

  // Three time levels for the leapfrog scheme, each storing interleaved [real, imaginary] pairs.
  // After each step, `previous` holds the most recently computed state.
  private current: Float64Array;
  private previous: Float64Array;
  private twoStepsAgo: Float64Array;

  private barrierMask: Uint8Array;
  private barrierDirty = true;
  private dampingCoefficients: Float64Array;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private dirty = true;
  private waveFieldActive = false;

  private latticeTime = 0;

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    const totalCells = gridWidth * gridHeight;
    this.current = new Float64Array( totalCells * 2 );
    this.previous = new Float64Array( totalCells * 2 );
    this.twoStepsAgo = new Float64Array( totalCells * 2 );

    this.barrierMask = new Uint8Array( totalCells );
    this.dampingCoefficients = new Float64Array( totalCells );

    this.amplitudeField = new Float64Array( totalCells * 2 );
    this.detectorDistribution = new Float64Array( gridHeight );

    this.computeDampingCoefficients();
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
    if ( this.isSourceOn ) {
      this.waveFieldActive = true;
    }

    if ( !this.isSourceOn && !this.waveFieldActive ) {
      return;
    }

    if ( this.barrierDirty ) {
      this.computeBarrierMask();
      this.barrierDirty = false;
    }

    for ( let s = 0; s < STEPS_PER_FRAME; s++ ) {
      this.propagateOneStep();
    }

    // Check if the field has decayed to zero after the source turned off
    if ( !this.isSourceOn && this.waveFieldActive ) {
      let maxMag = 0;
      for ( let i = 0; i < this.previous.length; i++ ) {
        const v = Math.abs( this.previous[ i ] );
        if ( v > maxMag ) { maxMag = v; }
        if ( v > 1e-10 ) { break; }
      }
      if ( maxMag <= 1e-10 ) {
        this.waveFieldActive = false;
      }
    }

    this.dirty = true;
  }

  private ensureComputed(): void {
    if ( this.dirty ) {
      // `previous` holds the most recently computed state after buffer cycling
      this.amplitudeField.set( this.previous );
      this.computeDetectorDistribution();
      this.dirty = false;
    }
  }

  public getAmplitudeField(): Float64Array {
    this.ensureComputed();
    return this.amplitudeField;
  }

  public getDetectorProbabilityDistribution(): Float64Array {
    this.ensureComputed();
    return this.detectorDistribution;
  }

  public reset(): void {
    this.latticeTime = 0;
    this.current.fill( 0 );
    this.previous.fill( 0 );
    this.twoStepsAgo.fill( 0 );
    this.amplitudeField.fill( 0 );
    this.detectorDistribution.fill( 0 );
    this.barrierDirty = true;
    this.dirty = true;
    this.waveFieldActive = false;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public hasWavesInRegion(): boolean {
    return this.isSourceOn || this.waveFieldActive;
  }

  private propagateOneStep(): void {
    const { gridWidth, gridHeight, current, previous, twoStepsAgo, barrierMask, dampingCoefficients } = this;
    const cSquared = COURANT_NUMBER * COURANT_NUMBER;

    this.latticeTime++;
    this.injectSource();

    for ( let ix = 1; ix < gridWidth - 1; ix++ ) {
      for ( let iy = 1; iy < gridHeight - 1; iy++ ) {
        const cellIdx = iy * gridWidth + ix;

        if ( barrierMask[ cellIdx ] ) {
          const idx = cellIdx * 2;
          current[ idx ] = 0;
          current[ idx + 1 ] = 0;
          continue;
        }

        const idx = cellIdx * 2;

        const prevRe = previous[ idx ];
        const prevIm = previous[ idx + 1 ];

        // Use cellIdx arithmetic for barrier neighbor lookups
        const rightRe = barrierMask[ cellIdx + 1 ] ? 0 : previous[ ( cellIdx + 1 ) * 2 ];
        const rightIm = barrierMask[ cellIdx + 1 ] ? 0 : previous[ ( cellIdx + 1 ) * 2 + 1 ];
        const leftRe = barrierMask[ cellIdx - 1 ] ? 0 : previous[ ( cellIdx - 1 ) * 2 ];
        const leftIm = barrierMask[ cellIdx - 1 ] ? 0 : previous[ ( cellIdx - 1 ) * 2 + 1 ];
        const upRe = barrierMask[ cellIdx - gridWidth ] ? 0 : previous[ ( cellIdx - gridWidth ) * 2 ];
        const upIm = barrierMask[ cellIdx - gridWidth ] ? 0 : previous[ ( cellIdx - gridWidth ) * 2 + 1 ];
        const downRe = barrierMask[ cellIdx + gridWidth ] ? 0 : previous[ ( cellIdx + gridWidth ) * 2 ];
        const downIm = barrierMask[ cellIdx + gridWidth ] ? 0 : previous[ ( cellIdx + gridWidth ) * 2 + 1 ];

        const laplacianRe = rightRe + leftRe + upRe + downRe - 4 * prevRe;
        const laplacianIm = rightIm + leftIm + upIm + downIm - 4 * prevIm;

        let newRe = 2 * prevRe - twoStepsAgo[ idx ] + cSquared * laplacianRe;
        let newIm = 2 * prevIm - twoStepsAgo[ idx + 1 ] + cSquared * laplacianIm;

        const damping = dampingCoefficients[ cellIdx ];
        if ( damping < 1 ) {
          newRe *= damping;
          newIm *= damping;
        }

        current[ idx ] = newRe;
        current[ idx + 1 ] = newIm;
      }
    }

    this.applyAbsorbingBoundaries();

    // Cycle buffers: after this, `previous` holds the just-computed state
    const temp = this.twoStepsAgo;
    this.twoStepsAgo = this.previous;
    this.previous = this.current;
    this.current = temp;
  }

  private injectSource(): void {
    const { gridWidth, gridHeight } = this;

    // Map physical wavelength to display wavelengths in lattice units
    const latticeWavelength = gridWidth / DISPLAY_WAVELENGTHS;
    const latticeK = 2 * Math.PI / latticeWavelength;
    const latticeOmega = latticeK * COURANT_NUMBER;

    for ( let sourceCol = 0; sourceCol < 2; sourceCol++ ) {
      const phase = latticeK * sourceCol - latticeOmega * this.latticeTime;
      const re = Math.cos( phase );
      const im = Math.sin( phase );

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + sourceCol ) * 2;
        this.current[ idx ] = re;
        this.current[ idx + 1 ] = im;
        this.previous[ idx ] = re;
        this.previous[ idx + 1 ] = im;
        this.twoStepsAgo[ idx ] = re;
        this.twoStepsAgo[ idx + 1 ] = im;
      }
    }
  }

  private applyAbsorbingBoundaries(): void {
    const { gridWidth, gridHeight, current, twoStepsAgo } = this;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const boundaryIdx = ix * 2;
      const interiorIdx = ( gridWidth + ix ) * 2;
      current[ boundaryIdx ] = twoStepsAgo[ interiorIdx ];
      current[ boundaryIdx + 1 ] = twoStepsAgo[ interiorIdx + 1 ];
    }

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const boundaryIdx = ( ( gridHeight - 1 ) * gridWidth + ix ) * 2;
      const interiorIdx = ( ( gridHeight - 2 ) * gridWidth + ix ) * 2;
      current[ boundaryIdx ] = twoStepsAgo[ interiorIdx ];
      current[ boundaryIdx + 1 ] = twoStepsAgo[ interiorIdx + 1 ];
    }

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const boundaryIdx = ( iy * gridWidth + gridWidth - 1 ) * 2;
      const interiorIdx = ( iy * gridWidth + gridWidth - 2 ) * 2;
      current[ boundaryIdx ] = twoStepsAgo[ interiorIdx ];
      current[ boundaryIdx + 1 ] = twoStepsAgo[ interiorIdx + 1 ];
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

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const y = ( iy - gridHeight / 2 ) * dy;
      const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitCenterY ) < halfSlitWidth;
      const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitCenterY ) < halfSlitWidth;

      if ( !inTopSlit && !inBottomSlit ) {
        barrierMask[ iy * gridWidth + barrierIx ] = 1;
      }
    }
  }

  private computeDampingCoefficients(): void {
    const { gridWidth, gridHeight, dampingCoefficients } = this;
    dampingCoefficients.fill( 1.0 );

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const distFromTop = iy;
        const distFromBottom = gridHeight - 1 - iy;
        const distFromRight = gridWidth - 1 - ix;
        const minDist = Math.min( distFromTop, distFromBottom, distFromRight );

        if ( minDist < DAMPING_THICKNESS ) {
          const fraction = minDist / DAMPING_THICKNESS;
          dampingCoefficients[ iy * gridWidth + ix ] = fraction * fraction;
        }
      }
    }
  }

  private computeDetectorDistribution(): void {
    const { gridWidth, gridHeight, amplitudeField, detectorDistribution } = this;
    const ix = gridWidth - 1;
    let maxProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const idx = ( iy * gridWidth + ix ) * 2;
      const re = amplitudeField[ idx ];
      const im = amplitudeField[ idx + 1 ];
      const prob = re * re + im * im;
      detectorDistribution[ iy ] = prob;
      maxProb = Math.max( maxProb, prob );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        detectorDistribution[ iy ] /= maxProb;
      }
    }
  }
}
