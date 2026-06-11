// Copyright 2026, University of Colorado Boulder

/**
 * PositionPlotNode is a tool that shows the currently displayed wave quantity versus horizontal
 * position along a draggable horizontal aperture probe across the wave visualization region.
 * It consists of a full-width aperture probe, a fixed chart panel below that probe, and a short
 * vertical wire that visually connects them. The aperture probe's y-position selects a horizontal
 * row through the current scene's wave field; each frame, this node samples that row and redraws
 * the chart as wave quantity versus model x-position.
 *
 * Analogous to the WaveAreaGraphNode in wave-interference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import MappedProperty from '../../../../axon/js/MappedProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TinyProperty from '../../../../axon/js/TinyProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Shape from '../../../../kite/js/Shape.js';
import Orientation from '../../../../phet-core/js/Orientation.js';
import HighlightPath from '../../../../scenery/js/accessibility/HighlightPath.js';
import DragListener from '../../../../scenery/js/listeners/DragListener.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import AccessibleSlider, { type AccessibleSliderOptions } from '../../../../sun/js/accessibility/AccessibleSlider.js';
import ValueChangeSoundPlayer from '../../../../tambo/js/sound-generators/ValueChangeSoundPlayer.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { getDisplaySlitLayout } from '../getDisplaySlitLayout.js';
import { type BarrierType } from '../model/BarrierType.js';
import { hasDetectorOnBottomSlit, hasDetectorOnTopSlit, isBottomSlitCovered, isTopSlitCovered, type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { getDisplayedWaveValue, type WaveDisplayMode } from '../model/WaveDisplayMode.js';
import { type WaveDisplayModePolarity, waveDisplayModePolarityProperty } from '../model/WaveModeDisplayPolarity.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';
import waveDisplayModeYAxisLabelProperty from './waveDisplayModeYAxisLabelProperty.js';
import WavePlotChartNode, { MEASUREMENT_PLOT_CHART_HEIGHT, type WavePlotDataPoint } from './WavePlotChartNode.js';

const WIRE_WIDTH = 5;
const WIRE_EDGE_LINE_WIDTH = 1;

// The chart panel is tall, so the row selector is clamped away from the wave-region edges to keep more
// of the attached panel within the visible screen area without changing the chart panel dimensions.
const MIN_Y_FRACTION = 0.12;
const MAX_Y_FRACTION = 0.88;

// This gap is also the wire length. The chart panel is positioned from this value so shortening the
// wire moves the panel toward the aperture while preserving the sampled row position.
const APERTURE_TO_PANEL_GAP = 8;
const POSITION_PROBE_COLOR = '#808080';
const POSITION_PROBE_STROKE_COLOR = new Color( POSITION_PROBE_COLOR ).darkerColor( 0.7 );
const POSITION_PROBE_APERTURE_HEIGHT = 6;
const POSITION_PROBE_FRAME_THICKNESS = 3.5;
const POSITION_PROBE_SIDE_FRAME_WIDTH = 4;
const POSITION_PROBE_SIDE_FRAME_OVERLAP = 1;

// Hide the wave visualizer's right-edge stroke behind the aperture frame. The outer frame and hit
// target still span the full wave region plus side frames; only the transparent opening is inset.
const POSITION_PROBE_APERTURE_RIGHT_INSET = 1;
const POSITION_PROBE_CORNER_RADIUS = 5;
const POSITION_PLOT_PANEL_LEFT_PADDING = 8;
const POSITION_PLOT_PANEL_BOTTOM_PADDING = 8;
const POSITION_PLOT_PANEL_TOP_PADDING = 12;
const POSITION_PLOT_PANEL_RIGHT_PADDING = 12;

// Position curve samples per chart pixel. Sampling analytically at view resolution avoids stretching
// the solver visualization grid into visibly jagged chart segments.
const POSITION_PLOT_SAMPLES_PER_PIXEL = QuantumWaveInterferenceQueryParameters.positionPlotSamplesPerPixel;

// Boundaries between the qualitative row regions reported in the accessible value text, expressed as
// row fractions (0 = top of wave region). nearTop/nearBottom hug the draggable range limits and the
// center band is symmetric about 0.5.
const NEAR_TOP_MAX_FRACTION = 0.18;
const ABOVE_CENTER_MAX_FRACTION = 0.45;
const CENTER_MAX_FRACTION = 0.55;
const BELOW_CENTER_MAX_FRACTION = 0.82;

// Keyboard steps are in row-fraction units, spanning the [MIN_Y_FRACTION, MAX_Y_FRACTION] range.
const ROW_KEYBOARD_STEP = 0.05;
const ROW_SHIFT_KEYBOARD_STEP = 0.01;
const ROW_PAGE_KEYBOARD_STEP = 0.15;

const rowSoundPlayer = new ValueChangeSoundPlayer( new Range( MIN_Y_FRACTION, MAX_Y_FRACTION ) );

// Barrier state needed to describe whether the sampled row crosses a slit, and in what state that
// slit is. Grouped so the shared MeasurementToolsLayerNode can pass it through in one argument.
export type PositionPlotSlitProperties = {
  barrierTypeProperty: TReadOnlyProperty<BarrierType>;
  slitSeparationProperty: TReadOnlyProperty<number>;
  slitSeparationRangeProperty: TReadOnlyProperty<Range>;
  slitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

// The state of the slit (if any) crossed by the sampled row, used to select the accessible value text.
type CrossedSlitState = 'openSlit' | 'coveredSlit' | 'detectorSlit' | 'noSlit';

type ApertureProbeNodeOptions = NodeOptions & AccessibleSliderOptions;

class ApertureProbeNode extends AccessibleSlider( Node, 0 ) {
  public constructor( providedOptions: ApertureProbeNodeOptions ) {
    super( providedOptions );
  }
}

export default class PositionPlotNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene>;
  private readonly activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  private readonly chartNode: WavePlotChartNode;
  private readonly maxDisplayValueProperty: TReadOnlyProperty<number>;
  private readonly apertureProbeNode: ApertureProbeNode;
  private readonly interactionHighlight: HighlightPath;
  private readonly wireRectangle: Rectangle;
  private readonly wireLeftEdgeLine: Line;
  private readonly wireRightEdgeLine: Line;
  private readonly plotTandem: Tandem;
  private readonly waveRegionY: number;
  private readonly waveRegionHeight: number;
  private readonly lineCenterX: number;
  private readonly slitProperties: PositionPlotSlitProperties;

  // Normalized y-position of the horizontal line [0, 1] where 0 = top and 1 = bottom of the wave region.
  // Public so the accessible view state can report the sampled row for agent-facing testing.
  public readonly lineYFractionProperty: NumberProperty;

  public constructor(
    sceneProperty: TReadOnlyProperty<WaveVisualizableScene>,
    activeDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>,
    waveRegionX: number,
    waveRegionY: number,
    visibleProperty: TReadOnlyProperty<boolean>,
    slitProperties: PositionPlotSlitProperties,
    tandem: Tandem
  ) {
    super( {
      isDisposable: false,
      visibleProperty: visibleProperty,
      accessibleParagraph: QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleParagraph.createProperty( {
        waveDisplayMode: activeDisplayModeProperty
      } ),
      tandem: tandem
    } );

    this.sceneProperty = sceneProperty;
    this.activeDisplayModeProperty = activeDisplayModeProperty;
    this.slitProperties = slitProperties;
    this.plotTandem = tandem;

    const waveRegionWidth = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    this.waveRegionY = waveRegionY;
    this.waveRegionHeight = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
    this.lineCenterX = waveRegionX + waveRegionWidth / 2;

    this.lineYFractionProperty = new NumberProperty( 0.5, {
      range: new Range( MIN_Y_FRACTION, MAX_Y_FRACTION ),
      tandem: tandem.createTandem( 'lineYFractionProperty' )
    } );

    const yAxisLabelStringProperty = waveDisplayModeYAxisLabelProperty( activeDisplayModeProperty );
    const polarityProperty = waveDisplayModePolarityProperty( activeDisplayModeProperty );
    this.maxDisplayValueProperty = new TinyProperty( 1 );

    this.apertureProbeNode = this.createApertureProbeNode( waveRegionX, waveRegionWidth );
    this.addChild( this.apertureProbeNode );

    const verticalDragListener = this.createVerticalDragListener();
    this.apertureProbeNode.addInputListener( verticalDragListener );

    this.chartNode = this.createChartNode( waveRegionX, waveRegionWidth, yAxisLabelStringProperty, polarityProperty );
    this.addChild( this.chartNode );

    this.wireRectangle = new Rectangle( 0, 0, 0, 0, {
      fill: POSITION_PROBE_COLOR
    } );
    this.wireLeftEdgeLine = new Line( 0, 0, 0, 0, {
      stroke: POSITION_PROBE_STROKE_COLOR,
      lineWidth: WIRE_EDGE_LINE_WIDTH
    } );
    this.wireRightEdgeLine = new Line( 0, 0, 0, 0, {
      stroke: POSITION_PROBE_STROKE_COLOR,
      lineWidth: WIRE_EDGE_LINE_WIDTH
    } );
    const wireNode = new Node( {
      children: [ this.wireRectangle, this.wireLeftEdgeLine, this.wireRightEdgeLine ],
      pickable: false
    } );
    this.addChild( wireNode );
    wireNode.moveToBack();

    this.lineYFractionProperty.link( () => this.updateProbeChartAndWireLayout() );

    this.interactionHighlight = new HighlightPath( null );
    this.apertureProbeNode.setFocusHighlight( this.interactionHighlight );
    this.apertureProbeNode.setInteractiveHighlight( this.interactionHighlight );

    Multilink.multilink(
      [ this.apertureProbeNode.boundsProperty, this.chartNode.boundsProperty ],
      () => this.updateInteractionBounds()
    );

    this.addInputListener( {
      down: () => this.moveToFront()
    } );

    // The aperture probe is the single focusable element; the chart panel and wire are visual only.
    this.pdomOrder = [ this.apertureProbeNode ];
  }

  /**
   * Creates the input listener shared by both the aperture probe and the chart panel. Dragging
   * either visible part moves the single sampled horizontal row. `lineYFractionProperty` remains
   * the only source of truth so probe, chart, wire, and sampled model row cannot drift apart.
   */
  private createVerticalDragListener(): DragListener {
    let dragStartY = 0;
    let dragStartFraction = this.lineYFractionProperty.value;

    return new DragListener( {
      start: ( event, listener ) => {
        this.moveToFront();
        dragStartY = listener.parentPoint.y;
        dragStartFraction = this.lineYFractionProperty.value;
      },
      drag: ( event, listener ) => {
        const oldFraction = this.lineYFractionProperty.value;
        this.lineYFractionProperty.value = clamp(
          dragStartFraction + ( listener.parentPoint.y - dragStartY ) / this.waveRegionHeight,
          MIN_Y_FRACTION,
          MAX_Y_FRACTION
        );
        rowSoundPlayer.playSoundIfThresholdReached( this.lineYFractionProperty.value, oldFraction );
      },
      tandem: this.plotTandem.createTandem( 'verticalDragListener' )
    } );
  }

  /**
   * Creates the fixed-width chart panel that displays wave quantity versus horizontal model
   * position. The panel is not freely draggable; the shared vertical drag listener moves it
   * together with the aperture probe.
   *
   * @param waveRegionX - left edge of the wave visualization region
   * @param waveRegionWidth - width of the wave visualization region
   * @param yAxisLabelStringProperty - localized label for the active wave display quantity
   * @param polarityProperty - whether the active display quantity is unipolar or bipolar
   */
  private createChartNode(
    waveRegionX: number,
    waveRegionWidth: number,
    yAxisLabelStringProperty: TReadOnlyProperty<string>,
    polarityProperty: TReadOnlyProperty<WaveDisplayModePolarity>
  ): WavePlotChartNode {
    return new WavePlotChartNode( {
      yAxisLabelStringProperty: yAxisLabelStringProperty,
      xAxisLabelStringProperty: QuantumWaveInterferenceFluent.positionStringProperty,
      polarityProperty: polarityProperty,
      isDraggable: false,
      cursor: 'ns-resize',
      chartWidth: waveRegionWidth,
      chartHeight: MEASUREMENT_PLOT_CHART_HEIGHT,
      axisLabelFill: 'white',
      panelLeftPadding: POSITION_PLOT_PANEL_LEFT_PADDING,
      panelBottomPadding: POSITION_PLOT_PANEL_BOTTOM_PADDING,
      panelTopPadding: POSITION_PLOT_PANEL_TOP_PADDING,
      panelRightPadding: POSITION_PLOT_PANEL_RIGHT_PADDING,
      x: waveRegionX,
      y: this.waveRegionY + this.waveRegionHeight + 30,
      pickable: false,
      tandem: this.plotTandem.createTandem( 'chartNode' )
    } );
  }

  /**
   * Positions the aperture probe, chart panel, and connecting wire from lineYFractionProperty.
   * This runs immediately when the Property is linked and whenever the user drags vertically.
   */
  private updateProbeChartAndWireLayout(): void {
    const fraction = this.lineYFractionProperty.value;
    const viewY = this.waveRegionY + fraction * this.waveRegionHeight;
    this.apertureProbeNode.centerY = viewY;

    this.chartNode.top = this.apertureProbeNode.bottom + APERTURE_TO_PANEL_GAP;

    // Draw the wire as a filled rectangle with two side strokes instead of one stroked line so its
    // interior matches the aperture fill while its vertical edges match the aperture outline.
    const wireLeft = this.lineCenterX - WIRE_WIDTH / 2;
    const wireRight = this.lineCenterX + WIRE_WIDTH / 2;
    const wireTop = this.apertureProbeNode.bottom;
    const wireBottom = this.chartNode.top;
    this.wireRectangle.setRect( wireLeft, wireTop, WIRE_WIDTH, wireBottom - wireTop );
    this.wireLeftEdgeLine.setLine( wireLeft, wireTop, wireLeft, wireBottom );
    this.wireRightEdgeLine.setLine( wireRight, wireTop, wireRight, wireBottom );
  }

  /**
   * Synchronizes the pointer areas and highlights with the rectangular union of the aperture probe
   * and chart panel. The bounds are converted from their shared parent frame into the aperture
   * probe's local frame because it is the tool's single interactive and focusable Node.
   */
  private updateInteractionBounds(): void {
    const parentInteractionBounds = this.apertureProbeNode.bounds.union( this.chartNode.bounds );
    const localInteractionBounds = this.apertureProbeNode.parentToLocalBounds( parentInteractionBounds );

    this.apertureProbeNode.mouseArea = localInteractionBounds;
    this.apertureProbeNode.touchArea = localInteractionBounds;
    this.interactionHighlight.setShape( Shape.bounds( localInteractionBounds ) );
  }

  /**
   * Creates the aperture-shaped probe that spans the wave visualization. The opaque frame shows
   * which horizontal row is selected while the transparent middle keeps the wave field visible.
   * The probe is also the tool's single focusable element: an AccessibleSlider that moves the
   * sampled row up and down with the keyboard and reports a qualitative, slit-aware value text.
   *
   * @param waveRegionX - left edge of the wave visualization region
   * @param waveRegionWidth - width of the wave visualization region
   */
  private createApertureProbeNode( waveRegionX: number, waveRegionWidth: number ): ApertureProbeNode {
    const outerWidth = waveRegionWidth + 2 * POSITION_PROBE_SIDE_FRAME_WIDTH;
    const outerHeight = POSITION_PROBE_APERTURE_HEIGHT + 2 * POSITION_PROBE_FRAME_THICKNESS;
    const apertureLeft = POSITION_PROBE_SIDE_FRAME_WIDTH;
    const apertureTop = POSITION_PROBE_FRAME_THICKNESS;

    // Only the transparent aperture opening is narrowed; the right side frame grows by the same amount.
    const apertureWidth = waveRegionWidth - POSITION_PROBE_APERTURE_RIGHT_INSET;
    const apertureRight = apertureLeft + apertureWidth;
    const apertureBottom = apertureTop + POSITION_PROBE_APERTURE_HEIGHT;

    const fillOptions = {
      fill: POSITION_PROBE_COLOR
    };
    const outlineOptions = {
      fill: null,
      stroke: POSITION_PROBE_STROKE_COLOR,
      lineWidth: 1
    };

    // Slider-space value increases upward (pressing Up moves the row up), while lineYFractionProperty
    // increases downward. The range is symmetric about 0.5 (MIN + MAX = 1), so the same mirror mapping
    // works in both directions and the inverted range equals the original range.
    const sliderValueProperty = new MappedProperty( this.lineYFractionProperty, {
      bidirectional: true,
      map: ( fraction: number ) => MIN_Y_FRACTION + MAX_Y_FRACTION - fraction,
      inverseMap: ( value: number ) => MIN_Y_FRACTION + MAX_Y_FRACTION - value
    } );

    let previousSliderValue = sliderValueProperty.value;

    const apertureProbeNode = new ApertureProbeNode( {
      cursor: 'ns-resize',
      valueProperty: sliderValueProperty,
      enabledRangeProperty: new TinyProperty( new Range( MIN_Y_FRACTION, MAX_Y_FRACTION ) ),
      ariaOrientation: Orientation.VERTICAL,
      keyboardStep: ROW_KEYBOARD_STEP,
      shiftKeyboardStep: ROW_SHIFT_KEYBOARD_STEP,
      pageKeyboardStep: ROW_PAGE_KEYBOARD_STEP,
      constrainValue: ( value: number ) => clamp( value, MIN_Y_FRACTION, MAX_Y_FRACTION ),
      startDrag: () => {
        this.moveToFront();
        previousSliderValue = sliderValueProperty.value;
      },
      drag: () => {
        rowSoundPlayer.playSoundForValueChange( sliderValueProperty.value, previousSliderValue );
        previousSliderValue = sliderValueProperty.value;
      },
      accessibleName: QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleHelpTextStringProperty,
      createAriaValueText: ( value: number ) => this.createAccessibleRowValueText( value ),
      descriptionDependencies: Array.from( new Set( [
        this.slitProperties.barrierTypeProperty,
        this.slitProperties.slitSeparationProperty,
        this.slitProperties.slitSeparationRangeProperty,
        this.slitProperties.slitConfigurationProperty,
        ...QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleValue.getDependentProperties(),
        ...QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleRegion.getDependentProperties()
      ] ) ),
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
        new Rectangle( apertureRight, apertureTop - POSITION_PROBE_SIDE_FRAME_OVERLAP, outerWidth - apertureRight,
          POSITION_PROBE_APERTURE_HEIGHT + 2 * POSITION_PROBE_SIDE_FRAME_OVERLAP, fillOptions ),
        new Path( Shape.roundedRectangleWithRadii( 0, 0, outerWidth, outerHeight, {
          topLeft: POSITION_PROBE_CORNER_RADIUS,
          topRight: POSITION_PROBE_CORNER_RADIUS,
          bottomLeft: POSITION_PROBE_CORNER_RADIUS,
          bottomRight: POSITION_PROBE_CORNER_RADIUS
        } ), outlineOptions ),
        new Rectangle( apertureLeft, apertureTop, apertureWidth, POSITION_PROBE_APERTURE_HEIGHT, outlineOptions ),

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

  /**
   * Creates the screen-reader value text for the aperture probe slider. The text names the
   * qualitative vertical region of the sampled row and, when the double-slit barrier is present
   * and the row crosses a slit, the state of that slit (open, covered, or holding a detector).
   *
   * @param sliderValue - slider-space value, the mirror image of the row fraction (larger = higher)
   * @returns localized value text, e.g. "Above center of wave area, across open slit"
   */
  private createAccessibleRowValueText( sliderValue: number ): string {
    const fraction = MIN_Y_FRACTION + MAX_Y_FRACTION - sliderValue;

    const region = fraction <= NEAR_TOP_MAX_FRACTION ? 'nearTop' :
                   fraction < ABOVE_CENTER_MAX_FRACTION ? 'aboveCenter' :
                   fraction <= CENTER_MAX_FRACTION ? 'center' :
                   fraction < BELOW_CENTER_MAX_FRACTION ? 'belowCenter' :
                   'nearBottom';

    return QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleValue.format( {
      region: QuantumWaveInterferenceFluent.a11y.positionPlot.accessibleRegion.format( { region: region } ),
      slitState: this.getCrossedSlitState( fraction )
    } );
  }

  /**
   * Determines whether the sampled row crosses one of the barrier slits, and if so, in what state
   * that slit is. Uses the same display-slit geometry as DoubleSlitNode rendering, so the reported
   * state matches what a sighted user sees. The two slits never overlap vertically
   * (MIN_DISPLAY_SLIT_SEPARATION > DISPLAY_SLIT_WIDTH), so at most one slit can be crossed.
   *
   * @param fraction - normalized row position, 0 = top of the wave region
   * @returns state of the crossed slit, or 'noSlit' when no barrier or no slit at this row
   */
  private getCrossedSlitState( fraction: number ): CrossedSlitState {
    if ( this.slitProperties.barrierTypeProperty.value !== 'doubleSlit' ) {
      return 'noSlit';
    }

    const slitSeparationRange = this.slitProperties.slitSeparationRangeProperty.value;
    const layout = getDisplaySlitLayout(
      this.slitProperties.slitSeparationProperty.value,
      slitSeparationRange.min,
      slitSeparationRange.max,
      this.waveRegionHeight
    );

    const rowY = fraction * this.waveRegionHeight;
    const topSlitCenterY = this.waveRegionHeight / 2 - layout.displaySlitSeparation / 2;
    const bottomSlitCenterY = this.waveRegionHeight / 2 + layout.displaySlitSeparation / 2;
    const halfSlitWidth = layout.displaySlitWidth / 2;

    const slitConfiguration = this.slitProperties.slitConfigurationProperty.value;

    return Math.abs( rowY - topSlitCenterY ) <= halfSlitWidth ? (
             hasDetectorOnTopSlit( slitConfiguration ) ? 'detectorSlit' :
             isTopSlitCovered( slitConfiguration ) ? 'coveredSlit' :
             'openSlit'
           ) :
           Math.abs( rowY - bottomSlitCenterY ) <= halfSlitWidth ? (
             hasDetectorOnBottomSlit( slitConfiguration ) ? 'detectorSlit' :
             isBottomSlitCovered( slitConfiguration ) ? 'coveredSlit' :
             'openSlit'
           ) :
           'noSlit';
  }

  /**
   * Samples the selected horizontal row of the current scene and redraws the position chart.
   */
  public step(): void {
    if ( !this.visible ) {
      return;
    }

    this.updateChart( this.sceneProperty.value );
  }

  /**
   * Redraws the chart path from the current position-series samples.
   *
   * @param scene - scene containing the wave solver and model region dimensions to sample
   */
  private updateChart( scene: WaveVisualizableScene ): void {
    const points = this.createPositionPlotPoints( scene );
    this.chartNode.setDataPathFromPoints( points, 0, scene.regionWidth, this.maxDisplayValueProperty.value );
  }

  /**
   * Creates ordered model-space samples along the selected horizontal row. The x-coordinate spans
   * [ 0, scene.regionWidth ], and the value is converted from complex wave amplitude into the
   * currently selected display representation.
   *
   * @param scene - scene containing the wave solver and model region dimensions to sample
   */
  private createPositionPlotPoints( scene: WaveVisualizableScene ): WavePlotDataPoint[] {
    const solver = scene.waveSolver;
    const displayMode = this.activeDisplayModeProperty.value;
    const chartWidth = this.chartNode.chartWidth;
    const numSamples = chartWidth * POSITION_PLOT_SAMPLES_PER_PIXEL;
    const modelY = this.getSampleModelY( scene );
    const points: WavePlotDataPoint[] = [];

    for ( let i = 0; i <= numSamples; i++ ) {
      const fraction = i / numSamples;
      const modelX = fraction * scene.regionWidth;
      const value = solver.evaluate( modelX, modelY );
      const displayValue = getDisplayedWaveValue( value.real, value.imaginary, displayMode );
      points.push( { x: modelX, value: displayValue } );
    }

    return points;
  }

  /**
   * Converts the selected normalized view-row fraction into the scene's model y-coordinate. Model
   * y is centered vertically, so the top of the wave region maps to -regionHeight / 2 and the
   * bottom maps to +regionHeight / 2.
   *
   * @param scene - scene whose region height defines model coordinates
   */
  private getSampleModelY( scene: WaveVisualizableScene ): number {
    return this.lineYFractionProperty.value * scene.regionHeight - scene.regionHeight / 2;
  }

  /**
   * Restores the sampled row to the vertical center and clears the rendered chart until the next
   * animation step repopulates it.
   */
  public reset(): void {
    this.lineYFractionProperty.reset();
    this.chartNode.clearDataPath();
    this.updateProbeChartAndWireLayout();
  }
}
