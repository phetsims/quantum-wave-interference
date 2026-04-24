// Copyright 2026, University of Colorado Boulder

/**
 * Minimal pure rasterization harness for analytical wave samples.
 *
 * This intentionally avoids Scenery and browser canvas APIs. It samples AnalyticalWaveKernel at
 * deterministic grid points and maps FieldSample status/value to RGBA bytes. The production canvas
 * renderer uses the same color mapping so tests can exercise rendering semantics without a DOM.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { type AnalyticalWaveParameters, type FieldSample, computeSampleIntensity, evaluateAnalyticalSample, getRepresentativeComplex } from './AnalyticalWaveKernel.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';

export const FIELD_DISPLAY_CUTOFF = 0.4;
export const UNREACHED_GRAY = 80;
export const BLOCKED_GRAY = 48;
export const ABSORBED_GRAY = 32;

export type RGBColor = {
  red: number;
  green: number;
  blue: number;
};

export type RGBAColor = RGBColor & {
  alpha: number;
};

export type AnalyticalWaveRasterOptions = {
  parameters: AnalyticalWaveParameters;
  width: number;
  height: number;
  regionWidth: number;
  regionHeight: number;
  time: number;
  displayMode: WaveDisplayMode;
  baseColor: RGBColor;
  amplitudeScale: number;
};

export type AnalyticalWaveRaster = {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
  statusCounts: {
    field: number;
    unreached: number;
    absorbed: number;
    blocked: number;
  };
};

export const getFieldSampleRGBA = (
  sample: FieldSample,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor => {
  if ( sample.kind !== 'field' ) {
    const gray = sample.kind === 'unreached' ? UNREACHED_GRAY :
                 sample.kind === 'absorbed' ? ABSORBED_GRAY :
                 BLOCKED_GRAY;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  const representative = getRepresentativeComplex( sample );
  const rawIntensity = computeSampleIntensity( sample );
  const re = representative.re * amplitudeScale;
  const im = representative.im * amplitudeScale;

  let intensity: number;
  if ( displayMode === 'timeAveragedIntensity' ) {
    intensity = clamp( FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * rawIntensity * amplitudeScale * amplitudeScale, FIELD_DISPLAY_CUTOFF, 1 );
  }
  else if ( displayMode === 'magnitude' ) {
    intensity = clamp( FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * Math.sqrt( rawIntensity ) * amplitudeScale, FIELD_DISPLAY_CUTOFF, 1 );
  }
  else {
    const value = displayMode === 'imaginaryPart' ? im : re;
    intensity = value > 0 ?
                clamp( FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * value, FIELD_DISPLAY_CUTOFF, 1 ) :
                clamp( FIELD_DISPLAY_CUTOFF * ( 1 + value ), 0, FIELD_DISPLAY_CUTOFF );
  }

  return {
    red: roundSymmetric( baseColor.red * intensity ),
    green: roundSymmetric( baseColor.green * intensity ),
    blue: roundSymmetric( baseColor.blue * intensity ),
    alpha: 255
  };
};

export const rasterizeAnalyticalWave = ( options: AnalyticalWaveRasterOptions ): AnalyticalWaveRaster => {
  const pixels = new Uint8ClampedArray( options.width * options.height * 4 );
  const statusCounts = {
    field: 0,
    unreached: 0,
    absorbed: 0,
    blocked: 0
  };
  const obstacle = options.parameters.obstacle;
  const barrierGridX = obstacle.kind === 'doubleSlit' ?
                       roundSymmetric( obstacle.barrierX / options.regionWidth * options.width ) :
                       -1;

  for ( let yIndex = 0; yIndex < options.height; yIndex++ ) {
    const y = ( yIndex + 0.5 ) * options.regionHeight / options.height - options.regionHeight / 2;
    for ( let xIndex = 0; xIndex < options.width; xIndex++ ) {
      const x = obstacle.kind === 'doubleSlit' && xIndex === barrierGridX ?
                obstacle.barrierX :
                xIndex * options.regionWidth / options.width;
      const sample = evaluateAnalyticalSample( options.parameters, x, y, options.time );
      statusCounts[ sample.kind ]++;
      const color = getFieldSampleRGBA( sample, options.displayMode, options.baseColor, options.amplitudeScale );
      const pixelIndex = ( yIndex * options.width + xIndex ) * 4;
      pixels[ pixelIndex ] = color.red;
      pixels[ pixelIndex + 1 ] = color.green;
      pixels[ pixelIndex + 2 ] = color.blue;
      pixels[ pixelIndex + 3 ] = color.alpha;
    }
  }

  return {
    width: options.width,
    height: options.height,
    pixels: pixels,
    statusCounts: statusCounts
  };
};
