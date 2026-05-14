// Copyright 2026, University of Colorado Boulder

/**
 * RoundedPolygonShape is a closed Shape with rounded corners from an array of polygon vertices. Each corner is rounded
 * with a quadratic Bézier curve, pulling back from the vertex along each adjacent edge by cornerRadius.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';

export type Vertex = { x: number; y: number };

export default class RoundedPolygonShape extends Shape {

  public constructor( corners: Vertex[], cornerRadius: number ) {
    super();

    const n = corners.length;

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
        this.moveTo( startX, startY );
      }
      else {
        this.lineTo( startX, startY );
      }
      this.quadraticCurveTo( curr.x, curr.y, endX, endY );
    }
    this.close();
  }
}
