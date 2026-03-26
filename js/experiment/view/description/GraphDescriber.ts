// Copyright 2026, University of Colorado Boulder

/**
 * GraphDescriber produces a dynamic accessible description of the intensity graph / hits
 * histogram that scales with hit count and describes the theoretical intensity curve.
 * Uses the same band analysis as DetectorScreenDescriber but with graph-oriented language
 * ("peaks" and "valleys" instead of "bright bands" and "dark bands").
 *
 * Like DetectorScreenDescriber, descriptions are poetic and gestalt. In hits mode, the
 * description only changes at qualitative stage thresholds, and spatial information is
 * derived from the theoretical intensity formula for stability.
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

    // TODO: Initialize at declaration, see https://github.com/phetsims/quantum-wave-interference/issues/9
    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing
    // a pedagogically meaningful threshold, not on every frame of hit accumulation.
    let hitStage = '';

    // TODO: This callback accesses many StringProperties that are not dependencies; locale changes won't trigger updates, see https://github.com/phetsims/quantum-wave-interference/issues/9
    const update = () => {
      const scene = model.sceneProperty.value;
      const detectionMode = scene.detectionModeProperty.value;
      const isRulerVisible = model.isRulerVisibleProperty.value;
      const slitSetting = scene.slitSettingProperty.value;
      const isDoubleSlit = slitSetting === 'bothOpen';

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( scene );
        const spatialDescription = BandAnalysis.formatSpatialDescription(
          analysis, isDoubleSlit, isRulerVisible, true
        );

        descriptionProperty.value = isDoubleSlit
                                    ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity.format( { spatialDescription: spatialDescription } )
                                    : QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlit.format( { spatialDescription: spatialDescription } );
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
        analysis, isDoubleSlit, isRulerVisible, true
      );

      if ( isDoubleSlit ) {
        if ( newStage === 'none' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty.value;
        }
        else if ( newStage === 'few' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty.value;
        }
        else if ( newStage === 'emerging' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsEmergingStringProperty.value;
        }
        else if ( newStage === 'developing' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsDeveloping.format( { spatialDescription: spatialDescription } );
        }
        else {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsClear.format( { spatialDescription: spatialDescription } );
        }
      }
      else {
        if ( newStage === 'none' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty.value;
        }
        else if ( newStage === 'few' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty.value;
        }
        else if ( newStage === 'emerging' ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value;
        }
        else {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitClear.format( { spatialDescription: spatialDescription } );
        }
      }
    };

    // Force a full update when any physics parameter or display setting changes.
    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    // Listen to scene changes and rewire listeners for the active scene.
    let previousScene: SceneModel | null = null;

    // TODO: There are also strings in the callback which could change, and must trigger an update, see https://github.com/phetsims/quantum-wave-interference/issues/9
    model.sceneProperty.link( scene => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty.unlink( fullUpdate );
        previousScene.isEmittingProperty.unlink( fullUpdate );
        previousScene.slitSettingProperty.unlink( fullUpdate );
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.screenDistanceProperty.unlink( fullUpdate );
      }
      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitSettingProperty.lazyLink( fullUpdate );
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.screenDistanceProperty.lazyLink( fullUpdate );
      // TODO: wavelengthProperty and velocityProperty also affect the theoretical pattern but are not listened to here, see https://github.com/phetsims/quantum-wave-interference/issues/9
      previousScene = scene;
      fullUpdate();
    } );

    model.isRulerVisibleProperty.lazyLink( fullUpdate );
  }
}
