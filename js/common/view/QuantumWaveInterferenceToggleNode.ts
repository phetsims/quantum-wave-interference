// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceToggleNode displays the scene-specific Node that corresponds to the active scene.
 * It is a simulation-specific wrapper around ToggleNode for QWI's common pattern of keeping parallel arrays of
 * scene models and scene-specific Nodes. Inactive scene Nodes are excluded from the scene graph, while dynamic
 * AlignBox bounds followers keep this container's bounds equivalent to having all scene Nodes included.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import AlignBox from '../../../../scenery/js/layout/nodes/AlignBox.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ToggleNode from '../../../../sun/js/ToggleNode.js';

export default class QuantumWaveInterferenceToggleNode<T, N extends Node = Node> extends Node {

  /**
   * Creates a scene toggle container that maps each scene to the Node at the same index in sceneNodes.
   * The active scene Node is the only scene Node in the scene graph, but this container keeps stable bounds that update
   * when any scene Node's bounds change.
   *
   * @param sceneProperty - active scene Property
   * @param scenes - scene values, in the same order as sceneNodes
   * @param sceneNodes - scene-specific Nodes to toggle
   */
  public constructor( sceneProperty: TReadOnlyProperty<T>, scenes: T[], sceneNodes: N[] ) {
    affirm( scenes.length === sceneNodes.length, 'Each scene must have a corresponding Node' );

    const toggleNode = new ToggleNode( sceneProperty, scenes.map( ( scene, index ) => ( {
      value: scene,
      createNode: () => sceneNodes[ index ]
    } ) ), {
      alignChildren: ToggleNode.NONE,
      unselectedChildrenSceneGraphStrategy: 'excluded'
    } );

    const boundsContainer = new Node( {
      pickable: false,
      visible: false
    } );

    sceneNodes.forEach( sceneNode => {

      // AlignBox supplies dynamic layout bounds without putting inactive scene Nodes in the scene graph.
      const boundsBox = new AlignBox( new Node( {
        localBounds: sceneNode.bounds.isValid() ? sceneNode.bounds.copy() : null,
        pickable: false
      } ), {
        pickable: false
      } );

      sceneNode.boundsProperty.link( bounds => {
        if ( bounds.isValid() ) {
          boundsBox.alignBounds = bounds;
        }
      } );

      boundsContainer.addChild( boundsBox );
    } );

    super( {
      children: [ boundsContainer, toggleNode ],
      excludeInvisibleChildrenFromBounds: false,
      isDisposable: false
    } );
  }
}
