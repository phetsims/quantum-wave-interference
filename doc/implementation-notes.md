# Quantum Wave Interference - Implementation Notes

## Overview

This is a three-screen simulation: Experiment, High Intensity, and Single Particles. All three
screens share four independent scenes (Photons, Electrons, Neutrons, Helium atoms). The Experiment
screen was built first; the High Intensity and Single Particles screens share substantial
infrastructure in `js/common/` but have importantly different underlying models.

## Shared Architecture

### BaseSceneModel

`BaseSceneModel` is the abstract base for scene models used by the High Intensity and Single
Particles screens. It stores per-scene state: emitter properties (wavelength/velocity, intensity,
isEmitting), slit geometry (separation, position fraction, slit setting), detection mode, screen
brightness, wave display mode, accumulated hits, and snapshots. It owns a `WaveSolver` for wave
computation and delegates to subclass-specific solver construction.

### BaseScreenModel

`BaseScreenModel<T extends BaseSceneModel>` manages an array of four scene instances and a
`sceneProperty` that tracks which scene is active. It creates `DynamicProperty` instances that
follow the active scene's properties, enabling shared UI components to react to scene changes
without manual re-linking. Subclasses (`HighIntensityModel`, `SingleParticlesModel`) add
screen-specific DynamicProperties (e.g., detection mode for High Intensity, auto-repeat for
Single Particles).

### Dual-Solver Architecture

Both the High Intensity and Single Particles screens support two independent solver back-ends,
selected at startup by the query parameter `?waveModel=analytical|lattice` (default: analytical).
Both solvers implement a common `WaveSolver` interface with `step()`, `getAmplitudeField()`,
`getDetectorProbabilityDistribution()`, and `reset()`. All model and view code interacts only through this
interface.

- **Analytical solvers** (`AnalyticalWaveSolver`, `AnalyticalWavePacketSolver`) compute wave fields
  from closed-form Fraunhofer diffraction expressions.
- **Lattice solvers** (`LatticeWaveSolver`, `LatticeWavePacketSolver`) evolve the wave on a discrete
  2D grid using finite-difference time-domain (FDTD) methods with absorbing boundary conditions.

### Shared View Components

View components in `js/common/view/` are shared between the High Intensity and Single Particles
screens:

- **WaveVisualizationNode / WaveVisualizationCanvasNode**: CanvasNode rendering the 2D wave field
  as a color-mapped image, updated each frame. The canvas uses an offscreen buffer and ImageData
  for efficient pixel manipulation.
- **DetectorScreenNode**: Skewed parallelogram showing hits or intensity. Contains a snapshot flash
  animation, erase button, camera button, and snapshots dialog button.
- **DoubleSlitNode**: Gray barrier rectangles with slit openings, including optional cover and
  detector overlays (High Intensity only). Draggable horizontally to change slit-to-screen distance.
- **SidewaysGraphNode**: Rotated histogram or intensity curve aligned with the detector screen axis.
  Scales the detector screen to half width when visible to make room.
- **SnapshotNode / SnapshotsDialog**: Canvas-based miniature detector screen captures with a
  vertical list dialog. Up to 4 snapshots per scene.
- **TimePlotNode / PositionPlotNode**: Draggable chart panels with crosshairs constrained to the
  wave region, plotting the selected wave display quantity vs time or horizontal position.
- **WavePlotChartNode**: Shared chart infrastructure for time and position plots with auto-scaling
  amplitude tracking.
- **SourceControlPanel**: Wavelength (photons) or particle speed (matter) control with intensity
  slider, shared across screens.
- **SceneRadioButtonGroup**: 2x2 grid of source-type icons with labels.
- **ParticleMassAnnotationNode**: Shows mass label for matter particles, hidden for photons.
- **SnapshotIndicatorDotsNode**: Row of indicator dots showing how many snapshot slots are used.

Factory functions in `js/common/view/` assemble shared UI patterns:
- `createWaveRegionNodes()`: Wave visualization + double slit for any screen.
- `createRightControlsColumn()`: Right-side control panel with screen controls, tools, wave
  display, time controls, and reset.
- `createBarrierControlsRow()`: Barrier combo box + slit controls, positioned below the wave
  region.
- `createMeasurementToolNodes()`: Tape measure, stopwatch, time plot, and position plot.
- `createSidewaysGraph()`: Intensity/hits graph alongside the detector screen.

## Screen 1: Experiment

The Experiment screen uses a separate model (`ExperimentModel`) and view (`ExperimentScreenView`)
in `js/experiment/`. It has a three-row overhead layout: emitter + beam + overhead double slit +
overhead detector screen (top), front-facing slit + front-facing detector screen with graph
(middle), and controls (bottom).

The Experiment screen's `SceneModel` computes interference patterns using an inline Fraunhofer
formula (not the dual-solver architecture) and generates hits via rejection sampling. This screen
predates the High Intensity and Single Particles screens and does not use `BaseSceneModel` or
`BaseScreenModel`.

### Key Differences from Screens 2/3

- Own `SceneModel` class with built-in interference calculation (no solver interface)
- Own `ExperimentScreenView` layout with overhead perspective row
- Hit cap at 25,000 with automatic emitter disable
- Two time speeds (Normal, Fast) — no Slow option
- Slit settings include "one slit" option not available on the other screens

## Screen 2: High Intensity

The High Intensity screen (`js/high-intensity/`) shows continuous-wave plane-wave interference. The
emitter produces a steady beam; waves propagate across the visualization region and strike the
detector screen, which can display either intensity bands or accumulated hits.

