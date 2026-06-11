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

/**
 * Contract for a scene whose detector-pattern graph can be described accessibly. Implemented by the High Intensity
 * and Single Particles scene models. Fields supply the physics state (hits, wavelength, slit geometry, speed) needed
 * to generate qualitative band-pattern descriptions. See DetectorScreenDescriberScene for the parallel contract that
 * drives the detector-screen text; the two stay separate because their wording and spatial inputs diverge.
 */
// NOTE: see other duplicate in DetectorScreenDescriber.ts. Graph and detector-screen describers read the same
// physics state, but their scene types stay separate because their wording and screen-distance inputs diverge.
export type DetectorPatternGraphDescriberScene = {
  hitsChangedEmitter: { addListener( listener: () => void ): void; removeListener( listener: () => void ): void };
  totalHitsProperty: TReadOnlyProperty<number>;
  isEmittingProperty: TReadOnlyProperty<boolean>;
  slitSeparationProperty: TReadOnlyProperty<number>;
  wavelengthProperty: TReadOnlyProperty<number>;
  particleSpeedProperty: TReadOnlyProperty<number>;
  getEffectiveWavelength(): number;
  slitWidth: number;
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  regionWidth: number;
  slitPositionFractionProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

function getDetectionMode( scene: DetectorPatternGraphDescriberScene ): DetectionMode {
  return scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
}

export default class DetectorPatternGraphDescriber {

  /**
   * Reactive string description of the current detector-pattern graph state. Updates whenever the qualitative hit
   * stage crosses a pedagogical threshold (none → few → emerging → developing → clear), whenever the scene switches,
   * or whenever any physics parameter that changes the spatial description changes (wavelength, slit separation, etc.).
   * Callers should bind this to an accessibleParagraph on a PDOM Node so screen readers receive the updated text.
   */
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

    // NOTE: see other duplicate in DetectorScreenDescriber.ts and experiment/view/description/GraphDescriber.ts.
    // This update flow remains local so graph wording can evolve separately from detector-screen wording.
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

    // NOTE: see other duplicate in DetectorScreenDescriber.ts. Listener rewiring mirrors the same scene dependencies,
    // but the describers intentionally own separate update functions and string dependencies.
    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( update );
        previousScene.detectionModeProperty?.unlink( fullUpdate );
        previousScene.isEmittingProperty.unlink( fullUpdate );
        previousScene.slitConfigurationProperty.unlink( fullUpdate );
        previousScene.slitPositionFractionProperty.unlink( fullUpdate );
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.particleSpeedProperty.unlink( fullUpdate );
      }

      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty?.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitConfigurationProperty.lazyLink( fullUpdate );
      scene.slitPositionFractionProperty.lazyLink( fullUpdate );
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.particleSpeedProperty.lazyLink( fullUpdate );
      fullUpdate();
    } );

    isRulerVisibleProperty.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change,
    // or PhET-iO string edits that swap the bundle without changing localeProperty).
    QuantumWaveInterferenceFluent.a11y.graphAccordionBox.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );
  }
}
