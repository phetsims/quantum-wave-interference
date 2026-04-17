// Copyright 2026, University of Colorado Boulder

/**
 * ParticleMassAnnotationNode displays the particle mass for the currently selected scene when a
 * matter-particle scene (Electrons, Neutrons, Helium Atoms) is active. For Photons, it is hidden.
 *
 * Uses RichText because the YAML strings contain HTML sub/superscript markup (e.g., m<sub>e</sub>).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import RichText from '../../../../scenery/js/nodes/RichText.js';
import { type SourceType } from '../model/SourceType.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';

const MASS_LABEL_FONT = new PhetFont( 13 );

type SceneLike = { sourceType: SourceType };

export default class ParticleMassAnnotationNode extends RichText {

  public constructor( sceneProperty: TReadOnlyProperty<SceneLike> ) {

    const massLabelStringProperty = new DerivedProperty( [
      sceneProperty,
      QuantumWaveInterferenceFluent.electronMassLabelStringProperty,
      QuantumWaveInterferenceFluent.neutronMassLabelStringProperty,
      QuantumWaveInterferenceFluent.heliumAtomMassLabelStringProperty
    ], ( scene, electronMass, neutronMass, heliumAtomMass ) =>
      scene.sourceType === 'electrons' ? electronMass :
      scene.sourceType === 'neutrons' ? neutronMass :
      scene.sourceType === 'heliumAtoms' ? heliumAtomMass :
      scene.sourceType === 'photons' ? '' :
      ( () => { throw new Error( `Unrecognized sourceType: ${scene.sourceType}` ); } )()
    );

    const isVisibleProperty = new DerivedProperty(
      [ sceneProperty ],
      scene => scene.sourceType !== 'photons'
    );

    super( massLabelStringProperty, {
      font: MASS_LABEL_FONT,
      fill: '#555',
      maxWidth: 200,
      visibleProperty: isVisibleProperty
    } );
  }
}
