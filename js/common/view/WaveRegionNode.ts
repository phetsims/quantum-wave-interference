// Copyright 2026, University of Colorado Boulder

/**
 * WaveRegionNode creates the wave visualization region, double slit node, and derived slit
 * separation range property shared by the High Intensity and Single Particles screen views.
 *
 * This Node is a plain layout container and is not instrumented for PhET-iO. Its double slit child is
 * instrumented directly under the provided (screen view) tandem as 'barrierNode', so that hiding or
 * restructuring this container has no PhET-iO consequences.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import type TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Range from '../../../../dot/js/Range.js';
import optionize, { combineOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import { type BarrierType } from '../model/BarrierType.js';
import { isBottomSlitCovered, isTopSlitCovered, type SlitConfigurationWithNoBarrier } from '../model/SlitConfiguration.js';
import { type WaveVisualizableScene } from '../model/WaveVisualizableScene.js';
import DoubleSlitNode, { type DoubleSlitNodeOptions } from './DoubleSlitNode.js';
import WaveVisualizationNode from './WaveVisualizationNode.js';

// Structural model type for the shared wave region view. This is intentionally narrower than
// HighIntensityModel or SingleParticlesModel so this Node only depends on the active scene and
// slit state needed to render the wave visualization and double slit.
type WaveRegionModel = {

  // Active scene, including the scene-specific allowed slit separation range (in millimeters).
  readonly sceneProperty: TReadOnlyProperty<WaveVisualizableScene & { readonly slitSeparationRange: Range }>;

  // Whether the active source is emitting.
  readonly currentIsEmittingProperty: TReadOnlyProperty<boolean>;

  // Whether the sim clock is running, used to decide whether moving the barrier announces its direction or defers to
  // the wave-restart description.
  readonly isPlayingProperty: TReadOnlyProperty<boolean>;

  // Active barrier type controls whether the barrier/double slit is shown.
  readonly currentBarrierTypeProperty: TReadOnlyProperty<BarrierType>;

  // Fractional x-position of the slit assembly within the wave region.
  readonly currentBarrierPositionFractionProperty: TProperty<number>;

  // Current physical separation between the two slits, in millimeters.
  readonly currentSlitSeparationProperty: TReadOnlyProperty<number>;

  // Current slit coverage/detector/no-barrier setting, used here to cover the top or bottom slit.
  readonly currentSlitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>;
};

type WaveRegionNodeSelfOptions = {

  // Left edge of the wave visualization region in parent coordinates.
  waveRegionLeft: number;

  // Top edge of the wave visualization region in parent coordinates.
  waveRegionTop: number;

  // Screen-specific DoubleSlitNode options, such as detector overlays on the High Intensity screen.
  additionalDoubleSlitOptions?: Partial<DoubleSlitNodeOptions>;
};

/**
 * Options for WaveRegionNode. Screen views pass screen-specific layout coordinates and optional DoubleSlitNode
 * overrides (e.g., detector overlays on the High Intensity screen) via this type. The tandem is the parent
 * (screen view) tandem under which the 'barrierNode' child is instrumented; WaveRegionNode itself is not
 * instrumented.
 */
export type WaveRegionNodeOptions = WaveRegionNodeSelfOptions & PickRequired<PhetioObjectOptions, 'tandem'>;

export default class WaveRegionNode extends Node {

  // Retained by screen views for accessibility state queries (getAccessibleViewState) and PDOM ordering.
  public readonly waveVisualizationNode: WaveVisualizationNode;

  // Retained by screen views to wire up slit-position slider layout, accessibility descriptions, and PDOM ordering.
  // Instrumented for PhET-iO as 'barrierNode', since the node represents the entire barrier, not just the slits.
  public readonly doubleSlitNode: DoubleSlitNode;

  public constructor( model: WaveRegionModel, providedOptions: WaveRegionNodeOptions ) {

    const options = optionize<
      WaveRegionNodeOptions,
      StrictOmit<WaveRegionNodeSelfOptions, 'additionalDoubleSlitOptions'>,
      PickRequired<PhetioObjectOptions, 'tandem'>
    >()( {}, providedOptions );

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
        slitConfig => isTopSlitCovered( slitConfig )
      ),
      isBottomSlitCoveredProperty: new DerivedProperty(
        [ model.currentSlitConfigurationProperty ],
        slitConfig => isBottomSlitCovered( slitConfig )
      ),
      tandem: options.tandem.createTandem( 'barrierNode' ),
      x: options.waveRegionLeft,
      y: options.waveRegionTop
    }, options.additionalDoubleSlitOptions );

    const doubleSlitNode = new DoubleSlitNode(
      model.sceneProperty,
      model.currentBarrierTypeProperty,
      model.currentBarrierPositionFractionProperty,
      model.currentSlitSeparationProperty,
      slitSeparationRangeProperty,
      model.currentIsEmittingProperty,
      model.isPlayingProperty,
      doubleSlitNodeOptions
    );

    super( {
      children: [ waveVisualizationNode, doubleSlitNode ]
    } );

    this.waveVisualizationNode = waveVisualizationNode;
    this.doubleSlitNode = doubleSlitNode;
  }
}
