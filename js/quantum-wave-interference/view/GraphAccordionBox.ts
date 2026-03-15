// Copyright 2026, University of Colorado Boulder

/**
 * GraphAccordionBox shows a graph below the front-facing detector screen. In Average Intensity mode, it displays
 * a smooth intensity curve vs horizontal position. In Hits mode, it displays a histogram of hit counts binned
 * into 40 bins. A MagnifyingGlassZoomButtonGroup to the right controls the y-axis zoom level.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import Utils from '../../../../dot/js/Utils.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import AccordionBox from '../../../../sun/js/AccordionBox.js';
import quantumWaveInterference from '../../quantumWaveInterference.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import SceneModel from '../model/SceneModel.js';
import DetectionMode from '../model/DetectionMode.js';
import SourceType from '../model/SourceType.js';

// Chart dimensions
const CHART_WIDTH = 217; // Same width as the front-facing detector screen
const CHART_HEIGHT = 80;

// Number of bins for the histogram in Hits mode
const HISTOGRAM_BINS = 40;

// Grid line styling
const GRID_LINE_COLOR = 'rgb(200,200,200)';

type SelfOptions = EmptySelfOptions;

type GraphAccordionBoxOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'>;

export default class GraphAccordionBox extends Node {

  private readonly accordionBox: AccordionBox;
  private readonly zoomLevelProperty: NumberProperty;

  public constructor( sceneModel: SceneModel, providedOptions: GraphAccordionBoxOptions ) {

    const options = optionize<GraphAccordionBoxOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Zoom level for the y-axis
    const zoomRange = new RangeWithValue( 1, 6, 3 );
    this.zoomLevelProperty = new NumberProperty( zoomRange.defaultValue, {
      range: zoomRange,
      tandem: providedOptions.tandem.createTandem( 'zoomLevelProperty' ),
      numberType: 'Integer'
    } );

    // White chart background with border
    const chartBackground = new Rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    } );

    // Grid lines matching the design mockup: evenly-spaced horizontal and vertical lines
    // create a grid that helps correlate graph peaks with detector screen positions.

    // Horizontal grid lines (4 divisions)
    const NUM_HORIZONTAL_GRID_LINES = 4;
    for ( let i = 1; i < NUM_HORIZONTAL_GRID_LINES; i++ ) {
      const y = ( i / NUM_HORIZONTAL_GRID_LINES ) * CHART_HEIGHT;
      chartBackground.addChild( new Line( 0, y, CHART_WIDTH, y, {
        stroke: GRID_LINE_COLOR,
        lineWidth: 0.5
      } ) );
    }

    // Vertical grid lines (10 divisions, matching the design's evenly-spaced vertical gridlines).
    // The center line (i=5) uses a dashed style to distinguish it as the axis of symmetry.
    const NUM_VERTICAL_DIVISIONS = 10;
    for ( let i = 1; i < NUM_VERTICAL_DIVISIONS; i++ ) {
      const x = ( i / NUM_VERTICAL_DIVISIONS ) * CHART_WIDTH;
      const isCenterLine = ( i === NUM_VERTICAL_DIVISIONS / 2 );
      chartBackground.addChild( new Line( x, 0, x, CHART_HEIGHT, {
        stroke: GRID_LINE_COLOR,
        lineWidth: isCenterLine ? 0.75 : 0.5,
        lineDash: isCenterLine ? [ 4, 4 ] : []
      } ) );
    }

    // Curve/histogram path, clipped to the chart area
    const dataPath = new Path( null, {
      clipArea: Shape.rectangle( 0, 0, CHART_WIDTH, CHART_HEIGHT )
    } );
    // Prevent bounds recomputation on every update for performance
    dataPath.computeShapeBounds = () => chartBackground.bounds;

    // Y-axis label that changes based on detection mode, positioned to the left of the chart
    const yAxisLabel = new Text( '', {
      font: new PhetFont( 11 ),
      rotation: -Math.PI / 2,
      maxWidth: CHART_HEIGHT
    } );

    const chartNode = new Node( {
      children: [ yAxisLabel, chartBackground, dataPath ]
    } );

    // Title text changes dynamically based on detection mode: "Intensity Graph" vs "Hits Graph"
    const titleStringProperty = new DerivedProperty(
      [ sceneModel.detectionModeProperty ],
      detectionMode => detectionMode === DetectionMode.HITS
                        ? QuantumWaveInterferenceFluent.hitsGraphStringProperty.value
                        : QuantumWaveInterferenceFluent.intensityGraphStringProperty.value
    );
    const titleText = new Text( titleStringProperty, {
      font: new PhetFont( 14 ),
      maxWidth: 120
    } );

    // Create the accordion box
    this.accordionBox = new AccordionBox( chartNode, {
      titleNode: titleText,
      titleAlignX: 'left',
      expandedDefaultValue: false,
      fill: 'rgb(230,230,230)',
      stroke: 'rgb(160,160,160)',
      cornerRadius: 5,
      contentXMargin: 8,
      contentYMargin: 6,
      contentYSpacing: 4,
      buttonXMargin: 8,
      buttonYMargin: 6,
      minWidth: CHART_WIDTH + 16, // contentXMargin * 2
      tandem: providedOptions.tandem.createTandem( 'accordionBox' )
    } );
    this.addChild( this.accordionBox );

    // Zoom buttons to the right of the accordion box, vertically centered.
    // Cannot be top-aligned because that overlaps with snapshot buttons on the detector screen.
    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.zoomLevelProperty, {
      orientation: 'vertical',
      spacing: 8,
      left: this.accordionBox.right + 6,
      centerY: this.accordionBox.centerY,
      buttonOptions: {
        baseColor: 'rgb(200,215,240)'
      },
      magnifyingGlassNodeOptions: {
        glassRadius: 8
      },
      tandem: providedOptions.tandem.createTandem( 'zoomButtonGroup' )
    } );
    this.addChild( zoomButtonGroup );

    // Hide zoom buttons when the accordion box is collapsed (per design spec)
    this.accordionBox.expandedProperty.link( expanded => {
      zoomButtonGroup.visible = expanded;
    } );

    // Update the graph when data changes
    const updateGraph = () => {
      const isHitsMode = sceneModel.detectionModeProperty.value === DetectionMode.HITS;

      if ( isHitsMode ) {
        this.paintHistogram( dataPath, sceneModel );
        yAxisLabel.string = QuantumWaveInterferenceFluent.countStringProperty.value;
      }
      else {
        this.paintIntensityCurve( dataPath, sceneModel );
        yAxisLabel.string = QuantumWaveInterferenceFluent.intensityStringProperty.value;
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

    // For photons, wavelength changes affect the intensity curve
    if ( sceneModel.sourceType === SourceType.PHOTONS ) {
      sceneModel.wavelengthProperty.link( () => updateGraph() );
    }
    else {
      sceneModel.velocityProperty.link( () => updateGraph() );
    }
  }

  /**
   * Paints the intensity curve (smooth line) on the data path for Average Intensity mode.
   * Uses the accumulated intensity bins from the model, so the curve builds up over time
   * as hits are registered, matching the design requirement for running-average behavior.
   */
  private paintIntensityCurve( dataPath: Path, sceneModel: SceneModel ): void {
    const maxBin = sceneModel.intensityBinsMax;

    if ( maxBin === 0 ) {
      dataPath.shape = null;
      return;
    }

    const zoomScale = Utils.linear( 1, 6, 0.3, 2.0, this.zoomLevelProperty.value );
    const bins = sceneModel.intensityBins;
    const numBins = bins.length;
    const shape = new Shape();

    for ( let i = 0; i < numBins; i++ ) {
      const fraction = ( i + 0.5 ) / numBins; // Center of each bin
      const intensity = bins[ i ] / maxBin; // Normalize to [0, 1]

      const viewX = fraction * CHART_WIDTH;
      const viewY = CHART_HEIGHT - ( intensity * CHART_HEIGHT * zoomScale );

      if ( i === 0 ) {
        shape.moveTo( viewX, viewY );
      }
      else {
        shape.lineTo( viewX, viewY );
      }
    }

    dataPath.shape = shape;
    dataPath.stroke = 'black';
    dataPath.lineWidth = 1.5;
    dataPath.fill = null;
  }

  /**
   * Paints the histogram (bar chart) on the data path for Hits mode.
   */
  private paintHistogram( dataPath: Path, sceneModel: SceneModel ): void {
    const hits = sceneModel.hits;

    if ( hits.length === 0 ) {
      dataPath.shape = null;
      return;
    }

    // Bin the hits into HISTOGRAM_BINS bins across [-1, 1]
    const bins = new Array<number>( HISTOGRAM_BINS ).fill( 0 );
    for ( let i = 0; i < hits.length; i++ ) {
      const normalizedX = hits[ i ].x; // Already in [-1, 1]
      const binIndex = Math.min( HISTOGRAM_BINS - 1,
        Math.max( 0, Math.floor( ( normalizedX + 1 ) / 2 * HISTOGRAM_BINS ) ) );
      bins[ binIndex ]++;
    }

    // Find the max bin count for scaling
    let maxCount = 0;
    for ( let i = 0; i < bins.length; i++ ) {
      if ( bins[ i ] > maxCount ) {
        maxCount = bins[ i ];
      }
    }

    if ( maxCount === 0 ) {
      dataPath.shape = null;
      return;
    }

    // Zoom scaling determines how many counts fill the chart height
    const zoomScale = Utils.linear( 1, 6, 0.15, 1.5, this.zoomLevelProperty.value );
    const binWidth = CHART_WIDTH / HISTOGRAM_BINS;

    const shape = new Shape();

    for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
      if ( bins[ i ] > 0 ) {
        const barHeight = Math.min( CHART_HEIGHT, ( bins[ i ] / maxCount ) * CHART_HEIGHT * zoomScale );
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
    dataPath.stroke = 'rgb(80,80,80)';
    dataPath.lineWidth = 0.5;
    dataPath.fill = 'rgb(100,149,237)'; // Cornflower blue for histogram bars
  }

  public reset(): void {
    this.zoomLevelProperty.reset();
  }
}

quantumWaveInterference.register( 'GraphAccordionBox', GraphAccordionBox );
