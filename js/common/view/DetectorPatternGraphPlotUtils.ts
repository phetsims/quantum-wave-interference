// Copyright 2026, University of Colorado Boulder

/**
 * Utilities for constructing and painting the detector pattern graph used beside the detector screen.
 * These helpers keep DetectorPatternGraphNode focused on wiring Properties and scene updates.
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
import { type DetectorPatternGraphDescriberScene } from './description/DetectorPatternGraphDescriber.js';
import { MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL, MIN_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL } from './DetectorPatternGraphZoomLevelProperty.js';

// Preserve the graph footprint when changing the detector-screen width.
export const DETECTOR_PATTERN_GRAPH_WIDTH = 102;
export const DETECTOR_PATTERN_GRAPH_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

const HISTOGRAM_BINS = 100;
const INTENSITY_SAMPLE_COUNT = 200;
const INTENSITY_SAMPLE_SCALE = QuantumWaveInterferenceQueryParameters.detectorPatternGraphSampleScale;
const NUM_HORIZONTAL_GRID_DIVISIONS = 10;
const NUM_VERTICAL_GRID_DIVISIONS = 4;

// Discriminates between the raw hit-count histogram (particle/photon detection events) and the
// theoretical intensity curve computed from the wave solver.
type GraphStyle = 'histogram' | 'intensityCurve';

// Fill and stroke paints bundled together so callers can apply both in one step.
type GraphPaint = {
  fill: TPaint;
  stroke: TPaint;
};

// The two Shapes that together render the theoretical intensity curve: a closed polygon for the
// translucent fill and an open polyline for the opaque stroke drawn on top.
export type IntensityCurveShapes = {
  fillShape: Shape;
  strokeShape: Shape;
};

/**
 * Structural interface describing the scene data consumed by the detector pattern graph and texture renderer.
 * Any scene model that satisfies this shape — e.g. HighIntensitySceneModel — can be passed to the graph
 * utilities without a hard dependency on a concrete class.
 *
 * Optional properties are absent on scenes that do not support the corresponding feature:
 *   - intensityProperty: source brightness in [0,1]; defaults to 1 when absent (single-particle scenes).
 *   - detectorPatternFormationFactorProperty: fraction in [0,1] representing how fully the interference
 *     pattern has been established; only High Intensity scenes animate this from 0 to 1 as photons
 *     accumulate. Defaults to 1 (fully formed) when absent.
 */
export type DetectorPatternGraphSceneLike = DetectorPatternGraphDescriberScene & {
  hits: Vector2[];
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  hitsChangedEmitter: TEmitter;
  waveSolver: WaveSolver;
  intensityProperty?: TReadOnlyProperty<number>;
  detectorPatternFormationFactorProperty?: TReadOnlyProperty<number>;
};

/**
 * Creates the plotting background, including the horizontal and vertical grid lines.
 *
 * NOTE: This graph is intentionally hand-rolled rather than built with bamboo. It is transposed — the independent axis
 * (position on the detector screen) runs vertically while the data (intensity / hit count) grows horizontally to the
 * right. Bamboo's ChartTransform fixes x to horizontal and y to vertical (it can invert an axis direction but not swap
 * the data axis), and its BarPlot/AreaPlot/LinePlot render against a vertical baseline, so they cannot produce this
 * sideways histogram and rightward-filled intensity curve. See https://github.com/phetsims/quantum-wave-interference/issues/135
 */
export function createDetectorPatternGraphChartBackground(): Rectangle {
  const chartBackground = new Rectangle( 0, 0, DETECTOR_PATTERN_GRAPH_WIDTH, DETECTOR_PATTERN_GRAPH_HEIGHT, {
    fill: 'white',
    stroke: 'black',
    lineWidth: 1
  } );

  for ( let i = 1; i < NUM_HORIZONTAL_GRID_DIVISIONS; i++ ) {
    const y = ( i / NUM_HORIZONTAL_GRID_DIVISIONS ) * DETECTOR_PATTERN_GRAPH_HEIGHT;
    const isCenterLine = i === NUM_HORIZONTAL_GRID_DIVISIONS / 2;
    chartBackground.addChild(
      new Line( 0, y, DETECTOR_PATTERN_GRAPH_WIDTH, y, {
        stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
        lineWidth: isCenterLine ? 0.75 : 0.5,
        lineDash: isCenterLine ? [ 4, 4 ] : []
      } )
    );
  }

  for ( let i = 1; i < NUM_VERTICAL_GRID_DIVISIONS; i++ ) {
    const x = ( i / NUM_VERTICAL_GRID_DIVISIONS ) * DETECTOR_PATTERN_GRAPH_WIDTH;
    chartBackground.addChild(
      new Line( x, 0, x, DETECTOR_PATTERN_GRAPH_HEIGHT, {
        stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
        lineWidth: 0.5
      } )
    );
  }

  return chartBackground;
}

/**
 * Creates the non-pickable border drawn above the clipped graph data.
 */
export function createDetectorPatternGraphChartBorder(): Rectangle {
  return new Rectangle( 0, 0, DETECTOR_PATTERN_GRAPH_WIDTH, DETECTOR_PATTERN_GRAPH_HEIGHT, {
    fill: null,
    stroke: 'black',
    lineWidth: 1,
    pickable: false
  } );
}

/**
 * Creates the filled data path shared by the histogram and the intensity curve.
 */
export function createClippedDetectorPatternGraphDataPath( chartBackground: Rectangle ): Path {
  const dataPath = new Path( null, {
    clipArea: Shape.rectangle( 0, 0, DETECTOR_PATTERN_GRAPH_WIDTH, DETECTOR_PATTERN_GRAPH_HEIGHT )
  } );
  dataPath.computeShapeBounds = () => chartBackground.bounds;

  return dataPath;
}

