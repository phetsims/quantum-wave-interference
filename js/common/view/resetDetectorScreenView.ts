// Copyright 2026, University of Colorado Boulder

/**
 * Resets the view-only state associated with the shared detector-screen controls.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type DetectorPatternGraphLayerNode from './DetectorPatternGraphLayerNode.js';
import type DetectorScreenNode from './DetectorScreenNode.js';
import type PositionPlotNode from './PositionPlotNode.js';
import type TimePlotNode from './TimePlotNode.js';

/**
 * Restores the detector graph, measurement plots, and snapshot flash to their initial view state.
 *
 * @param detectorPatternGraphLayerNode - graph layer with view-specific zoom state
 * @param timePlotNode - time plot with view-specific samples and controls
 * @param positionPlotNode - position plot with view-specific samples and controls
 * @param detectorScreenNode - detector screen node whose snapshot flash is view-only state
 */
export default function resetDetectorScreenView(
  detectorPatternGraphLayerNode: DetectorPatternGraphLayerNode,
  timePlotNode: TimePlotNode,
  positionPlotNode: PositionPlotNode,
  detectorScreenNode: DetectorScreenNode
): void {
  detectorPatternGraphLayerNode.reset();
  timePlotNode.reset();
  positionPlotNode.reset();
  detectorScreenNode.clearFlash();
}
