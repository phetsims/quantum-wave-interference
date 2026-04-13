// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityDetectorScreenNode is the skewed parallelogram-shaped detector screen for the High Intensity screen.
 * It displays either intensity bands or hit dots, matching the appearance of the Experiment screen detector.
 *
 * Currently renders as a placeholder skewed black rectangle. Hit/intensity rendering will be added in a
 * subsequent iteration.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Node, { NodeOptions } from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import HighIntensityConstants from '../HighIntensityConstants.js';
import HighIntensityModel from '../model/HighIntensityModel.js';

type SelfOptions = EmptySelfOptions;

type HighIntensityDetectorScreenNodeOptions = SelfOptions & NodeOptions;

export default class HighIntensityDetectorScreenNode extends Node {

  public constructor( model: HighIntensityModel, providedOptions?: HighIntensityDetectorScreenNodeOptions ) {

    const options = optionize<HighIntensityDetectorScreenNodeOptions, SelfOptions, NodeOptions>()( {}, providedOptions );

    super( options );

    // Skewed parallelogram shape for the detector screen, perspective-like
    const skew = HighIntensityConstants.DETECTOR_SCREEN_SKEW;
    const screenWidth = HighIntensityConstants.DETECTOR_SCREEN_WIDTH;
    const screenHeight = HighIntensityConstants.WAVE_REGION_HEIGHT;

    const shape = new Shape()
      .moveTo( skew, 0 )
      .lineTo( skew + screenWidth, 0 )
      .lineTo( screenWidth, screenHeight )
      .lineTo( 0, screenHeight )
      .close();

    const screenPath = new Path( shape, {
      fill: 'black',
      stroke: '#333',
      lineWidth: 1
    } );
    this.addChild( screenPath );
  }
}
