// Copyright 2026, University of Colorado Boulder

/**
 * Utilities for constructing and painting the sideways graph used beside the detector screen.
 * These helpers keep SidewaysGraphNode focused on wiring Properties and scene updates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { linear } from '../../../../dot/js/util/linear.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import PlusMinusZoomButtonGroup from '../../../../scenery-phet/js/PlusMinusZoomButtonGroup.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import type TPaint from '../../../../scenery/js/util/TPaint.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type SourceType } from '../model/SourceType.js';
import type WaveSolver from '../model/WaveSolver.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import QuantumWaveInterferenceQueryParameters from '../QuantumWaveInterferenceQueryParameters.js';

// Preserve the previous right edge while moving the graph left edge to the wave visualizer's right edge.
export const SIDEWAYS_GRAPH_WIDTH = 80 + QuantumWaveInterferenceConstants.DETECTOR_SCREEN_WIDTH / 4;
export const SIDEWAYS_GRAPH_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
export const MIN_SIDEWAYS_GRAPH_ZOOM_LEVEL = 1;
export const DEFAULT_SIDEWAYS_GRAPH_ZOOM_LEVEL = 4;
export const MAX_SIDEWAYS_GRAPH_ZOOM_LEVEL = 6;

const HISTOGRAM_BINS = 100;
const INTENSITY_SAMPLE_COUNT = 200;
const INTENSITY_SAMPLE_SCALE = QuantumWaveInterferenceQueryParameters.sidewaysGraphSampleScale;
const NUM_HORIZONTAL_GRID_DIVISIONS = 10;
const NUM_VERTICAL_GRID_DIVISIONS = 4;

export type ZoomLevelOption = number | 'default' | 'max';

type GraphStyle = 'histogram' | 'intensityCurve';

type GraphPaint = {
  fill: TPaint;
  stroke: TPaint;
};

export type IntensityCurveShapes = {
  fillShape: Shape;
  strokeShape: Shape;
};

export type SidewaysGraphSceneLike = {
  hits: Vector2[];
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  hitsChangedEmitter: TEmitter;
  waveSolver: WaveSolver;
  intensityProperty?: TReadOnlyProperty<number>;
  detectorPatternFormationFactorProperty?: TReadOnlyProperty<number>;
};

/**
 * Converts the caller-facing zoom option into the integer zoom level used by the graph controls.
 */
export const getSidewaysGraphZoomLevel = ( zoomLevel: ZoomLevelOption | undefined ): number =>
  zoomLevel === 'max' ? MAX_SIDEWAYS_GRAPH_ZOOM_LEVEL :
  typeof zoomLevel === 'number' ? zoomLevel :
  DEFAULT_SIDEWAYS_GRAPH_ZOOM_LEVEL;

/**
 * Creates the plotting background, including the horizontal and vertical grid lines.
 */
export const createSidewaysGraphChartBackground = (): Rectangle => {
  const chartBackground = new Rectangle( 0, 0, SIDEWAYS_GRAPH_WIDTH, SIDEWAYS_GRAPH_HEIGHT, {
    fill: 'white',
    stroke: 'black',
    lineWidth: 1
  } );

  for ( let i = 1; i < NUM_HORIZONTAL_GRID_DIVISIONS; i++ ) {
    const y = ( i / NUM_HORIZONTAL_GRID_DIVISIONS ) * SIDEWAYS_GRAPH_HEIGHT;
    const isCenterLine = i === NUM_HORIZONTAL_GRID_DIVISIONS / 2;
    chartBackground.addChild(
      new Line( 0, y, SIDEWAYS_GRAPH_WIDTH, y, {
        stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
        lineWidth: isCenterLine ? 0.75 : 0.5,
        lineDash: isCenterLine ? [ 4, 4 ] : []
      } )
    );
  }

  for ( let i = 1; i < NUM_VERTICAL_GRID_DIVISIONS; i++ ) {
    const x = ( i / NUM_VERTICAL_GRID_DIVISIONS ) * SIDEWAYS_GRAPH_WIDTH;
    chartBackground.addChild(
      new Line( x, 0, x, SIDEWAYS_GRAPH_HEIGHT, {
        stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
        lineWidth: 0.5
      } )
    );
  }

  return chartBackground;
};

/**
 * Creates the non-pickable border drawn above the clipped graph data.
 */
export const createSidewaysGraphChartBorder = (): Rectangle => new Rectangle( 0, 0, SIDEWAYS_GRAPH_WIDTH, SIDEWAYS_GRAPH_HEIGHT, {
  fill: null,
  stroke: 'black',
  lineWidth: 1,
  pickable: false
} );

/**
 * Creates the filled data path shared by the histogram and the average-intensity curve.
 */
export const createClippedSidewaysGraphDataPath = ( chartBackground: Rectangle ): Path => {
  const dataPath = new Path( null, {
    clipArea: Shape.rectangle( 0, 0, SIDEWAYS_GRAPH_WIDTH, SIDEWAYS_GRAPH_HEIGHT )
  } );
  dataPath.computeShapeBounds = () => chartBackground.bounds;

  return dataPath;
};

/**
 * Creates the stroke-only path that traces the average-intensity curve.
 */
export const createClippedSidewaysGraphStrokePath = ( chartBackground: Rectangle ): Path => {
  const strokePath = new Path( null, {
    clipArea: Shape.rectangle( 0, 0, SIDEWAYS_GRAPH_WIDTH, SIDEWAYS_GRAPH_HEIGHT ),
    fill: null,
    lineWidth: 1.5
  } );
  strokePath.computeShapeBounds = () => chartBackground.bounds;

  return strokePath;
};

/**
 * Creates the accessible zoom controls for the graph's horizontal data scale.
 */
