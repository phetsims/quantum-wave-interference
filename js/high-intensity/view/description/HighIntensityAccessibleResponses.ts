// Copyright 2026, University of Colorado Boulder

/**
 * Standalone context-response Node for High Intensity. It compares QWIAccessibleState before and after model changes
 * so responses describe the meaning of the transition, not only the control value.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../../scenery/js/nodes/Node.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { type HighIntensityAccessibleViewState } from './HighIntensityAccessibleViewState.js';
import QWITransitionDescriber, { type QWITransitionAction } from './QWITransitionDescriber.js';

export default class HighIntensityAccessibleResponses extends Node {

  private previousState: HighIntensityAccessibleViewState;
  private lastContextResponse: string | null;
  private isClearingFromButton: boolean;

  public constructor(
    model: HighIntensityModel,
    private readonly getAccessibleViewState: () => HighIntensityAccessibleViewState
  ) {
    super( { isDisposable: false } );

    this.previousState = this.getAccessibleViewState();
    this.lastContextResponse = null;
    this.isClearingFromButton = false;

    const emitTransition = ( action: QWITransitionAction ) => {
      if ( this.isClearingFromButton ) {
        return;
      }

      const before = this.previousState;
      const after = this.getAccessibleViewState();

      // Scene changes can also notify DynamicProperties such as wavelength or slit separation. If the semantic
      // source type changed, report the scene change once and silence subsequent no-op notifications.
      const effectiveAction: QWITransitionAction = before.sourceType !== after.sourceType && action.type !== 'particleTypeChanged' ?
        { type: 'particleTypeChanged' } :
                                                   action;

      if ( effectiveAction.type === 'particleTypeChanged' && before.sourceType === after.sourceType ) {
        this.previousState = after;
        return;
      }

      const waveProgressChanged = before.waveProgress.stage !== after.waveProgress.stage ||
                                  ( before.waveProgress.checkpoint !== after.waveProgress.checkpoint &&
                                    ( after.waveProgress.stage === 'travelingToSlits' || after.waveProgress.stage === 'directToScreen' ) );
      const toolVisibilityChanged = effectiveAction.type === 'toolChanged' &&
                                    before.measurementTools[ effectiveAction.tool ].visible !==
                                    after.measurementTools[ effectiveAction.tool ].visible;
      const isMeaningful =
        effectiveAction.type === 'sourceChanged' ? before.isEmitting !== after.isEmitting :
        effectiveAction.type === 'particleTypeChanged' ? before.sourceType !== after.sourceType :
        effectiveAction.type === 'detectionModeChanged' ? before.detectionMode !== after.detectionMode :
        effectiveAction.type === 'slitConfigurationChanged' ? before.slitConfiguration !== after.slitConfiguration :
        effectiveAction.type === 'slitSeparationChanged' ? before.slitSeparationMicrometers !== after.slitSeparationMicrometers :
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

      const responsePlan = QWITransitionDescriber.describe( effectiveAction, before, after );
      this.previousState = after;

      if ( responsePlan.contextResponse ) {
        if ( effectiveAction.type === 'waveProgressChanged' && responsePlan.contextResponse === this.lastContextResponse ) {
          return;
        }

        this.lastContextResponse = responsePlan.contextResponse;
        this.addAccessibleContextResponse( responsePlan.contextResponse, {
          responseGroup: responsePlan.responseGroup
        } );
      }
    };

    const updateStateSilently = () => {
      this.previousState = this.getAccessibleViewState();
    };

    model.currentIsEmittingProperty.lazyLink( () => emitTransition( { type: 'sourceChanged' } ) );
    model.sceneProperty.lazyLink( () => emitTransition( { type: 'particleTypeChanged' } ) );
    model.currentDetectionModeProperty.lazyLink( () => emitTransition( { type: 'detectionModeChanged' } ) );
    model.currentSlitConfigurationProperty.lazyLink( () => emitTransition( { type: 'slitConfigurationChanged' } ) );
    model.currentSlitSeparationProperty.lazyLink( () => emitTransition( { type: 'slitSeparationChanged' } ) );
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
      else if ( after.waveProgress.stage !== before.waveProgress.stage ||
                ( after.waveProgress.checkpoint !== before.waveProgress.checkpoint &&
                  ( after.waveProgress.stage === 'travelingToSlits' || after.waveProgress.stage === 'directToScreen' ) ) ) {
        emitTransition( { type: 'waveProgressChanged' } );
      }
      else {
        updateStateSilently();
      }
    } );
  }

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
    const responsePlan = QWITransitionDescriber.describe( { type: 'screenCleared' }, before, after );
    this.previousState = after;

    if ( responsePlan.contextResponse ) {
      this.lastContextResponse = responsePlan.contextResponse;
      this.addAccessibleContextResponse( responsePlan.contextResponse, {
        responseGroup: responsePlan.responseGroup
      } );
    }
  }
}
