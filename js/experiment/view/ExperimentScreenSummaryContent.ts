// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenSummaryContent provides the screen summary for the Experiment screen, describing the play area,
 * control area, current details, and an interaction hint for screen reader users.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';

type FluentBoolean = 'true' | 'false';

const toFluentBoolean = ( value: boolean ): FluentBoolean => value ? 'true' : 'false';

export default class ExperimentScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: ExperimentModel ) {

    // Track the active scene's source type (a plain value, not a Property, so derive with a function)
    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );

    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( toFluentBoolean );

    const isPlayingStringProperty = model.isPlayingProperty.derived( toFluentBoolean );

    const isMaxHitsReachedStringProperty = model.currentIsMaxHitsReachedProperty.derived( toFluentBoolean );

    // Fluent select expressions use string keys, so derived booleans are normalized through one helper.
    const hasHitsStringProperty = model.currentTotalHitsProperty.derived( totalHits => toFluentBoolean( totalHits > 0 ) );

    const currentDetailsContentProperty = QuantumWaveInterferenceFluent.a11y.screenSummary.currentDetails.createProperty( {
      sourceType: sourceTypeProperty,
      slitSetting: model.currentSlitSettingProperty,
      detectionMode: model.currentDetectionModeProperty,
      isEmitting: isEmittingStringProperty,
      isPlaying: isPlayingStringProperty,
      isMaxHitsReached: isMaxHitsReachedStringProperty,
      hasHits: hasHitsStringProperty
    } );

    const defaultInteractionHintContentProperty = QuantumWaveInterferenceFluent.a11y.screenSummary.interactionHint.createProperty( {
      sourceType: sourceTypeProperty,
      isEmitting: isEmittingStringProperty
    } );

    const interactionHintContentProperty = new DerivedProperty(
      [
        defaultInteractionHintContentProperty,
        model.currentIsMaxHitsReachedProperty,
        QuantumWaveInterferenceFluent.a11y.screenSummary.maxHitsReachedHintStringProperty
      ],
      ( defaultInteractionHint, isMaxHitsReached, maxHitsReachedHint ) =>
        isMaxHitsReached ? maxHitsReachedHint : defaultInteractionHint
    );

    super( {
      playAreaContent: QuantumWaveInterferenceFluent.a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: QuantumWaveInterferenceFluent.a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsContentProperty,
      interactionHintContent: interactionHintContentProperty
    } );
  }
}
