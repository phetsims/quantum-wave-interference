// Copyright 2026, University of Colorado Boulder

/**
 * PositionPlotNode is a tool that shows the currently displayed wave quantity versus horizontal
 * position along a draggable horizontal dotted line across the wave visualization region.
 * It consists of a chart panel connected to a horizontal sampling line with a crosshair.
 *
 * Analogous to the WaveAreaGraphNode in wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
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
import getDisplayedWaveValue from '../model/getDisplayedWaveValue.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import WavePlotChartNode from './WavePlotChartNode.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';

const CROSSHAIR_RADIUS = 12;
const WIRE_LINE_WIDTH = 3;
const WIRE_NORMAL_DISTANCE = 25;
const DOTTED_LINE_DASH = [ 6, 4 ];
const MIN_Y_FRACTION = 0.02;
const MAX_Y_FRACTION = 0.98;

export default class PositionPlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly chartNode: WavePlotChartNode;

  // Normalized y-position of the horizontal line [0, 1] where 0 = top and 1 = bottom of the wave region
  private readonly lineYFractionProperty: NumberProperty;

  private readonly waveRegionX: number;
  private readonly waveRegionY: number;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    waveRegionX: number,
    waveRegionY: number,
    visibleProperty: TReadOnlyProperty<boolean>
  ) {
    super( { visibleProperty: visibleProperty } );

    this.sceneProperty = sceneProperty;
    this.waveRegionX = waveRegionX;
    this.waveRegionY = waveRegionY;

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

    this.lineYFractionProperty = new NumberProperty( 0.5, {
      range: new Range( MIN_Y_FRACTION, MAX_Y_FRACTION )
    } );

    const dottedLine = new Line( waveRegionX, 0, waveRegionX + waveRegionWidth, 0, {
      stroke: 'white',
      lineWidth: 1.5,
      lineDash: DOTTED_LINE_DASH,
      opacity: 0.7
    } );
    this.addChild( dottedLine );

    const crosshairNode = new Node( { cursor: 'ns-resize' } );
    const crosshairBg = new Circle( CROSSHAIR_RADIUS, {
      fill: 'rgba(0,0,0,0.2)',
      stroke: 'white',
      lineWidth: 2
    } );
    crosshairNode.addChild( crosshairBg );

    const lineOptions = { stroke: 'white', lineWidth: 2 };
    crosshairNode.addChild( new Line( -CROSSHAIR_RADIUS, 0, CROSSHAIR_RADIUS, 0, lineOptions ) );
    crosshairNode.addChild( new Line( 0, -CROSSHAIR_RADIUS, 0, CROSSHAIR_RADIUS, lineOptions ) );

    crosshairNode.x = waveRegionX + waveRegionWidth / 2;
    this.addChild( crosshairNode );

    const crosshairPositionProperty = new Vector2Property( new Vector2(
      waveRegionX + waveRegionWidth / 2,
      waveRegionY + waveRegionHeight * 0.5
    ) );

    const crosshairDragBounds = new Bounds2(
      waveRegionX + waveRegionWidth / 2,
      waveRegionY + waveRegionHeight * MIN_Y_FRACTION,
      waveRegionX + waveRegionWidth / 2,
      waveRegionY + waveRegionHeight * MAX_Y_FRACTION
    );

    crosshairNode.addInputListener( new DragListener( {
      positionProperty: crosshairPositionProperty,
      dragBoundsProperty: new Property( crosshairDragBounds )
    } ) );

    crosshairPositionProperty.link( position => {
      const fraction = clamp( ( position.y - waveRegionY ) / waveRegionHeight, MIN_Y_FRACTION, MAX_Y_FRACTION );
      this.lineYFractionProperty.value = fraction;
    } );

    this.lineYFractionProperty.link( fraction => {
      const viewY = waveRegionY + fraction * waveRegionHeight;
      dottedLine.y1 = viewY;
      dottedLine.y2 = viewY;
      crosshairNode.y = viewY;
      crosshairPositionProperty.value = new Vector2( crosshairPositionProperty.value.x, viewY );
    } );

    const yAxisLabelStringProperty = waveDisplayModeYAxisLabelProperty( sceneProperty );

    this.chartNode = new WavePlotChartNode( {
      yAxisLabelStringProperty: yAxisLabelStringProperty,
      xAxisLabelStringProperty: QuantumWaveInterferenceFluent.positionStringProperty,
      x: waveRegionX,
      y: waveRegionY + waveRegionHeight + 30
    } );
    this.addChild( this.chartNode );

    const chartConnectionProperty = new DerivedProperty(
      [ this.chartNode.boundsProperty ],
      bounds => bounds.leftCenter
    );
    const wireNormal1Property = new Vector2Property( new Vector2( -WIRE_NORMAL_DISTANCE, 0 ) );
    const wireNormal2Property = new Vector2Property( new Vector2( WIRE_NORMAL_DISTANCE, 0 ) );

    const wireNode = new WireNode( chartConnectionProperty, wireNormal1Property, crosshairPositionProperty, wireNormal2Property, {
      stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
      lineWidth: WIRE_LINE_WIDTH
    } );
    this.addChild( wireNode );
    wireNode.moveToBack();
  }

  public step(): void {
    if ( !this.visible ) {
      return;
    }

    const scene = this.sceneProperty.value;
    const solver = scene.waveSolver;
    const field = solver.getAmplitudeField();
    const gridWidth = solver.gridWidth;
    const gridHeight = solver.gridHeight;
    const displayMode = scene.activeWaveDisplayModeProperty.value;

    const gy = clamp( Math.floor( this.lineYFractionProperty.value * gridHeight ), 0, gridHeight - 1 );

    let maxAbsValue = 0;
    const values: number[] = [];

    for ( let gx = 0; gx < gridWidth; gx++ ) {
      const idx = ( gy * gridWidth + gx ) * 2;
      const re = field[ idx ];
      const im = field[ idx + 1 ];
      const value = getDisplayedWaveValue( re, im, displayMode );
      values.push( value );
      maxAbsValue = Math.max( maxAbsValue, Math.abs( value ) );
    }

    if ( maxAbsValue === 0 ) {
      this.chartNode.dataPath.shape = null;
      return;
    }

    const chartWidth = WavePlotChartNode.CHART_WIDTH;
    const chartHeight = WavePlotChartNode.CHART_HEIGHT;
    const shape = new Shape();
    for ( let i = 0; i < values.length; i++ ) {
      const x = ( i / ( values.length - 1 ) ) * chartWidth;
      const y = chartHeight / 2 - ( values[ i ] / maxAbsValue ) * ( chartHeight / 2 - 5 );

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
    this.chartNode.resetPosition();
  }
}
