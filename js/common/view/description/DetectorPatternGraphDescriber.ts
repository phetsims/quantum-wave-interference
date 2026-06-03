// Copyright 2026, University of Colorado Boulder

/**
 * DetectorPatternGraphDescriber produces a dynamic accessible description for the detector-pattern graph shown beside
 * the detector screen on the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../../axon/js/Property.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import BandAnalysis from './BandAnalysis.js';

export type DetectorPatternGraphDescriberScene = {
  hitsChangedEmitter: { addListener( listener: () => void ): void; removeListener( listener: () => void ): void };
  totalHitsProperty: TReadOnlyProperty<number>;
  isEmittingProperty: TReadOnlyProperty<boolean>;
  slitSeparationProperty: TReadOnlyProperty<number>;
  wavelengthProperty: TReadOnlyProperty<number>;
  velocityProperty: TReadOnlyProperty<number>;
  getEffectiveWavelength(): number;
  slitWidth: number;
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  regionWidth: number;
  slitPositionFractionProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

const getDetectionMode = ( scene: DetectorPatternGraphDescriberScene ): DetectionMode =>
  scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';

export default class DetectorPatternGraphDescriber {

  public readonly descriptionProperty: TReadOnlyProperty<string>;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorPatternGraphDescriberScene>,
    isRulerVisibleProperty: TReadOnlyProperty<boolean>
  ) {

    const descriptionProperty = new Property<string>( '' );
    this.descriptionProperty = descriptionProperty;

    // Track the current hit stage so that the description only updates when crossing a pedagogically meaningful
    // threshold, not on every frame of hit accumulation.
    let hitStage = '';

    const update = () => {
      const scene = sceneProperty.value;
      const detectionMode = getDetectionMode( scene );
      const isRulerVisible = isRulerVisibleProperty.value;
      const slitSetting = scene.slitConfigurationProperty.value;
      const isDoubleSlit = showsDoubleSlitInterferencePattern( slitSetting );

      if ( detectionMode === 'averageIntensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );
        const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, true );

        descriptionProperty.value = isDoubleSlit ?
                                    QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity.format( { spatialDescription: spatialDescription } ) :
                                    QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensitySingleSlitStringProperty.value;
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
      const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );
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

    const fullUpdate = () => {
      hitStage = '';
      update();
    };

    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty?.unlink( fullUpdate );
        previousScene.isEmittingProperty.unlink( fullUpdate );
        previousScene.slitConfigurationProperty.unlink( fullUpdate );
        previousScene.slitPositionFractionProperty.unlink( fullUpdate );
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.velocityProperty.unlink( fullUpdate );
      }

      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty?.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitConfigurationProperty.lazyLink( fullUpdate );
      scene.slitPositionFractionProperty.lazyLink( fullUpdate );
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.velocityProperty.lazyLink( fullUpdate );
      fullUpdate();
    } );

    isRulerVisibleProperty.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change,
    // or PhET-iO string edits that swap the bundle without changing localeProperty).
    QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );
  }
}
