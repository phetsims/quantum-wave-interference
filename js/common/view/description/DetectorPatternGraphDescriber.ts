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
import { hasAnyDetector, showsDoubleSlitInterferencePattern, type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
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
  barrierPositionFractionProperty: TReadOnlyProperty<number>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

function getDetectionMode( scene: DetectorPatternGraphDescriberScene ): DetectionMode {
  return scene.detectionModeProperty ? scene.detectionModeProperty.value : 'hits';
}

export default class DetectorPatternGraphDescriber {

  /**
   * Reactive string description of the current detector-pattern graph state. Updates whenever the qualitative hit
   * stage crosses a pedagogical threshold (none → few → emerging → developing → steadyStatePattern), whenever the
   * scene switches, or whenever any physics parameter that changes the spatial description changes (wavelength, slit
   * separation, etc.). Callers should bind this to an accessibleParagraph on a PDOM Node so screen readers receive the
   * updated text.
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
      const isNoBarrier = slitSetting === 'noBarrier';

      if ( detectionMode === 'intensity' ) {
        if ( !scene.isEmittingProperty.value ) {
          descriptionProperty.value = QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.intensityOffStringProperty.value;
          return;
        }

        const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );
        const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, true );
        const envelope = ( isDoubleSlit || hasAnyDetector( slitSetting ) ) ?
                         analysis.envelopeCategory :
                         'brightestAtCenter';

        descriptionProperty.value = isDoubleSlit ?
                                    QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.intensity.format( {
                                      envelope: envelope,
                                      spatialDescription: spatialDescription
                                    } ) :
                                    isNoBarrier ?
                                    QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.intensityNoBarrierStringProperty.value :
                                    QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.intensitySingleSlit.format( {
                                      envelope: envelope
                                    } );
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
      const analysis = BandAnalysis.analyzeTheoreticalPattern( scene, scene.regionWidth / 2 );
      const spatialDescription = BandAnalysis.formatSpatialDescription( analysis, isDoubleSlit, isRulerVisible, true );
      const envelope = ( isDoubleSlit || hasAnyDetector( slitSetting ) ) ?
                       analysis.envelopeCategory :
                       'brightestAtCenter';

      if ( isDoubleSlit ) {
        descriptionProperty.value = newStage === 'none' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoneStringProperty.value :
                                    newStage === 'few' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsFewStringProperty.value :
                                    newStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsEmerging.format( { envelope: envelope } ) :
                                    newStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsDeveloping.format( {
                                      envelope: envelope,
                                      spatialDescription: spatialDescription
                                    } ) :
                                    newStage === 'steadyStatePattern' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsSteadyStatePattern.format( {
                                      envelope: envelope,
                                      spatialDescription: spatialDescription
                                    } ) :
                                    ( () => { throw new Error( `Unrecognized newStage: ${newStage}` ); } )();
      }
      else if ( isNoBarrier ) {
        descriptionProperty.value = newStage === 'none' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoneStringProperty.value :
                                    newStage === 'few' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsFewStringProperty.value :
                                    newStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoBarrierEmergingStringProperty.value :
                                    newStage === 'developing' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoBarrierDevelopingStringProperty.value :
                                    newStage === 'steadyStatePattern' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoBarrierSteadyStatePatternStringProperty.value :
                                    ( () => { throw new Error( `Unrecognized newStage: ${newStage}` ); } )();
      }
      else {
        descriptionProperty.value = newStage === 'none' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsNoneStringProperty.value :
                                    newStage === 'few' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsFewStringProperty.value :
                                    newStage === 'emerging' ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitEmergingStringProperty.value :
                                    ( newStage === 'developing' || newStage === 'steadyStatePattern' ) ? QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.hitsSingleSlitClear.format( {
                                      envelope: envelope
                                    } ) :
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
        previousScene.barrierPositionFractionProperty.unlink( fullUpdate );
        previousScene.slitSeparationProperty.unlink( fullUpdate );
        previousScene.wavelengthProperty.unlink( fullUpdate );
        previousScene.particleSpeedProperty.unlink( fullUpdate );
      }

      scene.hitsChangedEmitter.addListener( update );
      scene.detectionModeProperty?.lazyLink( fullUpdate );
      scene.isEmittingProperty.lazyLink( fullUpdate );
      scene.slitConfigurationProperty.lazyLink( fullUpdate );
      scene.barrierPositionFractionProperty.lazyLink( fullUpdate );
      scene.slitSeparationProperty.lazyLink( fullUpdate );
      scene.wavelengthProperty.lazyLink( fullUpdate );
      scene.particleSpeedProperty.lazyLink( fullUpdate );
      fullUpdate();
    } );

    isRulerVisibleProperty.lazyLink( fullUpdate );

    // Re-render whenever the Fluent bundle changes (e.g. locale change,
    // or PhET-iO string edits that swap the bundle without changing localeProperty).
    QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.accessibleParagraph.intensity
      .getDependentProperties().forEach( dep => dep.lazyLink( fullUpdate ) );
  }
}
