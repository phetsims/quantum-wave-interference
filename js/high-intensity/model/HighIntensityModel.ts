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
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import HighIntensitySceneModel from './HighIntensitySceneModel.js';

// Keep the highest-frequency High Intensity continuous waves below the 30 FPS Nyquist limit.
const FAST_TIME_SPEED_FACTOR = 0.65;
const ACCESSIBLE_STATE_STEP_INTERVAL = 10;

type HighIntensityModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensityModel extends BaseScreenModel<HighIntensitySceneModel> {

  // DynamicProperties specific to this screen
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, HighIntensitySceneModel>;
  public readonly currentDetectionModeProperty: DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>;

  // Tool visibility specific to this screen
  public readonly isIntensityGraphVisibleProperty: BooleanProperty;
  public readonly accessibleStateStepProperty: NumberProperty;
  private accessibleStateStepFrameCount: number;

  public constructor( providedOptions: HighIntensityModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    const scenes = [
      new HighIntensitySceneModel( { sourceType: 'photons', tandem: scenesTandem.createTandem( 'photonsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'electrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'electronsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'neutrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'neutronsScene' ) } ),
      new HighIntensitySceneModel( { sourceType: 'heliumAtoms', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'heliumAtomsScene' ) } )
    ];

    super( scenes, FAST_TIME_SPEED_FACTOR, providedOptions );

    this.accessibleStateStepFrameCount = 0;

    this.currentSlitConfigurationProperty = new DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true
    } );

    this.currentDetectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>( this.sceneProperty, {
      derive: 'detectionModeProperty',
      bidirectional: true
    } );

    this.isIntensityGraphVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isIntensityGraphVisibleProperty' )
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

  private stepAccessibleState(): void {
    this.accessibleStateStepFrameCount++;
    if ( this.accessibleStateStepFrameCount >= ACCESSIBLE_STATE_STEP_INTERVAL ) {
      this.accessibleStateStepFrameCount = 0;
      this.accessibleStateStepProperty.value++;
    }
  }

  public override stepOnce(): void {
    super.stepOnce();
    if ( this.currentIsEmittingProperty.value ) {
      this.stepAccessibleState();
    }
  }

  public override step( dt: number ): void {
    const effectiveDt = this.getEffectiveDt( dt );
    super.step( dt );

    if ( effectiveDt > 0 && this.currentIsEmittingProperty.value ) {
      this.stepAccessibleState();
    }
  }
}
