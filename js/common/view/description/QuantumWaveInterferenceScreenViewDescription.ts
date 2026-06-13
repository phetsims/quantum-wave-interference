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
import { type DetectionMode } from '../../model/DetectionMode.js';
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
  currentIsEmittingProperty: TReadOnlyProperty<boolean>;
  currentWavelengthProperty: TReadOnlyProperty<number>;
  currentParticleSpeedProperty: TReadOnlyProperty<number>;
  currentSlitSeparationProperty: TReadOnlyProperty<number>;
};

/**
 * Options for QuantumWaveInterferenceScreenViewDescription.
 *
 * - detectionModeProperty: when provided, adds a detection-mode item to ExperimentSetupDetailsNode.
 * - screenGraphVisibleProperty: when provided, the section heading switches from "Detector Screen and Experiment
 *   Details" to "Graph and Experiment Details" while the graph is visible.
 * - slitOrientation: axis along which the slits are arranged; defaults to the describer's own default.
 * - includeExperimentSetupDetails: set to false to suppress the graph and ExperimentSetupDetailsNode children
 *   (used when that content lives elsewhere in the PDOM).
 * - detectorScreenDetailsNodes: scenery nodes placed first under the "Detector Screen and Experiment Details"
 *   PDOM heading, before the "Current experimental details" list. Each screen supplies its own list describing
 *   the detector-screen pattern and wave progress, mirroring the Experiment screen's structure. Callers must add
 *   these nodes to the scene graph themselves.
 * - sourceNodes: scenery nodes placed under the "Source" PDOM heading in pdomOrder.
 * - slitNodes: scenery nodes placed under the "Slits" PDOM heading in pdomOrder.
 * - detectorScreenControlNodes: scenery nodes placed under the "Detector Screen" PDOM heading in pdomOrder.
 */
type SharedDescriptionOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  screenGraphVisibleProperty?: TReadOnlyProperty<boolean>;
  slitOrientation?: SlitOrientation;
  includeExperimentSetupDetails?: boolean;
  detectorScreenDetailsNodes?: Node[];
  sourceNodes: Node[];
  slitNodes: Node[];
  detectorScreenControlNodes: Node[];
};

export default class QuantumWaveInterferenceScreenViewDescription extends Node {

  public readonly detectorScreenAndExperimentDetailsHeadingNode: Node;
  public readonly sourceHeadingNode: Node;
  public readonly slitsHeadingNode: Node;
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
      experimentSetupDetailsNode = new ExperimentSetupDetailsNode( model, slitConfigurationProperty, {
        detectionModeProperty: providedOptions.detectionModeProperty,
        slitOrientation: providedOptions.slitOrientation
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
