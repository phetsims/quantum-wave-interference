// Copyright 2026, University of Colorado Boulder

/**
 * Shared layout constants for the source controls. Keeping these in one file lets the photon, particle, and intensity
 * controls maintain matching slider geometry and label sizing without coupling their implementations to
 * SourceControlPanel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';

const DEFAULT_SLIDER_TRACK_WIDTH = 130;

export const SOURCE_CONTROL_TITLE_FONT = new PhetFont( 14 );
export const SOURCE_CONTROL_TICK_LABEL_FONT = new PhetFont( 12 );
export const SOURCE_CONTROL_SLIDER_TRACK_WIDTH = DEFAULT_SLIDER_TRACK_WIDTH * 1.15;
export const SOURCE_CONTROL_SLIDER_TRACK_HEIGHT = 3;
export const SOURCE_CONTROL_PHOTON_INTENSITY_LABEL_SPACING = 4;
export const SOURCE_CONTROL_PARTICLE_INTENSITY_LABEL_SPACING = 2;
export const SOURCE_CONTROL_SECTION_SPACING = 16;
export const SOURCE_CONTROL_ROW_VERTICAL_MARGIN = 4;
