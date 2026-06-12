// Copyright 2026, University of Colorado Boulder

/**
 * Describes High Intensity screen transitions by comparing semantic accessible states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensityAccessibleViewState, type QuantumWaveInterferenceValueTrend } from './HighIntensityAccessibleViewState.js';
import formatSourceStoppedResponse from '../../../common/view/description/formatSourceStoppedResponse.js';
import { formatDetectorDescription, formatSourceBeamDescription, toFluentBoolean } from './QuantumWaveInterferenceAccessibleStateFormatters.js';

/**
 * Discriminated union identifying which High Intensity model property changed.
 * Passed to QuantumWaveInterferenceTransitionDescriber.describe() together with the before/after
 * accessible view state snapshots so the describer can produce a semantically appropriate response.
 * The 'toolChanged' variant carries the specific tool name so the describer knows which tool's
 * visibility to inspect.
 */
export type QuantumWaveInterferenceTransitionAction =
  { type: 'sourceChanged' } |
  { type: 'particleTypeChanged' } |
  { type: 'detectionModeChanged' } |
  { type: 'slitConfigurationChanged' } |
  { type: 'slitSeparationChanged' } |
  { type: 'slitPositionChanged' } |
  { type: 'wavelengthChanged' } |
  { type: 'speedChanged' } |
  { type: 'displayModeChanged' } |
  { type: 'brightnessChanged' } |
  { type: 'waveDisplayChanged' } |
  { type: 'toolChanged'; tool: 'tapeMeasure' | 'stopwatch' | 'timePlot' | 'positionPlot' } |
  { type: 'screenCleared' } |
  { type: 'hitStageChanged' } |
  { type: 'waveProgressChanged' } |
  { type: 'patternFormationStarted' } |
  { type: 'patternFormationComplete' } |
  { type: 'maxHitsReached' } |
  { type: 'reset' };

/**
 * Ordered response instructions produced by QuantumWaveInterferenceTransitionDescriber.describe().
 * Consumed by HighIntensityAccessibleResponses.emitResponsePlan(), which iterates contextResponses
 * in order and applies the grouping and flush semantics:
 *
 * - contextResponses: localized strings to announce in sequence; may be empty (no audible response).
 * - responseGroup: when non-null, responses share this group key so a new alert self-interrupts the
 *   previous one from the same group (used for incremental parameter changes). Null for source-start/
 *   source-restart transitions that should never be interrupted.
 * - flushBeforeResponses: when true, the speech queue is flushed before the first response is queued,
 *   discarding stale alerts from prior interactions.
 */
export type QuantumWaveInterferenceResponsePlan = {
  contextResponses: string[];
  responseGroup: string | null;
  flushBeforeResponses: boolean;
};

const VALUE_TOLERANCE = 1e-8;

function getTrend( before: number, after: number ): QuantumWaveInterferenceValueTrend {
  return Math.abs( before - after ) < VALUE_TOLERANCE ? 'unchanged' :
         after > before ? 'increased' :
         'decreased';
}

export default class QuantumWaveInterferenceTransitionDescriber {

