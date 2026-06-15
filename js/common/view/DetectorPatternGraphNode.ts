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
import WithRequired from '../../../../phet-core/js/types/WithRequired.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import { createClippedDetectorPatternGraphDataPath, createClippedDetectorPatternGraphStrokePath, createDetectorPatternGraphChartBackground, createDetectorPatternGraphChartBorder, createDetectorPatternGraphZoomButtonGroup, createDetectorPatternHistogramShape, createIntensityCurveShapes, DETECTOR_PATTERN_GRAPH_WIDTH, type DetectorPatternGraphSceneLike, getDetectorPatternGraphPaint } from './DetectorPatternGraphPlotUtils.js';
import DetectorPatternGraphZoomLevelProperty, { type DetectorPatternGraphZoomLevelOption, getDetectorPatternGraphZoomLevel } from './DetectorPatternGraphZoomLevelProperty.js';

const LABEL_FONT = new PhetFont( 12 );
const ZOOM_BUTTON_GROUP_MARGIN = 4;
const AXIS_LABEL_TOP_MARGIN = 4;

export type { DetectorPatternGraphSceneLike };

/**
 * Options for DetectorPatternGraphNode.
 *
 * detectionModeProperty — omit on screens that have only one detection mode (e.g. Single Particles, which is always
 *   "hits"). When provided, the graph switches between the histogram and intensity-curve representations as the
 *   mode changes, and each mode retains its own zoom level across mode transitions.
 *
 * axisLabelStringProperty — string displayed below the chart as the horizontal-axis label; typically the screen-
 *   specific label supplied by the caller (e.g. "Hits" or "Intensity").
 *
 * initialZoomLevel — starting zoom level applied uniformly when detectionModeProperty is absent, or as a fallback
 *   when initialZoomLevels does not specify a level for a particular mode. Accepts a numeric level, 'default', or
 *   'max'. Defaults to 'default'.
 *
 * initialZoomLevels — per-mode initial zoom overrides; takes precedence over initialZoomLevel for each mode that
 *   has an entry. Used by the High Intensity screen to open intensity at zoom 3 and hits at max zoom.
 */
type SelfOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  axisLabelStringProperty: TReadOnlyProperty<string>;
  initialZoomLevel?: DetectorPatternGraphZoomLevelOption;
  initialZoomLevels?: Partial<Record<DetectionMode, DetectorPatternGraphZoomLevelOption>>;
};

/**
 * Public options type for DetectorPatternGraphNode. Callers must supply a tandem for PhET-iO instrumentation of the
 * internal zoom-level Property.
 */
export type DetectorPatternGraphNodeOptions = SelfOptions & WithRequired<NodeOptions, 'tandem'>;

/**
 * Returns the resolved integer zoom level for the given detection mode, preferring a per-mode initialZoomLevels
 * entry and falling back to the global initialZoomLevel option.
 */
const getModeZoomLevel = (
  detectionMode: DetectionMode,
  options: Pick<SelfOptions, 'initialZoomLevel' | 'initialZoomLevels'>
): number => getDetectorPatternGraphZoomLevel( options.initialZoomLevels?.[ detectionMode ] ?? options.initialZoomLevel );

export default class DetectorPatternGraphNode extends Node {

  // Current horizontal (data) axis zoom level, instrumented for PhET-iO. Controls histogram bar width and intensity-curve
  // sampling; when the graph has detection modes, it always reflects the active mode's stored level.
  private readonly zoomLevelProperty: NumberProperty;

  // The chart plot-area rectangle. Serves as the clip region for dataPath and intensityCurveStrokePath, and as the
  // layout anchor for the chart border and zoom buttons.
  private readonly chartBackground: Rectangle;

  // The path that renders the active representation: the filled histogram bars in hits mode, or the filled intensity
  // curve in intensity mode.
  private readonly dataPath: Path;

  // The visible stroke outline of the intensity curve. Used in intensity mode only; its shape is cleared (set to null)
  // in hits mode, where dataPath carries its own stroke.
  private readonly intensityCurveStrokePath: Path;

  // The active scene whose hit positions and wavelength drive the plot. The graph re-listens to the new scene and
  // repaints whenever this changes.
  private readonly sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>;

  // The current detection mode (intensity vs hits), or undefined on single-mode screens (e.g. Single Particles, always
  // hits). Selects which representation updateGraph() paints.
  private readonly detectionModeProperty: TReadOnlyProperty<DetectionMode> | undefined;

  // The configured initial zoom level for each detection mode, used by reset() to restore per-mode defaults. Null when
  // detectionModeProperty is absent (the graph then uses a single zoom level).
  private readonly defaultZoomLevelsByDetectionMode: Record<DetectionMode, number> | null;

  // The live per-mode zoom levels, updated as the user zooms, so each mode keeps its own level across mode switches.
  // Null when detectionModeProperty is absent.
  private readonly zoomLevelsByDetectionMode: Record<DetectionMode, number> | null;

  // The detection mode currently displayed, mirrored from detectionModeProperty; null on single-mode screens. Used to
  // index the per-mode zoom maps above.
  private activeDetectionMode: DetectionMode | null;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>,
    providedOptions: DetectorPatternGraphNodeOptions
  ) {
    const options = optionize<DetectorPatternGraphNodeOptions, SelfOptions, NodeOptions>()( {
      detectionModeProperty: undefined as never,
      initialZoomLevel: 'default',
      initialZoomLevels: {},
      isDisposable: false,

      // Visibility is controlled by the ScreenGraphSwitch Property, so it should not be controlled independently.
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    super( options );

    this.activeDetectionMode = options.detectionModeProperty ? options.detectionModeProperty.value : null;

    this.zoomLevelProperty = new DetectorPatternGraphZoomLevelProperty(
      this.activeDetectionMode ? getModeZoomLevel( this.activeDetectionMode, options ) : options.initialZoomLevel,
      providedOptions.tandem.createTandem( 'zoomLevelProperty' )
    );

    this.defaultZoomLevelsByDetectionMode = options.detectionModeProperty ? {
      intensity: getModeZoomLevel( 'intensity', options ),
      hits: getModeZoomLevel( 'hits', options )
    } : null;
    this.zoomLevelsByDetectionMode = this.defaultZoomLevelsByDetectionMode ? {
      intensity: this.defaultZoomLevelsByDetectionMode.intensity,
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
   * Paints the intensity mode curve. The wave solver supplies probability samples along the detector-screen
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
      this.zoomLevelsByDetectionMode.intensity = this.defaultZoomLevelsByDetectionMode.intensity;
      this.zoomLevelsByDetectionMode.hits = this.defaultZoomLevelsByDetectionMode.hits;
      this.zoomLevelProperty.value = this.zoomLevelsByDetectionMode[ this.activeDetectionMode ];
    }
    else {
      this.zoomLevelProperty.reset();
    }
  }
}
