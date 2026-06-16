// Copyright 2026, University of Colorado Boulder

/**
 * Creates the screen-level DynamicProperty that follows the active scene's detector-screen display mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import TProperty from '../../../../axon/js/TProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import StringUnionIO from '../../../../tandem/js/types/StringUnionIO.js';
import { type DetectionMode, DetectionModeValues } from './DetectionMode.js';

/**
 * Structural contract for scene objects whose detection mode is tracked by the DynamicProperty created here.
 * Any scene passed to createCurrentDetectionModeProperty must satisfy this shape.
 */
type SceneWithDetectionMode = {
  detectionModeProperty: TProperty<DetectionMode>;
};

/**
 * Creates a bidirectional DynamicProperty for the detector-screen display mode of the active scene.
 *
 * @param sceneProperty - Property containing the active scene
 * @param tandem - parent tandem for the currentDetectionModeProperty
 * @returns DynamicProperty wired to the active scene's detectionModeProperty
 */
export default function createCurrentDetectionModeProperty<T extends SceneWithDetectionMode>(
  sceneProperty: TReadOnlyProperty<T>,
  tandem: Tandem
): DynamicProperty<DetectionMode, DetectionMode, T> {
  return new DynamicProperty<DetectionMode, DetectionMode, T>( sceneProperty, {
    derive: scene => scene.detectionModeProperty,
    bidirectional: true,
    tandem: tandem.createTandem( 'currentDetectionModeProperty' ),
    phetioFeatured: true,
    phetioDocumentation: 'The detector screen display mode for the current source scene.',
    phetioReadOnly: true,
    phetioState: false,
    phetioValueType: StringUnionIO( DetectionModeValues ),
    validValues: DetectionModeValues
  } );
}
