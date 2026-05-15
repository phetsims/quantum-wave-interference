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
addToMapIfDefined( 'screenBrightness', 'screenBrightnessStringProperty' );
addToMapIfDefined( 'intensityGraph', 'intensityGraphStringProperty' );
addToMapIfDefined( 'hitsGraph', 'hitsGraphStringProperty' );
addToMapIfDefined( 'count', 'countStringProperty' );
addToMapIfDefined( 'ruler', 'rulerStringProperty' );
addToMapIfDefined( 'stopwatch', 'stopwatchStringProperty' );
addToMapIfDefined( 'detector', 'detectorStringProperty' );
addToMapIfDefined( 'tapeMeasure', 'tapeMeasureStringProperty' );
addToMapIfDefined( 'timePlot', 'timePlotStringProperty' );
addToMapIfDefined( 'positionPlot', 'positionPlotStringProperty' );
addToMapIfDefined( 'time', 'timeStringProperty' );
addToMapIfDefined( 'position', 'positionStringProperty' );
addToMapIfDefined( 'barrier', 'barrierStringProperty' );
addToMapIfDefined( 'none', 'noneStringProperty' );
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
addToMapIfDefined( 'destructive', 'destructiveStringProperty' );
addToMapIfDefined( 'nonDestructive', 'nonDestructiveStringProperty' );
addToMapIfDefined( 'detect', 'detectStringProperty' );
addToMapIfDefined( 'resetDetector', 'resetDetectorStringProperty' );
addToMapIfDefined( 'particleDetected', 'particleDetectedStringProperty' );
addToMapIfDefined( 'notDetected', 'notDetectedStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playArea', 'a11y.screenSummary.playAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_maxHitsReachedHint', 'a11y.screenSummary.maxHitsReachedHintStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_experimentSetupHeading', 'a11y.experimentSetupHeadingStringProperty' );
addToMapIfDefined( 'a11y_sourceHeading', 'a11y.sourceHeadingStringProperty' );
addToMapIfDefined( 'a11y_slitsHeading', 'a11y.slitsHeadingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenHeading', 'a11y.detectorScreenHeadingStringProperty' );
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
addToMapIfDefined( 'a11y_ruler_accessibleHelpText', 'a11y.ruler.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleHelpText', 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseChecked', 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleHelpText', 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseChecked', 'a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseUnchecked', 'a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_slitSeparationSlider_accessibleHelpText', 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleHelpText', 'a11y.screenDistanceSlider.accessibleHelpTextStringProperty' );
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
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsNone', 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsFew', 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsClear', 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitEmerging', 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitClear', 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNone', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoneStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsFew', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsFewStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsEmerging', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsDeveloping', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsDevelopingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsClear', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsClearStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitEmerging', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmergingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitClear', 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClearStringProperty' );
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
  screenBrightnessStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenBrightnessStringProperty' ),
  intensityGraphStringProperty: _.get( QuantumWaveInterferenceStrings, 'intensityGraphStringProperty' ),
  hitsGraphStringProperty: _.get( QuantumWaveInterferenceStrings, 'hitsGraphStringProperty' ),
  countStringProperty: _.get( QuantumWaveInterferenceStrings, 'countStringProperty' ),
  snapshotNumberPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotNumberPatternStringProperty' ),
  rulerStringProperty: _.get( QuantumWaveInterferenceStrings, 'rulerStringProperty' ),
  stopwatchStringProperty: _.get( QuantumWaveInterferenceStrings, 'stopwatchStringProperty' ),
  detectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorStringProperty' ),
  tapeMeasureStringProperty: _.get( QuantumWaveInterferenceStrings, 'tapeMeasureStringProperty' ),
  timePlotStringProperty: _.get( QuantumWaveInterferenceStrings, 'timePlotStringProperty' ),
  positionPlotStringProperty: _.get( QuantumWaveInterferenceStrings, 'positionPlotStringProperty' ),
  timeStringProperty: _.get( QuantumWaveInterferenceStrings, 'timeStringProperty' ),
  positionStringProperty: _.get( QuantumWaveInterferenceStrings, 'positionStringProperty' ),
  barrierStringProperty: _.get( QuantumWaveInterferenceStrings, 'barrierStringProperty' ),
  noneStringProperty: _.get( QuantumWaveInterferenceStrings, 'noneStringProperty' ),
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
  destructiveStringProperty: _.get( QuantumWaveInterferenceStrings, 'destructiveStringProperty' ),
  nonDestructiveStringProperty: _.get( QuantumWaveInterferenceStrings, 'nonDestructiveStringProperty' ),
  detectStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectStringProperty' ),
  resetDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'resetDetectorStringProperty' ),
  particleDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleDetectedStringProperty' ),
  notDetectedStringProperty: _.get( QuantumWaveInterferenceStrings, 'notDetectedStringProperty' ),
  _comment_1: new FluentComment( {"comment":"Accessibility strings","associatedKey":"a11y"} ),
  a11y: {
    screenSummary: {
      playAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaStringProperty' ) ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      maxHitsReachedHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_maxHitsReachedHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.maxHitsReachedHintStringProperty' ) ),
      currentDetails: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, hasHits: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isMaxHitsReached: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, isPlaying: 'false' | 'true' | TReadOnlyProperty<'false' | 'true'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"hasHits","variants":["false","true"]},{"name":"isEmitting","variants":["true","false"]},{"name":"isMaxHitsReached","variants":["true","false"]},{"name":"isPlaying","variants":["false","true"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      interactionHint: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.interactionHintStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    experimentSetupHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentSetupHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupHeadingStringProperty' ) ),
    sourceHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sourceHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceHeadingStringProperty' ) ),
    slitsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.slitsHeadingStringProperty' ) ),
    detectorScreenHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenHeadingStringProperty' ) ),
    experimentSetupDetails: {
      leadingParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_leadingParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.leadingParagraphStringProperty' ) ),
      sourceEmitter: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_sourceEmitter', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.sourceEmitterStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      detectionMode: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_detectionMode', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.detectionModeStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]}] ),
      wavelength: new FluentPattern<{ color: FluentVariable, wavelength: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_wavelength', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.wavelengthStringProperty' ), [{"name":"color"},{"name":"wavelength"}] ),
      particleSpeed: new FluentPattern<{ speed: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_particleSpeed', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.particleSpeedStringProperty' ), [{"name":"speed"}] ),
      slitConfiguration: new FluentPattern<{ slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | 'noBarrier' | 'bothDetectors'> }>( fluentSupport.bundleProperty, 'a11y_experimentSetupDetails_slitConfiguration', _.get( QuantumWaveInterferenceStrings, 'a11y.experimentSetupDetails.slitConfigurationStringProperty' ), [{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector","noBarrier","bothDetectors"]}] ),
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
    ruler: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_ruler_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.ruler.accessibleHelpTextStringProperty' ) )
    },
    rulerCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseChecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
      accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', _.get( QuantumWaveInterferenceStrings, 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
    },
    stopwatchCheckbox: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_stopwatchCheckbox_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' ) ),
      accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_stopwatchCheckbox_accessibleContextResponseChecked', _.get( QuantumWaveInterferenceStrings, 'a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
      accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_stopwatchCheckbox_accessibleContextResponseUnchecked', _.get( QuantumWaveInterferenceStrings, 'a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
    },
    slitSeparationSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitSeparationSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' ) )
    },
    screenDistanceSlider: {
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenDistanceSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.screenDistanceSlider.accessibleHelpTextStringProperty' ) )
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
        intensity: new FluentPattern<{ bandCount: FluentVariable, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' ), [{"name":"bandCount"},{"name":"spatialDescription"}] ),
        intensitySingleSlit: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDeveloping: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"spatialDescription"}] ),
        snapshotHitsNone: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsNoneStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsFew: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsFewStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsEmerging: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsEmergingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsDeveloping: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsDevelopingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsClear: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsClearStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] ),
        snapshotHitsSingleSlitEmerging: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitEmergingStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
        snapshotHitsSingleSlitClear: new FluentPattern<{ hitCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_snapshotHitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.snapshotHitsSingleSlitClearStringProperty' ), [{"name":"hitCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"spatialDescription"}] )
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
        accessibleHelpText: new FluentPattern<{ maxSnapshots: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleHelpTextStringProperty' ), [{"name":"maxSnapshots"}] ),
        accessibleContextResponse: new FluentPattern<{ snapshotNumber: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleContextResponseStringProperty' ), [{"name":"snapshotNumber"}] )
      },
      viewSnapshots: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_viewSnapshots_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.viewSnapshots.accessibleHelpTextStringProperty' ) )
      }
    }
  }
};

export default QuantumWaveInterferenceFluent;

quantumWaveInterference.register('QuantumWaveInterferenceFluent', QuantumWaveInterferenceFluent);
