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
import { type DetectorPatternGraphViewStateFragment } from './description/QWIAccessibleViewState.js';
import DetectorPatternGraphNode, { type DetectorPatternGraphSceneLike } from './DetectorPatternGraphNode.js';
import { type DetectorPatternGraphZoomLevelOption } from './DetectorPatternGraphZoomLevelProperty.js';

const DETECTOR_PATTERN_GRAPH_LEFT_GAP = 2;

type DetectorPatternGraphLayerNodeOptions = {

  // Provide to make the graph adapt its axis label between "Intensity" (averageIntensity mode) and
  // "Count" (hits mode). Omit on screens that are always in hits mode.
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;

  // Initial and reset zoom level for the graph.
  initialZoomLevel?: DetectorPatternGraphZoomLevelOption;
  initialZoomLevels?: Partial<Record<DetectionMode, DetectorPatternGraphZoomLevelOption>>;
};

export default class DetectorPatternGraphLayerNode extends Node {

  private readonly sceneProperty: TReadOnlyProperty<DetectorPatternGraphSceneLike>;
  private readonly isVisibleProperty: TReadOnlyProperty<boolean>;
  private readonly detectionModeProperty?: TReadOnlyProperty<DetectionMode>;
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

    this.sceneProperty = sceneProperty;
    this.isVisibleProperty = isVisibleProperty;
    this.detectionModeProperty = options.detectionModeProperty;

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
    this.pdomOrder = [ this.graphNode ];

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

  /**
   * Gets sparse detector-pattern graph view state for agent-facing accessibility snapshots.
   *
   * @returns graph view state
   */
  public getAccessibleViewState(): DetectorPatternGraphViewStateFragment {
    const scene = this.sceneProperty.value;
    return {
      detectorPatternGraph: {
        visible: this.isVisibleProperty.value,
        sourceType: scene.sourceType,
        detectionMode: this.detectionModeProperty?.value || 'hits',
        hitCount: scene.hits.length
      }
    };
  }
}
