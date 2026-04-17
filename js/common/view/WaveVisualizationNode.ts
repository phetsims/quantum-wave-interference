// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationNode is the black rectangle representing the wave visualization region. It contains
 * a canvas-based wave field rendering that updates each frame. Used by both the High Intensity and
 * Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../../axon/js/Multilink.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { roundSymmetric } from '../../../../dot/js/util/roundSymmetric.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import WaveVisualizationCanvasNode from './WaveVisualizationCanvasNode.js';

type SelfOptions = EmptySelfOptions;

type WaveVisualizationNodeOptions = SelfOptions & NodeOptions;

const CORNER_RADIUS = 10;
const SCALE_MARGIN = 8;

// "Nice" multipliers within each power of 10 for human-friendly scale labels
const NICE_MULTIPLIERS = [ 1, 2, 5 ];
const TARGET_BAR_PX = 50;
const MIN_BAR_PX = 25;
const MAX_BAR_PX = 100;

/**
 * Finds a "nice" round physical distance (in meters) whose scale bar is close to the target pixel width.
 */
const computeNiceScale = ( regionWidthMeters: number, regionWidthPixels: number ): { distanceMeters: number; barPixels: number } => {
  const metersPerPixel = regionWidthMeters / regionWidthPixels;
  const targetMeters = TARGET_BAR_PX * metersPerPixel;

  // Find the power of 10 just below targetMeters
  const exponent = Math.floor( Math.log10( targetMeters ) );

  let bestDistance = targetMeters;
  let bestPixels = TARGET_BAR_PX;
  let bestError = Infinity;

  for ( let e = exponent - 1; e <= exponent + 1; e++ ) {
    for ( const m of NICE_MULTIPLIERS ) {
      const candidate = m * Math.pow( 10, e );
      const pixels = candidate / metersPerPixel;
      if ( pixels >= MIN_BAR_PX && pixels <= MAX_BAR_PX ) {
        const error = Math.abs( pixels - TARGET_BAR_PX );
        if ( error < bestError ) {
          bestError = error;
          bestDistance = candidate;
          bestPixels = pixels;
        }
      }
    }
  }

  return { distanceMeters: bestDistance, barPixels: bestPixels };
};

/**
 * Formats a distance in meters into a human-readable string with appropriate units.
 */
const formatDistance = ( meters: number ): string => {
  if ( meters >= 1e-3 ) {
    const mm = meters * 1e3;
    return StringUtils.fillIn( QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty.value, {
      value: mm >= 10 ? roundSymmetric( mm ) : parseFloat( mm.toPrecision( 2 ) )
    } );
  }
  else {
    const um = meters * 1e6;
    return StringUtils.fillIn( QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty.value, {
      value: um >= 10 ? roundSymmetric( um ) : parseFloat( um.toPrecision( 2 ) )
    } );
  }
};

export default class WaveVisualizationNode extends Node {

  private readonly waveCanvas: WaveVisualizationCanvasNode;

  public constructor( sceneProperty: TReadOnlyProperty<WaveVisualizableScene>, providedOptions?: WaveVisualizationNodeOptions ) {

    const options = optionize<WaveVisualizationNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    const width = QuantumWaveInterferenceConstants.WAVE_REGION_WIDTH;
    const height = QuantumWaveInterferenceConstants.WAVE_REGION_HEIGHT;

    const backgroundRect = new Rectangle( 0, 0, width, height, {
      cornerRadius: CORNER_RADIUS,
      fill: 'black'
    } );
    this.addChild( backgroundRect );

    this.waveCanvas = new WaveVisualizationCanvasNode( sceneProperty, width, height );
    this.waveCanvas.clipArea = backgroundRect.getShape()!;
    this.addChild( this.waveCanvas );

    // Distance scale indicator with bar in the top-left corner
    const scaleFont = new PhetFont( 11 );
    const scaleLabelColor = 'white';
    const tickHeight = 6;

    const leftTick = new Line( 0, 0, 0, tickHeight, { stroke: scaleLabelColor, lineWidth: 1 } );
    const bar = new Line( 0, tickHeight / 2, TARGET_BAR_PX, tickHeight / 2, { stroke: scaleLabelColor, lineWidth: 1 } );
    const rightTick = new Line( 0, 0, 0, tickHeight, { stroke: scaleLabelColor, lineWidth: 1 } );

    const scaleBarNode = new Node( { children: [ leftTick, bar, rightTick ] } );

    const distanceLabel = new Text( '', {
      font: scaleFont,
      fill: scaleLabelColor,
      maxWidth: 80
    } );

    const distanceScaleNode = new HBox( {
      spacing: 4,
      children: [ scaleBarNode, distanceLabel ],
      left: SCALE_MARGIN,
      top: SCALE_MARGIN
    } );
    this.addChild( distanceScaleNode );

    // Update scale bar and label when the scene or locale changes. formatDistance reads from
    // valueMillimetersPatternStringProperty and valueMicrometersPatternStringProperty, so both
    // must be dependencies to re-render on locale change.
    Multilink.multilink(
      [ sceneProperty,
        QuantumWaveInterferenceFluent.valueMillimetersPatternStringProperty,
        QuantumWaveInterferenceFluent.valueMicrometersPatternStringProperty ],
      scene => {
        const { distanceMeters, barPixels } = computeNiceScale( scene.regionWidth, width );
        bar.setX2( barPixels );
        rightTick.left = bar.right;
        distanceLabel.string = formatDistance( distanceMeters );
      }
    );

    // Time scale label in the bottom-left corner (e.g., "1 fs = 10⁻¹⁵ s")
    const timeLabel = new Text( QuantumWaveInterferenceFluent.timeScaleLabelStringProperty, {
      font: scaleFont,
      fill: scaleLabelColor,
      maxWidth: 120
    } );
    timeLabel.left = SCALE_MARGIN;
    timeLabel.bottom = height - SCALE_MARGIN;
    this.addChild( timeLabel );
  }

  public step(): void {
    this.waveCanvas.invalidatePaint();
  }
}
