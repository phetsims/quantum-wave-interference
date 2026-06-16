// Copyright 2026, University of Colorado Boulder

/**
 * Standalone context-response Node for the Single Particles screen. It narrates the lifecycle of each emitted wave
 * packet — source start, packet travel toward the barrier, circular wave fronts at the slits, interference after the
 * slits — and the hit that ends the packet on the detector screen. It compares semantic state snapshots before and
 * after model changes so responses describe the meaning of the transition, not only the control value.
 *
 * Unlike the High Intensity screen, the wave on this screen is transient: each packet ends when it is detected, so
 * milestone descriptions do not accumulate in the PDOM state description. Instead, this class exposes
 * packetStatusItem, the single bullet of the "Detector Screen and Experiment Details" list, which describes only
 * the current packet status or the accumulated hits pattern, and hides while the detector screen is empty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { clamp } from '../../../../../dot/js/util/clamp.js';
import { roundSymmetric } from '../../../../../dot/js/util/roundSymmetric.js';
import { type AccessibleListItem } from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import { type SlitConfigurationWithNoBarrier } from '../../../common/model/SlitConfiguration.js';
import { type WaveDisplayMode } from '../../../common/model/WaveDisplayMode.js';
import QuantumWaveInterferenceConstants from '../../../common/QuantumWaveInterferenceConstants.js';
import BandAnalysis, { type BandSpacingCategory, type EnvelopeCategory, type HitStage } from '../../../common/view/description/BandAnalysis.js';
import { formatDetectorPatternDescription, formatLiveHitsDescription } from '../../../common/view/description/DetectorScreenDescriptionFormatter.js';
import formatSourceStoppedResponse from '../../../common/view/description/formatSourceStoppedResponse.js';
import { getClockSpeedDescription, type QuantumWaveInterferenceClockSpeedDescription } from '../../../common/view/description/getClockSpeedDescription.js';
import { getPatternKind, type QuantumWaveInterferencePatternKind } from '../../../common/view/description/getPatternKind.js';
import { getWavePeakSpacingCategory, type WavePeakSpacingCategory } from '../../../common/view/description/getWavePeakSpacingCategory.js';
import { getWavelengthColorZone, type WavelengthColorZone } from '../../../common/view/WavelengthColorUtils.js';
import { type QuantumWaveInterferenceWaveProgressStage } from '../../../high-intensity/view/description/HighIntensityAccessibleViewState.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectorProbeState } from '../../model/DetectorProbe.js';
import type SingleParticlesModel from '../../model/SingleParticlesModel.js';
import SingleParticlesSceneModel from '../../model/SingleParticlesSceneModel.js';

// Response-group keys so rapid per-packet narration self-interrupts instead of flooding the speech queue. Wave
// progress and hit announcements use separate groups so a hit announcement is not replaced by the next packet's
// progress update.
const WAVE_PROGRESS_RESPONSE_GROUP = 'quantum-wave-interference-single-particles-wave-progress';
const HIT_RESPONSE_GROUP = 'quantum-wave-interference-single-particles-hit';
const MAX_HITS_RESPONSE_GROUP = 'quantum-wave-interference-single-particles-max-hits-reached';

// Wave-progress stages that the shared waveProgressChanged message can describe — excludes 'travelingToSlits',
// whose narration is provided by the moving-packet description instead.
type DescribableWaveProgressStage = Exclude<QuantumWaveInterferenceWaveProgressStage, 'travelingToSlits'>;

/**
 * Semantic snapshot of the Single Particles state consumed by this describer. Captured before and after model
 * changes so each transition handler can decide whether the change is user-meaningful and which response to emit.
 */
type SingleParticlesResponseState = {
  scene: SingleParticlesSceneModel;
  isPlaying: boolean;
  clockSpeedDescription: QuantumWaveInterferenceClockSpeedDescription;
  isEmitting: boolean;
  isPacketActive: boolean;
  isMaxHitsReached: boolean;
  detectorProbeState: DetectorProbeState;
  slitConfiguration: SlitConfigurationWithNoBarrier;
  waveDisplayMode: WaveDisplayMode;
  wavelengthNM: number;
  wavelengthColorZone: WavelengthColorZone | null;
  wavefrontSpacing: WavePeakSpacingCategory;
  particleSpeedMetersPerSecond: number;
  slitSeparationMM: number;
  barrierPositionFraction: number;
  totalHits: number;
  hitStage: HitStage;
  bandSpacingDescription: BandSpacingCategory;
  envelopeCategory: EnvelopeCategory;
  patternKind: QuantumWaveInterferencePatternKind;
  waveProgressStage: QuantumWaveInterferenceWaveProgressStage;
};

