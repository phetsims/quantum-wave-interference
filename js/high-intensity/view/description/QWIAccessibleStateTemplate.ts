// Copyright 2026, University of Colorado Boulder

/**
 * Renders QWIAccessibleState as one non-interactive accessibleTemplate section for the High Intensity screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { micrometersUnit } from '../../../../../scenery-phet/js/units/micrometersUnit.js';
import { nanometersUnit } from '../../../../../scenery-phet/js/units/nanometersUnit.js';
import type { AccessibleTemplateValue } from '../../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import { html } from '../../../../../sherpa/lib/lit-core-3.3.1.min.js';
import { WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES } from '../../../common/view/WavelengthColorUtils.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { type HighIntensityAccessibleViewState } from './HighIntensityAccessibleViewState.js';
import { formatDetectorDescription, formatParticleDescription, formatSlitDescription, formatSourceBeamDescription, toFluentBoolean } from './QWIAccessibleStateFormatters.js';

export default class QWIAccessibleStateTemplate {

  public static createCurrentDetailsTemplateProperty(
    model: HighIntensityModel,
    getAccessibleViewState: () => HighIntensityAccessibleViewState
  ): TReadOnlyProperty<AccessibleTemplateValue> {
    return DerivedProperty.deriveAny( QWIAccessibleStateTemplate.createDependencies( model ), () => {
      return QWIAccessibleStateTemplate.createCurrentDetailsTemplate( getAccessibleViewState() );
    } );
  }

  private static createDependencies( model: HighIntensityModel ): TReadOnlyProperty<unknown>[] {
    return Array.from( new Set( [
      model.sceneProperty,
      model.currentIsEmittingProperty,
      model.currentIsEmitterEnabledProperty,
      model.currentIsMaxHitsReachedProperty,
      model.currentDetectionModeProperty,
      model.isIntensityGraphVisibleProperty,
      model.currentScreenBrightnessProperty,
      model.currentWaveDisplayModeProperty,
      model.currentSlitConfigurationProperty,
      model.currentWavelengthProperty,
      model.currentVelocityProperty,
      model.currentSlitSeparationProperty,
      model.currentLeftDetectorHitsProperty,
      model.currentRightDetectorHitsProperty,
      model.currentTotalHitsProperty,
      model.currentNumberOfSnapshotsProperty,
      model.accessibleStateStepProperty,
      model.isTapeMeasureVisibleProperty,
      model.isStopwatchVisibleProperty,
      model.isTimePlotVisibleProperty,
      model.isPositionPlotVisibleProperty,
      model.isPlayingProperty,
      model.timeSpeedProperty,
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.overview.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceStatus.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceBeam.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.photonDetail.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.particleDetail.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.slits.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.detectorPattern.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.waveProgress.getDependentProperties(),
      ...QuantumWaveInterferenceFluent.a11y.highIntensityState.displayTools.getDependentProperties(),
      ...WAVELENGTH_COLOR_ZONE_STRING_PROPERTIES,
      ...micrometersUnit.getDependentProperties(),
      ...nanometersUnit.getDependentProperties()
    ] ) );
  }

  private static createCurrentDetailsTemplate( state: HighIntensityAccessibleViewState ): AccessibleTemplateValue {
    const overview = QuantumWaveInterferenceFluent.a11y.highIntensityState.overview.format( {
      sourceType: state.sourceType,
      isEmitting: toFluentBoolean( state.isEmitting ),
      isPlaying: toFluentBoolean( state.isPlaying ),
      detectionMode: state.detectionMode,
      displayMode: state.displayMode
    } );
    const sourceStatus = QuantumWaveInterferenceFluent.a11y.highIntensityState.sourceStatus.format( {
      isEmitting: toFluentBoolean( state.isEmitting ),
      isPlaying: toFluentBoolean( state.isPlaying ),
      timeSpeed: state.clockSpeedDescription
    } );
    const displayTools = QuantumWaveInterferenceFluent.a11y.highIntensityState.displayTools.format( {
      displayMode: state.displayMode,
      waveDisplayMode: state.waveDisplayMode,
      brightness: state.screenBrightnessPercent,
      snapshotCount: state.numberOfSnapshots,
      tapeMeasure: toFluentBoolean( state.measurementTools.tapeMeasure.visible ),
      stopwatch: toFluentBoolean( state.measurementTools.stopwatch.visible ),
      timePlot: toFluentBoolean( state.measurementTools.timePlot.visible ),
      positionPlot: toFluentBoolean( state.measurementTools.positionPlot.visible )
    } );
    const waveProgress = QuantumWaveInterferenceFluent.a11y.highIntensityState.waveProgress.format( {
      waveProgressStage: state.waveProgress.stage,
      waveProgressCheckpoint: state.waveProgress.checkpoint,
      waveSpeed: state.waveSpeedDescription,
      progress: state.waveProgress.wavefrontPercent
    } );
    const sourceDescription = formatParticleDescription( state );
    const sourceBeamDescription = formatSourceBeamDescription( state );
    const slitDescription = formatSlitDescription( state );
    const detectorDescription = formatDetectorDescription( state );

    return html`
      <p>${overview}</p>
      <p>${sourceStatus}<br>${sourceBeamDescription}<br>${sourceDescription}</p>
      <p>${slitDescription}</p>
      <p>${waveProgress}</p>
      <p>${detectorDescription}</p>
      <p>${displayTools}</p>
    `;
  }
}
