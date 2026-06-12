// Copyright 2026, University of Colorado Boulder

/**
 * ExperimentOverheadApparatusNode owns the overhead emitter, slit, detector screen, beam, and which-path detector
 * visuals for the Experiment screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import ManualConstraint from '../../../../scenery/js/layout/constraints/ManualConstraint.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ExperimentModel from '../model/ExperimentModel.js';
import OverheadBeamNode from './OverheadBeamNode.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';
import WhichPathDetectorIndicatorNode from './WhichPathDetectorIndicatorNode.js';

export default class ExperimentOverheadApparatusNode extends Node {

  // Exposed so ExperimentScreenView can read emitter sub-node positions (e.g. the emitter left edge for
  // sourceControlPanel alignment) and pass the node itself to ExperimentScreenViewDescription for accessibility wiring.
  public readonly overheadEmitterNode: OverheadEmitterNode;
  private readonly maxHitsReachedPanel: OverheadEmitterNode['maxHitsReachedPanel'];

  private readonly overheadDoubleSlitNode: OverheadDoubleSlitNode;
  private readonly overheadDetectorScreenNode: OverheadDetectorScreenNode;
  private readonly overheadBeamNode: OverheadBeamNode;
  private readonly whichPathDetectorNode: WhichPathDetectorIndicatorNode;
  private readonly alignOverheadElements: () => void;

  public constructor( model: ExperimentModel, layoutBounds: Bounds2, sceneTandems: ReadonlyMap<object, Tandem>, tandem: Tandem ) {
    super( { isDisposable: false } );

    this.overheadEmitterNode = new OverheadEmitterNode( model, layoutBounds, sceneTandems, tandem );
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
      const activeEmitter = this.overheadEmitterNode.getActiveEmitterNode();
      const emitterOutputPoint = this.overheadEmitterNode.getActiveEmitterOutputPoint();

      // Keep the slit centered on the active emitter's beam centerline.
      this.overheadDoubleSlitNode.parallelogramNode.centerY = emitterOutputPoint.y;

      // Keep the hit-cap message centered in the horizontal gap between the active emitter and the visible black slit
      // background, not the larger transparent parallelogram bounds.
      this.overheadEmitterNode.maxHitsReachedPanel.centerX =
        ( activeEmitter.right + this.overheadDoubleSlitNode.getVisibleBackgroundLeftX() ) / 2;
      this.overheadEmitterNode.maxHitsReachedPanel.centerY = emitterOutputPoint.y;

      this.whichPathDetectorNode.updateLayout();

      // Recompute beams after vertical alignment changes.
      this.overheadBeamNode.updateBeam();
    };
    ManualConstraint.create( this, [
      ...this.overheadEmitterNode.emitterNodes,
      this.overheadEmitterNode.maxHitsReachedPanel,
      this.overheadDoubleSlitNode.parallelogramNode
    ], this.alignOverheadElements );
    model.sceneProperty.link( this.alignOverheadElements );
  }

  /**
   * Positions the overhead emitter so its horizontal center aligns with emitterCenterX, then re-runs the overhead
   * element alignment (slit centerline, max-hits panel, beam geometry). Called by ExperimentScreenView whenever the
   * source-control panel width changes so the emitter stays centred under it.
   */
  public setEmitterCenterX( emitterCenterX: number ): void {
    this.overheadEmitterNode.setEmitterCenterX( emitterCenterX );
    this.alignOverheadElements();
  }

  /**
   * Positions the overhead slit parallelogram so its horizontal center is at slitCenterX, updates the which-path
   * detector layout, then repositions the overhead detector screen and recomputes beam geometry. Called once during
   * ExperimentScreenView construction after column positions are resolved.
   */
  public setSlitCenterX( slitCenterX: number ): void {
    this.overheadDoubleSlitNode.setParallelogramCenterX( slitCenterX );
    this.whichPathDetectorNode.updateLayout();
    this.updateDetectorPosition();
  }

  /**
   * Sets the x-coordinate range of the front-facing detector screen in the overhead view so the overhead detector
   * screen can mirror that position, then recomputes the beam geometry. Called once during ExperimentScreenView
   * construction after the detector column node has been laid out.
   * @param left - scene x-coordinate of the left edge of the front-facing detector screen
   * @param right - scene x-coordinate of the right edge of the front-facing detector screen
   */
  public setFrontFacingScreenBounds( left: number, right: number ): void {
    this.overheadDetectorScreenNode.setFrontFacingScreenBounds( left, right );
    this.overheadBeamNode.updateBeam();
  }

  private updateDetectorPosition(): void {
    this.overheadDetectorScreenNode.updatePosition();
    this.overheadBeamNode.updateBeam();
  }

  /**
   * Triggers the visual flash on the overhead detector screen to indicate a snapshot has been captured.
   * Called by ExperimentScreenView via the ExperimentDetectorColumnNode's onSnapshotCaptured callback.
   */
  public startSnapshotFlash(): void {
    this.overheadDetectorScreenNode.startSnapshotFlash();
  }
}
