// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationNode is the large black rectangle representing the wave visualization region in the
 * High Intensity screen. It contains a canvas-based wave field rendering that updates each frame.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import HighIntensityConstants from '../HighIntensityConstants.js';
import HighIntensityModel from '../model/HighIntensityModel.js';
import WaveVisualizationCanvasNode from './WaveVisualizationCanvasNode.js';

type SelfOptions = EmptySelfOptions;

type WaveVisualizationNodeOptions = SelfOptions & NodeOptions;

const CORNER_RADIUS = 10;

export default class WaveVisualizationNode extends Node {

  private readonly waveCanvas: WaveVisualizationCanvasNode;

  public constructor( model: HighIntensityModel, providedOptions?: WaveVisualizationNodeOptions ) {

    const options = optionize<WaveVisualizationNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    const backgroundRect = new Rectangle( 0, 0, HighIntensityConstants.WAVE_REGION_WIDTH, HighIntensityConstants.WAVE_REGION_HEIGHT, {
      cornerRadius: CORNER_RADIUS,
      fill: 'black'
    } );
    this.addChild( backgroundRect );

    this.waveCanvas = new WaveVisualizationCanvasNode( model );
    this.waveCanvas.clipArea = backgroundRect.getShape()!;
    this.addChild( this.waveCanvas );
  }

  public step(): void {
    this.waveCanvas.invalidatePaint();
  }
}
