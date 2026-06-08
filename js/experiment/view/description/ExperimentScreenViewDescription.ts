// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenViewDescription owns the Experiment screen's PDOM-only content and heading groups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../../scenery/js/nodes/Node.js';
import DetectorScreenDescriber from '../../../common/view/description/DetectorScreenDescriber.js';
import ExperimentSetupDetailsNode from '../../../common/view/description/ExperimentSetupDetailsNode.js';
import type SceneRadioButtonGroup from '../../../common/view/SceneRadioButtonGroup.js';
import type SourceControlPanel from '../../../common/view/SourceControlPanel.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import { getDetectorScreenHalfWidthForScaleIndex } from '../../model/DetectorScreenScale.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import type SceneModel from '../../model/SceneModel.js';
import type OverheadEmitterNode from '../OverheadEmitterNode.js';
import type ScreenSettingsPanel from '../ScreenSettingsPanel.js';
import type SlitControlPanel from '../SlitControlPanel.js';
import SlitViewDescriptionNode from './SlitViewDescriptionNode.js';

export default class ExperimentScreenViewDescription extends Node {

  public readonly experimentSetupHeadingNode: Node;
  public readonly sourceHeadingNode: Node;
  public readonly slitsHeadingNode: Node;
  public readonly detectorScreenHeadingNode: Node;

  public constructor(
    model: ExperimentModel,
    overheadEmitterNode: OverheadEmitterNode,
    sourceControlPanel: SourceControlPanel<SceneModel>,
    sceneRadioButtonGroup: SceneRadioButtonGroup<SceneModel>,
    slitControlPanel: SlitControlPanel,
    detectorScreenButtonNodes: Node[],
    screenSettingsPanel: ScreenSettingsPanel
  ) {

    super();

    // Accessible paragraph describing the current state of the detector screen for screen reader users.
    // The description scales with hit count: few hits describe scattered detections,
    // many hits describe the emerging/established interference pattern.
    const maxHitsReachedResponseNode = new Node();
    this.addChild( maxHitsReachedResponseNode );
    model.scenes.forEach( scene => {
      scene.isMaxHitsReachedProperty.lazyLink( isMaxHitsReached => {
        if ( isMaxHitsReached ) {
          maxHitsReachedResponseNode.addAccessibleContextResponse(
            QuantumWaveInterferenceFluent.a11y.detectorScreen.maxHitsReached.accessibleContextResponseStringProperty,
            { responseGroup: 'quantum-wave-interference-experiment-max-hits-reached' }
          );
        }
      } );
    } );

    const detectorScreenDescriber = new DetectorScreenDescriber(
      model.sceneProperty,
      model.isRulerVisibleProperty,
      model.detectorScreenScaleIndexProperty.derived( getDetectorScreenHalfWidthForScaleIndex )
    );
    const detectorScreenDescriptionNode = new Node( {
      accessibleParagraph: detectorScreenDescriber.descriptionProperty
    } );
    this.addChild( detectorScreenDescriptionNode );

    const slitViewDescriptionNode = new SlitViewDescriptionNode( model );
    this.addChild( slitViewDescriptionNode );

    const experimentSetupDetailsListNode = new ExperimentSetupDetailsNode( model, model.currentSlitSettingProperty, {
      detectionModeProperty: model.currentDetectionModeProperty,
      screenDistanceProperty: model.currentScreenDistanceProperty
    } );
    this.addChild( experimentSetupDetailsListNode );

    // NOTE: see other duplicate in
    // quantum-wave-interference/js/common/view/description/QuantumWaveInterferenceScreenViewDescription.ts.
    // Heading nodes for PDOM navigation. Each groups related controls under a heading so screen reader users can jump
    // between major sections with heading shortcuts.
    this.experimentSetupHeadingNode = new Node( {
      accessibleHeading: QuantumWaveInterferenceFluent.a11y.experimentSetupHeadingStringProperty
    } );
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

    // Play Area focus order, organized under headings for screen reader navigation.
    this.experimentSetupHeadingNode.pdomOrder = [
      detectorScreenDescriptionNode,
      slitViewDescriptionNode,
      experimentSetupDetailsListNode,
      overheadEmitterNode.maxHitsReachedPanel
    ];

    this.sourceHeadingNode.pdomOrder = [
      overheadEmitterNode.laserPointerNode,
      overheadEmitterNode.particleEmitterNode,
      sourceControlPanel,
      sceneRadioButtonGroup
    ];

    this.slitsHeadingNode.pdomOrder = [ slitControlPanel ];

    this.detectorScreenHeadingNode.pdomOrder = [
      ...detectorScreenButtonNodes,
      screenSettingsPanel
    ];
  }
}
