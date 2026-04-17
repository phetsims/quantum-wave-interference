// Copyright 2026, University of Colorado Boulder

/**
 * AnalyticalWaveSolver computes the 2D complex amplitude field and detector-screen probability
 * distribution using closed-form Fraunhofer diffraction expressions.
 *
 * The solver operates in display-scale coordinates so that wave oscillations and interference
 * fringes are visible on the 200x200 grid. Physical parameters (wavelength, slit separation)
 * are mapped to display equivalents that preserve qualitative behavior while keeping patterns
 * resolvable. The detector probability distribution uses the same display-scale Fraunhofer
 * formula for consistency with the wave field.
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

const DISPLAY_WAVELENGTHS = 15;
const DISPLAY_TRAVERSAL_TIME = 2.0;

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

  // Tracks when the source was turned off so waves can continue propagating past the trailing edge
  private sourceOffTime: number | null = null;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private dirty = true;

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
    if ( params.isSourceOn !== undefined ) {
      if ( this.isSourceOn && !params.isSourceOn ) {
        this.sourceOffTime = this.time;
      }
      else if ( !this.isSourceOn && params.isSourceOn ) {
        this.sourceOffTime = null;
      }
      this.isSourceOn = params.isSourceOn;
    }
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
    this.sourceOffTime = null;
    this.amplitudeField.fill( 0 );
    this.detectorDistribution.fill( 0 );
    this.dirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection(): void {
    // No-op: the detector tool is only present on the Single Particles screen.
  }

  /**
   * Returns true when waves have fully exited the region after the source was turned off.
   */
  public hasWavesInRegion(): boolean {
    if ( this.isSourceOn ) {
      return true;
    }
    if ( this.sourceOffTime === null ) {
      return false;
    }
    const displaySpeed = this.regionWidth / DISPLAY_TRAVERSAL_TIME;
    const trailingEdge = displaySpeed * ( this.time - this.sourceOffTime );
    return trailingEdge < this.regionWidth;
  }

  private computeField(): void {
    const { amplitudeField } = this;

    // If the source was never turned on, or all waves have exited the region, zero everything
    if ( !this.isSourceOn && !this.hasWavesInRegion() ) {
      amplitudeField.fill( 0 );
      this.detectorDistribution.fill( 0 );
      return;
    }

    const displayLambda = this.regionWidth / DISPLAY_WAVELENGTHS;
    const displayK = 2 * Math.PI / displayLambda;
    const displaySpeed = this.regionWidth / DISPLAY_TRAVERSAL_TIME;
    const displayOmega = displayK * displaySpeed;
    const displayWavefrontX = displaySpeed * this.time;

    // Trailing edge: position of the last emitted wavefront's left boundary
    const trailingEdgeX = this.sourceOffTime !== null
                          ? displaySpeed * ( this.time - this.sourceOffTime )
                          : 0;

    const dx = this.regionWidth / this.gridWidth;
    const dy = this.regionHeight / this.gridHeight;

    if ( this.obstacleType === 'none' ) {
      this.computePlaneWaveField( displayK, displayOmega, displayWavefrontX, trailingEdgeX, dx );
    }
    else {
      const { displaySlitSep, displaySlitWidth } = getDisplaySlitParameters( this.wavelength, this.slitSeparation, displayLambda );
      this.computeDoubleSlitField(
        displayK, displayOmega, displayWavefrontX, trailingEdgeX, dx, dy,
        displaySlitSep, displaySlitWidth, displayLambda
      );
    }

    this.computeDetectorDistribution( displayLambda, displaySpeed );
  }

  private computePlaneWaveField( k: number, omega: number, wavefrontX: number, trailingEdgeX: number, dx: number ): void {
    const { gridWidth, gridHeight, amplitudeField } = this;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      if ( x > wavefrontX || x < trailingEdgeX ) {
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

  private computeDoubleSlitField(
    k: number, omega: number, wavefrontX: number, trailingEdgeX: number, dx: number, dy: number,
    displaySlitSep: number, displaySlitWidth: number, displayLambda: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField } = this;
    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const barrierX = barrierIx * dx;

    const topSlitY = displaySlitSep / 2;
    const bottomSlitY = -displaySlitSep / 2;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + ix ) * 2;
        const y = ( iy - gridHeight / 2 ) * dy;

        if ( ix < barrierIx ) {
          if ( x > wavefrontX || x < trailingEdgeX ) {
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
          const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitY ) < displaySlitWidth / 2;
          const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitY ) < displaySlitWidth / 2;

          if ( ( inTopSlit || inBottomSlit ) && barrierX <= wavefrontX && trailingEdgeX <= barrierX ) {
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
            const sphericalFrontDist = wavefrontX - barrierX;

            // Trailing spherical front: how far the trailing edge has propagated past the barrier
            const trailingPastBarrier = trailingEdgeX > barrierX ? trailingEdgeX - barrierX : 0;

            if ( sphericalFrontDist < distFromBarrier || distFromBarrier < trailingPastBarrier ) {
              amplitudeField[ idx ] = 0;
              amplitudeField[ idx + 1 ] = 0;
            }
            else {
              let coherentRe = 0;
              let coherentIm = 0;
              let decoherentIntensity = 0;

              if ( this.isTopSlitOpen ) {
                this.computeSlitContribution( k, omega, barrierX, topSlitY, displaySlitWidth, x, y, displayLambda );
                if ( this.isTopSlitDecoherent ) {
                  decoherentIntensity += this.scratchRe * this.scratchRe + this.scratchIm * this.scratchIm;
                }
                else {
                  coherentRe += this.scratchRe;
                  coherentIm += this.scratchIm;
                }
              }

              if ( this.isBottomSlitOpen ) {
                this.computeSlitContribution( k, omega, barrierX, bottomSlitY, displaySlitWidth, x, y, displayLambda );
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
    fieldX: number, fieldY: number,
    displayLambda: number
  ): void {
    const dx = fieldX - barrierX;
    const dy = fieldY - slitCenterY;
    const r = Math.sqrt( dx * dx + dy * dy );

    const sinTheta = dy / r;
    const alpha = Math.PI * slitWidth * sinTheta / displayLambda;
    const envelope = alpha === 0 ? 1 : Math.sin( alpha ) / alpha;

    // 0.5 per slit keeps the coherent two-slit sum ≤ 1 for rendering (no 1/√r spreading).
    const amplitude = 0.5 * envelope;
    const phase = k * r - omega * this.time;

    this.scratchRe = amplitude * Math.cos( phase );
    this.scratchIm = amplitude * Math.sin( phase );
  }

  /**
   * Computes the detector-screen probability distribution using the Fraunhofer formula
   * with display-scale parameters, with time-gated illumination based on wavefront propagation.
   */
  private computeDetectorDistribution( displayLambda: number, displaySpeed: number ): void {
    const { gridHeight, detectorDistribution } = this;

    const displayWavefrontX = displaySpeed * this.time;

    const trailingEdgeX = this.sourceOffTime !== null
                          ? displaySpeed * ( this.time - this.sourceOffTime )
                          : 0;

    if ( this.obstacleType === 'none' ) {

      // Plane wave: uniform illumination while the wavefront is at the screen and trailing edge hasn't passed
      const illuminated = displayWavefrontX >= this.regionWidth && trailingEdgeX < this.regionWidth ? 1 : 0;
      detectorDistribution.fill( illuminated );
      return;
    }

    const { displaySlitSep, displaySlitWidth } = getDisplaySlitParameters( this.wavelength, this.slitSeparation, displayLambda );
    const barrierX = this.barrierFractionX * this.regionWidth;
    const L = this.regionWidth - barrierX;
    const wavefrontPastBarrier = displayWavefrontX - barrierX;
    const trailingPastBarrier = trailingEdgeX > barrierX ? trailingEdgeX - barrierX : 0;
    const dy = this.regionHeight / gridHeight;

    let maxProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const posOnScreen = ( iy - gridHeight / 2 + 0.5 ) * dy;

      // Check if the spherical wavefront from the nearest open slit has reached this screen position
      const distToScreen = Math.sqrt( L * L + posOnScreen * posOnScreen );
      if ( wavefrontPastBarrier < distToScreen || trailingPastBarrier >= distToScreen ) {
        detectorDistribution[ iy ] = 0;
        continue;
      }

      const sinTheta = posOnScreen / distToScreen;

      // Single-slit diffraction envelope
      const singleSlitArg = Math.PI * displaySlitWidth * sinTheta / displayLambda;
      const envelope = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

      if ( this.isTopSlitOpen && this.isBottomSlitOpen && !this.isTopSlitDecoherent && !this.isBottomSlitDecoherent ) {

        // Both open, coherent: cos²(πd sinθ/λ) × sinc²(πa sinθ/λ)
        const doubleSlitArg = Math.PI * displaySlitSep * sinTheta / displayLambda;
        detectorDistribution[ iy ] = Math.pow( Math.cos( doubleSlitArg ), 2 ) * envelope;
      }
      else if ( this.isTopSlitOpen && this.isBottomSlitOpen ) {

        // Decoherent: incoherent sum (no interference cross-term)
        detectorDistribution[ iy ] = envelope;
      }
      else {

        // Single slit open
        detectorDistribution[ iy ] = 0.5 * envelope;
      }

      maxProb = Math.max( maxProb, detectorDistribution[ iy ] );
    }

    if ( maxProb > 0 ) {
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        detectorDistribution[ iy ] /= maxProb;
      }
    }
  }
}
