// Copyright 2026, University of Colorado Boulder

/**
 * Creates the swappable source-control content used by SourceControlPanel.
 * Each scene gets its own aligned content node so source-type changes can toggle visibility without reconstructing
 * controls. Widths remain aligned across scenes, while heights follow the visible controls in the active scene.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import AlignGroup from '../../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ParticleVelocityControl from './ParticleVelocityControl.js';
import PhotonWavelengthControl from './PhotonWavelengthControl.js';
import { SOURCE_CONTROL_ROW_VERTICAL_MARGIN, SOURCE_CONTROL_SECTION_SPACING } from './SourceControlPanelConstants.js';
import SourceControlScene from './SourceControlScene.js';
import SourceStrengthControl from './SourceStrengthControl.js';

// The top source-specific control (wavelength or velocity) and an optional bottom source-strength control for one scene.
type SceneControlContent = {
  topControl: Node;
  bottomControl: Node | null;
};

// Return value of createSourceControlPanelContent: a toggle node that swaps between scenes.
type SourceControlPanelContent = {
  contentNode: Node;
  hasVisibleContentProperty: TReadOnlyProperty<boolean>;
};

/**
 * Creates all source-control nodes with consistent widths and content-driven heights.
 *
 * @param sceneProperty - the currently active scene; drives which scene node is visible inside contentNode
 * @param scenes - all scenes to build controls for
 * @param tandem - fallback tandem used when sceneTandems is null or has no entry for a scene
 * @param sceneTandems - optional per-scene tandem overrides; when provided, each scene looks up its own tandem so
 *   PhET-iO instruments each scene's controls under a distinct path; falls back to tandem when null or missing
 * @param photonSourceStrengthLabelStringProperty - label for the source-strength slider shown in photon scenes
 * @param particleSourceStrengthLabelStringProperty - label for the source-strength slider shown in particle scenes
 * @returns contentNode - a ToggleNode that shows only the active scene's controls;
 *          hasVisibleContentProperty - whether the active scene has at least one visible source control
 */
export default function createSourceControlPanelContent<T extends SourceControlScene>(
  sceneProperty: Property<T>,
  scenes: T[],
  tandem: Tandem,
  sceneTandems: ReadonlyMap<object, Tandem> | null,
  photonSourceStrengthLabelStringProperty: TReadOnlyProperty<string>,
  particleSourceStrengthLabelStringProperty: TReadOnlyProperty<string>
): SourceControlPanelContent {
  const sceneControlContents = scenes.map( scene => createSceneControlContent(
    scene,
    sceneTandems?.get( scene ) || tandem,
    scene.sourceType === 'photons' ? photonSourceStrengthLabelStringProperty : particleSourceStrengthLabelStringProperty
  ) );

  const topControlAlignGroup = new AlignGroup( { matchVertical: false } );
  const bottomControlAlignGroup = new AlignGroup( { matchVertical: false } );

  const sceneContentNodes = sceneControlContents.map( sceneControls =>
    createAlignedSceneContent(
      sceneControls.topControl,
      sceneControls.bottomControl,
      topControlAlignGroup,
      bottomControlAlignGroup
    )
  );

  const maxSceneWidth = Math.max( ...sceneContentNodes.map( sceneContent => sceneContent.width ) );
  const sceneHasVisibleContentProperties = sceneControlContents.map( sceneControls => DerivedProperty.or( [
    sceneControls.topControl.visibleProperty,
    ...( sceneControls.bottomControl ? [ sceneControls.bottomControl.visibleProperty ] : [] )
  ] ) );

  // Preserve the maximum scene width and dynamically center content as individual controls are hidden or restored.
  const sceneNodes = sceneContentNodes.map( sceneContent => new AlignBox( sceneContent, {
    preferredWidth: maxSceneWidth,
    xAlign: 'center'
  } ) );

  const contentNode = new ToggleNode( sceneProperty, scenes.map( ( scene, index ) => ( {
    value: scene,
    createNode: () => sceneNodes[ index ]
  } ) ), {
    unselectedChildrenSceneGraphStrategy: 'excluded'
  } );

  const hasVisibleContentProperty = DerivedProperty.deriveAny( [ sceneProperty, ...sceneHasVisibleContentProperties ],
    () => {
      const sceneIndex = scenes.indexOf( sceneProperty.value );
      return sceneHasVisibleContentProperties[ sceneIndex ].value;
    }
  );

  return {
    contentNode: contentNode,
    hasVisibleContentProperty: hasVisibleContentProperty
  };
}

/**
 * Creates the top source-specific control and optional bottom source-strength control for one scene.
 */
function createSceneControlContent(
  scene: SourceControlScene,
  tandem: Tandem,
  sourceStrengthLabelStringProperty: TReadOnlyProperty<string>
): SceneControlContent {
  const topControl = scene.sourceType === 'photons' ?
                     new PhotonWavelengthControl( scene.wavelengthProperty, tandem ) :
                     new ParticleVelocityControl( scene, tandem );
  const sourceStrengthProperty = scene.sourceType === 'photons' ?
                                 scene.intensityProperty :
                                 scene.emissionRateProperty;

  return {
    topControl: topControl,
    bottomControl: sourceStrengthProperty ?
                   new SourceStrengthControl( sourceStrengthProperty, scene.sourceType, sourceStrengthLabelStringProperty, tandem ) :
                   null
  };
}

/**
 * Wraps a scene's controls in equal-width rows that collapse when their controls are hidden.
 *
 * @param topControl - wavelength or velocity control for the scene
 * @param bottomControl - optional intensity or emission-rate control for the scene
 * @param topControlAlignGroup - width-only alignment group shared by all top controls
 * @param bottomControlAlignGroup - width-only alignment group shared by all bottom controls
 * @returns vertically arranged controls for one scene
 */
function createAlignedSceneContent(
  topControl: Node,
  bottomControl: Node | null,
  topControlAlignGroup: AlignGroup,
  bottomControlAlignGroup: AlignGroup
): VBox {
  const topControlRow = topControlAlignGroup.createBox( topControl, {
    xAlign: 'center',
    yMargin: SOURCE_CONTROL_ROW_VERTICAL_MARGIN,
    visibleProperty: topControl.visibleProperty
  } );

  const children: Node[] = [ topControlRow ];
  if ( bottomControl ) {
    children.push( bottomControlAlignGroup.createBox( bottomControl, {
      xAlign: 'center',
      yMargin: SOURCE_CONTROL_ROW_VERTICAL_MARGIN,
      visibleProperty: bottomControl.visibleProperty
    } ) );
  }

  return new VBox( {
    spacing: SOURCE_CONTROL_SECTION_SPACING,
    align: 'center',
    children: children
  } );
}
