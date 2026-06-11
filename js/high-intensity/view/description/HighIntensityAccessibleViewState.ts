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
import { type QuantumWaveInterferenceClockSpeedDescription } from '../../../common/view/description/getClockSpeedDescription.js';
import { type QuantumWaveInterferencePatternKind } from '../../../common/view/description/getPatternKind.js';
import { type WavePeakSpacingCategory } from '../../../common/view/description/getWavePeakSpacingCategory.js';
import { type DetectorPatternGraphViewState, type DetectorScreenViewState, type MeasurementToolsViewState, type PathDetectorsViewState, type SlitBarrierViewState, type WaveVisualizationViewState } from '../../../common/view/description/QuantumWaveInterferenceAccessibleViewState.js';
import { type WavelengthColorZone } from '../../../common/view/WavelengthColorUtils.js';

// Re-exported from their shared common-code locations so existing High Intensity imports keep working.
export type { QuantumWaveInterferenceClockSpeedDescription, QuantumWaveInterferencePatternKind };

// Whether the detector output is shown as a visual brightness pattern on the screen ('screen') or as a bar graph ('graph').
export type QuantumWaveInterferenceDisplayMode = 'screen' | 'graph';

// Lifecycle stage of the interference/diffraction pattern on the detector screen.
// 'empty' — no hits or waves yet; 'forming' — pattern is accumulating but not saturated;
// 'complete' — formation factor has reached the completion threshold; 'collectingHits' — particle-detection
// mode is active and hits are being recorded; 'paused' — simulation is paused mid-formation;
// 'notApplicable' — pattern formation is not meaningful in the current configuration.
export type QuantumWaveInterferencePatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';

// Coarse spatial stage of the leading wavefront, used to drive screen-reader narration of wave propagation.
// Ordered roughly from source to screen: 'sourceOff' — emitter is inactive; 'travelingToSlits' — wavefront
// is between the source and the barrier; 'atSlits' — wavefront is at or immediately past the barrier;
// 'interferingAfterSlits' / 'diffractingAfterSlits' / 'whichPathAfterSlits' — post-barrier propagation
// styled by pattern kind; 'directToScreen' — no barrier present; 'hittingScreen' — wavefront has reached the detector.
export type QuantumWaveInterferenceWaveProgressStage = 'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen';

// Discretized distance milestone of the wavefront across the simulation region (0 %, 25 %, 50 %, 75 %, 100 %).
// Used to fire screen-reader alerts at meaningful spatial thresholds without flooding with continuous updates.
export type QuantumWaveInterferenceWaveProgressCheckpoint = 'none' | 'quarter' | 'half' | 'threeQuarters' | 'full';

// Categorical description of the spacing between successive wave-peak crests, re-exported under the
// screen-state namespace for use in accessible view-state snapshots.
export type QuantumWaveInterferenceWavefrontSpacing = WavePeakSpacingCategory;

// Categorical speed of the particle/wave through the simulation region, derived from the particle's
// physical speed (e.g., electron vs. neutron vs. photon scenarios). Distinct from clock speed.
export type QuantumWaveInterferenceWaveSpeedDescription = 'slow' | 'medium' | 'fast';

// Categorical description of the spacing between bright bands in the interference/diffraction pattern,
// re-exported under the screen-state namespace for use in accessible view-state snapshots.
export type QuantumWaveInterferenceBandSpacingDescription = BandSpacingCategory;

// Direction of change for a numeric quantity between two successive accessible view-state snapshots,
// used by QuantumWaveInterferenceTransitionDescriber to produce change-alert text.
export type QuantumWaveInterferenceValueTrend = 'increased' | 'decreased' | 'unchanged';

/**
 * Screen-reader-relevant semantic snapshot of the High Intensity screen. Contains the distilled meaning of the
 * current experiment state — not raw model values and not final localized strings. Consumed by formatters in
 * QuantumWaveInterferenceAccessibleStateFormatters and by HighIntensityAccessibleResponses to produce
 * accessible descriptions and alerts. Produced by HighIntensityScreenView.getSemanticAccessibleViewState().
 */
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

  // Localized description of the current graph/histogram pattern, produced by DetectorPatternGraphDescriber. Used
  // when a response must describe the graph surface instead of the detector screen (graph view is active).
  graphPatternDescription: string;
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

/**
 * Full accessible view-state snapshot for the High Intensity screen. Extends the semantic state with the
 * view-level sub-states for each major UI region (detector screen, pattern graph, wave visualization, slit
 * barrier, and measurement tools). Returned by HighIntensityScreenView.getAccessibleViewState() and passed
 * to HighIntensityAccessibleResponses and sequence-item helpers that need the complete picture.
 */
export type HighIntensityAccessibleViewState = HighIntensitySemanticAccessibleViewState & {
  detectorScreen: DetectorScreenViewState;
  detectorPatternGraph: DetectorPatternGraphViewState;
  waveVisualization: WaveVisualizationViewState;
  slitBarrier: SlitBarrierViewState;
  measurementTools: MeasurementToolsViewState;
};
