// Copyright 2026, University of Colorado Boulder

/**
 * Creates a parallelogram shape representing a screen or slit in overhead (perspective) view.
 * The parallelogram has a vertical left edge, with the right edge offset by (dx, dy) from the left.
 * Used by both OverheadDoubleSlitNode and OverheadDetectorScreenNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';

/**
 * @param dx - horizontal distance from left edge to right edge
 * @param dy - vertical offset of the right edge (positive = right edge is lower)
 * @param leftHeight - height of the left edge
 * @param fill - fill color
 * @param cornerRadius - optional corner radius; defaults to the rounded style used by overhead elements
 */
function createParallelogramNode( dx: number, dy: number, leftHeight: number, fill: string, cornerRadius?: number ): Path {

  // Round the corners by default (~6.5% of height), unless overridden.
  const effectiveCornerRadius = cornerRadius !== undefined ? cornerRadius : leftHeight * 0.065;

  // Parallelogram vertices: top-left, bottom-left, bottom-right, top-right
  const corners = [
    { x: 0, y: 0 },
    { x: 0, y: leftHeight },
    { x: dx, y: leftHeight + dy },
    { x: dx, y: dy }
  ];

  // Build a rounded parallelogram by placing arcs at each corner.
  const shape = new Shape();
  for ( let i = 0; i < corners.length; i++ ) {
    const prev = corners[ ( i - 1 + corners.length ) % corners.length ];
    const curr = corners[ i ];
    const next = corners[ ( i + 1 ) % corners.length ];

    // Unit vectors along the two edges meeting at this corner
    const inDx = curr.x - prev.x;
    const inDy = curr.y - prev.y;
    const inLen = Math.sqrt( inDx * inDx + inDy * inDy );
    const outDx = next.x - curr.x;
    const outDy = next.y - curr.y;
    const outLen = Math.sqrt( outDx * outDx + outDy * outDy );

    // Points offset from the corner along each edge by the corner radius.
    const startX = curr.x - ( inDx / inLen ) * effectiveCornerRadius;
    const startY = curr.y - ( inDy / inLen ) * effectiveCornerRadius;
    const endX = curr.x + ( outDx / outLen ) * effectiveCornerRadius;
    const endY = curr.y + ( outDy / outLen ) * effectiveCornerRadius;

    if ( i === 0 ) {
      shape.moveTo( startX, startY );
    }
    else {
      shape.lineTo( startX, startY );
    }
    shape.quadraticCurveTo( curr.x, curr.y, endX, endY );
  }
  shape.close();

  return new Path( shape, {
    fill: fill,
    stroke: null
  } );
}

export default createParallelogramNode;
