// Copyright 2026, University of Colorado Boulder

/**
 * Top-level model for the Single Particles screen. Extends BaseScreenModel with Single Particles–specific
 * state: slit configuration, auto-repeat, packet state, detector probe, and hits graph visibility.
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
import CurrentDetectorProbe from './CurrentDetectorProbe.js';
import SingleParticlesSceneModel from './SingleParticlesSceneModel.js';

// Single Particles uses slower continuous-wave motion than High Intensity so individual packet travel is visible at
// normal speed. The fast factor is much larger (8×) to let users skip ahead without losing packet-scale detail.
const NORMAL_TIME_SPEED_FACTOR = 0.7;
const FAST_TIME_SPEED_FACTOR = 8;

// Only the tandem is required; all other PhetioObjectOptions use defaults supplied by BaseScreenModel.
type SingleParticlesModelOptions = PickRequired<PhetioObjectOptions, 'tandem'>;

export default class SingleParticlesModel extends BaseScreenModel<SingleParticlesSceneModel> {

  private readonly photonsScene: SingleParticlesSceneModel;

  // Bidirectional DynamicProperties that proxy the active scene's corresponding Properties. Writing through these
  // propagates to the currently selected scene; reading always reflects the active scene's value.
  public readonly currentSlitConfigurationProperty: DynamicProperty<SlitConfigurationWithNoBarrier, SlitConfigurationWithNoBarrier, SingleParticlesSceneModel>;
  public readonly currentAutoRepeatProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;

  // Read-only proxy: true while the active scene has a particle packet in flight.
  public readonly currentIsPacketActiveProperty: DynamicProperty<boolean, boolean, SingleParticlesSceneModel>;
  public readonly currentDetectorProbe: CurrentDetectorProbe;

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
      phetioReadOnly: true,
      phetioState: false,
      phetioValueType: StringUnionIO( SlitConfigurationWithNoBarrierValues )
    } );

    this.currentAutoRepeatProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'autoRepeatProperty',
      bidirectional: true,
      tandem: tandem.createTandem( 'currentAutoRepeatProperty' ),
      phetioFeatured: true,
      phetioReadOnly: true,
      phetioState: false,
      phetioValueType: BooleanIO
    } );

    this.currentIsPacketActiveProperty = new DynamicProperty<boolean, boolean, SingleParticlesSceneModel>( this.sceneProperty, {
      derive: 'isPacketActiveProperty'
    } );

    this.isHitsGraphVisibleProperty = new BooleanProperty( false, {
      tandem: this.toolsTandem.createTandem( 'isHitsGraphVisibleProperty' ),
      phetioFeatured: true
    } );

    this.currentDetectorProbe = new CurrentDetectorProbe(
      this.sceneProperty,
      this.currentSlitConfigurationProperty,
      this.toolsTandem
    );

  }

  /**
   * Delegates snapshot capture to the active scene's single-particles snapshot method, which records the current
   * hit-pattern data. Called by the view's snapshot button handler.
   */
  public override takeSnapshot(): void {
    this.sceneProperty.value.takeSingleParticlesSnapshot();
  }

  /**
   * Resets the hits-graph visibility and detector probe visibility. Called during reset() after shared tool Properties
   * have been reset.
   */
  protected override resetToolVisibility(): void {
    this.isHitsGraphVisibleProperty.reset();
    this.currentDetectorProbe.isVisibleProperty.reset();
  }
}
