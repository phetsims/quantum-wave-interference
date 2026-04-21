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

import Vector2 from '../../../../dot/js/Vector2.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { type ObstacleType } from './ObstacleType.js';
import { getDisplaySlitParameters } from './getDisplaySlitParameters.js';
import { getViewSlitLayout } from './getViewSlitLayout.js';
import type WaveSolver from './WaveSolver.js';
import { type WaveSolverParameters, type WaveSolverState } from './WaveSolver.js';

const DEFAULT_GRID_WIDTH = 200;
const DEFAULT_GRID_HEIGHT = 200;

const PACKET_TRAVERSAL_TIME = 1.5;
const SIGMA_X_FRACTION = 0.12;
const SIGMA_Y_FRACTION = 0.12;
const DISPLAY_WAVELENGTHS = 30;
const N_HUYGENS_SOURCES = 28;

export { PACKET_TRAVERSAL_TIME, SIGMA_X_FRACTION };

export default class AnalyticalWavePacketSolver implements WaveSolver {

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
  private isSourceOn = false;
  private regionWidth = 1.0;
  private regionHeight = 1.0;
  private time = 0;

  private readonly amplitudeField: Float64Array;
  private readonly detectorDistribution: Float64Array;
  private dirty = true;
  private detectorDistributionDirty = true;

  // Precomputed vertical Gaussian envelope (reused across frames when grid height is constant)
  private readonly envYCache: Float64Array;

