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

import Complex from '../../../../dot/js/Complex.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { type AnalyticalWaveParameters, type FieldComponent, type FieldSample, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';

export const FIELD_DISPLAY_CUTOFF = 0.4;
export const UNREACHED_VACUUM = 0;
export const BLOCKED_VACUUM = 48;
export const ABSORBED_VACUUM = 32;

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
    const gray = sample.kind === 'unreached' ? UNREACHED_VACUUM :
                 sample.kind === 'absorbed' ? ABSORBED_VACUUM :
                 BLOCKED_VACUUM;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  const groupStates = getCoherenceGroupDisplayStates( sample );
  const displayState = getDisplayState( sample, groupStates, amplitudeScale );
  return getDisplayStateRGBA( displayState, displayMode, baseColor, amplitudeScale );
};

const getDisplayStateRGBA = (
  displayState: FieldDisplayState,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor => {
  const real = displayState.value.real * amplitudeScale;
  const imaginary = displayState.value.imaginary * amplitudeScale;

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
    const value = displayMode === 'imaginaryPart' ? imaginary : real;
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
    red: roundSymmetric( blend( UNREACHED_VACUUM, fieldColor.red, displayState.visibility ) ),
    green: roundSymmetric( blend( UNREACHED_VACUUM, fieldColor.green, displayState.visibility ) ),
    blue: roundSymmetric( blend( UNREACHED_VACUUM, fieldColor.blue, displayState.visibility ) ),
    alpha: 255
  };
};

const blend = ( a: number, b: number, t: number ): number => a + ( b - a ) * t;

type CoherenceGroupDisplayState = {
  coherenceGroup: string;
  value: Complex;
  intensity: number;
  componentIntensity: number;
  support: number;
  hasExplicitSupport: boolean;
};

type FieldDisplayState = {
  value: Complex;
  intensity: number;
  visibility: number;
};

const getDisplayState = (
  sample: Extract<FieldSample, { kind: 'field' }>,
  groupStates: CoherenceGroupDisplayState[],
  amplitudeScale: number
): FieldDisplayState => {
  if ( groupStates.length === 0 ) {
    return {
      value: new Complex( 0, 0 ),
      intensity: 0,
      visibility: 1
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
                         strongestGroup.value.timesScalar( Math.sqrt( totalIntensity / strongestGroup.intensity ) ) :
                         new Complex( 0, 0 );
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
        value: new Complex( 0, 0 ),
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
    groupStates[ i ].intensity = value.magnitudeSquared;
  }

  return groupStates;
};

const addComponentToGroupState = ( groupState: CoherenceGroupDisplayState, component: FieldComponent ): void => {
  groupState.value.add( component.value );
  groupState.componentIntensity += component.value.magnitudeSquared;
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
