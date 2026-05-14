// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentOverheadApparatusNode owns the overhead emitter, slit, detector screen, beam, and which-path detector
 * visuals for the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ExperimentModel from '../model/ExperimentModel.js';
import OverheadBeamNode from './OverheadBeamNode.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';
import WhichPathDetectorIndicatorNode from './WhichPathDetectorIndicatorNode.js';

export default class ExperimentOverheadApparatusNode extends Node {

  public readonly overheadEmitterNode: OverheadEmitterNode;
  public readonly maxHitsReachedPanel: OverheadEmitterNode['maxHitsReachedPanel'];

  private readonly overheadDoubleSlitNode: OverheadDoubleSlitNode;
  private readonly overheadDetectorScreenNode: OverheadDetectorScreenNode;
  private readonly overheadBeamNode: OverheadBeamNode;
  private readonly whichPathDetectorNode: WhichPathDetectorIndicatorNode;
  private readonly alignOverheadElements: () => void;

  public constructor( model: ExperimentModel, layoutBounds: Bounds2, tandem: Tandem ) {
    super( { isDisposable: false } );

    this.overheadEmitterNode = new OverheadEmitterNode( model, layoutBounds, tandem );
    this.maxHitsReachedPanel = this.overheadEmitterNode.maxHitsReachedPanel;

    this.overheadDoubleSlitNode = new OverheadDoubleSlitNode( model.sceneProperty );
    this.whichPathDetectorNode = new WhichPathDetectorIndicatorNode( model, this.overheadDoubleSlitNode );
    this.overheadDetectorScreenNode = new OverheadDetectorScreenNode(
      model.sceneProperty,
      model.detectorScreenScaleIndexProperty,
      this.overheadDoubleSlitNode.parallelogramNode
    );
    this.overheadBeamNode = new OverheadBeamNode(
      model.sceneProperty,
      this.overheadEmitterNode,
      this.overheadDoubleSlitNode,
      this.overheadDetectorScreenNode
    );

    // Top-row stacking order (back to front):
    // fan beam -> double slit -> detector shadow -> incident beam -> detector/indicator -> emitter.
    // The incident beam (emitter to slit) is in front of the double slit but behind the laser.
    this.addChild( this.overheadBeamNode );
    this.addChild( this.overheadDoubleSlitNode );
    this.addChild( this.overheadBeamNode.detectorScreenShadowNode );
    this.addChild( this.overheadBeamNode.emitterBeamNode );
    this.addChild( this.overheadDetectorScreenNode );
    this.addChild( this.whichPathDetectorNode );
    this.addChild( this.overheadEmitterNode );

    const updateWhichPathDetectorLayout = () => {
      this.whichPathDetectorNode.updateLayout();
    };
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        oldScene.slitSeparationProperty.unlink( updateWhichPathDetectorLayout );
      }
      newScene.slitSeparationProperty.link( updateWhichPathDetectorLayout );
    } );

    this.alignOverheadElements = () => {
      const activeEmitter = model.sceneProperty.value.sourceType === 'photons' ?
                            this.overheadEmitterNode.laserPointerNode :
                            this.overheadEmitterNode.particleEmitterNode;

      // Keep the slit centered on the active emitter's beam centerline.
      this.overheadDoubleSlitNode.parallelogramNode.centerY = activeEmitter.centerY;

      // Keep the hit-cap message centered in the horizontal gap between the active emitter and the visible black slit
      // background, not the larger transparent parallelogram bounds.
      this.overheadEmitterNode.maxHitsReachedPanel.centerX =
        ( activeEmitter.right + this.overheadDoubleSlitNode.getVisibleBackgroundLeftX() ) / 2;
      this.overheadEmitterNode.maxHitsReachedPanel.centerY = activeEmitter.centerY;

      this.whichPathDetectorNode.updateLayout();

      // Recompute beams after vertical alignment changes.
      this.overheadBeamNode.updateBeam();
    };
    model.sceneProperty.link( this.alignOverheadElements );
  }

  public setEmitterCenterX( emitterCenterX: number ): void {
    this.overheadEmitterNode.setEmitterCenterX( emitterCenterX );
    this.alignOverheadElements();
  }

  public setSlitCenterX( slitCenterX: number ): void {
    this.overheadDoubleSlitNode.setParallelogramCenterX( slitCenterX );
    this.whichPathDetectorNode.updateLayout();
    this.updateDetectorPosition();
  }

  public setFrontFacingScreenBounds( left: number, right: number ): void {
    this.overheadDetectorScreenNode.setFrontFacingScreenBounds( left, right );
    this.overheadBeamNode.updateBeam();
  }

  public updateDetectorPosition(): void {
    this.overheadDetectorScreenNode.updatePosition();
    this.overheadBeamNode.updateBeam();
  }

  public startSnapshotFlash(): void {
    this.overheadDetectorScreenNode.startSnapshotFlash();
  }
}
