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
import { type BandSpacingCategory, type HitStage } from '../../../common/view/description/BandAnalysis.js';
import { type WavePeakSpacingCategory } from '../../../common/view/description/getWavePeakSpacingCategory.js';
import { type DetectorPatternGraphViewState, type DetectorScreenViewState, type MeasurementToolsViewState, type PathDetectorsViewState, type SlitBarrierViewState, type WaveVisualizationViewState } from '../../../common/view/description/QuantumWaveInterferenceAccessibleViewState.js';
import { type WavelengthColorZone } from '../../../common/view/WavelengthColorUtils.js';

export type QuantumWaveInterferencePatternKind = 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier';
export type QuantumWaveInterferenceDisplayMode = 'screen' | 'graph';
export type QuantumWaveInterferencePatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';
export type QuantumWaveInterferenceWaveProgressStage = 'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen';
export type QuantumWaveInterferenceWaveProgressCheckpoint = 'none' | 'quarter' | 'half' | 'threeQuarters' | 'full';
export type QuantumWaveInterferenceWavefrontSpacing = WavePeakSpacingCategory;
export type QuantumWaveInterferenceWaveSpeedDescription = 'slow' | 'medium' | 'fast';
export type QuantumWaveInterferenceClockSpeedDescription = 'slow' | 'normal' | 'fast';
export type QuantumWaveInterferenceBandSpacingDescription = BandSpacingCategory;
export type QuantumWaveInterferenceValueTrend = 'increased' | 'decreased' | 'unchanged';

export type HighIntensitySemanticAccessibleViewState = {
  sourceType: SourceType;
  isPlaying: boolean;
  clockSpeedDescription: QuantumWaveInterferenceClockSpeedDescription;
  isEmitting: boolean;
  isEmitterEnabled: boolean;
  isMaxHitsReached: boolean;
  detectionMode: DetectionMode;
  displayMode: QuantumWaveInterferenceDisplayMode;
  screenBrightnessPercent: number;
  waveDisplayMode: WaveDisplayMode;
  slitConfiguration: SlitConfigurationWithNoBarrier;
  patternKind: QuantumWaveInterferencePatternKind;
  wavelengthNM: number;
  wavelengthColorZone: WavelengthColorZone | null;
  wavefrontSpacing: QuantumWaveInterferenceWavefrontSpacing;
  particleSpeedMetersPerSecond: number;
  waveSpeedDescription: QuantumWaveInterferenceWaveSpeedDescription;
  effectiveWavelengthPicometers: number;
  slitSeparationMM: number | null;
  slitSeparationMicrometers: number | null;
  bandSpacingDescription: QuantumWaveInterferenceBandSpacingDescription;
  hitStage: HitStage;
  totalHits: number;
  patternFormation: QuantumWaveInterferencePatternFormation;
  waveProgress: {
    stage: QuantumWaveInterferenceWaveProgressStage;
    checkpoint: QuantumWaveInterferenceWaveProgressCheckpoint;
    wavefrontPercent: number;
    hasReachedSlits: boolean;
    hasPassedSlits: boolean;
    hasReachedScreen: boolean;
  };
  pathDetectors: PathDetectorsViewState;
  numberOfSnapshots: number;
};

export type HighIntensityAccessibleViewState = HighIntensitySemanticAccessibleViewState & {
  detectorScreen: DetectorScreenViewState;
  detectorPatternGraph: DetectorPatternGraphViewState;
  waveVisualization: WaveVisualizationViewState;
  slitBarrier: SlitBarrierViewState;
  measurementTools: MeasurementToolsViewState;
};
