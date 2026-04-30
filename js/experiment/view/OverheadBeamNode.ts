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
const SOURCE_SCALE = OVERHEAD_SCALE * 1.15;
const particleBeamColorProperty = QuantumWaveInterferenceColors.particleBeamColorProperty;
const EMITTER_BEAM_HEIGHT = 32 * 0.73 * SOURCE_SCALE;
const EMITTER_BEAM_LEFT_EXTENSION = 10 * OVERHEAD_SCALE;
const FAN_BEAM_LEFT_OFFSET_FROM_SLIT_CENTER_FRACTION = 0.25;
const FAN_BEAM_LEFT_HEIGHT_SCALE = 1.2;
const FAN_BEAM_RIGHT_HEIGHT_SCALE = 2;
const FAN_BEAM_TOP_RIGHT_Y_OFFSET = -6;
const FAN_BEAM_BOTTOM_RIGHT_Y_OFFSET = -20;
const FAN_BEAM_ALPHA_SCALE = 0.5;
const DETECTOR_SCREEN_SHADOW_FILL = 'rgba(255,255,255,0.75)';

export default class OverheadBeamNode extends Node {

  private readonly _updateBeam: () => void;

  // The incident beam (emitter to slit) with a skewed half-oval cap on the right, exposed so it can be z-ordered
  // independently.
  public readonly emitterBeamNode: Path;
  public readonly detectorScreenShadowNode: Path;

  public constructor(
    sceneProperty: TReadOnlyProperty<SceneModel>,
    emitterNode: OverheadEmitterNode,
    doubleSlitNode: OverheadDoubleSlitNode,
    detectorScreenNode: OverheadDetectorScreenNode
  ) {
    super( { isDisposable: false } );

    this.emitterBeamNode = new Path( null, { visible: false } );
    // emitterBeamNode is NOT added as a child here — it is z-ordered separately in ExperimentScreenView.

    this.detectorScreenShadowNode = new Path( null, {
      fill: DETECTOR_SCREEN_SHADOW_FILL,
      visible: false
    } );
    // detectorScreenShadowNode is NOT added as a child here — it is z-ordered separately in ExperimentScreenView.

    const fanBeamNode = new Path( null, { visible: false } );
    this.addChild( fanBeamNode );

    const doubleSlitParallelogram = doubleSlitNode.parallelogramNode;

    this._updateBeam = () => {
      const scene = sceneProperty.value;
      const isEmitting = scene.isEmittingProperty.value;
      const intensity = scene.intensityProperty.value;

      this.emitterBeamNode.visible = isEmitting;
      this.detectorScreenShadowNode.visible = isEmitting;
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

      const visibleDoubleSlitLeft = doubleSlitNode.getVisibleBackgroundLeftX();
      const visibleDoubleSlitRight = doubleSlitNode.getVisibleBackgroundRightX();
      const visibleDoubleSlitCenterX = ( visibleDoubleSlitLeft + visibleDoubleSlitRight ) / 2;
      const visibleDoubleSlitWidth = visibleDoubleSlitRight - visibleDoubleSlitLeft;
      const fanLeft = visibleDoubleSlitCenterX + visibleDoubleSlitWidth * FAN_BEAM_LEFT_OFFSET_FROM_SLIT_CENTER_FRACTION;
      const fanRight = detectorScreenNode.getMaxDistanceParallelogramRight();
      const narrowHalfHeight = beamHeight * FAN_BEAM_LEFT_HEIGHT_SCALE / 2;

      const slitCenterY = doubleSlitParallelogram.centerY;
      const screenCenterY = detectorScreenNode.parallelogramNode.centerY;
      const wideHalfHeight = detectorScreenNode.getFullParallelogramHeight() * FAN_BEAM_RIGHT_HEIGHT_SCALE / 2;
      const fanTopLeftY = slitCenterY - narrowHalfHeight;
      const fanBottomLeftY = slitCenterY + narrowHalfHeight;
      const fanTopRightY = screenCenterY - wideHalfHeight + FAN_BEAM_TOP_RIGHT_Y_OFFSET;
      const fanBottomRightY = screenCenterY + wideHalfHeight + FAN_BEAM_BOTTOM_RIGHT_Y_OFFSET;

      const fanShape = new Shape()
        .moveTo( fanLeft, fanTopLeftY )
        .lineTo( fanRight, fanTopRightY )
        .lineTo( fanRight, fanBottomRightY )
        .lineTo( fanLeft, fanBottomLeftY )
        .close();
      fanBeamNode.shape = fanShape;
      fanBeamNode.clipArea = null;

      const detectorTopLeftX = detectorScreenNode.parallelogramNode.left;
      const detectorTopLeftY = detectorScreenNode.parallelogramNode.top;
      const detectorBottomRightX = detectorScreenNode.parallelogramNode.right;
      const detectorBottomRightY = detectorScreenNode.parallelogramNode.bottom;
      const topSlope = ( fanTopRightY - fanTopLeftY ) / ( fanRight - fanLeft );
      const bottomSlope = ( fanBottomRightY - fanBottomLeftY ) / ( fanRight - fanLeft );
      const shadowTopRightY = detectorTopLeftY + topSlope * ( fanRight - detectorTopLeftX );
      const shadowBottomRightY = detectorBottomRightY + bottomSlope * ( fanRight - detectorBottomRightX );

      this.detectorScreenShadowNode.shape = new Shape()
        .moveTo( detectorTopLeftX, detectorTopLeftY )
        .lineTo( fanRight, shadowTopRightY )
        .lineTo( fanRight, shadowBottomRightY )
        .lineTo( detectorBottomRightX, detectorBottomRightY )
        .close();

      const gradient = new LinearGradient( fanLeft, 0, fanRight, 0 )
        .addColorStop( 0, beamColor.withAlpha( 0.4 * intensity * FAN_BEAM_ALPHA_SCALE ) )
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
      'detectionModeProperty', 'screenBrightnessProperty'
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
