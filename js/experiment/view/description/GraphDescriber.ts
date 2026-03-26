// Copyright 2026, University of Colorado Boulder

/**
 * GraphDescriber produces a dynamic accessible description of the intensity graph / hits
 * histogram that scales with hit count and describes the theoretical intensity curve.
 * Uses the same band analysis as DetectorScreenDescriber but with graph-oriented language
 * ("peaks" and "valleys" instead of "bright bands" and "dark bands").
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import SceneModel from '../../model/SceneModel.js';
import BandAnalysis from './BandAnalysis.js';

export default class GraphDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor( model: ExperimentModel ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    const update = () => {
      const scene = model.sceneProperty.value;
      const detectionMode = scene.detectionModeProperty.value;
      const paragraphs = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph;
      const isRulerVisible = model.isRulerVisibleProperty.value;
      const slitSetting = scene.slitSettingProperty.value;
      const isDoubleSlit = slitSetting === 'bothOpen';

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = paragraphs.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( scene );
        const spatialDescription = BandAnalysis.formatSpatialDescription(
          analysis, isDoubleSlit, isRulerVisible, true
        );

        if ( isDoubleSlit ) {
          descriptionProperty.value = paragraphs.intensity.format( { spatialDescription: spatialDescription } );
        }
        else {
          descriptionProperty.value = paragraphs.intensitySingleSlit.format( { spatialDescription: spatialDescription } );
        }
        return;
      }

      // Hits mode.
      const totalHits = scene.totalHitsProperty.value;

      if ( totalHits === 0 ) {
        descriptionProperty.value = paragraphs.hitsNoneStringProperty.value;
        return;
      }

      const analysis = BandAnalysis.analyzeHitBins( scene );
      const spatialDescription = BandAnalysis.formatSpatialDescription(
        analysis, isDoubleSlit, isRulerVisible, true
      );

      if ( isDoubleSlit ) {
        if ( totalHits <= 10 ) {
          descriptionProperty.value = paragraphs.hitsFew.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 50 ) {
          descriptionProperty.value = paragraphs.hitsEmerging.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 200 ) {
          descriptionProperty.value = paragraphs.hitsDeveloping.format( {
            totalHits: totalHits, spatialDescription: spatialDescription
          } );
        }
        else {
          descriptionProperty.value = paragraphs.hitsClear.format( {
            totalHits: totalHits, spatialDescription: spatialDescription
          } );
        }
      }
      else {
        if ( totalHits <= 10 ) {
          descriptionProperty.value = paragraphs.hitsFew.format( { totalHits: totalHits } );
        }
        else if ( totalHits <= 50 ) {
          descriptionProperty.value = paragraphs.hitsSingleSlitEmerging.format( { totalHits: totalHits } );
        }
        else {
          descriptionProperty.value = paragraphs.hitsSingleSlitClear.format( {
            totalHits: totalHits, spatialDescription: spatialDescription
          } );
        }
      }
    };

    // Listen to scene changes and rewire listeners for the active scene.
    let previousScene: SceneModel | null = null;
    model.sceneProperty.link( scene => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty.unlink( update );
        previousScene.isEmittingProperty.unlink( update );
        previousScene.slitSettingProperty.unlink( update );
        previousScene.slitSeparationProperty.unlink( update );
        previousScene.screenDistanceProperty.unlink( update );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty.lazyLink( update );
      scene.isEmittingProperty.lazyLink( update );
      scene.slitSettingProperty.lazyLink( update );
      scene.slitSeparationProperty.lazyLink( update );
      scene.screenDistanceProperty.lazyLink( update );
      previousScene = scene;
      update();
    } );

    model.isRulerVisibleProperty.lazyLink( update );
  }
}
