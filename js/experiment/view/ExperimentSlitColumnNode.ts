// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentSlitColumnNode owns the front-facing slit views and slit controls for the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import linkSceneVisibility from '../../common/view/linkSceneVisibility.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import SlitControlPanel from './SlitControlPanel.js';

export default class ExperimentSlitColumnNode extends Node {

  public readonly slitControlPanel: SlitControlPanel;

  private readonly frontFacingSlitNodes: FrontFacingSlitNode[];

  public constructor( model: ExperimentModel, comboBoxParent: Node, tandem: Tandem ) {
    super( { isDisposable: false } );

    const frontFacingSlitTandem = tandem.createTandem( 'frontFacingSlitNodes' );
    this.frontFacingSlitNodes = model.scenes.map( ( scene, index ) => {
      const slitNode = new FrontFacingSlitNode( scene, {
        tandem: frontFacingSlitTandem.createTandem( `frontFacingSlitNode${index}` )
      } );
      slitNode.y = ExperimentConstants.FRONT_FACING_ROW_TOP;
      this.addChild( slitNode );
      return slitNode;
    } );

    this.slitControlPanel = new SlitControlPanel( model.sceneProperty, model.scenes, comboBoxParent, {
      tandem: tandem.createTandem( 'slitControlPanel' )
    } );
    this.slitControlPanel.top = this.frontFacingSlitNodes[ 0 ].bottom + 8;
    this.addChild( this.slitControlPanel );

    linkSceneVisibility( model.sceneProperty, model.scenes, this.frontFacingSlitNodes );

    // Move front-facing slit nodes above the slit control panel so the slit separation span below the view is not
    // obscured by the panel's background.
    this.frontFacingSlitNodes.forEach( slitNode => slitNode.moveToFront() );
  }

  public setColumnCenterX( centerX: number ): void {
    this.frontFacingSlitNodes.forEach( slitNode => {
      slitNode.setViewCenterX( centerX );
    } );
    this.slitControlPanel.centerX = centerX;
  }
}
