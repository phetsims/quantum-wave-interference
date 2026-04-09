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
import SceneModel from '../../model/SceneModel.js';
import { isDoubleSlitConfiguration } from '../../model/SlitConfiguration.js';
import BandAnalysis from './BandAnalysis.js';

export default class GraphDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor( sceneModel: SceneModel, isRulerVisibleProperty: TReadOnlyProperty<boolean> ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing
    // a pedagogically meaningful threshold, not on every frame of hit accumulation.
    let hitStage = '';

    const update = () => {
      const detectionMode = sceneModel.detectionModeProperty.value;
      const isRulerVisible = isRulerVisibleProperty.value;
      const slitSetting = sceneModel.slitSettingProperty.value;
      const isDoubleSlit = isDoubleSlitConfiguration( slitSetting );

      if ( detectionMode === 'averageIntensity' ) {
        if ( !sceneModel.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( sceneModel );
        const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, true );

        descriptionProperty.value = isDoubleSlit
                                    ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity.format( { spatialDescription: spatialDescription } )
                                    : QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlit.format( { spatialDescription: spatialDescription } );
        return;
      }

      // Hits mode: only recompute description when the qualitative stage changes.
      const totalHits = sceneModel.totalHitsProperty.value;
      const newStage = BandAnalysis.getHitStage( totalHits, isDoubleSlit );
      if ( newStage === hitStage ) {
        return;
      }
      hitStage = newStage;

      // Use the theoretical pattern for spatial descriptions so they remain stable
      // as hits accumulate, rather than jumping with noisy bin data.
      const analysis = BandAnalysis.analyzeTheoreticalPattern( sceneModel );
      const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, true );

      if ( isDoubleSlit ) {
        descriptionProperty.value = newStage === 'none' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty.value :
                                    newStage === 'few' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty.value :
                                    newStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsEmergingStringProperty.value :
                                    newStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsDeveloping.format( { spatialDescription: spatialDescription } ) :
                                    newStage === 'clear' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsClear.format( { spatialDescription: spatialDescription } ) :
                                    ( () => { throw new Error( `Unrecognized newStage: ${newStage}` ); } )();
      }
      else {
        descriptionProperty.value = newStage === 'none' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsNoneStringProperty.value :
                                    newStage === 'few' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsFewStringProperty.value :
                                    newStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value :
                                    ( newStage === 'developing' || newStage === 'clear' ) ? QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.hitsSingleSlitClear.format( { spatialDescription: spatialDescription } ) :
                                    ( () => { throw new Error( `Unrecognized newStage: ${newStage}` ); } )();
      }
    };

    // Force a full update when any physics parameter or display setting changes.
    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    sceneModel.hitsChangedEmitter.addListener( update );
    sceneModel.detectionModeProperty.lazyLink( fullUpdate );
    sceneModel.isEmittingProperty.lazyLink( fullUpdate );
    sceneModel.slitSettingProperty.lazyLink( fullUpdate );
    sceneModel.slitSeparationProperty.lazyLink( fullUpdate );
    sceneModel.screenDistanceProperty.lazyLink( fullUpdate );
    sceneModel.wavelengthProperty.lazyLink( fullUpdate );
    sceneModel.velocityProperty.lazyLink( fullUpdate );
    isRulerVisibleProperty.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change, or PhET-iO string
    // edits that swap the bundle without changing localeProperty). We subscribe via any
    // Fluent pattern's getDependentProperties() — they all share the same bundleProperty
    // signal — so we don't have to enumerate every string this describer reads, and new
    // strings added later are automatically covered.
    QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );

    fullUpdate();
  }
}
