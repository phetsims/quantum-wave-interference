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
addToMapIfDefined( 'tapeMeasure', 'tapeMeasureStringProperty' );
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
addToMapIfDefined( 'timeScaleLabel', 'timeScaleLabelStringProperty' );
addToMapIfDefined( 'detectorSize', 'detectorSizeStringProperty' );
addToMapIfDefined( 'detect', 'detectStringProperty' );
addToMapIfDefined( 'resetDetector', 'resetDetectorStringProperty' );
addToMapIfDefined( 'particleDetected', 'particleDetectedStringProperty' );
addToMapIfDefined( 'notDetected', 'notDetectedStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playArea', 'a11y.screenSummary.playAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playAreaHighIntensity', 'a11y.screenSummary.playAreaHighIntensityStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playAreaSingleParticles', 'a11y.screenSummary.playAreaSingleParticlesStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_maxHitsReachedHint', 'a11y.screenSummary.maxHitsReachedHintStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_snapshotNode_deleteSnapshotAccessibleName', 'a11y.snapshotNode.deleteSnapshotAccessibleNameStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupHeading', 'a11y.experimentSetupHeadingStringProperty' );
addToMapIfDefined( 'a11y_sourceHeading', 'a11y.sourceHeadingStringProperty' );
addToMapIfDefined( 'a11y_slitsHeading', 'a11y.slitsHeadingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenHeading', 'a11y.detectorScreenHeadingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_heading', 'a11y.experimentDetectorScreenDetails.headingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_experimentalDetailsHeading', 'a11y.experimentDetectorScreenDetails.experimentalDetailsHeadingStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_sourceState', 'a11y.experimentDetectorScreenDetails.sourceStateStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_totalHits', 'a11y.experimentDetectorScreenDetails.totalHitsStringProperty' );
addToMapIfDefined( 'a11y_experimentDetectorScreenDetails_empty', 'a11y.experimentDetectorScreenDetails.emptyStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_overview', 'a11y.highIntensityState.overviewStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_sourceStatus', 'a11y.highIntensityState.sourceStatusStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_sourceBeam', 'a11y.highIntensityState.sourceBeamStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_photonDetail', 'a11y.highIntensityState.photonDetailStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_particleDetail', 'a11y.highIntensityState.particleDetailStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_slits', 'a11y.highIntensityState.slitsStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_detectorPattern', 'a11y.highIntensityState.detectorPatternStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_waveProgress', 'a11y.highIntensityState.waveProgressStringProperty' );
addToMapIfDefined( 'a11y_highIntensityState_displayTools', 'a11y.highIntensityState.displayToolsStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_sourceStarted', 'a11y.highIntensityResponses.sourceStartedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_sourceRestarted', 'a11y.highIntensityResponses.sourceRestartedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_advancingWave', 'a11y.highIntensityResponses.advancingWaveStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_sourceStopped', 'a11y.highIntensityResponses.sourceStoppedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_particleTypeChanged', 'a11y.highIntensityResponses.particleTypeChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_detectionModeChanged', 'a11y.highIntensityResponses.detectionModeChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_slitConfigurationChanged', 'a11y.highIntensityResponses.slitConfigurationChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_slitSeparationChanged', 'a11y.highIntensityResponses.slitSeparationChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_wavelengthChanged', 'a11y.highIntensityResponses.wavelengthChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_speedChanged', 'a11y.highIntensityResponses.speedChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_displayModeChanged', 'a11y.highIntensityResponses.displayModeChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_brightnessChanged', 'a11y.highIntensityResponses.brightnessChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_waveDisplayChanged', 'a11y.highIntensityResponses.waveDisplayChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_toolChanged', 'a11y.highIntensityResponses.toolChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_screenCleared', 'a11y.highIntensityResponses.screenClearedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_hitStageChanged', 'a11y.highIntensityResponses.hitStageChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_waveProgressChanged', 'a11y.highIntensityResponses.waveProgressChangedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_maxHitsReached', 'a11y.highIntensityResponses.maxHitsReachedStringProperty' );
addToMapIfDefined( 'a11y_highIntensityResponses_reset', 'a11y.highIntensityResponses.resetStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_leadingParagraph', 'a11y.experimentSetupDetails.leadingParagraphStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_sourceEmitter', 'a11y.experimentSetupDetails.sourceEmitterStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_detectionMode', 'a11y.experimentSetupDetails.detectionModeStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_wavelength', 'a11y.experimentSetupDetails.wavelengthStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_particleSpeed', 'a11y.experimentSetupDetails.particleSpeedStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_slitConfiguration', 'a11y.experimentSetupDetails.slitConfigurationStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_slitSeparation', 'a11y.experimentSetupDetails.slitSeparationStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupDetails_screenDistance', 'a11y.experimentSetupDetails.screenDistanceStringProperty' );
addToMapIfDefined( 'a11y_particleMass_accessibleParagraph', 'a11y.particleMass.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleName', 'a11y.emitterButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleHelpText', 'a11y.emitterButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleContextResponseOn', 'a11y.emitterButton.accessibleContextResponseOnStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleContextResponseOff', 'a11y.emitterButton.accessibleContextResponseOffStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleHelpText', 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseChecked', 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_tapeMeasureCheckbox_accessibleHelpText', 'a11y.tapeMeasureCheckbox.accessibleHelpTextStringProperty' );
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
addToMapIfDefined( 'a11y_detectorCheckbox_accessibleHelpText', 'a11y.detectorCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitSeparationSlider_accessibleHelpText', 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitPositionSlider_accessibleName', 'a11y.slitPositionSlider.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_slitPositionSlider_accessibleHelpText', 'a11y.slitPositionSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitPositionSlider_accessibleValue', 'a11y.slitPositionSlider.accessibleValueStringProperty' );
addToMapIfDefined( 'a11y_slitPositionSlider_accessibleContextResponse', 'a11y.slitPositionSlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleHelpText', 'a11y.screenDistanceSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleContextResponseNoPattern', 'a11y.screenDistanceSlider.accessibleContextResponseNoPatternStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleContextResponseHits', 'a11y.screenDistanceSlider.accessibleContextResponseHitsStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleContextResponse', 'a11y.screenDistanceSlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_accessibleHelpText', 'a11y.wavelengthSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_accessibleValue', 'a11y.wavelengthSlider.accessibleValueStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_violet', 'a11y.wavelengthSlider.color.violetStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_blue', 'a11y.wavelengthSlider.color.blueStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_indigo', 'a11y.wavelengthSlider.color.indigoStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_green', 'a11y.wavelengthSlider.color.greenStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_yellow', 'a11y.wavelengthSlider.color.yellowStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_orange', 'a11y.wavelengthSlider.color.orangeStringProperty' );
addToMapIfDefined( 'a11y_wavelengthSlider_color_red', 'a11y.wavelengthSlider.color.redStringProperty' );
addToMapIfDefined( 'a11y_particleSpeedSlider_accessibleHelpText', 'a11y.particleSpeedSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_intensitySlider_accessibleHelpText', 'a11y.intensitySlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_intensitySlider_accessibleContextResponse', 'a11y.intensitySlider.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleName', 'a11y.brightnessSlider.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleHelpText', 'a11y.brightnessSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleName', 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleHelpText', 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_intensityRadioButton_accessibleContextResponse', 'a11y.detectionModeRadioButtons.intensityRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_hitsRadioButton_accessibleContextResponse', 'a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponseStringProperty' );
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
addToMapIfDefined( 'a11y_slitWidthMicrometersPattern', 'a11y.slitWidthMicrometersPatternStringProperty' );
addToMapIfDefined( 'a11y_slitView_accessibleParagraph', 'a11y.slitView.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_zoomInButton_accessibleName', 'a11y.zoomInButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_zoomOutButton_accessibleName', 'a11y.zoomOutButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleHelpTextCollapsed', 'a11y.graphAccordionBox.accessibleHelpTextCollapsedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseExpanded', 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_intensityOff', 'a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_intensity', 'a11y.graphAccordionBox.accessibleParagraph.intensityStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_intensitySingleSlit', 'a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlitStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsNone', 'a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsFew', 'a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsEmerging', 'a11y.graphAccordionBox.accessibleParagraph.hitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsDeveloping', 'a11y.graphAccordionBox.accessibleParagraph.hitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsClear', 'a11y.graphAccordionBox.accessibleParagraph.hitsClearStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitEmerging', 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitClear', 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitClearStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_zoomButtonGroup_zoomLevelResponse', 'a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponseStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_zoomButtonGroup_zoomInAccessibleHelpText', 'a11y.graphAccordionBox.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_zoomButtonGroup_zoomOutAccessibleHelpText', 'a11y.graphAccordionBox.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_maxHitsReached_accessibleContextResponse', 'a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensityOff', 'a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensity', 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_intensityNoBarrier', 'a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsNone', 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsFew', 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsClear', 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitEmerging', 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitClear', 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsNoBarrier', 'a11y.detectorScreen.accessibleParagraph.hitsNoBarrierStringProperty' );
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
addToMapIfDefined( 'a11y_detectorScreen_zoomButtonGroup_zoomInAccessibleHelpText', 'a11y.detectorScreen.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_zoomButtonGroup_zoomOutAccessibleHelpText', 'a11y.detectorScreen.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty' );
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
  slitsLabelPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitsLabelPatternStringProperty' ),
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
  tapeMeasureStringProperty: _.get( QuantumWaveInterferenceStrings, 'tapeMeasureStringProperty' ),
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
  timeScaleLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'timeScaleLabelStringProperty' ),
  detectorSizeStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorSizeStringProperty' ),
  detectStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectStringProperty' ),
  resetDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'resetDetectorStringProperty' ),
  particleDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleDetectedStringProperty' ),
  notDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'notDetectedStringProperty' ),
  _comment_1: new FluentComment( {"comment":"Accessibility strings","associatedKey":"a11y"} ),
  a11y: {
    screenSummary: {
      playAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaStringProperty' ) ),
      playAreaHighIntensityStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playAreaHighIntensity', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaHighIntensityStringProperty' ) ),
      playAreaSingleParticlesStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playAreaSingleParticles', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaSingleParticlesStringProperty' ) ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      maxHitsReachedHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_maxHitsReachedHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.maxHitsReachedHintStringProperty' ) ),
      currentDetails: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, hasHits: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isMaxHitsReached: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, slitOrientation: 'topBottom' | 'leftRight' | TReadOnlyProperty<'topBottom' | 'leftRight'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"hasHits","variants":["true","false"]},{"name":"isEmitting","variants":["true","false"]},{"name":"isMaxHitsReached","variants":["true","false"]},{"name":"isPlaying","variants":["false","true"]},{"name":"slitOrientation","variants":["topBottom","leftRight"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      interactionHint: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.interactionHintStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    snapshotNode: {
      deleteSnapshotAccessibleName: new FluentPattern<{ snapshotTitle: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_snapshotNode_deleteSnapshotAccessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.snapshotNode.deleteSnapshotAccessibleNameStringProperty' ), [{"name":"snapshotTitle"}] )
    },
    experimentSetupHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentSetupHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupHeadingStringProperty' ) ),
    sourceHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sourceHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceHeadingStringProperty' ) ),
    slitsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.slitsHeadingStringProperty' ) ),
    detectorScreenHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenHeadingStringProperty' ) ),
    experimentDetectorScreenDetails: {
      heading: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_heading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.headingStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      experimentalDetailsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_experimentalDetailsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.experimentalDetailsHeadingStringProperty' ) ),
      sourceState: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_sourceState', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.sourceStateStringProperty' ), [{"name":"isEmitting","variants":["true","false"]}] ),
      totalHits: new FluentPattern<{ hitCount: FluentVariable, isMaxHitsReached: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_totalHits', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.totalHitsStringProperty' ), [{"name":"hitCount"},{"name":"isMaxHitsReached","variants":["true","false"]}] ),
      emptyStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentDetectorScreenDetails_empty', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentDetectorScreenDetails.emptyStringProperty' ) )
    },
    highIntensityState: {
      overview: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, displayMode: 'graph' | 'screen' | TReadOnlyProperty<'graph' | 'screen'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_overview', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.overviewStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"displayMode","variants":["graph","screen"]},{"name":"isEmitting","variants":["true","false"]},{"name":"isPlaying","variants":["false","true"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      sourceStatus: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, timeSpeed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_sourceStatus', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.sourceStatusStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"isPlaying","variants":["true","false"]},{"name":"timeSpeed"}] ),
      sourceBeam: new FluentPattern<{ isEmitting: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, photonColor: 'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red' | TReadOnlyProperty<'violet' | 'blue' | 'indigo' | 'green' | 'yellow' | 'orange' | 'red'>, slitSetting: 'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors' | TReadOnlyProperty<'noBarrier' | 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, wavefrontSpacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_sourceBeam', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.sourceBeamStringProperty' ), [{"name":"isEmitting","variants":["false","true"]},{"name":"photonColor","variants":["violet","blue","indigo","green","yellow","orange","red"]},{"name":"slitSetting","variants":["noBarrier","bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"wavefrontSpacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
      photonDetail: new FluentPattern<{ color: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_photonDetail', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.photonDetailStringProperty' ), [{"name":"color"},{"name":"wavelength"}] ),
      particleDetail: new FluentPattern<{ sourceType: 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'electrons' | 'neutrons' | 'heliumAtoms'>, speed: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_particleDetail', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.particleDetailStringProperty' ), [{"name":"sourceType","variants":["electrons","neutrons","heliumAtoms"]},{"name":"speed"},{"name":"wavelength"}] ),
      slits: new FluentPattern<{ separation: FluentVariable, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_slits', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.slitsStringProperty' ), [{"name":"separation"},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
      detectorPattern: new FluentPattern<{ bandSpacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'>, detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, hitCount: FluentVariable, hitStage: 'none' | number | 'few' | 'emerging' | 'developing' | 'clear' | TReadOnlyProperty<'none' | number | 'few' | 'emerging' | 'developing' | 'clear'>, isEmitting: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, patternFormation: 'empty' | 'forming' | 'complete' | 'paused' | 'notApplicable' | 'collectingHits' | TReadOnlyProperty<'empty' | 'forming' | 'complete' | 'paused' | 'notApplicable' | 'collectingHits'>, patternKind: 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier' | TReadOnlyProperty<'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier'>, slitSetting: 'leftCovered' | 'rightCovered' | TReadOnlyProperty<'leftCovered' | 'rightCovered'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_detectorPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.detectorPatternStringProperty' ), [{"name":"bandSpacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]},{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"hitCount"},{"name":"hitStage","variants":["none",{"type":"number","value":"few"},"emerging","developing","clear"]},{"name":"isEmitting","variants":["false","true"]},{"name":"patternFormation","variants":["empty","forming","complete","paused","notApplicable","collectingHits"]},{"name":"patternKind","variants":["doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction","noBarrier"]},{"name":"slitSetting","variants":["leftCovered","rightCovered"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]}] ),
      waveProgress: new FluentPattern<{ patternKind: 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier' | TReadOnlyProperty<'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, waveProgressStage: 'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen' | TReadOnlyProperty<'sourceOff' | 'travelingToSlits' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_waveProgress', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.waveProgressStringProperty' ), [{"name":"patternKind","variants":["doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction","noBarrier"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"waveProgressStage","variants":["sourceOff","travelingToSlits","atSlits","interferingAfterSlits","diffractingAfterSlits","whichPathAfterSlits","directToScreen","hittingScreen"]}] ),
      displayTools: new FluentPattern<{ brightness: FluentVariable, displayMode: 'graph' | 'screen' | TReadOnlyProperty<'graph' | 'screen'>, positionPlot: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, snapshotCount: FluentVariable, stopwatch: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, tapeMeasure: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, timePlot: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, waveDisplayMode: 'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude' | TReadOnlyProperty<'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityState_displayTools', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityState.displayToolsStringProperty' ), [{"name":"brightness"},{"name":"displayMode","variants":["graph","screen"]},{"name":"positionPlot","variants":["true","false"]},{"name":"snapshotCount"},{"name":"stopwatch","variants":["true","false"]},{"name":"tapeMeasure","variants":["true","false"]},{"name":"timePlot","variants":["true","false"]},{"name":"waveDisplayMode","variants":["electricField","realPart","imaginaryPart","amplitude"]}] )
    },
    highIntensityResponses: {
      sourceStarted: new FluentPattern<{ isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, timeSpeed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_sourceStarted', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.sourceStartedStringProperty' ), [{"name":"isPlaying","variants":["false","true"]},{"name":"timeSpeed"}] ),
      sourceRestartedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_sourceRestarted', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.sourceRestartedStringProperty' ) ),
      advancingWave: new FluentPattern<{ beamDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_advancingWave', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.advancingWaveStringProperty' ), [{"name":"beamDescription"}] ),
      sourceStopped: new FluentPattern<{ detectionMode: 'hits' | 'averageIntensity' | TReadOnlyProperty<'hits' | 'averageIntensity'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_sourceStopped', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.sourceStoppedStringProperty' ), [{"name":"detectionMode","variants":["hits","averageIntensity"]}] ),
      particleTypeChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_particleTypeChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.particleTypeChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      detectionModeChanged: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_detectionModeChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.detectionModeChangedStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      slitConfigurationChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_slitConfigurationChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.slitConfigurationChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"sourceRestartedResponse"}] ),
      slitSeparationChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_slitSeparationChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.slitSeparationChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      wavelengthChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_wavelengthChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.wavelengthChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      speedChanged: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_speedChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.speedChangedStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      displayModeChanged: new FluentPattern<{ displayMode: 'graph' | 'screen' | TReadOnlyProperty<'graph' | 'screen'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_displayModeChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.displayModeChangedStringProperty' ), [{"name":"displayMode","variants":["graph","screen"]}] ),
      brightnessChanged: new FluentPattern<{ brightnessTrend: 'increased' | 'decreased' | 'unchanged' | TReadOnlyProperty<'increased' | 'decreased' | 'unchanged'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_brightnessChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.brightnessChangedStringProperty' ), [{"name":"brightnessTrend","variants":["increased","decreased","unchanged"]}] ),
      waveDisplayChanged: new FluentPattern<{ waveDisplayMode: 'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude' | TReadOnlyProperty<'electricField' | 'realPart' | 'imaginaryPart' | 'amplitude'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_waveDisplayChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.waveDisplayChangedStringProperty' ), [{"name":"waveDisplayMode","variants":["electricField","realPart","imaginaryPart","amplitude"]}] ),
      toolChanged: new FluentPattern<{ isVisible: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, tool: 'tapeMeasure' | 'stopwatch' | 'timePlot' | 'positionPlot' | TReadOnlyProperty<'tapeMeasure' | 'stopwatch' | 'timePlot' | 'positionPlot'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_toolChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.toolChangedStringProperty' ), [{"name":"isVisible","variants":["true","false"]},{"name":"tool","variants":["tapeMeasure","stopwatch","timePlot","positionPlot"]}] ),
      screenCleared: new FluentPattern<{ isRestarting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceRestartedResponse: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_screenCleared', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.screenClearedStringProperty' ), [{"name":"isRestarting","variants":["true","false"]},{"name":"sourceRestartedResponse"}] ),
      hitStageChanged: new FluentPattern<{ hitStage: 'none' | number | 'few' | 'emerging' | 'developing' | 'clear' | TReadOnlyProperty<'none' | number | 'few' | 'emerging' | 'developing' | 'clear'>, patternKind: 'noBarrier' | 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | TReadOnlyProperty<'noBarrier' | 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_hitStageChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.hitStageChangedStringProperty' ), [{"name":"hitStage","variants":["none",{"type":"number","value":"few"},"emerging","developing","clear"]},{"name":"patternKind","variants":["noBarrier","doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction"]}] ),
      waveProgressChanged: new FluentPattern<{ patternKind: 'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier' | TReadOnlyProperty<'doubleSlitInterference' | 'singleSlitDiffraction' | 'whichPathDiffraction' | 'noBarrier'>, waveDisplayMode: 'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart' | TReadOnlyProperty<'amplitude' | 'electricField' | 'realPart' | 'imaginaryPart'>, waveProgressStage: 'sourceOff' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen' | TReadOnlyProperty<'sourceOff' | 'atSlits' | 'interferingAfterSlits' | 'diffractingAfterSlits' | 'whichPathAfterSlits' | 'directToScreen' | 'hittingScreen'> }>( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_waveProgressChanged', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.waveProgressChangedStringProperty' ), [{"name":"patternKind","variants":["doubleSlitInterference","singleSlitDiffraction","whichPathDiffraction","noBarrier"]},{"name":"waveDisplayMode","variants":["amplitude","electricField","realPart","imaginaryPart"]},{"name":"waveProgressStage","variants":["sourceOff","atSlits","interferingAfterSlits","diffractingAfterSlits","whichPathAfterSlits","directToScreen","hittingScreen"]}] ),
      maxHitsReachedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_maxHitsReached', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.maxHitsReachedStringProperty' ) ),
      resetStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_highIntensityResponses_reset', _.get( QuantumWaveInterferenceStrings, 'a11y.highIntensityResponses.resetStringProperty' ) )
    },
    experimentSetupDetails: {
      leadingParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_leadingParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.leadingParagraphStringProperty' ) ),
      sourceEmitter: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_sourceEmitter', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.sourceEmitterStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      detectionMode: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_detectionMode', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.detectionModeStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      wavelength: new FluentPattern<{ color: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_wavelength', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.wavelengthStringProperty' ), [{"name":"color"},{"name":"wavelength"}] ),
      particleSpeed: new FluentPattern<{ speed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_particleSpeed', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.particleSpeedStringProperty' ), [{"name":"speed"}] ),
      slitConfiguration: new FluentPattern<{ slitOrientation: 'topBottom' | 'leftRight' | TReadOnlyProperty<'topBottom' | 'leftRight'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_slitConfiguration', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.slitConfigurationStringProperty' ), [{"name":"slitOrientation","variants":["topBottom","leftRight"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
      slitSeparation: new FluentPattern<{ distance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_slitSeparation', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.slitSeparationStringProperty' ), [{"name":"distance"}] ),
      screenDistance: new FluentPattern<{ distance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_screenDistance', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.screenDistanceStringProperty' ), [{"name":"distance"}] )
    },
    particleMass: {
      accessibleParagraph: new FluentPattern<{ sourceType: 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_particleMass_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.particleMass.accessibleParagraphStringProperty' ), [{"name":"sourceType","variants":["electrons","neutrons","heliumAtoms"]}] )
    },
    emitterButton: {
      accessibleName: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleNameStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleHelpText: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleHelpTextStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleContextResponseOn: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleContextResponseOn', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleContextResponseOnStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"isPlaying","variants":["false","true"]}] ),
      accessibleContextResponseOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleContextResponseOff', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleContextResponseOffStringProperty' ) )
    },
    rulerCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseChecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
      accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
    },
    tapeMeasureCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_tapeMeasureCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.tapeMeasureCheckbox.accessibleHelpTextStringProperty' ) )
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
    detectorCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorCheckbox.accessibleHelpTextStringProperty' ) )
    },
    slitSeparationSlider: {
      accessibleHelpText: new FluentPattern<{ unit: 'millimeters' | 'nanometers' | 'micrometers' | TReadOnlyProperty<'millimeters' | 'nanometers' | 'micrometers'> }>( fluentSupport.bundleProperty, 'a11y_slitSeparationSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' ), [{"name":"unit","variants":["millimeters","nanometers","micrometers"]}] )
    },
    slitPositionSlider: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitPositionSlider_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.slitPositionSlider.accessibleNameStringProperty' ) ),
      accessibleHelpText: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_slitPositionSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.slitPositionSlider.accessibleHelpTextStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleValue: new FluentPattern<{ value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitPositionSlider_accessibleValue', _.get( QuantumWaveInterferenceStrings, 'a11y.slitPositionSlider.accessibleValueStringProperty' ), [{"name":"value"}] ),
      accessibleContextResponse: new FluentPattern<{ position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_slitPositionSlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.slitPositionSlider.accessibleContextResponseStringProperty' ), [{"name":"position","variants":["closest","closer","farthest","farther"]}] )
    },
    screenDistanceSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenDistanceSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.screenDistanceSlider.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseNoPattern: new FluentPattern<{ position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_screenDistanceSlider_accessibleContextResponseNoPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.screenDistanceSlider.accessibleContextResponseNoPatternStringProperty' ), [{"name":"position","variants":["closest","closer","farthest","farther"]}] ),
      accessibleContextResponseHits: new FluentPattern<{ position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_screenDistanceSlider_accessibleContextResponseHits', _.get( QuantumWaveInterferenceStrings, 'a11y.screenDistanceSlider.accessibleContextResponseHitsStringProperty' ), [{"name":"position","variants":["closest","closer","farthest","farther"]}] ),
      accessibleContextResponse: new FluentPattern<{ patternEffect: 'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther' | TReadOnlyProperty<'doubleSlitCloser' | 'doubleSlitFarther' | 'singleSlitCloser' | 'singleSlitFarther'>, position: 'closest' | 'closer' | 'farthest' | 'farther' | TReadOnlyProperty<'closest' | 'closer' | 'farthest' | 'farther'> }>( fluentSupport.bundleProperty, 'a11y_screenDistanceSlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.screenDistanceSlider.accessibleContextResponseStringProperty' ), [{"name":"patternEffect","variants":["doubleSlitCloser","doubleSlitFarther","singleSlitCloser","singleSlitFarther"]},{"name":"position","variants":["closest","closer","farthest","farther"]}] )
    },
    wavelengthSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.accessibleHelpTextStringProperty' ) ),
      accessibleValue: new FluentPattern<{ color: FluentVariable, value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_wavelengthSlider_accessibleValue', _.get( QuantumWaveInterferenceStrings, 'a11y.wavelengthSlider.accessibleValueStringProperty' ), [{"name":"color"},{"name":"value"}] ),
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
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_particleSpeedSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.particleSpeedSlider.accessibleHelpTextStringProperty' ) )
    },
    intensitySlider: {
      accessibleHelpText: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_intensitySlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.intensitySlider.accessibleHelpTextStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleContextResponse: new FluentPattern<{ change: 'more' | 'less' | 'max' | number | 'zero' | TReadOnlyProperty<'more' | 'less' | 'max' | number | 'zero'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_intensitySlider_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.intensitySlider.accessibleContextResponseStringProperty' ), [{"name":"change","variants":["more","less","max",{"type":"number","value":"zero"}]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    brightnessSlider: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleHelpTextStringProperty' ) )
    },
    detectionModeRadioButtons: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' ) ),
      intensityRadioButton: {
        accessibleContextResponse: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_intensityRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.intensityRadioButton.accessibleContextResponseStringProperty' ), [{"name":"isEmitting","variants":["true","false"]}] )
      },
      hitsRadioButton: {
        accessibleContextResponse: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_hitsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponseStringProperty' ), [{"name":"isEmitting","variants":["true","false"]}] )
      }
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
    slitWidthMicrometersPattern: new FluentPattern<{ value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitWidthMicrometersPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.slitWidthMicrometersPatternStringProperty' ), [{"name":"value"}] ),
    slitView: {
      accessibleParagraph: new FluentPattern<{ slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, slitWidth: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitView_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.slitView.accessibleParagraphStringProperty' ), [{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"slitWidth"}] )
    },
    zoomInButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomInButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomInButton.accessibleNameStringProperty' ) )
    },
    zoomOutButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomOutButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomOutButton.accessibleNameStringProperty' ) )
    },
    graphAccordionBox: {
      accessibleHelpTextCollapsedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleHelpTextCollapsed', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleHelpTextCollapsedStringProperty' ) ),
      accessibleContextResponseExpanded: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseExpanded', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      accessibleContextResponseCollapsed: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensityStringProperty' ), [{"name":"spatialDescription"}] ),
        intensitySingleSlitStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlitStringProperty' ) ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDeveloping: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsClearStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"spatialDescription"}] )
      },
      zoomButtonGroup: {
        zoomLevelResponse: new FluentPattern<{ level: FluentVariable, max: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_zoomButtonGroup_zoomLevelResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponseStringProperty' ), [{"name":"level"},{"name":"max"}] ),
        zoomInAccessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_zoomButtonGroup_zoomInAccessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty' ) ),
        zoomOutAccessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_zoomButtonGroup_zoomOutAccessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty' ) )
      }
    },
    detectorScreen: {
      maxHitsReached: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_maxHitsReached_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty' ) )
      },
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
        intensitySingleSlit: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"spatialDescription"}] ),
        intensityNoBarrierStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensityNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityNoBarrierStringProperty' ) ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDeveloping: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
        hitsClear: new FluentPattern<{ envelope: 'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter' | TReadOnlyProperty<'clusteringIntoTwoFaintSections' | 'clusteringIntoTwoDistinctSections' | 'brightestAtCenter'>, spacing: 'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether' | TReadOnlyProperty<'extremelyFarApart' | 'veryFarApart' | 'farApart' | 'somewhatCloseTogether' | 'closeTogether' | 'veryCloseTogether' | 'extremelyCloseTogether'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' ), [{"name":"envelope","variants":["clusteringIntoTwoFaintSections","clusteringIntoTwoDistinctSections","brightestAtCenter"]},{"name":"spacing","variants":["extremelyFarApart","veryFarApart","farApart","somewhatCloseTogether","closeTogether","veryCloseTogether","extremelyCloseTogether"]}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsNoBarrierStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsNoBarrier', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsNoBarrierStringProperty' ) ),
        snapshotHitsNone: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoneStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsFew: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsFewStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsEmerging: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsEmergingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsDeveloping: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsDevelopingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsClear: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsClearStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsSingleSlitEmerging: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmergingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsSingleSlitClear: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClearStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
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
        zoomInAccessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_zoomButtonGroup_zoomInAccessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty' ) ),
        zoomOutAccessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_zoomButtonGroup_zoomOutAccessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty' ) )
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
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleHelpTextStringProperty' ) ),
        accessibleContextResponse: new FluentPattern<{ snapshotCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleContextResponseStringProperty' ), [{"name":"snapshotCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] )
      }
    }
  }
};

export default QuantumWaveInterferenceFluent;

quantumWaveInterference.register('QuantumWaveInterferenceFluent', QuantumWaveInterferenceFluent);
