# Quantum Wave Interference - Implementation Notes

This document gives a high-level map of the current implementation of _Quantum Wave Interference_. It supplements the
source comments and [model.md](model.md). It is not intended to list every class, but it should point maintainers to the
major architecture, state ownership, and special-purpose systems.

## At a Glance

| Area | Main files |
|------|------------|
| Sim entry point | `js/quantum-wave-interference-main.ts` |
| Screen classes | `js/experiment/ExperimentScreen.ts`, `js/high-intensity/HighIntensityScreen.ts`, `js/single-particles/SingleParticlesScreen.ts` |
| Shared model infrastructure | `js/common/model/BaseScreenModel.ts`, `BaseSceneModel.ts`, `WaveSolver.ts` |
| Analytical wave kernel | `js/common/model/AnalyticalWave*.ts`, `FresnelApertureTransfer.ts`, `AnalyticalDetectorPattern.ts` |
| Shared view infrastructure | `js/common/view/` |
| Core Description and accessible responses | `js/common/view/description/`, `js/high-intensity/view/description/`, `js/experiment/view/description/` |
| Experiment-specific model/view | `js/experiment/` |
| High Intensity-specific model/view | `js/high-intensity/` |
| Single Particles-specific model/view | `js/single-particles/` |

The sim currently uses analytical wave solvers for the High Intensity and Single Particles screens. There is no active
lattice/FDTD solver switch or `waveModel` query parameter in the current code.

## Screen Structure

The sim has three Joist screens:

| Screen | Model | View | Notes |
|--------|-------|------|-------|
| Experiment | `ExperimentModel` | `ExperimentScreenView` | Own model family with overhead apparatus and front-facing detector views. |
| High Intensity | `HighIntensityModel` | `HighIntensityScreenView` | Extends shared `BaseScreenModel`/`BaseSceneModel` architecture. |
| Single Particles | `SingleParticlesModel` | `SingleParticlesScreenView` | Extends shared architecture and adds detector-tool state. |

Each model creates four source scenes. The active source is held by a `sceneProperty`, and screen-level
`DynamicProperty` instances follow properties of the active scene.

## Model Architecture

### Experiment Model Family

`ExperimentModel` implements `TModel` directly. It owns:

* four `experiment/model/SceneModel` instances;
* `sceneProperty`, plus current-scene `DynamicProperty` wrappers;
* shared detector-screen zoom, playback, time speed, ruler visibility/position, and stopwatch state.

`experiment/model/SceneModel` is independent of `BaseSceneModel`. It stores source settings, slit settings, detector
hits, snapshots, hit accumulator, and an IOType for restoring live detector-screen hit data. It computes detector
intensity with `common/model/AnalyticalDetectorPattern.ts` and generates Hits-mode dots by rejection sampling.

The Experiment view has an overhead row, a front-facing slit/detector row, and controls. Important view containers:

| File | Responsibility |
|------|----------------|
| `ExperimentOverheadApparatusNode.ts` | Top-row emitter, beam, overhead slit, overhead detector, and which-path indicators. |
| `ExperimentSlitColumnNode.ts` | Magnified front-facing slit and slit controls. |
| `ExperimentDetectorColumnNode.ts` | Front-facing detector screen, graph accordion boxes, and screen settings. |
| `ExperimentScreenViewDescription.ts` | PDOM-only descriptions and heading groups. |

### Shared High Intensity / Single Particles Model Family

`BaseScreenModel<T extends BaseSceneModel>` owns state that is common to the two front-facing wave-region screens:

* the four scene models and active `sceneProperty`;
* current-scene DynamicProperties for source, barrier, slit, wave display, hits, snapshots, and brightness;
* global playback and `TimeSpeedProperty`;
* shared tools: measuring tape, stopwatch, time plot, and position plot.

`BaseSceneModel` owns per-source state:

* source type, physical scale, wavelength/speed, and derived effective wavelength;
* barrier/slit state and display-scale slit geometry;
* the active analytical `WaveSolver`;
* screen brightness, hits, detector counts, snapshots, and max-hit clearing behavior;
* which-path decoherence records and PhET-iO state serialization hooks.

Subclasses add the screen-specific behavior:

| Subclass | Adds |
|----------|------|
| `HighIntensitySceneModel` | detection mode, detector-pattern formation factor, continuous hit accumulator, continuous slit-detector event scheduler. |
| `SingleParticlesSceneModel` | auto repeat, packet-active state, sampled packet detection timing, detector-tool state, failed-measurement projections, slit re-emission. |

## Analytical Wave System

The current wave implementation is split into pure analytical helpers and stateful adapters.