/**
 * Creates the stroke-only path that traces the intensity curve.
 */
export function createClippedDetectorPatternGraphStrokePath( chartBackground: Rectangle ): Path {
  const strokePath = new Path( null, {
    clipArea: Shape.rectangle( 0, 0, DETECTOR_PATTERN_GRAPH_WIDTH, DETECTOR_PATTERN_GRAPH_HEIGHT ),
    fill: null,
    lineWidth: 1.5
  } );
  strokePath.computeShapeBounds = () => chartBackground.bounds;

  return strokePath;
}

/**
 * Creates the accessible zoom controls for the graph's horizontal data scale.
 */
export const createDetectorPatternGraphZoomButtonGroup = (
  zoomLevelProperty: NumberProperty,
  tandem: Tandem
): PlusMinusZoomButtonGroup => {
  const zoomLevelResponseProperty = QuantumWaveInterferenceFluent.a11y.zoomButtonGroup.zoomLevelResponse.createProperty( {
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
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.zoomButtonGroup.zoomInAccessibleHelpTextStringProperty,
      accessibleContextResponse: zoomLevelResponseProperty
    },
    zoomOutButtonOptions: {
      accessibleName: QuantumWaveInterferenceFluent.a11y.zoomOutButton.accessibleNameStringProperty,
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.detectorPatternGraph.zoomButtonGroup.zoomOutAccessibleHelpTextStringProperty,
      accessibleContextResponse: zoomLevelResponseProperty
    },
    tandem: tandem.createTandem( 'zoomButtonGroup' ),
    visiblePropertyOptions: { phetioFeatured: true }
  } );
};

function createHistogramBins( hits: Vector2[] ): number[] {
  const bins = new Array<number>( HISTOGRAM_BINS ).fill( 0 );
  for ( let i = 0; i < hits.length; i++ ) {
    const rawBinIndex = Math.floor( ( hits[ i ].x + 1 ) / 2 * HISTOGRAM_BINS );
    const binIndex = Math.max( 0, Math.min( HISTOGRAM_BINS - 1, rawBinIndex ) );
    bins[ binIndex ]++;
  }

  return bins;
}

/**
 * Creates a detector-pattern histogram shape from normalized detector hit positions.
 */
export function createDetectorPatternHistogramShape( hits: Vector2[], zoomLevel: number, maxZoomLevel: number ): Shape {
  const bins = createHistogramBins( hits );
  const zoomStepsFromMax = maxZoomLevel - zoomLevel;
  const zoomScale = Math.pow( 2, -zoomStepsFromMax );
  const binHeight = DETECTOR_PATTERN_GRAPH_HEIGHT / HISTOGRAM_BINS;

  const shape = new Shape();

  for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
    if ( bins[ i ] > 0 ) {
      const barWidth = Math.min( DETECTOR_PATTERN_GRAPH_WIDTH, bins[ i ] * binHeight * zoomScale );
      const y = i * binHeight;
      shape.moveTo( 0, y );
      shape.lineTo( barWidth, y );
      shape.lineTo( barWidth, y + binHeight );
      shape.lineTo( 0, y + binHeight );
      shape.close();
    }
  }

  return shape;
}

/**
 * Creates the filled and stroked shapes for the theoretical intensity curve.
 */
export function createIntensityCurveShapes( scene: DetectorPatternGraphSceneLike, zoomLevel: number ): IntensityCurveShapes {
  const zoomScale = linear(
    MIN_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL,
    MAX_DETECTOR_PATTERN_GRAPH_ZOOM_LEVEL,
    0.3,
    2.0,
    zoomLevel
  );
  const sourceIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
  const detectorPatternFormationFactor = scene.detectorPatternFormationFactorProperty?.value ?? 1;

  const numSamples = Math.max( 2, roundSymmetric( INTENSITY_SAMPLE_COUNT * INTENSITY_SAMPLE_SCALE ) );
  const distribution = scene.waveSolver.getDetectorProbabilityDistribution( numSamples );
  const fillShape = new Shape();
  const strokeShape = new Shape();
  const getViewX = ( intensity: number ): number =>
    intensity * sourceIntensity * detectorPatternFormationFactor * DETECTOR_PATTERN_GRAPH_WIDTH * zoomScale;

  fillShape.moveTo( 0, 0 );

  for ( let i = 0; i < numSamples; i++ ) {
    const fraction = ( i + 0.5 ) / numSamples;
    const intensity = distribution[ i ];

    const viewY = fraction * DETECTOR_PATTERN_GRAPH_HEIGHT;
    const viewX = getViewX( intensity );

    if ( i === 0 ) {
      fillShape.lineTo( viewX, 0 );
      strokeShape.moveTo( viewX, 0 );
    }

    fillShape.lineTo( viewX, viewY );
    strokeShape.lineTo( viewX, viewY );
  }

  const lastX = getViewX( distribution[ numSamples - 1 ] );
  fillShape.lineTo( lastX, DETECTOR_PATTERN_GRAPH_HEIGHT );
  fillShape.lineTo( 0, DETECTOR_PATTERN_GRAPH_HEIGHT );
  fillShape.close();

  strokeShape.lineTo( lastX, DETECTOR_PATTERN_GRAPH_HEIGHT );

  return {
    fillShape: fillShape,
    strokeShape: strokeShape
  };
}

/**
 * Selects source-appropriate graph paint. Photons use wavelength-derived colors; particles use profile colors.
 */
export function getDetectorPatternGraphPaint( scene: DetectorPatternGraphSceneLike, graphStyle: GraphStyle ): GraphPaint {
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
}
