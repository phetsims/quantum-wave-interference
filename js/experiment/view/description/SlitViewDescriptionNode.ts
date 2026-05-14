// Copyright 2026, University of Colorado Boulder

/**
 * SlitViewDescriptionNode provides the accessible paragraph for the magnified slit view.
 *
 * This is important non-interactive visual content: the slit view shows the barrier with two slits, their width,
 * and the current slit configuration (open/covered/detector). The slit width is a constant per scene that is
 * visible on screen but not accessible through any interactive control.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { toFixed } from '../../../../../dot/js/util/toFixed.js';
import Node from '../../../../../scenery/js/nodes/Node.js';
import QuantumWaveInterferenceFluent from '../../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../../ExperimentConstants.js';
import ExperimentModel from '../../model/ExperimentModel.js';

export default class SlitViewDescriptionNode extends Node {

  public constructor( model: ExperimentModel ) {

    const slitSettingProperty = model.currentSlitSettingProperty;
    const slitWidthStringProperty = model.sceneProperty.derived( scene => {
      const slitWidthMM = scene.slitWidth;
      const { slitWidthUM, decimalPlaces } = ExperimentConstants.slitWidthMMToMicrometers( slitWidthMM );
      return QuantumWaveInterferenceFluent.a11y.slitWidthMicrometersPattern.format( {
        value: toFixed( slitWidthUM, decimalPlaces )
      } );
    } );

    super( {
      accessibleParagraph:
        QuantumWaveInterferenceFluent.a11y.slitView.accessibleParagraph.createProperty( {
          slitWidth: slitWidthStringProperty,
          slitSetting: slitSettingProperty
        } )
    } );
  }
}
