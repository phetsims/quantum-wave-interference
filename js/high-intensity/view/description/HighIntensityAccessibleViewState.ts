// Copyright 2026, University of Colorado Boulder

/**
 * Accessible view-state types for the High Intensity screen. The semantic fragment is intentionally not raw model
 * state and not final localized text. It is the screen-reader-relevant meaning of the current experiment that is
 * included in the full ScreenView.getAccessibleViewState() snapshot.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { type DetectionMode } from '../../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../../common/model/SourceType.js';
import { type WaveDisplayMode } from '../../../common/model/WaveDisplayMode.js';
import { type HitStage } from '../../../common/view/description/BandAnalysis.js';
import { type DetectorPatternGraphViewState, type DetectorScreenViewState, type MeasurementToolsViewState, type SlitBarrierViewState, type WaveVisualizationViewState } from '../../../common/view/description/QWIAccessibleViewState.js';
import { type WavelengthColorZone } from '../../../common/view/WavelengthColorUtils.js';

export type QWIPatternKind = 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier';
export type QWIDisplayMode = 'screen' | 'graph';
export type QWIPatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';
export type QWIWaveProgressStage = 'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen';
export type QWIWaveProgressCheckpoint = 'none' | 'quarter' | 'half' | 'threeQuarters' | 'full';
export type QWIWavefrontSpacing = 'tightlyPacked' | 'moderatelySpaced' | 'widelySpaced';
export type QWIWaveSpeedDescription = 'slow' | 'medium' | 'fast';
export type QWIClockSpeedDescription = 'slow' | 'normal' | 'fast';
export type QWIBandSpacingDescription = 'farApart' | 'mediumSpaced' | 'closelySpaced';
export type QWIValueTrend = 'increased' | 'decreased' | 'unchanged';

export type HighIntensitySemanticAccessibleViewState = {
  sourceType: SourceType;
  isPlaying: boolean;
  clockSpeedDescription: QWIClockSpeedDescription;
  isEmitting: boolean;
  isEmitterEnabled: boolean;
  isMaxHitsReached: boolean;
  detectionMode: DetectionMode;
  displayMode: QWIDisplayMode;
  screenBrightness: number;
  screenBrightnessPercent: number;
  waveDisplayMode: WaveDisplayMode;
  slitConfiguration: SlitConfigurationWithNoBarrier;
  patternKind: QWIPatternKind;
  isDoubleSlitInterference: boolean;
  wavelengthNM: number;
  wavelengthColorZone: WavelengthColorZone | null;
  wavefrontSpacing: QWIWavefrontSpacing;
  particleSpeedMetersPerSecond: number;
  waveSpeedDescription: QWIWaveSpeedDescription;
  effectiveWavelengthPicometers: number;
  slitSeparationMM: number | null;
  slitSeparationMicrometers: number | null;
  bandSpacingDescription: QWIBandSpacingDescription;
  hitStage: HitStage;
  totalHits: number;
  patternFormation: QWIPatternFormation;
  waveProgress: {
    stage: QWIWaveProgressStage;
    checkpoint: QWIWaveProgressCheckpoint;
    wavefrontPercent: number;
    hasReachedSlits: boolean;
    hasPassedSlits: boolean;
    hasReachedScreen: boolean;
  };
  leftDetectorHits: number;
  rightDetectorHits: number;
  numberOfSnapshots: number;
};

export type HighIntensityAccessibleViewState = HighIntensitySemanticAccessibleViewState & {
  detectorScreen: DetectorScreenViewState;
  detectorPatternGraph: DetectorPatternGraphViewState;
  waveVisualization: WaveVisualizationViewState;
  slitBarrier: SlitBarrierViewState;
  measurementTools: MeasurementToolsViewState;
};