### Model

`HighIntensityModel` extends `BaseScreenModel<HighIntensitySceneModel>`. Each scene adds
a `currentDetectionModeProperty` (averageIntensity or hits) and a `currentSlitConfigurationProperty`
with six options: bothOpen, leftCovered, rightCovered, leftDetector, rightDetector, bothDetectors.

Slit detector configurations cause decoherence: waves through a detector-equipped slit lose phase
coherence with the other slit, eliminating interference from that slit's contribution.

### View

`HighIntensityScreenView` has:
- **Top row** (`HighIntensityTopRowNode`): Per-scene LaserPointerNode emitters with particle-specific
  palettes, a mini wave-visualization symbol, beam graphics, and callout lines forming a "zoom in"
  frustum connecting the mini symbol to the main wave region.
- **Main area**: Wave visualization region, double slit (when barrier is "Double slit"), detector
  screen with intensity/hits rendering.
- **Left controls**: Source control panel, scene radio buttons, particle mass annotation.
- **Right controls**: Detection mode radio buttons, screen controls, tool checkboxes (intensity
  graph, tape measure, stopwatch, time plot, position plot), wave display combo box, time controls
  (Slow/Normal/Fast), reset all.

### Display Modes

- Photons: Time-averaged intensity, Electric field
- Matter particles: Magnitude, Real part, Imaginary part

## Screen 3: Single Particles

The Single Particles screen (`js/single-particles/`) shows one-particle-at-a-time quantum wave
packets. Each emission produces a visible wave packet that propagates, spreads, and eventually
collapses to a single hit on the detector screen. The detector screen always operates in Hits mode.

### Model

`SingleParticlesModel` extends `BaseScreenModel<SingleParticlesSceneModel>`. Each scene adds
auto-repeat support (toggle vs one-shot emission), a `DetectorToolModel` for the unique circular
detector tool, and simplified slit configurations (bothOpen, leftCovered, rightCovered — no
detector variants).

The analytical solver uses a 2D Gaussian wave packet with known spreading solutions; the lattice
solver evolves the packet on a discrete grid using a Schrodinger FDTD scheme.

### Detection

Detection times are sampled from the packet's horizontal probability density at the detector screen
column. The most likely detection time is when the packet center is near the screen, with small
early/late probabilities. On detection, the packet disappears and exactly one hit appears.

### Detector Tool

Unique to this screen, the detector tool (`DetectorToolNode`) is a draggable
circular region that displays the integrated probability density as a percentage. Pressing "Detect"
either detects the particle (packet disappears, circle lights up) or fails (probability inside
the circle is zeroed, remaining wave function is renormalized). Only available when barrier is
"None."

### View

`SingleParticlesScreenView` has no overhead row. The source uses a custom SVG image
(`SingleParticleEmitter.svg`) with a sticky toggle button. Layout is: source directly left of the
wave region, source controls and auto-repeat checkbox above, scene buttons and barrier controls
below, right control column similar to High Intensity but without detection mode radio buttons.

## Component Nicknames

Several UI components are referred to by casual names in design discussions and issue tracker comments.
This table maps those nicknames to the actual class or property name in code:

| Nickname | Code Reference | Description |
|----------|---------------|-------------|
| Emitter button | `LaserPointerNode` (HI) / `SingleParticleEmitterNode` (SP) | The red push-button on the source |
| Emitter controls | `SourceControlPanel` | Wavelength/speed and intensity/emission-rate controls |
| Scene selection radio buttons | `SceneRadioButtonGroup` | 2x2 grid of source type icons |
| Slit controls | `createBarrierControlsRow` | Barrier combo box, slit configuration, slit separation |
| Clear button | eraser button in `DetectorScreenNode` | Clears accumulated hits/intensity from the detector screen |
| Camera | snapshot button in `DetectorScreenNode` | Takes a snapshot of the current detector screen |
| Eye | view snapshots button in `DetectorScreenNode` | Opens the snapshots dialog |
| Intensity graph / Hits graph | `SidewaysGraphNode` | Sideways graph aligned with detector screen |
| Time plot | `TimePlotNode` | Draggable chart plotting wave quantity vs time at crosshair location |
| Position plot | `PositionPlotNode` | Draggable chart plotting wave quantity vs horizontal position |
| Detector tool | `DetectorToolNode` | Circular probability detector (Single Particles only) |
| Mini symbol | `HighIntensityTopRowNode` | Stylized wave region + detector in the top row (High Intensity only) |
| Callout lines | `HighIntensityTopRowNode` | Lines connecting mini symbol to main wave region |

## Disposal

Top-level screens, scene model instances, and persistent view components are not disposed during the
simulation. Scene model instances are never removed. Persistent view components use
`isDisposable: false` to make this lifetime contract explicit and prevent accidental disposal
attempts.

There are two targeted exceptions for transient or rebuilt internals:

- `createRulerNode` rebuilds the child `RulerNode` when the detector screen scale changes. The old
  `RulerNode` is removed from its container and disposed before the replacement is added.
- Flash feedback uses short-lived `Animation` instances in detector and snapshot views. Each
  animation is stopped when superseded, and disposed when its ended listener runs.

## Time Controls

- Experiment screen: Normal and Fast (no Slow option in the UI)
- High Intensity screen: Slow, Normal, and Fast
- Single Particles screen: Slow, Normal, and Fast

Speed multipliers: Slow = 0.25x, Normal = 1x, Fast = 4x.
