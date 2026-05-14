// Copyright 2026, University of Colorado Boulder

/**
 * RulerDragBoundsProperty constrains the Experiment screen ruler to the active detector screen and graph region.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';

const RULER_X_OFFSET = 0.5;

export default class RulerDragBoundsProperty {
  public readonly dragBoundsProperty: TReadOnlyProperty<Bounds2 | null>;

  private readonly scene: SceneModel;
  private readonly sceneProperty: TReadOnlyProperty<SceneModel>;
  private readonly detectorScreenNode: DetectorScreenNode;
  private readonly graphAccordionBox: GraphAccordionBox;
  private readonly rulerNode: Node;

  public constructor(
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    scene: SceneModel,
    sceneProperty: TReadOnlyProperty<SceneModel>,
    graphExpandedProperty: TReadOnlyProperty<boolean>,
    detectorScreenNode: DetectorScreenNode,
    graphAccordionBox: GraphAccordionBox,
    rulerNode: Node,
    localRootNode: Node
  ) {
    this.dragBoundsProperty = new DerivedProperty(
      [ visibleBoundsProperty, sceneProperty, graphExpandedProperty ],
      ( visibleBounds: Bounds2 ) => {
        const detectorRectCenterX = detectorScreenNode.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
        const fixedLeft = detectorRectCenterX - rulerNode.width / 2 + RULER_X_OFFSET;

        const detectorScreenRectBounds = localRootNode.globalToLocalBounds(
          detectorScreenNode.getScreenRectangleGlobalBounds()
        );
        const minTopFromScreen = detectorScreenRectBounds.top;
        const graphChartBounds = localRootNode.globalToLocalBounds(
          graphAccordionBox.getChartAreaGlobalBounds()
        );
        const maxTopFromGraph = graphChartBounds.bottom - rulerNode.height + graphAccordionBox.getChartAreaStrokeLineWidth();

        const minTop = Math.max( minTopFromScreen, visibleBounds.minY );
        const maxTop = Math.max(
          minTop,
          Math.min( maxTopFromGraph, visibleBounds.maxY - rulerNode.height )
        );

        // Lock X to detector screen center by setting minX === maxX.
        return new Bounds2( fixedLeft, minTop, fixedLeft, maxTop );
      }
    );

    this.scene = scene;
    this.sceneProperty = sceneProperty;
    this.detectorScreenNode = detectorScreenNode;
    this.graphAccordionBox = graphAccordionBox;
    this.rulerNode = rulerNode;
  }

  public constrainRulerPositionProperty( rulerPositionProperty: Property<Vector2> ): void {
    this.dragBoundsProperty.link( dragBounds => {
      if ( dragBounds && this.sceneProperty.value === this.scene ) {
        rulerPositionProperty.value = dragBounds.closestPointTo(
          rulerPositionProperty.value
        );
      }
    } );
  }

  public getCenteredRulerPosition(): Vector2 {
    const centeredTop = this.detectorScreenNode.centerY - this.rulerNode.height / 2;
    const detectorRectCenterX = this.detectorScreenNode.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
    const centeredLeft = detectorRectCenterX - this.rulerNode.width / 2 + RULER_X_OFFSET;

    const dragBounds = this.dragBoundsProperty.value;
    assert && assert( dragBounds, 'Ruler drag bounds should be available' );
    return dragBounds!.closestPointTo( new Vector2( centeredLeft, centeredTop ) );
  }
}
