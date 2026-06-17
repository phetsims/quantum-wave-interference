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

/**
 * Physics-state interface required by DetectorScreenDescriber. The two union branches reflect the two scene
 * archetypes in the sim: the Experiment screen (which carries an explicit screen-distance) and
 * the High-Intensity / Single-Particles screens (which carry a fixed region width and barrier position).
 * NOTE: see parallel type in DetectorPatternGraphDescriber.ts — the types stay separate because their
 * wording and screen-distance inputs diverge even though the physics state is shared.
 */
export type DetectorScreenDescriberScene = {
  hitsChangedEmitter: { addListener( listener: () => void ): void; removeListener( listener: () => void ): void };
  totalHitsProperty: TReadOnlyProperty<number>;
  isEmittingProperty: TReadOnlyProperty<boolean>;
  slitSeparationProperty: TReadOnlyProperty<number>;
  wavelengthProperty: TReadOnlyProperty<number>;
  particleSpeedProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
  getEffectiveWavelength(): number;
  slitWidth: number;
  hasWavefrontReachedScreen?(): boolean;
} & (
  {
    detectionModeProperty: TReadOnlyProperty<DetectionMode>;
    screenDistanceProperty: TReadOnlyProperty<number>;
  } | {
  regionWidth: number;
  barrierPositionFractionProperty: TReadOnlyProperty<number>;
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
}
  );

function getDetectionMode( scene: DetectorScreenDescriberScene ): DetectionMode {
  return scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
}

function getSlitSetting( scene: DetectorScreenDescriberScene ): SlitConfigurationWithNoBarrier {
  return scene.slitConfigurationProperty.value;
}

function getDetectorScreenHalfWidth( scene: DetectorScreenDescriberScene, detectorScreenHalfWidthProperty?: TReadOnlyProperty<number> ): number {
  return detectorScreenHalfWidthProperty ? detectorScreenHalfWidthProperty.value : 'screenDistanceProperty' in scene ? 0.5 : scene.regionWidth / 2;
}

function hasPopulatedIntensityScreen( scene: DetectorScreenDescriberScene ): boolean {
  return scene.hasWavefrontReachedScreen ? scene.hasWavefrontReachedScreen() : scene.isEmittingProperty.value;
}

export default class DetectorScreenDescriber {

  /**
   * The current accessible description of the detector screen. Callers typically assign this to an
   * `accessibleParagraph` on a PDOM Node so screen readers announce it whenever it changes. The value
   * is recomputed eagerly on construction and thereafter on every qualifying state change.
   */
  public readonly descriptionProperty: TReadOnlyProperty<string>;

  /**
   * @param sceneProperty - the currently active scene whose physics state drives the description
   * @param isRulerVisibleProperty - controls whether spatial descriptions include ruler-based distance language
   * @param detectorScreenHalfWidthProperty - half the physical width of the detector screen in model units,
   *   used to convert band positions to fractions. When omitted, the half-width is inferred from the scene:
   *   0.5 for Experiment-screen scenes (screenDistanceProperty branch) or regionWidth/2 for the other branch.
   * @param updateTriggerProperty - an optional extra Property whose changes force a full description refresh,
   *   used when the caller knows of an external display change (e.g. scale index) not captured by scene properties
   * @param useSharedDetectorPatternDescription - whether the double-slit intensity branch should reuse the
   *   shared detector-pattern wording from Screen 2 instead of this describer's own detector-screen paragraph wording
   */
  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorScreenDescriberScene>,
    isRulerVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenHalfWidthProperty?: TReadOnlyProperty<number>,
    updateTriggerProperty?: TReadOnlyProperty<unknown>,
    useSharedDetectorPatternDescription = false
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

      if ( detectionMode === 'intensity' ) {
        if ( !scene.isEmittingProperty.value || !hasPopulatedIntensityScreen( scene ) ) {
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

        descriptionProperty.value = formatIntensityDescription(
          isDoubleSlit,
          slitSetting === 'noBarrier',
          analysis,
          spatialDescription,
          useSharedDetectorPatternDescription
        );
        return;
      }

      // Hits mode: only recompute description when the qualitative stage changes.
      const totalHits = scene.totalHitsProperty.value;
      const newStage = BandAnalysis.getHitStage( totalHits );
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
        previousScene.slitConfigurationProperty.unlink( fullUpdate );
        if ( 'screenDistanceProperty' in previousScene ) {
          previousScene.screenDistanceProperty.unlink( fullUpdate );
        }
        else {
          previousScene.barrierPositionFractionProperty.unlink( fullUpdate );
        }
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.particleSpeedProperty.unlink( fullUpdate );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty?.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitConfigurationProperty.lazyLink( fullUpdate );
      if ( 'screenDistanceProperty' in scene ) {
        scene.screenDistanceProperty.lazyLink( fullUpdate );
      }
      else {
        scene.barrierPositionFractionProperty.lazyLink( fullUpdate );
      }
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.particleSpeedProperty.lazyLink( fullUpdate );
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
