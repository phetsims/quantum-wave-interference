// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticleEmitterNode displays the single-particle emitter source using the SingleParticleEmitter.svg image
 * with a red RoundStickyToggleButton overlaid on the body. The button toggles isEmittingProperty:
 * - When auto-repeat is off, the model turns isEmittingProperty back to false after the packet is detected,
 *   making the button pop back out automatically.
 * - When auto-repeat is on, the button stays toggled until the user clicks again.
 *
 * The SVG image is flipped horizontally so the cylindrical handle (with red button) is on the left and
 * the nozzle points right toward the wave visualization region, matching the design mockups.
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
import singleParticleEmitter_svg from '../../../images/singleParticleEmitter_svg.js';

type SelfOptions = EmptySelfOptions;

export type SingleParticleEmitterNodeOptions = SelfOptions & PickRequired<NodeOptions, 'tandem'> & NodeOptions;

const EMITTER_HEIGHT = 120;
const BUTTON_RADIUS = 14;

// After flipping, the cylindrical handle is on the left; place the button ~12% from the left edge.
const BUTTON_CENTER_X_FRACTION = 0.12;
const BUTTON_CENTER_Y_FRACTION = 0.5;

export default class SingleParticleEmitterNode extends Node {

  public constructor(
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
    imageNode.setScaleMagnitude( -baseScale, baseScale );
    imageNode.left = 0;
    this.addChild( imageNode );

    const emitButton = new RoundStickyToggleButton( isEmittingProperty, false, true, {
      baseColor: 'red',
      radius: BUTTON_RADIUS,
      tandem: providedOptions.tandem.createTandem( 'emitButton' )
    } );

    emitButton.centerX = imageNode.width * BUTTON_CENTER_X_FRACTION;
    emitButton.centerY = imageNode.height * BUTTON_CENTER_Y_FRACTION;
    this.addChild( emitButton );

    isEmitterEnabledProperty.link( isEnabled => {
      emitButton.enabled = isEnabled;
    } );
  }
}
