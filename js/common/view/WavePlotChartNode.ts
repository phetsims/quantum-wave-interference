// Copyright 2026, University of Colorado Boulder

/**
 * WavePlotChartNode is a reusable chart panel for wave measurement tools. It provides a white chart area
 * with grid lines, a data path, axis labels, and a ShadedRectangle background. Both TimePlotNode and
 * PositionPlotNode compose this node for their chart display.
 *
 * The chart's zero baseline is placed at the bottom for the unipolar amplitude display mode and at
 * the vertical center for bipolar modes (real, imaginary, electric field). Callers push data via
 * `setDataPathFromPoints`, passing raw model values and an amplitude scale.
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
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import ShadedRectangle from '../../../../scenery-phet/js/ShadedRectangle.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import InteractiveHighlighting from '../../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { type WaveDisplayModePolarity } from '../model/WaveModeDisplayPolarity.js';

const CHART_WIDTH = 150;
const CHART_HEIGHT = 110;

// Chart height used by the measurement-tool plots (TimePlotNode, PositionPlotNode). Taller than
// the default CHART_HEIGHT so the wave detail is easier to read at the measurement-tool scale.
export const MEASUREMENT_PLOT_CHART_HEIGHT = 135;
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

  // Container bounds (e.g., the ScreenView's visibleBoundsProperty) within which the entire panel is
  // kept while dragging. The panel's own extent is inset so the whole panel — not just its origin —
  // stays inside, and it is nudged back in when these bounds shrink. Null means unconstrained.
  dragBoundsProperty?: TReadOnlyProperty<Bounds2> | null;
  chartWidth?: number;
  chartHeight?: number;
  axisLabelFill?: string;
  panelLeftPadding?: number;
  panelBottomPadding?: number;
  panelTopPadding?: number;
  panelRightPadding?: number;
};

/**
 * Options for WavePlotChartNode. Extend NodeOptions and require a tandem for PhET-iO. Callers can
 * override chart dimensions, padding, axis labels, polarity, and draggability.
 */
export type WavePlotChartNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

/**
 * A single sample for the wave plot. `x` is the model-space horizontal coordinate (e.g., time in
 * seconds for a time plot, or position in meters for a position plot). `value` is the wave
 * amplitude at that coordinate in model units (e.g., electric-field magnitude, real part, etc.).
 */
export type WavePlotDataPoint = {
  x: number;
  value: number;
};

export default class WavePlotChartNode extends InteractiveHighlighting( Node ) {

  private readonly dataPath: Path;
  public readonly chartWidth: number;
  private readonly chartHeight: number;
  private readonly baselineYProperty: TReadOnlyProperty<number>;
  private readonly halfAmplitudeHeightProperty: TReadOnlyProperty<number>;

  // Panel origin in the parent frame. Public so tools can report the panel position in accessible view state.
  public readonly positionProperty: Vector2Property;
  private dataPathShape: Shape | null = null;
  private dataPathPoints: Vector2[] = [];

