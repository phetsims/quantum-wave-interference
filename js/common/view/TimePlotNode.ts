// Copyright 2026, University of Colorado Boulder

/**
 * TimePlotNode is a tool that shows the currently displayed wave quantity at a crosshair position
 * versus time. It consists of a draggable chart panel and a draggable crosshair probe connected
 * by a wire. The crosshair samples the analytical wave field at fixed time intervals so the trace
 * does not depend on animation-frame timing.
 *
 * Analogous to the WaveMeterNode in wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import ProbeNode from '../../../../scenery-phet/js/ProbeNode.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { getDisplayedWaveValue, getMaxDisplayedWaveValue, type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import { waveDisplayModePolarityProperty } from '../model/WaveModeDisplayPolarity.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import TimePlotDataSeries from './TimePlotDataSeries.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import WavePlotChartNode, { MEASUREMENT_PLOT_CHART_HEIGHT, type WavePlotDataPoint } from './WavePlotChartNode.js';

const PROBE_COLOR = '#808080';
const WIRE_COLOR = new Color( PROBE_COLOR ).darkerColor( 0.7 );
const CROSSHAIR_STROKE_COLOR = 'white';
const PROBE_SCALE = 0.4;
const WIRE_LINE_WIDTH = 3;
const WIRE_NORMAL_DISTANCE = 25;
const WIRE_PANEL_ATTACHMENT_ABOVE_BOTTOM = 20;
const TIME_PLOT_CHART_WIDTH = 190;
const TIME_PLOT_PANEL_LEFT_PADDING = 8;
const TIME_PLOT_PANEL_BOTTOM_PADDING = 8;
const TIME_PLOT_PANEL_TOP_PADDING = 12;
const TIME_PLOT_PANEL_RIGHT_PADDING = 12;

export default class TimePlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  private readonly chartNode: WavePlotChartNode;
  private readonly dataSeries: TimePlotDataSeries;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly probeNode: Node;
  private readonly probePositionProperty: Vector2Property;
  private readonly plotTandem: Tandem;
  private readonly waveRegionBounds: Bounds2;
  private readonly visibleBoundsProperty: TReadOnlyProperty<Bounds2>;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>,
    waveRegionX: number,
    waveRegionY: number,
    visibleBoundsProperty: TReadOnlyProperty<Bounds2>,
    visibleProperty: TReadOnlyProperty<boolean>,
    tandem: Tandem
  ) {
    super( { isDisposable: false, visibleProperty: visibleProperty, tandem: tandem } );

    this.sceneProperty = sceneProperty;
    this.activeDisplayModeProperty = activeDisplayModeProperty;
    this.plotTandem = tandem;
    this.dataSeries = new TimePlotDataSeries();

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    this.waveRegionBounds = new Bounds2(
      waveRegionX,
      waveRegionY,
      waveRegionX + waveRegionWidth,
      waveRegionY + waveRegionHeight
    );
    this.visibleBoundsProperty = visibleBoundsProperty;

    this.maxDisplayValueProperty = new DerivedProperty(
      [ activeDisplayModeProperty ],
      displayMode => getMaxDisplayedWaveValue( displayMode )
    );

    this.chartNode = this.createChartNode( waveRegionX, waveRegionY, waveRegionWidth, waveRegionHeight );
    this.addChild( this.chartNode );

    this.probePositionProperty = new Vector2Property( new Vector2(
      waveRegionX + waveRegionWidth * 0.3,
      waveRegionY + waveRegionHeight * 0.4
    ), {
      tandem: tandem.createTandem( 'probePositionProperty' )
    } );

    this.probeNode = this.createCrosshairProbe();

    this.probePositionProperty.link( position => {
      this.probeNode.center = position;
    } );

    this.addChild( this.createWireNode() );
    this.addChild( this.probeNode );

    this.addInputListener( {
      down: () => this.moveToFront()
    } );

    sceneProperty.link( () => this.clearData() );

    // Clear the accumulated time series when display mode changes so the trace restarts in the
    // newly selected representation.
    activeDisplayModeProperty.link( () => this.clearData() );
  }

  /**
   * Creates the draggable chart panel that displays the time-series trace.
   *
   * @param waveRegionX - left edge of the wave visualization region
   * @param waveRegionY - top edge of the wave visualization region
   * @param waveRegionWidth - width of the wave visualization region
   * @param waveRegionHeight - height of the wave visualization region
   */
  private createChartNode(
    waveRegionX: number,
    waveRegionY: number,
    waveRegionWidth: number,
    waveRegionHeight: number
  ): WavePlotChartNode {
    return new WavePlotChartNode( {
      yAxisLabelStringProperty: waveDisplayModeYAxisLabelProperty( this.activeDisplayModeProperty ),
      xAxisLabelStringProperty: QuantumWaveInterferenceFluent.timeStringProperty,
      polarityProperty: waveDisplayModePolarityProperty( this.activeDisplayModeProperty ),
      dragBoundsProperty: this.visibleBoundsProperty,
      chartWidth: TIME_PLOT_CHART_WIDTH,
      chartHeight: MEASUREMENT_PLOT_CHART_HEIGHT,
      axisLabelFill: 'white',
      panelLeftPadding: TIME_PLOT_PANEL_LEFT_PADDING,
      panelBottomPadding: TIME_PLOT_PANEL_BOTTOM_PADDING,
      panelTopPadding: TIME_PLOT_PANEL_TOP_PADDING,
      panelRightPadding: TIME_PLOT_PANEL_RIGHT_PADDING,
      x: waveRegionX + waveRegionWidth - TIME_PLOT_CHART_WIDTH - 30,
      y: waveRegionY + waveRegionHeight - MEASUREMENT_PLOT_CHART_HEIGHT - 40,
      tandem: this.plotTandem.createTandem( 'chartNode' )
    } );
  }

  /**
   * Creates the draggable crosshair probe that selects the wave-region point sampled by the chart.
   */
  private createCrosshairProbe(): Node {
    const probe = new ProbeNode( {
      color: PROBE_COLOR,
      cursor: 'pointer',
      sensorTypeFunction: ProbeNode.crosshairs( { stroke: CROSSHAIR_STROKE_COLOR } ),
      scale: PROBE_SCALE
    } );

    probe.addInputListener( new DragListener( {
      positionProperty: this.probePositionProperty,
      dragBoundsProperty: new Property( this.waveRegionBounds ),
      useParentOffset: true,
      start: () => this.moveToFront(),
      tandem: this.plotTandem.createTandem( 'probeDragListener' )
    } ) );

    return probe;
  }

  /**
   * Creates the wire connecting the chart panel to the crosshair probe.
   */
  private createWireNode(): WireNode {
    const chartConnectionProperty = new DerivedProperty(
      [ this.chartNode.boundsProperty ],
      bounds => bounds.leftBottom.plusXY( 0, -WIRE_PANEL_ATTACHMENT_ABOVE_BOTTOM )
    );
    const probeConnectionProperty = new DerivedProperty(
      [ this.probeNode.boundsProperty ],
      bounds => bounds.centerBottom
    );
    const wireNormal1Property = new Vector2Property( new Vector2( -WIRE_NORMAL_DISTANCE, 0 ) );
    const wireNormal2Property = new Vector2Property( new Vector2( 0, WIRE_NORMAL_DISTANCE ) );

    return new WireNode( chartConnectionProperty, wireNormal1Property, probeConnectionProperty, wireNormal2Property, {
      stroke: WIRE_COLOR,
      lineWidth: WIRE_LINE_WIDTH
    } );
  }

  public step( dt: number ): void {
    if ( !this.visible || dt <= 0 ) {
      return;
    }

    const scene = this.sceneProperty.value;
    const solver = scene.waveSolver;
    const currentSolverTime = solver.getTime();

    // Sample at fixed solver-time intervals instead of once per animation frame so trace density
    // and phase history are independent of browser frame timing.
    const didStep = this.dataSeries.stepAtSolverTime( currentSolverTime, solverTime =>
      this.getDisplayedProbeValue( scene, solverTime )
    );
    if ( didStep ) {
      this.updateChart();
    }
  }

  /**
   * Converts the crosshair probe's view position to the scene's model coordinates.
   *
   * @param scene - scene whose region dimensions define model coordinates
   */
  private getProbeModelPosition( scene: WaveVisualizableScene ): Vector2 {
    const probePos = this.probePositionProperty.value;
    const normalizedX = clamp( ( probePos.x - this.waveRegionBounds.minX ) / this.waveRegionBounds.width, 0, 1 );
    const normalizedY = clamp( ( probePos.y - this.waveRegionBounds.minY ) / this.waveRegionBounds.height, 0, 1 );

    const x = normalizedX * scene.regionWidth;
    const y = normalizedY * scene.regionHeight - scene.regionHeight / 2;
    return new Vector2( x, y );
  }

  /**
   * Samples the scene's wave field at the probe position and converts it to the active display mode.
   *
   * @param scene - scene containing the wave solver to sample
   * @param solverTime - solver time for the requested sample
   */
  private getDisplayedProbeValue( scene: WaveVisualizableScene, solverTime: number ): number {
    const modelPosition = this.getProbeModelPosition( scene );
    const value = scene.waveSolver.evaluate( modelPosition.x, modelPosition.y, solverTime );
    const displayMode = this.activeDisplayModeProperty.value;
    return getDisplayedWaveValue( value.real, value.imaginary, displayMode );
  }

  /**
   * Redraws the chart path from the current time-series points.
   */
  private updateChart(): void {
    const points = this.dataSeries.points;
    if ( points.length < 2 ) {
      this.chartNode.clearDataPath();
      return;
    }

    const scale = this.maxDisplayValueProperty.value;
    const timeRange = this.dataSeries.getChartTimeRange();
    const chartPoints: WavePlotDataPoint[] = points.map( point => ( {
      x: point.time,
      value: point.value
    } ) );
    this.chartNode.setDataPathFromPoints( chartPoints, timeRange.minTime, timeRange.maxTime, scale );
  }

  /**
   * Clears the stored time samples and the rendered chart path.
   */
  private clearData(): void {
    this.dataSeries.reset();
    this.chartNode.clearDataPath();
  }

  public reset(): void {
    this.clearData();
    this.probePositionProperty.reset();
    this.chartNode.resetPosition();
  }
}