/**
 * Computes the wave-progress stage of the active packet for accessibility descriptions. The packet center is
 * estimated from the solver's display propagation speed and elapsed solver time (the solver is reset at each
 * emission), starting from the standard negative sigma offset to the left of the source. The thresholds mirror
 * the continuous-wavefront stage computation on the High Intensity screen so both screens narrate the same
 * milestones with the same timing relative to the barrier.
 *
 * @param scene - the active scene whose wave solver, slit geometry, and packet state are read
 * @param patternKind - the current pattern kind, used to select the correct post-slit stage label
 * @returns the wave-progress stage for the current simulation frame
 */
function getPacketWaveProgressStage(
  scene: SingleParticlesSceneModel,
  patternKind: QuantumWaveInterferencePatternKind
): QuantumWaveInterferenceWaveProgressStage {
  if ( !scene.isPacketActiveProperty.value ) {
    return 'sourceOff';
  }

  const propagationSpeed = scene.waveSolver.getDisplayPropagationSpeed();
  if ( propagationSpeed <= 0 ) {
    return 'travelingToSlits';
  }

  const sigmaX0 = QuantumWaveInterferenceConstants.WAVE_PACKET_SIGMA_X_FRACTION * scene.regionWidth;
  const initialCenterX = -QuantumWaveInterferenceConstants.WAVE_PACKET_START_OFFSET_SIGMAS * sigmaX0;
  const packetCenterX = initialCenterX + propagationSpeed * scene.waveSolver.getTime();
  const packetFraction = clamp( packetCenterX / scene.regionWidth, 0, 1 );

  // NOTE: see other duplicate in quantum-wave-interference/js/high-intensity/view/HighIntensityScreenView.ts. The
  // slit-window and circular-wave-overlap thresholds are kept identical so the discrete packet (Single Particles) and
  // the continuous wavefront (High Intensity) narrate the same milestones.
  const slitFraction = scene.barrierPositionFractionProperty.value;
  const slitWindow = 0.04;
  const slitSeparationFraction = scene.slitSeparationProperty.value * 1e-3 / scene.regionWidth;
  const circularWavesOverlapFraction = slitFraction + Math.max( slitWindow, slitSeparationFraction / 2 );
  const hasReachedSlits = packetFraction >= slitFraction;
  const hasReachedScreen = packetFraction >= 1;

  return hasReachedScreen ? 'hittingScreen' :
         patternKind === 'noBarrier' ? 'directToScreen' :
         Math.abs( packetFraction - slitFraction ) <= slitWindow ? 'atSlits' :
         !hasReachedSlits ? 'travelingToSlits' :
         patternKind === 'doubleSlitInterference' && packetFraction < circularWavesOverlapFraction ? 'atSlits' :
         patternKind === 'doubleSlitInterference' ? 'interferingAfterSlits' :
         patternKind === 'whichPathDiffraction' ? 'whichPathAfterSlits' :
         'diffractingAfterSlits';
}

function formatSourceStarted( state: SingleParticlesResponseState ): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.sourceStarted.format( {
    isPlaying: state.isPlaying ? 'true' : 'false',
    timeSpeed: state.clockSpeedDescription
  } );
}

function formatPacketBeamDescription( state: SingleParticlesResponseState ): string {
  return QuantumWaveInterferenceFluent.a11y.singleParticlesState.sourcePacket.format( {
    sourceType: state.scene.sourceType,
    photonColor: state.wavelengthColorZone || 'red',
    waveDisplayMode: state.waveDisplayMode,
    slitSetting: state.slitConfiguration,
    wavefrontSpacing: state.wavefrontSpacing
  } );
}

const formatWaveProgress = (
  state: SingleParticlesResponseState,
  stage: DescribableWaveProgressStage
): string =>
  QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.waveProgressChanged.format( {
    waveProgressStage: stage,
    waveDisplayMode: state.waveDisplayMode,
    patternKind: state.patternKind
  } );

function formatHitDescription( state: SingleParticlesResponseState ): string {
  return state.patternKind === 'doubleSlitInterference' ?
         formatLiveHitsDescription(
           state.hitStage,
           true,
           false,
           {
             spacingCategory: state.bandSpacingDescription,
             envelopeCategory: state.envelopeCategory
           }
         ) :
         formatDetectorPatternDescription(
           true,
           'hits',
           'collectingHits',
           state.patternKind,
           state.waveDisplayMode,
           state.slitConfiguration === 'leftCovered' ? 'leftCovered' : 'rightCovered',
           state.hitStage,
           state.bandSpacingDescription,
           state.envelopeCategory
         );
}

