// Copyright 2026, University of Colorado Boulder

/**
 * Describes High Intensity screen transitions by comparing semantic accessible states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensityAccessibleViewState, type QuantumWaveInterferenceValueTrend } from './HighIntensityAccessibleViewState.js';
import { formatDetectorDescription, formatSourceBeamDescription, toFluentBoolean } from './QuantumWaveInterferenceAccessibleStateFormatters.js';

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
          QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStopped.format( {
            detectionMode: after.detectionMode
          } )
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
    else if ( action.type === 'patternFormationStarted' ) {
      contextResponses = [ formatDetectorDescription( after ) ];
    }
    else if ( action.type === 'patternFormationComplete' ) {
      contextResponses = [ formatDetectorDescription( after ) ];
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
