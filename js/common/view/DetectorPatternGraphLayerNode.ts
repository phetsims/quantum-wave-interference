// Copyright 2026, University of Colorado Boulder

/**
 * DetectorPatternGraphLayerNode positions the detector pattern graph beside the detector screen and coordinates
 * visibility between the graph and the detector screen. The High Intensity and Single Particles screens both use
 * this layout, but with different visibility Properties and detection-mode handling.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import type Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import DetectorPatternGraphNode, { type DetectorPatternGraphSceneLike } from './DetectorPatternGraphNode.js';

const DETECTOR_PATTERN_GRAPH_LEFT_GAP = 2;

type ZoomLevelOption = number | 'default' | 'max';

type DetectorPatternGraphLayerNodeOptions = {

  // Provide to make the graph adapt its axis label between "Intensity" (averageIntensity mode) and
  // "Count" (hits mode). Omit on screens that are always in hits mode.
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;

  // Initial and reset zoom level for the graph.
  initialZoomLevel?: ZoomLevelOption;
  initialZoomLevels?: Partial<Record<DetectionMode, ZoomLevelOption>>;
};

export default class DetectorPatternGraphLayerNode extends Node {

  private readonly graphNode: DetectorPatternGraphNode;

  public constructor(
    sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>,
    detectorScreenNode: Node,
    isVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenCenterX: number,
    waveRegionTop: number,
    tandem: Tandem,
    options: DetectorPatternGraphLayerNodeOptions = {}
  ) {
    super();

    const axisLabelStringProperty = options.detectionModeProperty
                                    ? new DerivedProperty(
        [
          options.detectionModeProperty,
          QuantumWaveInterferenceFluent.intensityStringProperty,
          QuantumWaveInterferenceFluent.countStringProperty
        ],
        ( detectionMode, intensityString, countString ) =>
          detectionMode === 'hits' ? countString : intensityString
      )
                                    : QuantumWaveInterferenceFluent.countStringProperty;

    this.graphNode = new DetectorPatternGraphNode( sceneProperty, {
      detectionModeProperty: options.detectionModeProperty,
      axisLabelStringProperty: axisLabelStringProperty,
      initialZoomLevel: options.initialZoomLevel,
      initialZoomLevels: options.initialZoomLevels,
      tandem: tandem
    } );
    this.addChild( this.graphNode );

    isVisibleProperty.link( isVisible => {
      this.visible = isVisible;
      this.graphNode.visible = isVisible;
      detectorScreenNode.visible = !isVisible;

      detectorScreenNode.centerX = detectorScreenCenterX;

      if ( isVisible ) {
        this.left = detectorScreenCenterX + DETECTOR_PATTERN_GRAPH_LEFT_GAP;
        this.top = waveRegionTop;
      }
    } );
  }

  /**
   * Updates the graph child during the simulation step so continuously changing intensity data stays current.
   */
  public step(): void {
    this.graphNode.step();
  }

  /**
   * Restores the graph child's view-specific zoom state to its configured defaults.
   */
  public reset(): void {
    this.graphNode.reset();
  }
}
