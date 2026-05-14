// Copyright 2026, University of Colorado Boulder

/**
 * WaveRegionNodes creates the wave visualization region, double slit node, and derived slit
 * separation range property shared by the High Intensity and Single Particles screen views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import type TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import { combineOptions } from '../../../../phet-core/js/optionize.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { type BarrierType } from '../model/BarrierType.js';
import { type WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import DoubleSlitNode, { type DoubleSlitNodeOptions } from './DoubleSlitNode.js';
import WaveVisualizationNode from './WaveVisualizationNode.js';

type WaveRegionModel = {
  readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene & { readonly slitSeparationRange: Range }>;
  readonly currentBarrierTypeProperty: TReadOnlyProperty<BarrierType>;
  readonly currentSlitPositionFractionProperty: TProperty<number>;
  readonly currentSlitSeparationProperty: TReadOnlyProperty<number>;
  readonly currentSlitConfigurationProperty: TReadOnlyProperty<string>;
};

type WaveRegionNodesOptions = {
  waveRegionLeft: number;
  waveRegionTop: number;
  additionalDoubleSlitOptions?: Partial<DoubleSlitNodeOptions>;
};

export default class WaveRegionNodes extends Node {

  public readonly waveVisualizationNode: WaveVisualizationNode;
  public readonly doubleSlitNode: DoubleSlitNode;

  public constructor( model: WaveRegionModel, options: WaveRegionNodesOptions ) {

    const waveVisualizationNode = new WaveVisualizationNode( model.sceneProperty, {
      x: options.waveRegionLeft,
      y: options.waveRegionTop
    } );

    const slitSeparationRangeProperty = new DerivedProperty(
      [ model.sceneProperty ],
      scene => scene.slitSeparationRange
    );

    const doubleSlitNodeOptions = combineOptions<DoubleSlitNodeOptions>( {
      isTopSlitCoveredProperty: new DerivedProperty(
        [ model.currentSlitConfigurationProperty ],
        slitConfig => slitConfig === 'leftCovered'
      ),
      isBottomSlitCoveredProperty: new DerivedProperty(
        [ model.currentSlitConfigurationProperty ],
        slitConfig => slitConfig === 'rightCovered'
      ),
      x: options.waveRegionLeft,
      y: options.waveRegionTop
    }, options.additionalDoubleSlitOptions );

    const doubleSlitNode = new DoubleSlitNode(
      model.currentBarrierTypeProperty,
      model.currentSlitPositionFractionProperty,
      model.currentSlitSeparationProperty,
      slitSeparationRangeProperty,
      doubleSlitNodeOptions
    );

    super( {
      children: [ waveVisualizationNode, doubleSlitNode ]
    } );

    this.waveVisualizationNode = waveVisualizationNode;
    this.doubleSlitNode = doubleSlitNode;
  }
}
