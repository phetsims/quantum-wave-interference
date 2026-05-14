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
import DetectorRulerNode from './DetectorRulerNode.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';

const RULER_X_OFFSET = 0.5;

export default class RulerDragBoundsProperty {
  public readonly dragBoundsProperty: TReadOnlyProperty<Bounds2 | null>;

  private readonly scenes: SceneModel[];
  private readonly sceneProperty: TReadOnlyProperty<SceneModel>;
  private readonly detectorScreenNodes: DetectorScreenNode[];
  private readonly graphAccordionBoxes: GraphAccordionBox[];
  private readonly rulerNodes: DetectorRulerNode[];

  public constructor(
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    sceneProperty: TReadOnlyProperty<SceneModel>,
    graphExpandedProperty: TReadOnlyProperty<boolean>,
    scenes: SceneModel[],
    detectorScreenNodes: DetectorScreenNode[],
    graphAccordionBoxes: GraphAccordionBox[],
    rulerNodes: DetectorRulerNode[],
    localRootNode: Node
  ) {
    const getActiveSceneIndex = () => scenes.indexOf( sceneProperty.value );

    this.dragBoundsProperty = new DerivedProperty(
      [ visibleBoundsProperty, sceneProperty, graphExpandedProperty ],
      ( visibleBounds: Bounds2 ) => {
        const activeSceneIndex = getActiveSceneIndex();
        const activeDetectorScreen = detectorScreenNodes[ activeSceneIndex ];
        const activeGraphBox = graphAccordionBoxes[ activeSceneIndex ];
        const activeRulerNode = rulerNodes[ activeSceneIndex ];

        const detectorRectCenterX = activeDetectorScreen.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
        const fixedLeft = detectorRectCenterX - activeRulerNode.width / 2 + RULER_X_OFFSET;

        const detectorScreenRectBounds = localRootNode.globalToLocalBounds(
          activeDetectorScreen.getScreenRectangleGlobalBounds()
        );
        const minTopFromScreen = detectorScreenRectBounds.top;
        const graphChartBounds = localRootNode.globalToLocalBounds(
          activeGraphBox.getChartAreaGlobalBounds()
        );
        const maxTopFromGraph = graphChartBounds.bottom - activeRulerNode.height + activeGraphBox.getChartAreaStrokeLineWidth();

        const minTop = Math.max( minTopFromScreen, visibleBounds.minY );
        const maxTop = Math.max(
          minTop,
          Math.min( maxTopFromGraph, visibleBounds.maxY - activeRulerNode.height )
        );

        // Lock X to detector screen center by setting minX === maxX.
        return new Bounds2( fixedLeft, minTop, fixedLeft, maxTop );
      }
    );

    this.scenes = scenes;
    this.sceneProperty = sceneProperty;
    this.detectorScreenNodes = detectorScreenNodes;
    this.graphAccordionBoxes = graphAccordionBoxes;
    this.rulerNodes = rulerNodes;
  }

  public constrainRulerPositionProperty( rulerPositionProperty: Property<Vector2> ): void {
    this.dragBoundsProperty.link( dragBounds => {
      if ( dragBounds ) {
        rulerPositionProperty.value = dragBounds.closestPointTo(
          rulerPositionProperty.value
        );
      }
    } );
  }

  public getCenteredRulerPosition(): Vector2 {
    const activeSceneIndex = this.getActiveSceneIndex();
    const activeDetectorScreen = this.detectorScreenNodes[ activeSceneIndex ];
    const activeRulerNode = this.rulerNodes[ activeSceneIndex ];
    const centeredTop = activeDetectorScreen.centerY - activeRulerNode.height / 2;
    const detectorRectCenterX = activeDetectorScreen.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
    const centeredLeft = detectorRectCenterX - activeRulerNode.width / 2 + RULER_X_OFFSET;

    const dragBounds = this.dragBoundsProperty.value;
    assert && assert( dragBounds, 'Ruler drag bounds should be available' );
    return dragBounds!.closestPointTo( new Vector2( centeredLeft, centeredTop ) );
  }

  private getActiveSceneIndex(): number {
    return this.scenes.indexOf( this.sceneProperty.value );
  }
}
