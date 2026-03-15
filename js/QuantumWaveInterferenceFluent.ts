// Copyright 2026, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from quantum-wave-interference-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import FluentLibrary from '../../chipper/js/browser-and-node/FluentLibrary.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
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
addToMapIfDefined( 'screen_name', 'screen.nameStringProperty' );
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
addToMapIfDefined( 'velocity', 'velocityStringProperty' );
addToMapIfDefined( 'min', 'minStringProperty' );
addToMapIfDefined( 'max', 'maxStringProperty' );
addToMapIfDefined( 'slitSeparation', 'slitSeparationStringProperty' );
addToMapIfDefined( 'screenDistance', 'screenDistanceStringProperty' );
addToMapIfDefined( 'slitSettings', 'slitSettingsStringProperty' );
addToMapIfDefined( 'bothOpen', 'bothOpenStringProperty' );
addToMapIfDefined( 'leftCovered', 'leftCoveredStringProperty' );
addToMapIfDefined( 'rightCovered', 'rightCoveredStringProperty' );
addToMapIfDefined( 'leftDetector', 'leftDetectorStringProperty' );
addToMapIfDefined( 'rightDetector', 'rightDetectorStringProperty' );

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
    nameStringProperty: _.get( QuantumWaveInterferenceStrings, 'screen.nameStringProperty' )
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
  velocityStringProperty: _.get( QuantumWaveInterferenceStrings, 'velocityStringProperty' ),
  velocityPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'velocityPatternStringProperty' ),
  minStringProperty: _.get( QuantumWaveInterferenceStrings, 'minStringProperty' ),
  maxStringProperty: _.get( QuantumWaveInterferenceStrings, 'maxStringProperty' ),
  slitSeparationStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationStringProperty' ),
  screenDistanceStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenDistanceStringProperty' ),
  slitSettingsStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSettingsStringProperty' ),
  slitSeparationPatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'slitSeparationPatternStringProperty' ),
  screenDistancePatternStringProperty: _.get( QuantumWaveInterferenceStrings, 'screenDistancePatternStringProperty' ),
  bothOpenStringProperty: _.get( QuantumWaveInterferenceStrings, 'bothOpenStringProperty' ),
  leftCoveredStringProperty: _.get( QuantumWaveInterferenceStrings, 'leftCoveredStringProperty' ),
  rightCoveredStringProperty: _.get( QuantumWaveInterferenceStrings, 'rightCoveredStringProperty' ),
  leftDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'leftDetectorStringProperty' ),
  rightDetectorStringProperty: _.get( QuantumWaveInterferenceStrings, 'rightDetectorStringProperty' )
};

export default QuantumWaveInterferenceFluent;

quantumWaveInterference.register('QuantumWaveInterferenceFluent', QuantumWaveInterferenceFluent);
