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
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import createCurrentDetectionModeProperty from '../../common/model/createCurrentDetectionModeProperty.js';
import { type DetectionMode } from '../../common/model/DetectionMode.js';
import { type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from '../../common/model/SlitConfiguration.js';
import HighIntensitySceneModel from './HighIntensitySceneModel.js';

// Keep the highest-frequency High Intensity continuous waves below the 30 FPS Nyquist limit.
const NORMAL_TIME_SPEED_FACTOR = 0.35;
const FAST_TIME_SPEED_FACTOR = 0.65;

// Only the tandem is required; all other PhetioObjectOptions use defaults supplied by BaseScreenModel.
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
  }

  public override takeSnapshot(): void {
    this.sceneProperty.value.takeHighIntensitySnapshot();
  }

  protected override resetToolVisibility(): void {
    this.isIntensityGraphVisibleProperty.reset();
  }
}
