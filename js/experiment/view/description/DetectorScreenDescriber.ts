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
import { showsDoubleSlitInterferencePattern } from '../../../common/model/SlitConfiguration.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';
import SceneModel from '../../model/SceneModel.js';
import BandAnalysis from './BandAnalysis.js';
import { formatIntensityDescription, formatLiveHitsDescription } from './DetectorScreenDescriptionFormatter.js';

export default class DetectorScreenDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor(
    sceneProperty: TReadOnlyProperty<SceneModel>,
    isRulerVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenScaleIndexProperty: TReadOnlyProperty<number>
  ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing a pedagogically meaningful
    // threshold, not on every frame of hit accumulation.
    let hitStage = '';

    const update = () => {
      const scene = sceneProperty.value;
      const detectionMode = scene.detectionModeProperty.value;
      const isRulerVisible = isRulerVisibleProperty.value;
      const slitSetting = scene.slitSettingProperty.value;
      const isDoubleSlit = showsDoubleSlitInterferencePattern( slitSetting );

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern(
          scene,
          getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value )
        );
        const spatialDescription = isDoubleSlit ?
                                   BandAnalysis.formatSpatialArrangementDescription( analysis, isDoubleSlit, isRulerVisible, false ) :
                                   BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, false );

        descriptionProperty.value = formatIntensityDescription( isDoubleSlit, analysis, spatialDescription );
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
        getDetectorScreenHalfWidthForScaleIndex( detectorScreenScaleIndexProperty.value )
      );
      const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, false );

      descriptionProperty.value = formatLiveHitsDescription( newStage, isDoubleSlit, spatialDescription );
    };

    // Force a full update when any physics parameter or display setting changes.
    // This resets the hit stage so the description is recomputed from scratch.
    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    // Listen to scene changes and rewire listeners for the active scene.
    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty.unlink( fullUpdate );
        previousScene.isEmittingProperty.unlink( fullUpdate );
        previousScene.slitSettingProperty.unlink( fullUpdate );
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.screenDistanceProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.velocityProperty.unlink( fullUpdate );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitSettingProperty.lazyLink( fullUpdate );
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.screenDistanceProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.velocityProperty.lazyLink( fullUpdate );
      previousScene = scene;
      fullUpdate();
    } );

    // Also update when the ruler visibility changes, since it affects spatial language.
    isRulerVisibleProperty.lazyLink( fullUpdate );
    detectorScreenScaleIndexProperty.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change,
    // or PhET-iO string edits that swap the bundle without changing localeProperty).
    // We subscribe via any Fluent pattern's getDependentProperties() — they all share the same bundleProperty signal —
    // so we don't have to enumerate every string this describer reads, and new strings added later are automatically
    // covered.
    QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );
  }
}
