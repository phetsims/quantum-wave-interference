// Copyright 2026, University of Colorado Boulder

/**
 * WavePlotChartNode is a reusable chart panel for wave measurement tools. It provides a white chart area
 * with grid lines, a data path, axis labels, and a ShadedRectangle background. Both TimePlotNode and
 * PositionPlotNode compose this node for their chart display.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';

const CHART_WIDTH = 150;
const CHART_HEIGHT = 110;
const LABEL_FONT = new PhetFont( 11 );
const GRID_LINE_COLOR = '#bbbdbf';
const AXIS_COLOR = '#808184';
const NUM_DIVISIONS = 4;
const PADDING = 4;

type SelfOptions = {
  yAxisLabelStringProperty: TReadOnlyProperty<string>;
  xAxisLabelStringProperty: TReadOnlyProperty<string>;
};

type WavePlotChartNodeOptions = SelfOptions & NodeOptions;

export default class WavePlotChartNode extends Node {

  public readonly dataPath: Path;
  private readonly positionProperty: Vector2Property;

  public constructor( providedOptions: WavePlotChartNodeOptions ) {

    const initialX = providedOptions.x ?? 0;
    const initialY = providedOptions.y ?? 0;

    const options = optionize<WavePlotChartNodeOptions, SelfOptions, NodeOptions>()( {
      cursor: 'pointer',
      x: undefined,
      y: undefined
    }, providedOptions );

    super( options );

    const chartArea = new Rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT, {
      fill: 'white',
      stroke: AXIS_COLOR,
      lineWidth: 1
    } );

    for ( let i = 1; i < NUM_DIVISIONS; i++ ) {
      const y = ( i / NUM_DIVISIONS ) * CHART_HEIGHT;
      chartArea.addChild( new Line( 0, y, CHART_WIDTH, y, {
        stroke: GRID_LINE_COLOR,
        lineWidth: 0.5,
        lineDash: i === NUM_DIVISIONS / 2 ? [ 4, 4 ] : []
      } ) );
    }
    for ( let i = 1; i < NUM_DIVISIONS; i++ ) {
      const x = ( i / NUM_DIVISIONS ) * CHART_WIDTH;
      chartArea.addChild( new Line( x, 0, x, CHART_HEIGHT, {
        stroke: GRID_LINE_COLOR,
        lineWidth: 0.5
      } ) );
    }

    this.dataPath = new Path( null, {
      stroke: 'black',
      lineWidth: 1.5,
      lineJoin: 'round',
      clipArea: Shape.rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT ),
      boundsMethod: 'none',
      localBounds: chartArea.localBounds
    } );
    chartArea.addChild( this.dataPath );

    const yAxisLabel = new Text( options.yAxisLabelStringProperty, {
      font: LABEL_FONT,
      rotation: -Math.PI / 2,
      fill: AXIS_COLOR,
      maxWidth: CHART_HEIGHT - 10
    } );

    const xAxisLabel = new Text( options.xAxisLabelStringProperty, {
      font: LABEL_FONT,
      fill: AXIS_COLOR,
      maxWidth: CHART_WIDTH - 10
    } );

    const chartPanel = new Node( { children: [ chartArea ] } );

    yAxisLabel.right = -PADDING;
    yAxisLabel.centerY = CHART_HEIGHT / 2;
    chartPanel.addChild( yAxisLabel );

    xAxisLabel.centerX = CHART_WIDTH / 2;
    xAxisLabel.top = CHART_HEIGHT + 3;
    chartPanel.addChild( xAxisLabel );

    // Fixed bounds: the rotated y-axis label's width is constant (≈ font height), and
    // xAxisLabel height is constant, so these bounds are stable across locales.
    const shadedBackground = new ShadedRectangle(
      new Bounds2(
        -PADDING - LABEL_FONT.numericSize - PADDING,
        -PADDING,
        CHART_WIDTH + PADDING,
        CHART_HEIGHT + 3 + LABEL_FONT.numericSize + PADDING
      )
    );

    this.children = [ shadedBackground, chartPanel ];

    this.positionProperty = new Vector2Property( new Vector2( initialX, initialY ) );
    this.positionProperty.link( position => {
      this.x = position.x;
      this.y = position.y;
    } );

    this.addInputListener( new DragListener( { positionProperty: this.positionProperty } ) );
  }

  public resetPosition(): void {
    this.positionProperty.reset();
  }

  public static readonly CHART_WIDTH = CHART_WIDTH;
  public static readonly CHART_HEIGHT = CHART_HEIGHT;
}
