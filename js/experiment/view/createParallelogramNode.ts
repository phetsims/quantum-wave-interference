// Copyright 2026, University of Colorado Boulder

/**
 * Creates a parallelogram shape representing a screen or slit in overhead (perspective) view.
 * The parallelogram has a vertical left edge, with the right edge offset by (dx, dy) from the left.
 * Used by both OverheadDoubleSlitNode and OverheadDetectorScreenNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Path from '../../../../scenery/js/nodes/Path.js';
import createRoundedPolygonShape from '../../common/view/createRoundedPolygonShape.js';

/**
 * @param dx - horizontal distance from left edge to right edge
 * @param dy - vertical offset of the right edge (positive = right edge is lower)
 * @param leftHeight - height of the left edge
 * @param fill - fill color
 * @param cornerRadius - optional corner radius; defaults to the rounded style used by overhead elements
 */
function createParallelogramNode( dx: number, dy: number, leftHeight: number, fill: string, cornerRadius?: number ): Path {

  const effectiveCornerRadius = cornerRadius !== undefined ? cornerRadius : leftHeight * 0.065;

  const shape = createRoundedPolygonShape( [
    { x: 0, y: 0 },
    { x: 0, y: leftHeight },
    { x: dx, y: leftHeight + dy },
    { x: dx, y: dy }
  ], effectiveCornerRadius );

  return new Path( shape, {
    fill: fill,
    stroke: null
  } );
}

export default createParallelogramNode;
