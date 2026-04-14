// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizationNode is the black rectangle representing the wave visualization region. It contains
 * a canvas-based wave field rendering that updates each frame. Used by both the High Intensity and
 * Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import type { WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import QuantumWaveInterferenceConstants from '../QuantumWaveInterferenceConstants.js';
import WaveVisualizationCanvasNode from './WaveVisualizationCanvasNode.js';

type SelfOptions = EmptySelfOptions;

type WaveVisualizationNodeOptions = SelfOptions & NodeOptions;

const CORNER_RADIUS = 10;

export default class WaveVisualizationNode extends Node {

  private readonly waveCanvas: WaveVisualizationCanvasNode;

  public constructor( sceneProperty: TReadOnlyProperty<WaveVisualizableScene>, providedOptions?: WaveVisualizationNodeOptions ) {

    const options = optionize<WaveVisualizationNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

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
  }

  public step(): void {
    this.waveCanvas.invalidatePaint();
  }
}
