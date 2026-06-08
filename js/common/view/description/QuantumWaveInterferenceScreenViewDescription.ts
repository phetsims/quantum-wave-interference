// Copyright 2026, University of Colorado Boulder

/**
 * Shared PDOM-only descriptions and heading groups for the Single Particles and High Intensity screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../../axon/js/TReadOnlyProperty.js';
import { type AccessibleListItem } from '../../../../../scenery-phet/js/accessibility/AccessibleList.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../../model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../model/SlitConfiguration.js';
import { type SourceType } from '../../model/SourceType.js';
import DetectorPatternGraphDescriber, { type DetectorPatternGraphDescriberScene } from './DetectorPatternGraphDescriber.js';
import DetectorScreenDescriber, { type DetectorScreenDescriberScene } from './DetectorScreenDescriber.js';
import ExperimentSetupDetailsNode from './ExperimentSetupDetailsNode.js';
import { type SlitOrientation } from './QuantumWaveInterferenceScreenSummaryContent.js';

type SharedDescriptionScene = DetectorScreenDescriberScene & DetectorPatternGraphDescriberScene & {
  sourceType: SourceType;
  particleSpeedRange: { min: number; max: number };
  slitSeparationRange: { min: number; max: number };
};

type SharedDescriptionModel = {
  sceneProperty: TReadOnlyProperty<SharedDescriptionScene>;
  currentIsEmittingProperty: TReadOnlyProperty<boolean>;
  currentWavelengthProperty: TReadOnlyProperty<number>;
  currentParticleSpeedProperty: TReadOnlyProperty<number>;
  currentSlitSeparationProperty: TReadOnlyProperty<number>;
};

type SharedDescriptionOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  detectorScreenUpdateTriggerProperty?: TReadOnlyProperty<unknown>;
  screenGraphVisibleProperty?: TReadOnlyProperty<boolean>;
  slitOrientation?: SlitOrientation;
  includeExperimentSetupDetails?: boolean;
  experimentSetupAdditionalListItems?: AccessibleListItem[];
  sourceNodes: Node[];
  slitNodes: Node[];
  detectorScreenControlNodes: Node[];
};

export default class QuantumWaveInterferenceScreenViewDescription extends Node {

  public readonly experimentSetupHeadingNode: Node;
  public readonly sourceHeadingNode: Node;
  public readonly slitsHeadingNode: Node;
  public readonly detectorScreenHeadingNode: Node;

  public constructor(
    model: SharedDescriptionModel,
    slitSettingProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    providedOptions: SharedDescriptionOptions
  ) {

    super();

    const includeExperimentSetupDetails = providedOptions.includeExperimentSetupDetails !== false;

    let detectorScreenDescriptionNode: Node | null = null;
    let graphDescriptionNode: Node | null = null;
    let experimentSetupDetailsNode: Node | null = null;
    if ( includeExperimentSetupDetails ) {
      const detectorScreenDescriber = new DetectorScreenDescriber(
        model.sceneProperty,
        new BooleanProperty( false ),
        model.sceneProperty.derived( scene => 'screenDistanceProperty' in scene ? 0.5 : scene.regionWidth / 2 ),
        providedOptions.detectorScreenUpdateTriggerProperty
      );

      const detectorScreenDescriptionNodeOptions = providedOptions.screenGraphVisibleProperty ? {
        accessibleParagraph: detectorScreenDescriber.descriptionProperty,
        visibleProperty: DerivedProperty.not( providedOptions.screenGraphVisibleProperty )
      } : {
        accessibleParagraph: detectorScreenDescriber.descriptionProperty
      };

      detectorScreenDescriptionNode = new Node( detectorScreenDescriptionNodeOptions );
      this.addChild( detectorScreenDescriptionNode );

      if ( providedOptions.screenGraphVisibleProperty ) {
        const graphDescriber = new DetectorPatternGraphDescriber( model.sceneProperty, new BooleanProperty( false ) );
        graphDescriptionNode = new Node( {
          accessibleParagraph: graphDescriber.descriptionProperty,
          visibleProperty: providedOptions.screenGraphVisibleProperty
        } );
        this.addChild( graphDescriptionNode );
      }

      experimentSetupDetailsNode = new ExperimentSetupDetailsNode( model, slitSettingProperty, {
        detectionModeProperty: providedOptions.detectionModeProperty,
        slitOrientation: providedOptions.slitOrientation,
        additionalListItems: providedOptions.experimentSetupAdditionalListItems
      } );
      this.addChild( experimentSetupDetailsNode );
    }

    // NOTE: see other duplicate in quantum-wave-interference/js/experiment/view/description/ExperimentScreenViewDescription.ts.
    // These heading nodes stay parallel because this shared description owns different optional content and pdomOrder.
    this.experimentSetupHeadingNode = new Node( includeExperimentSetupDetails ? {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.experimentSetupHeadingStringProperty
    } : {} );
    this.addChild( this.experimentSetupHeadingNode );

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

    this.experimentSetupHeadingNode.pdomOrder = [
      ...( detectorScreenDescriptionNode ? [ detectorScreenDescriptionNode ] : [] ),
      ...( graphDescriptionNode ? [ graphDescriptionNode ] : [] ),
      ...( experimentSetupDetailsNode ? [ experimentSetupDetailsNode ] : [] )
    ];

    this.sourceHeadingNode.pdomOrder = providedOptions.sourceNodes;
    this.slitsHeadingNode.pdomOrder = providedOptions.slitNodes;
    this.detectorScreenHeadingNode.pdomOrder = providedOptions.detectorScreenControlNodes;
  }
}
