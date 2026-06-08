// Copyright 2026, University of Colorado Boulder

/**
 * SnapshotFlashController owns the short white flash animation used when detector-screen snapshots are captured.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import Animation from '../../../../twixt/js/Animation.js';
import Easing from '../../../../twixt/js/Easing.js';

const SNAPSHOT_FLASH_INITIAL_OPACITY = 0.8;
const SNAPSHOT_FLASH_DURATION = 0.6;

export default class SnapshotFlashController {

  private readonly flashNode: Node;
  private animation: Animation | null = null;

  public constructor( flashNode: Node ) {
    this.flashNode = flashNode;
  }

  /**
   * Starts the detector-screen snapshot flash, replacing any flash already in progress.
   */
  public start(): void {
    this.clear();
    this.flashNode.opacity = SNAPSHOT_FLASH_INITIAL_OPACITY;
    this.flashNode.visible = true;

    const flashAnimation = new Animation( {
      object: this.flashNode,
      attribute: 'opacity',
      from: SNAPSHOT_FLASH_INITIAL_OPACITY,
      to: 0,
      duration: SNAPSHOT_FLASH_DURATION,
      easing: Easing.LINEAR
    } );

    this.animation = flashAnimation;

    flashAnimation.endedEmitter.addListener( () => {
      if ( this.animation === flashAnimation ) {
        this.animation = null;
      }
      this.flashNode.visible = false;
      flashAnimation.dispose();
    } );

    flashAnimation.start();
  }

  /**
   * Stops any in-progress flash and restores the target node to its hidden state.
   */
  public clear(): void {
    if ( this.animation ) {
      this.animation.stop();
      this.animation = null;
    }
    this.flashNode.opacity = 0;
    this.flashNode.visible = false;
  }
}
