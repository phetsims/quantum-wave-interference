// Copyright 2026, University of Colorado Boulder

/**
 * Links a scene Property to a parallel array of Nodes, making only the Node corresponding to the active scene visible.
 * Used by panels that swap their content when the active scene changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';

const linkSceneVisibility = <T>( sceneProperty: TReadOnlyProperty<T>, scenes: T[], sceneNodes: Node[] ): void => {
  sceneProperty.link( activeScene => {
    for ( let i = 0; i < scenes.length; i++ ) {
      sceneNodes[ i ].visible = scenes[ i ] === activeScene;
    }
  } );
};

export default linkSceneVisibility;