export default class SingleParticlesAccessibleResponses extends Node {

  // Snapshot of semantic state taken after the last handled transition, used as the "before" baseline when deciding
  // whether the next transition is user-meaningful.
  private previousState: SingleParticlesResponseState;

  // True when the most recent transition was a detector-screen hit, so the automatic emitter turn-off that follows a
  // detection in single-shot mode stays silent: the hit response already describes how the packet ended.
  private lastTransitionWasHit = false;

  // Auto-repeat can emit many packets without toggling the source. Only the first packet after a source start or
  // scene clear/restart should produce packet-lifecycle context responses.
  private hasHandledFirstAutoRepeatPacketSinceRestart = false;
  private isCurrentPacketFirstSinceRestart = true;

  // PDOM state item describing the current stage of the in-flight packet (moving packet, at slits, interfering, or
  // reaching the screen), or the accumulated hits pattern when idle; hidden while the detector screen is empty.
  // Because the packet is transient, this single item replaces the accumulating milestone list used on the
  // High Intensity screen; it is the only bullet in the "Detector Screen and Experiment Details" list.
  public readonly packetStatusItem: AccessibleListItem;

  public constructor( private readonly model: SingleParticlesModel ) {
    super( { isDisposable: false } );

    this.previousState = this.getResponseState();

    model.currentIsEmittingProperty.lazyLink( () => this.handleSourceChanged() );
    model.currentTotalHitsProperty.lazyLink( () => this.handleTotalHitsChanged() );
    model.currentIsMaxHitsReachedProperty.lazyLink( () => this.handleMaxHitsChanged() );
    model.accessibleStateStepProperty.lazyLink( () => this.handleAccessibleStateStep() );
    model.currentIsPacketActiveProperty.lazyLink( isPacketActive => {
      if ( isPacketActive ) {
        this.isCurrentPacketFirstSinceRestart = !this.hasHandledFirstAutoRepeatPacketSinceRestart;

        if ( model.currentAutoRepeatProperty.value ) {
          this.hasHandledFirstAutoRepeatPacketSinceRestart = true;
        }
      }
      else {
        this.isCurrentPacketFirstSinceRestart = false;
      }
    } );
    model.currentAutoRepeatProperty.lazyLink( autoRepeat => {
      this.resetFirstPacketResponseTracking();

      if ( autoRepeat && model.currentIsPacketActiveProperty.value ) {
        this.isCurrentPacketFirstSinceRestart = true;
        this.hasHandledFirstAutoRepeatPacketSinceRestart = true;
      }
    } );

    const resetFirstPacketResponsesIfScreenCleared = () => {
      if ( model.currentTotalHitsProperty.value === 0 ) {
        this.resetFirstPacketResponseTracking();
      }
    };
    model.sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( resetFirstPacketResponsesIfScreenCleared );
      }

