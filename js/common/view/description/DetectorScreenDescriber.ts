// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenDescriber produces a dynamic accessible description of the detector screen that scales with the number
 * of accumulated hits and describes the theoretical intensity pattern.
 * Descriptions are poetic and gestalt — they convey the overall shape and evolution of the pattern rather than
 * enumerating exact data. In hits mode, descriptions only change when the qualitative stage crosses a threshold (few →
 * emerging → developing → clear), preventing numbers from jumping sporadically as hits accumulate frame by frame.
 *
 * Spatial language (band count, spacing) is derived from the theoretical intensity formula rather than from noisy
 * accumulated bin data, so it remains stable across all hit counts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import BandAnalysis from './BandAnalysis.js';
import { formatIntensityDescription, formatLiveHitsDescription } from './DetectorScreenDescriptionFormatter.js';

// NOTE: see other duplicate in DetectorPatternGraphDescriber.ts. Graph and detector-screen describers read the same
// physics state, but their scene types stay separate because their wording and screen-distance inputs diverge.
export type DetectorScreenDescriberScene = {
  hitsChangedEmitter: { addListener( listener: () => void ): void; removeListener( listener: () => void ): void };
  totalHitsProperty: TReadOnlyProperty<number>;
  isEmittingProperty: TReadOnlyProperty<boolean>;
  slitSeparationProperty: TReadOnlyProperty<number>;
  wavelengthProperty: TReadOnlyProperty<number>;
  velocityProperty: TReadOnlyProperty<number>;
  getEffectiveWavelength(): number;
  slitWidth: number;
  hasWavefrontReachedScreen?(): boolean;
} & (
  {
    detectionModeProperty: TReadOnlyProperty<DetectionMode>;
    screenDistanceProperty: TReadOnlyProperty<number>;
    slitSettingProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
  } | {
  regionWidth: number;
  slitPositionFractionProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
}
  );

const getDetectionMode = ( scene: DetectorScreenDescriberScene ): DetectionMode =>
  scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';

const getSlitSetting = ( scene: DetectorScreenDescriberScene ): SlitConfigurationWithNoBarrier =>
  'slitSettingProperty' in scene ? scene.slitSettingProperty.value : scene.slitConfigurationProperty.value;

const getDetectorScreenHalfWidth = ( scene: DetectorScreenDescriberScene, detectorScreenHalfWidthProperty?: TReadOnlyProperty<number> ): number =>
  detectorScreenHalfWidthProperty ? detectorScreenHalfWidthProperty.value : 'screenDistanceProperty' in scene ? 0.5 : scene.regionWidth / 2;

const hasPopulatedAverageIntensityScreen = ( scene: DetectorScreenDescriberScene ): boolean =>
  scene.hasWavefrontReachedScreen ? scene.hasWavefrontReachedScreen() : scene.isEmittingProperty.value;

export default class DetectorScreenDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorScreenDescriberScene>,
    isRulerVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenHalfWidthProperty?: TReadOnlyProperty<number>,
    updateTriggerProperty?: TReadOnlyProperty<unknown>
  ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing a pedagogically meaningful
    // threshold, not on every frame of hit accumulation.
    let hitStage = '';

    // NOTE: see other duplicate in DetectorPatternGraphDescriber.ts. The detector-screen description has separate
    // no-barrier, screen-distance, and wavefront-reached handling, so a shared updater would obscure behavior.
    const update = () => {
      const scene = sceneProperty.value;
      const detectionMode = getDetectionMode( scene );
      const isRulerVisible = isRulerVisibleProperty.value;
      const slitSetting = getSlitSetting( scene );
      const isDoubleSlit = showsDoubleSlitInterferencePattern( slitSetting );

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value || !hasPopulatedAverageIntensityScreen( scene ) ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern(
          scene,
          getDetectorScreenHalfWidth( scene, detectorScreenHalfWidthProperty )
        );
        const spatialDescription = isDoubleSlit ?
                                   BandAnalysis.formatSpatialArrangementDescription( analysis, isDoubleSlit, isRulerVisible, false ) :
                                   BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, false );

        descriptionProperty.value = formatIntensityDescription( isDoubleSlit, slitSetting === 'noBarrier', analysis, spatialDescription );
        return;
      }

      // Hits mode: only recompute description when the qualitative stage changes.
      const totalHits = scene.totalHitsProperty.value;
      const newStage = BandAnalysis.getHitStage( totalHits, isDoubleSlit );
      if ( newStage === hitStage ) {
        return;
      }
      hitStage = newStage;

      // Use the theoretical pattern for spatial descriptions so they remain stable as hits accumulate,
      // rather than jumping with noisy bin data.
      const analysis = BandAnalysis.analyzeTheoreticalPattern(
        scene,
        getDetectorScreenHalfWidth( scene, detectorScreenHalfWidthProperty )
      );
      const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, false );

      descriptionProperty.value = formatLiveHitsDescription( newStage, isDoubleSlit, slitSetting === 'noBarrier', analysis, spatialDescription );
    };

    // Force a full update when any physics parameter or display setting changes.
    // This resets the hit stage so the description is recomputed from scratch.
    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    // Listen to scene changes and rewire listeners for the active scene.
    // NOTE: see other duplicate in DetectorPatternGraphDescriber.ts. Listener rewiring mirrors the same scene
    // dependencies, but the describers intentionally own separate update functions and string dependencies.
    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty?.unlink( fullUpdate );
        previousScene.isEmittingProperty.unlink( fullUpdate );
        if ( 'slitSettingProperty' in previousScene ) {
          previousScene.slitSettingProperty.unlink( fullUpdate );
          previousScene.screenDistanceProperty.unlink( fullUpdate );
        }
        else {
          previousScene.slitConfigurationProperty.unlink( fullUpdate );
          previousScene.slitPositionFractionProperty.unlink( fullUpdate );
        }
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.velocityProperty.unlink( fullUpdate );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty?.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      if ( 'slitSettingProperty' in scene ) {
        scene.slitSettingProperty.lazyLink( fullUpdate );
        scene.screenDistanceProperty.lazyLink( fullUpdate );
      }
      else {
        scene.slitConfigurationProperty.lazyLink( fullUpdate );
        scene.slitPositionFractionProperty.lazyLink( fullUpdate );
      }
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.velocityProperty.lazyLink( fullUpdate );
      fullUpdate();
    } );

    // Also update when the ruler visibility changes, since it affects spatial language.
    isRulerVisibleProperty.lazyLink( fullUpdate );
    detectorScreenHalfWidthProperty?.lazyLink( fullUpdate );
    updateTriggerProperty?.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change,
    // or PhET-iO string edits that swap the bundle without changing localeProperty).
    // We subscribe via any Fluent pattern's getDependentProperties() — they all share the same bundleProperty signal —
    // so we don't have to enumerate every string this describer reads, and new strings added later are automatically
    // covered.
    QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );
  }
}
