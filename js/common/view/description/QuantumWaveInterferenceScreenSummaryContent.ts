// Copyright 2026, University of Colorado Boulder

/**
 * Shared screen-summary content for Quantum Wave Interference screens that use the source, slits, and detector-screen
 * pattern from the Experiment screen's vetted Core Description.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import ScreenSummaryContent, { type SectionContent } from '../../../../../joist/js/ScreenSummaryContent.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';

type FluentBoolean = 'true' | 'false';
export type SlitOrientation = 'leftRight' | 'topBottom';

const toFluentBoolean = ( value: boolean ): FluentBoolean => value ? 'true' : 'false';

type ScreenSummaryModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: SourceType }>;
  currentIsEmittingProperty: TReadOnlyProperty<boolean>;
  isPlayingProperty: TReadOnlyProperty<boolean>;
  currentIsMaxHitsReachedProperty: TReadOnlyProperty<boolean>;
  currentTotalHitsProperty: TReadOnlyProperty<number>;
};

type ScreenSummaryOptions = {
  detectionMode: DetectionMode | TReadOnlyProperty<DetectionMode>;
  slitOrientation?: SlitOrientation;
  currentDetailsContent?: SectionContent;
};

export default class QuantumWaveInterferenceScreenSummaryContent extends ScreenSummaryContent {

  public constructor(
    model: ScreenSummaryModel,
    slitSettingProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: ScreenSummaryOptions
  ) {

    const slitOrientation = providedOptions.slitOrientation || 'leftRight';

    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );

    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( toFluentBoolean );

    const isPlayingStringProperty = model.isPlayingProperty.derived( toFluentBoolean );

    const isMaxHitsReachedStringProperty = model.currentIsMaxHitsReachedProperty.derived( toFluentBoolean );

    // Fluent select expressions use string keys, so derived booleans are normalized through one helper.
    const hasHitsStringProperty = model.currentTotalHitsProperty.derived( totalHits => toFluentBoolean( totalHits > 0 ) );

    const currentDetailsOptions = {
      sourceType: sourceTypeProperty,
      slitSetting: slitSettingProperty,
      slitOrientation: slitOrientation,
      detectionMode: providedOptions.detectionMode,
      isEmitting: isEmittingStringProperty,
      isPlaying: isPlayingStringProperty,
      isMaxHitsReached: isMaxHitsReachedStringProperty,
      hasHits: hasHitsStringProperty
    };

    const currentDetailsContentProperty =
      QuantumWaveInterferenceFluent.a11y.screenSummary.currentDetails.createProperty( currentDetailsOptions );

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
      currentDetailsContent: providedOptions.currentDetailsContent || currentDetailsContentProperty,
      interactionHintContent: interactionHintContentProperty
    } );
  }
}