      this.resetFirstPacketResponseTracking();
      scene.hitsChangedEmitter.addListener( resetFirstPacketResponsesIfScreenCleared );
    } );

    // Changes that have their own responses elsewhere (scene radio buttons, slit configuration controls, parameter
    // sliders, probe measurements, time controls) only refresh the baseline snapshot so later guards compare against
    // current values.
    const updateStateSilently = () => { this.previousState = this.getResponseState(); };
    model.sceneProperty.lazyLink( updateStateSilently );
    model.currentSlitConfigurationProperty.lazyLink( updateStateSilently );
    model.currentWavelengthProperty.lazyLink( updateStateSilently );
    model.currentParticleSpeedProperty.lazyLink( updateStateSilently );
    model.currentSlitSeparationProperty.lazyLink( updateStateSilently );
    model.currentBarrierPositionFractionProperty.lazyLink( updateStateSilently );
    model.currentDetectorProbe.stateProperty.lazyLink( updateStateSilently );
    model.isPlayingProperty.lazyLink( updateStateSilently );
    model.timeSpeedProperty.lazyLink( updateStateSilently );

    const dependencies = this.createDependencies();
    const getState = () => this.getResponseState();

    this.packetStatusItem = {
      stringProperty: DerivedProperty.deriveAny( dependencies, () => {
        const state = getState();
        const stage = state.waveProgressStage;

        // With the source off, describe the accumulated hits pattern. While the packet is between the source and
        // the barrier (or there is no barrier, or the next auto-repeat packet is about to fire), describe the moving
        // packet itself; after that, describe its interaction with the slits and detector screen.
        return !state.isEmitting ?
               formatHitDescription( state ) :
               ( stage === 'sourceOff' || stage === 'travelingToSlits' || stage === 'directToScreen' ) ?
               formatPacketBeamDescription( state ) :
               formatWaveProgress( state, stage );
      } ),

      // With the source off and no hits yet, the leading paragraph ("Detector screen is empty. Photon experiment
      // ready.") already describes the situation, so the bullet hides — mirroring the Experiment screen.
      visibleProperty: DerivedProperty.deriveAny( dependencies, () => {
        const state = getState();
        return state.isEmitting || state.totalHits > 0;
      } )
    };
  }

  /**
   * Returns the deduplicated set of Properties that must trigger recomputation of the PDOM state items. Combines
   * model state with the locale-sensitive Fluent string dependencies so the items stay reactive to both model and
   * locale changes. The accessibleStateStepProperty drives updates for continuous packet travel.
   */
  private createDependencies(): TReadOnlyProperty<unknown>[] {
    return Array.from( new Set( [
      this.model.sceneProperty,
      this.model.isPlayingProperty,
      this.model.timeSpeedProperty,
      this.model.currentIsEmittingProperty,
      this.model.currentIsPacketActiveProperty,
      this.model.currentSlitConfigurationProperty,
      this.model.currentWavelengthProperty,
      this.model.currentParticleSpeedProperty,
      this.model.currentSlitSeparationProperty,
      this.model.currentBarrierPositionFractionProperty,
      this.model.currentWaveDisplayModeProperty,
      this.model.currentTotalHitsProperty,
      this.model.accessibleStateStepProperty,
      ...QuantumWaveInterferenceFluent.a11y.singleParticlesState.sourcePacket.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.waveExperimentState.detectorPattern.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.waveProgressChanged.getDependentProperties()
    ] ) );
  }

  /**
   * Captures the current semantic state of the screen for transition comparison and response formatting.
   *
   * @returns the current Single Particles semantic response state
   */
  private getResponseState(): SingleParticlesResponseState {
    const scene = this.model.sceneProperty.value;
    const slitConfiguration = scene.slitConfigurationProperty.value;
    const patternKind = getPatternKind( slitConfiguration );
    const totalHits = scene.totalHitsProperty.value;
    const bandAnalysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );

    return {
      scene: scene,
      isPlaying: this.model.isPlayingProperty.value,
      clockSpeedDescription: getClockSpeedDescription( this.model.timeSpeedProperty.value ),
      isEmitting: scene.isEmittingProperty.value,
      isPacketActive: scene.isPacketActiveProperty.value,
      isMaxHitsReached: scene.isMaxHitsReachedProperty.value,
      detectorProbeState: scene.detectorProbe.stateProperty.value,
      slitConfiguration: slitConfiguration,
      waveDisplayMode: scene.activeWaveDisplayModeProperty.value,
      wavelengthNM: roundSymmetric( scene.wavelengthProperty.value ),
      wavelengthColorZone: scene.sourceType === 'photons' ? getWavelengthColorZone( roundSymmetric( scene.wavelengthProperty.value ) ) : null,
      wavefrontSpacing: getWavePeakSpacingCategory( scene ),
      particleSpeedMetersPerSecond: scene.particleSpeedProperty.value,
      slitSeparationMM: scene.slitSeparationProperty.value,
      barrierPositionFraction: scene.barrierPositionFractionProperty.value,
      totalHits: totalHits,
      hitStage: BandAnalysis.getHitStage( totalHits, patternKind === 'doubleSlitInterference' ),
      bandSpacingDescription: bandAnalysis.spacingCategory,
      envelopeCategory: bandAnalysis.envelopeCategory,
      patternKind: patternKind,
      waveProgressStage: getPacketWaveProgressStage( scene, patternKind )
    };
  }

  /**
   * Resets the auto-repeat packet-lifecycle response guards so the next emitted packet is treated as the first packet in
   * a fresh run. Called when the source stops, when auto-repeat is toggled, when the active scene changes, and when a
   * scene clear/restart invalidates the current packet.
   */
  private resetFirstPacketResponseTracking(): void {
    this.hasHandledFirstAutoRepeatPacketSinceRestart = false;
    this.isCurrentPacketFirstSinceRestart = true;
  }

  /**
   * Returns whether packet-lifecycle context responses should be emitted for the current packet. In single-shot mode every
   * packet is eligible. In auto-repeat mode, only the first packet after the most recent source start or scene restart is
   * eligible so repeated packets do not keep narrating the same travel and hit stages.
   *
   * @param state - current semantic response state
   * @returns whether packet-lifecycle context responses are eligible for the current packet
   */
  private shouldAddPacketLifecycleContextResponses( state: SingleParticlesResponseState ): boolean {
    return !state.scene.autoRepeatProperty.value || this.isCurrentPacketFirstSinceRestart;
  }

  /**
   * Announces source start and stop. Starting the source announces "Source started ..." followed by the moving
   * packet description, flushing stale queued responses, mirroring the High Intensity screen. Stopping is announced
   * only when the user explicitly turned the source off: turn-offs caused by a detection, max hits, a probe
   * measurement, a scene change, or an experiment parameter change stay silent because those transitions have their
   * own responses.
   */
  private handleSourceChanged(): void {
    const before = this.previousState;
    const after = this.getResponseState();
    this.previousState = after;

    if ( before.isEmitting === after.isEmitting ) {
      return;
    }

    if ( after.isEmitting ) {
      this.lastTransitionWasHit = false;
      this.addAccessibleContextResponse( formatSourceStarted( after ), { flush: true } );

      if ( after.isPlaying && this.shouldAddPacketLifecycleContextResponses( after ) ) {
        this.addAccessibleContextResponse( formatPacketBeamDescription( after ) );
      }
    }
    else {
      const isExplicitUserStop = !this.lastTransitionWasHit &&
                                 !after.isMaxHitsReached &&
                                 before.scene === after.scene &&
                                 before.slitConfiguration === after.slitConfiguration &&
                                 before.wavelengthNM === after.wavelengthNM &&
                                 before.particleSpeedMetersPerSecond === after.particleSpeedMetersPerSecond &&
                                 before.slitSeparationMM === after.slitSeparationMM &&
                                 before.barrierPositionFraction === after.barrierPositionFraction &&
                                 before.detectorProbeState === after.detectorProbeState &&
                                 after.totalHits >= before.totalHits;
      if ( isExplicitUserStop ) {
        this.addAccessibleContextResponse( formatSourceStoppedResponse( 'hits', after.totalHits ) );
      }
      this.resetFirstPacketResponseTracking();
      this.lastTransitionWasHit = false;
    }
  }

  /**
   * Announces the hit that ends a packet on the detector screen, using the stage-aware hits description ("Individual
   * scattered hits appear...", "Hits form evenly spaced bands...") with the running hit count. Decreases (clear
   * screen, parameter changes) and scene swaps stay silent because their causes have their own responses.
   */
  private handleTotalHitsChanged(): void {
    const before = this.previousState;
    const after = this.getResponseState();
    this.previousState = after;

    if ( before.scene !== after.scene || after.totalHits <= before.totalHits ) {
      return;
    }

    this.lastTransitionWasHit = true;

    if ( this.shouldAddPacketLifecycleContextResponses( after ) ) {
      this.addAccessibleContextResponse( formatHitDescription( after ), { responseGroup: HIT_RESPONSE_GROUP } );
    }
  }

  /**
   * Announces that the maximum number of hits has been reached and the source has shut off. The corresponding
   * emitter turn-off is silenced by handleSourceChanged's isMaxHitsReached guard.
   */
  private handleMaxHitsChanged(): void {
    const before = this.previousState;
    const after = this.getResponseState();
    this.previousState = after;

    if ( after.isMaxHitsReached && !before.isMaxHitsReached ) {
      this.addAccessibleContextResponse(
        QuantumWaveInterferenceFluent.a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty, {
          responseGroup: MAX_HITS_RESPONSE_GROUP
        }
      );
    }
  }

  /**
   * Announces wave-progress stage changes as the packet crosses the barrier region (at slits, interfering,
   * diffracting, or passing a which-path detector). Driven by the model's periodic accessible-state tick rather
   * than every animation frame. Stages outside the barrier region stay silent: initial travel is covered by the
   * source-start packet description, and reaching the screen is covered by the hit response.
   */
  private handleAccessibleStateStep(): void {
    const before = this.previousState;
    const after = this.getResponseState();
    this.previousState = after;

    if ( before.scene !== after.scene || before.waveProgressStage === after.waveProgressStage ) {
      return;
    }

    // Announce only barrier-region stages: earlier travel is covered by the source-start packet description, and
    // reaching the screen is covered by the hit response.
    const stage = after.waveProgressStage;
    if (
      this.shouldAddPacketLifecycleContextResponses( after ) &&
      ( stage === 'atSlits' || stage === 'interferingAfterSlits' || stage === 'diffractingAfterSlits' || stage === 'whichPathAfterSlits' )
    ) {
      this.addAccessibleContextResponse( formatWaveProgress( after, stage ), {
          responseGroup: WAVE_PROGRESS_RESPONSE_GROUP
        }
      );
    }
  }
}
