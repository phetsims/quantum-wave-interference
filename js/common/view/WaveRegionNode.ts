// Copyright 2026, University of Colorado Boulder

/**
 * WaveRegionNode creates the wave visualization region, double slit node, and derived slit
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
import { type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { type WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import DoubleSlitNode, { type DoubleSlitNodeOptions } from './DoubleSlitNode.js';
import WaveVisualizationNode from './WaveVisualizationNode.js';

// Structural model type for the shared wave region view. This is intentionally narrower than
// HighIntensityModel or SingleParticlesModel so this Node only depends on the active scene and
// slit state needed to render the wave visualization and double slit.
type WaveRegionModel = {

  // Active scene, including the scene-specific allowed slit separation range.
  readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene & { readonly slitSeparationRange: Range }>;

  // Active barrier type controls whether the barrier/double slit is shown.
  readonly currentBarrierTypeProperty: TReadOnlyProperty<BarrierType>;

  // Fractional x-position of the slit assembly within the wave region.
  readonly currentSlitPositionFractionProperty: TProperty<number>;

  // Current physical separation between the two slits.
  readonly currentSlitSeparationProperty: TReadOnlyProperty<number>;

  // Current slit coverage/detector/no-barrier setting, used here to cover the top or bottom slit.
  readonly currentSlitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

type WaveRegionNodeOptions = {

  // Left edge of the wave visualization region in parent coordinates.
  waveRegionLeft: number;

  // Top edge of the wave visualization region in parent coordinates.
  waveRegionTop: number;

  // Screen-specific DoubleSlitNode options, such as detector overlays on the High Intensity screen.
  additionalDoubleSlitOptions?: Partial<DoubleSlitNodeOptions>;
};

export default class WaveRegionNode extends Node {

  public readonly waveVisualizationNode: WaveVisualizationNode;
  public readonly doubleSlitNode: DoubleSlitNode;

  public constructor( model: WaveRegionModel, options: WaveRegionNodeOptions ) {

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
