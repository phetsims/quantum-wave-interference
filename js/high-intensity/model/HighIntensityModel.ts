// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the High Intensity screen. Extends BaseScreenModel with High Intensity–specific
 * state: detection mode, intensity graph visibility, and slit configuration DynamicProperties
 * (including detector variants).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import createCurrentDetectionModeProperty from '../../common/model/createCurrentDetectionModeProperty.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from '../../common/model/SlitConfiguration.js';
import HighIntensitySceneModel from './HighIntensitySceneModel.js';

// Keep the highest-frequency High Intensity continuous waves below the 30 FPS Nyquist limit.
const NORMAL_TIME_SPEED_FACTOR = 0.35;
const FAST_TIME_SPEED_FACTOR = 0.65;

// Number of model step calls between accessible-state ticks while the source is emitting. The tick is exposed through
// accessibleStateStepProperty so accessible descriptions can periodically recompute semantic state for continuous
// changes such as wavefront travel and pattern formation, without announcing on every animation frame. This is a view
// update cadence for accessibility content, not a physical time interval.
const ACCESSIBLE_STATE_STEP_INTERVAL = 10;

// Only the tandem is required; all other PhetioObjectOptions use defaults supplied by BaseScreenModel.
type HighIntensityModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensityModel extends BaseScreenModel<HighIntensitySceneModel> {

  // DynamicProperties specific to this screen
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, HighIntensitySceneModel>;
  public readonly currentDetectionModeProperty: DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>;

  // Tool visibility specific to this screen
  public readonly isIntensityGraphVisibleProperty: BooleanProperty;

  // Monotonically increasing signal for accessible state consumers that need updates during continuous emission.
  public readonly accessibleStateStepProperty: NumberProperty;
  private accessibleStateStepFrameCount = 0;

  public constructor( providedOptions: HighIntensityModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    const scenes = [
      new HighIntensitySceneModel( { sourceType: 'photons', tandem: scenesTandem.createTandem( 'photonsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'electrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'electronsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'neutrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'neutronsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'heliumAtoms', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'heliumAtomsScene' ) } )
    ];

    super( scenes, {
      normal: NORMAL_TIME_SPEED_FACTOR,
      fast: FAST_TIME_SPEED_FACTOR
    }, providedOptions );

    this.currentSlitConfigurationProperty = new DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentSlitConfigurationProperty' ),
      phetioFeatured: true,
      phetioValueType: StringUnionIO( SlitConfigurationWithNoBarrierValues )
    } );

    this.currentDetectionModeProperty = createCurrentDetectionModeProperty( this.sceneProperty, tandem );

    this.isIntensityGraphVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isIntensityGraphVisibleProperty' ),
      phetioFeatured: true
    } );

    this.accessibleStateStepProperty = new NumberProperty( 0, {
      numberType: 'Integer',
      phetioReadOnly: true,
      tandem: tandem.createTandem( 'accessibleStateStepProperty' )
    } );
  }

  public override takeSnapshot(): void {
    this.sceneProperty.value.takeHighIntensitySnapshot();
  }

  protected override resetToolVisibility(): void {
    this.isIntensityGraphVisibleProperty.reset();
  }

  public override reset(): void {
    super.reset();
    this.accessibleStateStepFrameCount = 0;
    this.accessibleStateStepProperty.reset();
  }

  /**
   * Increments accessibleStateStepProperty every ACCESSIBLE_STATE_STEP_INTERVAL calls so that accessibility
   * describers can recompute semantic state without reacting to every animation frame. The frame counter resets
   * to zero each time the threshold is crossed.
   */
  private stepAccessibleState(): void {
    this.accessibleStateStepFrameCount++;
    if ( this.accessibleStateStepFrameCount >= ACCESSIBLE_STATE_STEP_INTERVAL ) {
      this.accessibleStateStepFrameCount = 0;
      this.accessibleStateStepProperty.value++;
    }
  }

  /**
   * Advances the active scene by one nominal visual time step (step-forward button). In addition to the base
   * behavior, ticks the accessible-state counter when the source is currently emitting so that describers
   * refresh semantic state after a manual step.
   */
  public override stepOnce(): void {
    super.stepOnce();
    if ( this.currentIsEmittingProperty.value ) {
      this.stepAccessibleState();
    }
  }

  /**
   * Advances the active scene for one animation frame. In addition to the base behavior, ticks the
   * accessible-state counter when the simulation is playing (effectiveDt > 0) and the source is emitting,
   * so that describers periodically refresh semantic state during continuous wave or particle emission.
   *
   * @param dt - elapsed real time since the previous animation frame, in seconds
   */
  public override step( dt: number ): void {
    const effectiveDt = this.getEffectiveDt( dt );
    super.step( dt );

    if ( effectiveDt > 0 && this.currentIsEmittingProperty.value ) {
      this.stepAccessibleState();
    }
  }
}
