// Copyright 2026, University of Colorado Boulder

/**
 * Semantic accessibility state for the High Intensity screen. This is intentionally not raw model state and not final
 * localized text. It is the screen-reader-relevant meaning of the current experiment, shared by context responses and
 * the current-state PDOM template.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import { clamp } from '../../../../../dot/js/util/clamp.js';
import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import { type DetectionMode } from '../../../common/model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../../common/model/SlitConfiguration.js';
import { type SourceType } from '../../../common/model/SourceType.js';
import { type WaveDisplayMode } from '../../../common/model/WaveDisplayMode.js';
import BandAnalysis, { type BandAnalysisResult, type HitStage } from '../../../common/view/description/BandAnalysis.js';
import { getWavelengthColorZone, type WavelengthColorZone } from '../../../common/view/WavelengthColorUtils.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import HighIntensitySceneModel from '../../model/HighIntensitySceneModel.js';

export type QWIPatternKind = 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier';
export type QWIDisplayMode = 'screen' | 'graph';
export type QWIPatternFormation = 'empty' | 'forming' | 'complete' | 'collectingHits' | 'paused' | 'notApplicable';
export type QWIWaveProgressStage = 'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen';
export type QWIWaveProgressCheckpoint = 'none' | 'quarter' | 'half' | 'threeQuarters' | 'full';
export type QWIValueTrend = 'increased' | 'decreased' | 'unchanged';

export type QWIAccessibleState = {
  sourceType: SourceType;
  isPlaying: boolean;
  timeSpeedName: string;
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
  particleSpeedMetersPerSecond: number;
  effectiveWavelengthMeters: number;
  effectiveWavelengthPicometers: number;
  slitSeparationMM: number | null;
  slitSeparationMicrometers: number | null;
  bandAnalysis: BandAnalysisResult;
  hitStage: HitStage;
  totalHits: number;
  patternFormation: QWIPatternFormation;
  waveProgress: {
    stage: QWIWaveProgressStage;
    checkpoint: QWIWaveProgressCheckpoint;
    wavefrontFraction: number;
    wavefrontPercent: number;
    hasReachedSlits: boolean;
    hasPassedSlits: boolean;
    hasReachedScreen: boolean;
  };
  leftDetectorHits: number;
  rightDetectorHits: number;
  numberOfSnapshots: number;
  tools: {
    tapeMeasure: boolean;
    stopwatch: boolean;
    timePlot: boolean;
    positionPlot: boolean;
  };
};

const getPatternKind = ( slitConfiguration: SlitConfigurationWithNoBarrier ): QWIPatternKind =>
  slitConfiguration === 'noBarrier' ? 'noBarrier' :
  showsDoubleSlitInterferencePattern( slitConfiguration ) ? 'doubleSlitInterference' :
  ( slitConfiguration === 'leftDetector' || slitConfiguration === 'rightDetector' || slitConfiguration === 'bothDetectors' ) ? 'whichPathDiffraction' :
  'singleSlitDiffraction';

const getPatternFormation = ( scene: HighIntensitySceneModel, model: HighIntensityModel ): QWIPatternFormation => {
  if ( scene.detectionModeProperty.value === 'hits' ) {
    return scene.totalHitsProperty.value > 0 ? 'collectingHits' :
           scene.isEmittingProperty.value ? 'collectingHits' :
           'empty';
  }

  if ( !scene.isEmittingProperty.value ) {
    return 'empty';
  }

  if ( !model.isPlayingProperty.value ) {
    return 'paused';
  }

  const formationFactor = scene.detectorPatternFormationFactorProperty.value;
  return formationFactor >= 1 ? 'complete' :
         formationFactor > 0 ? 'forming' :
         'empty';
};

const getWaveProgress = ( scene: HighIntensitySceneModel, patternKind: QWIPatternKind ): QWIAccessibleState['waveProgress'] => {
  if ( !scene.isEmittingProperty.value ) {
    return {
      stage: 'sourceOff',
      checkpoint: 'none',
      wavefrontFraction: 0,
      wavefrontPercent: 0,
      hasReachedSlits: false,
      hasPassedSlits: false,
      hasReachedScreen: false
    };
  }

  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  const waveSolverState = scene.waveSolver.getState();
  const solverTime = scene.waveSolver.getTime();
  const sourceOnTime = typeof waveSolverState.sourceOnTime === 'number' ? waveSolverState.sourceOnTime : solverTime;
  const wavefrontX = propagationSpeed * Math.max( 0, solverTime - sourceOnTime );
  const wavefrontFraction = clamp( wavefrontX / scene.regionWidth, 0, 1 );
  const slitFraction = scene.slitPositionFractionProperty.value;
  const slitWindow = 0.04;
  const hasReachedSlits = wavefrontFraction >= slitFraction;
  const hasPassedSlits = wavefrontFraction > slitFraction + slitWindow;
  const hasReachedScreen = wavefrontFraction >= 1;
  const checkpoint: QWIWaveProgressCheckpoint =
    hasReachedScreen ? 'full' :
    wavefrontFraction >= 0.75 ? 'threeQuarters' :
    wavefrontFraction >= 0.5 ? 'half' :
    wavefrontFraction >= 0.25 ? 'quarter' :
    'none';
  const stage: QWIWaveProgressStage =
    hasReachedScreen ? 'hittingScreen' :
    patternKind === 'noBarrier' ? 'directToScreen' :
    Math.abs( wavefrontFraction - slitFraction ) <= slitWindow ? 'atSlits' :
    !hasReachedSlits ? 'travelingToSlits' :
    patternKind === 'doubleSlitInterference' ? 'interferingAfterSlits' :
    patternKind === 'whichPathDiffraction' ? 'whichPathAfterSlits' :
    'diffractingAfterSlits';

  return {
    stage: stage,
    checkpoint: checkpoint,
    wavefrontFraction: wavefrontFraction,
    wavefrontPercent: roundSymmetric( wavefrontFraction * 100 ),
    hasReachedSlits: hasReachedSlits,
    hasPassedSlits: hasPassedSlits,
    hasReachedScreen: hasReachedScreen
  };
};

export default class QWIAccessibleStateDescriber {

  public constructor( private readonly model: HighIntensityModel ) {}

  public getState(): QWIAccessibleState {
    const scene = this.model.sceneProperty.value;
    const slitConfiguration = scene.slitConfigurationProperty.value;
    const patternKind = getPatternKind( slitConfiguration );
    const isDoubleSlitInterference = patternKind === 'doubleSlitInterference';
    const detectorScreenHalfWidth = scene.regionWidth / 2;
    const bandAnalysis = BandAnalysis.analyzeTheoreticalPattern( scene, detectorScreenHalfWidth );
    const hitStage = BandAnalysis.getHitStage( scene.totalHitsProperty.value, isDoubleSlitInterference );
    const effectiveWavelengthMeters = scene.getEffectiveWavelength();
    const waveProgress = getWaveProgress( scene, patternKind );

    return {
      sourceType: scene.sourceType,
      isPlaying: this.model.isPlayingProperty.value,
      timeSpeedName: this.model.timeSpeedProperty.value.name,
      isEmitting: scene.isEmittingProperty.value,
      isEmitterEnabled: scene.isEmitterEnabledProperty.value,
      isMaxHitsReached: scene.isMaxHitsReachedProperty.value,
      detectionMode: scene.detectionModeProperty.value,
      displayMode: this.model.isIntensityGraphVisibleProperty.value ? 'graph' : 'screen',
      screenBrightness: scene.screenBrightnessProperty.value,
      screenBrightnessPercent: roundSymmetric( scene.screenBrightnessProperty.value / scene.screenBrightnessProperty.range.max * 100 ),
      waveDisplayMode: scene.activeWaveDisplayModeProperty.value,
      slitConfiguration: slitConfiguration,
      patternKind: patternKind,
      isDoubleSlitInterference: isDoubleSlitInterference,
      wavelengthNM: roundSymmetric( scene.wavelengthProperty.value ),
      wavelengthColorZone: scene.sourceType === 'photons' ? getWavelengthColorZone( roundSymmetric( scene.wavelengthProperty.value ) ) : null,
      particleSpeedMetersPerSecond: roundSymmetric( scene.velocityProperty.value ),
      effectiveWavelengthMeters: effectiveWavelengthMeters,
      effectiveWavelengthPicometers: Number( toFixed( effectiveWavelengthMeters * 1e12, 2 ) ),
      slitSeparationMM: slitConfiguration === 'noBarrier' ? null : scene.slitSeparationProperty.value,
      slitSeparationMicrometers: slitConfiguration === 'noBarrier' ? null : Number( toFixed( scene.slitSeparationProperty.value * 1000, 2 ) ),
      bandAnalysis: bandAnalysis,
      hitStage: hitStage,
      totalHits: scene.totalHitsProperty.value,
      patternFormation: getPatternFormation( scene, this.model ),
      waveProgress: waveProgress,
      leftDetectorHits: scene.leftDetectorHitsProperty.value,
      rightDetectorHits: scene.rightDetectorHitsProperty.value,
      numberOfSnapshots: scene.numberOfSnapshotsProperty.value,
      tools: {
        tapeMeasure: this.model.isTapeMeasureVisibleProperty.value,
        stopwatch: this.model.isStopwatchVisibleProperty.value,
        timePlot: this.model.isTimePlotVisibleProperty.value,
        positionPlot: this.model.isPositionPlotVisibleProperty.value
      }
    };
  }
}
