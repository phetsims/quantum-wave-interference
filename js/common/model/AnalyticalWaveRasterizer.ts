// Copyright 2026, University of Colorado Boulder

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Documentation is not up to PhET standards.

/**
 * Minimal pure rasterization harness for analytical wave samples.
 *
 * This intentionally avoids Scenery and browser canvas APIs. It samples AnalyticalWaveKernel at
 * deterministic grid points and maps FieldSample status/value to RGBA bytes. The production canvas
 * renderer uses the same color mapping so tests can exercise rendering semantics without a DOM.
 *
 * There are two rendering paths. The legacy FieldSample path returns opaque pixels and encodes weak
 * field support by blending RGB toward the vacuum color. The layered path is used for the experimental
 * High Intensity particle-chain interpretation: each selected-slit band is drawn as a transparent
 * source-over layer. Its taper changes alpha, not color, so the layer fades out over the black
 * wave-region background instead of becoming a dark wave.
 *
 * This rasterizer is intentionally where z-order policy lives. The kernel describes layers with an
 * order value, and this file sorts and composites them. That keeps the model-level wave description
 * independent from whether we eventually draw bands newest-on-top, oldest-on-top, or with another
 * visual ordering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Complex from '../../../../dot/js/Complex.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import { type AnalyticalWaveParameters, type FieldComponent, type FieldLayer, type FieldSample, type LayeredFieldSample, computeSampleIntensity, evaluateAnalyticalSample } from './AnalyticalWaveKernel.js';
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

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Generated code seems to prefer not to use
//REVIEW   'function' for defining functions. Might facilitate unintended closures.

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

/**
 * Maps a LayeredFieldSample to one RGBA pixel by source-over compositing its layers.
 *
 * This is the production path for experimental High Intensity particle-chain rendering. The important
 * distinction from getFieldSampleRGBA is that field layers can return alpha 0..255. Empty/fully faded
 * layers therefore reveal the black Scenery background behind the canvas, instead of being converted
 * into opaque black pixels. The order value comes from the kernel and is the hook for z-order
 * experimentation.
 */
export const getLayeredFieldSampleRGBA = (
  sample: LayeredFieldSample,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor => {
  //REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 Duplicate if statement at line 79
  if ( sample.kind !== 'field' ) {
    const gray = sample.kind === 'unreached' ? UNREACHED_VACUUM :
                 sample.kind === 'absorbed' ? ABSORBED_VACUUM :
                 BLOCKED_VACUUM;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  // Layers are source-over composited in order. Empty/fully transparent field samples return alpha 0,
  // allowing the Scenery background rectangle behind the canvas to show through as black vacuum.
  const layers = sample.layers.slice().sort( ( a, b ) => a.order - b.order );
  let red = 0;
  let green = 0;
  let blue = 0;
  let alpha = 0;

  for ( let i = 0; i < layers.length; i++ ) {
    const color = getFieldLayerRGBA( layers[ i ], displayMode, baseColor, amplitudeScale );
    const sourceAlpha = color.alpha / 255;
    const destinationAlpha = alpha / 255;
    const outputAlpha = sourceAlpha + destinationAlpha * ( 1 - sourceAlpha );

    if ( outputAlpha > 0 ) {
      red = ( color.red * sourceAlpha + red * destinationAlpha * ( 1 - sourceAlpha ) ) / outputAlpha;
      green = ( color.green * sourceAlpha + green * destinationAlpha * ( 1 - sourceAlpha ) ) / outputAlpha;
      blue = ( color.blue * sourceAlpha + blue * destinationAlpha * ( 1 - sourceAlpha ) ) / outputAlpha;
    }
    alpha = outputAlpha * 255;
  }

  return {
    red: roundSymmetric( red ),
    green: roundSymmetric( green ),
    blue: roundSymmetric( blue ),
    alpha: roundSymmetric( alpha )
  };
};

const getFieldLayerRGBA = (
  layer: FieldLayer,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor => {
  const layerSample: Extract<FieldSample, { kind: 'field' }> = {
    kind: 'field',
    components: layer.components
  };
  const groupStates = getCoherenceGroupDisplayStates( layerSample );
  const displayState = getDisplayState( layerSample, groupStates, amplitudeScale );
  return getDisplayStateTransparentRGBA( displayState, displayMode, baseColor, amplitudeScale, layer.alpha );
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

/**
 * Converts one layer's display state into a transparent pixel.
 *
 * getDisplayStateRGBA bakes visibility into RGB by blending toward UNREACHED_VACUUM and always returns
 * alpha 255. That is right for the legacy renderer, but wrong for particle bands because a taper would
 * look like the wave itself darkens. Here intensity still controls the layer's color, while
 * displayState.visibility and layerAlpha control transparency. The black backing node supplies the
 * vacuum color during canvas compositing.
 */
const getDisplayStateTransparentRGBA = (
  displayState: FieldDisplayState,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number,
  layerAlpha: number
): RGBAColor => {
  const real = displayState.value.real * amplitudeScale;
  const imaginary = displayState.value.imaginary * amplitudeScale;

  let intensity: number;
  if ( displayMode === 'timeAveragedIntensity' ) {
    intensity = clamp(
      FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * displayState.intensity * amplitudeScale * amplitudeScale,
      0,
      1
    );
  }
  else if ( displayMode === 'magnitude' ) {
    intensity = clamp(
      FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * Math.sqrt( displayState.intensity ) * amplitudeScale,
      0,
      1
    );
  }
  else {
    const value = displayMode === 'imaginaryPart' ? imaginary : real;
    intensity = value > 0 ?
                clamp( FIELD_DISPLAY_CUTOFF + ( 1 - FIELD_DISPLAY_CUTOFF ) * value, FIELD_DISPLAY_CUTOFF, 1 ) :
                clamp( FIELD_DISPLAY_CUTOFF * ( 1 + value ), 0, FIELD_DISPLAY_CUTOFF );
  }

  // Unlike getDisplayStateRGBA, this does not preblend with UNREACHED_VACUUM. The field color stays
  // chromatic while alpha carries visibility and particle-chain taper strength.
  return {
    red: roundSymmetric( baseColor.red * intensity ),
    green: roundSymmetric( baseColor.green * intensity ),
    blue: roundSymmetric( baseColor.blue * intensity ),
    alpha: roundSymmetric( 255 * clamp( displayState.visibility * layerAlpha, 0, 1 ) )
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
  const barrier = options.parameters.barrier;
  const barrierGridX = barrier.kind === 'doubleSlit' ?
                       roundSymmetric( barrier.barrierX / options.regionWidth * options.width ) :
                       -1;

  for ( let yIndex = 0; yIndex < options.height; yIndex++ ) {
    const y = ( yIndex + 0.5 ) * options.regionHeight / options.height - options.regionHeight / 2;
    for ( let xIndex = 0; xIndex < options.width; xIndex++ ) {
      const x = barrier.kind === 'doubleSlit' && xIndex === barrierGridX ?
                barrier.barrierX :
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
