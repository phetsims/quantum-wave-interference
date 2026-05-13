// Copyright 2026, University of Colorado Boulder

/**
 * WavePlotChartNode is a reusable chart panel for wave measurement tools. It provides a white chart area
 * with grid lines, a data path, axis labels, and a ShadedRectangle background. Both TimePlotNode and
 * PositionPlotNode compose this node for their chart display.
 *
 * The chart's zero baseline is placed at the bottom for unipolar display modes (magnitude,
 * time-averaged intensity) and at the vertical center for bipolar modes (real, imaginary, electric
 * field). Consumers use `mapValueToY` to convert data values to chart-local y coordinates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
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
import { type WaveDisplayModePolarity } from '../model/getDisplayModePolarity.js';

const CHART_WIDTH = 150;
const CHART_HEIGHT = 110;
const LABEL_FONT = new PhetFont( 11 );
const GRID_LINE_COLOR = '#bbbdbf';
const AXIS_COLOR = '#808184';
const ZERO_LINE_COLOR = '#505054';
const NUM_X_DIVISIONS = 4;
const NUM_Y_DIVISIONS_UNIPOLAR = 4;
const NUM_Y_DIVISIONS_BIPOLAR = 4;
const DEFAULT_LEFT_PADDING = 4;
const DEFAULT_BOTTOM_PADDING = 4;
const DEFAULT_TOP_PADDING = 4;
const DEFAULT_RIGHT_PADDING = 4;
const DEFAULT_AXIS_LABEL_FILL = AXIS_COLOR;

type SelfOptions = {
  yAxisLabelStringProperty: TReadOnlyProperty<string>;
  xAxisLabelStringProperty: TReadOnlyProperty<string>;
  polarityProperty: TReadOnlyProperty<WaveDisplayModePolarity>;
  isDraggable?: boolean;
  chartWidth?: number;
  chartHeight?: number;
  axisLabelFill?: string;
  panelLeftPadding?: number;
  panelBottomPadding?: number;
  panelTopPadding?: number;
  panelRightPadding?: number;
};

//REVIEW https://github.com/phetsims/quantum-wave-interference/issues/27 ... = SelfOptions & StrictOmit<NodeOptions, 'cursor'>
type WavePlotChartNodeOptions = SelfOptions & NodeOptions;

export default class WavePlotChartNode extends Node {

  public readonly dataPath: Path;
  public readonly chartWidth: number;
  public readonly chartHeight: number;
  private readonly baselineYProperty: TReadOnlyProperty<number>;
  private readonly halfAmplitudeHeightProperty: TReadOnlyProperty<number>;
  private readonly positionProperty: Vector2Property;

  public constructor( providedOptions: WavePlotChartNodeOptions ) {

    const initialX = providedOptions.x ?? 0;
    const initialY = providedOptions.y ?? 0;

    const options = optionize<WavePlotChartNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false,
      cursor: 'pointer',
      isDraggable: true,
      chartWidth: CHART_WIDTH,
      chartHeight: CHART_HEIGHT,
      axisLabelFill: DEFAULT_AXIS_LABEL_FILL,
      panelLeftPadding: DEFAULT_LEFT_PADDING,
      panelBottomPadding: DEFAULT_BOTTOM_PADDING,
      panelTopPadding: DEFAULT_TOP_PADDING,
      panelRightPadding: DEFAULT_RIGHT_PADDING,
      x: undefined,
      y: undefined
    }, providedOptions );

    super( options );

    this.chartWidth = options.chartWidth;
    this.chartHeight = options.chartHeight;

    const chartArea = new Rectangle( 0, 0, this.chartWidth, this.chartHeight, {
      fill: 'white',
      stroke: AXIS_COLOR,
      lineWidth: 1
    } );

    const gridLayer = new Node();
    chartArea.addChild( gridLayer );

    for ( let i = 1; i < NUM_X_DIVISIONS; i++ ) {
      const x = ( i / NUM_X_DIVISIONS ) * this.chartWidth;
      gridLayer.addChild( new Line( x, 0, x, this.chartHeight, {
        stroke: GRID_LINE_COLOR,
        lineWidth: 0.5
      } ) );
    }

    // Horizontal grid lines + zero baseline — repopulate when polarity changes so gridlines
    // sit evenly above/below the current baseline.
    const horizontalLinesLayer = new Node();
    gridLayer.addChild( horizontalLinesLayer );

    const zeroLine = new Line( 0, 0, this.chartWidth, 0, {
      stroke: ZERO_LINE_COLOR,
      lineWidth: 1
    } );
    gridLayer.addChild( zeroLine );

    this.baselineYProperty = new DerivedProperty( [ options.polarityProperty ], polarity =>
      polarity === 'unipolar' ? this.chartHeight : this.chartHeight / 2
    );

    this.halfAmplitudeHeightProperty = new DerivedProperty( [ options.polarityProperty ], polarity =>
      polarity === 'unipolar' ? this.chartHeight - 5 : this.chartHeight / 2 - 5
    );

    options.polarityProperty.link( polarity => {
      horizontalLinesLayer.removeAllChildren();
      const divisions = polarity === 'unipolar' ? NUM_Y_DIVISIONS_UNIPOLAR : NUM_Y_DIVISIONS_BIPOLAR;

      if ( polarity === 'unipolar' ) {
        for ( let i = 1; i < divisions; i++ ) {
          const y = this.chartHeight - ( i / divisions ) * this.chartHeight;
          horizontalLinesLayer.addChild( new Line( 0, y, this.chartWidth, y, {
            stroke: GRID_LINE_COLOR,
            lineWidth: 0.5
          } ) );
        }
        zeroLine.y1 = this.chartHeight;
        zeroLine.y2 = this.chartHeight;
      }
      else {
        for ( let i = 1; i <= divisions / 2; i++ ) {
          const dy = ( i / ( divisions / 2 ) ) * ( this.chartHeight / 2 );
          if ( dy < this.chartHeight / 2 ) {
            horizontalLinesLayer.addChild( new Line( 0, this.chartHeight / 2 - dy, this.chartWidth, this.chartHeight / 2 - dy, {
              stroke: GRID_LINE_COLOR,
              lineWidth: 0.5
            } ) );
            horizontalLinesLayer.addChild( new Line( 0, this.chartHeight / 2 + dy, this.chartWidth, this.chartHeight / 2 + dy, {
              stroke: GRID_LINE_COLOR,
              lineWidth: 0.5
            } ) );
          }
        }
        zeroLine.y1 = this.chartHeight / 2;
        zeroLine.y2 = this.chartHeight / 2;
      }
    } );

    this.dataPath = new Path( null, {
      stroke: 'black',
      lineWidth: 1.5,
      lineJoin: 'round',
      lineCap: 'round',
      clipArea: Shape.rectangle( 0, 0, this.chartWidth, this.chartHeight ),
      boundsMethod: 'none',
      localBounds: chartArea.localBounds
    } );
    chartArea.addChild( this.dataPath );

    const yAxisLabel = new Text( options.yAxisLabelStringProperty, {
      font: LABEL_FONT,
      rotation: -Math.PI / 2,
      fill: options.axisLabelFill,
      maxWidth: this.chartHeight - 10
    } );

    const xAxisLabel = new Text( options.xAxisLabelStringProperty, {
      font: LABEL_FONT,
      fill: options.axisLabelFill,
      maxWidth: this.chartWidth - 10
    } );

    const chartPanel = new Node( { children: [ chartArea ] } );

    yAxisLabel.right = -options.panelLeftPadding;
    yAxisLabel.centerY = this.chartHeight / 2;
    chartPanel.addChild( yAxisLabel );

    xAxisLabel.centerX = this.chartWidth / 2;
    xAxisLabel.top = this.chartHeight + 3;
    chartPanel.addChild( xAxisLabel );

    // Fixed bounds: the rotated y-axis label's width is constant (≈ font height), and
    // xAxisLabel height is constant, so these bounds are stable across locales.
    const shadedBackground = new ShadedRectangle(
      new Bounds2(
        -options.panelLeftPadding - LABEL_FONT.numericSize - options.panelLeftPadding,
        -options.panelTopPadding,
        this.chartWidth + options.panelRightPadding,
        this.chartHeight + 3 + LABEL_FONT.numericSize + options.panelBottomPadding
      )
    );

    this.children = [ shadedBackground, chartPanel ];

    this.positionProperty = new Vector2Property( new Vector2( initialX, initialY ) );
    this.positionProperty.link( position => {
      this.x = position.x;
      this.y = position.y;
    } );

    if ( options.isDraggable ) {
      this.addInputListener( new DragListener( { positionProperty: this.positionProperty } ) );
    }
  }

  public resetPosition(): void {
    this.positionProperty.reset();
  }

  /**
   * Map a data value to its chart-local y coordinate, given the current amplitude scale.
   * Callers divide their own value by whatever scale they are tracking.
   */
  public mapValueToY( value: number, amplitudeScale: number ): number {
    return this.baselineYProperty.value - ( value / amplitudeScale ) * this.halfAmplitudeHeightProperty.value;
  }

  public static readonly CHART_WIDTH = CHART_WIDTH;
  public static readonly CHART_HEIGHT = CHART_HEIGHT;
}
