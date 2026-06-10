// Copyright 2026, University of Colorado Boulder

/**
 * QuantumWaveInterferenceToggleNode displays the scene-specific Node that corresponds to the active scene.
 * It is a simulation-specific wrapper for Quantum Wave Interference's common pattern of keeping parallel arrays of scene models and
 * scene-specific Nodes. Inactive scene Nodes are excluded from the scene graph, while this container keeps bounds based
 * on the maximum width and height of all scene Nodes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import Node from '../../../../scenery/js/nodes/Node.js';

export default class QuantumWaveInterferenceToggleNode<T, N extends Node = Node> extends Node {

  /**
   * Creates a scene toggle container that maps each scene to the Node at the same index in sceneNodes.
   * The active scene Node is the only scene Node in the scene graph.
   *
   * @param sceneProperty - active scene Property
   * @param scenes - scene values, in the same order as sceneNodes
   * @param sceneNodes - scene-specific Nodes to toggle
   */
  public constructor( sceneProperty: TReadOnlyProperty<T>, scenes: T[], sceneNodes: N[] ) {
    affirm( scenes.length === sceneNodes.length, 'Each scene must have a corresponding Node' );

    super( { isDisposable: false } );

    const updateLocalBounds = () => {
      let maxWidth = 0;
      let maxHeight = 0;

      sceneNodes.forEach( sceneNode => {
        const bounds = sceneNode.bounds;
        if ( bounds.isValid() ) {
          maxWidth = Math.max( maxWidth, bounds.width );
          maxHeight = Math.max( maxHeight, bounds.height );
        }
      } );

      this.localBounds = maxWidth > 0 && maxHeight > 0 ? new Bounds2( 0, 0, maxWidth, maxHeight ) : null;
    };

    sceneNodes.forEach( sceneNode => {
      sceneNode.boundsProperty.link( updateLocalBounds );
    } );

    sceneProperty.link( scene => {
      const activeSceneIndex = scenes.indexOf( scene );
      affirm( activeSceneIndex >= 0, 'Active scene should be in the scenes array' );

      this.children = [ sceneNodes[ activeSceneIndex ] ];
    } );
  }
}
