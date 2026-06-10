// Copyright 2026, University of Colorado Boulder

/**
 * Describes High Intensity screen transitions by comparing semantic accessible states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensityAccessibleViewState, type QWIValueTrend } from './HighIntensityAccessibleViewState.js';
import { formatDetectorDescription, formatSourceBeamDescription, toFluentBoolean } from './QWIAccessibleStateFormatters.js';

export type QWITransitionAction =
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

export type QWIResponsePlan = {
  contextResponses: string[];
  responseGroup: string | null;
  flushBeforeResponses: boolean;
};

const VALUE_TOLERANCE = 1e-8;

const getTrend = ( before: number, after: number ): QWIValueTrend =>
  Math.abs( before - after ) < VALUE_TOLERANCE ? 'unchanged' :
  after > before ? 'increased' :
  'decreased';

export default class QWITransitionDescriber {

  public static describe(
    action: QWITransitionAction,
    before: HighIntensityAccessibleViewState,
    after: HighIntensityAccessibleViewState
  ): QWIResponsePlan {
    let contextResponses: string[] = [];
    let responseGroup: string | null = 'qwi-high-intensity-transition';
    let flushBeforeResponses = false;
    const advancingWaveResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.advancingWave.format( {
      beamDescription: formatSourceBeamDescription( after )
    } );

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
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitConfigurationChanged.format( {
          isEmitting: toFluentBoolean( after.isEmitting ),
          slitSetting: after.slitConfiguration,
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
        } ),
        ...( after.isEmitting ? [ advancingWaveResponse ] : [] )
      ];
      responseGroup = after.isEmitting ? null : responseGroup;
      flushBeforeResponses = after.isEmitting;
    }
    else if ( action.type === 'slitSeparationChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitSeparationChanged.format( {
          isEmitting: toFluentBoolean( after.isEmitting ),
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
        } ),
        ...( after.isEmitting ? [ advancingWaveResponse ] : [] )
      ];
      responseGroup = after.isEmitting ? null : responseGroup;
      flushBeforeResponses = after.isEmitting;
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
    else if ( action.type === 'wavelengthChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.wavelengthChanged.format( {
          isEmitting: toFluentBoolean( after.isEmitting ),
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
        } ),
        ...( after.isEmitting ? [ advancingWaveResponse ] : [] )
      ];
      responseGroup = after.isEmitting ? null : responseGroup;
      flushBeforeResponses = after.isEmitting;
    }
    else if ( action.type === 'speedChanged' ) {
      contextResponses = [
        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.speedChanged.format( {
          isEmitting: toFluentBoolean( after.isEmitting ),
          sourceRestartedResponse: QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestartedStringProperty.value
        } ),
        ...( after.isEmitting ? [ advancingWaveResponse ] : [] )
      ];
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
      contextResponses = waveProgressStage === 'travelingToSlits' ? [] :
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
