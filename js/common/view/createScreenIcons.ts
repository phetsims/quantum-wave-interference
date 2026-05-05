// Copyright 2026, University of Colorado Boulder

/**
 * Factory functions that create ScreenIcon instances for the three screens of the Quantum Wave Interference
 * simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenIcon, { MINIMUM_HOME_SCREEN_ICON_SIZE } from '../../../../joist/js/ScreenIcon.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import experimentScreenIcon_svg from '../../../images/experimentScreenIcon_svg.js';
import highIntensityScreenIcon_svg from '../../../images/highIntensityScreenIcon_svg.js';
import singleParticlesScreenIcon_svg from '../../../images/singleParticlesScreenIcon_svg.js';

const createScreenIcon = ( image: HTMLImageElement ): ScreenIcon => {
  return new ScreenIcon( new Image( image ), {
    size: MINIMUM_HOME_SCREEN_ICON_SIZE,
    maxIconWidthProportion: 1,
    maxIconHeightProportion: 1
  } );
};

export const createExperimentScreenIcon = (): ScreenIcon => createScreenIcon( experimentScreenIcon_svg );

export const createHighIntensityScreenIcon = (): ScreenIcon => createScreenIcon( highIntensityScreenIcon_svg );

export const createSingleParticlesScreenIcon = (): ScreenIcon => createScreenIcon( singleParticlesScreenIcon_svg );
