// Copyright 2026, University of Colorado Boulder

/**
 * Query parameters supported by this simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { QueryStringMachine } from '../../../query-string-machine/js/QueryStringMachineModule.js';
import QuantumWaveInterferenceConstants from './QuantumWaveInterferenceConstants.js';

const QuantumWaveInterferenceQueryParameters = QueryStringMachine.getAll( {

  // Internal performance tuning knob for the wave visualization grid. For example,
  // ?waveSolverGridSize=100 reduces the default 120x120 solver grid to 100x100.
  waveSolverGridSize: {
    type: 'number',
    defaultValue: 120,
    isValidValue: value => Number.isInteger( value ) && value > 0 && value <= 1000
  },

  // Internal tuning knob for the wave visualization's color mapping. Values greater than 1 multiply displayed
  // wave amplitudes before color clamping, making weak post-slit waves bolder.
  waveVisualizationColorPower: {
    type: 'number',
    defaultValue: 1.8,
    isValidValue: value => value > 0 && value <= 10
  },

  // Additional amplitude-only contrast multiplier for the wave visualization's Amplitude display modes.
  // This leaves Electric Field, Real part, and Imaginary part color behavior at the base color-power setting.
  waveVisualizationAmplitudeColorPowerMultiplier: {
    type: 'number',
    defaultValue: 1.5,
    isValidValue: value => value > 0 && value <= 10
  },

  // Fraction of the wave region over which waveVisualizationColorPower ramps from 1 to the full value after the barrier.
  waveVisualizationColorPowerRampDistance: {
    type: 'number',
    defaultValue: 0.2,
    isValidValue: value => value > 0 && value <= 1
  },

  // Internal performance tuning knob for the shared detector screen texture. The default 1 renders
  // one texture pixel per screen pixel. For example, ?detectorScreenTextureScale=2 renders 4x as
  // many texture pixels for supersampled quality, and ?detectorScreenTextureScale=0.5 renders 1/4 as many.
  detectorScreenTextureScale: {
    type: 'number',
    defaultValue: 1,
    isValidValue: value => value > 0 && value <= 4
  },

  // Internal performance tuning knob for the Position Plot. The default 2 samples at twice the chart
  // pixel width. Lower values reduce evaluate() calls while dragging/showing the tool.
  positionPlotSamplesPerPixel: {
    type: 'number',
    defaultValue: 2,
    isValidValue: value => value > 0 && value <= 8
  },

  // Internal performance tuning knob for the Time Plot. This controls both the number of stored points
  // and the sample interval over the one-second visible time window.
  timePlotMaxSamples: {
    type: 'number',
    defaultValue: 600,
    isValidValue: value => Number.isInteger( value ) && value > 0 && value <= 2000
  },

  // Internal testing knob for temporarily lowering the detector-screen hit cap. For example, ?maxHits=20 makes
  // max-hit behavior easy to verify without waiting for 25,000 hits.
  maxHits: {
    type: 'number',
    defaultValue: QuantumWaveInterferenceConstants.MAX_HITS,
    isValidValue: value => Number.isInteger( value ) &&
                           value > 0 &&
                           value <= QuantumWaveInterferenceConstants.MAX_HITS
  },

  // Internal performance tuning knob for the vertical detector graph on High Intensity/Single Particles.
  // The default 1 uses 200 detector-edge samples, decoupled from waveSolverGridSize. Try 0.5 or 0.25 to reduce graph path work.
  detectorPatternGraphSampleScale: {
    type: 'number',
    defaultValue: 1,
    isValidValue: value => value > 0 && value <= 4
  },

  // Internal performance tuning knob for the Experiment screen graph. The default 8 samples at 8x chart
  // pixel width for a smooth theoretical curve.
  experimentGraphSamplesPerPixel: {
    type: 'number',
    defaultValue: 8,
    isValidValue: value => value > 0 && value <= 16
  },

  // Internal performance tuning knob for the Experiment screen detector texture. The default 2 preserves
  // the current supersampled rendering. This is separate from detectorScreenTextureScale, which is used
  // by the High Intensity and Single Particles shared detector screen.
  experimentDetectorTextureScale: {
    type: 'number',
    defaultValue: 2,
    isValidValue: value => value > 0 && value <= 4
  }
} );

export default QuantumWaveInterferenceQueryParameters;
