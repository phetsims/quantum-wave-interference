// Copyright 2026, University of Colorado Boulder

/**
 * PositionPlotNode is a tool that shows the currently displayed wave quantity versus horizontal
 * position along a draggable horizontal dotted line across the wave visualization region.
 * It consists of a chart panel connected to a horizontal sampling line.
 *
 * Analogous to the WaveAreaGraphNode in wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Shape from '../../../../kite/js/Shape.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import getDisplayedWaveValue from '../model/getDisplayedWaveValue.js';
import getMaxDisplayedWaveValue from '../model/getMaxDisplayedWaveValue.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import waveDisplayModePolarityProperty from './waveDisplayModePolarityProperty.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import WavePlotChartNode from './WavePlotChartNode.js';

const WIRE_LINE_WIDTH = 3;
const MIN_Y_FRACTION = 0.1;
const MAX_Y_FRACTION = 0.9;
const APERTURE_TO_PANEL_GAP = 18;
const POSITION_PROBE_COLOR = '#808080';
const POSITION_PROBE_STROKE_COLOR = new Color( POSITION_PROBE_COLOR ).darkerColor( 0.7 );
const POSITION_PROBE_APERTURE_HEIGHT = 9.6;
const POSITION_PROBE_FRAME_THICKNESS = 7;
const POSITION_PROBE_SIDE_FRAME_WIDTH = 8;
const POSITION_PROBE_SIDE_FRAME_OVERLAP = 1;
const POSITION_PROBE_CORNER_RADIUS = 5;
const POSITION_PLOT_PANEL_LEFT_PADDING = 8;
const POSITION_PLOT_PANEL_BOTTOM_PADDING = 8;
const POSITION_PLOT_PANEL_TOP_PADDING = 12;
const POSITION_PLOT_PANEL_RIGHT_PADDING = 12;

// Position curve samples per chart pixel. Sampling analytically at view resolution avoids stretching
// the solver visualization grid into visibly jagged chart segments.
const POSITION_PLOT_SAMPLES_PER_PIXEL = 2;

export default class PositionPlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  private readonly chartNode: WavePlotChartNode;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly updatePlotLayout: () => void;

  // Normalized y-position of the horizontal line [0, 1] where 0 = top and 1 = bottom of the wave region
  private readonly lineYFractionProperty: NumberProperty;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>,
    waveRegionX: number,
    waveRegionY: number,
    visibleProperty: TReadOnlyProperty<boolean>
  ) {
    super( { isDisposable: false, visibleProperty: visibleProperty } );

    this.sceneProperty = sceneProperty;
    this.activeDisplayModeProperty = activeDisplayModeProperty;

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

    this.lineYFractionProperty = new NumberProperty( 0.5, {
      range: new Range( MIN_Y_FRACTION, MAX_Y_FRACTION )
    } );

    const yAxisLabelStringProperty = waveDisplayModeYAxisLabelProperty( activeDisplayModeProperty );
    const polarityProperty = waveDisplayModePolarityProperty( activeDisplayModeProperty );
    this.maxDisplayValueProperty = new DerivedProperty(
      [ activeDisplayModeProperty ],
      displayMode => getMaxDisplayedWaveValue( displayMode )
    );

    const apertureProbeNode = PositionPlotNode.createApertureProbeNode( waveRegionX, waveRegionWidth );
    this.addChild( apertureProbeNode );

    const lineCenterX = waveRegionX + waveRegionWidth / 2;

    let dragStartY = 0;
    let dragStartFraction = this.lineYFractionProperty.value;
    const verticalDragListener = new DragListener( {
      start: ( event, listener ) => {
        this.moveToFront();
        dragStartY = listener.parentPoint.y;
        dragStartFraction = this.lineYFractionProperty.value;
      },
      drag: ( event, listener ) => {
        this.lineYFractionProperty.value = clamp(
          dragStartFraction + ( listener.parentPoint.y - dragStartY ) / waveRegionHeight,
          MIN_Y_FRACTION,
          MAX_Y_FRACTION
        );
      }
    } );
    apertureProbeNode.addInputListener( verticalDragListener );

    this.chartNode = new WavePlotChartNode( {
      yAxisLabelStringProperty: yAxisLabelStringProperty,
      xAxisLabelStringProperty: QuantumWaveInterferenceFluent.positionStringProperty,
      polarityProperty: polarityProperty,
      isDraggable: false,
      cursor: 'ns-resize',
      chartWidth: waveRegionWidth,
      axisLabelFill: 'white',
      panelLeftPadding: POSITION_PLOT_PANEL_LEFT_PADDING,
      panelBottomPadding: POSITION_PLOT_PANEL_BOTTOM_PADDING,
      panelTopPadding: POSITION_PLOT_PANEL_TOP_PADDING,
      panelRightPadding: POSITION_PLOT_PANEL_RIGHT_PADDING,
      x: waveRegionX,
      y: waveRegionY + waveRegionHeight + 30
    } );
    this.chartNode.addInputListener( verticalDragListener );
    this.addChild( this.chartNode );

    const wireLine = new Line( lineCenterX, 0, lineCenterX, 0, {
      stroke: POSITION_PROBE_STROKE_COLOR,
      lineWidth: WIRE_LINE_WIDTH
    } );
    this.addChild( wireLine );
    wireLine.moveToBack();

    this.updatePlotLayout = () => {
      const fraction = this.lineYFractionProperty.value;
      const viewY = waveRegionY + fraction * waveRegionHeight;
      apertureProbeNode.centerY = viewY;

      this.chartNode.top = apertureProbeNode.bottom + APERTURE_TO_PANEL_GAP;
      wireLine.x1 = lineCenterX;
      wireLine.x2 = lineCenterX;
      wireLine.y1 = this.chartNode.top;
      wireLine.y2 = apertureProbeNode.bottom;
    };

    this.lineYFractionProperty.link( this.updatePlotLayout );

    this.addInputListener( {
      down: () => this.moveToFront()
    } );
  }

  private static createApertureProbeNode( waveRegionX: number, waveRegionWidth: number ): Node {
    const outerWidth = waveRegionWidth + 2 * POSITION_PROBE_SIDE_FRAME_WIDTH;
    const outerHeight = POSITION_PROBE_APERTURE_HEIGHT + 2 * POSITION_PROBE_FRAME_THICKNESS;
    const apertureLeft = POSITION_PROBE_SIDE_FRAME_WIDTH;
    const apertureTop = POSITION_PROBE_FRAME_THICKNESS;
    const apertureRight = apertureLeft + waveRegionWidth;
    const apertureBottom = apertureTop + POSITION_PROBE_APERTURE_HEIGHT;

    const fillOptions = {
      fill: POSITION_PROBE_COLOR
    };
    const outlineOptions = {
      fill: null,
      stroke: POSITION_PROBE_STROKE_COLOR,
      lineWidth: 1
    };

    const apertureProbeNode = new Node( {
      cursor: 'ns-resize',
      children: [
        new Path( Shape.roundedRectangleWithRadii( 0, 0, outerWidth, POSITION_PROBE_FRAME_THICKNESS, {
          topLeft: POSITION_PROBE_CORNER_RADIUS,
          topRight: POSITION_PROBE_CORNER_RADIUS
        } ), fillOptions ),
        new Path( Shape.roundedRectangleWithRadii( 0, apertureBottom, outerWidth, POSITION_PROBE_FRAME_THICKNESS, {
          bottomLeft: POSITION_PROBE_CORNER_RADIUS,
          bottomRight: POSITION_PROBE_CORNER_RADIUS
        } ), fillOptions ),
        new Rectangle( 0, apertureTop - POSITION_PROBE_SIDE_FRAME_OVERLAP, POSITION_PROBE_SIDE_FRAME_WIDTH,
          POSITION_PROBE_APERTURE_HEIGHT + 2 * POSITION_PROBE_SIDE_FRAME_OVERLAP, fillOptions ),
        new Rectangle( apertureRight, apertureTop - POSITION_PROBE_SIDE_FRAME_OVERLAP, POSITION_PROBE_SIDE_FRAME_WIDTH,
          POSITION_PROBE_APERTURE_HEIGHT + 2 * POSITION_PROBE_SIDE_FRAME_OVERLAP, fillOptions ),
        new Path( Shape.roundedRectangleWithRadii( 0, 0, outerWidth, outerHeight, {
          topLeft: POSITION_PROBE_CORNER_RADIUS,
          topRight: POSITION_PROBE_CORNER_RADIUS,
          bottomLeft: POSITION_PROBE_CORNER_RADIUS,
          bottomRight: POSITION_PROBE_CORNER_RADIUS
        } ), outlineOptions ),
        new Rectangle( apertureLeft, apertureTop, waveRegionWidth, POSITION_PROBE_APERTURE_HEIGHT, outlineOptions ),

        // Invisible hit target. The center remains visually transparent so the wave field is visible
        // through the aperture.
        new Rectangle( 0, 0, outerWidth, outerHeight, {
          fill: 'rgba( 0, 0, 0, 0 )',
          cursor: 'ns-resize'
        } )
      ]
    } );

    apertureProbeNode.left = waveRegionX - POSITION_PROBE_SIDE_FRAME_WIDTH;

    return apertureProbeNode;
  }

  public step(): void {
    if ( !this.visible ) {
      return;
    }

    const scene = this.sceneProperty.value;
    const solver = scene.waveSolver;
    const displayMode = this.activeDisplayModeProperty.value;
    const scale = this.maxDisplayValueProperty.value;
    const chartWidth = this.chartNode.chartWidth;
    const numSamples = chartWidth * POSITION_PLOT_SAMPLES_PER_PIXEL;
    const modelY = this.lineYFractionProperty.value * scene.regionHeight - scene.regionHeight / 2;
    const shape = new Shape();

    for ( let i = 0; i <= numSamples; i++ ) {
      const fraction = i / numSamples;
      const modelX = fraction * scene.regionWidth;
      const value = solver.evaluate( modelX, modelY );
      const displayValue = getDisplayedWaveValue( value.real, value.imaginary, displayMode );
      const x = fraction * chartWidth;
      const y = this.chartNode.mapValueToY( displayValue, scale );

      if ( i === 0 ) {
        shape.moveTo( x, y );
      }
      else {
        shape.lineTo( x, y );
      }
    }

    this.chartNode.dataPath.shape = shape;
  }

  public reset(): void {
    this.lineYFractionProperty.reset();
    this.chartNode.dataPath.shape = null;
    this.updatePlotLayout();
  }
}
