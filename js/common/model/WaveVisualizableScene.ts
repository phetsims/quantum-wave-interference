// Copyright 2026, University of Colorado Boulder

/**
 * WaveVisualizableScene defines the interface that a scene model must satisfy for wave visualization
 * rendering. Both HighIntensitySceneModel and SingleParticlesSceneModel implement this interface,
 * allowing the shared WaveVisualizationCanvasNode to render either screen's wave field.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { type BarrierType } from './BarrierType.js';
import { type SourceType } from './SourceType.js';
import { type WaveDisplayMode } from './WaveDisplayMode.js';
import type WaveSolver from './WaveSolver.js';

// Tradeoffs for keeping this as a structural type instead of passing BaseSceneModel to the shared wave visualization:
// Pros:
// - Keeps the view contract narrow. Wave visualization depends only on read-only rendering state, not the full
//   BaseSceneModel API for emitters, hits, snapshots, detector behavior, or PhET-iO serialization.
// - Allows future scenes to be visualized if they provide the same wave-rendering surface without inheriting from
//   BaseSceneModel.
// - Avoids pushing display-only requirements into BaseSceneModel unless every scene model should semantically own them.
// Cons:
// - Provides no shared implementation, lifecycle hooks, or runtime guarantees; it is only a TypeScript shape.
// - Optional rendering values require defaults in shared view code when one screen does not otherwise need them.
// - The contract can drift from BaseSceneModel if shared visualization needs grow beyond this narrow surface.
//
// A base or abstract base class is a better fit if the visualization contract starts requiring shared behavior or
// invariants. This type is preferable while the shared view code only needs a small read-only slice of scene state.
type WaveVisualizableScene = {
  readonly sourceType: SourceType;
  readonly regionWidth: number;
  readonly regionHeight: number;
  readonly wavelengthProperty: TReadOnlyProperty<number>;
  readonly waveSolver: WaveSolver;
  readonly barrierTypeProperty: TReadOnlyProperty<BarrierType>;
  readonly slitPositionFractionProperty: TReadOnlyProperty<number>;
  readonly activeWaveDisplayModeProperty: TReadOnlyProperty<WaveDisplayMode>;
  readonly isWaveVisibleProperty: TReadOnlyProperty<boolean>;
  getEffectiveWavelength(): number;

  // Optional display-only gain for wave-field rendering. Scenes that omit this render with unity gain.
  readonly waveAmplitudeScaleProperty?: TReadOnlyProperty<number>;
};

export type { WaveVisualizableScene };