| Layer | Files | Role |
|-------|-------|------|
| Pure kernel | `AnalyticalWaveKernel.ts`, `AnalyticalWavePropagation.ts`, `AnalyticalWaveDecoherence.ts`, `AnalyticalWaveMeasurementProjection.ts` | Evaluate analytical field samples, slit propagation, decoherence, re-emission, and failed detector-tool measurements. |
| Math helpers | `AnalyticalWaveMath.ts`, `FresnelApertureTransfer.ts`, `AnalyticalSlitGeometry.ts`, `inverseStandardNormalCDF.ts` | Numerical helpers used by the analytical kernel and packet timing. |
| Detector formula | `AnalyticalDetectorPattern.ts` | Fraunhofer detector intensity for Experiment and descriptions. |
| Stateful adapters | `BaseAnalyticalWaveSolver.ts`, `AnalyticalWaveSolver.ts`, `AnalyticalWavePacketSolver.ts` | Cache grids, expose the `WaveSolver` interface, manage solver time, state, detector distributions, and measurement projections. |
| Rendering reduction | `AnalyticalFieldSample.ts`, `AnalyticalWaveRasterizer.ts` | Convert rich field samples into intensity, representative complex values, or layered colors. |

`WaveSolver.ts` is the interface used by model and view code. It exposes amplitude fields, field samples, detector
probability distributions, point evaluation, measurement projection, and serializable state. The interface still uses a
single representative complex value in several places for compatibility, while the analytical kernel can carry richer
component/layer information for decoherence rendering.

## Shared View Architecture

`js/common/view/` contains reusable view pieces for High Intensity and Single Particles, plus shared snapshot and
detector rendering used by Experiment.

| Component | Purpose |
|-----------|---------|
| `WaveRegionNode` | Composes the wave visualization and double-slit barrier. |
| `WaveVisualizationNode` / `WaveVisualizationCanvasNode` | Renders analytical field samples into the wave-region canvas. |
| `DoubleSlitNode` / `SlitDetectorNode` | Draws barrier, covered slits, slit detectors, flashes, and detector counts. |
| `DetectorScreenNode` | Skewed detector screen for High Intensity and Single Particles. |
| `DetectorScreenTextureRenderer` / `renderDetectorScreenTexture` | Render detector-screen intensity and hits textures. |
| `DetectorPatternGraphLayerNode` / `DetectorPatternGraphNode` | Side graph for detector-screen intensity or hits. |
| `DetectorScreenControls` | Screen/graph switch, brightness, snapshots, tools, wave display, time controls, reset. |
| `SourceControlPanel` | Source controls for wavelength, speed, and optional intensity/emission-rate. |
| `SceneRadioButtonGroup` | Source-type scene selector. |
| `MeasurementToolsLayerNode` | Tape measure, stopwatch, time plot, and position plot. |
| `SnapshotNode`, `SnapshotCanvasNode`, `SnapshotsDialog` | Saved detector-screen snapshots. |
| `SnapshotFlashController` | Shared short flash used after capturing a snapshot. |

`HighIntensityScreenView` and `SingleParticlesScreenView` assemble these shared parts with different source visuals,
tool lists, and control panels.

## Accessibility Architecture

The sim has substantial Core Description and accessible-response support. The implementation is intentionally semantic:
view-state snapshots describe the experiment meaning rather than raw node state.

| Area | Files |
|------|-------|
| Shared screen summaries | `QuantumWaveInterferenceScreenSummaryContent.ts` |
| Shared heading/PDOM groups | `QuantumWaveInterferenceScreenViewDescription.ts` |
| Detector and graph descriptions | `DetectorScreenDescriber.ts`, `DetectorPatternGraphDescriber.ts`, `BandAnalysis.ts` |
| Snapshot descriptions | `SnapshotDescriber.ts`, `DetectorScreenDescriptionFormatter.ts` |
| Authored accessible view state contracts | `QWIAccessibleViewState.ts`, `HighIntensityAccessibleViewState.ts` |
| High Intensity transition responses | `HighIntensityAccessibleResponses.ts`, `QWITransitionDescriber.ts`, `QWIAccessibleStateFormatters.ts` |
| High Intensity accessible state template | `QWIAccessibleStateTemplate.ts`, `HighIntensityExperimentSetupSequenceItems.ts` |
| Experiment-specific descriptions | `ExperimentScreenViewDescription.ts`, `GraphDescriber.ts`, `SlitViewDescriptionNode.ts` |

High Intensity has the most complete transition-response system. `HighIntensityAccessibleResponses` compares semantic
state before and after changes and uses `QWITransitionDescriber` to emit context responses for source, source type,
detection mode, slit configuration, wavelength/speed, screen/graph display, tools, hit stages, wave progress, pattern
formation, clearing, max hits, and reset.

The view classes expose `getAccessibleViewState()` fragments for agent-facing snapshots:

| Fragment | Typical owner |
|----------|---------------|
| detector screen | `DetectorScreenNode` or Experiment `DetectorScreenNode` |
| detector graph | `DetectorPatternGraphLayerNode` / graph accordion |
| wave visualization | `WaveVisualizationNode` |
| slit barrier | `DoubleSlitNode` |
| measurement tools | `MeasurementToolsLayerNode` |
| detector tool | `DetectorToolNode` on Single Particles |

## Snapshots

