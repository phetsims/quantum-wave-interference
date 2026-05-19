// Copyright 2026, University of Colorado Boulder

/**
 * Describes High Intensity screen transitions by comparing semantic accessible states.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type QWIAccessibleState, type QWIValueTrend } from './QWIAccessibleStateDescriber.js';

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
  { type: 'snapshotTaken' } |
  { type: 'screenCleared' } |
  { type: 'timeChanged' } |
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

const getSpacingTrend = ( before: QWIAccessibleState, after: QWIAccessibleState ): 'closer' | 'farther' | 'unchanged' => {
  const trend = getTrend( before.bandAnalysis.averageSpacingMM, after.bandAnalysis.averageSpacingMM );
  return trend === 'increased' ? 'farther' :
         trend === 'decreased' ? 'closer' :
         'unchanged';
};

export default class QWITransitionDescriber {

  public static describe( action: QWITransitionAction, before: QWIAccessibleState, after: QWIAccessibleState ): QWIResponsePlan {
    let contextResponse: string | null = null;

    if ( action.type === 'sourceChanged' ) {
      contextResponse = after.isEmitting ?
                        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStarted.format( {
                          isPlaying: after.isPlaying ? 'true' : 'false'
                        } ) :
                        QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStoppedStringProperty.value;
    }
    else if ( action.type === 'particleTypeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.particleTypeChanged.format( {
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
        slitSetting: after.slitConfiguration
      } );
    }
    else if ( action.type === 'slitSeparationChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.slitSeparationChanged.format( {
        isEmitting: after.isEmitting ? 'true' : 'false',
        spacingTrend: getSpacingTrend( before, after )
      } );
    }
    else if ( action.type === 'wavelengthChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.wavelengthChanged.format( {
        isEmitting: after.isEmitting ? 'true' : 'false',
        spacingTrend: getSpacingTrend( before, after )
      } );
    }
    else if ( action.type === 'speedChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.speedChanged.format( {
        isEmitting: after.isEmitting ? 'true' : 'false',
        speedTrend: getTrend( before.particleSpeedMetersPerSecond, after.particleSpeedMetersPerSecond ),
        spacingTrend: getSpacingTrend( before, after )
      } );
    }
    else if ( action.type === 'displayModeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.displayModeChanged.format( {
        displayMode: after.displayMode,
        detectionMode: after.detectionMode
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
        isVisible: after.tools[ action.tool ] ? 'true' : 'false'
      } );
    }
    else if ( action.type === 'snapshotTaken' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.snapshotTaken.format( {
        snapshotCount: after.numberOfSnapshots
      } );
    }
    else if ( action.type === 'screenCleared' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.screenCleared.format( {
        isEmitting: after.isEmitting ? 'true' : 'false',
        detectionMode: after.detectionMode
      } );
    }
    else if ( action.type === 'timeChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.timeChanged.format( {
        isPlaying: after.isPlaying ? 'true' : 'false',
        timeSpeed: after.timeSpeedName
      } );
    }
    else if ( action.type === 'hitStageChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.hitStageChanged.format( {
        hitStage: after.hitStage
      } );
    }
    else if ( action.type === 'waveProgressChanged' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveProgressChanged.format( {
        waveProgressStage: after.waveProgress.stage,
        waveProgressCheckpoint: after.waveProgress.checkpoint,
        progress: after.waveProgress.wavefrontPercent
      } );
    }
    else if ( action.type === 'patternFormationStarted' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.patternFormationStarted.format( {
        patternKind: after.patternKind,
        detectionMode: after.detectionMode
      } );
    }
    else if ( action.type === 'patternFormationComplete' ) {
      contextResponse = QuantumWaveInterferenceFluent.a11y.highIntensityResponses.patternFormationComplete.format( {
        patternKind: after.patternKind,
        bandCount: after.bandAnalysis.bandCount
      } );
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
