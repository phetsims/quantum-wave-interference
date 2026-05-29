// Copyright 2026, University of Colorado Boulder

/**
 * Creates the swappable source-control content used by SourceControlPanel.
 * Each scene gets its own aligned content node so source-type changes can toggle visibility without reconstructing
 * controls or changing the panel bounds.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ParticleVelocityControl from './ParticleVelocityControl.js';
import PhotonWavelengthControl from './PhotonWavelengthControl.js';
import QuantumWaveInterferenceToggleNode from './QuantumWaveInterferenceToggleNode.js';
import SourceControlScene from './SourceControlScene.js';
import SourceIntensityControl from './SourceIntensityControl.js';
import { SOURCE_CONTROL_ROW_VERTICAL_MARGIN, SOURCE_CONTROL_SECTION_SPACING } from './SourceControlPanelConstants.js';

type SceneControlContent = {
  topControl: Node;
  bottomControl: Node | null;
};

type SourceControlPanelContent = {
  contentNode: Node;
  sceneNodes: Node[];
};

/**
 * Creates all source-control nodes, sized to the largest scene so switching source types does not shift layout.
 */
export default function createSourceControlPanelContent<T extends SourceControlScene>(
  sceneProperty: Property<T>,
  scenes: T[],
  tandem: Tandem,
  photonIntensityLabelStringProperty: TReadOnlyProperty<string>,
  particleIntensityLabelStringProperty: TReadOnlyProperty<string>
): SourceControlPanelContent {
  const sceneControlContents = scenes.map( scene => createSceneControlContent(
    scene,
    tandem,
    scene.sourceType === 'photons' ? photonIntensityLabelStringProperty : particleIntensityLabelStringProperty
  ) );

  const maxTopControlWidth = Math.max( ...sceneControlContents.map( content => content.topControl.width ) );
  const maxTopControlHeight = Math.max( ...sceneControlContents.map( content => content.topControl.height ) );

  const bottomControls = sceneControlContents
    .map( content => content.bottomControl )
    .filter( control => control !== null );
  const maxBottomControlWidth = bottomControls.length > 0 ? Math.max( ...bottomControls.map( n => n.width ) ) : 0;
  const maxBottomControlHeight = bottomControls.length > 0 ? Math.max( ...bottomControls.map( n => n.height ) ) : 0;

  const sceneContentNodes = sceneControlContents.map( sceneControls =>
    createAlignedSceneContent( sceneControls.topControl, sceneControls.bottomControl, maxTopControlWidth,
      maxTopControlHeight, maxBottomControlWidth, maxBottomControlHeight )
  );

  const maxSceneWidth = Math.max( ...sceneContentNodes.map( node => node.width ) );
  const maxSceneHeight = Math.max( ...sceneContentNodes.map( node => node.height ) );

  const sceneNodes = sceneContentNodes.map( ( sceneContent, index ) => new AlignBox( sceneContent, {
    xAlign: 'center',
    yAlign: 'center',
    preferredWidth: maxSceneWidth,
    preferredHeight: maxSceneHeight
  } ) );

  return {
    contentNode: new QuantumWaveInterferenceToggleNode( sceneProperty, scenes, sceneNodes ),
    sceneNodes: sceneNodes
  };
}

/**
 * Creates the top source-specific control and optional bottom intensity control for one scene.
 */
function createSceneControlContent(
  scene: SourceControlScene,
  tandem: Tandem,
  intensityLabelStringProperty: TReadOnlyProperty<string>
): SceneControlContent {
  const topControl = scene.sourceType === 'photons' ?
                     new PhotonWavelengthControl( scene.wavelengthProperty, tandem ) :
                     new ParticleVelocityControl( scene, tandem );

  return {
    topControl: topControl,
    bottomControl: scene.intensityProperty ?
                   new SourceIntensityControl( scene.intensityProperty, scene.sourceType, intensityLabelStringProperty, tandem ) :
                   null
  };
}

/**
 * Wraps a scene's controls in fixed-size rows so every scene occupies the same panel space.
 */
function createAlignedSceneContent(
  topControl: Node,
  bottomControl: Node | null,
  topControlWidth: number,
  topControlHeight: number,
  bottomControlWidth: number,
  bottomControlHeight: number
): Node {
  const topControlRow = new AlignBox( topControl, {
    xAlign: 'center',
    yAlign: 'center',
    preferredWidth: topControlWidth,
    preferredHeight: topControlHeight,
    yMargin: SOURCE_CONTROL_ROW_VERTICAL_MARGIN
  } );

  const children: Node[] = [ topControlRow ];
  if ( bottomControl ) {
    children.push( new AlignBox( bottomControl, {
      xAlign: 'center',
      yAlign: 'center',
      preferredWidth: bottomControlWidth,
      preferredHeight: bottomControlHeight,
      yMargin: SOURCE_CONTROL_ROW_VERTICAL_MARGIN
    } ) );
  }

  return new VBox( {
    spacing: SOURCE_CONTROL_SECTION_SPACING,
    align: 'center',
    children: children
  } );
}
