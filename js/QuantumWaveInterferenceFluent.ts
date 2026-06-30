// Copyright 2026, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from quantum-wave-interference-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import FluentLibrary from '../../chipper/js/browser-and-node/FluentLibrary.js';
import FluentComment from '../../chipper/js/browser/FluentComment.js';
import FluentConstant from '../../chipper/js/browser/FluentConstant.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import type {FluentVariable} from '../../chipper/js/browser/FluentPattern.js';
import FluentPattern from '../../chipper/js/browser/FluentPattern.js';
import quantumWaveInterference from './quantumWaveInterference.js';
import QuantumWaveInterferenceStrings from './QuantumWaveInterferenceStrings.js';

// This map is used to create the fluent file and link to all StringProperties.
// Accessing StringProperties is also critical for including them in the built sim.
// However, if strings are unused in Fluent system too, they will be fully excluded from
// the build. So we need to only add actually used strings.
const fluentKeyToStringPropertyMap = new Map();

const addToMapIfDefined = ( key: string, path: string ) => {
  const sp = _.get( QuantumWaveInterferenceStrings, path );
  if ( sp ) {
    fluentKeyToStringPropertyMap.set( key, sp );
  }
};

addToMapIfDefined( 'quantum_wave_interference_title', 'quantum-wave-interference.titleStringProperty' );
addToMapIfDefined( 'screen_experiment_name', 'screen.experiment.nameStringProperty' );
addToMapIfDefined( 'screen_highIntensity_name', 'screen.highIntensity.nameStringProperty' );
addToMapIfDefined( 'screen_singleParticles_name', 'screen.singleParticles.nameStringProperty' );
addToMapIfDefined( 'photons', 'photonsStringProperty' );
addToMapIfDefined( 'electrons', 'electronsStringProperty' );
addToMapIfDefined( 'neutrons', 'neutronsStringProperty' );
addToMapIfDefined( 'heliumAtoms', 'heliumAtomsStringProperty' );
addToMapIfDefined( 'photonSource', 'photonSourceStringProperty' );
addToMapIfDefined( 'electronSource', 'electronSourceStringProperty' );
addToMapIfDefined( 'neutronSource', 'neutronSourceStringProperty' );
addToMapIfDefined( 'heliumAtomSource', 'heliumAtomSourceStringProperty' );
addToMapIfDefined( 'doubleSlit', 'doubleSlitStringProperty' );
addToMapIfDefined( 'detectorScreen', 'detectorScreenStringProperty' );
addToMapIfDefined( 'maximumHitsReached', 'maximumHitsReachedStringProperty' );
addToMapIfDefined( 'intensity', 'intensityStringProperty' );
addToMapIfDefined( 'sourceIntensity', 'sourceIntensityStringProperty' );
addToMapIfDefined( 'particleSpeed', 'particleSpeedStringProperty' );
addToMapIfDefined( 'emissionRate', 'emissionRateStringProperty' );
addToMapIfDefined( 'electronMassLabel', 'electronMassLabelStringProperty' );
addToMapIfDefined( 'neutronMassLabel', 'neutronMassLabelStringProperty' );
addToMapIfDefined( 'heliumAtomMassLabel', 'heliumAtomMassLabelStringProperty' );
addToMapIfDefined( 'max', 'maxStringProperty' );
addToMapIfDefined( 'slitSeparation', 'slitSeparationStringProperty' );
addToMapIfDefined( 'screenDistance', 'screenDistanceStringProperty' );
addToMapIfDefined( 'slitConfiguration', 'slitConfigurationStringProperty' );
addToMapIfDefined( 'bothOpen', 'bothOpenStringProperty' );
addToMapIfDefined( 'coverLeft', 'coverLeftStringProperty' );
addToMapIfDefined( 'coverRight', 'coverRightStringProperty' );
addToMapIfDefined( 'detectorLeft', 'detectorLeftStringProperty' );
addToMapIfDefined( 'detectorRight', 'detectorRightStringProperty' );
addToMapIfDefined( 'detectorBoth', 'detectorBothStringProperty' );
addToMapIfDefined( 'noBarrier', 'noBarrierStringProperty' );
addToMapIfDefined( 'hits', 'hitsStringProperty' );
addToMapIfDefined( 'screenGraphSwitch_screen', 'screenGraphSwitch.screenStringProperty' );
addToMapIfDefined( 'screenGraphSwitch_graph', 'screenGraphSwitch.graphStringProperty' );
addToMapIfDefined( 'screenBrightness', 'screenBrightnessStringProperty' );
addToMapIfDefined( 'intensityGraph', 'intensityGraphStringProperty' );
addToMapIfDefined( 'hitsGraph', 'hitsGraphStringProperty' );
addToMapIfDefined( 'count', 'countStringProperty' );
addToMapIfDefined( 'ruler', 'rulerStringProperty' );
addToMapIfDefined( 'stopwatch', 'stopwatchStringProperty' );
addToMapIfDefined( 'detector', 'detectorStringProperty' );
addToMapIfDefined( 'detectorProbe', 'detectorProbeStringProperty' );
addToMapIfDefined( 'measuringTape', 'measuringTapeStringProperty' );
addToMapIfDefined( 'timePlot', 'timePlotStringProperty' );
addToMapIfDefined( 'positionPlot', 'positionPlotStringProperty' );
addToMapIfDefined( 'time', 'timeStringProperty' );
addToMapIfDefined( 'position', 'positionStringProperty' );
addToMapIfDefined( 'waveDisplay', 'waveDisplayStringProperty' );
addToMapIfDefined( 'waveFunctionDisplay', 'waveFunctionDisplayStringProperty' );
addToMapIfDefined( 'electricField', 'electricFieldStringProperty' );
addToMapIfDefined( 'amplitude', 'amplitudeStringProperty' );
addToMapIfDefined( 'realPart', 'realPartStringProperty' );
addToMapIfDefined( 'imaginaryPart', 'imaginaryPartStringProperty' );
addToMapIfDefined( 'coverTop', 'coverTopStringProperty' );
addToMapIfDefined( 'coverBottom', 'coverBottomStringProperty' );
addToMapIfDefined( 'detectorTop', 'detectorTopStringProperty' );
addToMapIfDefined( 'detectorBottom', 'detectorBottomStringProperty' );
addToMapIfDefined( 'autoRepeat', 'autoRepeatStringProperty' );
addToMapIfDefined( 'detectorSize', 'detectorSizeStringProperty' );
addToMapIfDefined( 'detect', 'detectStringProperty' );
addToMapIfDefined( 'resetDetector', 'resetDetectorStringProperty' );
addToMapIfDefined( 'particleDetected', 'particleDetectedStringProperty' );
addToMapIfDefined( 'notDetected', 'notDetectedStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_bothOpen', 'snapshotSlitConfiguration.bothOpenStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_coverLeft', 'snapshotSlitConfiguration.coverLeftStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_coverRight', 'snapshotSlitConfiguration.coverRightStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_detectorLeft', 'snapshotSlitConfiguration.detectorLeftStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_detectorRight', 'snapshotSlitConfiguration.detectorRightStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_detectorBoth', 'snapshotSlitConfiguration.detectorBothStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_noBarrier', 'snapshotSlitConfiguration.noBarrierStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_coverTop', 'snapshotSlitConfiguration.coverTopStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_coverBottom', 'snapshotSlitConfiguration.coverBottomStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_detectorTop', 'snapshotSlitConfiguration.detectorTopStringProperty' );
addToMapIfDefined( 'snapshotSlitConfiguration_detectorBottom', 'snapshotSlitConfiguration.detectorBottomStringProperty' );
addToMapIfDefined( 'a11y_experimentScreen_screenButtonsHelpText', 'a11y.experimentScreen.screenButtonsHelpTextStringProperty' );
addToMapIfDefined( 'a11y_highIntensityScreen_screenButtonsHelpText', 'a11y.highIntensityScreen.screenButtonsHelpTextStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playAreaExperiment', 'a11y.screenSummary.playAreaExperimentStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playAreaHighIntensity', 'a11y.screenSummary.playAreaHighIntensityStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playAreaSingleParticles', 'a11y.screenSummary.playAreaSingleParticlesStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_maxHitsReachedHint', 'a11y.screenSummary.maxHitsReachedHintStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_snapshotNode_deleteSnapshotAccessibleName', 'a11y.snapshotNode.deleteSnapshotAccessibleNameStringProperty' );
addToMapIfDefined( 'a11y_snapshotsDialog_accessibleHeading', 'a11y.snapshotsDialog.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_snapshotsDialog_snapshotDeletedContextResponse', 'a11y.snapshotsDialog.snapshotDeletedContextResponseStringProperty' );
addToMapIfDefined( 'a11y_snapshotsDialog_snapshotDeletedDialogClosedContextResponse', 'a11y.snapshotsDialog.snapshotDeletedDialogClosedContextResponseStringProperty' );
addToMapIfDefined( 'a11y_snapshotsDialog_screenBrightness', 'a11y.snapshotsDialog.screenBrightnessStringProperty' );
addToMapIfDefined( 'a11y_sourceHeading', 'a11y.sourceHeadingStringProperty' );
addToMapIfDefined( 'a11y_slitsHeading', 'a11y.slitsHeadingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenHeading', 'a11y.detectorScreenHeadingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_detectorScreenAndExperimentDetailsHeading', 'a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_graphAndExperimentDetailsHeading', 'a11y.experimentDetectorScreenDetails.graphAndExperimentDetailsHeadingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_displaySurface', 'a11y.experimentDetectorScreenDetails.displaySurfaceStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_leadingParagraph', 'a11y.experimentDetectorScreenDetails.leadingParagraphStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_experimentDetailsLeadingParagraph', 'a11y.experimentDetectorScreenDetails.experimentDetailsLeadingParagraphStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_empty', 'a11y.experimentDetectorScreenDetails.emptyStringProperty' );
addToMapIfDefined( 'a11y_particleNouns_lowercaseSingular', 'a11y.particleNouns.lowercaseSingularStringProperty' );
addToMapIfDefined( 'a11y_particleNouns_lowercasePlural', 'a11y.particleNouns.lowercasePluralStringProperty' );
addToMapIfDefined( 'a11y_particleNouns_sentenceCaseSingular', 'a11y.particleNouns.sentenceCaseSingularStringProperty' );
addToMapIfDefined( 'a11y_experimentStateClauses_slitConfiguration', 'a11y.experimentStateClauses.slitConfigurationStringProperty' );
addToMapIfDefined( 'a11y_experimentStateClauses_detectionResult', 'a11y.experimentStateClauses.detectionResultStringProperty' );
addToMapIfDefined( 'a11y_experimentStateClauses_detectionResultSourceOff', 'a11y.experimentStateClauses.detectionResultSourceOffStringProperty' );
addToMapIfDefined( 'a11y_sourceWaveFragments_lowercaseColor', 'a11y.sourceWaveFragments.lowercaseColorStringProperty' );
addToMapIfDefined( 'a11y_sourceWaveFragments_capitalizedColorAndBlack', 'a11y.sourceWaveFragments.capitalizedColorAndBlackStringProperty' );
addToMapIfDefined( 'a11y_sourceWaveFragments_slitTarget', 'a11y.sourceWaveFragments.slitTargetStringProperty' );
addToMapIfDefined( 'a11y_sourceWaveFragments_wavePeakSpacing', 'a11y.sourceWaveFragments.wavePeakSpacingStringProperty' );
addToMapIfDefined( 'a11y_singleParticlesState_autoRepeatStatus', 'a11y.singleParticlesState.autoRepeatStatusStringProperty' );
addToMapIfDefined( 'a11y_singleParticlesState_sourcePacket', 'a11y.singleParticlesState.sourcePacketStringProperty' );
addToMapIfDefined( 'a11y_singleParticlesScreen_screenButtonsHelpText', 'a11y.singleParticlesScreen.screenButtonsHelpTextStringProperty' );
addToMapIfDefined( 'a11y_singleParticlesScreen_detectorProbeCheckbox_accessibleHelpText', 'a11y.singleParticlesScreen.detectorProbeCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_singleParticlesScreen_detectorPatternGraph_zoomButtonGroup_accessibleParagraph', 'a11y.singleParticlesScreen.detectorPatternGraph.zoomButtonGroup.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentState_sourceBeam', 'a11y.waveExperimentState.sourceBeamStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentState_photonDetail', 'a11y.waveExperimentState.photonDetailStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentState_particleDetail', 'a11y.waveExperimentState.particleDetailStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentState_slits', 'a11y.waveExperimentState.slitsStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentState_detectorPattern', 'a11y.waveExperimentState.detectorPatternStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_sourceStarted', 'a11y.waveExperimentResponses.sourceStartedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_sourceRestarted', 'a11y.waveExperimentResponses.sourceRestartedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_advancingWave', 'a11y.waveExperimentResponses.advancingWaveStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_sourceStopped', 'a11y.waveExperimentResponses.sourceStoppedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_particleTypeChanged', 'a11y.waveExperimentResponses.particleTypeChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_screenEmpty', 'a11y.waveExperimentResponses.screenEmptyStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_hitsIncreasing', 'a11y.waveExperimentResponses.hitsIncreasingStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_slitConfigurationChanged', 'a11y.waveExperimentResponses.slitConfigurationChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_slitSeparationChanged', 'a11y.waveExperimentResponses.slitSeparationChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_wavelengthChanged', 'a11y.waveExperimentResponses.wavelengthChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_speedChanged', 'a11y.waveExperimentResponses.speedChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_displayModeChanged', 'a11y.waveExperimentResponses.displayModeChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_brightnessChanged', 'a11y.waveExperimentResponses.brightnessChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_waveDisplayChanged', 'a11y.waveExperimentResponses.waveDisplayChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_toolChanged', 'a11y.waveExperimentResponses.toolChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_screenCleared', 'a11y.waveExperimentResponses.screenClearedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_waveProgressChanged', 'a11y.waveExperimentResponses.waveProgressChangedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_maxHitsReached', 'a11y.waveExperimentResponses.maxHitsReachedStringProperty' );
addToMapIfDefined( 'a11y_waveExperimentResponses_reset', 'a11y.waveExperimentResponses.resetStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_leadingParagraph', 'a11y.experimentSetupDetails.leadingParagraphStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_wavelength', 'a11y.experimentSetupDetails.wavelengthStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_particleSpeed', 'a11y.experimentSetupDetails.particleSpeedStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_slitConfiguration', 'a11y.experimentSetupDetails.slitConfigurationStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_slitSeparation', 'a11y.experimentSetupDetails.slitSeparationStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_screenDistance', 'a11y.experimentSetupDetails.screenDistanceStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleName', 'a11y.emitterButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleHelpText', 'a11y.emitterButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_singleParticleAccessibleHelpText', 'a11y.emitterButton.singleParticleAccessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleHelpText', 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseChecked', 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_measuringTapeCheckbox_accessibleHelpText', 'a11y.measuringTapeCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleHelpText', 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_timePlotCheckbox_accessibleHelpText', 'a11y.timePlotCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_positionPlotCheckbox_accessibleHelpText', 'a11y.positionPlotCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_timePlot_probe_accessibleName', 'a11y.timePlot.probe.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_timePlot_probe_accessibleHelpText', 'a11y.timePlot.probe.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_timePlot_chart_accessibleName', 'a11y.timePlot.chart.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_timePlot_chart_accessibleHelpText', 'a11y.timePlot.chart.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_timePlot_accessibleParagraph', 'a11y.timePlot.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_positionPlot_accessibleName', 'a11y.positionPlot.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_positionPlot_accessibleHelpText', 'a11y.positionPlot.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_positionPlot_accessibleRegion', 'a11y.positionPlot.accessibleRegionStringProperty' );
addToMapIfDefined( 'a11y_positionPlot_accessibleValue', 'a11y.positionPlot.accessibleValueStringProperty' );
addToMapIfDefined( 'a11y_positionPlot_accessibleParagraph', 'a11y.positionPlot.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_detectorProbe_accessibleName', 'a11y.detectorProbe.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorProbe_accessibleHelpText', 'a11y.detectorProbe.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorProbe_accessibleParagraph', 'a11y.detectorProbe.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_slitSeparationSlider_accessibleHelpText', 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitSeparationSlider_bandSpacingContextResponse', 'a11y.slitSeparationSlider.bandSpacingContextResponseStringProperty' );
addToMapIfDefined( 'a11y_barrierPositionSlider_accessibleName', 'a11y.barrierPositionSlider.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_barrierPositionSlider_accessibleHelpText', 'a11y.barrierPositionSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_barrierPositionSlider_accessibleValue', 'a11y.barrierPositionSlider.accessibleValueStringProperty' );
addToMapIfDefined( 'a11y_barrierPositionSlider_accessibleContextResponse', 'a11y.barrierPositionSlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenPositionSlider_accessibleHelpText', 'a11y.detectorScreenPositionSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenPositionSlider_accessibleContextResponseNoPattern', 'a11y.detectorScreenPositionSlider.accessibleContextResponseNoPatternStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenPositionSlider_accessibleContextResponseHits', 'a11y.detectorScreenPositionSlider.accessibleContextResponseHitsStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenPositionSlider_accessibleContextResponse', 'a11y.detectorScreenPositionSlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_accessibleHelpText', 'a11y.wavelengthSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_accessibleValue', 'a11y.wavelengthSlider.accessibleValueStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_bandSpacingContextResponse', 'a11y.wavelengthSlider.bandSpacingContextResponseStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_violet', 'a11y.wavelengthSlider.color.violetStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_blue', 'a11y.wavelengthSlider.color.blueStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_indigo', 'a11y.wavelengthSlider.color.indigoStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_green', 'a11y.wavelengthSlider.color.greenStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_yellow', 'a11y.wavelengthSlider.color.yellowStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_orange', 'a11y.wavelengthSlider.color.orangeStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_red', 'a11y.wavelengthSlider.color.redStringProperty' );
addToMapIfDefined( 'a11y_particleSpeedSlider_accessibleHelpText', 'a11y.particleSpeedSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_particleSpeedSlider_bandSpacingContextResponse', 'a11y.particleSpeedSlider.bandSpacingContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sourceStrengthSlider_accessibleHelpText', 'a11y.sourceStrengthSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_sourceStrengthSlider_accessibleContextResponse', 'a11y.sourceStrengthSlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleName', 'a11y.brightnessSlider.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleHelpText', 'a11y.brightnessSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleName', 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleHelpText', 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_timeControlNode_simSpeedDescription', 'a11y.timeControlNode.simSpeedDescriptionStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_accessibleName', 'a11y.sceneRadioButtonGroup.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_accessibleHelpText', 'a11y.sceneRadioButtonGroup.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_photonsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.photonsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_electronsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.electronsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_neutronsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.neutronsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_heliumAtomsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.heliumAtomsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleName', 'a11y.slitSettingsComboBox.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleHelpText', 'a11y.slitSettingsComboBox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleContextResponse', 'a11y.slitSettingsComboBox.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_screenGraphSwitch_accessibleHelpText', 'a11y.screenGraphSwitch.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_photonWaveDisplayComboBox_accessibleHelpText', 'a11y.photonWaveDisplayComboBox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_matterWaveDisplayComboBox_accessibleHelpText', 'a11y.matterWaveDisplayComboBox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_zoomInButton_accessibleName', 'a11y.zoomInButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_zoomOutButton_accessibleName', 'a11y.zoomOutButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleHelpTextCollapsed', 'a11y.graphAccordionBox.accessibleHelpTextCollapsedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseExpanded', 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_zoomButtonGroup_accessibleParagraph', 'a11y.graphAccordionBox.zoomButtonGroup.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_intensityOff', 'a11y.detectorPatternGraph.accessibleParagraph.intensityOffStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_intensity', 'a11y.detectorPatternGraph.accessibleParagraph.intensityStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_intensitySingleSlit', 'a11y.detectorPatternGraph.accessibleParagraph.intensitySingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_intensityNoBarrier', 'a11y.detectorPatternGraph.accessibleParagraph.intensityNoBarrierStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsNone', 'a11y.detectorPatternGraph.accessibleParagraph.hitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsFew', 'a11y.detectorPatternGraph.accessibleParagraph.hitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsEmerging', 'a11y.detectorPatternGraph.accessibleParagraph.hitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsDeveloping', 'a11y.detectorPatternGraph.accessibleParagraph.hitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsClear', 'a11y.detectorPatternGraph.accessibleParagraph.hitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsSingleSlitEmerging', 'a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsSingleSlitClear', 'a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitClearStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_accessibleParagraph_hitsNoBarrier', 'a11y.detectorPatternGraph.accessibleParagraph.hitsNoBarrierStringProperty' );
addToMapIfDefined( 'a11y_detectorPatternGraph_zoomButtonGroup_accessibleParagraph', 'a11y.detectorPatternGraph.zoomButtonGroup.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_zoomButtonGroup_zoomLevelResponse', 'a11y.zoomButtonGroup.zoomLevelResponseStringProperty' );
addToMapIfDefined( 'a11y_zoomButtonGroup_sixLevelAccessibleParagraph', 'a11y.zoomButtonGroup.sixLevelAccessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_maxHitsReached_accessibleContextResponse', 'a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_bandSpacingDescription', 'a11y.detectorScreen.bandSpacingDescriptionStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_measuredBandSpacingDescription', 'a11y.detectorScreen.measuredBandSpacingDescriptionStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_measuredBandSpacingLessThanOneTenthDescription', 'a11y.detectorScreen.measuredBandSpacingLessThanOneTenthDescriptionStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_snapshotHitTotal', 'a11y.detectorScreen.snapshotHitTotalStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensityOff', 'a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensity', 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensityNoBarrier', 'a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsNone', 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsFew', 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsClear', 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNone', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsFew', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsEmerging', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsDeveloping', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsClear', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitEmerging', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitClear', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNoBarrier', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoBarrierStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerDoubleSlit', 'a11y.detectorScreen.spatialDescription.rulerDoubleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerDoubleSlit', 'a11y.detectorScreen.spatialDescription.noRulerDoubleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerDoubleSlitArrangement', 'a11y.detectorScreen.spatialDescription.rulerDoubleSlitArrangementStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerDoubleSlitArrangement', 'a11y.detectorScreen.spatialDescription.noRulerDoubleSlitArrangementStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerSingleSlit', 'a11y.detectorScreen.spatialDescription.rulerSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerSingleSlit', 'a11y.detectorScreen.spatialDescription.noRulerSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_zoomButtonGroup_accessibleParagraph', 'a11y.detectorScreen.zoomButtonGroup.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleName', 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleContextResponse', 'a11y.detectorScreenButtons.clearScreen.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_takeSnapshot_accessibleName', 'a11y.detectorScreenButtons.takeSnapshot.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_takeSnapshot_accessibleHelpText', 'a11y.detectorScreenButtons.takeSnapshot.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_takeSnapshot_accessibleContextResponse', 'a11y.detectorScreenButtons.takeSnapshot.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_viewSnapshots_accessibleName', 'a11y.detectorScreenButtons.viewSnapshots.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_viewSnapshots_accessibleHelpText', 'a11y.detectorScreenButtons.viewSnapshots.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_viewSnapshots_accessibleContextResponse', 'a11y.detectorScreenButtons.viewSnapshots.accessibleContextResponseStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${FluentLibrary.formatMultilineForFtl( stringProperty.value )}\n`;
  }
  return ftl;
};

const fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );

const QuantumWaveInterferenceFluent = {
  "quantum-wave-interference": {
    titleStringProperty: _.get( QuantumWaveInterferenceStrings, 'quantum-wave-interference.titleStringProperty' )
  },
  screen: {
    experiment: {
      nameStringProperty: _.get( QuantumWaveInterferenceStrings, 'screen.experiment.nameStringProperty' )
    },
    highIntensity: {
      nameStringProperty: _.get( QuantumWaveInterferenceStrings, 'screen.highIntensity.nameStringProperty' )
    },
    singleParticles: {
      nameStringProperty: _.get( QuantumWaveInterferenceStrings, 'screen.singleParticles.nameStringProperty' )
    }
  },
  photonsStringProperty: _.get( QuantumWaveInterferenceStrings, 'photonsStringProperty' ),
  electronsStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronsStringProperty' ),
  neutronsStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronsStringProperty' ),
  heliumAtomsStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomsStringProperty' ),
  _comment_0: new FluentComment( {"comment":"Shown above the emitter","associatedKey":"photonSource"} ),
  photonSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'photonSourceStringProperty' ),
  electronSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronSourceStringProperty' ),
  neutronSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronSourceStringProperty' ),
  heliumAtomSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomSourceStringProperty' ),
  doubleSlitStringProperty: _.get( QuantumWaveInterferenceStrings, 'doubleSlitStringProperty' ),
  detectorScreenStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorScreenStringProperty' ),
  maximumHitsReachedStringProperty: _.get( QuantumWaveInterferenceStrings, 'maximumHitsReachedStringProperty' ),
  intensityStringProperty: _.get( QuantumWaveInterferenceStrings, 'intensityStringProperty' ),
  sourceIntensityStringProperty: _.get( QuantumWaveInterferenceStrings, 'sourceIntensityStringProperty' ),
  particleSpeedStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleSpeedStringProperty' ),
  emissionRateStringProperty: _.get( QuantumWaveInterferenceStrings, 'emissionRateStringProperty' ),
  snapshotLabelValuePatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotLabelValuePatternStringProperty' ),
  snapshotHeadingPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotHeadingPatternStringProperty' ),
  electronMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronMassLabelStringProperty' ),
  neutronMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronMassLabelStringProperty' ),
  heliumAtomMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomMassLabelStringProperty' ),
  maxStringProperty: _.get( QuantumWaveInterferenceStrings, 'maxStringProperty' ),
  slitSeparationStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationStringProperty' ),
  screenDistanceStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenDistanceStringProperty' ),
  slitConfigurationStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitConfigurationStringProperty' ),
  bothOpenStringProperty: _.get( QuantumWaveInterferenceStrings, 'bothOpenStringProperty' ),
  coverLeftStringProperty: _.get( QuantumWaveInterferenceStrings, 'coverLeftStringProperty' ),
  coverRightStringProperty: _.get( QuantumWaveInterferenceStrings, 'coverRightStringProperty' ),
  detectorLeftStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorLeftStringProperty' ),
  detectorRightStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorRightStringProperty' ),
  detectorBothStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorBothStringProperty' ),
  noBarrierStringProperty: _.get( QuantumWaveInterferenceStrings, 'noBarrierStringProperty' ),
  hitsStringProperty: _.get( QuantumWaveInterferenceStrings, 'hitsStringProperty' ),
  hitsCountPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'hitsCountPatternStringProperty' ),
  detectorHitsCountPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorHitsCountPatternStringProperty' ),
  screenGraphSwitch: {
    screenStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenGraphSwitch.screenStringProperty' ),
    graphStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenGraphSwitch.graphStringProperty' )
  },
  screenBrightnessStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenBrightnessStringProperty' ),
  intensityGraphStringProperty: _.get( QuantumWaveInterferenceStrings, 'intensityGraphStringProperty' ),
  hitsGraphStringProperty: _.get( QuantumWaveInterferenceStrings, 'hitsGraphStringProperty' ),
  countStringProperty: _.get( QuantumWaveInterferenceStrings, 'countStringProperty' ),
  snapshotNumberPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotNumberPatternStringProperty' ),
  rulerStringProperty: _.get( QuantumWaveInterferenceStrings, 'rulerStringProperty' ),
  stopwatchStringProperty: _.get( QuantumWaveInterferenceStrings, 'stopwatchStringProperty' ),
  detectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorStringProperty' ),
  detectorProbeStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorProbeStringProperty' ),
  measuringTapeStringProperty: _.get( QuantumWaveInterferenceStrings, 'measuringTapeStringProperty' ),
  timePlotStringProperty: _.get( QuantumWaveInterferenceStrings, 'timePlotStringProperty' ),
  positionPlotStringProperty: _.get( QuantumWaveInterferenceStrings, 'positionPlotStringProperty' ),
  timeStringProperty: _.get( QuantumWaveInterferenceStrings, 'timeStringProperty' ),
  positionStringProperty: _.get( QuantumWaveInterferenceStrings, 'positionStringProperty' ),
  waveDisplayStringProperty: _.get( QuantumWaveInterferenceStrings, 'waveDisplayStringProperty' ),
  waveFunctionDisplayStringProperty: _.get( QuantumWaveInterferenceStrings, 'waveFunctionDisplayStringProperty' ),
  electricFieldStringProperty: _.get( QuantumWaveInterferenceStrings, 'electricFieldStringProperty' ),
  amplitudeStringProperty: _.get( QuantumWaveInterferenceStrings, 'amplitudeStringProperty' ),
  realPartStringProperty: _.get( QuantumWaveInterferenceStrings, 'realPartStringProperty' ),
  imaginaryPartStringProperty: _.get( QuantumWaveInterferenceStrings, 'imaginaryPartStringProperty' ),
  coverTopStringProperty: _.get( QuantumWaveInterferenceStrings, 'coverTopStringProperty' ),
  coverBottomStringProperty: _.get( QuantumWaveInterferenceStrings, 'coverBottomStringProperty' ),
  detectorTopStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorTopStringProperty' ),
  detectorBottomStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorBottomStringProperty' ),
  autoRepeatStringProperty: _.get( QuantumWaveInterferenceStrings, 'autoRepeatStringProperty' ),
  detectorSizeStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorSizeStringProperty' ),
  detectStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectStringProperty' ),
  resetDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'resetDetectorStringProperty' ),
  particleDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleDetectedStringProperty' ),
  notDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'notDetectedStringProperty' ),
  snapshotSlitConfiguration: {
    bothOpenStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.bothOpenStringProperty' ),
    coverLeftStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.coverLeftStringProperty' ),
    coverRightStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.coverRightStringProperty' ),
    detectorLeftStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.detectorLeftStringProperty' ),
    detectorRightStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.detectorRightStringProperty' ),
    detectorBothStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.detectorBothStringProperty' ),
    noBarrierStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.noBarrierStringProperty' ),
    coverTopStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.coverTopStringProperty' ),
    coverBottomStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.coverBottomStringProperty' ),
    detectorTopStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.detectorTopStringProperty' ),
    detectorBottomStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotSlitConfiguration.detectorBottomStringProperty' )
  },
  _comment_1: new FluentComment( {"comment":"Accessibility strings","associatedKey":"a11y"} ),
  a11y: {
    experimentScreen: {
      screenButtonsHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentScreen_screenButtonsHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentScreen.screenButtonsHelpTextStringProperty' ) )
    },
    highIntensityScreen: {
      screenButtonsHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_highIntensityScreen_screenButtonsHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityScreen.screenButtonsHelpTextStringProperty' ) )
    },
    screenSummary: {
      playAreaExperimentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playAreaExperiment', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaExperimentStringProperty' ) ),
      playAreaHighIntensityStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playAreaHighIntensity', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaHighIntensityStringProperty' ) ),
      playAreaSingleParticlesStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playAreaSingleParticles', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaSingleParticlesStringProperty' ) ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      maxHitsReachedHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_maxHitsReachedHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.maxHitsReachedHintStringProperty' ) ),
      currentDetails: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, hasHits: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isMaxHitsReached: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, slitOrientation: 'topBottom' | 'leftRight' | TReadOnlyProperty<'topBottom' | 'leftRight'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"hasHits","variants":["true","false"]},{"name":"isEmitting","variants":["true","false"]},{"name":"isMaxHitsReached","variants":["true","false"]},{"name":"isPlaying","variants":["false","true"]},{"name":"slitOrientation","variants":["topBottom","leftRight"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      interactionHint: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.interactionHintStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    snapshotNode: {
      deleteSnapshotAccessibleName: new FluentPattern<{ snapshotTitle: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_snapshotNode_deleteSnapshotAccessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotNode.deleteSnapshotAccessibleNameStringProperty' ), [{"name":"snapshotTitle"}] )
    },
    snapshotsDialog: {
      accessibleHeading: new FluentPattern<{ snapshotCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_snapshotsDialog_accessibleHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotsDialog.accessibleHeadingStringProperty' ), [{"name":"snapshotCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      snapshotDeletedContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_snapshotsDialog_snapshotDeletedContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotsDialog.snapshotDeletedContextResponseStringProperty' ) ),
      snapshotDeletedDialogClosedContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_snapshotsDialog_snapshotDeletedDialogClosedContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotsDialog.snapshotDeletedDialogClosedContextResponseStringProperty' ) ),
      screenBrightness: new FluentPattern<{ brightness: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_snapshotsDialog_screenBrightness', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotsDialog.screenBrightnessStringProperty' ), [{"name":"brightness"}] )
    },
    sourceHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sourceHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceHeadingStringProperty' ) ),
    slitsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.slitsHeadingStringProperty' ) ),
    detectorScreenHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenHeadingStringProperty' ) ),
    experimentDetectorScreenDetails: {
      detectorScreenAndExperimentDetailsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_detectorScreenAndExperimentDetailsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty' ) ),
      _comment_0: new FluentComment( {"comment":"Heading variant used on the High Intensity and Single Particles screens while the graph view is active.","associatedKey":"graphAndExperimentDetailsHeading"} ),
      graphAndExperimentDetailsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_graphAndExperimentDetailsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.graphAndExperimentDetailsHeadingStringProperty' ) ),
      _comment_1: new FluentComment( {"comment":"The sentence subject — detector screen or graph — selected by which view is active.","associatedKey":"displaySurface"} ),
      displaySurface: new FluentPattern<{ surface: 'graph' | 'detectorScreen' | TReadOnlyProperty<'graph' | 'detectorScreen'> }>( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_displaySurface', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.displaySurfaceStringProperty' ), [{"name":"surface","variants":["graph","detectorScreen"]}] ),
      _comment_2: new FluentComment( {"comment":"detectorScreenStatus 'emptyWavePropagating' means the screen is still empty but waves are traveling in the","associatedKey":"leadingParagraph"} ),
      _comment_3: new FluentComment( {"comment":"wave area, so the \"experiment ready\" invitation would be wrong.","associatedKey":"leadingParagraph"} ),
      leadingParagraph: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, detectorScreenStatus: 'empty' | 'emptyWavePropagating' | 'pattern' | TReadOnlyProperty<'empty' | 'emptyWavePropagating' | 'pattern'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, surface: 'graph' | 'detectorScreen' | TReadOnlyProperty<'graph' | 'detectorScreen'> }>( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_leadingParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.leadingParagraphStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"detectorScreenStatus","variants":["empty","emptyWavePropagating","pattern"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"surface","variants":["graph","detectorScreen"]}] ),
      experimentDetailsLeadingParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_experimentDetailsLeadingParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.experimentDetailsLeadingParagraphStringProperty' ) ),
      emptyStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_empty', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.emptyStringProperty' ) )
    },
    _comment_0: new FluentComment( {"comment":"Shared particle-noun fragments keyed on $sourceType, composed into many messages so the four particle names stay","associatedKey":"particleNouns"} ),
    _comment_1: new FluentComment( {"comment":"consistent. Three case-forms are provided for the different grammatical positions they appear in. Each fragment","associatedKey":"particleNouns"} ),
    _comment_2: new FluentComment( {"comment":"resolves $sourceType from the referencing message's format() arguments.","associatedKey":"particleNouns"} ),
    particleNouns: {
      lowercaseSingular: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_particleNouns_lowercaseSingular', _.get( QuantumWaveInterferenceStrings, 'a11y.particleNouns.lowercaseSingularStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      lowercasePlural: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_particleNouns_lowercasePlural', _.get( QuantumWaveInterferenceStrings, 'a11y.particleNouns.lowercasePluralStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      sentenceCaseSingular: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_particleNouns_sentenceCaseSingular', _.get( QuantumWaveInterferenceStrings, 'a11y.particleNouns.sentenceCaseSingularStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    _comment_3: new FluentComment( {"comment":"Shared fragments composed into the screen-summary currentDetails message. Each fragment resolves its","associatedKey":"experimentStateClauses"} ),
    _comment_4: new FluentComment( {"comment":"{ $variable } placeholders from the referencing message's format() arguments. Extracted so the paused and","associatedKey":"experimentStateClauses"} ),
    _comment_5: new FluentComment( {"comment":"playing branches of currentDetails (which are identical apart from sentence-initial capitalization) do not","associatedKey":"experimentStateClauses"} ),
    _comment_6: new FluentComment( {"comment":"each repeat these selectors.","associatedKey":"experimentStateClauses"} ),
    experimentStateClauses: {
      slitConfiguration: new FluentPattern<{ slitOrientation: 'topBottom' | 'leftRight' | TReadOnlyProperty<'topBottom' | 'leftRight'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_experimentStateClauses_slitConfiguration', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentStateClauses.slitConfigurationStringProperty' ), [{"name":"slitOrientation","variants":["topBottom","leftRight"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
      detectionResult: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, hasHits: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_experimentStateClauses_detectionResult', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentStateClauses.detectionResultStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"hasHits","variants":["true","false"]}] ),
      detectionResultSourceOff: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, hasHits: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'> }>( fluentSupport.bundleProperty, 'a11y_experimentStateClauses_detectionResultSourceOff', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentStateClauses.detectionResultSourceOffStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"hasHits","variants":["false","true"]}] )
    },
    _comment_7: new FluentComment( {"comment":"Shared fragments composed into the source beam/packet descriptions on the High Intensity and Single Particles","associatedKey":"sourceWaveFragments"} ),
    _comment_8: new FluentComment( {"comment":"screens. Each fragment resolves its { $variable } placeholders from the referencing message's format() arguments.","associatedKey":"sourceWaveFragments"} ),
    sourceWaveFragments: {
      lowercaseColor: new FluentPattern<{ photonColor: 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | TReadOnlyProperty<'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_sourceWaveFragments_lowercaseColor', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceWaveFragments.lowercaseColorStringProperty' ), [{"name":"photonColor","variants":["violet","blue","indigo","green","yellow","orange","red"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      capitalizedColorAndBlack: new FluentPattern<{ photonColor: 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | TReadOnlyProperty<'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_sourceWaveFragments_capitalizedColorAndBlack', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceWaveFragments.capitalizedColorAndBlackStringProperty' ), [{"name":"photonColor","variants":["violet","blue","indigo","green","yellow","orange","red"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      slitTarget: new FluentPattern<{ slitSetting: 'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors' | TReadOnlyProperty<'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_sourceWaveFragments_slitTarget', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceWaveFragments.slitTargetStringProperty' ), [{"name":"slitSetting","variants":["noBarrier","bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","bothDetectors"]}] ),
      wavePeakSpacing: new FluentPattern<{ wavefrontSpacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_sourceWaveFragments_wavePeakSpacing', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceWaveFragments.wavePeakSpacingStringProperty' ), [{"name":"wavefrontSpacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] )
    },
    singleParticlesState: {
      autoRepeatStatusStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_singleParticlesState_autoRepeatStatus', _.get( QuantumWaveInterferenceStrings, 'a11y.singleParticlesState.autoRepeatStatusStringProperty' ) ),
      _comment_0: new FluentComment( {"comment":"Single Particles counterpart to waveExperimentState.sourceBeam: a single emitted wave packet rendered as a round","associatedKey":"sourcePacket"} ),
      _comment_1: new FluentComment( {"comment":"packet of waves, rather than a continuous beam of plane wave fronts.","associatedKey":"sourcePacket"} ),
      sourcePacket: new FluentPattern<{ photonColor: 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | TReadOnlyProperty<'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red'>, slitSetting: 'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors' | TReadOnlyProperty<'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, wavefrontSpacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_singleParticlesState_sourcePacket', _.get( QuantumWaveInterferenceStrings, 'a11y.singleParticlesState.sourcePacketStringProperty' ), [{"name":"photonColor","variants":["violet","blue","indigo","green","yellow","orange","red"]},{"name":"slitSetting","variants":["noBarrier","bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"wavefrontSpacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] )
    },
    singleParticlesScreen: {
      screenButtonsHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_singleParticlesScreen_screenButtonsHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.singleParticlesScreen.screenButtonsHelpTextStringProperty' ) ),
      detectorProbeCheckbox: {
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_singleParticlesScreen_detectorProbeCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.singleParticlesScreen.detectorProbeCheckbox.accessibleHelpTextStringProperty' ) )
      },
      detectorPatternGraph: {
        zoomButtonGroup: {
          accessibleParagraph: new FluentPattern<{ level: 1 | 2 | 3 | 4 | 5 | 6 | number | 'other' | TReadOnlyProperty<1 | 2 | 3 | 4 | 5 | 6 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_singleParticlesScreen_detectorPatternGraph_zoomButtonGroup_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.singleParticlesScreen.detectorPatternGraph.zoomButtonGroup.accessibleParagraphStringProperty' ), [{"name":"level","variants":[1,2,3,4,5,6,{"type":"number","value":"other"}]}] )
        }
      }
    },
    waveExperimentState: {
      sourceBeam: new FluentPattern<{ isEmitting: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, photonColor: 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | TReadOnlyProperty<'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red'>, slitSetting: 'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors' | TReadOnlyProperty<'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, wavefrontSpacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentState_sourceBeam', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentState.sourceBeamStringProperty' ), [{"name":"isEmitting","variants":["false","true"]},{"name":"photonColor","variants":["violet","blue","indigo","green","yellow","orange","red"]},{"name":"slitSetting","variants":["noBarrier","bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"wavefrontSpacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
      photonDetail: new FluentPattern<{ color: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentState_photonDetail', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentState.photonDetailStringProperty' ), [{"name":"color"},{"name":"wavelength"}] ),
      particleDetail: new FluentPattern<{ sourceType: 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'electrons' | 'neutrons' | 'heliumAtoms'>, speed: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentState_particleDetail', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentState.particleDetailStringProperty' ), [{"name":"sourceType","variants":["electrons","neutrons","heliumAtoms"]},{"name":"speed"},{"name":"wavelength"}] ),
      slits: new FluentPattern<{ separation: FluentVariable, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentState_slits', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentState.slitsStringProperty' ), [{"name":"separation"},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
      detectorPattern: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, doubleSlitClustering: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitStage: 'none' | number | 'few' | 'emerging' | 'developing' | 'clear' | TReadOnlyProperty<'none' | number | 'few' | 'emerging' | 'developing' | 'clear'>, isEmitting: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, patternFormation: 'empty' | 'forming' | 'complete' | 'paused' | 'notApplicable' | 'collectingHits' | TReadOnlyProperty<'empty' | 'forming' | 'complete' | 'paused' | 'notApplicable' | 'collectingHits'>, patternKind: 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier' | TReadOnlyProperty<'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier'>, spacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentState_detectorPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentState.detectorPatternStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"doubleSlitClustering","variants":["true","false"]},{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitStage","variants":["none",{"type":"number","value":"few"},"emerging","developing","clear"]},{"name":"isEmitting","variants":["false","true"]},{"name":"patternFormation","variants":["empty","forming","complete","paused","notApplicable","collectingHits"]},{"name":"patternKind","variants":["doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction","noBarrier"]},{"name":"spacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] )
    },
    waveExperimentResponses: {
      sourceStarted: new FluentPattern<{ isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, timeSpeed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_sourceStarted', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.sourceStartedStringProperty' ), [{"name":"isPlaying","variants":["false","true"]},{"name":"timeSpeed"}] ),
      sourceRestartedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_sourceRestarted', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.sourceRestartedStringProperty' ) ),
      advancingWave: new FluentPattern<{ beamDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_advancingWave', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.advancingWaveStringProperty' ), [{"name":"beamDescription"}] ),
      sourceStopped: new FluentPattern<{ hasHitsData: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_sourceStopped', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.sourceStoppedStringProperty' ), [{"name":"hasHitsData","variants":["true","false"]}] ),
      particleTypeChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_particleTypeChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.particleTypeChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      screenEmptyStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_screenEmpty', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.screenEmptyStringProperty' ) ),
      hitsIncreasingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_hitsIncreasing', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.hitsIncreasingStringProperty' ) ),
      slitConfigurationChanged: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_slitConfigurationChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.slitConfigurationChangedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"sourceRestartedResponse"}] ),
      slitSeparationChanged: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_slitSeparationChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.slitSeparationChangedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      wavelengthChanged: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_wavelengthChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.wavelengthChangedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      speedChanged: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_speedChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.speedChangedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      displayModeChanged: new FluentPattern<{ displayMode: 'graph' | 'screen' | TReadOnlyProperty<'graph' | 'screen'>, graphState: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_displayModeChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.displayModeChangedStringProperty' ), [{"name":"displayMode","variants":["graph","screen"]},{"name":"graphState"}] ),
      brightnessChanged: new FluentPattern<{ brightnessTrend: 'increased' | 'decreased' | 'unchanged' | TReadOnlyProperty<'increased' | 'decreased' | 'unchanged'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_brightnessChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.brightnessChangedStringProperty' ), [{"name":"brightnessTrend","variants":["increased","decreased","unchanged"]}] ),
      waveDisplayChanged: new FluentPattern<{ waveDisplayMode: 'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude' | TReadOnlyProperty<'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_waveDisplayChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.waveDisplayChangedStringProperty' ), [{"name":"waveDisplayMode","variants":["electricField","realPart","imaginaryPart","amplitude"]}] ),
      toolChanged: new FluentPattern<{ isVisible: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, tool: 'measuringTape' | 'stopwatch' | 'timePlot' | 'positionPlot' | TReadOnlyProperty<'measuringTape' | 'stopwatch' | 'timePlot' | 'positionPlot'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_toolChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.toolChangedStringProperty' ), [{"name":"isVisible","variants":["true","false"]},{"name":"tool","variants":["measuringTape","stopwatch","timePlot","positionPlot"]}] ),
      screenCleared: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_screenCleared', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.screenClearedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      waveProgressChanged: new FluentPattern<{ patternKind: 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier' | TReadOnlyProperty<'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, waveProgressStage: 'sourceOff' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | TReadOnlyProperty<'sourceOff' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen'> }>( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_waveProgressChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.waveProgressChangedStringProperty' ), [{"name":"patternKind","variants":["doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction","noBarrier"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"waveProgressStage","variants":["sourceOff","atSlits","interferingAfterSlits","diffractingAfterSlits","whichPathAfterSlits","directToScreen"]}] ),
      maxHitsReachedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_maxHitsReached', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.maxHitsReachedStringProperty' ) ),
      resetStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_waveExperimentResponses_reset', _.get( QuantumWaveInterferenceStrings, 'a11y.waveExperimentResponses.resetStringProperty' ) )
    },
    experimentSetupDetails: {
      _comment_0: new FluentComment( {"comment":"detectorScreenStatus 'emptyWavePropagating' means the screen is still empty but waves are traveling in the","associatedKey":"leadingParagraph"} ),
      _comment_1: new FluentComment( {"comment":"wave area, so the \"experiment ready\" invitation would be wrong.","associatedKey":"leadingParagraph"} ),
      leadingParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_leadingParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.leadingParagraphStringProperty' ) ),
      wavelength: new FluentPattern<{ color: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_wavelength', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.wavelengthStringProperty' ), [{"name":"color"},{"name":"wavelength"}] ),
      particleSpeed: new FluentPattern<{ speed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_particleSpeed', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.particleSpeedStringProperty' ), [{"name":"speed"}] ),
      slitConfiguration: new FluentPattern<{ slitOrientation: 'topBottom' | 'leftRight' | TReadOnlyProperty<'topBottom' | 'leftRight'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_slitConfiguration', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.slitConfigurationStringProperty' ), [{"name":"slitOrientation","variants":["topBottom","leftRight"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
      slitSeparation: new FluentPattern<{ distance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_slitSeparation', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.slitSeparationStringProperty' ), [{"name":"distance"}] ),
      screenDistance: new FluentPattern<{ distance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_screenDistance', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.screenDistanceStringProperty' ), [{"name":"distance"}] )
    },
    emitterButton: {
      accessibleName: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleNameStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleHelpText: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleHelpTextStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      _comment_0: new FluentComment( {"comment":"Single Particles screen: the emitter is a switch whose guidance reflects the Auto-repeat checkbox state.","associatedKey":"singleParticleAccessibleHelpText"} ),
      _comment_1: new FluentComment( {"comment":"When Auto-repeat is off the source fires one packet then auto-returns to off; when on it behaves like a","associatedKey":"singleParticleAccessibleHelpText"} ),
      _comment_2: new FluentComment( {"comment":"continuous on/off switch. Mass of the particle is appended for matter sources (not photons).","associatedKey":"singleParticleAccessibleHelpText"} ),
      singleParticleAccessibleHelpText: new FluentPattern<{ autoRepeat: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'electrons' | 'neutrons' | 'heliumAtoms' | 'photons' | TReadOnlyProperty<'electrons' | 'neutrons' | 'heliumAtoms' | 'photons'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_singleParticleAccessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.singleParticleAccessibleHelpTextStringProperty' ), [{"name":"autoRepeat","variants":["true","false"]},{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["electrons","neutrons","heliumAtoms","photons"]}] )
    },
    rulerCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseChecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
      accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
    },
    measuringTapeCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_measuringTapeCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.measuringTapeCheckbox.accessibleHelpTextStringProperty' ) )
    },
    stopwatchCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_stopwatchCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' ) )
    },
    timePlotCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timePlotCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlotCheckbox.accessibleHelpTextStringProperty' ) )
    },
    positionPlotCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_positionPlotCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlotCheckbox.accessibleHelpTextStringProperty' ) )
    },
    timePlot: {
      probe: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timePlot_probe_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlot.probe.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timePlot_probe_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlot.probe.accessibleHelpTextStringProperty' ) )
      },
      chart: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timePlot_chart_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlot.chart.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timePlot_chart_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlot.chart.accessibleHelpTextStringProperty' ) )
      },
      accessibleParagraph: new FluentPattern<{ waveDisplayMode: 'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude' | TReadOnlyProperty<'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude'> }>( fluentSupport.bundleProperty, 'a11y_timePlot_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.timePlot.accessibleParagraphStringProperty' ), [{"name":"waveDisplayMode","variants":["electricField","realPart","imaginaryPart","amplitude"]}] )
    },
    positionPlot: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_positionPlot_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlot.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_positionPlot_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlot.accessibleHelpTextStringProperty' ) ),
      accessibleRegion: new FluentPattern<{ region: 'nearTop' | 'aboveCenter' | 'center' | 'belowCenter' | 'nearBottom' | TReadOnlyProperty<'nearTop' | 'aboveCenter' | 'center' | 'belowCenter' | 'nearBottom'> }>( fluentSupport.bundleProperty, 'a11y_positionPlot_accessibleRegion', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlot.accessibleRegionStringProperty' ), [{"name":"region","variants":["nearTop","aboveCenter","center","belowCenter","nearBottom"]}] ),
      accessibleValue: new FluentPattern<{ region: FluentVariable, slitState: 'openSlit' | 'coveredSlit' | 'detectorSlit' | 'noSlit' | TReadOnlyProperty<'openSlit' | 'coveredSlit' | 'detectorSlit' | 'noSlit'> }>( fluentSupport.bundleProperty, 'a11y_positionPlot_accessibleValue', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlot.accessibleValueStringProperty' ), [{"name":"region"},{"name":"slitState","variants":["openSlit","coveredSlit","detectorSlit","noSlit"]}] ),
      accessibleParagraph: new FluentPattern<{ waveDisplayMode: 'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude' | TReadOnlyProperty<'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude'> }>( fluentSupport.bundleProperty, 'a11y_positionPlot_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.positionPlot.accessibleParagraphStringProperty' ), [{"name":"waveDisplayMode","variants":["electricField","realPart","imaginaryPart","amplitude"]}] )
    },
    detectorProbe: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorProbe_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorProbe.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorProbe_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorProbe.accessibleHelpTextStringProperty' ) ),
      accessibleParagraph: new FluentPattern<{ probability: FluentVariable, state: 'detected' | 'notDetected' | 'ready' | TReadOnlyProperty<'detected' | 'notDetected' | 'ready'> }>( fluentSupport.bundleProperty, 'a11y_detectorProbe_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorProbe.accessibleParagraphStringProperty' ), [{"name":"probability"},{"name":"state","variants":["detected","notDetected","ready"]}] )
    },
    slitSeparationSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitSeparationSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' ) ),
      bandSpacingContextResponse: new FluentPattern<{ trend: 'increased' | 'decreased' | TReadOnlyProperty<'increased' | 'decreased'> }>( fluentSupport.bundleProperty, 'a11y_slitSeparationSlider_bandSpacingContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSeparationSlider.bandSpacingContextResponseStringProperty' ), [{"name":"trend","variants":["increased","decreased"]}] )
    },
    barrierPositionSlider: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_barrierPositionSlider_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.barrierPositionSlider.accessibleNameStringProperty' ) ),
      accessibleHelpText: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_barrierPositionSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.barrierPositionSlider.accessibleHelpTextStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleValue: new FluentPattern<{ value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_barrierPositionSlider_accessibleValue', _.get( QuantumWaveInterferenceStrings, 'a11y.barrierPositionSlider.accessibleValueStringProperty' ), [{"name":"value"}] ),
      accessibleContextResponse: new FluentPattern<{ position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_barrierPositionSlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.barrierPositionSlider.accessibleContextResponseStringProperty' ), [{"name":"position","variants":["closest","closer","farthest","farther"]}] )
    },
    detectorScreenPositionSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenPositionSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenPositionSlider.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseNoPattern: new FluentPattern<{ position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenPositionSlider_accessibleContextResponseNoPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenPositionSlider.accessibleContextResponseNoPatternStringProperty' ), [{"name":"position","variants":["closest","closer","farthest","farther"]}] ),
      accessibleContextResponseHits: new FluentPattern<{ isPlaying: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenPositionSlider_accessibleContextResponseHits', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenPositionSlider.accessibleContextResponseHitsStringProperty' ), [{"name":"isPlaying","variants":["true","false"]},{"name":"position","variants":["closest","closer","farthest","farther"]}] ),
      accessibleContextResponse: new FluentPattern<{ patternEffect: 'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther' | TReadOnlyProperty<'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther'>, position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenPositionSlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenPositionSlider.accessibleContextResponseStringProperty' ), [{"name":"patternEffect","variants":["doubleSlitCloser","doubleSlitFarther","singleSlitCloser","singleSlitFarther"]},{"name":"position","variants":["closest","closer","farthest","farther"]}] )
    },
    wavelengthSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.accessibleHelpTextStringProperty' ) ),
      accessibleValue: new FluentPattern<{ color: FluentVariable, value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_accessibleValue', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.accessibleValueStringProperty' ), [{"name":"color"},{"name":"value"}] ),
      bandSpacingContextResponse: new FluentPattern<{ trend: 'increased' | 'decreased' | TReadOnlyProperty<'increased' | 'decreased'> }>( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_bandSpacingContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.bandSpacingContextResponseStringProperty' ), [{"name":"trend","variants":["increased","decreased"]}] ),
      color: {
        violetStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_violet', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.violetStringProperty' ) ),
        blueStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_blue', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.blueStringProperty' ) ),
        indigoStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_indigo', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.indigoStringProperty' ) ),
        greenStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_green', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.greenStringProperty' ) ),
        yellowStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_yellow', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.yellowStringProperty' ) ),
        orangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_orange', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.orangeStringProperty' ) ),
        redStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_color_red', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.color.redStringProperty' ) )
      }
    },
    particleSpeedSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_particleSpeedSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.particleSpeedSlider.accessibleHelpTextStringProperty' ) ),
      bandSpacingContextResponse: new FluentPattern<{ trend: 'increased' | 'decreased' | TReadOnlyProperty<'increased' | 'decreased'> }>( fluentSupport.bundleProperty, 'a11y_particleSpeedSlider_bandSpacingContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.particleSpeedSlider.bandSpacingContextResponseStringProperty' ), [{"name":"trend","variants":["increased","decreased"]}] )
    },
    sourceStrengthSlider: {
      accessibleHelpText: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_sourceStrengthSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceStrengthSlider.accessibleHelpTextStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleContextResponse: new FluentPattern<{ change: 'more' | 'less' | 'max' | number | 'zero' | TReadOnlyProperty<'more' | 'less' | 'max' | number | 'zero'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_sourceStrengthSlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceStrengthSlider.accessibleContextResponseStringProperty' ), [{"name":"change","variants":["more","less","max",{"type":"number","value":"zero"}]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    brightnessSlider: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleHelpTextStringProperty' ) )
    },
    detectionModeRadioButtons: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' ) )
    },
    timeControlNode: {
      simSpeedDescriptionStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_timeControlNode_simSpeedDescription', _.get( QuantumWaveInterferenceStrings, 'a11y.timeControlNode.simSpeedDescriptionStringProperty' ) )
    },
    sceneRadioButtonGroup: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponse: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isMaxHitsReached: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.accessibleContextResponseStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"isMaxHitsReached","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      photonsRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_photonsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.photonsRadioButton.accessibleContextResponseStringProperty' ) )
      },
      electronsRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_electronsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.electronsRadioButton.accessibleContextResponseStringProperty' ) )
      },
      neutronsRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_neutronsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.neutronsRadioButton.accessibleContextResponseStringProperty' ) )
      },
      heliumAtomsRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_heliumAtomsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.heliumAtomsRadioButton.accessibleContextResponseStringProperty' ) )
      }
    },
    slitSettingsComboBox: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitSettingsComboBox_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSettingsComboBox.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitSettingsComboBox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSettingsComboBox.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponse: new FluentPattern<{ slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_slitSettingsComboBox_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSettingsComboBox.accessibleContextResponseStringProperty' ), [{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] )
    },
    screenGraphSwitch: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenGraphSwitch_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.screenGraphSwitch.accessibleHelpTextStringProperty' ) )
    },
    photonWaveDisplayComboBox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_photonWaveDisplayComboBox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.photonWaveDisplayComboBox.accessibleHelpTextStringProperty' ) )
    },
    matterWaveDisplayComboBox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_matterWaveDisplayComboBox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.matterWaveDisplayComboBox.accessibleHelpTextStringProperty' ) )
    },
    zoomInButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomInButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomInButton.accessibleNameStringProperty' ) )
    },
    zoomOutButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomOutButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomOutButton.accessibleNameStringProperty' ) )
    },
    graphAccordionBox: {
      accessibleHelpTextCollapsedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleHelpTextCollapsed', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleHelpTextCollapsedStringProperty' ) ),
      accessibleContextResponseExpanded: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'>, graphState: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseExpanded', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]},{"name":"graphState"}] ),
      accessibleContextResponseCollapsed: new FluentPattern<{ detectionMode: 'intensity' | 'hits' | TReadOnlyProperty<'intensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' ), [{"name":"detectionMode","variants":["intensity","hits"]}] ),
      zoomButtonGroup: {
        accessibleParagraph: new FluentPattern<{ level: 1 | 2 | 3 | 4 | 5 | 6 | number | 'other' | TReadOnlyProperty<1 | 2 | 3 | 4 | 5 | 6 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_zoomButtonGroup_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.zoomButtonGroup.accessibleParagraphStringProperty' ), [{"name":"level","variants":[1,2,3,4,5,6,{"type":"number","value":"other"}]}] )
      }
    },
    detectorPatternGraph: {
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.intensityStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spatialDescription"}] ),
        intensitySingleSlit: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'> }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]}] ),
        intensityNoBarrierStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_intensityNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.intensityNoBarrierStringProperty' ) ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmerging: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'> }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsEmergingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]}] ),
        hitsDeveloping: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spatialDescription"}] ),
        hitsClear: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsClearStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spatialDescription"}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'> }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]}] ),
        hitsNoBarrierStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_accessibleParagraph_hitsNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.accessibleParagraph.hitsNoBarrierStringProperty' ) )
      },
      zoomButtonGroup: {
        accessibleParagraph: new FluentPattern<{ level: 1 | 2 | 3 | 4 | 5 | 6 | number | 'other' | TReadOnlyProperty<1 | 2 | 3 | 4 | 5 | 6 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorPatternGraph_zoomButtonGroup_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorPatternGraph.zoomButtonGroup.accessibleParagraphStringProperty' ), [{"name":"level","variants":[1,2,3,4,5,6,{"type":"number","value":"other"}]}] )
      }
    },
    zoomButtonGroup: {
      zoomLevelResponse: new FluentPattern<{ level: FluentVariable, max: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_zoomButtonGroup_zoomLevelResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomButtonGroup.zoomLevelResponseStringProperty' ), [{"name":"level"},{"name":"max"}] ),
      _comment_0: new FluentComment( {"comment":"Shared 6-level zoom-button help paragraph, referenced by the graph zoom controls on the High Intensity and","associatedKey":"sixLevelAccessibleParagraph"} ),
      _comment_1: new FluentComment( {"comment":"Single Particles screens. Defined once here so the wording stays in sync across those controls.","associatedKey":"sixLevelAccessibleParagraph"} ),
      sixLevelAccessibleParagraph: new FluentPattern<{ level: 1 | 2 | 3 | 4 | 5 | 6 | number | 'other' | TReadOnlyProperty<1 | 2 | 3 | 4 | 5 | 6 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_zoomButtonGroup_sixLevelAccessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomButtonGroup.sixLevelAccessibleParagraphStringProperty' ), [{"name":"level","variants":[1,2,3,4,5,6,{"type":"number","value":"other"}]}] )
    },
    detectorScreen: {
      maxHitsReached: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_maxHitsReached_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty' ) )
      },
      bandSpacingDescription: new FluentPattern<{ spacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_bandSpacingDescription', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.bandSpacingDescriptionStringProperty' ), [{"name":"spacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
      measuredBandSpacingDescription: new FluentPattern<{ spacing: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_measuredBandSpacingDescription', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.measuredBandSpacingDescriptionStringProperty' ), [{"name":"spacing"}] ),
      measuredBandSpacingLessThanOneTenthDescriptionStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_measuredBandSpacingLessThanOneTenthDescription', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.measuredBandSpacingLessThanOneTenthDescriptionStringProperty' ) ),
      _comment_0: new FluentComment( {"comment":"Shared running-total clause appended to every snapshot hits paragraph, e.g. \"Detector screen shows a total of 3","associatedKey":"snapshotHitTotal"} ),
      _comment_1: new FluentComment( {"comment":"hits.\" Defined once so the count wording stays consistent across all snapshot stages.","associatedKey":"snapshotHitTotal"} ),
      snapshotHitTotal: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_snapshotHitTotal', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.snapshotHitTotalStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ spacingDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' ), [{"name":"spacingDescription"}] ),
        intensitySingleSlit: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]}] ),
        intensityNoBarrierStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensityNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty' ) ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDevelopingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' ) ),
        hitsClear: new FluentPattern<{ spacingDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' ), [{"name":"spacingDescription"}] ),
        snapshotHitsNone: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoneStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsFew: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsFewStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsEmerging: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsEmergingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsDeveloping: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsDevelopingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsClear: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsClearStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsSingleSlitEmerging: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmergingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsSingleSlitClear: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClearStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsNoBarrier: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoBarrierStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] )
      },
      spatialDescription: {
        rulerDoubleSlit: new FluentPattern<{ count: FluentVariable, spacing: FluentVariable, style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerDoubleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerDoubleSlitStringProperty' ), [{"name":"count"},{"name":"spacing"},{"name":"style","variants":["bands","peaks"]}] ),
        noRulerDoubleSlit: new FluentPattern<{ count: FluentVariable, style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerDoubleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerDoubleSlitStringProperty' ), [{"name":"count"},{"name":"style","variants":["bands","peaks"]}] ),
        rulerDoubleSlitArrangement: new FluentPattern<{ spacing: FluentVariable, style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerDoubleSlitArrangement', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerDoubleSlitArrangementStringProperty' ), [{"name":"spacing"},{"name":"style","variants":["bands","peaks"]}] ),
        noRulerDoubleSlitArrangement: new FluentPattern<{ style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerDoubleSlitArrangement', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerDoubleSlitArrangementStringProperty' ), [{"name":"style","variants":["bands","peaks"]}] ),
        rulerSingleSlit: new FluentPattern<{ centralWidth: FluentVariable, style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerSingleSlitStringProperty' ), [{"name":"centralWidth"},{"name":"style","variants":["bands","peaks"]}] ),
        noRulerSingleSlit: new FluentPattern<{ style: 'bands' | 'peaks' | TReadOnlyProperty<'bands' | 'peaks'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerSingleSlitStringProperty' ), [{"name":"style","variants":["bands","peaks"]}] )
      },
      zoomButtonGroup: {
        accessibleParagraph: new FluentPattern<{ level: 1 | 2 | 3 | 4 | number | 'other' | TReadOnlyProperty<1 | 2 | 3 | 4 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_zoomButtonGroup_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.zoomButtonGroup.accessibleParagraphStringProperty' ), [{"name":"level","variants":[1,2,3,4,{"type":"number","value":"other"}]}] )
      }
    },
    detectorScreenButtons: {
      clearScreen: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' ) ),
        accessibleContextResponse: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleContextResponseStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"isPlaying","variants":["true","false"]}] )
      },
      takeSnapshot: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleNameStringProperty' ) ),
        accessibleHelpText: new FluentPattern<{ maxSnapshots: FluentVariable, snapshotCount: 0 | 1 | 2 | 3 | 4 | number | 'other' | TReadOnlyProperty<0 | 1 | 2 | 3 | 4 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleHelpTextStringProperty' ), [{"name":"maxSnapshots"},{"name":"snapshotCount","variants":[0,1,2,3,4,{"type":"number","value":"other"}]}] ),
        accessibleContextResponse: new FluentPattern<{ snapshotCount: 4 | number | 'other' | TReadOnlyProperty<4 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleContextResponseStringProperty' ), [{"name":"snapshotCount","variants":[4,{"type":"number","value":"other"}]}] )
      },
      viewSnapshots: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleNameStringProperty' ) ),
        accessibleHelpText: new FluentPattern<{ snapshotCount: 0 | 1 | 2 | 3 | 4 | number | 'other' | TReadOnlyProperty<0 | 1 | 2 | 3 | 4 | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleHelpTextStringProperty' ), [{"name":"snapshotCount","variants":[0,1,2,3,4,{"type":"number","value":"other"}]}] ),
        accessibleContextResponse: new FluentPattern<{ snapshotCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleContextResponseStringProperty' ), [{"name":"snapshotCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] )
      }
    }
  }
};

export default QuantumWaveInterferenceFluent;

quantumWaveInterference.register('QuantumWaveInterferenceFluent', QuantumWaveInterferenceFluent);
