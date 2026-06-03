// Copyright 2026, University of Colorado Boulder

/**
 * Describes High Intensity screen transitions by comparing semantic accessible states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type HighIntensitySemanticAccessibleViewState, type QWIValueTrend } from './HighIntensityAccessibleViewState.js';
import { formatDetectorDescription, formatSourceBeamDescription, toFluentBoolean } from './QWIAccessibleStateFormatters.js';

export type QWITransitionAction =
  { type: 'sourceChanged' } |
  { type: 'particleTypeChanged' } |
  { type: 'detectionModeChanged' } |
  { type: 'slitConfigurationChanged' } |
  { type: 'slitSeparationChanged' } |
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
  contextResponse: string | null;
  responseGroup: string;
};

const VALUE_TOLERANCE = 1e-8;

const getTrend = ( before: number, after: number ): QWIValueTrend =>
  Math.abs( before - after ) < VALUE_TOLERANCE ? 'unchanged' :
  after > before ? 'increased' :
  'decreased';

export default class QWITransitionDescriber {

  public static describe(
    action: QWITransitionAction,
    before: HighIntensitySemanticAccessibleViewState,
    after: HighIntensitySemanticAccessibleViewState
  ): QWIResponsePlan {
    let contextResponse: string | null = null;
    const sourceRestartedResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceRestarted.format( {
      beamDescription: formatSourceBeamDescription( after )
    } );

    if ( action.type === 'sourceChanged' ) {
      contextResponse = after.isEmitting ?
                        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStarted.format( {
                          isPlaying: after.isPlaying ? 'true' : 'false',
                          timeSpeed: after.clockSpeedDescription,
                          beamDescription: formatSourceBeamDescription( after )
                        } ) :
                        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStopped.format( {
                          detectionMode: after.detectionMode
                        } );
    }
    else if ( action.type === 'particleTypeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.particleTypeChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        sourceRestartedResponse: sourceRestartedResponse,
        sourceType: after.sourceType
      } );
    }
    else if ( action.type === 'detectionModeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.detectionModeChanged.format( {
        detectionMode: after.detectionMode
      } );
    }
    else if ( action.type === 'slitConfigurationChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitConfigurationChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        slitSetting: after.slitConfiguration,
        sourceRestartedResponse: sourceRestartedResponse
      } );
    }
    else if ( action.type === 'slitSeparationChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitSeparationChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        sourceRestartedResponse: sourceRestartedResponse
      } );
    }
    else if ( action.type === 'wavelengthChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.wavelengthChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        sourceRestartedResponse: sourceRestartedResponse
      } );
    }
    else if ( action.type === 'speedChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.speedChanged.format( {
        isEmitting: toFluentBoolean( after.isEmitting ),
        sourceRestartedResponse: sourceRestartedResponse
      } );
    }
    else if ( action.type === 'displayModeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.displayModeChanged.format( {
        displayMode: after.displayMode
      } );
    }
    else if ( action.type === 'brightnessChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.brightnessChanged.format( {
        brightnessTrend: getTrend( before.screenBrightness, after.screenBrightness )
      } );
    }
    else if ( action.type === 'waveDisplayChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveDisplayChanged.format( {
        waveDisplayMode: after.waveDisplayMode
      } );
    }
    else if ( action.type === 'toolChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.toolChanged.format( {
        tool: action.tool,
        isVisible: after.tools[ action.tool ].visible ? 'true' : 'false'
      } );
    }
    else if ( action.type === 'screenCleared' ) {
      const isRestarting = after.isPlaying && after.isEmitting;

      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.screenCleared.format( {
        isRestarting: isRestarting ? 'true' : 'false',
        sourceRestartedResponse: sourceRestartedResponse
      } );
    }
    else if ( action.type === 'hitStageChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.hitStageChanged.format( {
        hitStage: after.hitStage,
        patternKind: after.patternKind
      } );
    }
    else if ( action.type === 'waveProgressChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveProgressChanged.format( {
        waveProgressStage: after.waveProgress.stage,
        waveProgressCheckpoint: after.waveProgress.checkpoint,
        waveSpeed: after.waveSpeedDescription,
        progress: after.waveProgress.wavefrontPercent
      } );
    }
    else if ( action.type === 'patternFormationStarted' ) {
      contextResponse = formatDetectorDescription( after );
    }
    else if ( action.type === 'patternFormationComplete' ) {
      contextResponse = formatDetectorDescription( after );
    }
    else if ( action.type === 'maxHitsReached' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.maxHitsReachedStringProperty.value;
    }
    else if ( action.type === 'reset' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.resetStringProperty.value;
    }

    return {
      contextResponse: contextResponse,
      responseGroup: 'qwi-high-intensity-transition'
    };
  }
}
