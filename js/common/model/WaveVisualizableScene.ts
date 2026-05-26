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

// TODO: Write the pros and cons comparing this to a base class or abstract base class, see https://github.com/phetsims/quantum-wave-interference/issues/135
type WaveVisualizableScene = {
  readonly sourceType: SourceType;
  readonly regionWidth: number;
  readonly regionHeight: number;
  readonly wavelengthProperty: TReadOnlyProperty<number>;
  readonly waveSolver: WaveSolver;
  readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;
  readonly waveAmplitudeScaleProperty: TReadOnlyProperty<number>;
};

export type { WaveVisualizableScene };
