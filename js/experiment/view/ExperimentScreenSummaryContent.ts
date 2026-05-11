// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenSummaryContent provides the screen summary for the Experiment screen, describing the play area,
 * control area, current details, and an interaction hint for screen reader users.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';

export default class ExperimentScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: ExperimentModel ) {

    // Track the active scene's source type (a plain value, not a Property, so derive with a function)
    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );

    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );

    const isPlayingStringProperty = model.isPlayingProperty.derived( isPlaying => isPlaying ? 'true' : 'false' );

    const isMaxHitsReachedStringProperty = model.currentIsMaxHitsReachedProperty.derived(
      isMaxHitsReached => isMaxHitsReached ? 'true' : 'false'
    );

    const currentTotalHitsProperty = new DynamicProperty<number, number, SceneModel>( model.sceneProperty, {
      derive: 'totalHitsProperty'
    } );

    // TODO: There sure is a lot of mapping to "true" and "false", is that good or is there a better way? See https://github.com/phetsims/quantum-wave-interference/issues/100
    const hasHitsStringProperty = currentTotalHitsProperty.derived( totalHits => totalHits > 0 ? 'true' : 'false' );

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
