// Copyright 2026, University of Colorado Boulder

/**
 * AnalyticalWaveSolver computes the 2D complex amplitude field and detector-screen probability
 * distribution using closed-form Fraunhofer diffraction expressions.
 *
 * The field before the barrier (or everywhere when obstacle is 'none') is a plane wave propagating
 * in the +x direction. After the barrier, the field is the superposition of contributions from the
 * slit openings using far-field (Fraunhofer) diffraction.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { type ObstacleType } from './ObstacleType.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

export default class AnalyticalWaveSolver implements WaveSolver {

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
  private time = 0;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private dirty = true;

  // Scratch space for slit contribution to avoid per-pixel allocation
  private scratchRe = 0;
  private scratchIm = 0;

  public constructor( gridWidth = DEFAULT_GRID_WIDTH, gridHeight = DEFAULT_GRID_HEIGHT ) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    this.amplitudeField = new Float64Array( gridWidth * gridHeight * 2 );
    this.detectorDistribution = new Float64Array( gridHeight );
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
    const { gridWidth, gridHeight, wavelength, waveSpeed, time, amplitudeField } = this;
    const k = 2 * Math.PI / wavelength;
    const omega = k * waveSpeed;
    const wavefrontX = waveSpeed * time;
    const dx = this.regionWidth / gridWidth;
    const dy = this.regionHeight / gridHeight;

    if ( !this.isSourceOn ) {
      amplitudeField.fill( 0 );
      this.detectorDistribution.fill( 0 );
      return;
    }

    if ( this.obstacleType === 'none' ) {
      this.computePlaneWaveField( k, omega, wavefrontX, dx );
    }
    else {
      this.computeDoubleSlitField( k, omega, wavefrontX, dx, dy );
    }

    this.computeDetectorDistribution();
  }

  private computePlaneWaveField( k: number, omega: number, wavefrontX: number, dx: number ): void {
    const { gridWidth, gridHeight, amplitudeField } = this;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      if ( x > wavefrontX ) {
        for ( let iy = 0; iy < gridHeight; iy++ ) {
          const idx = ( iy * gridWidth + ix ) * 2;
          amplitudeField[ idx ] = 0;
          amplitudeField[ idx + 1 ] = 0;
        }
        continue;
      }

      const phase = k * x - omega * this.time;
      const re = Math.cos( phase );
      const im = Math.sin( phase );

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + ix ) * 2;
        amplitudeField[ idx ] = re;
        amplitudeField[ idx + 1 ] = im;
      }
    }
  }

  private computeDoubleSlitField( k: number, omega: number, wavefrontX: number, dx: number, dy: number ): void {
    const { gridWidth, gridHeight, amplitudeField, slitSeparation, slitWidth } = this;
    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const barrierX = barrierIx * dx;

    const topSlitY = slitSeparation / 2;
    const bottomSlitY = -slitSeparation / 2;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + ix ) * 2;
        const y = ( iy - gridHeight / 2 ) * dy;

        if ( ix < barrierIx ) {
          if ( x > wavefrontX ) {
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
          else {
            const phase = k * x - omega * this.time;
            amplitudeField[ idx ] = Math.cos( phase );
            amplitudeField[ idx + 1 ] = Math.sin( phase );
          }
        }
        else if ( ix === barrierIx ) {
          const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitY ) < slitWidth / 2;
          const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitY ) < slitWidth / 2;

          if ( ( inTopSlit || inBottomSlit ) && barrierX <= wavefrontX ) {
            const phase = k * barrierX - omega * this.time;
            amplitudeField[ idx ] = Math.cos( phase );
            amplitudeField[ idx + 1 ] = Math.sin( phase );
          }
          else {
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
        }
        else {
          if ( barrierX > wavefrontX ) {
            amplitudeField[ idx ] = 0;
            amplitudeField[ idx + 1 ] = 0;
          }
          else {
            const distFromBarrier = x - barrierX;
            const timeAfterBarrier = ( wavefrontX - barrierX ) / this.waveSpeed;
            const sphericalFrontDist = this.waveSpeed * timeAfterBarrier;

            if ( sphericalFrontDist < distFromBarrier ) {
              amplitudeField[ idx ] = 0;
              amplitudeField[ idx + 1 ] = 0;
            }
            else {
              let coherentRe = 0;
              let coherentIm = 0;
              let decoherentIntensity = 0;

              if ( this.isTopSlitOpen ) {
                this.computeSlitContribution( k, omega, barrierX, topSlitY, slitWidth, x, y );
                if ( this.isTopSlitDecoherent ) {
                  decoherentIntensity += this.scratchRe * this.scratchRe + this.scratchIm * this.scratchIm;
                }
                else {
                  coherentRe += this.scratchRe;
                  coherentIm += this.scratchIm;
                }
              }

              if ( this.isBottomSlitOpen ) {
                this.computeSlitContribution( k, omega, barrierX, bottomSlitY, slitWidth, x, y );
                if ( this.isBottomSlitDecoherent ) {
                  decoherentIntensity += this.scratchRe * this.scratchRe + this.scratchIm * this.scratchIm;
                }
                else {
                  coherentRe += this.scratchRe;
                  coherentIm += this.scratchIm;
                }
              }

              const coherentIntensity = coherentRe * coherentRe + coherentIm * coherentIm;
              const totalIntensity = coherentIntensity + decoherentIntensity;

              // Scale coherent phasor so |ψ|² = totalIntensity, preserving phase direction
              if ( coherentIntensity > 1e-20 ) {
                const scale = Math.sqrt( totalIntensity / coherentIntensity );
                amplitudeField[ idx ] = coherentRe * scale;
                amplitudeField[ idx + 1 ] = coherentIm * scale;
              }
              else {
                const mag = Math.sqrt( totalIntensity );
                const r = Math.sqrt( ( x - barrierX ) * ( x - barrierX ) + y * y );
                const phase = k * r - omega * this.time;
                amplitudeField[ idx ] = mag * Math.cos( phase );
                amplitudeField[ idx + 1 ] = mag * Math.sin( phase );
              }
            }
          }
        }
      }
    }
  }

  /**
   * Writes the complex amplitude contribution from a single slit into scratchRe/scratchIm.
   */
  private computeSlitContribution(
    k: number, omega: number,
    barrierX: number, slitCenterY: number, slitWidth: number,
    fieldX: number, fieldY: number
  ): void {
    const dx = fieldX - barrierX;
    const dy = fieldY - slitCenterY;
    const r = Math.sqrt( dx * dx + dy * dy );

    const sinTheta = dy / r;
    const alpha = Math.PI * slitWidth * sinTheta / this.wavelength;
    const envelope = alpha === 0 ? 1 : Math.sin( alpha ) / alpha;

    // 1/sqrt(r) falloff for cylindrical waves in 2D
    const amplitude = envelope / Math.sqrt( Math.max( r, 1e-10 ) );
    const phase = k * r - omega * this.time;

    this.scratchRe = amplitude * Math.cos( phase );
    this.scratchIm = amplitude * Math.sin( phase );
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
