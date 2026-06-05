// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Single Particles screen. Extends BaseScreenModel with Single Particles–specific
 * state: slit configuration, auto-repeat, packet state, detector tool, and hits graph visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import { type SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrierValues } from '../../common/model/SlitConfiguration.js';
import CurrentDetectorTool from './CurrentDetectorTool.js';
import SingleParticlesSceneModel from './SingleParticlesSceneModel.js';

const NORMAL_TIME_SPEED_FACTOR = 0.7;
const FAST_TIME_SPEED_FACTOR = 8;

type SingleParticlesModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SingleParticlesModel extends BaseScreenModel<SingleParticlesSceneModel> {

  public readonly photonsScene: SingleParticlesSceneModel;

  // DynamicProperties specific to this screen
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, SingleParticlesSceneModel>;
  public readonly currentAutoRepeatProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentIsPacketActiveProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentDetectorTool: CurrentDetectorTool;

  // Tool visibility specific to this screen
  public readonly isHitsGraphVisibleProperty: BooleanProperty;

  public constructor( providedOptions: SingleParticlesModelOptions ) {

    const tandem = providedOptions.tandem;
    const scenesTandem = tandem.createTandem( 'scenes' );

    const photonsScene = new SingleParticlesSceneModel( { sourceType: 'photons', tandem: scenesTandem.createTandem( 'photonsScene' ) } );

    const scenes = [
      photonsScene,
      new SingleParticlesSceneModel( { sourceType: 'electrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'electronsScene' ) } ),
      new SingleParticlesSceneModel( { sourceType: 'neutrons', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'neutronsScene' ) } ),
      new SingleParticlesSceneModel( { sourceType: 'heliumAtoms', defaultMatterWaveDisplayMode: 'realPart', tandem: scenesTandem.createTandem( 'heliumAtomsScene' ) } )
    ];

    super( scenes, {
      normal: NORMAL_TIME_SPEED_FACTOR,
      fast: FAST_TIME_SPEED_FACTOR
    }, providedOptions );

    this.photonsScene = photonsScene;

    this.currentSlitConfigurationProperty = new DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentSlitConfigurationProperty' ),
      phetioFeatured: true,
      phetioValueType: StringUnionIO( SlitConfigurationWithNoBarrierValues )
    } );

    this.currentAutoRepeatProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'autoRepeatProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentAutoRepeatProperty' ),
      phetioFeatured: true,
      phetioValueType: BooleanIO
    } );

    this.currentIsPacketActiveProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isPacketActiveProperty'
    } );

    this.isHitsGraphVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isHitsGraphVisibleProperty' )
    } );

    this.currentDetectorTool = new CurrentDetectorTool(
      this.sceneProperty,
      this.currentSlitConfigurationProperty,
      this.toolsTandem
    );

  }

  public override takeSnapshot(): void {
    this.sceneProperty.value.takeSingleParticlesSnapshot();
  }

  protected override resetToolVisibility(): void {
    this.isHitsGraphVisibleProperty.reset();
    this.currentDetectorTool.isVisibleProperty.reset();
  }
}
