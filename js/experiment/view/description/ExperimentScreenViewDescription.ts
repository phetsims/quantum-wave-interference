// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentScreenViewDescription owns the Experiment screen's PDOM-only content and heading groups.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../../scenery/js/nodes/Node.js';
import TimeSpeed from '../../../../../scenery-phet/js/TimeSpeed.js';
import ExperimentSetupDetailsNode from '../../../common/view/description/ExperimentSetupDetailsNode.js';
import formatSourceStoppedResponse from '../../../common/view/description/formatSourceStoppedResponse.js';
import type SceneRadioButtonGroup from '../../../common/view/SceneRadioButtonGroup.js';
import type SourceControlPanel from '../../../common/view/SourceControlPanel.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentModel from '../../model/ExperimentModel.js';
import type SceneModel from '../../model/SceneModel.js';
import type OverheadEmitterNode from '../OverheadEmitterNode.js';
import type ScreenSettingsPanel from '../ScreenSettingsPanel.js';
import type SlitControlPanel from '../SlitControlPanel.js';
import ExperimentDetectorScreenDetailsNode from './ExperimentDetectorScreenDetailsNode.js';
import formatExperimentDetectorPatternResponse from './formatExperimentDetectorPatternResponse.js';

type ClockSpeedDescription = 'slow' | 'normal' | 'fast';

function getClockSpeedDescription( model: ExperimentModel ): ClockSpeedDescription {
  const timeSpeed = model.timeSpeedProperty.value;
  return timeSpeed === TimeSpeed.SLOW ? 'slow' :
         timeSpeed === TimeSpeed.NORMAL ? 'normal' :
         timeSpeed === TimeSpeed.FAST ? 'fast' :
         ( () => { throw new Error( `Unrecognized timeSpeed: ${timeSpeed}` ); } )();
}

export default class ExperimentScreenViewDescription extends Node {

  public readonly detectorScreenAndExperimentDetailsHeadingNode: Node;
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

    const sourceStartedResponseNode = new Node();
    this.addChild( sourceStartedResponseNode );
    model.currentIsEmittingProperty.lazyLink( isEmitting => {
      if ( !isEmitting ) {
        sourceStartedResponseNode.addAccessibleContextResponse(
          formatSourceStoppedResponse( model.currentDetectionModeProperty.value, model.currentTotalHitsProperty.value ),
          { flush: true }
        );
        return;
      }

      sourceStartedResponseNode.addAccessibleContextResponse(
        QuantumWaveInterferenceFluent.a11y.waveExperimentResponses.sourceStarted.format( {
          isPlaying: model.isPlayingProperty.value ? 'true' : 'false',
          timeSpeed: getClockSpeedDescription( model )
        } ),
        { flush: true }
      );

      if ( !model.isPlayingProperty.value ) {
        return;
      }

      sourceStartedResponseNode.addAccessibleContextResponse(
        model.currentDetectionModeProperty.value === 'intensity' ?
        formatExperimentDetectorPatternResponse( model ) :
        QuantumWaveInterferenceFluent.a11y.detectionModeRadioButtons.hitsRadioButton.accessibleContextResponse.format( {
          isEmitting: 'true'
        } )
      );
    } );

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

    const detectorScreenDetailsNode = new ExperimentDetectorScreenDetailsNode( model );
    this.addChild( detectorScreenDetailsNode );

    const experimentSetupDetailsListNode = new ExperimentSetupDetailsNode( model, model.currentSlitConfigurationProperty, {
      screenDistanceProperty: model.currentScreenDistanceProperty,
      leadingParagraphStringProperty:
        QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.experimentDetailsLeadingParagraphStringProperty,
      includeSourceEmitter: false,
      includeDetectionMode: false
    } );
    this.addChild( experimentSetupDetailsListNode );

    // NOTE: see other duplicate in
    // quantum-wave-interference/js/common/view/description/QuantumWaveInterferenceScreenViewDescription.ts.
    // Heading nodes for PDOM navigation. Each groups related controls under a heading so screen reader users can jump
    // between major sections with heading shortcuts.
    this.detectorScreenAndExperimentDetailsHeadingNode = new Node( {
      accessibleHeading:
        QuantumWaveInterferenceFluent.a11y.experimentDetectorScreenDetails.detectorScreenAndExperimentDetailsHeadingStringProperty
    } );
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

    // Play Area focus order, organized under headings for screen reader navigation.
    this.detectorScreenAndExperimentDetailsHeadingNode.pdomOrder = [
      detectorScreenDetailsNode,
      experimentSetupDetailsListNode
    ];

    this.sourceHeadingNode.pdomOrder = [
      ...overheadEmitterNode.emitterNodes,
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
