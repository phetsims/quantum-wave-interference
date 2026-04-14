// Copyright 2026, University of Colorado Boulder

/**
 * SingleParticlesDetectorScreenNode is the detector screen for the Single Particles screen.
 * Delegates to the shared DetectorScreenNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DetectorScreenNode, { type DetectorScreenNodeOptions } from '../../common/view/DetectorScreenNode.js';
import SingleParticlesModel from '../model/SingleParticlesModel.js';

export default class SingleParticlesDetectorScreenNode extends DetectorScreenNode {

  public constructor( model: SingleParticlesModel, providedOptions?: DetectorScreenNodeOptions ) {
    super( model.sceneProperty, providedOptions );
  }
}
