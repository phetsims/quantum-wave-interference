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

import { linear } from '../../../../dot/js/util/linear.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import { type ObstacleType } from './ObstacleType.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

const DISPLAY_WAVELENGTHS = 15;
const DISPLAY_TRAVERSAL_TIME = 2.0;
const N_HUYGENS_SOURCES = 28;

export default class AnalyticalWaveSolver implements WaveSolver {

  public readonly gridWidth: number;
  public readonly gridHeight: number;

  private wavelength = 650e-9;
  private waveSpeed = 3e8;
  private obstacleType: ObstacleType = 'none';
  private slitSeparation = 0.25e-3;
  private slitSeparationMin = 0.25e-3;
  private slitSeparationMax = 3e-3;
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
    if ( params.slitSeparationMin !== undefined ) { this.slitSeparationMin = params.slitSeparationMin; }
    if ( params.slitSeparationMax !== undefined ) { this.slitSeparationMax = params.slitSeparationMax; }
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

  public getState(): WaveSolverState {
    return {
      time: this.time,
      sourceOffTime: this.sourceOffTime
    };
  }

  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.sourceOffTime = state.sourceOffTime;
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

      // Match the view's linear mapping from physical separation to visual slit positions
      const sepRange = this.slitSeparationMax - this.slitSeparationMin;
      const sepFraction = sepRange > 0 ? ( this.slitSeparation - this.slitSeparationMin ) / sepRange : 0.5;
      const viewSep = linear( 0, 1, 40, 220, sepFraction );
      const viewSlitSep = viewSep / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT * this.regionHeight;
      const viewSlitWidth = 22 / QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT * this.regionHeight;

      this.computeDoubleSlitField(
        displayK, displayOmega, displayWavefrontX, trailingEdgeX, dx, dy,
        viewSlitSep, viewSlitWidth
      );
      this.computeDetectorDistribution( displayLambda, displaySpeed, viewSlitSep, viewSlitWidth );
      return;
    }

    this.computeDetectorDistribution( displayLambda, displaySpeed, 0, 0 );
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
    displaySlitSep: number, displaySlitWidth: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField } = this;
    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const barrierX = barrierIx * dx;

    const topSlitY = -displaySlitSep / 2;
    const bottomSlitY = displaySlitSep / 2;

    const sphericalFrontDist = wavefrontX - barrierX;
    const trailingPastBarrier = trailingEdgeX > barrierX ? trailingEdgeX - barrierX : 0;

    // Huygens normalization: 0.5 * sqrt(L) / N so that each slit sums to ~0.5 at the far screen
    const L = this.regionWidth - barrierX;
    const huygensNorm = 0.5 * Math.sqrt( L ) / N_HUYGENS_SOURCES;

    // Precompute source positions for each slit
    const sourceSpacing = displaySlitWidth / N_HUYGENS_SOURCES;

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

            // Compute each slit's Huygens contribution separately to preserve phase
            let topRe = 0; let topIm = 0; let bottomRe = 0; let
bottomIm = 0;

            if ( this.isTopSlitOpen ) {
              this.computeSlitContribution(
                k, omega, barrierX, topSlitY, sourceSpacing, huygensNorm,
                x, y, sphericalFrontDist, trailingPastBarrier
              );
              topRe = this.scratchRe;
              topIm = this.scratchIm;
            }

            if ( this.isBottomSlitOpen ) {
              this.computeSlitContribution(
                k, omega, barrierX, bottomSlitY, sourceSpacing, huygensNorm,
                x, y, sphericalFrontDist, trailingPastBarrier
              );
              bottomRe = this.scratchRe;
              bottomIm = this.scratchIm;
            }

            // Build coherent sum from non-decoherent slits
            let coherentRe = 0; let
coherentIm = 0;
            if ( this.isTopSlitOpen && !this.isTopSlitDecoherent ) { coherentRe += topRe; coherentIm += topIm; }
            if ( this.isBottomSlitOpen && !this.isBottomSlitDecoherent ) { coherentRe += bottomRe; coherentIm += bottomIm; }
            const coherentIntensity = coherentRe * coherentRe + coherentIm * coherentIm;

            // Decoherent slits add intensity without interference
            let decoherentIntensity = 0;
            if ( this.isTopSlitOpen && this.isTopSlitDecoherent ) { decoherentIntensity += topRe * topRe + topIm * topIm; }
            if ( this.isBottomSlitOpen && this.isBottomSlitDecoherent ) { decoherentIntensity += bottomRe * bottomRe + bottomIm * bottomIm; }

            const totalIntensity = coherentIntensity + decoherentIntensity;

            // Pick phase from the strongest contribution at this pixel: the coherent
            // sum or any individual decoherent slit. This shows circular wavefronts
            // from each slit — decoherent slits just don't interfere with others.
            let bestRe = coherentRe; let bestIm = coherentIm; let
