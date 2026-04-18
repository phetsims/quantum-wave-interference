// Copyright 2026, University of Colorado Boulder

/**
 * Builds a closed Shape with rounded corners from an array of polygon vertices. Each corner is rounded
 * with a quadratic Bézier curve, pulling back from the vertex along each adjacent edge by cornerRadius.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';

type Vertex = { x: number; y: number };

function createRoundedPolygonShape( corners: Vertex[], cornerRadius: number ): Shape {
  const n = corners.length;
  const shape = new Shape();

  for ( let i = 0; i < n; i++ ) {
    const prev = corners[ ( i - 1 + n ) % n ];
    const curr = corners[ i ];
    const next = corners[ ( i + 1 ) % n ];

    const inDx = curr.x - prev.x;
    const inDy = curr.y - prev.y;
    const inLen = Math.sqrt( inDx * inDx + inDy * inDy );
    const outDx = next.x - curr.x;
    const outDy = next.y - curr.y;
    const outLen = Math.sqrt( outDx * outDx + outDy * outDy );

    const startX = curr.x - ( inDx / inLen ) * cornerRadius;
    const startY = curr.y - ( inDy / inLen ) * cornerRadius;
    const endX = curr.x + ( outDx / outLen ) * cornerRadius;
    const endY = curr.y + ( outDy / outLen ) * cornerRadius;

    if ( i === 0 ) {
      shape.moveTo( startX, startY );
    }
    else {
      shape.lineTo( startX, startY );
    }
    shape.quadraticCurveTo( curr.x, curr.y, endX, endY );
  }
  shape.close();
  return shape;
}

export default createRoundedPolygonShape;
