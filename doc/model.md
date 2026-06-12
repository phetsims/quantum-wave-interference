# Quantum Wave Interference - Model

This document describes the conceptual model behind PhET's _Quantum Wave Interference_ simulation. It is written for
learning designers, teachers, and other collaborators who want to understand what the sim represents, what is
idealized, and how changes in the controls affect the simulated phenomena.

The simulation has three screens:

| Screen | What students explore |
|--------|-----------------------|
| Experiment | A source, double slit, and detector screen in an experimental apparatus. Students compare smooth intensity patterns with individual detector hits. |
| High Intensity | Continuous waves passing through no barrier or a double slit. Students see how a visible wave field builds a detector pattern. |
| Single Particles | One particle at a time. Students see a spread-out quantum wave produce one localized detection event per emitted particle. |

Each screen can use four source types: Photons, Electrons, Neutrons, and Helium atoms. Each source type keeps its own
settings and detector-screen data when students switch between sources.

## Core Ideas

The sim is designed around a small set of quantum ideas:

| Idea | How the sim represents it |
|------|---------------------------|
| Wave-particle duality | The quantum state is shown as a wave, but detections appear as localized hits. |
| Interference | When two coherent paths are available, their wave amplitudes combine and form bright and dark bands. |
| Diffraction | A slit spreads the wave, creating a broad envelope around the interference bands. |
| Which-path information | If the path through a slit is measured, the paths no longer interfere coherently. |
| Probability | Detector-screen hits are sampled from the predicted probability pattern. More hits make the underlying pattern clearer. |
| Matter waves | Electrons, neutrons, and helium atoms have wavelengths determined by their mass and speed. |

The sim does not model every detail of a laboratory system. It uses idealized sources, slits, detectors, and wave
propagation so that the main learning goals are visible and controllable.

## Physical Quantities

| Quantity | Meaning in the sim |
|----------|--------------------|
| Wavelength | For photons, wavelength is directly controlled. For matter particles, wavelength is computed from particle speed. |
| Particle speed | Controls the matter-particle wavelength: faster particles have shorter wavelengths. |
| Slit separation | Distance between the two slit centers. Larger separation usually makes interference bands closer together. |
| Slit width | Width of each open slit. Narrower slits diffract the wave more strongly. |
| Screen distance | Distance from the slits to the detector screen on the Experiment screen. Greater distance spreads the pattern out. |
| Screen brightness | Visual brightness of the displayed detector pattern, not a change in the underlying probability model. |
| Source intensity | Rate or strength of emission. Higher intensity makes detector hits accumulate faster where that control is present. |

For matter particles, the effective wavelength is computed from the de Broglie relation:

```text
lambda = h / (m * v)
```

where `lambda` is wavelength, `h` is Planck's constant, `m` is particle mass, and `v` is particle speed.

The source masses are:

| Source | Mass used by the sim |
|--------|----------------------|
| Photon | 0 kg |
| Electron | 9.109e-31 kg |
| Neutron | 1.675e-27 kg |
| Helium atom | 6.646e-27 kg |

## Slits and Which-Path Detectors

All screens support a double-slit situation. The High Intensity and Single Particles screens also support removing the
barrier entirely.

| Setup | What happens |
|-------|--------------|
| Both slits open | The paths through both slits remain coherent, so a double-slit interference pattern appears. |
| One slit covered | Only one path is available, so students see a single-slit diffraction pattern rather than double-slit fringes. |
| Detector at one slit | The sim can record whether the particle or wave contribution used that slit. This which-path information removes coherent interference involving that path. |
| Detectors at both slits | Both paths are monitored, so the detector screen shows a which-path pattern rather than coherent double-slit interference. |
| No barrier | The wave or packet travels freely to the detector side of the scene. |

In the Experiment screen, the overhead view describes the slits as left and right. In the front-facing wave views, those
same slits appear as top and bottom.

## Experiment Screen

The Experiment screen emphasizes the relationship between an experimental setup and the detector pattern that would be
observed.

### Student Controls and Ranges

