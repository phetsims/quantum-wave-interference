// Copyright 2026, University of Colorado Boulder

/**
 * HighIntensityDetectorScreenNode is the detector screen for the High Intensity screen.
 * Delegates to the shared DetectorScreenNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DetectorScreenNode, { type DetectorScreenNodeOptions } from '../../common/view/DetectorScreenNode.js';
import HighIntensityModel from '../model/HighIntensityModel.js';

export default class HighIntensityDetectorScreenNode extends DetectorScreenNode {

  public constructor( model: HighIntensityModel, providedOptions?: DetectorScreenNodeOptions ) {
    super( model.sceneProperty, providedOptions );
  }
}
