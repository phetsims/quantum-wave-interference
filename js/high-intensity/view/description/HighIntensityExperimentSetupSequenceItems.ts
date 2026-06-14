// Copyright 2026, University of Colorado Boulder

/**
 * Creates Screen 2 list items for the reached source, wave, and detector sequence, shown as the accumulating
 * bullets of the "What's happening at the moment" list. These are persistent PDOM state counterparts to the
 * High Intensity context responses.
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

// Wave-progress stages that can appear in the sequence list — excludes 'sourceOff' (source not yet started) and
// 'travelingToSlits' (intermediate stage before slit arrival, not represented as a distinct list item).
type SequenceWaveProgressStage = Exclude<QuantumWaveInterferenceWaveProgressStage, 'sourceOff' | 'travelingToSlits'>;

// Shape of each milestone item in the sequence list: a reactive string and a reactive visibility flag, both driven
// by DerivedProperty so they update automatically when model state or locale changes.
type SequenceItem = {
  stringProperty: TReadOnlyProperty<string>;
  visibleProperty: TReadOnlyProperty<boolean>;
};

/**
 * Returns the deduplicated set of Properties that must trigger recomputation of any sequence item string or
 * visibility. Merges the shared template dependencies with the locale-sensitive Fluent string dependencies so
 * that every DerivedProperty built from this list stays reactive to both model state and locale changes.
 */
function createDependencies( model: HighIntensityModel ): TReadOnlyProperty<unknown>[] {
  return Array.from( new Set( [
    ...QuantumWaveInterferenceAccessibleStateTemplate.createDependencies( model ),
    ...QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.advancingWave.getDependentProperties(),
    ...QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.waveProgressChanged.getDependentProperties()
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

function formatAdvancingWave( state: HighIntensityAccessibleViewState ): string {
  return QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.advancingWave.format( {
    beamDescription: formatSourceBeamDescription( state )
  } );
}

const formatWaveProgress = (
  state: HighIntensityAccessibleViewState,
  stage: SequenceWaveProgressStage
): string =>
  QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.waveProgressChanged.format( {
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
 * Creates the High Intensity source/wave/detector milestone list items.
 *
 * @param model - High Intensity model that owns the accessible state dependencies
 * @param getAccessibleViewState - returns the current High Intensity accessible view state
 * @returns list items for the "What's happening at the moment" list
 */
export default function HighIntensityExperimentSetupSequenceItems(
  model: HighIntensityModel,
  getAccessibleViewState: () => HighIntensityAccessibleViewState
): AccessibleListItem[] {
  return [
    createItem(
      model,
      getAccessibleViewState,
      state => formatAdvancingWave( state ),
      state => state.isEmitting && state.isPlaying
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatWaveProgress( state, getAfterSlitsStage( state ) ),
      state => state.isEmitting && state.patternKind !== 'noBarrier' && state.waveProgress.hasPassedSlits
    ),

    // The at-slits and intensity-pattern-forming milestones are spoken as context responses only; the persistent
    // state keeps just the ongoing wave behavior and the final pattern. In hits mode the accumulating hit count is
    // the ongoing state, so it remains a list item.
    createItem(
      model,
      getAccessibleViewState,
      state => formatDetectorPattern( state, 'collectingHits' ),
      state => state.isEmitting &&
               state.detectionMode === 'hits' &&
               state.patternFormation === 'collectingHits'
    ),
    createItem(
      model,
      getAccessibleViewState,
      state => formatDetectorPattern( state, 'complete' ),

      // Only while the detector screen itself is shown — in graph view the graph's own pattern description
      // bullet covers the result, and there is no detector screen to describe.
      state => state.isEmitting &&
               state.displayMode === 'screen' &&
               state.detectionMode === 'intensity' &&
               getDetectorPatternFormationFactor( model ) >= DETECTOR_PATTERN_FORMATION_COMPLETE_THRESHOLD
    )
  ];
}
