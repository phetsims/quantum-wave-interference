// Copyright 2026, University of Colorado Boulder

/**
 * DetectorPatternGraphNode is a tall, vertical graph for detector patterns on both the High Intensity and
 * Single Particles screens. The vertical axis corresponds to position on the detector screen, and the horizontal
 * axis shows intensity (line graph) or hit count (histogram).
 *
 * When in Intensity mode (High Intensity screen only), a smooth curve shows the theoretical
 * interference pattern. When in Hits mode (both screens), a histogram shows binned hit counts.
 *
 * Zoom buttons at the top right control the horizontal (data) axis scale.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import { createClippedDetectorPatternGraphDataPath, createClippedDetectorPatternGraphStrokePath, createDetectorPatternGraphChartBackground, createDetectorPatternGraphChartBorder, createDetectorPatternGraphZoomButtonGroup, createDetectorPatternGraphZoomLevelProperty, createDetectorPatternHistogramShape, createIntensityCurveShapes, DETECTOR_PATTERN_GRAPH_WIDTH, type DetectorPatternGraphSceneLike, getDetectorPatternGraphPaint, getDetectorPatternGraphZoomLevel, type ZoomLevelOption } from './DetectorPatternGraphPlotUtils.js';

const LABEL_FONT = new PhetFont( 12 );
const ZOOM_BUTTON_GROUP_MARGIN = 4;
const AXIS_LABEL_TOP_MARGIN = 4;

export type { DetectorPatternGraphSceneLike };

type SelfOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  axisLabelStringProperty: TReadOnlyProperty<string>;
  initialZoomLevel?: ZoomLevelOption;
  initialZoomLevels?: Partial<Record<DetectionMode, ZoomLevelOption>>;
};

type DetectorPatternGraphNodeOptions = SelfOptions & WithRequired<NodeOptions, 'tandem'>;

const getModeZoomLevel = (
  detectionMode: DetectionMode,
  options: Pick<SelfOptions, 'initialZoomLevel' | 'initialZoomLevels'>
): number => getDetectorPatternGraphZoomLevel( options.initialZoomLevels?.[ detectionMode ] ?? options.initialZoomLevel );

export default class DetectorPatternGraphNode extends Node {

  private readonly zoomLevelProperty: NumberProperty;
  private readonly chartBackground: Rectangle;
  private readonly dataPath: Path;
  private readonly intensityCurveStrokePath: Path;
  private readonly sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>;
  private readonly detectionModeProperty: TReadOnlyProperty<DetectionMode> | undefined;
  private readonly defaultZoomLevelsByDetectionMode: Record<DetectionMode, number> | null;
  private readonly zoomLevelsByDetectionMode: Record<DetectionMode, number> | null;
  private activeDetectionMode: DetectionMode | null;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>,
    providedOptions: DetectorPatternGraphNodeOptions
  ) {
    const options = optionize<DetectorPatternGraphNodeOptions, StrictOmit<SelfOptions, 'detectionModeProperty'>, NodeOptions>()( {
      initialZoomLevel: 'default',
      initialZoomLevels: {},
      isDisposable: false
    }, providedOptions );

    super( options );

    this.activeDetectionMode = options.detectionModeProperty ? options.detectionModeProperty.value : null;

    this.zoomLevelProperty = createDetectorPatternGraphZoomLevelProperty(
      this.activeDetectionMode ? getModeZoomLevel( this.activeDetectionMode, options ) : options.initialZoomLevel,
      providedOptions.tandem
    );

    this.defaultZoomLevelsByDetectionMode = options.detectionModeProperty ? {
      averageIntensity: getModeZoomLevel( 'averageIntensity', options ),
      hits: getModeZoomLevel( 'hits', options )
    } : null;
    this.zoomLevelsByDetectionMode = this.defaultZoomLevelsByDetectionMode ? {
      averageIntensity: this.defaultZoomLevelsByDetectionMode.averageIntensity,
      hits: this.defaultZoomLevelsByDetectionMode.hits
    } : null;

    this.chartBackground = createDetectorPatternGraphChartBackground();
    this.dataPath = createClippedDetectorPatternGraphDataPath( this.chartBackground );
    this.intensityCurveStrokePath = createClippedDetectorPatternGraphStrokePath( this.chartBackground );

    const chartBorder = createDetectorPatternGraphChartBorder();
    const zoomButtonGroup = createDetectorPatternGraphZoomButtonGroup( this.zoomLevelProperty, providedOptions.tandem );
    zoomButtonGroup.right = this.chartBackground.right - ZOOM_BUTTON_GROUP_MARGIN;
    zoomButtonGroup.top = this.chartBackground.top + ZOOM_BUTTON_GROUP_MARGIN;

    const chartNode = new Node( {
      children: [ this.chartBackground, this.dataPath, this.intensityCurveStrokePath, chartBorder, zoomButtonGroup ]
    } );

    const axisLabel = new Text( options.axisLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: DETECTOR_PATTERN_GRAPH_WIDTH
    } );

    this.addChild( chartNode );
    this.addChild( axisLabel );

    axisLabel.localBoundsProperty.link( () => {
      axisLabel.centerX = chartNode.centerX;
      axisLabel.top = chartNode.bottom + AXIS_LABEL_TOP_MARGIN;
    } );

    this.sceneProperty = sceneProperty;
    this.detectionModeProperty = options.detectionModeProperty;

    const updateGraph = () => this.updateGraph();

    // Repaint when visibility changes so the graph is current when shown
    this.visibleProperty.link( updateGraph );

    sceneProperty.link( ( scene, previousScene ) => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( updateGraph );
        previousScene.wavelengthProperty.unlink( updateGraph );
      }
      scene.hitsChangedEmitter.addListener( updateGraph );
      scene.wavelengthProperty.link( updateGraph );
      updateGraph();
    } );

    this.zoomLevelProperty.link( updateGraph );
    this.zoomLevelProperty.lazyLink( zoomLevel => {
      if ( this.zoomLevelsByDetectionMode && this.activeDetectionMode ) {
        this.zoomLevelsByDetectionMode[ this.activeDetectionMode ] = zoomLevel;
      }
    } );

    if ( this.detectionModeProperty ) {
      this.detectionModeProperty.lazyLink( detectionMode => {
        this.activeDetectionMode = detectionMode;

        if ( this.zoomLevelsByDetectionMode ) {
          this.zoomLevelProperty.value = this.zoomLevelsByDetectionMode[ detectionMode ];
        }
        updateGraph();
      } );
    }
  }

  /**
   * Redraws the active graph representation using the current scene, zoom level, and detection mode.
   * If the graph is hidden, this method intentionally leaves the existing path data in place until the graph is shown.
   */
  private updateGraph(): void {
    if ( !this.visible ) {
      return;
    }

    const scene = this.sceneProperty.value;
    const isHitsMode = !this.detectionModeProperty || this.detectionModeProperty.value === 'hits';

    if ( isHitsMode ) {
      this.paintHistogram( scene );
    }
    else {
      this.paintIntensityCurve( scene );
    }
  }

  /**
   * Paints the hits-mode histogram. Scene hit positions are already normalized to the detector-screen axis,
   * so this method bins hit x-coordinates into vertical graph bars and scales bar width by the zoom level.
   */
  private paintHistogram( scene: DetectorPatternGraphSceneLike ): void {
    this.intensityCurveStrokePath.shape = null;

    if ( scene.hits.length === 0 ) {
      this.dataPath.shape = null;
      return;
    }

    this.dataPath.shape = createDetectorPatternHistogramShape(
      scene.hits,
      this.zoomLevelProperty.value,
      this.zoomLevelProperty.range.max
    );
    this.dataPath.lineWidth = 0.5;

    const graphPaint = getDetectorPatternGraphPaint( scene, 'histogram' );
    this.dataPath.fill = graphPaint.fill;
    this.dataPath.stroke = graphPaint.stroke;
  }

  /**
   * Paints the average-intensity mode curve. The wave solver supplies probability samples along the detector-screen
   * axis; this method turns those samples into a filled detector-pattern curve plus a visible stroke path.
   */
  private paintIntensityCurve( scene: DetectorPatternGraphSceneLike ): void {
    const intensityCurveShapes = createIntensityCurveShapes( scene, this.zoomLevelProperty.value );

    this.dataPath.shape = intensityCurveShapes.fillShape;
    this.dataPath.lineWidth = 1.5;
    this.dataPath.stroke = null;

    this.intensityCurveStrokePath.shape = intensityCurveShapes.strokeShape;

    const graphPaint = getDetectorPatternGraphPaint( scene, 'intensityCurve' );
    this.dataPath.fill = graphPaint.fill;
    this.intensityCurveStrokePath.stroke = graphPaint.stroke;
  }

  /**
   * Repaints the graph during the simulation step so continuously changing intensity data stays current.
   */
  public step(): void {
    this.updateGraph();
  }

  /**
   * Restores zoom state. For graphs with detection modes, each mode keeps its own zoom level and Reset All returns
   * both mode-specific levels to their configured defaults.
   */
  public reset(): void {
    if ( this.defaultZoomLevelsByDetectionMode && this.zoomLevelsByDetectionMode && this.activeDetectionMode ) {
      this.zoomLevelsByDetectionMode.averageIntensity = this.defaultZoomLevelsByDetectionMode.averageIntensity;
      this.zoomLevelsByDetectionMode.hits = this.defaultZoomLevelsByDetectionMode.hits;
      this.zoomLevelProperty.value = this.zoomLevelsByDetectionMode[ this.activeDetectionMode ];
    }
    else {
      this.zoomLevelProperty.reset();
    }
  }
}
