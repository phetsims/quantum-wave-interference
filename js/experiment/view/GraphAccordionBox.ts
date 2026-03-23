// Copyright 2026, University of Colorado Boulder

/**
 * GraphAccordionBox shows a graph below the front-facing detector screen. In Average Intensity mode, it displays
 * a smooth intensity curve vs horizontal position. In Hits mode, it displays a histogram of hit counts binned
 * into 100 bins. A MagnifyingGlassZoomButtonGroup to the right controls the y-axis zoom level.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../../common/QuantumWaveInterferenceConstants.js';
import ExperimentConstants from '../ExperimentConstants.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';

// Chart dimensions — width matches the front-facing detector screen.
const CHART_WIDTH = ExperimentConstants.DETECTOR_SCREEN_WIDTH;
const CHART_HEIGHT = 103;

// Number of bins for the histogram in Hits mode
const HISTOGRAM_BINS = 100;

// Grid line styling
const graphGridLineColorProperty = QuantumWaveInterferenceColors.graphGridLineColorProperty;

type SelfOptions = {
  // Shared expandedProperty so that switching scenes preserves the accordion box open/closed state,
  // per the design requirement that scene changes should not affect the graph accordion box state.
  expandedProperty: Property<boolean>;
};

type GraphAccordionBoxOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class GraphAccordionBox extends Node {
  private readonly accordionBox: AccordionBox;
  private readonly zoomLevelProperty: NumberProperty;

  private readonly chartBackground: Rectangle;
  public readonly zoomButtonGroup: MagnifyingGlassZoomButtonGroup;

  public constructor( sceneModel: SceneModel, providedOptions: GraphAccordionBoxOptions ) {
    const options = optionize<GraphAccordionBoxOptions, SelfOptions, NodeOptions>()(
      {},
      providedOptions
    );

    super( options );

    // Zoom level for the y-axis
    // Start fully zoomed in so Hits mode opens at maximum vertical magnification.
    const zoomRange = new RangeWithValue( 1, 6, 6 );
    this.zoomLevelProperty = new NumberProperty( zoomRange.defaultValue, {
      range: zoomRange,
      tandem: providedOptions.tandem.createTandem( 'zoomLevelProperty' ),
      numberType: 'Integer'
    } );

    // White chart background with border
    this.chartBackground = new Rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    } );
    const chartBackground = this.chartBackground;

    // Grid lines matching the design mockup: evenly-spaced horizontal and vertical lines
    // create a grid that helps correlate graph peaks with detector screen positions.

    // Horizontal grid lines (4 divisions)
    const NUM_HORIZONTAL_GRID_LINES = 4;
    for ( let i = 1; i < NUM_HORIZONTAL_GRID_LINES; i++ ) {
      const y = ( i / NUM_HORIZONTAL_GRID_LINES ) * CHART_HEIGHT;
      chartBackground.addChild(
        new Line( 0, y, CHART_WIDTH, y, {
          stroke: graphGridLineColorProperty,
          lineWidth: 0.5
        } )
      );
    }

    // Vertical grid lines (10 divisions, matching the design's evenly-spaced vertical gridlines).
    // The center line (i=5) uses a dashed style to distinguish it as the axis of symmetry.
    const NUM_VERTICAL_DIVISIONS = 10;
    for ( let i = 1; i < NUM_VERTICAL_DIVISIONS; i++ ) {
      const x = ( i / NUM_VERTICAL_DIVISIONS ) * CHART_WIDTH;
      const isCenterLine = i === NUM_VERTICAL_DIVISIONS / 2;
      chartBackground.addChild(
        new Line( x, 0, x, CHART_HEIGHT, {
          stroke: graphGridLineColorProperty,
          lineWidth: isCenterLine ? 0.75 : 0.5,
          lineDash: isCenterLine ? [ 4, 4 ] : []
        } )
      );
    }

    // Curve/histogram path, clipped to the chart area
    const dataPath = new Path( null, {
      clipArea: Shape.rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT )
    } );
    // Prevent bounds recomputation on every update for performance
    dataPath.computeShapeBounds = () => chartBackground.bounds;

    // Y-axis label that changes based on detection mode, positioned to the left of the chart.
    // Depends on both the detection mode and the string properties for proper locale change support.
    const yAxisLabelStringProperty = new DerivedProperty(
      [
        sceneModel.detectionModeProperty,
        QuantumWaveInterferenceFluent.countStringProperty,
        QuantumWaveInterferenceFluent.intensityStringProperty
      ],
      ( detectionMode, countString, intensityString ) =>
        detectionMode === 'hits' ? countString : intensityString
    );
    const yAxisLabel = new Text( yAxisLabelStringProperty, {
      font: new PhetFont( 11 ),
      rotation: -Math.PI / 2,
      maxWidth: CHART_HEIGHT
    } );

    const chartNode = new Node( {
      children: [ yAxisLabel, chartBackground, dataPath ]
    } );

    // Title text changes dynamically based on detection mode: "Intensity Graph" vs "Hits Graph".
    // Must depend on all three properties so the title updates on both mode change and locale change.
    const titleStringProperty = new DerivedProperty(
      [
        sceneModel.detectionModeProperty,
        QuantumWaveInterferenceFluent.hitsGraphStringProperty,
        QuantumWaveInterferenceFluent.intensityGraphStringProperty
      ],
      ( detectionMode, hitsGraphString, intensityGraphString ) =>
        detectionMode === 'hits' ? hitsGraphString : intensityGraphString
    );
    const titleText = new Text( titleStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 120
    } );

    // Create the accordion box, using the shared expandedProperty so that all scenes'
    // graph accordion boxes stay in sync (per the design: scene changes should not affect
    // the accordion box open/closed state).
    this.accordionBox = new AccordionBox( chartNode, {
      titleNode: titleText,
      titleAlignX: 'left',
      expandedProperty: options.expandedProperty,
      fill: QuantumWaveInterferenceColors.panelFillProperty,
      stroke: QuantumWaveInterferenceColors.graphAccordionBoxStrokeProperty,
      cornerRadius: 5,
      contentXMargin: 8,
      contentYMargin: 6,
      contentYSpacing: 0,
      buttonXMargin: 8,
      buttonYMargin: 6,
      minWidth: CHART_WIDTH + 16, // contentXMargin * 2

      // Match the title-bar color to the panel gray used in the rest of the UI.
      titleBarOptions: {
        fill: QuantumWaveInterferenceColors.panelFillProperty
      },
      tandem: providedOptions.tandem.createTandem( 'accordionBox' )
    } );
    this.addChild( this.accordionBox );

    // Zoom buttons to the right of the accordion box, top-aligned per the design spec.
    this.zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.zoomLevelProperty, {
      orientation: 'vertical',
      spacing: 8,
      left: this.accordionBox.right + QuantumWaveInterferenceConstants.INTERNAL_PADDING,
      buttonOptions: {
        baseColor: QuantumWaveInterferenceColors.snapshotButtonBaseColorProperty
      },
      magnifyingGlassNodeOptions: {
        glassRadius: 8
      },
      tandem: providedOptions.tandem.createTandem( 'zoomButtonGroup' )
    } );
    this.addChild( this.zoomButtonGroup );

    const updateZoomButtonLayout = () => {
      const collapsibleSectionTop = this.globalToLocalBounds(
        chartNode.localToGlobalBounds( chartNode.localBounds )
      ).top;
      this.zoomButtonGroup.top = collapsibleSectionTop;
    };

    // Hide zoom buttons when collapsed, and keep top-aligned with the collapsible section when expanded.
    this.accordionBox.expandedProperty.link( expanded => {
      this.zoomButtonGroup.visible = expanded;
      if ( expanded ) {
        updateZoomButtonLayout();
      }
    } );
    this.accordionBox.localBoundsProperty.link( () => {
      if ( this.accordionBox.expandedProperty.value ) {
        updateZoomButtonLayout();
      }
    } );

    // Update the graph when data changes
    const updateGraph = () => {
      const isHitsMode = sceneModel.detectionModeProperty.value === 'hits';

      if ( isHitsMode ) {
        this.paintHistogram( dataPath, sceneModel );
      }
 else {
        this.paintIntensityCurve( dataPath, sceneModel );
      }
      // Position y-axis label to the left of the chart, vertically centered
      yAxisLabel.right = chartBackground.left - 4;
      yAxisLabel.centerY = CHART_HEIGHT / 2;
    };

    // Wire up updates
    sceneModel.hitsChangedEmitter.addListener( updateGraph );
    sceneModel.detectionModeProperty.link( () => updateGraph() );
    this.zoomLevelProperty.link( () => updateGraph() );
    sceneModel.slitSeparationProperty.link( () => updateGraph() );
    sceneModel.screenDistanceProperty.link( () => updateGraph() );
    sceneModel.slitSettingProperty.link( () => updateGraph() );
    sceneModel.intensityProperty.link( () => updateGraph() );

    // For photons, wavelength changes affect the intensity curve
    if ( sceneModel.sourceType === 'photons' ) {
      sceneModel.wavelengthProperty.link( () => updateGraph() );
    }
 else {
      sceneModel.velocityProperty.link( () => updateGraph() );
    }
  }

  /**
   * Paints the intensity curve as a filled area chart for Average Intensity mode.
   * Uses the theoretical interference pattern (via sceneModel.getIntensityAtPosition) to produce
   * the smooth, clean curve shown in the design mockup (IntensityGraph.svg). The theoretical curve
   * provides immediate, accurate feedback when students change wavelength, slit geometry, or other
   * parameters, directly supporting the learning goal: "Predict qualitatively and quantitatively
   * how changing wavelength, particle properties, or slit geometry affects the observed pattern."
   *
   * The curve opacity scales with accumulated data so that the graph builds up over time,
   * matching the design requirement that time controls affect the intensity aggregation rate.
   */
  private paintIntensityCurve( dataPath: Path, sceneModel: SceneModel ): void {
    const maxBin = sceneModel.intensityBinsMax;

    if ( maxBin === 0 ) {
      dataPath.shape = null;
      return;
    }

    const zoomScale = Utils.linear( 1, 6, 0.3, 2.0, this.zoomLevelProperty.value );
    const sourceIntensity = sceneModel.intensityProperty.value;
    const screenHalfWidth = sceneModel.screenHalfWidth;

    // Number of sample points across the chart for a smooth theoretical curve
    const NUM_SAMPLES = 1000;
    const shape = new Shape();

    // Start at the bottom-left corner of the chart
    const firstX = ( 0.5 / NUM_SAMPLES ) * CHART_WIDTH;
    shape.moveTo( firstX, CHART_HEIGHT );

    // Trace the theoretical intensity curve across the chart
    for ( let i = 0; i < NUM_SAMPLES; i++ ) {
      const fraction = ( i + 0.5 ) / NUM_SAMPLES; // Center of each sample
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth; // Map to physical position
      const intensity = sceneModel.getIntensityAtPosition( physicalX );

      const viewX = fraction * CHART_WIDTH;
      const viewY = CHART_HEIGHT - intensity * sourceIntensity * CHART_HEIGHT * zoomScale;

      shape.lineTo( viewX, viewY );
    }

    // Close back to the baseline to form a filled area
    const lastX = ( ( NUM_SAMPLES - 0.5 ) / NUM_SAMPLES ) * CHART_WIDTH;
    shape.lineTo( lastX, CHART_HEIGHT );
    shape.close();

    dataPath.shape = shape;
    dataPath.lineWidth = 1.5;

    // Opacity scales with total accumulated hits, so the curve builds up over time.
    // Uses a logarithmic scale so the curve becomes visible quickly but continues
    // to saturate smoothly as more data accumulates.
    const totalHits = sceneModel.totalHitsProperty.value;
    const opacityScale = Math.min( 1, Math.log10( totalHits + 1 ) / 2 );

    // Fill and stroke with colors matching the source type. For photons, use the
    // wavelength-derived color so the graph visually matches the detector screen display
    // and the histogram bars (which already use wavelength-dependent colors).
    if ( sceneModel.sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value );
      dataPath.fill = color.withAlpha( 0.3 * opacityScale );
      dataPath.stroke = color.darkerColor( 0.5 ).withAlpha( 0.8 * opacityScale );
    }
 else {
      dataPath.fill = `rgba(100,100,180,${0.3 * opacityScale})`;
      dataPath.stroke = `rgba(50,50,130,${0.8 * opacityScale})`;
    }
  }

  /**
   * Paints the histogram (bar chart) on the data path for Hits mode.
   * Downsamples from the model's pre-accumulated intensityBins (200 bins) to HISTOGRAM_BINS (100),
   * avoiding the O(n) cost of re-binning all hits from scratch each frame.
   */
  private paintHistogram( dataPath: Path, sceneModel: SceneModel ): void {
    const modelBins = sceneModel.intensityBins;
    const modelBinCount = modelBins.length;

    if ( sceneModel.intensityBinsMax === 0 ) {
      dataPath.shape = null;
      return;
    }

    // Downsample from model bins (200) to histogram bins (100): each histogram bin
    // sums 2 model bins, giving the same distribution without iterating all hits.
    const binsPerHistogramBin = modelBinCount / HISTOGRAM_BINS;
    const bins = new Array<number>( HISTOGRAM_BINS ).fill( 0 );
    for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
      const startBin = Math.floor( i * binsPerHistogramBin );
      const endBin = Math.floor( ( i + 1 ) * binsPerHistogramBin );
      for ( let j = startBin; j < endBin; j++ ) {
        bins[ i ] += modelBins[ j ];
      }
    }

    // Zoom scaling determines vertical pixels per count. Keep the same number of zoom
    // levels, and make each adjacent level differ by exactly a factor of 2.
    // At max zoom, each additional count increases bar height by exactly one bar width in pixels.
    const maxZoomLevel = this.zoomLevelProperty.range.max;
    const zoomStepsFromMax = maxZoomLevel - this.zoomLevelProperty.value;
    const zoomScale = Math.pow( 2, -zoomStepsFromMax );
    const binWidth = CHART_WIDTH / HISTOGRAM_BINS;

    const shape = new Shape();

    for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
      if ( bins[ i ] > 0 ) {
        // Fixed count-to-height mapping (no auto-scaling by current peak bin).
        const barHeight = Math.min( CHART_HEIGHT, bins[ i ] * binWidth * zoomScale );
        const x = i * binWidth;
        const y = CHART_HEIGHT - barHeight;

        shape.moveTo( x, CHART_HEIGHT );
        shape.lineTo( x, y );
        shape.lineTo( x + binWidth, y );
        shape.lineTo( x + binWidth, CHART_HEIGHT );
        shape.close();
      }
    }

    dataPath.shape = shape;
    dataPath.lineWidth = 0.5;

    // Histogram bar color matches the source type. For photons, use the wavelength-derived
    // color so the graph visually matches the detector screen display and reinforces the
    // wavelength-color connection that supports the learning goals.
    if ( sceneModel.sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( sceneModel.wavelengthProperty.value );
      dataPath.fill = color.withAlpha( 0.7 );
      dataPath.stroke = color.darkerColor( 0.5 ).withAlpha( 0.8 );
    }
 else {
      dataPath.fill = QuantumWaveInterferenceColors.particleHistogramFillProperty;
      dataPath.stroke = QuantumWaveInterferenceColors.particleHistogramStrokeProperty;
    }
  }

  public reset(): void {
    this.zoomLevelProperty.reset();
  }
}