| Source | Speed range | Default speed | Slit width | Slit separation range | Default separation |
|--------|-------------|---------------|------------|-----------------------|--------------------|
| Photons | n/a | n/a | 0.02 mm | 0.05-0.5 mm | 0.25 mm |
| Electrons | 2e5-1e6 m/s | 6e5 m/s | 0.00006 mm | 0.0001-0.002 mm | 0.001 mm |
| Neutrons | 200-1000 m/s | 600 m/s | 0.00006 mm | 0.0001-0.002 mm | 0.001 mm |
| Helium atoms | 200-1000 m/s | 600 m/s | 0.00006 mm | 0.0001-0.002 mm | 0.001 mm |

Additional Experiment screen ranges:

| Control | Range or default |
|---------|------------------|
| Photon wavelength | 380-780 nm, default 650 nm |
| Source intensity | 0-1, default 0.5 |
| Screen distance | 0.4-0.8 m, default 0.6 m |
| Screen brightness | 0-0.25, default 0.125 |
| Detector-screen zoom | plus/minus 20, 15, 10, or 5 mm visible range |

### Detector Pattern

The Experiment screen predicts the detector pattern from standard double-slit and single-slit diffraction behavior.

| Situation | Pattern behavior |
|-----------|------------------|
| Both slits open | A double-slit interference pattern appears inside a broader single-slit diffraction envelope. |
| One slit covered | The interference fringes disappear, leaving a single-slit diffraction pattern from the open slit. |
| Which-path detector active | The coherent double-slit fringes disappear because path information is available. |

Students can view the detector screen as a smooth intensity pattern or as individual hits. In Hits mode,
individual dots are sampled from the same probability pattern that underlies the smooth view. At full source intensity,
the Experiment screen attempts up to 100 hits per second. Each source type can accumulate up to 25,000 hits; after that,
the source turns off until the detector screen is cleared.

Changing a setting that changes the probability distribution, such as wavelength, speed, slit separation, screen
distance, or slit configuration, clears the accumulated detector screen. This prevents old hits from being mixed with a
new experimental setup.

## High Intensity Screen

The High Intensity screen shows a continuous wave moving through the scene and building a detector pattern over time.
It is useful for connecting the visible wave field to the detector screen.

### Student Controls and Ranges

| Source | Speed range | Default speed | Slit separation range | Default separation |
|--------|-------------|---------------|-----------------------|--------------------|
| Photons | n/a | n/a | 1-5 um | 3 um |
| Electrons | 7e5-1.5e6 m/s | 1.1e6 m/s | 1-5 nm | 3 nm |
| Neutrons | 200-800 m/s | 500 m/s | 1-5 nm | 3 nm |
| Helium atoms | 400-2000 m/s | 1200 m/s | 0.10-0.60 nm | 0.40 nm |

Other High Intensity controls:

| Control | Behavior |
|---------|----------|
| Barrier | Choose no barrier or double slit. |
| Slit configuration | Open both slits, cover either slit, or add which-path detectors. |
| Detector screen | Show a smooth intensity pattern or accumulated hits. |
| Wave display | Photons can show amplitude or electric field. Matter particles can show amplitude, real part, or imaginary part. Amplitude is the complex magnitude sqrt( re^2 + im^2 ) for all source types. |
| Screen brightness | Changes visual brightness without changing the probability pattern. |
| Time speed | Slow, Normal, and Fast change how quickly the model advances. |

### Continuous-Wave Behavior

When the source is turned on, a wavefront moves across the wave region. Before the wavefront reaches a location, that
location has no visible wave activity. After the wavefront reaches the detector side, the detector pattern begins to
form.

| Behavior | Meaning |
|----------|---------|
| Intensity | The screen averages the wave intensity over time, so a stable pattern emerges gradually. |
| Hits | Hits are sampled from the detector probability pattern after the wave reaches the detector. |
| Hit rate | The screen can add 40 detector hits per model second. |
| Slit detector events | When which-path detectors are present, detector clicks are sampled after the wave reaches the slits. |

Which-path detector clicks are not separate particles in a classical beam model. They are an idealized way to show that
obtaining path information changes the downstream interference pattern.

## Single Particles Screen

