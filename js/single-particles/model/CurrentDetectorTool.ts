// Copyright 2026, University of Colorado Boulder

/**
 * CurrentDetectorTool provides a screen-level interface to the detector tool state for the active Single Particles
 * scene. The detector tool's position, radius, measurement state, and probability are scene-specific, so this class
 * exposes DynamicProperties that follow SingleParticlesModel.sceneProperty.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import type Property from '../../../../axon/js/Property.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import type Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import { type DetectorProbeState } from './DetectorProbe.js';
import SingleParticlesSceneModel from './SingleParticlesSceneModel.js';

export default class CurrentDetectorTool {

  public readonly positionProperty: DynamicProperty<Vector2, Vector2, SingleParticlesSceneModel>;
  public readonly radiusProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;
  public readonly stateProperty: DynamicProperty<DetectorProbeState, DetectorProbeState, SingleParticlesSceneModel>;
  public readonly probabilityProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;

  // True only when the slit configuration is 'noBarrier'; the detector tool is hidden and disabled for all other
  // barrier configurations. Consumed by the view to gate both checkbox visibility and probe interactivity.
  public readonly isAvailableProperty: TReadOnlyProperty<boolean>;

  // PhET-iO-instrumented user preference controlling whether the detector tool is shown. The view combines this with
  // isAvailableProperty so the tool is visible only when both are true.
  public readonly isVisibleProperty: BooleanProperty;

  // Shared radius range for the detector tool, captured from the initial scene. All scenes must expose the same range
  // as an invariant; the range is used directly by DetectorProbeNode to configure its drag bounds.
  public readonly radiusRange: Range;

  private readonly sceneProperty: Property<SingleParticlesSceneModel>;

  public constructor(
    sceneProperty: Property<SingleParticlesSceneModel>,
    currentSlitConfigurationProperty: TReadOnlyProperty<SlitConfigurationWithNoBarrier>,
    toolsTandem: Tandem
  ) {
    this.sceneProperty = sceneProperty;
    this.radiusRange = sceneProperty.value.detectorProbe.radiusProperty.range;

    this.positionProperty = new DynamicProperty<Vector2, Vector2, SingleParticlesSceneModel>( sceneProperty, {
      derive: scene => scene.detectorProbe.positionProperty,
      bidirectional: true
    } );

    this.radiusProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( sceneProperty, {
      derive: scene => scene.detectorProbe.radiusProperty,
      bidirectional: true
    } );

    this.stateProperty = new DynamicProperty<DetectorProbeState, DetectorProbeState, SingleParticlesSceneModel>( sceneProperty, {
      derive: scene => scene.detectorProbe.stateProperty,
      bidirectional: true
    } );

    this.probabilityProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( sceneProperty, {
      derive: scene => scene.detectorProbe.probabilityProperty
    } );

    this.isAvailableProperty = new DerivedProperty( [ currentSlitConfigurationProperty ],
      slitConfiguration => slitConfiguration === 'noBarrier'
    );

    this.isVisibleProperty = new BooleanProperty( true, {
      tandem: toolsTandem.createTandem( 'isDetectorProbeVisibleProperty' ),
      phetioFeatured: true
    } );
  }

  /**
   * Performs a detector-tool measurement on the active scene. This delegates to the scene so the measurement uses the
   * active packet, solver state, and scene-specific detector tool settings.
   */
  public performMeasurement(): void {
    this.sceneProperty.value.performDetectorMeasurement();
  }

  /**
   * Resets the detector tool measurement state for the active scene, leaving position and size unchanged.
   */
  public resetState(): void {
    this.sceneProperty.value.detectorProbe.resetMeasurementState();
  }
}
