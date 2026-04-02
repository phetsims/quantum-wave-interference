// Copyright 2026, University of Colorado Boulder

/**
 * DetectorScreenDescriber produces a dynamic accessible description of the detector screen
 * that scales with the number of accumulated hits and describes the theoretical intensity
 * pattern. Descriptions are poetic and gestalt — they convey the overall shape and evolution
 * of the pattern rather than enumerating exact data. In hits mode, descriptions only change
 * when the qualitative stage crosses a threshold (few → emerging → developing → clear),
 * preventing numbers from jumping sporadically as hits accumulate frame by frame.
 *
 * Spatial language (band count, spacing) is derived from the theoretical intensity formula
 * rather than from noisy accumulated bin data, so it remains stable across all hit counts.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import SceneModel from '../../model/SceneModel.js';
import { isDoubleSlitConfiguration } from '../../model/SlitConfiguration.js';
import BandAnalysis from './BandAnalysis.js';

export default class DetectorScreenDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor( model: ExperimentModel ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing
    // a pedagogically meaningful threshold, not on every frame of hit accumulation.
    let hitStage = '';

    const update = () => {
      const scene = model.sceneProperty.value;
      const detectionMode = scene.detectionModeProperty.value;
      const isRulerVisible = model.isRulerVisibleProperty.value;
      const slitSetting = scene.slitSettingProperty.value;
      const isDoubleSlit = isDoubleSlitConfiguration( slitSetting );

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( scene );
        const spatialDescription = BandAnalysis.formatSpatialDescription(
          analysis, isDoubleSlit, isRulerVisible, false
        );

        descriptionProperty.value = isDoubleSlit
                                    ? QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensity.format( { spatialDescription: spatialDescription } )
                                    : QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.intensitySingleSlit.format( { spatialDescription: spatialDescription } );
        return;
      }

      // Hits mode: only recompute description when the qualitative stage changes.
      const totalHits = scene.totalHitsProperty.value;
      const newStage = BandAnalysis.getHitStage( totalHits, isDoubleSlit );
      if ( newStage === hitStage ) {
        return;
      }
      hitStage = newStage;

      // Use the theoretical pattern for spatial descriptions so they remain stable
      // as hits accumulate, rather than jumping with noisy bin data.
      const analysis = BandAnalysis.analyzeTheoreticalPattern( scene );
      const spatialDescription = BandAnalysis.formatSpatialDescription(
        analysis, isDoubleSlit, isRulerVisible, false
      );

      if ( isDoubleSlit ) {
        if ( newStage === 'none' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value;
        }
        else if ( newStage === 'few' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value;
        }
        else if ( newStage === 'emerging' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsEmergingStringProperty.value;
        }
        else if ( newStage === 'developing' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsDeveloping.format( { spatialDescription: spatialDescription } );
        }
        else {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsClear.format( { spatialDescription: spatialDescription } );
        }
      }
      else {
        if ( newStage === 'none' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsNoneStringProperty.value;
        }
        else if ( newStage === 'few' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsFewStringProperty.value;
        }
        else if ( newStage === 'emerging' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value;
        }
        else {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorScreen.accessibleParagraph.hitsSingleSlitClear.format( { spatialDescription: spatialDescription } );
        }
      }
    };

    // Force a full update when any physics parameter or display setting changes.
    // This resets the hit stage so the description is recomputed from scratch.
    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    // Listen to scene changes and rewire listeners for the active scene.
    let previousScene: SceneModel | null = null;
    model.sceneProperty.link( scene => {
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
    model.isRulerVisibleProperty.lazyLink( fullUpdate );
  }
}
