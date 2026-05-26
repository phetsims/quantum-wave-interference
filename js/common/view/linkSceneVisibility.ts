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
      const active = scenes[ i ] === activeScene;
      sceneNodes[ i ].visible = active;
      sceneNodes[ i ].setAccessibleVisible( active ); // May work around a problem described in https://github.com/phetsims/quantum-wave-interference/issues/71
    }
  } );
};

export default linkSceneVisibility;
