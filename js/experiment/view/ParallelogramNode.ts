// Copyright 2026, University of Colorado Boulder

/**
 * ParallelogramNode represents a screen or slit in overhead (perspective) view.
 * The parallelogram has a vertical left edge, with the right edge offset by (dx, dy) from the left.
 * Shared by the overhead detector/screen/slit nodes for both rounded Path geometry and unrounded clip shapes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import RoundedPolygonShape from '../../common/view/RoundedPolygonShape.js';

/**
 * Creates the ordered corners for a parallelogram with a vertical left edge and a right edge offset by (dx, dy).
 * Exported separately because rounded visual nodes and unrounded clip/overlay shapes both need identical geometry.
 */
export function getParallelogramCorners( dx: number, dy: number, leftHeight: number ): Vector2[] {
  return [
    new Vector2( 0, 0 ),
    new Vector2( 0, leftHeight ),
    new Vector2( dx, leftHeight + dy ),
    new Vector2( dx, dy )
  ];
}

export class ParallelogramShape extends Shape {

  /**
   * Creates an unrounded parallelogram Shape with a vertical left edge and a right edge offset by (dx, dy).
   */
  public constructor( dx: number, dy: number, leftHeight: number ) {
    super();

    const corners = getParallelogramCorners( dx, dy, leftHeight );

    this.moveTo( corners[ 0 ].x, corners[ 0 ].y )
      .lineTo( corners[ 1 ].x, corners[ 1 ].y )
      .lineTo( corners[ 2 ].x, corners[ 2 ].y )
      .lineTo( corners[ 3 ].x, corners[ 3 ].y )
      .close();
  }
}

/**
 * @param dx - horizontal distance from left edge to right edge
 * @param dy - vertical offset of the right edge (positive = right edge is lower)
 * @param leftHeight - height of the left edge
 * @param fill - fill color
 * @param cornerRadius - optional corner radius; defaults to the rounded style used by overhead elements
 */
export default class ParallelogramNode extends Path {

  /**
   * @param dx - horizontal distance from left edge to right edge
   * @param dy - vertical offset of the right edge (positive = right edge is lower)
   * @param leftHeight - height of the left edge
   * @param fill - fill color
   * @param cornerRadius - optional corner radius; defaults to the rounded style used by overhead elements
   */
  public constructor( dx: number, dy: number, leftHeight: number, fill: string, cornerRadius?: number ) {

    const effectiveCornerRadius = cornerRadius !== undefined ? cornerRadius : leftHeight * 0.065;

    super( new RoundedPolygonShape( getParallelogramCorners( dx, dy, leftHeight ), effectiveCornerRadius ), {
      fill: fill,
      stroke: null
    } );
  }
}