  public constructor( providedOptions: WavePlotChartNodeOptions ) {

    const initialX = providedOptions.x ?? 0;
    const initialY = providedOptions.y ?? 0;

    const options = optionize<WavePlotChartNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false,
      cursor: 'pointer', // can be overridden by clients

      // Visibility is controlled by the parent measurement tool (e.g., the tool checkbox), and there is no
      // reason to hide the chart independently, so its visibleProperty is not instrumented for PhET-iO.
      phetioVisiblePropertyInstrumented: false,
      isDraggable: true,
      dragBoundsProperty: null,
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
      maxWidth: this.chartHeight * 0.9
    } );

    const xAxisLabel = new Text( options.xAxisLabelStringProperty, {
      font: LABEL_FONT,
      fill: options.axisLabelFill,
      maxWidth: this.chartWidth * 0.75
    } );

    const chartPanel = new Node( { children: [ chartArea ] } );

    // The y-axis label string is dynamic (depends on display mode and locale), so re-assert its
    // position whenever its bounds change to keep it centered along (and inset from) the chart.
    yAxisLabel.localBoundsProperty.link( () => {
      yAxisLabel.right = -options.panelLeftPadding;
      yAxisLabel.centerY = this.chartHeight / 2;
    } );
    chartPanel.addChild( yAxisLabel );

    // The x-axis label string is dynamic (locale), so re-assert its position whenever its bounds
    // change to keep it horizontally centered under the chart.
    xAxisLabel.localBoundsProperty.link( () => {
      xAxisLabel.centerX = this.chartWidth / 2;
      xAxisLabel.top = this.chartHeight + 3;
    } );
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

    this.positionProperty = new Vector2Property( new Vector2( initialX, initialY ), {
      tandem: options.tandem.createTandem( 'positionProperty' ),
      phetioState: options.isDraggable
    } );
    this.positionProperty.link( position => {
      this.x = position.x;
      this.y = position.y;
    } );

    if ( options.isDraggable ) {

      const containerBoundsProperty = options.dragBoundsProperty;

      // Inset the container bounds by the panel's own extent (relative to its origin) so the whole
      // panel — not just its origin — stays inside, mirroring StopwatchNode. Recomputed when the
      // panel bounds or container bounds change, and translation-invariant so dragging the panel
      // within bounds does not spuriously change it.
      const adjustedDragBoundsProperty = containerBoundsProperty ? new DerivedProperty(
        [ this.boundsProperty, containerBoundsProperty ],
        ( thisBounds, containerBounds ) => {

          // Origin in the parent frame, so the offsets correctly account for any scaling/rotation.
          const targetOriginInParentCoordinates = this.localToParentPoint( Vector2.ZERO );

          return new Bounds2(
            containerBounds.minX - ( thisBounds.minX - targetOriginInParentCoordinates.x ),
            containerBounds.minY - ( thisBounds.minY - targetOriginInParentCoordinates.y ),
            containerBounds.maxX - ( thisBounds.maxX - targetOriginInParentCoordinates.x ),
            containerBounds.maxY - ( thisBounds.maxY - targetOriginInParentCoordinates.y )
          );
        }, {
          valueComparisonStrategy: 'equalsFunction' // Avoid spurious changes; usually the bounds are unchanged.
        }
      ) : null;

      // If the container shrinks (e.g., window resize) and leaves the panel outside, nudge it back in.
      adjustedDragBoundsProperty && adjustedDragBoundsProperty.link( dragBounds => {
        if ( !dragBounds.containsPoint( this.positionProperty.value ) ) {
          this.positionProperty.value = dragBounds.closestPointTo( this.positionProperty.value );
        }
      } );

      this.addInputListener( new SoundDragListener( {
        positionProperty: this.positionProperty,
        dragBoundsProperty: adjustedDragBoundsProperty,
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );

      this.addInputListener( new SoundKeyboardDragListener( {
        positionProperty: this.positionProperty,
        dragBoundsProperty: adjustedDragBoundsProperty,
        dragDelta: 10,
        shiftDragDelta: 2,
        tandem: options.tandem.createTandem( 'keyboardDragListener' )
      } ) );
    }
  }

  public resetPosition(): void {
    this.positionProperty.reset();
  }

  /**
   * Updates the data path from model-space x/value points. The x-values are mapped linearly from
   * [ xMin, xMax ] into the chart width, and values are mapped with mapValueToY().
   *
   * @param points - ordered samples to draw
   * @param xMin - model-space x-value at the left edge of the chart
   * @param xMax - model-space x-value at the right edge of the chart
   * @param amplitudeScale - value corresponding to the chart's full vertical scale
   */
  public setDataPathFromPoints(
    points: readonly WavePlotDataPoint[],
    xMin: number,
    xMax: number,
    amplitudeScale: number
  ): void {
    if ( points.length < 2 || xMax === xMin ) {
      this.clearDataPath();
      return;
    }

    this.ensureDataPathShape( points.length );
    for ( let i = 0; i < points.length; i++ ) {
      const point = points[ i ];
      const x = ( ( point.x - xMin ) / ( xMax - xMin ) ) * this.chartWidth;
      const y = this.mapValueToY( point.value, amplitudeScale );
      this.dataPathPoints[ i ].setXY( x, y );
    }

    this.dataPathShape!.invalidatePoints();

    if ( this.dataPath.shape === null ) {
      this.dataPath.shape = this.dataPathShape;
    }
  }

  /**
   * Clears the chart's data path.
   */
  public clearDataPath(): void {
    this.dataPath.shape = null;
  }

  /**
   * Ensures the retained mutable data path has the required point topology. Rebuilds the Shape only
   * when the number of plotted points changes; otherwise the existing Vector2 points are reused.
   *
   * NOTE: This is a performance critical hotspot, and re-creating a new Shape each frame is too expensive on Chromebook.
   *
   * @param pointCount - number of points required for the plotted polyline
   */
  private ensureDataPathShape( pointCount: number ): void {
    if ( this.dataPathPoints.length === pointCount ) {
      return;
    }

    const shape = new Shape();
    const shapePoints = [];
    for ( let i = 0; i < pointCount; i++ ) {

      // Use nondegenerate initial segments so Kite preserves the line topology for later point mutation.
      const point = new Vector2( i, 0 );
      shapePoints.push( point );

      if ( i === 0 ) {
        shape.moveToPoint( point );
      }
      else {
        shape.lineToPoint( point );
      }
    }

    this.dataPathShape = shape;
    this.dataPathPoints = shapePoints;
    this.dataPath.shape = shape;
  }

  /**
   * Maps a model-space data value to a chart-local y coordinate. The value is normalized by
   * amplitudeScale and then scaled to the chart's half-amplitude height, measured downward from the
   * current baseline (bottom of the chart for unipolar, vertical center for bipolar).
   */
  private mapValueToY( value: number, amplitudeScale: number ): number {
    return this.baselineYProperty.value - ( value / amplitudeScale ) * this.halfAmplitudeHeightProperty.value;
  }
}
