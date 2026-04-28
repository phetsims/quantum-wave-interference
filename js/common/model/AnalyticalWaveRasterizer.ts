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
import { type AnalyticalWaveParameters, type ComplexValue, type FieldComponent, type FieldSample, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';

export const FIELD_DISPLAY_CUTOFF = 0.4;
export const UNREACHED_GRAY = 0;
export const BLOCKED_GRAY = 48;
export const ABSORBED_GRAY = 32;
export const DECOHERENCE_GLIMMER_RATE_HZ = 8;

export type RGBColor = {
  red: number;
  green: number;
  blue: number;
};

export type RGBAColor = RGBColor & {
  alpha: number;
};

export type FieldSampleRGBAOptions = {
  xIndex?: number;
  yIndex?: number;
  decoherenceFrame?: number;
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
  amplitudeScale: number,
  options?: FieldSampleRGBAOptions
): RGBAColor => {
  if ( sample.kind !== 'field' ) {
    const gray = sample.kind === 'unreached' ? UNREACHED_GRAY :
                 sample.kind === 'absorbed' ? ABSORBED_GRAY :
                 BLOCKED_GRAY;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  const displayState = getDisplayState( sample, displayMode, amplitudeScale, options );
  const re = displayState.value.re * amplitudeScale;
  const im = displayState.value.im * amplitudeScale;

  let intensity: number;
  if ( displayMode === 'timeAveragedIntensity' ) {
    intensity = clamp(
      FIELD_DISPLAY_CUTOFF * displayState.visibility + ( 1 - FIELD_DISPLAY_CUTOFF ) * displayState.intensity * amplitudeScale * amplitudeScale,
      0,
      1
    );
  }
  else if ( displayMode === 'magnitude' ) {
    intensity = clamp(
      FIELD_DISPLAY_CUTOFF * displayState.visibility + ( 1 - FIELD_DISPLAY_CUTOFF ) * Math.sqrt( displayState.intensity ) * amplitudeScale,
      0,
      1
    );
  }
  else {
    const value = displayMode === 'imaginaryPart' ? im : re;
    const phaseIntensity = value > 0 ?
                clamp( FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * value, FIELD_DISPLAY_CUTOFF, 1 ) :
                clamp( FIELD_DISPLAY_CUTOFF * ( 1 + value ), 0, FIELD_DISPLAY_CUTOFF );
    intensity = phaseIntensity * displayState.visibility;
  }

  const fieldColor = {
    red: baseColor.red * intensity,
    green: baseColor.green * intensity,
    blue: baseColor.blue * intensity
  };

  return {
    red: roundSymmetric( blend( UNREACHED_GRAY, fieldColor.red, displayState.visibility ) ),
    green: roundSymmetric( blend( UNREACHED_GRAY, fieldColor.green, displayState.visibility ) ),
    blue: roundSymmetric( blend( UNREACHED_GRAY, fieldColor.blue, displayState.visibility ) ),
    alpha: 255
  };
};

const blend = ( a: number, b: number, t: number ): number => a + ( b - a ) * t;

type CoherenceGroupDisplayState = {
  coherenceGroup: string;
  value: ComplexValue;
  intensity: number;
  componentIntensity: number;
  support: number;
  hasExplicitSupport: boolean;
};

type FieldDisplayState = {
  value: ComplexValue;
  intensity: number;
  visibility: number;
};

const getDisplayState = (
  sample: Extract<FieldSample, { kind: 'field' }>,
  displayMode: WaveDisplayMode,
  amplitudeScale: number,
  options?: FieldSampleRGBAOptions
): FieldDisplayState => {
  const groupStates = getCoherenceGroupDisplayStates( sample );
  if ( groupStates.length === 0 ) {
    return {
      value: { re: 0, im: 0 },
      intensity: 0,
      visibility: 1
    };
  }

  if ( groupStates.length > 1 && displayMode !== 'timeAveragedIntensity' ) {
    const selectedGroup = selectStochasticCoherenceGroup( groupStates, options );
    return {
      value: selectedGroup.value,
      intensity: selectedGroup.intensity,
      visibility: getGroupVisibility( selectedGroup, amplitudeScale )
    };
  }

  let totalIntensity = 0;
  let strongestGroup: CoherenceGroupDisplayState | null = null;
  for ( let i = 0; i < groupStates.length; i++ ) {
    const groupState = groupStates[ i ];
    totalIntensity += groupState.intensity;
    if ( !strongestGroup || groupState.intensity > strongestGroup.intensity ) {
      strongestGroup = groupState;
    }
  }

  const representative = strongestGroup && strongestGroup.intensity > 0 ?
                         scaleComplex( strongestGroup.value, Math.sqrt( totalIntensity / strongestGroup.intensity ) ) :
                         { re: 0, im: 0 };
  return {
    value: representative,
    intensity: computeSampleIntensity( sample ),
    visibility: getSampleVisibility( groupStates, amplitudeScale )
  };
};

const getCoherenceGroupDisplayStates = ( sample: Extract<FieldSample, { kind: 'field' }> ): CoherenceGroupDisplayState[] => {
  const groupStates: CoherenceGroupDisplayState[] = [];
  const groupIndexMap = new Map<string, number>();

  for ( let i = 0; i < sample.components.length; i++ ) {
    const component = sample.components[ i ];
    let groupIndex = groupIndexMap.get( component.coherenceGroup );
    if ( groupIndex === undefined ) {
      groupIndex = groupStates.length;
      groupIndexMap.set( component.coherenceGroup, groupIndex );
      groupStates.push( {
        coherenceGroup: component.coherenceGroup,
        value: { re: 0, im: 0 },
        intensity: 0,
        componentIntensity: 0,
        support: 0,
        hasExplicitSupport: false
      } );
    }

    addComponentToGroupState( groupStates[ groupIndex ], component );
  }

  for ( let i = 0; i < groupStates.length; i++ ) {
    const value = groupStates[ i ].value;
    groupStates[ i ].intensity = value.re * value.re + value.im * value.im;
  }

  return groupStates;
};

const addComponentToGroupState = ( groupState: CoherenceGroupDisplayState, component: FieldComponent ): void => {
  groupState.value.re += component.value.re;
  groupState.value.im += component.value.im;
  groupState.componentIntensity += component.value.re * component.value.re + component.value.im * component.value.im;
  if ( component.support !== undefined ) {
    groupState.hasExplicitSupport = true;
    groupState.support = Math.max( groupState.support, component.support );
  }
};

const getSampleVisibility = ( groupStates: CoherenceGroupDisplayState[], amplitudeScale: number ): number => {
  let hasExplicitSupport = false;
  let explicitSupport = 0;
  let componentIntensity = 0;
  for ( let i = 0; i < groupStates.length; i++ ) {
    const groupState = groupStates[ i ];
    if ( groupState.hasExplicitSupport ) {
      hasExplicitSupport = true;
      explicitSupport = Math.max( explicitSupport, groupState.support );
    }
    componentIntensity += groupState.componentIntensity;
  }

  if ( hasExplicitSupport ) {
    return clamp( explicitSupport, 0, 1 );
  }

  return clamp( Math.sqrt( componentIntensity ) * amplitudeScale, 0, 1 );
};

const getGroupVisibility = ( groupState: CoherenceGroupDisplayState, amplitudeScale: number ): number => {
  return groupState.hasExplicitSupport ?
         clamp( groupState.support, 0, 1 ) :
         clamp( Math.sqrt( groupState.componentIntensity ) * amplitudeScale, 0, 1 );
};

const scaleComplex = ( value: ComplexValue, scale: number ): ComplexValue => ( {
  re: value.re * scale,
  im: value.im * scale
} );

const selectStochasticCoherenceGroup = (
  groupStates: CoherenceGroupDisplayState[],
  options?: FieldSampleRGBAOptions
): CoherenceGroupDisplayState => {
  let totalIntensity = 0;
  for ( let i = 0; i < groupStates.length; i++ ) {
    totalIntensity += groupStates[ i ].intensity;
  }

  if ( totalIntensity <= 0 ) {
    return groupStates[ getFallbackGroupIndex( groupStates, options ) ];
  }

  const threshold = hashToUnitInterval(
    options?.xIndex ?? 0,
    options?.yIndex ?? 0,
    options?.decoherenceFrame ?? 0
  ) * totalIntensity;
  let cumulativeIntensity = 0;
  for ( let i = 0; i < groupStates.length; i++ ) {
    cumulativeIntensity += groupStates[ i ].intensity;
    if ( threshold <= cumulativeIntensity ) {
      return groupStates[ i ];
    }
  }

  return groupStates[ groupStates.length - 1 ];
};

const getFallbackGroupIndex = (
  groupStates: CoherenceGroupDisplayState[],
  options?: FieldSampleRGBAOptions
): number => {
  return Math.floor( hashToUnitInterval(
    options?.xIndex ?? 0,
    options?.yIndex ?? 0,
    options?.decoherenceFrame ?? 0
  ) * groupStates.length );
};

const hashToUnitInterval = ( xIndex: number, yIndex: number, decoherenceFrame: number ): number => {
  const raw = Math.sin(
    ( xIndex + 0.5 ) * 12.9898 +
    ( yIndex + 0.5 ) * 78.233 +
    ( decoherenceFrame + 0.5 ) * 37.719
  ) * 43758.5453123;
  return raw - Math.floor( raw );
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
  const decoherenceFrame = Math.floor( options.time * DECOHERENCE_GLIMMER_RATE_HZ );

  for ( let yIndex = 0; yIndex < options.height; yIndex++ ) {
    const y = ( yIndex + 0.5 ) * options.regionHeight / options.height - options.regionHeight / 2;
    for ( let xIndex = 0; xIndex < options.width; xIndex++ ) {
      const x = obstacle.kind === 'doubleSlit' && xIndex === barrierGridX ?
                obstacle.barrierX :
                xIndex * options.regionWidth / options.width;
      const sample = evaluateAnalyticalSample( options.parameters, x, y, options.time );
      statusCounts[ sample.kind ]++;
      const color = getFieldSampleRGBA( sample, options.displayMode, options.baseColor, options.amplitudeScale, {
        xIndex: xIndex,
        yIndex: yIndex,
        decoherenceFrame: decoherenceFrame
      } );
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
