# Quantum Wave Interference - Implementation Notes

## Overview

This is a single-screen simulation with four independent scenes (Photons, Electrons, Neutrons, Helium atoms).
The architecture follows PhET conventions: a top-level model (`QuantumWaveInterferenceModel`) owns four
`SceneModel` instances, and the view (`QuantumWaveInterferenceScreenView`) creates per-scene UI components
whose visibility is toggled by the selected scene.

## Model

### QuantumWaveInterferenceModel

The top-level model manages shared state (play/pause, time speed, ruler visibility, stopwatch) and an array
of four `SceneModel` instances. A `sceneProperty` tracks which scene is currently selected.

### SceneModel

Each `SceneModel` stores the complete physics state for one source type:
- Emitter properties (wavelength/velocity, intensity, isEmitting)
- Slit geometry (separation, screen distance, slit setting)
- Detection mode (Average Intensity vs Hits) and screen brightness
- Accumulated data: `hits[]` (Vector2 array) and `intensityBins[]` (200-bin histogram)

**Interference calculation**: `getIntensityAtPosition(y)` computes the double-slit interference pattern
using the Fraunhofer formula. It handles three cases: both slits open (full interference), one slit
covered (single-slit diffraction), and which-path detector active (no interference, returns single-slit
envelope).

**Hit generation**: The `step(dt)` method uses rejection sampling to generate detection events at a rate
proportional to intensity and time speed. Candidate positions are tested against the theoretical intensity
curve and accepted probabilistically.

**Memory management**: The `hits` array is capped at 20,000 entries (with a 2,000-hit trim margin) to
prevent unbounded memory growth. The `intensityBins` array continues accumulating indefinitely since it
has a fixed size (200 bins).

**Parameter changes**: Changing slit separation, screen distance, velocity/wavelength, or slit setting
calls `clearScreen()`, which resets all accumulated data. This ensures the displayed pattern always
reflects the current physics parameters.

### Snapshot

`Snapshot` captures the detector screen state (hits array, detection mode, physics parameters) for later
viewing in the snapshots dialog. Each scene supports up to 4 snapshots.

## View

### QuantumWaveInterferenceScreenView

The main view creates a three-row layout:
1. **Top row** (overhead perspective): Emitter, beam, double slit parallelogram, fan beam, detector
   screen parallelogram with interference pattern overlay
2. **Middle row** (front-facing views): Source controls panel, front-facing slit view, front-facing
   detector screen with graph below
3. **Bottom row** (controls): Scene radio buttons, slit controls, screen settings, time controls

Per-scene components (front-facing slits, detector screens, graphs, panels) are created for all four
scenes, with visibility toggled by `sceneProperty`. Shared state (graph expanded, time speed) is managed
by the model or the ScreenView and not duplicated per scene.

**DynamicProperty pattern**: Several `DynamicProperty` instances follow the active scene's properties
(e.g., `isEmittingProperty`, `slitSettingProperty`, `detectionModeProperty`), allowing the overhead view
and other shared UI to react to the currently selected scene without manual re-linking.

**Manual linking**: The overhead beam and pattern updates use explicit `link`/`unlink` on scene properties
when the scene changes, because they need to update from multiple properties simultaneously and the
`DynamicProperty` pattern doesn't cover multi-property dependencies.

### Canvas-based Rendering

Three components use `CanvasNode` for performance:

- **DetectorScreenNode**: Renders up to 20,000 hit dots or intensity bands. Hit dots use a radial
  gradient for glow effects (disabled above 2,000 hits for performance). In Average Intensity mode,
  renders vertical bands with opacity proportional to the theoretical intensity.

- **OverheadDetectorPatternNode**: Renders the interference pattern on the overhead parallelogram.
  In Average Intensity mode, uses the theoretical intensity curve. In Hits mode, downsamples from the
  model's 200-bin histogram.

- **SnapshotNode**: Renders a miniature version of the detector screen for the snapshots dialog.

### Key View Components

- **FrontFacingSlitNode**: Zoomed-in view showing two white slit rectangles on a black background, with
  beam overlay, slit width span, slit separation span, and cover/detector overlays.

- **GraphAccordionBox**: Shows either a smooth theoretical intensity curve (Average Intensity mode) or
  a 40-bin histogram (Hits mode). The intensity curve uses `getIntensityAtPosition()` for immediate
  feedback; opacity scales with accumulated hits so the curve "builds up" over time.

- **SourceControlPanel**: Switches between wavelength control (photons) and particle speed control
  (particles), with an intensity/emission rate slider for all source types.

- **SlitControlPanel**: Slit separation and screen distance NumberControls with ranges that vary per
  source type, plus a slit settings ComboBox.

- **SnapshotsDialog**: Vertical list of snapshot captures, following the pattern from
  `models-of-the-hydrogen-atom/js/common/view/SpectrometerSnapshotsDialog.ts`.

## Disposal

No components in this simulation require disposal. All UI elements persist for the lifetime of the
simulation. `SceneModel` instances are never removed. Listeners registered by per-scene components
remain active but are effectively no-ops when the component is not visible.

## Query Parameters

The simulation supports several query parameters for testing (defined in
`QuantumWaveInterferenceQueryParameters.ts`):
- `scene`: Initial scene selection (photons, electrons, neutrons, helium)
- `emitting`: Start with the emitter on
- `hitsMode`: Start in Hits detection mode
- `timeSpeed`: Initial time speed (slow, normal, fast)
- `wavelength`, `slitSeparation`, `screenDistance`, `intensity`: Override initial parameter values
- `slitSetting`: Override initial slit setting
- `graphExpanded`: Start with the graph accordion box expanded
