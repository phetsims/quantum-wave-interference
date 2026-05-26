// Copyright 2026, University of Colorado Boulder

// TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Documentation is not up to PhET standards.

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
 * independent of whether we eventually draw bands newest-on-top, oldest-on-top, or with another
 * visual ordering.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import { type AnalyticalWaveParameters, evaluateAnalyticalSample, type FieldComponent, type FieldLayer, type FieldSample, type LayeredFieldSample } from './AnalyticalWaveKernel.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';

export const FIELD_DISPLAY_CUTOFF = 0.4;
export const UNREACHED_VACUUM = 0;
export const BLOCKED_VACUUM = 48;
export const ABSORBED_VACUUM = 32;

// TODO: Document supplemental types. Do they all need export? See https://github.com/phetsims/quantum-wave-interference/issues/135
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

//TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Generated code seems to prefer not to use 'function' for defining functions. Might facilitate unintended closures.

// TODO: Document, see https://github.com/phetsims/quantum-wave-interference/issues/135
export function getFieldSampleRGBA(
  sample: FieldSample,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor {
  if ( sample.kind !== 'field' ) {
    const gray = sample.kind === 'unreached' ? UNREACHED_VACUUM :
                 sample.kind === 'absorbed' ? ABSORBED_VACUUM :
                 BLOCKED_VACUUM;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  const groupStates = getCoherenceGroupDisplayStates( sample );
  const displayState = getDisplayState( sample, groupStates, amplitudeScale );
  return getDisplayStateRGBA( displayState, displayMode, baseColor, amplitudeScale );
}

/**
 * Maps a LayeredFieldSample to one RGBA pixel by source-over compositing its layers.
 *
 * This is the production path for experimental High Intensity particle-chain rendering. The important
 * distinction from getFieldSampleRGBA is that field layers can return alpha 0..255. Empty/fully faded
 * layers therefore reveal the black Scenery background behind the canvas, instead of being converted
 * into opaque black pixels. The order value comes from the kernel and is the hook for z-order
 * experimentation.
 */
export function getLayeredFieldSampleRGBA(
  sample: LayeredFieldSample,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor {
  //TODO https://github.com/phetsims/quantum-wave-interference/issues/118 Duplicate if statement at line 79
  if ( sample.kind !== 'field' ) {
    const gray = sample.kind === 'unreached' ? UNREACHED_VACUUM :
                 sample.kind === 'absorbed' ? ABSORBED_VACUUM :
                 BLOCKED_VACUUM;
    return { red: gray, green: gray, blue: gray, alpha: 255 };
  }

  // Layers are source-over composited in order. Empty/fully transparent field samples return alpha 0,
  // allowing the Scenery background rectangle behind the canvas to show through as black vacuum.
  // Performance sensitive, so optimized for the base case
  const layers = sample.layers.length <= 1 ? sample.layers : sample.layers.slice().sort( ( a, b ) => a.order - b.order );
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
}

// TODO: Document, see https://github.com/phetsims/quantum-wave-interference/issues/135
function getFieldLayerRGBA(
  layer: FieldLayer,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor {
  const layerSample: Extract<FieldSample, { kind: 'field' }> = {
    kind: 'field',
    components: layer.components
  };
  const groupStates = getCoherenceGroupDisplayStates( layerSample );
  const displayState = getDisplayState( layerSample, groupStates, amplitudeScale );
  return getDisplayStateTransparentRGBA( displayState, displayMode, baseColor, amplitudeScale, layer.alpha );
}

// TODO: Document, see https://github.com/phetsims/quantum-wave-interference/issues/135
function getDisplayStateRGBA(
  displayState: FieldDisplayState,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number
): RGBAColor {
  const real = displayState.real * amplitudeScale;
  const imaginary = displayState.imaginary * amplitudeScale;

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
}

/**
 * Converts one layer's display state into a transparent pixel.
 *
 * getDisplayStateRGBA bakes visibility into RGB by blending toward UNREACHED_VACUUM and always returns
 * alpha 255. That is right for the legacy renderer, but wrong for particle bands because a taper would
 * look like the wave itself darkens. Here intensity still controls the layer's color, while
 * displayState.visibility and layerAlpha control transparency. The black backing node supplies the
 * vacuum color during canvas compositing.
 */
function getDisplayStateTransparentRGBA(
  displayState: FieldDisplayState,
  displayMode: WaveDisplayMode,
  baseColor: RGBColor,
  amplitudeScale: number,
  layerAlpha: number
): RGBAColor {
  const real = displayState.real * amplitudeScale;
  const imaginary = displayState.imaginary * amplitudeScale;

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
}

const blend = ( a: number, b: number, t: number ): number => a + ( b - a ) * t;

// Per-coherence-group rendering summary. Store real/imaginary components directly so rasterization
// does not allocate representative Complex values for every sampled pixel.
type CoherenceGroupDisplayState = {
  coherenceGroup: string;
  real: number;
  imaginary: number;
  intensity: number;
  componentIntensity: number;
  support: number;
  hasExplicitSupport: boolean;
};

// Final display state after reducing physical coherence groups to the legacy single-wave display.
// real/imaginary are the representative value used by real/imaginary display modes.
type FieldDisplayState = {
  real: number;
  imaginary: number;
  intensity: number;
  visibility: number;
};

function getDisplayState(
  sample: Extract<FieldSample, { kind: 'field' }>, // TODO: Unused? See https://github.com/phetsims/quantum-wave-interference/issues/135
  groupStates: CoherenceGroupDisplayState[],
  amplitudeScale: number
): FieldDisplayState {
  if ( groupStates.length === 0 ) {
    return {
      real: 0,
      imaginary: 0,
      intensity: 0,
      visibility: 1
    };
  }

  let totalIntensity = 0;
  let strongestGroup: CoherenceGroupDisplayState | null = null;

  // Match the kernel's representative-complex policy without allocating that Complex: add intensities
  // incoherently across groups, then use the strongest group's phase for real/imaginary displays.
  for ( let i = 0; i < groupStates.length; i++ ) {
    const groupState = groupStates[ i ];
    totalIntensity += groupState.intensity;
    if ( !strongestGroup || groupState.intensity > strongestGroup.intensity ) {
      strongestGroup = groupState;
    }
  }

  const scale = strongestGroup && strongestGroup.intensity > 0 ?
                Math.sqrt( totalIntensity / strongestGroup.intensity ) :
                0;
  return {
    real: strongestGroup ? strongestGroup.real * scale : 0,
    imaginary: strongestGroup ? strongestGroup.imaginary * scale : 0,
    intensity: totalIntensity,
    visibility: getSampleVisibility( groupStates, amplitudeScale )
  };
}

// TODO: Document every function in this whole file, what are the responsibilities? Who calls it, when and why? See https://github.com/phetsims/quantum-wave-interference/issues/135
function getCoherenceGroupDisplayStates( sample: Extract<FieldSample, { kind: 'field' }> ): CoherenceGroupDisplayState[] {
  const components = sample.components;

  // Rasterization calls this once per pixel. The current kernel normally returns 0-2 components, so
  // avoid Map allocation on the common path and use the generic search fallback only for larger samples.
  if ( components.length === 0 ) {
    return [];
  }
  if ( components.length === 1 ) {
    const groupState = createCoherenceGroupDisplayState( components[ 0 ] );
    groupState.intensity = groupState.real * groupState.real + groupState.imaginary * groupState.imaginary;
    return [ groupState ];
  }
  if ( components.length === 2 ) {
    const firstGroupState = createCoherenceGroupDisplayState( components[ 0 ] );
    if ( components[ 0 ].coherenceGroup === components[ 1 ].coherenceGroup ) {
      addComponentToGroupState( firstGroupState, components[ 1 ] );
      firstGroupState.intensity = firstGroupState.real * firstGroupState.real +
                                  firstGroupState.imaginary * firstGroupState.imaginary;
      return [ firstGroupState ];
    }
    else {
      const secondGroupState = createCoherenceGroupDisplayState( components[ 1 ] );
      firstGroupState.intensity = firstGroupState.real * firstGroupState.real +
                                  firstGroupState.imaginary * firstGroupState.imaginary;
      secondGroupState.intensity = secondGroupState.real * secondGroupState.real +
                                   secondGroupState.imaginary * secondGroupState.imaginary;
      return [ firstGroupState, secondGroupState ];
    }
  }

  const groupStates: CoherenceGroupDisplayState[] = [];

  for ( let i = 0; i < components.length; i++ ) {
    const component = components[ i ];
    let groupIndex = getCoherenceGroupDisplayStateIndex( groupStates, component.coherenceGroup );
    if ( groupIndex < 0 ) {
      groupIndex = groupStates.length;
      groupStates.push( createCoherenceGroupDisplayState( component ) );
    }
    else {
      addComponentToGroupState( groupStates[ groupIndex ], component );
    }
  }

  for ( let i = 0; i < groupStates.length; i++ ) {
    groupStates[ i ].intensity = groupStates[ i ].real * groupStates[ i ].real +
                                 groupStates[ i ].imaginary * groupStates[ i ].imaginary;
  }

  return groupStates;
}

function createCoherenceGroupDisplayState( component: FieldComponent ): CoherenceGroupDisplayState {
  return {
    coherenceGroup: component.coherenceGroup,
    real: component.value.real,
    imaginary: component.value.imaginary,
    intensity: 0,
    componentIntensity: component.value.magnitudeSquared,
    support: component.support ?? 0,
    hasExplicitSupport: component.support !== undefined
  };
}

function getCoherenceGroupDisplayStateIndex(
  groupStates: CoherenceGroupDisplayState[],
  coherenceGroup: string
): number {
  for ( let i = 0; i < groupStates.length; i++ ) {
    if ( groupStates[ i ].coherenceGroup === coherenceGroup ) {
      return i;
    }
  }
  return -1;
}

function addComponentToGroupState( groupState: CoherenceGroupDisplayState, component: FieldComponent ): void {
  groupState.real += component.value.real;
  groupState.imaginary += component.value.imaginary;
  groupState.componentIntensity += component.value.magnitudeSquared;
  if ( component.support !== undefined ) {
    groupState.hasExplicitSupport = true;
    groupState.support = Math.max( groupState.support, component.support );
  }
}

function getSampleVisibility( groupStates: CoherenceGroupDisplayState[], amplitudeScale: number ): number {
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
}

export function rasterizeAnalyticalWave( options: AnalyticalWaveRasterOptions ): AnalyticalWaveRaster {
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
}
