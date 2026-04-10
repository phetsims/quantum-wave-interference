// Copyright 2026, University of Colorado Boulder

/**
 * WhichPathDetectorIndicatorNode displays one or more which-path detector panels next to the overhead double slit.
 * Each panel is side-specific and connects to its slit detector marker with the same reusable layout and wire-drawing
 * code, so left, right, and both-detectors configurations all share the same implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import DynamicProperty from '../../../../axon/js/DynamicProperty.js';
import Shape from '../../../../kite/js/Shape.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import QuantumWaveInterferenceColors from '../../common/QuantumWaveInterferenceColors.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import ExperimentConstants from '../ExperimentConstants.js';
import ExperimentModel from '../model/ExperimentModel.js';
import SceneModel from '../model/SceneModel.js';
import { type DetectorSide, DetectorSideValues, hasDetectorOnSide } from '../model/SlitConfiguration.js';
import OverheadDoubleSlitNode from './OverheadDoubleSlitNode.js';

const OVERHEAD_SCALE = ExperimentConstants.OVERHEAD_ELEMENT_SCALE;
const DETECTOR_BOX_WIDTH = 58 * OVERHEAD_SCALE;
const DETECTOR_BOX_HEIGHT = 38 * OVERHEAD_SCALE;
const DETECTOR_PANEL_GAP = 8 * OVERHEAD_SCALE;
const DETECTOR_WIRE_STROKE = 'rgb( 140, 140, 140 )';

const DETECTOR_SIDE_LAYOUT = {
  left: {
    verticalOffset: -3 * OVERHEAD_SCALE,
    wireStartX: DETECTOR_BOX_WIDTH
  },
  right: {
    verticalOffset: 4 * OVERHEAD_SCALE,
    wireStartX: 0
  }
} as const;

class DetectorPanelNode extends Node {
  private readonly updateIndicator: () => void;

  public constructor(
    model: ExperimentModel,
    doubleSlitNode: OverheadDoubleSlitNode,
    detectorSide: DetectorSide
  ) {
    super( { visible: false, isDisposable: false } );

    const detectorWirePath = new Path( null, {
      stroke: DETECTOR_WIRE_STROKE,
      lineWidth: 2,
      lineCap: 'butt',
      lineJoin: 'round'
    } );

    const detectorIndicatorBox = new Rectangle( 0, 0, DETECTOR_BOX_WIDTH, DETECTOR_BOX_HEIGHT, 5, 5, {
      fill: QuantumWaveInterferenceColors.detectorOverlayFillProperty,
      stroke: QuantumWaveInterferenceColors.detectorOverlayStrokeProperty,
      lineWidth: 1
    } );

    const detectorIndicatorLabel = new Text( QuantumWaveInterferenceFluent.detectorStringProperty, {
      font: new PhetFont( 12 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6 * OVERHEAD_SCALE
    } );

    const detectorHitsProperty = new DynamicProperty<number, number, SceneModel>(
      model.sceneProperty,
      {
        derive: scene => detectorSide === 'left' ? scene.leftDetectorHitsProperty : scene.rightDetectorHitsProperty
      }
    );

    // Reactive: updates on hit count change and on locale change for the "hits" word.
    const detectorHitCountStringProperty = new DerivedProperty( [
        detectorHitsProperty,
        QuantumWaveInterferenceFluent.hitsStringProperty
      ], ( hits, hitsLabel ) => `${hits} ${hitsLabel}`
    );

    const detectorHitCountText = new Text( detectorHitCountStringProperty, {
      font: new PhetFont( 12 ),
      maxWidth: DETECTOR_BOX_WIDTH - 6 * OVERHEAD_SCALE,
      visible: false
    } );

    const detectorLabelContainer = new Node( {
      children: [ detectorIndicatorLabel, detectorHitCountText ]
    } );

    this.children = [ detectorWirePath, detectorIndicatorBox, detectorLabelContainer ];

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

    this.updateIndicator = () => {
      const slitSetting = model.currentSlitSettingProperty.value;
      const isDetectorActive = hasDetectorOnSide( slitSetting, detectorSide );
      this.visible = isDetectorActive;

      if ( !isDetectorActive ) {
        detectorWirePath.shape = null;
        return;
      }

      detectorHitCountText.visible = model.currentDetectionModeProperty.value === 'hits';
      updateDetectorLabelLayout();

      const layout = DETECTOR_SIDE_LAYOUT[ detectorSide ];
      if ( detectorSide === 'left' ) {
        this.x = doubleSlitNode.getVisibleBackgroundLeftX() - DETECTOR_PANEL_GAP - DETECTOR_BOX_WIDTH;
      }
      else {
        this.x = doubleSlitNode.getVisibleBackgroundRightX() + DETECTOR_PANEL_GAP;
      }
      this.y = doubleSlitNode.parallelogramNode.centerY + layout.verticalOffset - DETECTOR_BOX_HEIGHT / 2;

      const detectorAnchorPoint = doubleSlitNode.getDetectorAnchorPoint( detectorSide === 'left' );
      const wireStartX = layout.wireStartX;
      const wireStartY = DETECTOR_BOX_HEIGHT / 2;
      const wireEndX = detectorAnchorPoint.x - this.x;
      const wireEndY = detectorAnchorPoint.y - this.y;
      const horizontalSpan = Math.abs( wireEndX - wireStartX );
      const handleDistance = Math.max( 10 * OVERHEAD_SCALE, horizontalSpan * 0.35 );
      const firstControlX = detectorSide === 'left' ? wireStartX + handleDistance : wireStartX - handleDistance;
      const secondControlX = detectorSide === 'left' ? wireEndX - handleDistance : wireEndX + handleDistance;

      detectorWirePath.shape = new Shape()
        .moveTo( wireStartX, wireStartY )
        .cubicCurveTo(
          firstControlX, wireStartY,
          secondControlX, wireEndY,
          wireEndX, wireEndY
        );
    };

    model.currentSlitSettingProperty.link( this.updateIndicator );
    model.currentDetectionModeProperty.link( this.updateIndicator );
    detectorHitCountStringProperty.lazyLink( this.updateIndicator );
    model.sceneProperty.link( this.updateIndicator );
  }

  public updateLayout(): void {
    this.updateIndicator();
  }
}

export default class WhichPathDetectorIndicatorNode extends Node {
  private readonly detectorPanelNodes: DetectorPanelNode[];

  public constructor( model: ExperimentModel, doubleSlitNode: OverheadDoubleSlitNode ) {
    const detectorPanelNodes = DetectorSideValues.map(
      detectorSide => new DetectorPanelNode( model, doubleSlitNode, detectorSide )
    );

    super( {
      children: detectorPanelNodes,
      isDisposable: false
    } );

    this.detectorPanelNodes = detectorPanelNodes;
  }

  public updateLayout(): void {
    this.detectorPanelNodes.forEach( detectorPanelNode => detectorPanelNode.updateLayout() );
  }
}