  /**
   * Maps a semantic transition action and the before/after accessible view state snapshots to an ordered
   * response plan for the High Intensity screen.
   *
   * The method selects the appropriate Fluent message(s) for the action type, decides whether the responses
   * should interrupt prior speech (flushBeforeResponses=true) and whether they belong to a self-interrupting
   * response group. Source-start and source-restart transitions set flushBeforeResponses=true and clear the
   * response group so they always interrupt stale queued alerts. Parameter changes that restart the wave
   * (slit configuration, slit separation, wavelength, speed) use applySourceRestartingPlan() to mirror this
   * behavior when the source is emitting.
   *
   * Called by HighIntensityAccessibleResponses whenever a meaningful model transition is detected.
   *
   * @param action - which model property changed (see QuantumWaveInterferenceTransitionAction)
   * @param before - accessible view state snapshot taken before the change
   * @param after - accessible view state snapshot taken after the change
   * @returns ordered response plan ready for emission via HighIntensityAccessibleResponses.emitResponsePlan()
   */
  public static describe(
    action: QuantumWaveInterferenceTransitionAction,
    before: HighIntensityAccessibleViewState,
    after: HighIntensityAccessibleViewState
  ): QuantumWaveInterferenceResponsePlan {
    let contextResponses: string[] = [];
    let responseGroup: string | null = 'quantum-wave-interference-high-intensity-transition';
    let flushBeforeResponses = false;
    const advancingWaveResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.advancingWave.format( {
      beamDescription: formatSourceBeamDescription( after )
    } );

    // Shared plan for changes that restart the wave: announce the change, and if the source is emitting,
    // also announce the advancing wave, flush prior responses, and drop the response group.
    const applySourceRestartingPlan = ( changeResponse: string ) => {
      contextResponses = [
        changeResponse,
        ...( after.isEmitting ? [ advancingWaveResponse ] : [] )
      ];
      responseGroup = after.isEmitting ? null : responseGroup;
      flushBeforeResponses = after.isEmitting;
    };

    if ( action.type === 'sourceChanged' ) {
      if ( after.isEmitting ) {
        contextResponses = [
          QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStarted.format( {
            isPlaying: after.isPlaying ? 'true' : 'false',
            timeSpeed: after.clockSpeedDescription
          } )
        ];

        if ( after.isPlaying ) {
          contextResponses.push( advancingWaveResponse );
          responseGroup = null;
          flushBeforeResponses = true;
        }
      }
      else {
        contextResponses = [
          formatSourceStoppedResponse( after.detectionMode, after.totalHits )
        ];
      }
    }
    else if ( action.type === 'particleTypeChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.particleTypeChanged.format( {
          isEmitting: toFluentBoolean( after.isEmitting ),
          sourceType: after.sourceType
        } )
      ];
    }
    else if ( action.type === 'detectionModeChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.detectionModeChanged.format( {
          detectionMode: after.detectionMode
        } )
      ];
    }
    else if ( action.type === 'slitConfigurationChanged' ) {
      applySourceRestartingPlan( QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitConfigurationChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        slitSetting: after.slitConfiguration,
        sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
      } ) );
    }
    else if ( action.type === 'slitSeparationChanged' || action.type === 'wavelengthChanged' || action.type === 'speedChanged' ) {

      // These three parameter changes share the same response structure, differing only in which Fluent message
      // announces the change.
      const message = action.type === 'slitSeparationChanged' ? QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitSeparationChanged :
                      action.type === 'wavelengthChanged' ? QuantumWaveInterferenceFluent.a11y.highIntensityResponses.wavelengthChanged :
                      action.type === 'speedChanged' ? QuantumWaveInterferenceFluent.a11y.highIntensityResponses.speedChanged :
                      ( () => { throw new Error( `Unrecognized action type: ${action}` ); } )();

      applySourceRestartingPlan( message.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
      } ) );
    }
    else if ( action.type === 'slitPositionChanged' ) {
      contextResponses = after.isEmitting ?
                         [
                           QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value,
                           advancingWaveResponse
                         ] :
                         [];
      responseGroup = after.isEmitting ? null : responseGroup;
      flushBeforeResponses = after.isEmitting;
    }
    else if ( action.type === 'displayModeChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.displayModeChanged.format( {
          displayMode: after.displayMode
        } )
      ];
    }
    else if ( action.type === 'brightnessChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.brightnessChanged.format( {
          brightnessTrend: getTrend( before.screenBrightnessPercent, after.screenBrightnessPercent )
        } )
      ];
    }
    else if ( action.type === 'waveDisplayChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveDisplayChanged.format( {
          waveDisplayMode: after.waveDisplayMode
        } )
      ];
    }
    else if ( action.type === 'toolChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.toolChanged.format( {
          tool: action.tool,
          isVisible: after.measurementTools[ action.tool ].visible ? 'true' : 'false'
        } )
      ];
    }
    else if ( action.type === 'screenCleared' ) {
      const isRestarting = after.isPlaying && after.isEmitting;

      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.screenCleared.format( {
          isRestarting: isRestarting ? 'true' : 'false',
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
        } ),
        ...( isRestarting ? [ advancingWaveResponse ] : [] )
      ];
      responseGroup = isRestarting ? null : responseGroup;
      flushBeforeResponses = isRestarting;
    }
    else if ( action.type === 'hitStageChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.hitStageChanged.format( {
          hitStage: after.hitStage,
          patternKind: after.patternKind
        } )
      ];
    }
    else if ( action.type === 'waveProgressChanged' ) {
      const waveProgressStage = after.waveProgress.stage;
      contextResponses = ( waveProgressStage === 'travelingToSlits' || waveProgressStage === 'directToScreen' ) ? [] :
                         [
                           QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveProgressChanged.format( {
                             waveProgressStage: waveProgressStage,
                             waveDisplayMode: after.waveDisplayMode,
                             patternKind: after.patternKind
                           } )
                         ];
    }
    else if ( action.type === 'patternFormationStarted' || action.type === 'patternFormationComplete' ) {

      // While the graph view is active in intensity mode, there is no detector screen to describe, so announce the
      // graph's own pattern description instead. Hits-mode text tracks the hit count and never mentions the screen,
      // so it is used regardless of the active view.
      contextResponses = [
        after.displayMode === 'graph' && after.detectionMode === 'averageIntensity' ?
        after.graphPatternDescription :
        formatDetectorDescription( after )
      ];
    }
    else if ( action.type === 'maxHitsReached' ) {
      contextResponses = [ QuantumWaveInterferenceFluent.a11y.highIntensityResponses.maxHitsReachedStringProperty.value ];
    }
    else if ( action.type === 'reset' ) {
      contextResponses = [ QuantumWaveInterferenceFluent.a11y.highIntensityResponses.resetStringProperty.value ];
    }

    return {
      contextResponses: contextResponses,
      responseGroup: responseGroup,
      flushBeforeResponses: flushBeforeResponses
    };
  }
}
