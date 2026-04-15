// Copyright 2026, University of Colorado Boulder

/**
 * AnalyticalWavePacketSolver computes the 2D complex amplitude field for a Gaussian wave packet
 * propagating through the wave visualization region. Used by the Single Particles screen.
 *
 * Uses a "display wavevector" so oscillations are visible on the 200x200 grid, while the
 * physical wavelength (nanometer-scale) is used by the scene model for detector interference.
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

const PACKET_TRAVERSAL_TIME = 1.5;
const SIGMA_X_FRACTION = 0.12;
const SIGMA_Y_FRACTION = 0.35;
const DISPLAY_WAVELENGTHS = 30;

export { PACKET_TRAVERSAL_TIME };

export default class AnalyticalWavePacketSolver implements WaveSolver {

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
  private time = 0;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private dirty = true;

  // Precomputed vertical Gaussian envelope (reused across frames when grid height is constant)
  private readonly envYCache: Float64Array;

  private scratchRe = 0;
  private scratchIm = 0;

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.detectorDistribution = new Float64Array( gridHeight );
    this.envYCache = new Float64Array( gridHeight );
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
    this.dirty = true;
  }

  public step( dt: number ): void {
    this.time += dt;
    this.dirty = true;
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

  public getDetectorProbabilityDistribution(): Float64Array {
    this.ensureComputed();
    return this.detectorDistribution;
  }

  public reset(): void {
    this.time = 0;
    this.amplitudeField.fill( 0 );
    this.detectorDistribution.fill( 0 );
    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  private computeField(): void {
    const { gridWidth, gridHeight, amplitudeField, regionWidth, regionHeight, envYCache } = this;

    if ( !this.isSourceOn ) {
      amplitudeField.fill( 0 );
      this.detectorDistribution.fill( 0 );
      return;
    }

    const dx = regionWidth / gridWidth;
    const dy = regionHeight / gridHeight;
    const kDisplay = 2 * Math.PI * DISPLAY_WAVELENGTHS / regionWidth;
    const displaySpeed = regionWidth / PACKET_TRAVERSAL_TIME;
    const omegaDisplay = kDisplay * displaySpeed;

    const sigmaX = SIGMA_X_FRACTION * regionWidth;
    const sigmaY = SIGMA_Y_FRACTION * regionHeight;
    const invTwoSigmaXSq = 1 / ( 2 * sigmaX * sigmaX );
    const invTwoSigmaYSq = 1 / ( 2 * sigmaY * sigmaY );
    const xCenter = displaySpeed * this.time;

    // Precompute vertical Gaussian envelope per row (saves ~39k redundant Math.exp calls)
    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const y = ( iy - gridHeight / 2 ) * dy;
      envYCache[ iy ] = Math.exp( -y * y * invTwoSigmaYSq );
    }

    if ( this.obstacleType === 'none' ) {
      this.computeFreePacket( kDisplay, omegaDisplay, xCenter, dx, invTwoSigmaXSq );
    }
    else {
      this.computeSlitPacket( kDisplay, omegaDisplay, xCenter, dx, dy, invTwoSigmaXSq, sigmaY );
    }

    this.computeDetectorDistribution();
  }

  private computeFreePacket(
    kDisplay: number, omegaDisplay: number, xCenter: number,
    dx: number, invTwoSigmaXSq: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField, envYCache, time } = this;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;
      const deltaX = x - xCenter;
      const envX = Math.exp( -deltaX * deltaX * invTwoSigmaXSq );

      if ( envX < 1e-6 ) {
        for ( let iy = 0; iy < gridHeight; iy++ ) {
          const idx = ( iy * gridWidth + ix ) * 2;
          amplitudeField[ idx ] = 0;
          amplitudeField[ idx + 1 ] = 0;
        }
        continue;
      }

      const phase = kDisplay * x - omegaDisplay * time;
      const cosPhase = Math.cos( phase );
      const sinPhase = Math.sin( phase );

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const envelope = envX * envYCache[ iy ];
        const idx = ( iy * gridWidth + ix ) * 2;
        amplitudeField[ idx ] = envelope * cosPhase;
        amplitudeField[ idx + 1 ] = envelope * sinPhase;
      }
    }
  }

  private computeSlitPacket(
    kDisplay: number, omegaDisplay: number, xCenter: number,
    dx: number, dy: number, invTwoSigmaXSq: number, sigmaY: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField, time, envYCache } = this;
    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const barrierX = barrierIx * dx;

    const lambdaDisplay = this.regionWidth / DISPLAY_WAVELENGTHS;
    const { displaySlitSep, displaySlitWidth } = getDisplaySlitParameters( this.wavelength, this.slitSeparation, lambdaDisplay );

    const topSlitY = displaySlitSep / 2;
    const bottomSlitY = -displaySlitSep / 2;

    const deltaBarrier = barrierX - xCenter;
    const packetAtBarrier = Math.exp( -deltaBarrier * deltaBarrier * invTwoSigmaXSq );
    const wavefrontDist = Math.max( xCenter - barrierX, 0 );

    // Precompute slit-center vertical envelope factors (constant per slit)
    const topSlitEnvY = Math.exp( -topSlitY * topSlitY / ( 2 * sigmaY * sigmaY ) );
    const bottomSlitEnvY = Math.exp( -bottomSlitY * bottomSlitY / ( 2 * sigmaY * sigmaY ) );

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      if ( ix < barrierIx ) {

        // Before barrier: free-space Gaussian packet (hoist envX and column-skip)
        const deltaX = x - xCenter;
        const envX = Math.exp( -deltaX * deltaX * invTwoSigmaXSq );

        if ( envX < 1e-6 ) {
          for ( let iy = 0; iy < gridHeight; iy++ ) {
            const idx = ( iy * gridWidth + ix ) * 2;
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
          continue;
        }

        const phase = kDisplay * x - omegaDisplay * time;
        const cosPhase = Math.cos( phase );
        const sinPhase = Math.sin( phase );

        for ( let iy = 0; iy < gridHeight; iy++ ) {
          const envelope = envX * envYCache[ iy ];
          const idx = ( iy * gridWidth + ix ) * 2;
          amplitudeField[ idx ] = envelope * cosPhase;
          amplitudeField[ idx + 1 ] = envelope * sinPhase;
        }
      }
      else if ( ix === barrierIx ) {

        const barrierPhase = kDisplay * barrierX - omegaDisplay * time;
        const barrierCos = Math.cos( barrierPhase );
        const barrierSin = Math.sin( barrierPhase );

        for ( let iy = 0; iy < gridHeight; iy++ ) {
          const idx = ( iy * gridWidth + ix ) * 2;
          const y = ( iy - gridHeight / 2 ) * dy;
          const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitY ) < displaySlitWidth / 2;
          const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitY ) < displaySlitWidth / 2;

          if ( ( inTopSlit || inBottomSlit ) && packetAtBarrier > 1e-6 ) {
            const envelope = packetAtBarrier * envYCache[ iy ];
            amplitudeField[ idx ] = envelope * barrierCos;
            amplitudeField[ idx + 1 ] = envelope * barrierSin;
          }
          else {
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
        }
      }
      else {

        const distFromBarrier = x - barrierX;

        if ( packetAtBarrier < 1e-6 || wavefrontDist < distFromBarrier ) {
          for ( let iy = 0; iy < gridHeight; iy++ ) {
            const idx = ( iy * gridWidth + ix ) * 2;
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
        }
        else {
          for ( let iy = 0; iy < gridHeight; iy++ ) {
            const idx = ( iy * gridWidth + ix ) * 2;
            const y = ( iy - gridHeight / 2 ) * dy;
            let totalRe = 0;
            let totalIm = 0;

            if ( this.isTopSlitOpen ) {
              this.computeSlitContribution(
                kDisplay, omegaDisplay, lambdaDisplay, barrierX, topSlitY,
                displaySlitWidth, x, y, topSlitEnvY
              );
              totalRe += this.scratchRe;
              totalIm += this.scratchIm;
            }

            if ( this.isBottomSlitOpen ) {
              this.computeSlitContribution(
                kDisplay, omegaDisplay, lambdaDisplay, barrierX, bottomSlitY,
                displaySlitWidth, x, y, bottomSlitEnvY
              );
              totalRe += this.scratchRe;
              totalIm += this.scratchIm;
            }

            amplitudeField[ idx ] = packetAtBarrier * totalRe;
            amplitudeField[ idx + 1 ] = packetAtBarrier * totalIm;
          }
        }
      }
    }
  }

  private computeSlitContribution(
    kDisplay: number, omegaDisplay: number, lambdaDisplay: number,
    barrierX: number, slitCenterY: number, slitWidth: number,
    fieldX: number, fieldY: number, slitEnvY: number
  ): void {
    const dxSlit = fieldX - barrierX;
    const dySlit = fieldY - slitCenterY;
    const r = Math.sqrt( dxSlit * dxSlit + dySlit * dySlit );
    const rSafe = Math.max( r, 1e-10 );

    const sinTheta = dySlit / rSafe;
    const alpha = Math.PI * slitWidth * sinTheta / lambdaDisplay;
    const singleSlitEnvelope = alpha === 0 ? 1 : Math.sin( alpha ) / alpha;

    const amplitude = singleSlitEnvelope * slitEnvY / Math.sqrt( rSafe );
    const phase = kDisplay * r - omegaDisplay * this.time;

    this.scratchRe = amplitude * Math.cos( phase );
    this.scratchIm = amplitude * Math.sin( phase );
  }

  private computeDetectorDistribution(): void {
    const { gridWidth, gridHeight, amplitudeField, detectorDistribution } = this;
    const ix = gridWidth - 1;
    let maxProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const fieldIdx = ( iy * gridWidth + ix ) * 2;
      const re = amplitudeField[ fieldIdx ];
      const im = amplitudeField[ fieldIdx + 1 ];
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