bestIntensity = coherentIntensity;

            if ( this.isTopSlitOpen && this.isTopSlitDecoherent ) {
              const topIntensity = topRe * topRe + topIm * topIm;
              if ( topIntensity > bestIntensity ) { bestRe = topRe; bestIm = topIm; bestIntensity = topIntensity; }
            }
            if ( this.isBottomSlitOpen && this.isBottomSlitDecoherent ) {
              const bottomIntensity = bottomRe * bottomRe + bottomIm * bottomIm;
              if ( bottomIntensity > bestIntensity ) { bestRe = bottomRe; bestIm = bottomIm; bestIntensity = bottomIntensity; }
            }

            if ( bestIntensity > 1e-20 ) {
              const scale = Math.sqrt( totalIntensity / bestIntensity );
              amplitudeField[ idx ] = bestRe * scale;
              amplitudeField[ idx + 1 ] = bestIm * scale;
            }
            else {
              amplitudeField[ idx ] = 0;
              amplitudeField[ idx + 1 ] = 0;
            }
          }
        }
      }
    }
  }

  /**
   * Huygens summation: N point sources uniformly distributed across the slit aperture.
   * Each source emits a cylindrical wavelet e^{ikr}/sqrt(r). The sum automatically produces
   * the sinc diffraction envelope in the far field and circular wavefronts in the near field.
   */
  private computeSlitContribution(
    k: number, omega: number,
    barrierX: number, slitCenterY: number, sourceSpacing: number, huygensNorm: number,
    fieldX: number, fieldY: number,
    wavefrontDist: number, trailingDist: number
  ): void {
    let sumRe = 0;
    let sumIm = 0;
    const dxField = fieldX - barrierX;

    for ( let s = 0; s < N_HUYGENS_SOURCES; s++ ) {
      const ySource = slitCenterY + ( s - ( N_HUYGENS_SOURCES - 1 ) / 2 ) * sourceSpacing;
      const dyField = fieldY - ySource;
      const r = Math.sqrt( dxField * dxField + dyField * dyField );

      if ( r > wavefrontDist || r < trailingDist ) {
        continue;
      }

      const rSafe = Math.max( r, 1e-6 );
      const amplitude = huygensNorm / Math.sqrt( rSafe );
      const phase = k * r - omega * this.time;
      sumRe += amplitude * Math.cos( phase );
      sumIm += amplitude * Math.sin( phase );
    }

    this.scratchRe = sumRe;
    this.scratchIm = sumIm;
  }

  /**
   * Computes the detector-screen probability distribution using the Fraunhofer formula
   * with display-scale parameters, with time-gated illumination based on wavefront propagation.
   */
  private computeDetectorDistribution(
    displayLambda: number, displaySpeed: number, viewSlitSep: number, viewSlitWidth: number
  ): void {
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

    const barrierX = this.barrierFractionX * this.regionWidth;
    const L = this.regionWidth - barrierX;
    const wavefrontPastBarrier = displayWavefrontX - barrierX;
    const trailingPastBarrier = trailingEdgeX > barrierX ? trailingEdgeX - barrierX : 0;
    const dy = this.regionHeight / gridHeight;

    const topSlitY = -viewSlitSep / 2;
    const bottomSlitY = viewSlitSep / 2;

    let maxProb = 0;

    const slitEnvelopeAt = ( posOnScreen: number, slitY: number ): number => {
      const dySlit = posOnScreen - slitY;
      const dist = Math.sqrt( L * L + dySlit * dySlit );
      const sinThetaSlit = dySlit / dist;
      const arg = Math.PI * viewSlitWidth * sinThetaSlit / displayLambda;
      return arg === 0 ? 1 : Math.pow( Math.sin( arg ) / arg, 2 );
    };

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const posOnScreen = ( iy - gridHeight / 2 + 0.5 ) * dy;

      // Minimum distance from any open slit to this screen position
      let minDistFromSlit = Infinity;
      if ( this.isTopSlitOpen ) {
        const dyTop = posOnScreen - topSlitY;
        minDistFromSlit = Math.min( minDistFromSlit, Math.sqrt( L * L + dyTop * dyTop ) );
      }
      if ( this.isBottomSlitOpen ) {
        const dyBottom = posOnScreen - bottomSlitY;
        minDistFromSlit = Math.min( minDistFromSlit, Math.sqrt( L * L + dyBottom * dyBottom ) );
      }

      if ( wavefrontPastBarrier < minDistFromSlit || trailingPastBarrier >= minDistFromSlit ) {
        detectorDistribution[ iy ] = 0;
        continue;
      }

      if ( this.isTopSlitOpen && this.isBottomSlitOpen && !this.isTopSlitDecoherent && !this.isBottomSlitDecoherent ) {

        // Both open, coherent: sinTheta from the midpoint between slits
        const distToScreen = Math.sqrt( L * L + posOnScreen * posOnScreen );
        const sinTheta = posOnScreen / distToScreen;
        const singleSlitArg = Math.PI * viewSlitWidth * sinTheta / displayLambda;
        const envelope = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );
        const doubleSlitArg = Math.PI * viewSlitSep * sinTheta / displayLambda;
        detectorDistribution[ iy ] = Math.pow( Math.cos( doubleSlitArg ), 2 ) * envelope;
      }
      else if ( this.isTopSlitOpen && this.isBottomSlitOpen ) {

        // Decoherent: each slit's sinc² centered on its own position
        detectorDistribution[ iy ] = 0.5 * ( slitEnvelopeAt( posOnScreen, topSlitY ) +
                                              slitEnvelopeAt( posOnScreen, bottomSlitY ) );
      }
      else {

        // Single slit: sinc² centered on the open slit
        const openSlitY = this.isTopSlitOpen ? topSlitY : bottomSlitY;
        detectorDistribution[ iy ] = 0.5 * slitEnvelopeAt( posOnScreen, openSlitY );
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
