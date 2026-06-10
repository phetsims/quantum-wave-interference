// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentSlitColumnNode owns the front-facing slit views and slit controls for the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceToggleNode from '../../common/view/QuantumWaveInterferenceToggleNode.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import FrontFacingSlitNode from './FrontFacingSlitNode.js';
import SlitControlPanel from './SlitControlPanel.js';

export default class ExperimentSlitColumnNode extends Node {

  public readonly slitControlPanel: SlitControlPanel;

  private readonly frontFacingSlitNodes: FrontFacingSlitNode[];

  /**
   * @param sceneProperty - the selected scene, which determines the displayed slit view and controls
   * @param scenes - all scenes, each getting its own slit view and controls
   * @param comboBoxParent - parent for the slit settings combo box popup list
   * @param sceneTandems - the parent Tandem for each scene's controls
   * @param tandem
   */
  public constructor(
    sceneProperty: Property<SceneModel>,
    scenes: SceneModel[],
    comboBoxParent: Node,
    sceneTandems: ReadonlyMap<object, Tandem>,
    tandem: Tandem
  ) {
    super( { isDisposable: false } );

    this.frontFacingSlitNodes = scenes.map( scene => {
      const slitNode = new FrontFacingSlitNode( scene, {
        tandem: sceneTandems.get( scene )!.createTandem( 'frontFacingSlitNode' )
      } );
      slitNode.y = ExperimentConstants.FRONT_FACING_ROW_TOP;
      return slitNode;
    } );
    const frontFacingSlitToggleNode = new QuantumWaveInterferenceToggleNode( sceneProperty, scenes, this.frontFacingSlitNodes );
    this.addChild( frontFacingSlitToggleNode );

    this.slitControlPanel = new SlitControlPanel( sceneProperty, scenes, sceneTandems, comboBoxParent, {
      tandem: tandem.createTandem( 'slitControlPanel' )
    } );
    this.slitControlPanel.top = this.frontFacingSlitNodes[ 0 ].bottom + 8;
    this.addChild( this.slitControlPanel );

    // Move front-facing slit nodes above the slit control panel so the slit separation span below the view is not
    // obscured by the panel's background.
    frontFacingSlitToggleNode.moveToFront();
  }

  public setColumnCenterX( centerX: number ): void {
    this.frontFacingSlitNodes.forEach( slitNode => {
      slitNode.setViewCenterX( centerX );
    } );
    this.slitControlPanel.centerX = centerX;
  }
}
