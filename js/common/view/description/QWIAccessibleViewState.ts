// Copyright 2026, University of Colorado Boulder

/**
 * QWI-owned accessible view-state contracts for authored agent-facing snapshots. These types intentionally live in
 * the sim instead of Scenery because the snapshot shape is a semantic QWI contract, not a generic Node API.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SourceType } from '../../model/SourceType.js';
import { type WaveDisplayMode } from '../../model/WaveDisplayMode.js';

export type DetectorScreenViewState = {
  visible: false;
} | {
  visible: true;
  perspective: 'frontFacing' | 'frontFacingSkewed';
  hitCount: number;
  numberOfSnapshots?: number;
  detectorScreenScaleIndex?: number;
};

export type DetectorScreenViewStateFragment = {
  detectorScreen: DetectorScreenViewState;
};

export type DetectorPatternGraphViewState = {
  visible: false;
} | {
  visible: true;
  sourceType: SourceType;
  detectionMode: DetectionMode;
  hitCount: number;
};

export type DetectorPatternGraphViewStateFragment = {
  detectorPatternGraph: DetectorPatternGraphViewState;
};

export type SlitBarrierViewState = {
  barrierType: string;
  slitPositionFraction?: number;
  slitSeparationMM?: number;
  topSlitCovered?: boolean;
  bottomSlitCovered?: boolean;
  topSlitDetector?: boolean;
  bottomSlitDetector?: boolean;
};

export type SlitBarrierViewStateFragment = {
  slitBarrier: SlitBarrierViewState;
};

export type WaveVisualizationViewState = {
  visible: false;
} | {
  visible: true;
  sourceType: SourceType;
  waveDisplayMode: WaveDisplayMode;
  regionWidthMeters: number;
  effectiveWavelengthMeters: number;
};

export type WaveVisualizationViewStateFragment = {
  waveVisualization: WaveVisualizationViewState;
};

export type TapeMeasureViewState = {
  visible: false;
} | {
  visible: true;
  basePosition: { x: number; y: number };
  tipPosition: { x: number; y: number };
};

export type StopwatchViewState = {
  visible: false;
} | {
  visible: true;
  isRunning: boolean;
  elapsedTimeSeconds: number;
};

export type TimePlotViewState = {
  visible: boolean;
};

export type PositionPlotViewState = {
  visible: boolean;
};

export type MeasurementToolsViewState = {
  tapeMeasure: TapeMeasureViewState;
  stopwatch: StopwatchViewState;
  timePlot: TimePlotViewState;
  positionPlot: PositionPlotViewState;
};

export type MeasurementToolsViewStateFragment = {
  measurementTools: MeasurementToolsViewState;
};

export type DetectorToolViewState = {
  available: boolean;
  visible: boolean;
  state: string;
  probability: number;
  radius: number;
  position: { x: number; y: number };
};

export type DetectorToolViewStateFragment = {
  detectorTool: DetectorToolViewState;
};

export type PathDetectorViewState = {
  visible: false;
} | {
  visible: true;
  hits: number;
};

export type PathDetectorsViewState = {
  visible: boolean;
  left?: PathDetectorViewState;
  right?: PathDetectorViewState;
};
