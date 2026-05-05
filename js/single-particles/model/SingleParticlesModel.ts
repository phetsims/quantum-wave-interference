// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Single Particles screen. Extends BaseScreenModel with Single Particles–specific
 * state: slit configuration, auto-repeat, packet state, detector tool, and hits graph visibility.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import BaseScreenModel from '../../common/model/BaseScreenModel.js';
import SingleParticlesSceneModel, { type DetectorToolState, type SingleParticlesSlitConfiguration } from './SingleParticlesSceneModel.js';

type SingleParticlesModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SingleParticlesModel extends BaseScreenModel<SingleParticlesSceneModel> {

  public readonly photonsScene: SingleParticlesSceneModel;

  // DynamicProperties specific to this screen
  public readonly currentSlitConfigurationProperty: DynamicProperty<SingleParticlesSlitConfiguration, SingleParticlesSlitConfiguration, SingleParticlesSceneModel>;
  public readonly currentAutoRepeatProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentIsPacketActiveProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentDetectorToolPositionProperty: DynamicProperty<Vector2, Vector2, SingleParticlesSceneModel>;
  public readonly currentDetectorToolRadiusProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;
  public readonly currentDetectorToolStateProperty: DynamicProperty<DetectorToolState, DetectorToolState, SingleParticlesSceneModel>;
  public readonly currentDetectorToolProbabilityProperty: DynamicProperty<number, number, SingleParticlesSceneModel>;

  // Whether the detector tool UI is available (only when barrier is None)
  public readonly isDetectorToolAvailableProperty: TReadOnlyProperty<boolean>;

  // Tool visibility specific to this screen
  public readonly isHitsGraphVisibleProperty: BooleanProperty;
  public readonly isDetectorToolVisibleProperty: BooleanProperty;

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

    super( scenes, providedOptions );

    this.photonsScene = photonsScene;

    this.currentSlitConfigurationProperty = new DynamicProperty<SingleParticlesSlitConfiguration, SingleParticlesSlitConfiguration, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'slitConfigurationProperty',
      bidirectional: true
    } );

    this.currentAutoRepeatProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'autoRepeatProperty',
      bidirectional: true
    } );

    this.currentIsPacketActiveProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isPacketActiveProperty'
    } );

    this.currentDetectorToolPositionProperty = new DynamicProperty<Vector2, Vector2, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'detectorToolPositionProperty',
      bidirectional: true
    } );

    this.currentDetectorToolRadiusProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'detectorToolRadiusProperty',
      bidirectional: true
    } );

    this.currentDetectorToolStateProperty = new DynamicProperty<DetectorToolState, DetectorToolState, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'detectorToolStateProperty',
      bidirectional: true
    } );

    this.currentDetectorToolProbabilityProperty = new DynamicProperty<number, number, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'detectorToolProbabilityProperty'
    } );

    this.isDetectorToolAvailableProperty = new DerivedProperty(
      [ this.currentSlitConfigurationProperty ],
      slitConfiguration => slitConfiguration === 'noBarrier'
    );

    this.isHitsGraphVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isHitsGraphVisibleProperty' )
    } );

    this.isDetectorToolVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isDetectorToolVisibleProperty' )
    } );

  }

  public override takeSnapshot(): void {
    this.sceneProperty.value.takeSingleParticlesSnapshot();
  }

  protected override resetToolVisibility(): void {
    this.isHitsGraphVisibleProperty.reset();
    this.isDetectorToolVisibleProperty.reset();
  }
}
