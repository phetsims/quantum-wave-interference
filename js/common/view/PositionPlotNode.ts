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
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import Shape from '../../../../kite/js/Shape.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import getDisplayedWaveValue from '../model/getDisplayedWaveValue.js';
import getMaxDisplayedWaveValue from '../model/getMaxDisplayedWaveValue.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import WavePlotChartNode from './WavePlotChartNode.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import waveDisplayModePolarityProperty from './waveDisplayModePolarityProperty.js';

const WIRE_LINE_WIDTH = 3;
const DOTTED_LINE_DASH_LENGTH = 9;
const DOTTED_LINE_GAP_LENGTH = 5;
const DOTTED_LINE_DASH = [ DOTTED_LINE_DASH_LENGTH, DOTTED_LINE_GAP_LENGTH ];
const DOTTED_LINE_DASH_OFFSET = DOTTED_LINE_DASH_LENGTH / 2;
const MIN_Y_FRACTION = 0.1;
const MAX_Y_FRACTION = 0.9;
const PREVIOUS_DEFAULT_PANEL_GAP = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT / 2 + 26;
const PANEL_GAP = PREVIOUS_DEFAULT_PANEL_GAP * 0.08;
const LINE_HIT_AREA_HEIGHT = 16;
const POSITION_PLOT_PANEL_LEFT_PADDING = 8;
const POSITION_PLOT_PANEL_BOTTOM_PADDING = 8;
const POSITION_PLOT_PANEL_TOP_PADDING = 12;
const POSITION_PLOT_PANEL_RIGHT_PADDING = 12;

// Position curve samples per chart pixel. Sampling analytically at view resolution avoids stretching
// the solver visualization grid into visibly jagged chart segments.
const POSITION_PLOT_SAMPLES_PER_PIXEL = 2;

export default class PositionPlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly chartNode: WavePlotChartNode;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly updatePlotLayout: () => void;

  // Normalized y-position of the horizontal line [0, 1] where 0 = top and 1 = bottom of the wave region
  private readonly lineYFractionProperty: NumberProperty;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    waveRegionX: number,
    waveRegionY: number,
    visibleProperty: TReadOnlyProperty<boolean>
  ) {
    super( { isDisposable: false, visibleProperty: visibleProperty } );

    this.sceneProperty = sceneProperty;

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

    this.lineYFractionProperty = new NumberProperty( 0.5, {
      range: new Range( MIN_Y_FRACTION, MAX_Y_FRACTION )
    } );

    const yAxisLabelStringProperty = waveDisplayModeYAxisLabelProperty( sceneProperty );
    const polarityProperty = waveDisplayModePolarityProperty( sceneProperty );
    const activeDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, WaveVisualizableScene>( sceneProperty, {
      derive: 'activeWaveDisplayModeProperty'
    } );
    this.maxDisplayValueProperty = new DerivedProperty(
      [ activeDisplayModeProperty ],
      displayMode => getMaxDisplayedWaveValue( displayMode )
    );

    const dottedLine = new Line( waveRegionX, 0, waveRegionX + waveRegionWidth, 0, {
      stroke: 'white',
      lineWidth: 1.5,
      lineDash: DOTTED_LINE_DASH,
      lineDashOffset: DOTTED_LINE_DASH_OFFSET,
      opacity: 0.7
    } );
    this.addChild( dottedLine );

    const lineCenterX = waveRegionX + waveRegionWidth / 2;

    const lineHitArea = new Rectangle( waveRegionX, 0, waveRegionWidth, LINE_HIT_AREA_HEIGHT, {
      fill: 'rgba( 0, 0, 0, 0 )',
      cursor: 'ns-resize'
    } );
    this.addChild( lineHitArea );

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
    lineHitArea.addInputListener( verticalDragListener );

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
      stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
      lineWidth: WIRE_LINE_WIDTH
    } );
    this.addChild( wireLine );
    wireLine.moveToBack();

    this.updatePlotLayout = () => {
      const fraction = this.lineYFractionProperty.value;
      const viewY = waveRegionY + fraction * waveRegionHeight;
      dottedLine.y1 = viewY;
      dottedLine.y2 = viewY;
      lineHitArea.centerY = viewY;

      this.chartNode.top = viewY + PANEL_GAP;
      wireLine.x1 = lineCenterX;
      wireLine.x2 = lineCenterX;
      wireLine.y1 = this.chartNode.top;
      wireLine.y2 = viewY;
    };

    this.lineYFractionProperty.link( this.updatePlotLayout );

    this.addInputListener( {
      down: () => this.moveToFront()
    } );
  }

  public step(): void {
    if ( !this.visible ) {
      return;
    }

    const scene = this.sceneProperty.value;
    const solver = scene.waveSolver;
    const displayMode = scene.activeWaveDisplayModeProperty.value;
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
