// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenSummaryContent provides the screen summary for the Experiment screen, describing
 * the play area, control area, current details, and an interaction hint for screen reader users.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';
import { type SlitConfiguration } from '../model/SlitConfiguration.js';
import { type SourceType } from '../model/SourceType.js';

export default class ExperimentScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: ExperimentModel ) {

    // Track the active scene's source type (a plain value, not a Property, so derive with a function)
    const sourceTypeProperty = new DerivedProperty(
      [ model.sceneProperty ],
      ( scene: SceneModel ): SourceType => scene.sourceType
    );

    // Track the active scene's slit setting
    const slitSettingProperty = new DynamicProperty<SlitConfiguration, SlitConfiguration, SceneModel>(
      model.sceneProperty, {
        derive: 'slitSettingProperty'
      }
    );

    // Track the active scene's detection mode
    const detectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, SceneModel>(
      model.sceneProperty, {
        derive: 'detectionModeProperty'
      }
    );

    const isMaxHitsReachedProperty = new DynamicProperty<boolean, boolean, SceneModel>(
      model.sceneProperty, {
        derive: 'isMaxHitsReachedProperty'
      }
    );

    // Track the active scene's emitting state, then map to a string for Fluent select
    const isEmittingProperty = new DynamicProperty<boolean, boolean, SceneModel>( model.sceneProperty, {
      derive: 'isEmittingProperty'
    } );
    const isEmittingStringProperty = isEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );

    const defaultCurrentDetailsContentProperty = QuantumWaveInterferenceFluent.a11y.screenSummary.currentDetails.createProperty( {
      sourceType: sourceTypeProperty,
      slitSetting: slitSettingProperty,
      detectionMode: detectionModeProperty,
      isEmitting: isEmittingStringProperty
    } );

    const currentDetailsContentProperty = new DerivedProperty( [
        defaultCurrentDetailsContentProperty,
        isMaxHitsReachedProperty,
        QuantumWaveInterferenceFluent.a11y.screenSummary.maxHitsReachedDetailsStringProperty
      ],
      ( currentDetails, isMaxHitsReached, maxHitsReachedDetails ) =>
        isMaxHitsReached ? `${currentDetails} ${maxHitsReachedDetails}` : currentDetails
    );

    const defaultInteractionHintContentProperty = QuantumWaveInterferenceFluent.a11y.screenSummary.interactionHint.createProperty( {
      sourceType: sourceTypeProperty,
      isEmitting: isEmittingStringProperty
    } );

    const interactionHintContentProperty = new DerivedProperty(
      [
        defaultInteractionHintContentProperty,
        isMaxHitsReachedProperty,
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