The Single Particles screen emphasizes that each emitted particle is represented by a spread-out quantum wave packet,
but each completed detection creates one localized hit.

### Student Controls and Ranges

| Source | Speed range | Default speed | Slit separation range | Default separation |
|--------|-------------|---------------|-----------------------|--------------------|
| Photons | n/a | n/a | 1-3 um | 2 um |
| Electrons | 7e5-1.5e6 m/s | 1.1e6 m/s | 1-3 nm | 2 nm |
| Neutrons | 200-800 m/s | 500 m/s | 1-3 nm | 2 nm |
| Helium atoms | 400-2000 m/s | 1200 m/s | 0.10-0.50 nm | 0.30 nm |

Other Single Particles controls:

| Control | Behavior |
|---------|----------|
| Emit particle | Starts one wave packet if no packet is already active. |
| Auto Repeat | Emits another packet after the previous packet finishes. |
| Barrier | Choose no barrier or double slit. |
| Slit configuration | Open both slits, cover either slit, or add which-path detectors. |
| Detector screen | Always shows accumulated hits. |
| Detector tool | Measures probability in a circular region when there is no barrier. |

### Wave Packet Behavior

Each emitted particle is modeled as a Gaussian wave packet. The packet spreads as it travels. When it reaches the
detector screen, one hit is sampled from the packet's probability distribution and the packet ends.

| Packet feature | Behavior |
|----------------|----------|
| Travel time | At default settings, the packet center takes about 1.5 display seconds to cross the wave region. |
| Starting shape | The packet begins as a localized Gaussian wave packet. |
| Spreading | The packet spreads both along and across its direction of travel. |
| Detection timing | Detection is most likely near the time when the packet center reaches the detector screen, with smaller early and late probabilities. |
| Minimum repeat interval | At least 0.3 seconds pass between emitted packets. |

With both slits open and no which-path detector, the packet can pass through both slits as a coherent quantum state.
Over many repeated particles, individual hits build up the same kind of double-slit interference pattern seen on the
continuous-wave screens.

### Which-Path Slit Detectors

In Single Particles, each emitted packet can interact with the slit detectors at most once.

| Case | Behavior |
|------|----------|
| The selected slit has no detector | The packet is updated as though the path through that slit became the relevant downstream contribution. |
| The selected slit has a detector | The detector count increases, and the downstream packet continues from that slit. |

Either way, the final detector-screen hit is still a single localized event. Over many particles, which-path detection
removes the coherent double-slit fringe pattern.

### Detector Tool

The detector tool is available only when there is no barrier. It represents a circular measurement region inside the
wave area.

| Tool result | Meaning |
|-------------|---------|
| Probability reading | The displayed percentage is the probability of detecting the particle inside the circular region at that moment. |
| Successful detection | The particle is detected by the tool, the packet disappears, and no detector-screen hit is produced for that packet. |
| Failed detection | The particle was not in the circular region. Probability inside the tool is removed, and the remaining packet continues. |

The detector tool is an idealized measurement. It is meant to help students reason about probability density and
measurement, not to represent a detailed physical detector design.

## Time, Reset, and Snapshots

The time controls change how quickly the model advances. Fast is useful for quickly accumulating a detector pattern;
Slow is useful for observing wave motion and packet behavior.

Reset All restores the screen's sources, controls, tools, and detector data to their initial states.

Each source type can save up to four detector-screen snapshots. Snapshots let students compare patterns from different
settings, such as one slit versus two slits, different slit separations, or intensity versus hits.

## Modeling Assumptions

| Assumption | Why it is useful |
|------------|------------------|
| Idealized coherent sources | Makes interference patterns stable and easy to interpret. |
| Idealized slits | Focuses attention on diffraction and interference rather than hardware details. |
| Idealized detector screen | Lets students switch between smooth probability patterns and sampled hits. |
| Simplified which-path measurement | Highlights the conceptual effect of path information on interference. |
| Screen-specific spatial scales | Keeps very different sources visible and comparable within the same interactive space. |

These assumptions are chosen to support learning goals. The sim is not intended to predict every experimental
imperfection that would appear in a real apparatus.