export const createSidewaysGraphZoomButtonGroup = (
  zoomLevelProperty: NumberProperty,
  tandem: Tandem
): PlusMinusZoomButtonGroup => {
  const zoomLevelResponseProperty = QuantumWaveInterferenceFluent.a11y.graphAccordionBox.zoomButtonGroup.zoomLevelResponse.createProperty( {
    level: zoomLevelProperty,
    max: zoomLevelProperty.range.max
  } );

  return new PlusMinusZoomButtonGroup( zoomLevelProperty, {
    orientation: 'horizontal',
    spacing: 0,
    iconOptions: {
      scale: 1.2
    },
    touchAreaXDilation: 5,
    touchAreaYDilation: 5,
    zoomInButtonOptions: {
      accessibleName: QuantumWaveInterferenceFluent.a11y.zoomInButton.accessibleNameStringProperty,
      accessibleContextResponse: zoomLevelResponseProperty
    },
    zoomOutButtonOptions: {
      accessibleName: QuantumWaveInterferenceFluent.a11y.zoomOutButton.accessibleNameStringProperty,
      accessibleContextResponse: zoomLevelResponseProperty
    },
    tandem: tandem.createTandem( 'zoomButtonGroup' )
  } );
};

const createHistogramBins = ( hits: Vector2[] ): number[] => {
  const bins = new Array<number>( HISTOGRAM_BINS ).fill( 0 );
  for ( let i = 0; i < hits.length; i++ ) {
    const rawBinIndex = Math.floor( ( hits[ i ].x + 1 ) / 2 * HISTOGRAM_BINS );
    const binIndex = Math.max( 0, Math.min( HISTOGRAM_BINS - 1, rawBinIndex ) );
    bins[ binIndex ]++;
  }

  return bins;
};

/**
 * Creates a sideways histogram shape from normalized detector hit positions.
 */
export const createSidewaysHistogramShape = ( hits: Vector2[], zoomLevel: number, maxZoomLevel: number ): Shape => {
  const bins = createHistogramBins( hits );
  const zoomStepsFromMax = maxZoomLevel - zoomLevel;
  const zoomScale = Math.pow( 2, -zoomStepsFromMax );
  const binHeight = SIDEWAYS_GRAPH_HEIGHT / HISTOGRAM_BINS;

  const shape = new Shape();

  for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
    if ( bins[ i ] > 0 ) {
      const barWidth = Math.min( SIDEWAYS_GRAPH_WIDTH, bins[ i ] * binHeight * zoomScale );
      const y = i * binHeight;
      shape.moveTo( 0, y );
      shape.lineTo( barWidth, y );
      shape.lineTo( barWidth, y + binHeight );
      shape.lineTo( 0, y + binHeight );
      shape.close();
    }
  }

  return shape;
};

/**
 * Creates the filled and stroked shapes for the theoretical average-intensity curve.
 */
export const createIntensityCurveShapes = ( scene: SidewaysGraphSceneLike, zoomLevel: number ): IntensityCurveShapes => {
  const zoomScale = linear( 1, 6, 0.3, 2.0, zoomLevel );
  const sourceIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
  const detectorPatternFormationFactor = scene.detectorPatternFormationFactorProperty?.value ?? 1;

  const numSamples = Math.max( 2, roundSymmetric( INTENSITY_SAMPLE_COUNT * INTENSITY_SAMPLE_SCALE ) );
  const distribution = scene.waveSolver.getDetectorProbabilityDistribution( numSamples );
  const fillShape = new Shape();
  const strokeShape = new Shape();
  const getViewX = ( intensity: number ): number =>
    intensity * sourceIntensity * detectorPatternFormationFactor * SIDEWAYS_GRAPH_WIDTH * zoomScale;

  fillShape.moveTo( 0, 0 );

  for ( let i = 0; i < numSamples; i++ ) {
    const fraction = ( i + 0.5 ) / numSamples;
    const intensity = distribution[ i ];

    const viewY = fraction * SIDEWAYS_GRAPH_HEIGHT;
    const viewX = getViewX( intensity );

    if ( i === 0 ) {
      fillShape.lineTo( viewX, 0 );
      strokeShape.moveTo( viewX, 0 );
    }

    fillShape.lineTo( viewX, viewY );
    strokeShape.lineTo( viewX, viewY );
  }

  const lastX = getViewX( distribution[ numSamples - 1 ] );
  fillShape.lineTo( lastX, SIDEWAYS_GRAPH_HEIGHT );
  fillShape.lineTo( 0, SIDEWAYS_GRAPH_HEIGHT );
  fillShape.close();

  strokeShape.lineTo( lastX, SIDEWAYS_GRAPH_HEIGHT );

  return {
    fillShape: fillShape,
    strokeShape: strokeShape
  };
};

/**
 * Selects source-appropriate graph paint. Photons use wavelength-derived colors; particles use profile colors.
 */
export const getSidewaysGraphPaint = ( scene: SidewaysGraphSceneLike, graphStyle: GraphStyle ): GraphPaint => {
  const fillAlpha = graphStyle === 'histogram' ? 0.7 :
                    graphStyle === 'intensityCurve' ? 0.3 :
                    ( () => { throw new Error( `Unrecognized graphStyle: ${graphStyle}` ); } )();

  if ( scene.sourceType === 'photons' ) {
    const color = VisibleColor.wavelengthToColor( scene.wavelengthProperty.value );

    return {
      fill: color.withAlpha( fillAlpha ),
      stroke: color.darkerColor( 0.5 ).withAlpha( 0.8 )
    };
  }
  else {
    return {
      fill: QuantumWaveInterferenceColors.particleHistogramFillProperty,
      stroke: QuantumWaveInterferenceColors.particleHistogramStrokeProperty
    };
  }
};
