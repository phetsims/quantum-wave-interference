// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create small tool icons for the tool-visibility checkboxes on the
 * High Intensity and Single Particles screens. Each icon is a lightweight Scenery Node
 * sized to sit beside the checkbox label text (~18 px tall).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import MeasuringTapeNode from '../../../../scenery-phet/js/MeasuringTapeNode.js';
import Stopwatch from '../../../../scenery-phet/js/Stopwatch.js';
import StopwatchNode from '../../../../scenery-phet/js/StopwatchNode.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import { rasterizeNode } from '../../../../scenery/js/util/rasterizeNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';

const CHART_WIDTH = 18;
const CHART_HEIGHT = 16;
const CHART_STROKE_COLOR = '#2266cc';
const CHART_BACKGROUND_OPTIONS = {
  cornerRadius: 2,
  fill: 'white',
  stroke: '#aaa',
  lineWidth: 0.8
};

// Shared with DetectorToolNode — the "ready" state base color
const DETECTOR_TOOL_COLOR = new Color( 135, 206, 250 );

function createTapeMeasureIcon(): Node {
  return MeasuringTapeNode.createIcon( {
    tapeLength: 15,
    scale: 0.45
  } );
}

function createStopwatchIcon(): Node {
  const stopwatch = new Stopwatch( { isVisible: true, tandem: Tandem.OPT_OUT } );
  const stopwatchNode = new StopwatchNode( stopwatch, { tandem: Tandem.OPT_OUT } );
  const icon = rasterizeNode( stopwatchNode, { resolution: 5 } );
  icon.setScaleMagnitude( 0.12 );
  return icon;
}

function createChartIcon( contentChildren: Node[] ): Node {
  const background = new Rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT, CHART_BACKGROUND_OPTIONS );
  return new Node( { children: [ background, ...contentChildren ] } );
}

function createTimePlotIcon(): Node {
  const cy = CHART_HEIGHT / 2;
  const shape = new Shape().moveTo( 2, cy );
  for ( let x = 2; x <= CHART_WIDTH - 2; x++ ) {
    shape.lineTo( x, cy + Math.sin( ( x - 2 ) / ( CHART_WIDTH - 4 ) * 2 * Math.PI ) * ( CHART_HEIGHT * 0.35 ) );
  }
  const wavePath = new Path( shape, {
    stroke: CHART_STROKE_COLOR,
    lineWidth: 1.5,
    clipArea: Shape.rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT )
  } );
  return createChartIcon( [ wavePath ] );
}

function createPositionPlotIcon(): Node {
  const cy = CHART_HEIGHT / 2;
  const lineShape = new Shape()
    .moveTo( 2, cy )
    .lineTo( CHART_WIDTH - 2, cy );
  const linePath = new Path( lineShape, {
    stroke: CHART_STROKE_COLOR,
    lineWidth: 1.5,
    clipArea: Shape.rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT )
  } );
  const marker = new Circle( 2, {
    fill: CHART_STROKE_COLOR,
    centerX: CHART_WIDTH * 0.6,
    centerY: cy
  } );
  return createChartIcon( [ linePath, marker ] );
}

function createGraphIcon(): Node {
  const barWidth = 3;
  const spacing = 2;
  const startX = 3;
  const bars = new Node();
  const heights = [ 0.5, 0.85, 0.35 ];
  for ( let i = 0; i < heights.length; i++ ) {
    const barH = heights[ i ] * ( CHART_HEIGHT - 4 );
    bars.addChild( new Rectangle( startX + i * ( barWidth + spacing ), CHART_HEIGHT - 2 - barH, barWidth, barH, {
      fill: '#cc6633',
      cornerRadius: 0.5
    } ) );
  }
  return createChartIcon( [ bars ] );
}

function createDetectorIcon(): Node {
  return new Circle( 7, {
    stroke: DETECTOR_TOOL_COLOR,
    lineWidth: 1.5,
    fill: DETECTOR_TOOL_COLOR.withAlpha( 0.15 ),
    lineDash: [ 3, 2 ]
  } );
}

const ToolIcons = {
  createTapeMeasureIcon: createTapeMeasureIcon,
  createStopwatchIcon: createStopwatchIcon,
  createTimePlotIcon: createTimePlotIcon,
  createPositionPlotIcon: createPositionPlotIcon,
  createGraphIcon: createGraphIcon,
  createDetectorIcon: createDetectorIcon
};

export default ToolIcons;
