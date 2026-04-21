// Copyright 2026, University of Colorado Boulder

/**
 * OverheadBeamNode displays the beam visualization in the overhead perspective,
 * including the emitter-to-slit rectangle beam and the slit-to-screen fan beam with gradient fade.
 * Also manages overhead pattern updates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Shape from '../../../../kite/js/Shape.js';
import VisibleColor from '../../../../scenery-phet/js/VisibleColor.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import ExperimentConstants from '../ExperimentConstants.js';
import SceneModel from '../model/SceneModel.js';
import OverheadDetectorScreenNode from './OverheadDetectorScreenNode.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';
import OverheadEmitterNode from './OverheadEmitterNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const particleBeamColorProperty = QuantumWaveInterferenceColors.particleBeamColorProperty;
const EMITTER_BEAM_HEIGHT = 32 * 0.73 * OVERHEAD_SCALE;
const EMITTER_BEAM_LEFT_EXTENSION = 10 * OVERHEAD_SCALE;

export default class OverheadBeamNode extends Node {

  private readonly _updateBeam: () => void;

  // The incident beam (emitter to slit) with a skewed half-oval cap on the right, exposed so it can be z-ordered
  // independently.
  public readonly emitterBeamNode: Path;

  public constructor(
    sceneProperty: TReadOnlyProperty<SceneModel>,
    emitterNode: OverheadEmitterNode,
    doubleSlitNode: OverheadDoubleSlitNode,
    detectorScreenNode: OverheadDetectorScreenNode
  ) {
    super( { isDisposable: false } );

    this.emitterBeamNode = new Path( null, { visible: false } );
    // emitterBeamNode is NOT added as a child here — it is z-ordered separately in ExperimentScreenView.

    const fanBeamNode = new Path( null, { visible: false } );
    this.addChild( fanBeamNode );

    const doubleSlitParallelogram = doubleSlitNode.parallelogramNode;
    const detectorScreenParallelogram = detectorScreenNode.parallelogramNode;

    this._updateBeam = () => {
      const scene = sceneProperty.value;
      const isEmitting = scene.isEmittingProperty.value;
      const intensity = scene.intensityProperty.value;

      this.emitterBeamNode.visible = isEmitting;
      fanBeamNode.visible = isEmitting;

      if ( !isEmitting ) {
        return;
      }

      const beamColor = scene.sourceType === 'photons'
                        ? VisibleColor.wavelengthToColor( scene.wavelengthProperty.value )
                        : particleBeamColorProperty.value;

      const activeEmitter = scene.sourceType === 'photons'
                            ? emitterNode.laserPointerNode
                            : emitterNode.particleEmitterNode;
      const nozzleTipX = activeEmitter.right;
      const laserCenterY = activeEmitter.centerY;
      const beamHeight = EMITTER_BEAM_HEIGHT;
      const beamLeft = nozzleTipX - EMITTER_BEAM_LEFT_EXTENSION;
      const beamRight = ( doubleSlitParallelogram.left + doubleSlitParallelogram.right ) / 2;

      // Build a beam shape: rectangle body with a skewed half-oval cap on the right side.
      // The cap is a half-ellipse whose vertical axis matches the beam height and whose horizontal bulge is capRadius.
      // It is sheared vertically by the parallelogram's skew slope so it matches the overhead perspective.
      const beamTop = laserCenterY - beamHeight / 2;
      const beamBottom = laserCenterY + beamHeight / 2;
      const capRadius = beamHeight / 3;
      const slope = doubleSlitNode.skewDy / doubleSlitNode.skewDx;

      // Bezier approximation factor for a quarter-ellipse arc.
      const k = 0.5522847498;

      const beamShape = new Shape()
        // Rectangle portion (left edge, top, right edge top)
        .moveTo( beamLeft, beamTop )
        .lineTo( beamRight, beamTop )
        // Upper quarter-arc of the cap (top to rightmost bulge)
        .cubicCurveTo(
          beamRight + capRadius * k, beamTop + slope * capRadius * k,
          beamRight + capRadius, laserCenterY + slope * capRadius - beamHeight / 2 * k,
          beamRight + capRadius, laserCenterY + slope * capRadius
        )
        // Lower quarter-arc of the cap (rightmost bulge to bottom)
        .cubicCurveTo(
          beamRight + capRadius, laserCenterY + slope * capRadius + beamHeight / 2 * k,
          beamRight + capRadius * k, beamBottom + slope * capRadius * k,
          beamRight, beamBottom
        )
        // Close back along the bottom and left
        .lineTo( beamLeft, beamBottom )
        .close();

      this.emitterBeamNode.shape = beamShape;
      this.emitterBeamNode.fill = beamColor.withAlpha( 0.8 * intensity );

      const fanLeft = doubleSlitNode.getVisibleBackgroundRightX();
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

      // Clip the fan beam along a diagonal from the detector screen parallelogram's top-left corner to its
      // bottom-right corner, so no light is visible past the screen.
      const screenTopLeftX = detectorScreenParallelogram.left;
      const screenTopLeftY = detectorScreenParallelogram.top;
      const screenBottomRightX = detectorScreenParallelogram.right;
      const screenBottomRightY = detectorScreenParallelogram.bottom;
      const clipPadding = 200;
      fanBeamNode.clipArea = new Shape()
        .moveTo( fanLeft - clipPadding, screenTopLeftY - clipPadding )
        .lineTo( screenTopLeftX, screenTopLeftY )
        .lineTo( screenBottomRightX, screenBottomRightY )
        .lineTo( fanLeft - clipPadding, screenBottomRightY + clipPadding )
        .close();

      const gradient = new LinearGradient( fanLeft, 0, fanRight, 0 )
        .addColorStop( 0, beamColor.withAlpha( 0.4 * intensity ) )
        .addColorStop( 1, beamColor.withAlpha( 0 ) );
      fanBeamNode.fill = gradient;
    };

    // Wire up beam updates
    const beamProperties = [ 'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'screenDistanceProperty' ] as const;
    sceneProperty.link( ( newScene, oldScene ) => {
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
      detectorScreenNode.overheadPatternNode.updatePattern( sceneProperty.value );
    };

    const patternProperties = [
      'isEmittingProperty', 'intensityProperty', 'wavelengthProperty', 'velocityProperty',
      'slitSeparationProperty', 'screenDistanceProperty', 'slitSettingProperty',
      'detectionModeProperty', 'screenBrightnessProperty', 'detectorScreenScaleIndexProperty'
    ] as const;

    sceneProperty.link( ( newScene, oldScene ) => {
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
