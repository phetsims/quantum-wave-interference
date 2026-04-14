// Copyright 2026, University of Colorado Boulder

/**
 * SidewaysGraphNode is a tall, vertical graph that sits to the right of the detector screen on both the
 * High Intensity and Single Particles screens. The vertical axis corresponds to position on the detector
 * screen, and the horizontal axis shows intensity (line graph) or hit count (histogram).
 *
 * When in Intensity mode (High Intensity screen only), a smooth curve shows the theoretical
 * interference pattern. When in Hits mode (both screens), a histogram shows binned hit counts.
 *
 * Zoom buttons at the top right control the horizontal (data) axis scale.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import TEmitter from '../../../../axon/js/TEmitter.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import RangeWithValue from '../../../../dot/js/RangeWithValue.js';
import { linear } from '../../../../dot/js/util/linear.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import MagnifyingGlassZoomButtonGroup from '../../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceColors from '../QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';

const GRAPH_WIDTH = 80;
const GRAPH_HEIGHT = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;
const HISTOGRAM_BINS = 100;
const LABEL_FONT = new PhetFont( 12 );

export type SidewaysGraphSceneLike = {
  hits: Vector2[];
  sourceType: SourceType;
  wavelengthProperty: TReadOnlyProperty<number>;
  screenHalfWidth: number;
  isEmittingProperty: TReadOnlyProperty<boolean>;
  hitsChangedEmitter: TEmitter;
  getIntensityAtPosition( position: number ): number;
  intensityProperty?: TReadOnlyProperty<number>;
};

type SelfOptions = {
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
  axisLabelStringProperty: TReadOnlyProperty<string>;
};

type SidewaysGraphNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

export default class SidewaysGraphNode extends Node {

  private readonly zoomLevelProperty: NumberProperty;
  private readonly chartBackground: Rectangle;
  private readonly dataPath: Path;

  public constructor(
    sceneProperty: TReadOnlyProperty<SidewaysGraphSceneLike>,
    providedOptions: SidewaysGraphNodeOptions
  ) {
    const options = optionize<SidewaysGraphNodeOptions, StrictOmit<SelfOptions, 'detectionModeProperty'>, NodeOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    const zoomRange = new RangeWithValue( 1, 6, 4 );
    this.zoomLevelProperty = new NumberProperty( zoomRange.defaultValue, {
      range: zoomRange,
      tandem: providedOptions.tandem.createTandem( 'zoomLevelProperty' ),
      numberType: 'Integer'
    } );

    this.chartBackground = new Rectangle( 0, 0, GRAPH_WIDTH, GRAPH_HEIGHT, {
      fill: 'white',
      stroke: 'black',
      lineWidth: 1
    } );

    const NUM_HORIZONTAL_DIVISIONS = 10;
    for ( let i = 1; i < NUM_HORIZONTAL_DIVISIONS; i++ ) {
      const y = ( i / NUM_HORIZONTAL_DIVISIONS ) * GRAPH_HEIGHT;
      const isCenterLine = i === NUM_HORIZONTAL_DIVISIONS / 2;
      this.chartBackground.addChild(
        new Line( 0, y, GRAPH_WIDTH, y, {
          stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
          lineWidth: isCenterLine ? 0.75 : 0.5,
          lineDash: isCenterLine ? [ 4, 4 ] : []
        } )
      );
    }

    const NUM_VERTICAL_DIVISIONS = 4;
    for ( let i = 1; i < NUM_VERTICAL_DIVISIONS; i++ ) {
      const x = ( i / NUM_VERTICAL_DIVISIONS ) * GRAPH_WIDTH;
      this.chartBackground.addChild(
        new Line( x, 0, x, GRAPH_HEIGHT, {
          stroke: QuantumWaveInterferenceColors.graphGridLineColorProperty,
          lineWidth: 0.5
        } )
      );
    }

    this.dataPath = new Path( null, {
      clipArea: Shape.rectangle( 0, 0, GRAPH_WIDTH, GRAPH_HEIGHT )
    } );
    this.dataPath.computeShapeBounds = () => this.chartBackground.bounds;

    const chartNode = new Node( {
      children: [ this.chartBackground, this.dataPath ]
    } );

    const zoomButtonGroup = new MagnifyingGlassZoomButtonGroup( this.zoomLevelProperty, {
      orientation: 'vertical',
      spacing: 8,
      buttonOptions: {
        baseColor: QuantumWaveInterferenceColors.snapshotButtonBaseColorProperty
      },
      magnifyingGlassNodeOptions: {
        glassRadius: 8
      },
      tandem: providedOptions.tandem.createTandem( 'zoomButtonGroup' )
    } );

    const chartAndZoom = new HBox( {
      spacing: 4,
      align: 'top',
      children: [ chartNode, zoomButtonGroup ]
    } );

    const axisLabel = new Text( options.axisLabelStringProperty, {
      font: LABEL_FONT,
      maxWidth: GRAPH_WIDTH
    } );

    this.addChild( chartAndZoom );
    this.addChild( axisLabel );

    axisLabel.localBoundsProperty.link( () => {
      axisLabel.centerX = chartNode.centerX;
      axisLabel.top = chartAndZoom.bottom + 4;
    } );

    const detectionModeProperty = options.detectionModeProperty;

    const updateGraph = () => {
      if ( !this.visible ) {
        return;
      }

      const scene = sceneProperty.value;
      const isHitsMode = !detectionModeProperty || detectionModeProperty.value === 'hits';

      if ( isHitsMode ) {
        this.paintHistogram( scene );
      }
      else {
        this.paintIntensityCurve( scene );
      }
    };

    // Repaint when visibility changes so the graph is current when shown
    this.visibleProperty.link( updateGraph );

    let previousScene: SidewaysGraphSceneLike | null = null;

    sceneProperty.link( scene => {
      if ( previousScene ) {
        previousScene.hitsChangedEmitter.removeListener( updateGraph );
        previousScene.isEmittingProperty.unlink( updateGraph );
        previousScene.wavelengthProperty.unlink( updateGraph );
      }
      scene.hitsChangedEmitter.addListener( updateGraph );
      scene.isEmittingProperty.link( updateGraph );
      scene.wavelengthProperty.link( updateGraph );
      previousScene = scene;
      updateGraph();
    } );

    this.zoomLevelProperty.link( updateGraph );
    if ( detectionModeProperty ) {
      detectionModeProperty.link( updateGraph );
    }
  }

  private paintHistogram( scene: SidewaysGraphSceneLike ): void {
    if ( scene.hits.length === 0 ) {
      this.dataPath.shape = null;
      return;
    }

    const bins = new Array<number>( HISTOGRAM_BINS ).fill( 0 );
    for ( let i = 0; i < scene.hits.length; i++ ) {
      const rawBinIndex = Math.floor( ( scene.hits[ i ].x + 1 ) / 2 * HISTOGRAM_BINS );
      const binIndex = Math.max( 0, Math.min( HISTOGRAM_BINS - 1, rawBinIndex ) );
      bins[ binIndex ]++;
    }

    const maxZoomLevel = this.zoomLevelProperty.range.max;
    const zoomStepsFromMax = maxZoomLevel - this.zoomLevelProperty.value;
    const zoomScale = Math.pow( 2, -zoomStepsFromMax );
    const binHeight = GRAPH_HEIGHT / HISTOGRAM_BINS;

    const shape = new Shape();

    for ( let i = 0; i < HISTOGRAM_BINS; i++ ) {
      if ( bins[ i ] > 0 ) {
        const barWidth = Math.min( GRAPH_WIDTH, bins[ i ] * binHeight * zoomScale );
        const y = i * binHeight;
        shape.moveTo( 0, y );
        shape.lineTo( barWidth, y );
        shape.lineTo( barWidth, y + binHeight );
        shape.lineTo( 0, y + binHeight );
        shape.close();
      }
    }

    this.dataPath.shape = shape;
    this.dataPath.lineWidth = 0.5;

    if ( scene.sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( scene.wavelengthProperty.value );
      this.dataPath.fill = color.withAlpha( 0.7 );
      this.dataPath.stroke = color.darkerColor( 0.5 ).withAlpha( 0.8 );
    }
    else {
      this.dataPath.fill = QuantumWaveInterferenceColors.particleHistogramFillProperty;
      this.dataPath.stroke = QuantumWaveInterferenceColors.particleHistogramStrokeProperty;
    }
  }

  private paintIntensityCurve( scene: SidewaysGraphSceneLike ): void {
    if ( !scene.isEmittingProperty.value ) {
      this.dataPath.shape = null;
      return;
    }

    const zoomScale = linear( 1, 6, 0.3, 2.0, this.zoomLevelProperty.value );
    const sourceIntensity = scene.intensityProperty ? scene.intensityProperty.value : 1;
    const screenHalfWidth = scene.screenHalfWidth;

    const NUM_SAMPLES = 500;
    const shape = new Shape();

    const firstY = ( 0.5 / NUM_SAMPLES ) * GRAPH_HEIGHT;
    shape.moveTo( 0, firstY );

    for ( let i = 0; i < NUM_SAMPLES; i++ ) {
      const fraction = ( i + 0.5 ) / NUM_SAMPLES;
      const physicalX = ( fraction - 0.5 ) * 2 * screenHalfWidth;
      const intensity = scene.getIntensityAtPosition( physicalX );

      const viewY = fraction * GRAPH_HEIGHT;
      const viewX = intensity * sourceIntensity * GRAPH_WIDTH * zoomScale;

      shape.lineTo( viewX, viewY );
    }

    const lastY = ( ( NUM_SAMPLES - 0.5 ) / NUM_SAMPLES ) * GRAPH_HEIGHT;
    shape.lineTo( 0, lastY );
    shape.close();

    this.dataPath.shape = shape;
    this.dataPath.lineWidth = 1.5;

    if ( scene.sourceType === 'photons' ) {
      const color = VisibleColor.wavelengthToColor( scene.wavelengthProperty.value );
      this.dataPath.fill = color.withAlpha( 0.3 );
      this.dataPath.stroke = color.darkerColor( 0.5 ).withAlpha( 0.8 );
    }
    else {
      this.dataPath.fill = QuantumWaveInterferenceColors.particleHistogramFillProperty;
      this.dataPath.stroke = QuantumWaveInterferenceColors.particleHistogramStrokeProperty;
    }
  }

  public reset(): void {
    this.zoomLevelProperty.reset();
  }
}