Snapshots are model records (`common/model/Snapshot.ts`) stored per source scene. The camera button calls the active
screen model's `takeSnapshot()`, and the eye button opens `SnapshotsDialog`.

Important implementation details:

* `BaseSceneModel.takeSnapshot()` captures the analytical detector distribution for High Intensity Average Intensity
  snapshots.
* `Experiment SceneModel.takeSnapshot()` stores metadata and hits, then Experiment renders intensity snapshots from
  the closed-form detector formula.
* `SnapshotMetadataProperties` builds localized metadata rows and accessible names.
* `SnapshotDescriber` produces the snapshot accessible paragraph from immutable snapshot state.
* Deleting a snapshot renumbers the remaining snapshots via `renumberSnapshots`.

## PhET-iO and State

The sim instruments model state with tandems and custom IOTypes where plain Properties are not enough.

| Object | State handled |
|--------|---------------|
| `Experiment SceneModel.SceneModelIO` | Hit positions and hit accumulator. |
| `BaseSceneModel.BaseSceneModelIO` | Wave solver state, hits, wavefront status, decoherence events, and subclass state. |
| `AnalyticalWaveSolverState` | Solver time, source-on time, detector averaging accumulator. |
| `AnalyticalWavePacketSolverState` | Solver time, detector-tool measurement projections, packet re-emission descriptor. |
| `TimePlotDataSeriesIO` | Time-plot samples and sample timing. |
| `SnapshotIO` | Snapshot metadata and captured hit/pattern data. |

Some solver state accepts legacy saved-state shapes. For example, `AnalyticalWavePacketSolver` still accepts legacy
`biteGaussians` entries and converts them to current measurement projections.

## Query Parameters

`common/QuantumWaveInterferenceQueryParameters.ts` defines internal tuning parameters:

| Query parameter | Purpose |
|-----------------|---------|
| `waveSolverGridSize` | Analytical solver grid size; default 120. |
| `waveVisualizationColorPower` | Wave canvas color contrast; default 1.8. |
| `waveVisualizationAmplitudeColorPowerMultiplier` | Additional contrast for amplitude display modes; default 1.5. |
| `waveVisualizationColorPowerRampDistance` | Post-barrier color-power ramp distance; default 0.2. |
| `detectorScreenTextureScale` | Shared detector-screen texture scale; default 1. |
| `positionPlotSamplesPerPixel` | Position plot sample density; default 2. |
| `timePlotMaxSamples` | Time plot stored sample count; default 600. |
| `maxHits` | Testing cap for detector-screen hits; default 25,000, maximum 25,000. |
| `sidewaysGraphSampleScale` | High Intensity/Single Particles side-graph sample scale; default 1. |
| `experimentGraphSamplesPerPixel` | Experiment graph sample density; default 8. |
| `experimentDetectorTextureScale` | Experiment detector texture scale; default 2. |

These are mostly performance and testing knobs. There is no current public query parameter for selecting a different
wave solver backend.

## Time, Tools, and View Reset

`TimeSpeedProperty` supports Slow, Normal, and Fast on all screens. Experiment applies 0.25x, 1x, and 4x directly.
The shared High Intensity/Single Particles model uses a shared Slow factor of 0.15x and screen-specific Normal/Fast
factors.

View-only state is reset separately from model state where needed:

| View state | Reset owner |
|------------|-------------|
| Shared detector graph zoom and plot state | `resetDetectorScreenView.ts` |
| Experiment graph accordion/zoom | `ExperimentDetectorColumnNode.reset()` and `GraphAccordionBox.reset()` |
| Ruler and stopwatch visibility | Screen model reset |
| Measurement tool positions | Screen model reset |

`stepDetectorScreenViewNodes.ts` advances the shared wave visualization, detector screen, side graph, time plot, and
position plot for High Intensity and Single Particles.

## Disposal and Lifetime

Most screen-level model and view objects live for the lifetime of the sim and use `isDisposable: false` where that
contract needs to be explicit. The main transient objects are:

* short-lived `Animation` instances for snapshot flashes and detector flashes;
* rebuilt ruler internals on the Experiment screen when detector-screen scale changes;
* canvas/image data caches that are invalidated and redrawn rather than recreated each frame.

Scene model instances are not removed. Switching source scenes swaps which scene is active but preserves each scene's
state.

## Maintenance Notes

* Prefer adding source-scene state to the model, not the view, if it should persist when switching source type or be
  saved/restored by PhET-iO.
* When adding a scene Property that affects a DerivedProperty or Multilink callback, include it as a dependency so
  locale or model changes cannot leave stale text or stale visual state.
* The analytical kernel is pure and should stay independent of Scenery, controls, and screen layout.
* Shared view components use structural types so they can work with both High Intensity and Single Particles without
  depending on concrete scene classes.
* Documentation and accessible descriptions should use the source-type/slit terminology consistently: Experiment
  overhead uses left/right; front-facing wave-region views and solvers use top/bottom for those same slits.
