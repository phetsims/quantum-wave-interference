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
 * When decoherence is active (detector at a slit on the High Intensity screen), two independent
 * lattice simulations are run — one per slit — and combined incoherently (sum of intensities) in
 * the output fields, which suppresses interference fringes.
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

type WaveTriple = {
  current: Float64Array;
  previous: Float64Array;
  twoStepsAgo: Float64Array;
};

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
  private isTopSlitDecoherent = false;
  private isBottomSlitDecoherent = false;
  private isSourceOn = false;
  private regionWidth = 1.0;
  private regionHeight = 1.0;

  private mainTriple: WaveTriple;

  // When decoherence is active, two independent lattices propagate waves from each slit in
  // isolation. Their outputs are combined incoherently (sum of intensities) to suppress fringes.
  private decoBuffers: {
    tripleA: WaveTriple;
    tripleB: WaveTriple;
    maskA: Uint8Array;
    maskB: Uint8Array;
  } | null = null;

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
    this.mainTriple = {
      current: new Float64Array( totalCells * 2 ),
      previous: new Float64Array( totalCells * 2 ),
      twoStepsAgo: new Float64Array( totalCells * 2 )
    };

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
    if ( params.isTopSlitDecoherent !== undefined ) { this.isTopSlitDecoherent = params.isTopSlitDecoherent; }
    if ( params.isBottomSlitDecoherent !== undefined ) { this.isBottomSlitDecoherent = params.isBottomSlitDecoherent; }
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
      this.computeBarrierMask( this.barrierMask, this.isTopSlitOpen, this.isBottomSlitOpen );
      this.updateDecoherenceState();
      this.barrierDirty = false;
    }

    if ( this.decoBuffers ) {
      for ( let s = 0; s < STEPS_PER_FRAME; s++ ) {
        this.latticeTime++;
        this.propagateOneStep( this.decoBuffers.tripleA, this.decoBuffers.maskA );
        this.propagateOneStep( this.decoBuffers.tripleB, this.decoBuffers.maskB );
      }
    }
    else {
      for ( let s = 0; s < STEPS_PER_FRAME; s++ ) {
        this.latticeTime++;
        this.propagateOneStep( this.mainTriple, this.barrierMask );
      }
    }

    if ( !this.isSourceOn && this.waveFieldActive ) {
      if ( this.decoBuffers ) {
        if ( !this.hasEnergyInBuffer( this.decoBuffers.tripleA.previous ) &&
             !this.hasEnergyInBuffer( this.decoBuffers.tripleB.previous ) ) {
          this.waveFieldActive = false;
        }
      }
      else {
        if ( !this.hasEnergyInBuffer( this.mainTriple.previous ) ) {
          this.waveFieldActive = false;
        }
      }
    }

    this.dirty = true;
  }

  private hasEnergyInBuffer( buffer: Float64Array ): boolean {
    for ( let i = 0; i < buffer.length; i++ ) {
      if ( Math.abs( buffer[ i ] ) > 1e-10 ) {
        return true;
      }
    }
    return false;
  }

  private ensureComputed(): void {
    if ( this.dirty ) {
      if ( this.decoBuffers ) {
        this.combineDecoherentFields();
      }
      else {
        this.amplitudeField.set( this.mainTriple.previous );
      }
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
    this.clearTriple( this.mainTriple );
    if ( this.decoBuffers ) {
      this.clearTriple( this.decoBuffers.tripleA );
      this.clearTriple( this.decoBuffers.tripleB );
    }
    this.amplitudeField.fill( 0 );
    this.detectorDistribution.fill( 0 );
    this.barrierDirty = true;
    this.dirty = true;
    this.waveFieldActive = false;
  }

  private clearTriple( triple: WaveTriple ): void {
    triple.current.fill( 0 );
    triple.previous.fill( 0 );
    triple.twoStepsAgo.fill( 0 );
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection(): void {
    // No-op: the detector tool is only present on the Single Particles screen.
  }

  public hasWavesInRegion(): boolean {
    return this.isSourceOn || this.waveFieldActive;
  }

  private updateDecoherenceState(): void {
    const needDeco = this.obstacleType !== 'none' &&
                     this.isTopSlitOpen && this.isBottomSlitOpen &&
                     ( this.isTopSlitDecoherent || this.isBottomSlitDecoherent );

    if ( needDeco && !this.decoBuffers ) {
      const totalCells = this.gridWidth * this.gridHeight;
      const size = totalCells * 2;
      this.decoBuffers = {
        tripleA: { current: new Float64Array( size ), previous: new Float64Array( size ), twoStepsAgo: new Float64Array( size ) },
        tripleB: { current: new Float64Array( size ), previous: new Float64Array( size ), twoStepsAgo: new Float64Array( size ) },
        maskA: new Uint8Array( totalCells ),
        maskB: new Uint8Array( totalCells )
      };
    }
    else if ( !needDeco && this.decoBuffers ) {
      this.decoBuffers = null;
    }

    if ( this.decoBuffers ) {
      this.computeBarrierMask( this.decoBuffers.maskA, true, false );
      this.computeBarrierMask( this.decoBuffers.maskB, false, true );
    }
  }

  private combineDecoherentFields(): void {
    const prevA = this.decoBuffers!.tripleA.previous;
    const prevB = this.decoBuffers!.tripleB.previous;
    const { amplitudeField } = this;
    const n = prevA.length;

    for ( let i = 0; i < n; i += 2 ) {
      const reA = prevA[ i ];
      const imA = prevA[ i + 1 ];
      const reB = prevB[ i ];
      const imB = prevB[ i + 1 ];

      const intensityA = reA * reA + imA * imA;
      const intensityB = reB * reB + imB * imB;
      const totalIntensity = intensityA + intensityB;

      if ( intensityA > 1e-20 ) {
        const scale = Math.sqrt( totalIntensity / intensityA );
        amplitudeField[ i ] = reA * scale;
        amplitudeField[ i + 1 ] = imA * scale;
      }
      else if ( totalIntensity > 1e-20 ) {
        amplitudeField[ i ] = Math.sqrt( totalIntensity );
        amplitudeField[ i + 1 ] = 0;
      }
      else {
        amplitudeField[ i ] = 0;
        amplitudeField[ i + 1 ] = 0;
      }
    }
  }

  private propagateOneStep( triple: WaveTriple, mask: Uint8Array ): void {
    const { gridWidth, gridHeight, dampingCoefficients } = this;
    const cSquared = COURANT_NUMBER * COURANT_NUMBER;
    const { current, previous, twoStepsAgo } = triple;

    this.injectSource( current, previous, twoStepsAgo );

    for ( let ix = 1; ix < gridWidth - 1; ix++ ) {
      for ( let iy = 1; iy < gridHeight - 1; iy++ ) {
        const cellIdx = iy * gridWidth + ix;

        if ( mask[ cellIdx ] ) {
          const idx = cellIdx * 2;
          current[ idx ] = 0;
          current[ idx + 1 ] = 0;
          continue;
        }

        const idx = cellIdx * 2;

        const prevRe = previous[ idx ];
        const prevIm = previous[ idx + 1 ];

        const rightRe = mask[ cellIdx + 1 ] ? 0 : previous[ ( cellIdx + 1 ) * 2 ];
        const rightIm = mask[ cellIdx + 1 ] ? 0 : previous[ ( cellIdx + 1 ) * 2 + 1 ];
        const leftRe = mask[ cellIdx - 1 ] ? 0 : previous[ ( cellIdx - 1 ) * 2 ];
        const leftIm = mask[ cellIdx - 1 ] ? 0 : previous[ ( cellIdx - 1 ) * 2 + 1 ];
        const upRe = mask[ cellIdx - gridWidth ] ? 0 : previous[ ( cellIdx - gridWidth ) * 2 ];
        const upIm = mask[ cellIdx - gridWidth ] ? 0 : previous[ ( cellIdx - gridWidth ) * 2 + 1 ];
        const downRe = mask[ cellIdx + gridWidth ] ? 0 : previous[ ( cellIdx + gridWidth ) * 2 ];
        const downIm = mask[ cellIdx + gridWidth ] ? 0 : previous[ ( cellIdx + gridWidth ) * 2 + 1 ];

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

    this.applyAbsorbingBoundaries( current, twoStepsAgo );

    // Cycle buffers: after this, `previous` holds the just-computed state.
    const temp = triple.twoStepsAgo;
    triple.twoStepsAgo = triple.previous;
    triple.previous = triple.current;
    triple.current = temp;
  }

  private injectSource( current: Float64Array, previous: Float64Array, twoStepsAgo: Float64Array ): void {
    const { gridWidth, gridHeight } = this;

    const latticeWavelength = gridWidth / DISPLAY_WAVELENGTHS;
    const latticeK = 2 * Math.PI / latticeWavelength;
    const latticeOmega = latticeK * COURANT_NUMBER;

    for ( let sourceCol = 0; sourceCol < 2; sourceCol++ ) {
      const phase = latticeK * sourceCol - latticeOmega * this.latticeTime;
      const re = Math.cos( phase );
      const im = Math.sin( phase );

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + sourceCol ) * 2;
        current[ idx ] = re;
        current[ idx + 1 ] = im;
        previous[ idx ] = re;
        previous[ idx + 1 ] = im;
        twoStepsAgo[ idx ] = re;
        twoStepsAgo[ idx + 1 ] = im;
      }
    }
  }

  private applyAbsorbingBoundaries( current: Float64Array, twoStepsAgo: Float64Array ): void {
    const { gridWidth, gridHeight } = this;

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

  private computeBarrierMask( mask: Uint8Array, openTop: boolean, openBottom: boolean ): void {
    const { gridWidth, gridHeight } = this;
    mask.fill( 0 );

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
      const inTopSlit = openTop && Math.abs( y - topSlitCenterY ) < halfSlitWidth;
      const inBottomSlit = openBottom && Math.abs( y - bottomSlitCenterY ) < halfSlitWidth;

      if ( !inTopSlit && !inBottomSlit ) {
        mask[ iy * gridWidth + barrierIx ] = 1;
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
