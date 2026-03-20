// Copyright 2026, University of Colorado Boulder

/**
 * OverheadBeamNode displays the beam visualization in the overhead perspective, including the
 * emitter-to-slit rectangle beam and the slit-to-screen fan beam with gradient fade. Also
 * manages overhead pattern updates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Shape from '../../../../kite/js/Shape.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import ExperimentModel from '../model/ExperimentModel.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';

const PARTICLE_BEAM_COLOR = new Color( 180, 180, 180 );
const EMITTER_BEAM_HEIGHT = 32 * 0.73;
const EMITTER_BEAM_LEFT_EXTENSION = 10;

export default class OverheadBeamNode extends Node {

  private readonly _updateBeam: () => void;

  public constructor(
    model: ExperimentModel,
    emitterNode: OverheadEmitterNode,
    doubleSlitNode: OverheadDoubleSlitNode,
    detectorScreenNode: OverheadDetectorScreenNode
  ) {
    super();

    const emitterBeamNode = new Rectangle( 0, 0, 1, 1, { visible: false } );
    this.addChild( emitterBeamNode );

    const fanBeamNode = new Path( null, { visible: false } );
    this.addChild( fanBeamNode );

    const doubleSlitParallelogram = doubleSlitNode.parallelogramNode;
    const detectorScreenParallelogram = detectorScreenNode.parallelogramNode;

    this._updateBeam = () => {
      const scene = model.sceneProperty.value;
      const isEmitting = scene.isEmittingProperty.value;
      const intensity = scene.intensityProperty.value;

      emitterBeamNode.visible = isEmitting;
      fanBeamNode.visible = isEmitting;

      if ( !isEmitting ) {
        return;
      }

      const beamColor = scene.sourceType === 'photons'
                        ? VisibleColor.wavelengthToColor( scene.wavelengthProperty.value )
                        : PARTICLE_BEAM_COLOR;

      const activeEmitter = scene.sourceType === 'photons'
                            ? emitterNode.laserPointerNode
                            : emitterNode.particleEmitterNode;
      const nozzleTipX = activeEmitter.right;
      const laserCenterY = activeEmitter.centerY;
      const beamHeight = EMITTER_BEAM_HEIGHT;
      const beamLeft = nozzleTipX - EMITTER_BEAM_LEFT_EXTENSION;
      const beamRight = doubleSlitParallelogram.left;

      emitterBeamNode.setRect( beamLeft, laserCenterY - beamHeight / 2, beamRight - beamLeft, beamHeight );
      emitterBeamNode.fill = beamColor.withAlpha( 0.8 * intensity );

      const fanLeft = doubleSlitParallelogram.right;
      const fanRight = detectorScreenNode.getMaxDistanceParallelogramLeft();
      const narrowHalfHeight = beamHeight / 2;

      const slitCenterY = doubleSlitParallelogram.centerY;
      const screenCenterY = detectorScreenParallelogram.centerY;
      const wideHalfHeight = detectorScreenParallelogram.height / 2;

      const fanShape = new Shape()
        .moveTo( fanLeft, slitCenterY - narrowHalfHeight )
        .lineTo( fanRight, screenCenterY - wideHalfHeight )
        .lineTo( fanRight, screenCenterY + wideHalfHeight )
        .lineTo( fanLeft, slitCenterY + narrowHalfHeight )
        .close();
      fanBeamNode.shape = fanShape;

      const gradient = new LinearGradient( fanLeft, 0, fanRight, 0 )
        .addColorStop( 0, beamColor.withAlpha( 0.4 * intensity ) )
        .addColorStop( 1, beamColor.withAlpha( 0 ) );
      fanBeamNode.fill = gradient;
    };

    // Wire up beam updates
    const beamProperties = [ 'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'screenDistanceProperty' ] as const;
    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        for ( const propName of beamProperties ) {
          oldScene[ propName ].unlink( this._updateBeam );
        }
      }
      for ( const propName of beamProperties ) {
        newScene[ propName ].link( this._updateBeam );
      }
    } );

    // Wire up overhead pattern updates
    const updateOverheadPattern = () => {
      const scene = model.sceneProperty.value;
      detectorScreenNode.overheadPatternNode.updatePattern( scene );
    };

    const patternProperties = [
      'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'velocityProperty',
      'slitSeparationProperty', 'screenDistanceProperty', 'slitSettingProperty',
      'detectionModeProperty', 'screenBrightnessProperty'
    ] as const;

    model.sceneProperty.link( ( newScene, oldScene ) => {
      if ( oldScene ) {
        for ( const propName of patternProperties ) {
          oldScene[ propName ].unlink( updateOverheadPattern );
        }
        oldScene.hitsChangedEmitter.removeListener( updateOverheadPattern );
      }
      for ( const propName of patternProperties ) {
        newScene[ propName ].link( updateOverheadPattern );
      }
      newScene.hitsChangedEmitter.addListener( updateOverheadPattern );
    } );
  }

  /**
   * Forces an initial beam update after front-facing screen bounds are set.
   */
  public updateBeam(): void {
    this._updateBeam();
  }
}
