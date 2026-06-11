// Copyright 2026, University of Colorado Boulder

/**
 * Creates Screen 2 Experimental Setup list items for the reached source, wave, and detector sequence. These are
 * persistent PDOM state counterparts to the High Intensity context responses.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { type AccessibleListItem } from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import HighIntensityModel from '../../model/HighIntensityModel.js';
import { DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD } from '../../model/HighIntensitySceneModel.js';
import { type HighIntensityAccessibleViewState, type QuantumWaveInterferencePatternFormation, type QuantumWaveInterferenceWaveProgressStage } from './HighIntensityAccessibleViewState.js';
import { formatDetectorDescription, formatSourceBeamDescription } from './QuantumWaveInterferenceAccessibleStateFormatters.js';
import QuantumWaveInterferenceAccessibleStateTemplate from './QuantumWaveInterferenceAccessibleStateTemplate.js';

type SequenceWaveProgressStage = Exclude<QuantumWaveInterferenceWaveProgressStage, 'sourceOff' | 'travelingToSlits'>;

type SequenceItem = {
  stringProperty: TReadOnlyProperty<string>;
  visibleProperty: TReadOnlyProperty<boolean>;
};

function createDependencies( model: HighIntensityModel ): TReadOnlyProperty<unknown>[] {
  return Array.from( new Set( [
    ...QuantumWaveInterferenceAccessibleStateTemplate.createDependencies( model ),
    ...QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStarted.getDependentProperties(),
    ...QuantumWaveInterferenceFluent.a11y.highIntensityResponses.advancingWave.getDependentProperties(),
    ...QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveProgressChanged.getDependentProperties()
  ] ) );
}

const createSequenceStringProperty = (
  model: HighIntensityModel,
  getAccessibleViewState: () => HighIntensityAccessibleViewState,
  createString: ( state: HighIntensityAccessibleViewState ) => string
): TReadOnlyProperty<string> => DerivedProperty.deriveAny(
  createDependencies( model ),
  () => createString( getAccessibleViewState() )
);

const createSequenceVisibleProperty = (
  model: HighIntensityModel,
  getAccessibleViewState: () => HighIntensityAccessibleViewState,
  isVisible: ( state: HighIntensityAccessibleViewState ) => boolean
): TReadOnlyProperty<boolean> => DerivedProperty.deriveAny(
  createDependencies( model ),
  () => isVisible( getAccessibleViewState() )
);

const createItem = (
  model: HighIntensityModel,
  getAccessibleViewState: () => HighIntensityAccessibleViewState,
  createString: ( state: HighIntensityAccessibleViewState ) => string,
  isVisible: ( state: HighIntensityAccessibleViewState ) => boolean
): SequenceItem => ( {
  stringProperty: createSequenceStringProperty( model, getAccessibleViewState, createString ),
  visibleProperty: createSequenceVisibleProperty( model, getAccessibleViewState, isVisible )
} );

function formatSourceStarted( state: HighIntensityAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.highIntensityResponses.sourceStarted.format( {
    isPlaying: state.isPlaying ? 'true' : 'false',
    timeSpeed: state.clockSpeedDescription
  } );
}

function formatAdvancingWave( state: HighIntensityAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.highIntensityResponses.advancingWave.format( {
    beamDescription: formatSourceBeamDescription( state )
  } );
}

const formatWaveProgress = (
  state: HighIntensityAccessibleViewState,
  stage: SequenceWaveProgressStage
): string =>
  QuantumWaveInterferenceFluent.a11y.highIntensityResponses.waveProgressChanged.format( {
    waveProgressStage: stage,
    waveDisplayMode: state.waveDisplayMode,
    patternKind: state.patternKind
  } );

function getAfterSlitsStage( state: HighIntensityAccessibleViewState ): SequenceWaveProgressStage {
  const patternKind = state.patternKind;

  return patternKind === 'doubleSlitInterference' ? 'interferingAfterSlits' :
         patternKind === 'singleSlitDiffraction' ? 'diffractingAfterSlits' :
         patternKind === 'whichPathDiffraction' ? 'whichPathAfterSlits' :
         patternKind === 'noBarrier' ? 'directToScreen' :
         ( () => { throw new Error( `Unrecognized patternKind: ${patternKind}` ); } )();
}

const formatDetectorPattern = (
  state: HighIntensityAccessibleViewState,
  patternFormation: QuantumWaveInterferencePatternFormation
): string => formatDetectorDescription( state, patternFormation );

function getDetectorPatternFormationFactor( model: HighIntensityModel ): number {
  return model.sceneProperty.value.detectorPatternFormationFactorProperty.value;
}

/**
 * Creates additional Experimental Setup list items for High Intensity source/wave/detector milestones.
 *
 * @param model - High Intensity model that owns the accessible state dependencies
 * @param getAccessibleViewState - returns the current High Intensity accessible view state
 * @returns list items to append to the shared Experimental Setup details list
 */
export default function HighIntensityExperimentSetupSequenceItems(
  model: HighIntensityModel,
  getAccessibleViewState: () => HighIntensityAccessibleViewState
): AccessibleListItem[] {
  return [
    createItem(
      model,
      getAccessibleViewState,
      state => formatSourceStarted( state ),
      state => state.isEmitting
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatAdvancingWave( state ),
      state => state.isEmitting && state.isPlaying
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatWaveProgress( state, 'atSlits' ),
      state => state.isEmitting && state.patternKind !== 'noBarrier' && state.waveProgress.hasReachedSlits
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatWaveProgress( state, getAfterSlitsStage( state ) ),
      state => state.isEmitting && state.patternKind !== 'noBarrier' && state.waveProgress.hasPassedSlits
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatDetectorPattern( state, state.detectionMode === 'averageIntensity' ? 'forming' : 'collectingHits' ),
      state => state.isEmitting &&
               ( state.detectionMode === 'averageIntensity' ?
                 getDetectorPatternFormationFactor( model ) > 0 :
                 state.patternFormation === 'collectingHits' )
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatDetectorPattern( state, 'complete' ),
      state => state.isEmitting &&
               state.detectionMode === 'averageIntensity' &&
               getDetectorPatternFormationFactor( model ) >= DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD
    )
  ];
}
