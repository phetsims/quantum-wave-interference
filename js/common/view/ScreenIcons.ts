// Copyright 2026, University of Colorado Boulder

/**
 * ScreenIcon classes for the three screens of the Quantum Wave Interference
 * simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../../joist/js/ScreenIcon.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import experimentScreenIcon_svg from '../../../images/experimentScreenIcon_svg.js';
import highIntensityScreenIcon_svg from '../../../images/highIntensityScreenIcon_svg.js';
import singleParticlesScreenIcon_svg from '../../../images/singleParticlesScreenIcon_svg.js';

class QuantumWaveInterferenceScreenIcon extends ScreenIcon {

  protected constructor( image: HTMLImageElement ) {
    super( new Image( image ), {
      size: MINIMUM_HOME_SCREEN_ICON_SIZE,
      maxIconWidthProportion: 1,
      maxIconHeightProportion: 1
    } );
  }
}

export class ExperimentScreenIcon extends QuantumWaveInterferenceScreenIcon {

  public constructor() {
    super( experimentScreenIcon_svg );
  }
}

export class HighIntensityScreenIcon extends QuantumWaveInterferenceScreenIcon {

  public constructor() {
    super( highIntensityScreenIcon_svg );
  }
}

export class SingleParticlesScreenIcon extends QuantumWaveInterferenceScreenIcon {

  public constructor() {
    super( singleParticlesScreenIcon_svg );
  }
}
