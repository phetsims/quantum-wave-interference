# Quantum Wave Interference - Implementation Notes

## Overview

This is a single-screen simulation with four independent scenes (Photons, Electrons, Neutrons, Helium atoms).
The architecture follows PhET conventions: a top-level model (`ExperimentModel`) owns four
`SceneModel` instances, and the view (`ExperimentScreenView`) creates per-scene UI components
whose visibility is toggled by the selected scene.

## Model

### ExperimentModel

The top-level model manages shared state (play/pause, time speed, ruler visibility, stopwatch) and an array
of four `SceneModel` instances. A `sceneProperty` tracks which scene is currently selected.

### SceneModel

Each `SceneModel` stores the complete physics state for one source type:
- Emitter properties (wavelength/velocity, intensity, isEmitting)
- Slit geometry (separation, screen distance, slit setting)
- Detection mode (Average Intensity vs Hits) and screen brightness
- Accumulated data: `hits[]` (Vector2 array, capped at 25,000 in Hits mode)

**Interference calculation**: `getIntensityAtPosition(y)` computes the double-slit interference pattern
using the Fraunhofer formula. It handles three cases: both slits open (full interference), one slit
covered (single-slit diffraction), and which-path detector active (no interference, returns single-slit
envelope).

**Hit generation**: The `step(dt)` method uses rejection sampling to generate detection events at a rate
proportional to intensity and time speed. Candidate positions are tested against the theoretical intensity
curve and accepted probabilistically.

**Hit limit behavior**: In Hits mode, each scene is capped at 25,000 hits
(`ExperimentConstants.MAX_HITS`). When the cap is reached, the emitter turns off automatically,
its button is disabled, and a message appears next to the source. Clearing the detector screen
removes the message and re-enables the emitter button.

**Parameter changes**: Changing slit separation, screen distance, velocity/wavelength, or slit setting
calls `clearScreen()`, which resets all accumulated data. This ensures the displayed pattern always
reflects the current physics parameters.

### Snapshot

`Snapshot` captures the detector screen state (hits array, detection mode, physics parameters) for later
viewing in the snapshots dialog. Each scene supports up to 4 snapshots.

## View

### ExperimentScreenView

The main view creates a three-row layout:
1. **Top row** (overhead perspective): Emitter, beam, double slit parallelogram, fan beam, detector
   screen parallelogram with interference pattern overlay
2. **Middle row** (front-facing views): Source controls panel, front-facing slit view, front-facing
   detector screen with graph below
3. **Bottom row** (controls): Scene radio buttons, slit controls, screen settings, time controls

Per-scene components (front-facing slits, detector screens, graphs, panels) are created for all four
scenes, with visibility toggled by `sceneProperty`. Shared state (graph expanded, time speed) is managed
by the model or the ScreenView and not duplicated per scene.

**DynamicProperty pattern**: Several `DynamicProperty` instances in `ExperimentModel` follow the active
scene's properties (e.g., `currentIsEmittingProperty`, `currentSlitSettingProperty`,
`currentDetectionModeProperty`, `currentScreenBrightnessProperty`), allowing the overhead view and other
shared UI to react to the currently selected scene without manual re-linking.

**Manual linking**: The overhead beam and pattern updates use explicit `link`/`unlink` on scene properties
when the scene changes, because they need to update from multiple properties simultaneously and the
`DynamicProperty` pattern doesn't cover multi-property dependencies.

### Canvas-based Rendering

A shared texture system (`getDetectorScreenTexture`) renders the detector screen content once per scene
per frame, then multiple views draw from the same cached canvas. Three CanvasNode subclasses consume
this texture:

- **DetectorScreenCanvasNode**: Front-facing detector screen. In Hits mode, renders hit dots as
  pre-rendered sprites (core + glow circle) with incremental blitting — only new hits are drawn each
  frame, keeping per-frame cost proportional to new hits rather than total hits. In Average Intensity
  mode, renders per-pixel vertical bands whose color is proportional to the theoretical intensity.
  Hit dot glow intensity is controlled by the screen brightness slider, not by hit count.

