// Copyright 2026, University of Colorado Boulder

/**
 * Shared PDOM-only descriptions and heading groups for the Single Particles and High Intensity screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';
import { type DetectorPatternGraphDescriberScene } from './DetectorPatternGraphDescriber.js';
import { type DetectorScreenDescriberScene } from './DetectorScreenDescriber.js';
import ExperimentSetupDetailsNode from './ExperimentSetupDetailsNode.js';
import { type SlitOrientation } from './QuantumWaveInterferenceScreenSummaryContent.js';

/**
 * Scene requirements for the shared description node — extends the detector describers' scene contracts
 * with the source-type identity and the speed/separation ranges needed by ExperimentSetupDetailsNode.
 */
type SharedDescriptionScene = DetectorScreenDescriberScene & DetectorPatternGraphDescriberScene & {
  sourceType: SourceType;
  particleSpeedRange: { min: number; max: number };
  slitSeparationRange: { min: number; max: number };
};

/**
 * Minimal model surface consumed by this description node. Both the High Intensity and Single Particles
 * screen models satisfy this shape, allowing the shared node to be constructed from either.
 */
type SharedDescriptionModel = {
  sceneProperty: TReadOnlyProperty<SharedDescriptionScene>;
  currentWavelengthProperty: TReadOnlyProperty<number>;
  currentParticleSpeedProperty: TReadOnlyProperty<number>;
  currentSlitSeparationProperty: TReadOnlyProperty<number>;
  currentBarrierPositionFractionProperty: TReadOnlyProperty<number>;
  currentScreenBrightnessProperty: TReadOnlyProperty<number>;
};

/**
 * Options for QuantumWaveInterferenceScreenViewDescription.
 */
type SharedDescriptionOptions = {

  // When provided, the section heading switches from "Detector Screen and Experiment Details" to "Graph and
  // Experiment Details" while the graph is visible.
  screenGraphVisibleProperty?: TReadOnlyProperty<boolean>;

  // Axis along which the slits are arranged; defaults to the describer's own default.
  slitOrientation?: SlitOrientation;

  // Set to false to suppress the graph and ExperimentSetupDetailsNode children (used when that content lives
  // elsewhere in the PDOM).
  includeExperimentSetupDetails?: boolean;

  // Scenery nodes placed first under the "Detector Screen and Experiment Details" PDOM heading, before the
  // "Current experimental details" list. Each screen supplies its own list describing the detector-screen pattern
  // and wave progress, mirroring the Experiment screen's structure. Callers must add these nodes to the scene graph
  // themselves.
  detectorScreenDetailsNodes?: Node[];

  // Scenery nodes placed under the "Source" PDOM heading in pdomOrder.
  sourceNodes: Node[];

  // Scenery nodes placed under the "Slits" PDOM heading in pdomOrder.
  slitNodes: Node[];

  // Scenery nodes placed under the "Detector Screen" PDOM heading in pdomOrder.
  detectorScreenControlNodes: Node[];
};

export default class QuantumWaveInterferenceScreenViewDescription extends Node {

  // PDOM heading node for the detector-screen / experiment-details section. Its heading text follows the active view
  // ("Detector Screen and Experiment Details" vs "Graph and Experiment Details"), and its pdomOrder holds the
  // per-screen detectorScreenDetailsNodes followed by the "Current experimental details" list. Exposed so the owning
  // screen view can sequence this section among the other headings in its play-area pdomOrder.
  public readonly detectorScreenAndExperimentDetailsHeadingNode: Node;

  // PDOM heading node for the "Source" section; its pdomOrder holds the caller-supplied sourceNodes. Exposed for the
  // owning screen view's pdomOrder.
  public readonly sourceHeadingNode: Node;

  // PDOM heading node for the "Slits" section; its pdomOrder holds the caller-supplied slitNodes. Exposed for the
  // owning screen view's pdomOrder.
  public readonly slitsHeadingNode: Node;

  // PDOM heading node for the "Detector Screen" section; its pdomOrder holds the caller-supplied
  // detectorScreenControlNodes. Exposed for the owning screen view's pdomOrder.
  public readonly detectorScreenHeadingNode: Node;

  public constructor(
    model: SharedDescriptionModel,
    slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: SharedDescriptionOptions
  ) {

    super();

    const includeExperimentSetupDetails = providedOptions.includeExperimentSetupDetails !== false;

    let experimentSetupDetailsNode: Node | null = null;
    if ( includeExperimentSetupDetails ) {
      const screenDistanceProperty = new DerivedProperty(
        [ model.sceneProperty, model.currentBarrierPositionFractionProperty ],
        ( scene, barrierPositionFraction ) => ( 1 - barrierPositionFraction ) * scene.regionWidth
      );

      experimentSetupDetailsNode = new ExperimentSetupDetailsNode( model, slitConfigurationProperty, {
        slitOrientation: providedOptions.slitOrientation,
        screenDistanceProperty: screenDistanceProperty
      } );
      this.addChild( experimentSetupDetailsNode );
    }

    // The heading follows the active view: "Detector Screen and Experiment Details" while the detector screen is
    // shown, "Graph and Experiment Details" while the graph is shown.
    const headingStringProperty = providedOptions.screenGraphVisibleProperty ?
                                  new DerivedProperty(
                                    [
                                      providedOptions.screenGraphVisibleProperty,
                                      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty,
                                      QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.graphAndExperimentDetailsHeadingStringProperty
                                    ],
                                    ( isGraphVisible, detectorScreenHeading, graphHeading ) => isGraphVisible ? graphHeading : detectorScreenHeading
                                  ) :
                                  QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty;

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/view/description/ExperimentScreenViewDescription.ts.
    // These heading nodes stay parallel because this shared description owns different optional content and pdomOrder.
    this.detectorScreenAndExperimentDetailsHeadingNode = new Node( includeExperimentSetupDetails ? {
      accessibleHeading: headingStringProperty
    } : {} );
    this.addChild( this.detectorScreenAndExperimentDetailsHeadingNode );

    this.sourceHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.sourceHeadingStringProperty
    } );
    this.addChild( this.sourceHeadingNode );

    this.slitsHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.slitsHeadingStringProperty
    } );
    this.addChild( this.slitsHeadingNode );

    this.detectorScreenHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.detectorScreenHeadingStringProperty
    } );
    this.addChild( this.detectorScreenHeadingNode );

    this.detectorScreenAndExperimentDetailsHeadingNode.pdomOrder = [
      ...( providedOptions.detectorScreenDetailsNodes || [] ),
      ...( experimentSetupDetailsNode ? [ experimentSetupDetailsNode ] : [] )
    ];

    this.sourceHeadingNode.pdomOrder = providedOptions.sourceNodes;
    this.slitsHeadingNode.pdomOrder = providedOptions.slitNodes;
    this.detectorScreenHeadingNode.pdomOrder = providedOptions.detectorScreenControlNodes;
  }
}
