// Copyright 2026, University of Colorado Boulder

/**
 * Factory function that creates measurement tool nodes (stopwatch, measuring tape, time plot,
 * position plot) and adds them to the provided parent node. These tools are identical between
 * the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import getMeasuringTapeUnits from './getMeasuringTapeUnits.js';
import PositionPlotNode from './PositionPlotNode.js';
import TimePlotNode from './TimePlotNode.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';

type MeasurementSceneLike = WaveVisualizableScene & { sourceType: string; regionWidth: number };

type MeasurementToolsModel = {
  sceneProperty: TReadOnlyProperty<MeasurementSceneLike>;
  stopwatch: Stopwatch;
  isStopwatchVisibleProperty: BooleanProperty;
  isTapeMeasureVisibleProperty: BooleanProperty;
  isTimePlotVisibleProperty: BooleanProperty;
  isPositionPlotVisibleProperty: BooleanProperty;
  tapeMeasureBasePositionProperty: Vector2Property;
  tapeMeasureTipPositionProperty: Vector2Property;
};

type MeasurementToolNodes = {
  timePlotNode: TimePlotNode;
  positionPlotNode: PositionPlotNode;
};

const createMeasurementToolNodes = (
  model: MeasurementToolsModel,
  parentNode: Node,
  visibleBoundsProperty: Property<Bounds2>,
  waveRegionLeft: number,
  waveRegionTop: number,
  tandem: Tandem
): MeasurementToolNodes => {

  const stopwatchNode = new StopwatchNode( model.stopwatch, {
    dragBoundsProperty: visibleBoundsProperty,
    tandem: tandem.createTandem( 'stopwatchNode' )
  } );
  model.isStopwatchVisibleProperty.link( isVisible => {
    model.stopwatch.isVisibleProperty.value = isVisible;
  } );
  parentNode.addChild( stopwatchNode );

  const measuringTapeUnitsProperty = new DerivedProperty(
    [ model.sceneProperty ],
    scene => getMeasuringTapeUnits( scene.regionWidth )
  );

  const measuringTapeNode = new MeasuringTapeNode( measuringTapeUnitsProperty, {
    textBackgroundColor: 'rgba( 255, 255, 255, 0.6 )',
    textColor: 'black',
    basePositionProperty: model.tapeMeasureBasePositionProperty,
    tipPositionProperty: model.tapeMeasureTipPositionProperty,
    significantFigures: 2,
    tandem: tandem.createTandem( 'measuringTapeNode' )
  } );
  visibleBoundsProperty.link( visibleBounds => measuringTapeNode.setDragBounds( visibleBounds.eroded( 20 ) ) );
  model.isTapeMeasureVisibleProperty.linkAttribute( measuringTapeNode, 'visible' );
  parentNode.addChild( measuringTapeNode );

  const timePlotNode = new TimePlotNode(
    model.sceneProperty,
    waveRegionLeft,
    waveRegionTop,
    model.isTimePlotVisibleProperty
  );
  parentNode.addChild( timePlotNode );

  const positionPlotNode = new PositionPlotNode(
    model.sceneProperty,
    waveRegionLeft,
    waveRegionTop,
    model.isPositionPlotVisibleProperty
  );
  parentNode.addChild( positionPlotNode );

  return { timePlotNode: timePlotNode, positionPlotNode: positionPlotNode };
};

export default createMeasurementToolNodes;
