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
addToMapIfDefined( 'a11y_emitterButton_accessibleName', 'a11y.emitterButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_emitterButton_accessibleHelpText', 'a11y.emitterButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleHelpText', 'a11y.rulerCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseChecked', 'a11y.rulerCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_rulerCheckbox_accessibleContextResponseUnchecked', 'a11y.rulerCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleHelpText', 'a11y.stopwatchCheckbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseChecked', 'a11y.stopwatchCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_stopwatchCheckbox_accessibleContextResponseUnchecked', 'a11y.stopwatchCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleName', 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' );
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
      playArea: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.playAreaStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      currentDetails: new FluentPattern<{ detectionMode: 'averageIntensity' | 'hits' | TReadOnlyProperty<'averageIntensity' | 'hits'>, isEmitting: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, slitSetting: 'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector' | TReadOnlyProperty<'bothOpen' | 'leftCovered' | 'rightCovered' | 'leftDetector' | 'rightDetector'>, sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'>, totalHits: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"detectionMode","variants":["averageIntensity","hits"]},{"name":"isEmitting","variants":["true","false"]},{"name":"slitSetting","variants":["bothOpen","leftCovered","rightCovered","leftDetector","rightDetector"]},{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]},{"name":"totalHits"}] ),
      interactionHint: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( QuantumWaveInterferenceStrings, 'a11y.screenSummary.interactionHintStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] )
    },
    emitterButton: {
      accessibleName: new FluentPattern<{ sourceType: 'photons' | 'electrons' | 'neutrons' | 'heliumAtoms' | TReadOnlyProperty<'photons' | 'electrons' | 'neutrons' | 'heliumAtoms'> }>( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleNameStringProperty' ), [{"name":"sourceType","variants":["photons","electrons","neutrons","heliumAtoms"]}] ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_emitterButton_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.emitterButton.accessibleHelpTextStringProperty' ) )
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
    detectorScreenButtons: {
      clearScreen: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleName', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_detectorScreenButtons_clearScreen_accessibleHelpText', _.get( QuantumWaveInterferenceStrings, 'a11y.detectorScreenButtons.clearScreen.accessibleHelpTextStringProperty' ) )
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
