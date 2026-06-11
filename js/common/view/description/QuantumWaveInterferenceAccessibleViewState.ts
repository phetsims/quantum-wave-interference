// Copyright 2026, University of Colorado Boulder

/**
 * Quantum Wave Interference-owned accessible view-state contracts for authored agent-facing snapshots. These types intentionally live in
 * the sim instead of Scenery because the snapshot shape is a semantic Quantum Wave Interference contract, not a generic Node API.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SourceType } from '../../model/SourceType.js';
import { type WaveDisplayMode } from '../../model/WaveDisplayMode.js';

/**
 * Snapshot of the detector-screen panel. When visible, perspective distinguishes the front-on experiment view from
 * the skewed side-view used in the Single Particles and High Intensity screens. numberOfSnapshots is present only when
 * the scene supports snapshot stacking; detectorScreenScaleIndex is present only when a zoom control exists.
 */
export type DetectorScreenViewState = {
  visible: false;
} | {
  visible: true;
  perspective: 'frontFacing' | 'frontFacingSkewed';
  hitCount: number;
  numberOfSnapshots?: number;
  detectorScreenScaleIndex?: number;
};

/**
 * Wrapper fragment that names the detectorScreen sub-tree; merged into the screen-level accessible view state object
 * returned by DetectorScreenNode.getAccessibleViewState().
 */
export type DetectorScreenViewStateFragment = {
  detectorScreen: DetectorScreenViewState;
};

/**
 * Snapshot of the interference-pattern graph panel. Includes the active source type (e.g. light vs. electron) and
 * detection mode so agents can describe whether the graph shows a wave or particle pattern.
 */
export type DetectorPatternGraphViewState = {
  visible: false;
} | {
  visible: true;
  sourceType: SourceType;
  detectionMode: DetectionMode;
  hitCount: number;
};

/**
 * Wrapper fragment that names the detectorPatternGraph sub-tree; merged into the screen-level accessible view state.
 */
export type DetectorPatternGraphViewStateFragment = {
  detectorPatternGraph: DetectorPatternGraphViewState;
};

/**
 * Snapshot of the slit-barrier apparatus. slitPositionFraction, slitSeparationMM, and the covered/detector flags are
 * present only when barrierType is 'doubleSlit'; for other barrier types only barrierType is populated.
 * slitPositionFraction is a normalized [0,1] position of the slit pair within the wave region; slitSeparationMM is the
 * physical gap between slits in millimeters.
 */
export type SlitBarrierViewState = {
  barrierType: string;
  slitPositionFraction?: number;
  slitSeparationMM?: number;
  topSlitCovered?: boolean;
  bottomSlitCovered?: boolean;
  topSlitDetector?: boolean;
  bottomSlitDetector?: boolean;
};

/**
 * Wrapper fragment that names the slitBarrier sub-tree; merged into the screen-level accessible view state.
 */
export type SlitBarrierViewStateFragment = {
  slitBarrier: SlitBarrierViewState;
};

/**
 * Snapshot of the wave-visualization region. regionWidthMeters is the physical width of the wave region in meters;
 * effectiveWavelengthMeters is the current wavelength (possibly modulated by the source) in meters. Both are needed
 * by agents to express proportional wave features in physical units.
 */
export type WaveVisualizationViewState = {
  visible: false;
} | {
  visible: true;
  sourceType: SourceType;
  waveDisplayMode: WaveDisplayMode;
  regionWidthMeters: number;
  effectiveWavelengthMeters: number;
};

/**
 * Wrapper fragment that names the waveVisualization sub-tree; merged into the screen-level accessible view state.
 */
export type WaveVisualizationViewStateFragment = {
  waveVisualization: WaveVisualizationViewState;
};

/**
 * Snapshot of the tape-measure tool. basePosition and tipPosition are in view coordinates (pixels from the top-left
 * of the ScreenView); agents compute the distance by differencing the two points.
 */
export type TapeMeasureViewState = {
  visible: false;
} | {
  visible: true;
  basePosition: { x: number; y: number };
  tipPosition: { x: number; y: number };
};

/**
 * Snapshot of the stopwatch tool. elapsedTimeSeconds is the accumulated time in seconds since the last reset.
 */
export type StopwatchViewState = {
  visible: false;
} | {
  visible: true;
  isRunning: boolean;
  elapsedTimeSeconds: number;
};

/**
 * Snapshot of the time-plot tool. probePosition is the sample probe in view coordinates; chartPosition is the
 * top-left corner of the chart panel in view coordinates.
 */
export type TimePlotViewState = {
  visible: false;
} | {
  visible: true;
  probePosition: { x: number; y: number };
  chartPosition: { x: number; y: number };
};

/**
 * Snapshot of the position-plot tool (spatial cross-section of the wave amplitude).
 */
export type PositionPlotViewState = {
  visible: false;
} | {
  visible: true;

  // Normalized y-position of the sampled row, 0 = top and 1 = bottom of the wave region
  lineYFraction: number;
};

/**
 * Aggregate snapshot of all four measurement tools. Each field is always present regardless of visibility;
 * the per-tool discriminated union carries the visibility flag.
 */
export type MeasurementToolsViewState = {
  tapeMeasure: TapeMeasureViewState;
  stopwatch: StopwatchViewState;
  timePlot: TimePlotViewState;
  positionPlot: PositionPlotViewState;
};

/**
 * Wrapper fragment that names the measurementTools sub-tree; merged into the screen-level accessible view state.
 */
export type MeasurementToolsViewStateFragment = {
  measurementTools: MeasurementToolsViewState;
};

/**
 * Snapshot of a single-particle detector probe tool. available indicates whether the tool has been placed in the sim;
 * visible is true only when available is also true. probability is the detection probability at the probe location
 * (dimensionless, [0,1]). radius is the probe acceptance radius in view coordinates. position is in view coordinates.
 */
export type DetectorToolViewState = {
  available: boolean;
  visible: boolean;
  state: string;
  probability: number;
  radius: number;
  position: { x: number; y: number };
};

/**
 * Wrapper fragment that names the detectorTool sub-tree; merged into the screen-level accessible view state by
 * DetectorProbeNode.getAccessibleViewState().
 */
export type DetectorToolViewStateFragment = {
  detectorTool: DetectorToolViewState;
};

/**
 * Snapshot of one path-detector (left or right slit detector). hits is the cumulative particle-detection count since
 * the last reset; it is only present when visible is true.
 */
export type PathDetectorViewState = {
  visible: false;
} | {
  visible: true;
  hits: number;
};

/**
 * Aggregate snapshot of the path-detector pair at the two slits. visible is false when neither slit has a detector,
 * in which case left and right are absent. When visible is true, each side carries its own PathDetectorViewState.
 * Produced by createPathDetectorsViewState().
 */
export type PathDetectorsViewState = {
  visible: boolean;
  left?: PathDetectorViewState;
  right?: PathDetectorViewState;
};
