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
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier } from '../../common/model/SlitConfiguration.js';
import HighIntensitySceneModel from './HighIntensitySceneModel.js';

const FAST_TIME_SPEED_FACTOR = 1.25;

type HighIntensityModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class HighIntensityModel extends BaseScreenModel<HighIntensitySceneModel> {

  // DynamicProperties specific to this screen
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, HighIntensitySceneModel>;
  public readonly currentDetectionModeProperty: DynamicProperty<DetectionMode, DetectionMode, HighIntensitySceneModel>;

  // Tool visibility specific to this screen
  public readonly isIntensityGraphVisibleProperty: BooleanProperty;

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
  }

  public override takeSnapshot(): void {
    this.sceneProperty.value.takeHighIntensitySnapshot();
  }

  protected override resetToolVisibility(): void {
    this.isIntensityGraphVisibleProperty.reset();
  }
}
