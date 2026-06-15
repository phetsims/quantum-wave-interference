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

// Fluent select expressions require string keys, so boolean model values are converted to this type before use.
type FluentBoolean = 'true' | 'false';

/**
 * The axis along which the two slits are arranged on screen. 'leftRight' means the slits are positioned side by side
 * on a horizontal axis (used in the Experiment screen); 'topBottom' means the slits are stacked on a vertical axis
 * (used in High Intensity and Single Particles screens). This value drives Fluent select expressions that produce
 * screen-reader descriptions of slit positions.
 */
export type SlitOrientation = 'leftRight' | 'topBottom';

function toFluentBoolean( value: boolean ): FluentBoolean {
  return value ? 'true' : 'false';
}

/**
 * The subset of the screen model required to drive the screen summary. Callers pass their full model and TypeScript
 * structural typing ensures all required properties are present.
 */
type ScreenSummaryModel = {
  sceneProperty: TReadOnlyProperty<{ sourceType: SourceType }>;
  currentIsEmittingProperty: TReadOnlyProperty<boolean>;
  isPlayingProperty: TReadOnlyProperty<boolean>;

  // True when the detector screen has accumulated the maximum allowed number of particle hits.
  currentIsMaxHitsReachedProperty: TReadOnlyProperty<boolean>;
  currentTotalHitsProperty: TReadOnlyProperty<number>;
};

/**
 * Per-screen customisation of the shared screen summary. Each screen supplies its detection mode and play-area
 * description; screens that deviate from other defaults can pass additional overrides.
 */
type ScreenSummaryOptions = {
  // Whether the detector screen shows intensity or discrete particle hits.
  detectionMode: DetectionMode | TReadOnlyProperty<DetectionMode>;

  // Screen-specific static description of the play area.
  playAreaContent: SectionContent;

  // Defaults to 'leftRight'. Pass 'topBottom' for screens where slits are arranged on the vertical axis.
  slitOrientation?: SlitOrientation;

  // Override the default derivation that infers whether a pattern is visible on the detector screen.
  detectorScreenHasPatternProperty?: TReadOnlyProperty<boolean>;

  // Override the default Fluent current-details section entirely (e.g. to supply a custom describer node).
  currentDetailsContent?: SectionContent;
};

export default class QuantumWaveInterferenceScreenSummaryContent extends ScreenSummaryContent {

  public constructor(
    model: ScreenSummaryModel,
    slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: ScreenSummaryOptions
  ) {

    const slitOrientation = providedOptions.slitOrientation || 'leftRight';
    const sourceTypeProperty = model.sceneProperty.derived( scene => scene.sourceType );
    const isEmittingStringProperty = model.currentIsEmittingProperty.derived( toFluentBoolean );
    const isPlayingStringProperty = model.isPlayingProperty.derived( toFluentBoolean );
    const isMaxHitsReachedStringProperty = model.currentIsMaxHitsReachedProperty.derived( toFluentBoolean );

    const detectorScreenHasPatternProperty = providedOptions.detectorScreenHasPatternProperty ||
                                             new DerivedProperty(
                                               [ model.currentTotalHitsProperty, model.currentIsEmittingProperty ],
                                               ( totalHits, isEmitting ) => totalHits > 0 || isEmitting
                                             );

    // Fluent select expressions use string keys, so derived booleans are normalized through one helper.
    const hasHitsStringProperty = detectorScreenHasPatternProperty.derived( toFluentBoolean );

    const currentDetailsOptions = {
      sourceType: sourceTypeProperty,
      slitSetting: slitConfigurationProperty,
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
      playAreaContent: providedOptions.playAreaContent,
      controlAreaContent: QuantumWaveInterferenceFluent.a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: providedOptions.currentDetailsContent || currentDetailsContentProperty,
      interactionHintContent: interactionHintContentProperty
    } );
  }
}
