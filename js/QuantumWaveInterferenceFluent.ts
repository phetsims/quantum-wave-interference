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
addToMapIfDefined( 'intensity', 'intensityStringProperty' );
addToMapIfDefined( 'sourceIntensity', 'sourceIntensityStringProperty' );
addToMapIfDefined( 'particleSpeed', 'particleSpeedStringProperty' );
addToMapIfDefined( 'emissionRate', 'emissionRateStringProperty' );
addToMapIfDefined( 'rulerUnits', 'rulerUnitsStringProperty' );
addToMapIfDefined( 'electronMassLabel', 'electronMassLabelStringProperty' );
addToMapIfDefined( 'neutronMassLabel', 'neutronMassLabelStringProperty' );
addToMapIfDefined( 'heliumAtomMassLabel', 'heliumAtomMassLabelStringProperty' );
addToMapIfDefined( 'max', 'maxStringProperty' );
addToMapIfDefined( 'slitSeparation', 'slitSeparationStringProperty' );
addToMapIfDefined( 'screenDistance', 'screenDistanceStringProperty' );
addToMapIfDefined( 'slitSettings', 'slitSettingsStringProperty' );
addToMapIfDefined( 'bothOpen', 'bothOpenStringProperty' );
addToMapIfDefined( 'leftCovered', 'leftCoveredStringProperty' );
addToMapIfDefined( 'rightCovered', 'rightCoveredStringProperty' );
addToMapIfDefined( 'leftDetector', 'leftDetectorStringProperty' );
addToMapIfDefined( 'rightDetector', 'rightDetectorStringProperty' );
addToMapIfDefined( 'hits', 'hitsStringProperty' );
addToMapIfDefined( 'screenBrightness', 'screenBrightnessStringProperty' );
addToMapIfDefined( 'intensityGraph', 'intensityGraphStringProperty' );
addToMapIfDefined( 'hitsGraph', 'hitsGraphStringProperty' );
addToMapIfDefined( 'count', 'countStringProperty' );
addToMapIfDefined( 'ruler', 'rulerStringProperty' );
addToMapIfDefined( 'stopwatch', 'stopwatchStringProperty' );
addToMapIfDefined( 'detector', 'detectorStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playArea', 'a11y.screenSummary.playAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_sourceHeading', 'a11y.sourceHeadingStringProperty' );
addToMapIfDefined( 'a11y_slitsHeading', 'a11y.slitsHeadingStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenHeading', 'a11y.detectorScreenHeadingStringProperty' );
addToMapIfDefined( 'a11y_graphHeading', 'a11y.graphHeadingStringProperty' );
addToMapIfDefined( 'a11y_particleMass_accessibleParagraph', 'a11y.particleMass.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleName', 'a11y.emitterButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleHelpText', 'a11y.emitterButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_ruler_accessibleHelpText', 'a11y.ruler.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleHelpText', 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseChecked', 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleHelpText', 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseChecked', 'a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseUnchecked', 'a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_slitSeparationSlider_accessibleHelpText', 'a11y.slitSeparationSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_screenDistanceSlider_accessibleHelpText', 'a11y.screenDistanceSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_intensitySlider_accessibleHelpText', 'a11y.intensitySlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleName', 'a11y.brightnessSlider.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_brightnessSlider_accessibleHelpText', 'a11y.brightnessSlider.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleName', 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_accessibleHelpText', 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_intensityRadioButton_accessibleContextResponse', 'a11y.detectionModeRadioButtons.intensityRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectionModeRadioButtons_hitsRadioButton_accessibleContextResponse', 'a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_accessibleName', 'a11y.sceneRadioButtonGroup.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_accessibleHelpText', 'a11y.sceneRadioButtonGroup.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_photonsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.photonsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_electronsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.electronsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_neutronsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.neutronsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_sceneRadioButtonGroup_heliumAtomsRadioButton_accessibleContextResponse', 'a11y.sceneRadioButtonGroup.heliumAtomsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleName', 'a11y.slitSettingsComboBox.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleHelpText', 'a11y.slitSettingsComboBox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_slitSettingsComboBox_accessibleContextResponse', 'a11y.slitSettingsComboBox.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_slitWidthMillimetersPattern', 'a11y.slitWidthMillimetersPatternStringProperty' );
addToMapIfDefined( 'a11y_slitWidthMicrometersPattern', 'a11y.slitWidthMicrometersPatternStringProperty' );
addToMapIfDefined( 'a11y_slitView_accessibleParagraph', 'a11y.slitView.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_zoomInButton_accessibleName', 'a11y.zoomInButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_zoomOutButton_accessibleName', 'a11y.zoomOutButton.accessibleNameStringProperty' );
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
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseExpanded', 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' );
addToMapIfDefined( 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' );
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
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerBands', 'a11y.detectorScreen.spatialDescription.rulerBandsStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerBandsSingleSlit', 'a11y.detectorScreen.spatialDescription.rulerBandsSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerBands', 'a11y.detectorScreen.spatialDescription.noRulerBandsStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerBandsSingleSlit', 'a11y.detectorScreen.spatialDescription.noRulerBandsSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerPeaks', 'a11y.detectorScreen.spatialDescription.rulerPeaksStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_rulerPeaksSingleSlit', 'a11y.detectorScreen.spatialDescription.rulerPeaksSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerPeaks', 'a11y.detectorScreen.spatialDescription.noRulerPeaksStringProperty' );
addToMapIfDefined( 'a11y_detectorScreen_spatialDescription_noRulerPeaksSingleSlit', 'a11y.detectorScreen.spatialDescription.noRulerPeaksSingleSlitStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleName', 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleContextResponse', 'a11y.detectorScreenButtons.clearScreen.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_takeSnapshot_accessibleName', 'a11y.detectorScreenButtons.takeSnapshot.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_takeSnapshot_accessibleHelpText', 'a11y.detectorScreenButtons.takeSnapshot.accessibleHelpTextStringProperty' );
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
    }
  },
  photonsStringProperty: _.get( QuantumWaveInterferenceStrings, 'photonsStringProperty' ),
  electronsStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronsStringProperty' ),
  neutronsStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronsStringProperty' ),
  heliumAtomsStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomsStringProperty' ),
  photonSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'photonSourceStringProperty' ),
  electronSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronSourceStringProperty' ),
  neutronSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronSourceStringProperty' ),
  heliumAtomSourceStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomSourceStringProperty' ),
  doubleSlitStringProperty: _.get( QuantumWaveInterferenceStrings, 'doubleSlitStringProperty' ),
  detectorScreenStringProperty: _.get( QuantumWaveInterferenceStrings, 'detectorScreenStringProperty' ),
  intensityStringProperty: _.get( QuantumWaveInterferenceStrings, 'intensityStringProperty' ),
  sourceIntensityStringProperty: _.get( QuantumWaveInterferenceStrings, 'sourceIntensityStringProperty' ),
  particleSpeedStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleSpeedStringProperty' ),
  emissionRateStringProperty: _.get( QuantumWaveInterferenceStrings, 'emissionRateStringProperty' ),
  particleSpeedKmPerSecondPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleSpeedKmPerSecondPatternStringProperty' ),
  particleSpeedMeterPerSecondPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'particleSpeedMeterPerSecondPatternStringProperty' ),
  wavelengthNanometersPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'wavelengthNanometersPatternStringProperty' ),
  valueMillimetersPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'valueMillimetersPatternStringProperty' ),
  valueMicrometersPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'valueMicrometersPatternStringProperty' ),
  valueMetersPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'valueMetersPatternStringProperty' ),
  rulerUnitsStringProperty: _.get( QuantumWaveInterferenceStrings, 'rulerUnitsStringProperty' ),
  slitsLabelPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitsLabelPatternStringProperty' ),
  snapshotLabelValuePatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'snapshotLabelValuePatternStringProperty' ),
  electronMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'electronMassLabelStringProperty' ),
  neutronMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'neutronMassLabelStringProperty' ),
  heliumAtomMassLabelStringProperty: _.get( QuantumWaveInterferenceStrings, 'heliumAtomMassLabelStringProperty' ),
  maxStringProperty: _.get( QuantumWaveInterferenceStrings, 'maxStringProperty' ),
  slitSeparationStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationStringProperty' ),
  screenDistanceStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenDistanceStringProperty' ),
  slitSettingsStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSettingsStringProperty' ),
  slitSeparationPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationPatternStringProperty' ),
  slitSeparationMicrometerPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationMicrometerPatternStringProperty' ),
  screenDistancePatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenDistancePatternStringProperty' ),
  bothOpenStringProperty: _.get( QuantumWaveInterferenceStrings, 'bothOpenStringProperty' ),
  leftCoveredStringProperty: _.get( QuantumWaveInterferenceStrings, 'leftCoveredStringProperty' ),
  rightCoveredStringProperty: _.get( QuantumWaveInterferenceStrings, 'rightCoveredStringProperty' ),
  leftDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'leftDetectorStringProperty' ),
  rightDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'rightDetectorStringProperty' ),
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
  _comment_0: new FluentComment( {"comment":"Accessibility strings","associatedKey":"a11y"} ),
  a11y: {
    screenSummary: {
      playAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaStringProperty' ) ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      currentDetails: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, totalHits: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"isEmitting","variants":["true","false"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"totalHits"}] ),
      interactionHint: new FluentPattern<{ isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.interactionHintStringProperty' ), [{"name":"isEmitting","variants":["true","false"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    sourceHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sourceHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.sourceHeadingStringProperty' ) ),
    slitsHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_slitsHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.slitsHeadingStringProperty' ) ),
    detectorScreenHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenHeadingStringProperty' ) ),
    graphHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphHeading', _.get( QuantumWaveInterferenceStrings, 'a11y.graphHeadingStringProperty' ) ),
    particleMass: {
      accessibleParagraph: new FluentPattern<{ sourceType: 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_particleMass_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.particleMass.accessibleParagraphStringProperty' ), [{"name":"sourceType","variants":["electrons","neutrons","heliumAtoms"]}] )
    },
    emitterButton: {
      accessibleName: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleNameStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleHelpTextStringProperty' ) )
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
    intensitySlider: {
      accessibleHelpText: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_intensitySlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.intensitySlider.accessibleHelpTextStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    brightnessSlider: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_brightnessSlider_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.brightnessSlider.accessibleHelpTextStringProperty' ) )
    },
    detectionModeRadioButtons: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.accessibleHelpTextStringProperty' ) ),
      intensityRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_intensityRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.intensityRadioButton.accessibleContextResponseStringProperty' ) )
      },
      hitsRadioButton: {
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectionModeRadioButtons_hitsRadioButton_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponseStringProperty' ) )
      }
    },
    sceneRadioButtonGroup: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sceneRadioButtonGroup_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.sceneRadioButtonGroup.accessibleHelpTextStringProperty' ) ),
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
      accessibleContextResponse: new FluentPattern<{ slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector'> }>( fluentSupport.bundleProperty, 'a11y_slitSettingsComboBox_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.slitSettingsComboBox.accessibleContextResponseStringProperty' ), [{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector"]}] )
    },
    slitWidthMillimetersPattern: new FluentPattern<{ value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitWidthMillimetersPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.slitWidthMillimetersPatternStringProperty' ), [{"name":"value"}] ),
    slitWidthMicrometersPattern: new FluentPattern<{ value: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitWidthMicrometersPattern', _.get( QuantumWaveInterferenceStrings, 'a11y.slitWidthMicrometersPatternStringProperty' ), [{"name":"value"}] ),
    slitView: {
      accessibleParagraph: new FluentPattern<{ slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector'>, slitWidth: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_slitView_accessibleParagraph', _.get( QuantumWaveInterferenceStrings, 'a11y.slitView.accessibleParagraphStringProperty' ), [{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector"]},{"name":"slitWidth"}] )
    },
    zoomInButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomInButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomInButton.accessibleNameStringProperty' ) )
    },
    zoomOutButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_zoomOutButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.zoomOutButton.accessibleNameStringProperty' ) )
    },
    graphAccordionBox: {
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensityStringProperty' ), [{"name":"spatialDescription"}] ),
        intensitySingleSlit: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDeveloping: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsClearStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"spatialDescription"}] )
      },
      accessibleContextResponseExpandedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseExpanded', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseExpandedStringProperty' ) ),
      accessibleContextResponseCollapsedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_graphAccordionBox_accessibleContextResponseCollapsed', _.get( QuantumWaveInterferenceStrings, 'a11y.graphAccordionBox.accessibleContextResponseCollapsedStringProperty' ) )
    },
    detectorScreen: {
      accessibleParagraph: {
        intensityOffStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensityOff', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty' ) ),
        intensity: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensity', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensityStringProperty' ), [{"name":"spatialDescription"}] ),
        intensitySingleSlit: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_intensitySingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.intensitySingleSlitStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsNoneStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsNone', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty' ) ),
        hitsFewStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsFew', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty' ) ),
        hitsEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty' ) ),
        hitsDeveloping: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsDeveloping', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsDevelopingStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsClearStringProperty' ), [{"name":"spatialDescription"}] ),
        hitsSingleSlitEmergingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitEmerging', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty' ) ),
        hitsSingleSlitClear: new FluentPattern<{ spatialDescription: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_accessibleParagraph_hitsSingleSlitClear', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClearStringProperty' ), [{"name":"spatialDescription"}] )
      },
      spatialDescription: {
        rulerBands: new FluentPattern<{ bandSpacing: FluentVariable, numBands: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerBands', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerBandsStringProperty' ), [{"name":"bandSpacing"},{"name":"numBands"}] ),
        rulerBandsSingleSlit: new FluentPattern<{ centralWidth: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerBandsSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerBandsSingleSlitStringProperty' ), [{"name":"centralWidth"}] ),
        noRulerBands: new FluentPattern<{ numBands: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerBands', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerBandsStringProperty' ), [{"name":"numBands"}] ),
        noRulerBandsSingleSlitStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerBandsSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerBandsSingleSlitStringProperty' ) ),
        rulerPeaks: new FluentPattern<{ numPeaks: FluentVariable, peakSpacing: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerPeaks', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerPeaksStringProperty' ), [{"name":"numPeaks"},{"name":"peakSpacing"}] ),
        rulerPeaksSingleSlit: new FluentPattern<{ centralWidth: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_rulerPeaksSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.rulerPeaksSingleSlitStringProperty' ), [{"name":"centralWidth"}] ),
        noRulerPeaks: new FluentPattern<{ numPeaks: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerPeaks', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerPeaksStringProperty' ), [{"name":"numPeaks"}] ),
        noRulerPeaksSingleSlitStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreen_spatialDescription_noRulerPeaksSingleSlit', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreen.spatialDescription.noRulerPeaksSingleSlitStringProperty' ) )
      }
    },
    detectorScreenButtons: {
      clearScreen: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' ) ),
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleContextResponse', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleContextResponseStringProperty' ) )
      },
      takeSnapshot: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_takeSnapshot_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.takeSnapshot.accessibleHelpTextStringProperty' ) )
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
