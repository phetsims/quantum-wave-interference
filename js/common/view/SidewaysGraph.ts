// Copyright 2026, University of Colorado Boulder

/**
 * SidewaysGraph is the sideways graph (intensity curve / hits histogram) and wires it
 * to the detector screen so the screen hides while the graph is shown. The High Intensity and
 * Single Particles screens both use this layout but with different visibility properties
 * and (for the axis label) different detection-mode handling.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { type TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import QuantumWaveInterferenceFluent from '../../QuantumWaveInterferenceFluent.js';
import { type DetectionMode } from '../model/DetectionMode.js';
import SidewaysGraphNode, { type SidewaysGraphSceneLike } from './SidewaysGraphNode.js';

const GRAPH_LEFT_GAP = 2;

type ZoomLevelOption = number | 'default' | 'max';

type SidewaysGraphOptions = {

  // Provide to make the graph adapt its axis label between "Intensity" (averageIntensity mode) and
  // "Count" (hits mode). Omit on screens that are always in hits mode.
  detectionModeProperty?: TReadOnlyProperty<DetectionMode>;

  // Initial and reset zoom level for the graph.
  initialZoomLevel?: ZoomLevelOption;
  initialZoomLevels?: Partial<Record<DetectionMode, ZoomLevelOption>>;
};

export default class SidewaysGraph extends SidewaysGraphNode {

  public constructor(
    sceneProperty: TReadOnlyProperty<SidewaysGraphSceneLike>,
    detectorScreenNode: Node,
    isVisibleProperty: TReadOnlyProperty<boolean>,
    detectorScreenCenterX: number,
    waveRegionTop: number,
    tandem: Tandem,
    options: SidewaysGraphOptions = {}
  ) {

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

    super( sceneProperty, {
      detectionModeProperty: options.detectionModeProperty,
      axisLabelStringProperty: axisLabelStringProperty,
      initialZoomLevel: options.initialZoomLevel,
      initialZoomLevels: options.initialZoomLevels,
      tandem: tandem
    } );

    isVisibleProperty.link( isVisible => {
      this.visible = isVisible;
      detectorScreenNode.visible = !isVisible;

      detectorScreenNode.centerX = detectorScreenCenterX;

      if ( isVisible ) {
        this.left = detectorScreenCenterX + GRAPH_LEFT_GAP;
        this.top = waveRegionTop;
      }
    } );
  }
}
