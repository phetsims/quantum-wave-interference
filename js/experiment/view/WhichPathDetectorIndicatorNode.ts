// Copyright 2026, University of Colorado Boulder

/**
 * WhichPathDetectorIndicatorNode displays the which-path detector indicator box that appears
 * next to the double slit when a detector slit setting is active. Shows the detector label
 * and hit count when in Hits mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';
import { type SlitSetting } from '../model/SlitSetting.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const DETECTOR_BOX_WIDTH = 58 * OVERHEAD_SCALE;
const DETECTOR_BOX_HEIGHT = 38 * OVERHEAD_SCALE;

export default class WhichPathDetectorIndicatorNode extends Node {

  public constructor( model: ExperimentModel ) {
    super( { visible: false } );

    const detectorIndicatorBox = new Rectangle( 0, 0, DETECTOR_BOX_WIDTH, DETECTOR_BOX_HEIGHT, 5, 5, {
      fill: QuantumWaveInterferenceColors.detectorOverlayFillProperty,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      lineWidth: 1
    } );

    const detectorIndicatorLabel = new Text( QuantumWaveInterferenceFluent.detectorStringProperty, {
      font: new PhetFont( 12 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6 * OVERHEAD_SCALE
    } );

    const detectorHitCountText = new Text( '', {
      font: new PhetFont( 12 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6 * OVERHEAD_SCALE,
      visible: false
    } );

    const detectorLabelContainer = new Node( {
      children: [ detectorIndicatorLabel, detectorHitCountText ]
    } );

    this.children = [ detectorIndicatorBox, detectorLabelContainer ];

    const updateDetectorLabelLayout = () => {
      detectorIndicatorLabel.centerX = DETECTOR_BOX_WIDTH / 2;
      if ( detectorHitCountText.visible ) {
        detectorIndicatorLabel.centerY = DETECTOR_BOX_HEIGHT / 2 - 7 * OVERHEAD_SCALE;
        detectorHitCountText.centerX = DETECTOR_BOX_WIDTH / 2;
        detectorHitCountText.centerY = DETECTOR_BOX_HEIGHT / 2 + 7 * OVERHEAD_SCALE;
      }
      else {
        detectorIndicatorLabel.centerY = DETECTOR_BOX_HEIGHT / 2;
      }
    };

    const slitSettingProperty = new DynamicProperty<SlitSetting, SlitSetting, SceneModel>( model.sceneProperty, {
      derive: scene => scene.slitSettingProperty
    } );

    const detectionModeProperty = new DynamicProperty<DetectionMode, DetectionMode, SceneModel>( model.sceneProperty, {
      derive: scene => scene.detectionModeProperty
    } );

    const detectorHitsProperty = new DynamicProperty<number, number, SceneModel>( model.sceneProperty, {
      derive: scene => scene.detectorHitsProperty
    } );

    const updateDetectorIndicator = () => {
      const slitSetting = slitSettingProperty.value;
      const isDetectorActive = slitSetting === 'leftDetector' || slitSetting === 'rightDetector';
      this.visible = isDetectorActive;

      if ( isDetectorActive ) {
        const isHitsMode = detectionModeProperty.value === 'hits';
        detectorHitCountText.visible = isHitsMode;
        if ( isHitsMode ) {
          detectorHitCountText.string = `${detectorHitsProperty.value}`;
        }
        updateDetectorLabelLayout();
      }
    };

    slitSettingProperty.link( updateDetectorIndicator );
    detectionModeProperty.link( updateDetectorIndicator );
    detectorHitsProperty.link( updateDetectorIndicator );
  }
}