  // Each bite is a Gaussian wave packet created at the detector position when a "not detected"
  // measurement occurs. It propagates analytically at the same speed as the main packet, and is
  // decoherently subtracted from the main field so the hole moves and softens naturally.
  private readonly biteGaussians: {
    worldX0: number; worldY: number; invSigmaSq: number;
    peakProbDensity: number; measurementTime: number; renormScale: number;
  }[] = [];

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
    for ( const [ key, value ] of Object.entries( params ) ) {
      if ( value !== undefined && key in this ) {
        ( this as Record<string, unknown> )[ key ] = value;
      }
    }
    this.dirty = true;
    this.detectorDistributionDirty = true;
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
    this.biteGaussians.length = 0;
    this.dirty = true;
    this.detectorDistributionDirty = true;
  }

  public getState(): WaveSolverState {
    return {
      time: this.time,
      biteGaussians: this.biteGaussians.map( b => ( {
        worldX0: b.worldX0, worldY: b.worldY, invSigmaSq: b.invSigmaSq,
        peakProbDensity: b.peakProbDensity, measurementTime: b.measurementTime, renormScale: b.renormScale
      } ) )
    };
  }

  public setState( state: WaveSolverState ): void {
    this.time = state.time;
    this.biteGaussians.length = 0;
    for ( const b of state.biteGaussians ) {
      this.biteGaussians.push( {
        worldX0: b.worldX0, worldY: b.worldY, invSigmaSq: b.invSigmaSq,
        peakProbDensity: b.peakProbDensity, measurementTime: b.measurementTime, renormScale: b.renormScale
      } );
    }
    this.dirty = true;
    this.detectorDistributionDirty = true;
  }

  public invalidate(): void {
    this.dirty = true;
  }

  public applyMeasurementProjection( centerNorm: Vector2, radiusNorm: number ): void {
    this.ensureComputed();

    const { gridWidth, gridHeight, amplitudeField, regionWidth, regionHeight } = this;
    const cxGrid = centerNorm.x * gridWidth;
    const cyGrid = centerNorm.y * gridHeight;
    const rGrid = radiusNorm * gridWidth;
    const rSqGrid = rGrid * rGrid;

    let probInCircle = 0;
    let totalProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const dyCell = iy - cyGrid;
      const dyCellSq = dyCell * dyCell;
      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const dxCell = ix - cxGrid;
        const idx = ( iy * gridWidth + ix ) * 2;
        const re = amplitudeField[ idx ];
        const im = amplitudeField[ idx + 1 ];
        const prob = re * re + im * im;
        totalProb += prob;
        if ( dxCell * dxCell + dyCellSq <= rSqGrid ) {
          probInCircle += prob;
        }
      }
    }

    const worldX0 = centerNorm.x * regionWidth;
    const worldY = ( centerNorm.y - 0.5 ) * regionHeight;
    const sigmaWorld = radiusNorm * regionWidth;
    const invSigmaSq = 1 / ( sigmaWorld * sigmaWorld );
    const dxWorld = regionWidth / gridWidth;
    const dyWorld = regionHeight / gridHeight;
    const peakProbDensity = probInCircle * dxWorld * dyWorld / ( Math.PI * sigmaWorld * sigmaWorld );
    const renormScale = totalProb > probInCircle ? Math.sqrt( totalProb / ( totalProb - probInCircle ) ) : 1;

    this.biteGaussians.push( { worldX0: worldX0, worldY: worldY, invSigmaSq: invSigmaSq, peakProbDensity: peakProbDensity, measurementTime: this.time, renormScale: renormScale } );
    this.dirty = true;
  }

  public hasWavesInRegion(): boolean {
    return this.isSourceOn;
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

    this.subtractBiteGaussians();
    this.computeDetectorDistribution();
  }

  private subtractBiteGaussians(): void {
    if ( this.biteGaussians.length === 0 ) {
      return;
    }

    const { gridWidth, gridHeight, amplitudeField, biteGaussians, regionWidth, regionHeight, time } = this;
    const dxWorld = regionWidth / gridWidth;
    const dyWorld = regionHeight / gridHeight;
    const displaySpeed = regionWidth / PACKET_TRAVERSAL_TIME;

    const biteCurrentXs: number[] = [];
    for ( let b = 0; b < biteGaussians.length; b++ ) {
      biteCurrentXs.push( biteGaussians[ b ].worldX0 + displaySpeed * ( time - biteGaussians[ b ].measurementTime ) );
    }

    const renormScale = biteGaussians[ biteGaussians.length - 1 ].renormScale;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const worldY = ( iy - gridHeight / 2 ) * dyWorld;

      for ( let ix = 0; ix < gridWidth; ix++ ) {
        const idx = ( iy * gridWidth + ix ) * 2;
        const re = amplitudeField[ idx ];
        const im = amplitudeField[ idx + 1 ];
        const probMain = re * re + im * im;

        if ( probMain < 1e-12 ) {
          continue;
        }

        const worldX = ix * dxWorld;
        let totalProbBite = 0;

        for ( let b = 0; b < biteGaussians.length; b++ ) {
          const bite = biteGaussians[ b ];
          const dxBite = worldX - biteCurrentXs[ b ];
          const dyBite = worldY - bite.worldY;
          const rSqInvSigmaSq = ( dxBite * dxBite + dyBite * dyBite ) * bite.invSigmaSq;

          if ( rSqInvSigmaSq < 16 ) {
            totalProbBite += bite.peakProbDensity * Math.exp( -rSqInvSigmaSq );
          }
        }

        if ( totalProbBite > 0 ) {
          const scale = Math.sqrt( Math.max( 0, probMain - totalProbBite ) / probMain ) * renormScale;
          amplitudeField[ idx ] = re * scale;
          amplitudeField[ idx + 1 ] = im * scale;
        }
        else {
          amplitudeField[ idx ] = re * renormScale;
          amplitudeField[ idx + 1 ] = im * renormScale;
        }
      }
    }
  }

  private computeFreePacket(
    kDisplay: number, omegaDisplay: number, xCenter: number,
    dx: number, invTwoSigmaXSq: number
  ): void {
    for ( let ix = 0; ix < this.gridWidth; ix++ ) {
      this.writeFreeColumn( ix, ix * dx, kDisplay, omegaDisplay, xCenter, invTwoSigmaXSq );
    }
  }

  private writeFreeColumn(
    ix: number, x: number, kDisplay: number, omegaDisplay: number,
    xCenter: number, invTwoSigmaXSq: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField, envYCache, time } = this;
    const deltaX = x - xCenter;
    const envX = Math.exp( -deltaX * deltaX * invTwoSigmaXSq );

    if ( envX < 1e-6 ) {
      for ( let iy = 0; iy < gridHeight; iy++ ) {
        const idx = ( iy * gridWidth + ix ) * 2;
        amplitudeField[ idx ] = 0;
        amplitudeField[ idx + 1 ] = 0;
      }
      return;
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

  private computeSlitPacket(
    kDisplay: number, omegaDisplay: number, xCenter: number,
    dx: number, dy: number, invTwoSigmaXSq: number, sigmaY: number
  ): void {
    const { gridWidth, gridHeight, amplitudeField, time, envYCache } = this;
    const barrierIx = roundSymmetric( this.barrierFractionX * gridWidth );
    const barrierX = barrierIx * dx;

    const { viewSlitSep, viewSlitWidth } = getViewSlitLayout(
      this.slitSeparation, this.slitSeparationMin, this.slitSeparationMax, this.regionHeight
    );

    const topSlitY = -viewSlitSep / 2;
    const bottomSlitY = viewSlitSep / 2;

    const deltaBarrier = barrierX - xCenter;
    const packetAtBarrier = Math.exp( -deltaBarrier * deltaBarrier * invTwoSigmaXSq );
    const wavefrontDist = Math.max( xCenter - barrierX, 0 );

    // Huygens parameters
    const invTwoSigmaYSq = 1 / ( 2 * sigmaY * sigmaY );
    const sourceSpacing = viewSlitWidth / N_HUYGENS_SOURCES;
    const L = this.regionWidth - barrierX;
    const huygensNorm = 0.5 * Math.sqrt( L ) / N_HUYGENS_SOURCES;

    for ( let ix = 0; ix < gridWidth; ix++ ) {
      const x = ix * dx;

      if ( ix < barrierIx ) {
        this.writeFreeColumn( ix, x, kDisplay, omegaDisplay, xCenter, invTwoSigmaXSq );
      }
      else if ( ix === barrierIx ) {

        const barrierPhase = kDisplay * barrierX - omegaDisplay * time;
        const barrierCos = Math.cos( barrierPhase );
        const barrierSin = Math.sin( barrierPhase );

        for ( let iy = 0; iy < gridHeight; iy++ ) {
          const idx = ( iy * gridWidth + ix ) * 2;
          const y = ( iy - gridHeight / 2 ) * dy;
          const inTopSlit = this.isTopSlitOpen && Math.abs( y - topSlitY ) < viewSlitWidth / 2;
          const inBottomSlit = this.isBottomSlitOpen && Math.abs( y - bottomSlitY ) < viewSlitWidth / 2;

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

        if ( wavefrontDist < distFromBarrier ) {
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
                kDisplay, omegaDisplay, barrierX, topSlitY, sourceSpacing, huygensNorm,
                x, y, wavefrontDist, invTwoSigmaXSq, invTwoSigmaYSq
              );
              totalRe += this.scratchRe;
              totalIm += this.scratchIm;
            }

            if ( this.isBottomSlitOpen ) {
              this.computeSlitContribution(
                kDisplay, omegaDisplay, barrierX, bottomSlitY, sourceSpacing, huygensNorm,
                x, y, wavefrontDist, invTwoSigmaXSq, invTwoSigmaYSq
              );
              totalRe += this.scratchRe;
              totalIm += this.scratchIm;
            }

            amplitudeField[ idx ] = totalRe;
            amplitudeField[ idx + 1 ] = totalIm;
          }
        }
      }
    }
  }

  /**
   * Huygens summation: N point sources across the slit aperture, each with cylindrical
   * spreading (1/sqrt(r)), radial Gaussian envelope centered on the expanding wavefront,
   * and per-source vertical Gaussian beam profile.
   */
  private computeSlitContribution(
    kDisplay: number, omegaDisplay: number,
    barrierX: number, slitCenterY: number, sourceSpacing: number, huygensNorm: number,
    fieldX: number, fieldY: number,
    wavefrontDist: number, invTwoSigmaXSq: number, invTwoSigmaYSq: number
  ): void {
    let sumRe = 0;
    let sumIm = 0;
    const dxField = fieldX - barrierX;

    for ( let s = 0; s < N_HUYGENS_SOURCES; s++ ) {
      const ySource = slitCenterY + ( s - ( N_HUYGENS_SOURCES - 1 ) / 2 ) * sourceSpacing;
      const dyField = fieldY - ySource;
      const r = Math.sqrt( dxField * dxField + dyField * dyField );

      const radialDelta = r - wavefrontDist;
      if ( radialDelta * radialDelta * invTwoSigmaXSq > 16 ) {
        continue;
      }

      const rSafe = Math.max( r, 1e-6 );
      const radialEnvelope = Math.exp( -radialDelta * radialDelta * invTwoSigmaXSq );
      const verticalEnvelope = Math.exp( -ySource * ySource * invTwoSigmaYSq );
      const amplitude = huygensNorm * verticalEnvelope * radialEnvelope / Math.sqrt( rSafe );
      const phase = kDisplay * r - omegaDisplay * this.time;
      sumRe += amplitude * Math.cos( phase );
      sumIm += amplitude * Math.sin( phase );
    }

    this.scratchRe = sumRe;
    this.scratchIm = sumIm;
  }

  private computeDetectorDistribution(): void {
    if ( !this.detectorDistributionDirty ) {
      return;
    }
    this.detectorDistributionDirty = false;

    const { gridHeight, detectorDistribution } = this;

    if ( this.obstacleType === 'none' ) {
      detectorDistribution.fill( 1 );
      return;
    }

    // Independent of the packet's current position — the probability distribution
    // at the screen depends only on the slit geometry and wavelength.
    const lambdaDisplay = this.regionWidth / DISPLAY_WAVELENGTHS;
    const { displaySlitSep, displaySlitWidth } = getDisplaySlitParameters( this.wavelength, this.slitSeparation, lambdaDisplay );
    const barrierX = this.barrierFractionX * this.regionWidth;
    const L = this.regionWidth - barrierX;
    const dy = this.regionHeight / gridHeight;

    let maxProb = 0;

    for ( let iy = 0; iy < gridHeight; iy++ ) {
      const posOnScreen = ( iy - gridHeight / 2 + 0.5 ) * dy;
      const distToScreen = Math.sqrt( L * L + posOnScreen * posOnScreen );
      const sinTheta = posOnScreen / distToScreen;

      const singleSlitArg = Math.PI * displaySlitWidth * sinTheta / lambdaDisplay;
      const envelope = singleSlitArg === 0 ? 1 : Math.pow( Math.sin( singleSlitArg ) / singleSlitArg, 2 );

      if ( this.isTopSlitOpen && this.isBottomSlitOpen ) {
        const doubleSlitArg = Math.PI * displaySlitSep * sinTheta / lambdaDisplay;
        detectorDistribution[ iy ] = Math.pow( Math.cos( doubleSlitArg ), 2 ) * envelope;
      }
      else {
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
