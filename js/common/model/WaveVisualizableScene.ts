// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizableScene defines the interface that a scene model must satisfy for wave visualization
 * rendering. Both HighIntensitySceneModel and SingleParticlesSceneModel implement this interface,
 * allowing the shared WaveVisualizationCanvasNode to render either screen's wave field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { type SourceType } from './SourceType.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';
import type WaveSolver from './WaveSolver.js';

type WaveVisualizableScene = {
  readonly sourceType: SourceType;
  readonly wavelengthProperty: TReadOnlyProperty<number>;
  readonly waveSolver: WaveSolver;
  readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;
};

export type { WaveVisualizableScene };
