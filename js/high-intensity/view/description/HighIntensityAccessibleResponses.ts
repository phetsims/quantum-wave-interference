// Copyright 2026, University of Colorado Boulder

/**
 * Standalone context-response Node for High Intensity. It compares QuantumWaveInterferenceAccessibleState before and after model changes
 * so responses describe the meaning of the transition, not only the control value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../../scenery/js/nodes/Node.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { type HighIntensityAccessibleViewState } from './HighIntensityAccessibleViewState.js';
import QuantumWaveInterferenceTransitionDescriber, { type QuantumWaveInterferenceResponsePlan, type QuantumWaveInterferenceTransitionAction } from './QuantumWaveInterferenceTransitionDescriber.js';

export default class HighIntensityAccessibleResponses extends Node {

  // Snapshot of accessible view state taken after the last emitted response, used as the "before" baseline when
  // computing the next transition description.
  private previousState: HighIntensityAccessibleViewState;

  // The most-recently emitted context-response string. Used to suppress duplicate wave-progress alerts when the
  // stage description has not actually changed between successive step callbacks.
  private lastContextResponse: string | null;

  // Set to true while the clear-screen button callback is executing so that property-change listeners fired during
  // clearScreen() are silenced; the single 'screenCleared' response is emitted explicitly afterward.
  private isClearingFromButton: boolean;

  public constructor(
    model: HighIntensityModel,
    private readonly getAccessibleViewState: () => HighIntensityAccessibleViewState
  ) {
    super( { isDisposable: false } );

    this.previousState = this.getAccessibleViewState();
    this.lastContextResponse = null;
    this.isClearingFromButton = false;

    const emitTransition = ( action: QuantumWaveInterferenceTransitionAction ) => {
      if ( this.isClearingFromButton ) {
        return;
      }

      const before = this.previousState;
      const after = this.getAccessibleViewState();

      // Scene changes can also notify DynamicProperties such as wavelength or slit separation. If the semantic
      // source type changed, report the scene change once and silence subsequent no-op notifications.
      const effectiveAction: QuantumWaveInterferenceTransitionAction = before.sourceType !== after.sourceType && action.type !== 'particleTypeChanged' ?
        { type: 'particleTypeChanged' } :
                                                   action;

      if ( effectiveAction.type === 'particleTypeChanged' && before.sourceType === after.sourceType ) {
        this.previousState = after;
        return;
      }

      const waveProgressChanged = before.waveProgress.stage !== after.waveProgress.stage;
      const toolVisibilityChanged = effectiveAction.type === 'toolChanged' &&
                                    before.measurementTools[ effectiveAction.tool ].visible !==
                                    after.measurementTools[ effectiveAction.tool ].visible;
      const isMeaningful =
        effectiveAction.type === 'sourceChanged' ? before.isEmitting !== after.isEmitting :
        effectiveAction.type === 'particleTypeChanged' ? before.sourceType !== after.sourceType :
        effectiveAction.type === 'detectionModeChanged' ? before.detectionMode !== after.detectionMode :
        effectiveAction.type === 'slitConfigurationChanged' ? before.slitConfiguration !== after.slitConfiguration :
        effectiveAction.type === 'slitSeparationChanged' ? before.slitSeparationMicrometers !== after.slitSeparationMicrometers :
        effectiveAction.type === 'slitPositionChanged' ? before.slitBarrier.slitPositionFraction !== after.slitBarrier.slitPositionFraction :
        effectiveAction.type === 'wavelengthChanged' ? before.wavelengthNM !== after.wavelengthNM ||
                                                       before.effectiveWavelengthPicometers !== after.effectiveWavelengthPicometers :
        effectiveAction.type === 'speedChanged' ? before.particleSpeedMetersPerSecond !== after.particleSpeedMetersPerSecond :
        effectiveAction.type === 'displayModeChanged' ? before.displayMode !== after.displayMode :
        effectiveAction.type === 'brightnessChanged' ? before.screenBrightnessPercent !== after.screenBrightnessPercent :
        effectiveAction.type === 'waveDisplayChanged' ? before.waveDisplayMode !== after.waveDisplayMode :
        effectiveAction.type === 'toolChanged' ? toolVisibilityChanged :
        effectiveAction.type === 'screenCleared' ? after.totalHits < before.totalHits :
        effectiveAction.type === 'hitStageChanged' ? before.hitStage !== after.hitStage :
        effectiveAction.type === 'waveProgressChanged' ? waveProgressChanged :
        effectiveAction.type === 'patternFormationStarted' ? before.patternFormation === 'empty' &&
                                                             ( after.patternFormation === 'forming' || after.patternFormation === 'collectingHits' ) :
        effectiveAction.type === 'patternFormationComplete' ? before.patternFormation !== 'complete' &&
                                                              after.patternFormation === 'complete' :
        effectiveAction.type === 'maxHitsReached' ? after.isMaxHitsReached && !before.isMaxHitsReached :
        effectiveAction.type === 'reset' ? true :
        ( () => { throw new Error( `Unrecognized action: ${effectiveAction}` ); } )();

      if ( !isMeaningful ) {
        this.previousState = after;
        return;
      }

      const responsePlan = QuantumWaveInterferenceTransitionDescriber.describe( effectiveAction, before, after );
      this.previousState = after;
      this.emitResponsePlan( responsePlan, effectiveAction );
    };

    const updateStateSilently = () => {
      this.previousState = this.getAccessibleViewState();
    };

    model.currentIsEmittingProperty.lazyLink( () => emitTransition( { type: 'sourceChanged' } ) );
    model.sceneProperty.lazyLink( () => emitTransition( { type: 'particleTypeChanged' } ) );
    model.currentDetectionModeProperty.lazyLink( () => emitTransition( { type: 'detectionModeChanged' } ) );
    model.currentSlitConfigurationProperty.lazyLink( () => emitTransition( { type: 'slitConfigurationChanged' } ) );
    model.currentSlitSeparationProperty.lazyLink( () => emitTransition( { type: 'slitSeparationChanged' } ) );
    model.currentSlitPositionFractionProperty.lazyLink( () => emitTransition( { type: 'slitPositionChanged' } ) );
    model.currentWavelengthProperty.lazyLink( () => emitTransition( { type: 'wavelengthChanged' } ) );
    model.currentParticleSpeedProperty.lazyLink( () => emitTransition( { type: 'speedChanged' } ) );
    model.isIntensityGraphVisibleProperty.lazyLink( () => emitTransition( { type: 'displayModeChanged' } ) );
    model.currentScreenBrightnessProperty.lazyLink( () => emitTransition( { type: 'brightnessChanged' } ) );
    model.currentWaveDisplayModeProperty.lazyLink( () => emitTransition( { type: 'waveDisplayChanged' } ) );
    model.isTapeMeasureVisibleProperty.lazyLink( () => emitTransition( { type: 'toolChanged', tool: 'tapeMeasure' } ) );
    model.isStopwatchVisibleProperty.lazyLink( () => emitTransition( { type: 'toolChanged', tool: 'stopwatch' } ) );
    model.isTimePlotVisibleProperty.lazyLink( () => emitTransition( { type: 'toolChanged', tool: 'timePlot' } ) );
    model.isPositionPlotVisibleProperty.lazyLink( () => emitTransition( { type: 'toolChanged', tool: 'positionPlot' } ) );
    model.isPlayingProperty.lazyLink( updateStateSilently );
    model.timeSpeedProperty.lazyLink( updateStateSilently );
    model.currentNumberOfSnapshotsProperty.lazyLink( updateStateSilently );
    model.currentTotalHitsProperty.lazyLink( () => {
      const after = this.getAccessibleViewState();
      const before = this.previousState;
      if ( after.isMaxHitsReached && !before.isMaxHitsReached ) {
        emitTransition( { type: 'maxHitsReached' } );
      }
      else if ( after.totalHits < before.totalHits ) {
        emitTransition( { type: 'screenCleared' } );
      }
      else if ( after.hitStage !== before.hitStage ) {
        emitTransition( { type: 'hitStageChanged' } );
      }
      else {
        updateStateSilently();
      }
    } );
    model.accessibleStateStepProperty.lazyLink( () => {
      const after = this.getAccessibleViewState();
      const before = this.previousState;
      const patternStarted = before.patternFormation === 'empty' &&
                             ( after.patternFormation === 'forming' || after.patternFormation === 'collectingHits' );
      const patternComplete = before.patternFormation !== 'complete' && after.patternFormation === 'complete';
      if ( patternStarted ) {
        emitTransition( { type: 'patternFormationStarted' } );
      }
      else if ( patternComplete ) {
        emitTransition( { type: 'patternFormationComplete' } );
      }
      else if ( after.waveProgress.stage !== before.waveProgress.stage ) {
        emitTransition( { type: 'waveProgressChanged' } );
      }
      else {
        updateStateSilently();
      }
    } );
  }

  /**
   * Emits the ordered context responses from a transition plan. Some transitions split source-event and wave-detail
   * information into separate alerts, while single progress updates still use their response group to self-interrupt.
   * Fresh source starts/restarts flush stale queued information before the first response, then queue the follow-up
   * wave description normally.
   *
   * @param responsePlan - ordered responses and optional response group from the transition describer
   * @param effectiveAction - semantic action that produced this response plan
   */
  private emitResponsePlan( responsePlan: QuantumWaveInterferenceResponsePlan, effectiveAction: QuantumWaveInterferenceTransitionAction ): void {
    responsePlan.contextResponses.forEach( ( contextResponse, index ) => {
      if ( effectiveAction.type === 'waveProgressChanged' && contextResponse === this.lastContextResponse ) {
        return;
      }

      this.lastContextResponse = contextResponse;
      const flush = responsePlan.flushBeforeResponses && index === 0;

      if ( responsePlan.responseGroup ) {
        this.addAccessibleContextResponse( contextResponse, {
          responseGroup: responsePlan.responseGroup,
          flush: flush
        } );
      }
      else {
        this.addAccessibleContextResponse( contextResponse, {
          flush: flush
        } );
      }
    } );
  }

  /**
   * Executes the provided clearScreen callback while suppressing the property-driven transition listeners, then
   * snapshots the post-clear state and emits exactly one 'screenCleared' accessible context response. Callers pass
   * the actual clear operation as a callback so that this class owns the before/after state diff and deduplication
   * logic rather than the caller.
   *
   * Called by HighIntensityScreenView when the user activates the detector-screen clear button.
   *
   * @param clearScreen - zero-argument callback that performs the model clear (e.g. scene.clearScreen())
   */
  public clearScreenAndEmitResponse( clearScreen: () => void ): void {
    const before = this.previousState;

    try {
      this.isClearingFromButton = true;
      clearScreen();
    }
    finally {
      this.isClearingFromButton = false;
    }

    const after = this.getAccessibleViewState();
    const responsePlan = QuantumWaveInterferenceTransitionDescriber.describe( { type: 'screenCleared' }, before, after );
    this.previousState = after;
    this.emitResponsePlan( responsePlan, { type: 'screenCleared' } );
  }
}
