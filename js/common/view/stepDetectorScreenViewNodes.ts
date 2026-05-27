// Copyright 2026, University of Colorado Boulder

/**
 * Steps the shared detector-screen view nodes used by the High Intensity and Single Particles screens.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type BaseSceneModel from '../model/BaseSceneModel.js';
import type BaseScreenModel from '../model/BaseScreenModel.js';
import type DetectorPatternGraphLayerNode from './DetectorPatternGraphLayerNode.js';
import type DetectorScreenNode from './DetectorScreenNode.js';
import type PositionPlotNode from './PositionPlotNode.js';
import type TimePlotNode from './TimePlotNode.js';
import type WaveVisualizationNode from './WaveVisualizationNode.js';

/**
 * Advances view-only animation state for the wave display, detector screen, detector graph, and measurement plots.
 *
 * @param model - screen model used to convert animation-frame time to simulation time
 * @param dt - elapsed real time, in seconds
 * @param waveVisualizationNode - animated wave display
 * @param detectorScreenNode - detector screen with view-only animation state
 * @param detectorPatternGraphLayerNode - detector graph layer with view-only animation state
 * @param timePlotNode - measurement time plot
 * @param positionPlotNode - measurement position plot
 */
export default function stepDetectorScreenViewNodes<T extends BaseSceneModel>(
  model: BaseScreenModel<T>,
  dt: number,
  waveVisualizationNode: WaveVisualizationNode,
  detectorScreenNode: DetectorScreenNode,
  detectorPatternGraphLayerNode: DetectorPatternGraphLayerNode,
  timePlotNode: TimePlotNode,
  positionPlotNode: PositionPlotNode
): void {
  waveVisualizationNode.step();
  detectorScreenNode.step();
  detectorPatternGraphLayerNode.step();
  timePlotNode.step( model.getEffectiveDt( dt ) );
  positionPlotNode.step();
}
