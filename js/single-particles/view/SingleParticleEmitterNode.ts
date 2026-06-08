// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticleEmitterNode displays the single-particle emitter source using the SingleParticleEmitter.svg image
 * with a red RoundStickyToggleButton overlaid on the body. The button toggles isEmittingProperty:
 * - When auto-repeat is off, the model turns isEmittingProperty back to false after the packet is detected,
 *   making the button pop back out automatically.
 * - When auto-repeat is on, the button stays toggled until the user clicks again.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PickRequired from '../../../../phet-core/js/types/PickRequired.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import RoundStickyToggleButton from '../../../../sun/js/buttons/RoundStickyToggleButton.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import singleParticleEmitter_svg from '../../../images/singleParticleEmitter_svg.js';
import { type SourceType } from '../../common/model/SourceType.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

type SelfOptions = EmptySelfOptions;

export type SingleParticleEmitterNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

const EMITTER_SCALE = 1.24;
const EMITTER_HEIGHT = 153 * EMITTER_SCALE;
const BUTTON_RADIUS = 23 * EMITTER_SCALE;

const BUTTON_CENTER_X_FRACTION = 0.32;
const BUTTON_CENTER_Y_FRACTION = 0.5;

type SceneLike = { sourceType: SourceType };

export default class SingleParticleEmitterNode extends Node {

  public constructor(
    sceneProperty: TReadOnlyProperty<SceneLike>,
    isEmittingProperty: TProperty<boolean>,
    isEmitterEnabledProperty: TReadOnlyProperty<boolean>,
    providedOptions: SingleParticleEmitterNodeOptions
  ) {

    const options = optionize<SingleParticleEmitterNodeOptions, SelfOptions, NodeOptions>()( {
      isDisposable: false
    }, providedOptions );

    super( options );

    const baseScale = EMITTER_HEIGHT / singleParticleEmitter_svg.height;
    const imageNode = new Image( singleParticleEmitter_svg );
    imageNode.setScaleMagnitude( baseScale, baseScale );
    this.addChild( imageNode );

    const sourceTypeProperty = sceneProperty.derived( scene => scene.sourceType );
    const isEmittingStringProperty = isEmittingProperty.derived( isEmitting => isEmitting ? 'true' : 'false' );

    // NOTE: see other duplicate in quantum-wave-interference/js/high-intensity/view/HighIntensitySourceBeamCalloutNode.ts.
    // These button options stay inline because RoundStickyToggleButton and LaserPointerNode own different option
    // surfaces and tandems.
    const emitButton = new RoundStickyToggleButton( isEmittingProperty, false, true, {
      baseColor: 'red',
      radius: BUTTON_RADIUS,
      valueUpSoundPlayer: sharedSoundPlayers.get( 'toggleOff' ),
      valueDownSoundPlayer: sharedSoundPlayers.get( 'toggleOn' ),
      accessibleName: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleName.createProperty( {
        sourceType: sourceTypeProperty
      } ),
      accessibleHelpText: QuantumWaveInterferenceFluent.a11y.emitterButton.accessibleHelpText.createProperty( {
        isEmitting: isEmittingStringProperty,
        sourceType: sourceTypeProperty
      } ),
      tandem: providedOptions.tandem.createTandem( 'emitButton' ),
      enabledProperty: isEmitterEnabledProperty
    } );

    emitButton.centerX = imageNode.width * BUTTON_CENTER_X_FRACTION;
    emitButton.centerY = imageNode.height * BUTTON_CENTER_Y_FRACTION;
    this.addChild( emitButton );
  }
}
