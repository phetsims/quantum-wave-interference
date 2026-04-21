// Copyright 2026, University of Colorado Boulder

/**
 * TimePlotNode is a tool that shows the currently displayed wave quantity at a crosshair position
 * versus time. It consists of a draggable chart panel and a draggable crosshair probe connected
 * by a wire. The crosshair samples the amplitude field at its grid location each frame.
 *
 * Analogous to the WaveMeterNode in wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import Shape from '../../../../kite/js/Shape.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import getMaxDisplayedWaveValue from '../model/getMaxDisplayedWaveValue.js';
import getDisplayedWaveValue from '../model/getDisplayedWaveValue.js';
import { type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import WavePlotChartNode from './WavePlotChartNode.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import waveDisplayModePolarityProperty from './waveDisplayModePolarityProperty.js';

const CROSSHAIR_RADIUS = 15;
const WIRE_LINE_WIDTH = 3;
const WIRE_NORMAL_DISTANCE = 25;
const MAX_TIME_WINDOW = 1; // seconds of data shown
const MAX_SAMPLES = 300;
const TIME_PLOT_CHART_WIDTH = 190;
const TIME_PLOT_CHART_HEIGHT = 135;
const TIME_PLOT_PANEL_LEFT_PADDING = 8;
const TIME_PLOT_PANEL_BOTTOM_PADDING = 8;
const TIME_PLOT_PANEL_TOP_PADDING = 12;
const TIME_PLOT_PANEL_RIGHT_PADDING = 12;

type TimePlotDataPoint = {
  time: number;
  value: number;
};

export default class TimePlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly chartNode: WavePlotChartNode;
  private readonly timeSeries: TimePlotDataPoint[];
  private elapsedTime: number;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly probeNode: Node;
  private readonly probePositionProperty: Vector2Property;
  private readonly waveRegionBounds: Bounds2;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    waveRegionX: number,
    waveRegionY: number,
    visibleProperty: TReadOnlyProperty<boolean>
  ) {
    super( { isDisposable: false, visibleProperty: visibleProperty } );

    this.sceneProperty = sceneProperty;
    this.timeSeries = [];
    this.elapsedTime = 0;

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    this.waveRegionBounds = new Bounds2( waveRegionX, waveRegionY, waveRegionX + waveRegionWidth, waveRegionY + waveRegionHeight );

    const yAxisLabelStringProperty = waveDisplayModeYAxisLabelProperty( sceneProperty );
    const polarityProperty = waveDisplayModePolarityProperty( sceneProperty );
    const activeDisplayModeProperty = new DynamicProperty<WaveDisplayMode, WaveDisplayMode, WaveVisualizableScene>( sceneProperty, {
      derive: 'activeWaveDisplayModeProperty'
    } );

    this.maxDisplayValueProperty = new DerivedProperty(
      [ activeDisplayModeProperty ],
      displayMode => getMaxDisplayedWaveValue( displayMode )
    );

    this.chartNode = new WavePlotChartNode( {
      yAxisLabelStringProperty: yAxisLabelStringProperty,
      xAxisLabelStringProperty: QuantumWaveInterferenceFluent.timeStringProperty,
      polarityProperty: polarityProperty,
      chartWidth: TIME_PLOT_CHART_WIDTH,
      chartHeight: TIME_PLOT_CHART_HEIGHT,
      axisLabelFill: 'white',
      panelLeftPadding: TIME_PLOT_PANEL_LEFT_PADDING,
      panelBottomPadding: TIME_PLOT_PANEL_BOTTOM_PADDING,
      panelTopPadding: TIME_PLOT_PANEL_TOP_PADDING,
      panelRightPadding: TIME_PLOT_PANEL_RIGHT_PADDING,
      x: waveRegionX + waveRegionWidth - TIME_PLOT_CHART_WIDTH - 30,
      y: waveRegionY + waveRegionHeight - TIME_PLOT_CHART_HEIGHT - 40
    } );
    this.addChild( this.chartNode );

    this.probePositionProperty = new Vector2Property( new Vector2(
      waveRegionX + waveRegionWidth * 0.3,
      waveRegionY + waveRegionHeight * 0.4
    ) );

    this.probeNode = this.createCrosshairProbe();
    this.addChild( this.probeNode );

    this.probePositionProperty.link( position => {
      this.probeNode.center = position;
    } );

    const chartConnectionProperty = new DerivedProperty(
      [ this.chartNode.boundsProperty ],
      bounds => bounds.leftCenter
    );
    const wireNormal1Property = new Vector2Property( new Vector2( -WIRE_NORMAL_DISTANCE, 0 ) );
    const wireNormal2Property = new Vector2Property( new Vector2( WIRE_NORMAL_DISTANCE, 0 ) );

    const wireNode = new WireNode( chartConnectionProperty, wireNormal1Property, this.probePositionProperty, wireNormal2Property, {
      stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
      lineWidth: WIRE_LINE_WIDTH
    } );
    this.addChild( wireNode );
    wireNode.moveToBack();

    sceneProperty.link( () => this.clearData() );

    // Clear the accumulated time series when display mode changes so the trace restarts in the
    // newly selected representation.
    activeDisplayModeProperty.link( () => this.clearData() );
  }

  private createCrosshairProbe(): Node {
    const probe = new Node( { cursor: 'pointer' } );

    probe.addChild( new Circle( CROSSHAIR_RADIUS, {
      fill: 'rgba(0,0,0,0.2)',
      stroke: 'white',
      lineWidth: 2
    } ) );

    const lineOptions = { stroke: 'white', lineWidth: 2 };
    probe.addChild( new Line( -CROSSHAIR_RADIUS, 0, CROSSHAIR_RADIUS, 0, lineOptions ) );
    probe.addChild( new Line( 0, -CROSSHAIR_RADIUS, 0, CROSSHAIR_RADIUS, lineOptions ) );

    probe.addInputListener( new DragListener( {
      positionProperty: this.probePositionProperty,
      dragBoundsProperty: new Property( this.waveRegionBounds ),
      start: () => this.clearData()
    } ) );

    return probe;
  }

  public step( dt: number ): void {
    if ( !this.visible || dt <= 0 ) {
      return;
    }

    this.elapsedTime += dt;

    const scene = this.sceneProperty.value;
    const solver = scene.waveSolver;
    const field = solver.getAmplitudeField();
    const gridWidth = solver.gridWidth;
    const gridHeight = solver.gridHeight;

    const probePos = this.probePositionProperty.value;
    const gx = clamp( Math.floor( ( probePos.x - this.waveRegionBounds.minX ) / this.waveRegionBounds.width * gridWidth ), 0, gridWidth - 1 );
    const gy = clamp( Math.floor( ( probePos.y - this.waveRegionBounds.minY ) / this.waveRegionBounds.height * gridHeight ), 0, gridHeight - 1 );

    const idx = ( gy * gridWidth + gx ) * 2;
    const re = field[ idx ];
    const im = field[ idx + 1 ];
    const displayMode = scene.activeWaveDisplayModeProperty.value;
    const value = getDisplayedWaveValue( re, im, displayMode );

    this.timeSeries.push( { time: this.elapsedTime, value: value } );

    const minTime = this.elapsedTime - MAX_TIME_WINDOW;
    while ( this.timeSeries.length > 0 && this.timeSeries[ 0 ].time < minTime ) {
      this.timeSeries.shift();
    }
    while ( this.timeSeries.length > MAX_SAMPLES ) {
      this.timeSeries.shift();
    }

    this.updateChart();
  }

  private updateChart(): void {
    if ( this.timeSeries.length < 2 ) {
      this.chartNode.dataPath.shape = null;
      return;
    }

    const maxTime = this.timeSeries[ this.timeSeries.length - 1 ].time;
    const minTime = Math.max( 0, maxTime - MAX_TIME_WINDOW );
    const axisMaxTime = minTime + MAX_TIME_WINDOW;
    const chartWidth = this.chartNode.chartWidth;
    const scale = this.maxDisplayValueProperty.value;

    const shape = new Shape();
    for ( let i = 0; i < this.timeSeries.length; i++ ) {
      const point = this.timeSeries[ i ];
      const x = ( ( point.time - minTime ) / ( axisMaxTime - minTime ) ) * chartWidth;
      const y = this.chartNode.mapValueToY( point.value, scale );

      if ( i === 0 ) {
        shape.moveTo( x, y );
      }
      else {
        shape.lineTo( x, y );
      }
    }

    this.chartNode.dataPath.shape = shape;
  }

  private clearData(): void {
    this.timeSeries.length = 0;
    this.elapsedTime = 0;
    this.chartNode.dataPath.shape = null;
  }

  public reset(): void {
    this.clearData();
    this.probePositionProperty.reset();
    this.chartNode.resetPosition();
  }
}
