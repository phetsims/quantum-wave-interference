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
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import DetectorScreenNode from './DetectorScreenNode.js';
import GraphAccordionBox from './GraphAccordionBox.js';

const RULER_X_OFFSET = 0.5;

export default class RulerDragBoundsProperty {
  public readonly dragBoundsProperty: TReadOnlyProperty<Bounds2 | null>;

  private readonly sceneProperty: TReadOnlyProperty<SceneModel>;
  private readonly scenes: SceneModel[];
  private readonly detectorScreenNodes: DetectorScreenNode[];
  private readonly rulerNode: Node;

  public constructor(
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    sceneProperty: TReadOnlyProperty<SceneModel>,
    scenes: SceneModel[],
    graphExpandedProperty: TReadOnlyProperty<boolean>,
    detectorScreenNodes: DetectorScreenNode[],
    graphAccordionBoxes: GraphAccordionBox[],
    rulerNode: Node,
    localRootNode: Node
  ) {
    this.dragBoundsProperty = new DerivedProperty(
      [ visibleBoundsProperty, sceneProperty, graphExpandedProperty ],
      ( visibleBounds, scene ) => {
        const activeSceneIndex = scenes.indexOf( scene );
        affirm( activeSceneIndex >= 0, 'Active scene should be in the scenes array' );
        const detectorScreenNode = detectorScreenNodes[ activeSceneIndex ];
        const graphAccordionBox = graphAccordionBoxes[ activeSceneIndex ];
        const detectorRectCenterX = detectorScreenNode.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
        const fixedLeft = detectorRectCenterX - rulerNode.width / 2 + RULER_X_OFFSET;

        const detectorScreenRectBounds = localRootNode.globalToLocalBounds(
          detectorScreenNode.getScreenRectangleGlobalBounds()
        );
        const minTopFromScreen = detectorScreenRectBounds.top;
        const graphChartBounds = localRootNode.globalToLocalBounds( graphAccordionBox.getChartAreaGlobalBounds() );
        const maxTopFromGraph = graphChartBounds.bottom - rulerNode.height + graphAccordionBox.getChartAreaStrokeLineWidth();

        const minTop = Math.max( minTopFromScreen, visibleBounds.minY );
        const maxTop = Math.max( minTop, Math.min( maxTopFromGraph, visibleBounds.maxY - rulerNode.height ) );

        // Lock X to detector screen center by setting minX === maxX.
        return new Bounds2( fixedLeft, minTop, fixedLeft, maxTop );
      }
    );

    this.sceneProperty = sceneProperty;
    this.scenes = scenes;
    this.detectorScreenNodes = detectorScreenNodes;
    this.rulerNode = rulerNode;
  }

  /**
   * Installs a persistent listener on dragBoundsProperty that clamps rulerPositionProperty whenever the drag bounds
   * change (e.g. on window resize, scene change, or graph accordion expand/collapse). Call once during construction.
   */
  public constrainRulerPositionProperty( rulerPositionProperty: Property<Vector2> ): void {
    this.dragBoundsProperty.link( dragBounds => {
      if ( dragBounds ) {
        rulerPositionProperty.value = dragBounds.closestPointTo( rulerPositionProperty.value );
      }
    } );
  }

  /**
   * Returns the position that places the ruler centered on the detector screen, clamped to the current drag bounds.
   * Used to reset the ruler to a sensible default position when it is first shown or when the scene is re-entered.
   * Asserts that dragBoundsProperty has a non-null value at call time.
   */
  public getCenteredRulerPosition(): Vector2 {
    const activeSceneIndex = this.scenes.indexOf( this.sceneProperty.value );
    affirm( activeSceneIndex >= 0, 'Active scene should be in the scenes array' );
    const detectorScreenNode = this.detectorScreenNodes[ activeSceneIndex ];
    const centeredTop = detectorScreenNode.centerY - this.rulerNode.height / 2;
    const detectorRectCenterX = detectorScreenNode.x + ExperimentConstants.DETECTOR_SCREEN_WIDTH / 2;
    const centeredLeft = detectorRectCenterX - this.rulerNode.width / 2 + RULER_X_OFFSET;

    const dragBounds = this.dragBoundsProperty.value;
    affirm( dragBounds, 'Ruler drag bounds should be available' );
    return dragBounds.closestPointTo( new Vector2( centeredLeft, centeredTop ) );
  }
}