- **OverheadDetectorPatternNode**: Renders the interference pattern on the overhead parallelogram by
  drawing the same shared texture with an affine transform that skews it into the parallelogram shape.

- **SnapshotNode**: Renders a miniature version of the detector screen for the snapshots dialog,
  using its own canvas rendering with the same core+glow hit sprite approach.

### Key View Components

- **FrontFacingSlitNode**: Zoomed-in view showing two white slit rectangles on a black background, with
  beam overlay, slit width span, slit separation span, and cover/detector overlays.

- **GraphAccordionBox**: Shows either a smooth theoretical intensity curve (Average Intensity mode) or
  a 100-bin histogram (Hits mode). The intensity curve uses `getIntensityAtPosition()` for immediate
  feedback; opacity scales with accumulated hits so the curve "builds up" over time.

- **SourceControlPanel**: Switches between wavelength control (photons) and particle speed control
  (particles), with an intensity/emission rate slider for all source types.

- **SlitControlPanel**: Slit separation and screen distance NumberControls with ranges that vary per
  source type, plus a slit settings ComboBox.

- **SnapshotsDialog**: Vertical list of snapshot captures, following the pattern from
  `models-of-the-hydrogen-atom/js/common/view/SpectrometerSnapshotsDialog.ts`.

## Component Nicknames

Several UI components are referred to by casual names in design discussions and issue tracker comments.
This table maps those nicknames to the actual class or property name in code:

| Nickname | Code Reference | Description |
|----------|---------------|-------------|
| Emitter button | `OverheadEmitterNode.laserPointerNode` / `.particleEmitterNode` | The red push-button on the laser pointer (photons) or particle emitter |
| Emitter controls | `SourceControlPanel` | Wavelength/speed and intensity/emission-rate controls beneath the emitter |
| Scene selection radio buttons | `SceneRadioButtonGroup` | 2x2 grid of source type icons (photons, electrons, neutrons, helium) |
| Slit controls | `SlitControlPanel` | Slit separation, screen distance, and slit setting combo box |
| Clear button | `DetectorScreenNode.eraserButton` | Eraser icon that clears accumulated hits/intensity from the detector screen |
| Camera | `DetectorScreenNode.snapshotButton` | Camera icon button that takes a snapshot of the current detector screen |
| Eye | `DetectorScreenNode.viewSnapshotsButton` | Eye icon button that opens the snapshots dialog |
| Hits graph / Intensity graph | `GraphAccordionBox` | Accordion box below the detector screen showing histogram or intensity curve |
| Zoom in / Zoom out buttons | `GraphAccordionBox.zoomButtonGroup` | Magnifying glass buttons to the right of the graph accordion box |
| Intensity/hits/brightness panel | `ScreenSettingsPanel` | Detection mode radio buttons (Average Intensity vs Hits) and brightness slider |
| Ruler checkbox | `rulerCheckbox` (local in `ExperimentScreenView`) | Toggles ruler visibility |
| Stopwatch checkbox | `stopwatchCheckbox` (local in `ExperimentScreenView`) | Toggles stopwatch visibility |
| Time controls | `TimeControlNode` | Play/pause button and speed radio buttons |

## Disposal

No components in this simulation require disposal. All UI elements persist for the lifetime of the
simulation. `SceneModel` instances are never removed. Listeners registered by per-scene components
remain active but are effectively no-ops when the component is not visible.

## Time Controls

The `TimeControlNode` in the view exposes two time speeds: Normal and Fast. The model additionally
supports Slow speed (via `timeSpeedProperty`), but the Slow option is not shown in the UI. Speed
multipliers in `ExperimentModel.step`: Slow = 0.25×, Normal = 1×, Fast = 4×.
