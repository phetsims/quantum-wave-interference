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
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import AccessibleDraggableOptions from '../../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import ProbeNode from '../../../../scenery-phet/js/ProbeNode.js';
import SoundDragListener from '../../../../scenery-phet/js/SoundDragListener.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import WireNode from '../../../../scenery-phet/js/WireNode.js';
import InteractiveHighlightingNode from '../../../../scenery/js/accessibility/voicing/nodes/InteractiveHighlightingNode.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { getDisplayedWaveValue, type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import { waveDisplayModePolarityProperty } from '../model/WaveModeDisplayPolarity.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import TimePlotDataSeries from './TimePlotDataSeries.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import WavePlotChartNode, { MEASUREMENT_PLOT_CHART_HEIGHT, type WavePlotChartNodeOptions, type WavePlotDataPoint } from './WavePlotChartNode.js';

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

// Keyboard drag deltas in view pixels per key press, consistent with other draggable tools in this sim.
const PROBE_KEYBOARD_DRAG_DELTA = 8;
const PROBE_KEYBOARD_SHIFT_DRAG_DELTA = 2;

export default class TimePlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  private readonly chartNode: WavePlotChartNode;
  private readonly dataSeries: TimePlotDataSeries;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly probeNode: Node;

  // Position of the probe's crosshair (sensor center) in the parent frame, which is the exact point
  // sampled for the time plot. Public so the accessible view state can report the sampled point.
  public readonly probePositionProperty: Vector2Property;
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
    super( {
      isDisposable: false,
      visibleProperty: visibleProperty,
      accessibleParagraph: QuantumWaveInterferenceFluent.a11y.timePlot.accessibleParagraph.createProperty( {
        waveDisplayMode: activeDisplayModeProperty
      } ),
      tandem: tandem
    } );

    this.sceneProperty = sceneProperty;
    this.activeDisplayModeProperty = activeDisplayModeProperty;
    this.plotTandem = tandem;
    this.dataSeries = new TimePlotDataSeries( {
      tandem: tandem.createTandem( 'dataSeries' ),
      stateAppliedListener: () => this.updateChart()
    } );

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    this.waveRegionBounds = new Bounds2(
      waveRegionX,
      waveRegionY,
      waveRegionX + waveRegionWidth,
      waveRegionY + waveRegionHeight
    );
    this.visibleBoundsProperty = visibleBoundsProperty;

    this.maxDisplayValueProperty = new TinyProperty( 1 );

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

      // ProbeNode's origin is the center of its sensor (the crosshair), so use translation rather than
      // center — the handle extends below the sensor, which would otherwise shift the crosshair upward.
      this.probeNode.translation = position;
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

    // Probe first: it selects the sampled point, while the chart panel is only repositioned.
    this.pdomOrder = [ this.probeNode, this.chartNode ];
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
    return new WavePlotChartNode( combineOptions<WavePlotChartNodeOptions>( {
      accessibleName: QuantumWaveInterferenceFluent.a11y.timePlot.chart.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.timePlot.chart.accessibleHelpTextStringProperty
    }, AccessibleDraggableOptions, {
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
    } ) );
  }

  /**
   * Creates the draggable crosshair probe that selects the wave-region point sampled by the chart.
   * The probe is focusable and movable with both the pointer and the keyboard.
   */
  private createCrosshairProbe(): Node {
    const probe = new InteractiveHighlightingNode( combineOptions<NodeOptions>( {
      cursor: 'pointer',
      children: [
        new ProbeNode( {
          color: PROBE_COLOR,
          sensorTypeFunction: ProbeNode.crosshairs( { stroke: CROSSHAIR_STROKE_COLOR } ),
          scale: PROBE_SCALE
        } )
      ],
      accessibleName: QuantumWaveInterferenceFluent.a11y.timePlot.probe.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.timePlot.probe.accessibleHelpTextStringProperty
    }, AccessibleDraggableOptions ) );

    const dragBoundsProperty = new Property( this.waveRegionBounds );

    probe.addInputListener( new SoundDragListener( {
      positionProperty: this.probePositionProperty,
      dragBoundsProperty: dragBoundsProperty,
      useParentOffset: true,
      start: () => this.moveToFront(),
      tandem: this.plotTandem.createTandem( 'probeDragListener' )
    } ) );

    probe.addInputListener( new SoundKeyboardDragListener( {
      positionProperty: this.probePositionProperty,
      dragBoundsProperty: dragBoundsProperty,
      dragDelta: PROBE_KEYBOARD_DRAG_DELTA,
      shiftDragDelta: PROBE_KEYBOARD_SHIFT_DRAG_DELTA,
      start: () => this.moveToFront(),
      tandem: this.plotTandem.createTandem( 'probeKeyboardDragListener' )
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

  /**
   * Called each animation frame by the screen view with the model's effective dt (already scaled for
   * pause/speed and clamped). Skips sampling when the node is invisible or dt is non-positive.
   * When visible, delegates to TimePlotDataSeries to advance by fixed solver-time intervals so the
   * trace density is independent of browser frame timing, then redraws the chart only if new
   * samples were recorded.
   *
   * @param dt - effective simulation time step in seconds
   */
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

  /**
   * Gets the chart panel's origin in this node's parent frame, for agent-facing accessible view
   * state snapshots. Has no side effects.
   *
   * @returns the chart panel position
   */
  public getChartPosition(): Vector2 {
    return this.chartNode.positionProperty.value;
  }

  /**
   * Resets all mutable state: clears accumulated time-series samples, restores the probe to its
   * initial position, and restores the chart panel to its initial position. Called by the screen
   * view's reset-all handler.
   */
  public reset(): void {
    this.clearData();
    this.probePositionProperty.reset();
    this.chartNode.resetPosition();
  }
}
