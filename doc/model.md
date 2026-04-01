# Quantum Wave Interference - Model Description

## Overview

This simulation models a double-slit interference experiment for photons and quantum particles (electrons,
neutrons, helium atoms). An emitter source directs a beam through a double slit onto a detector screen, where
an interference pattern emerges from the accumulation of many individual detection events.

The simulation demonstrates that quantum objects arrive at the detector as discrete, localized events, yet
produce a wave-like interference pattern over time — a hallmark of quantum mechanics.

## Scenes

There are four independent scenes, one per source type: **Photons**, **Electrons**, **Neutrons**, and
**Helium atoms**. Each scene maintains its own state (emitter settings, slit geometry, accumulated data),
so switching scenes preserves the user's configuration and data for each source type.

## Key Concepts and Parameters

### Emitter

- **Wavelength** (photons only): 380–780 nm, directly controlling the photon wavelength and beam color.
- **Particle Speed** (particles only): Controls velocity, which determines the de Broglie wavelength.
- **Intensity / Emission Rate**: 0–1, controls the rate at which detection events accumulate and the
  opacity of the beam visualization. At full intensity, approximately 200 hits per second are generated.

### Double Slit

- **Slit Width** (a): A fixed constant per source type, not adjustable by the user. Determines the
  single-slit diffraction envelope.
- **Slit Separation** (d): Center-to-center distance between slits, adjustable via NumberControl.
  Ranges vary per source type to reflect realistic experimental scales.
- **Screen Distance** (L): Distance from the double slit to the detector screen.

### Detector Screen

- **Average Intensity mode**: Displays the interference pattern as bright/dark bands (continuous glow).
- **Hits mode**: Displays individual detection events as dots, showing how the pattern emerges
  statistically from discrete events.
- **Screen Brightness**: Controls the opacity of the displayed pattern.

### Slit Settings

- **Both Open**: Standard double-slit interference (default).
- **Left/Right Covered**: One slit is blocked, producing a single-slit diffraction pattern.
- **Left/Right Detector**: A which-path detector monitors one slit. This destroys the interference
  pattern, producing a sum of two single-slit patterns without cross-terms.

## Physics Model

### Interference Pattern

The intensity at position y on the detector screen is:

    I(y) = cos²(π d sin(θ) / λ) × sinc²(π a sin(θ) / λ)

where:
- d = slit separation (center-to-center)
- a = slit width
- λ = wavelength (photon wavelength or de Broglie wavelength)
- θ = arctan(y / L), the angle from the central axis
- sinc(x) = sin(x) / x

The first factor produces the double-slit interference fringes. The second factor is the single-slit
diffraction envelope that modulates the fringe intensities.

No near-field (Fresnel) corrections are applied; the simulation uses the far-field (Fraunhofer)
approximation throughout.

### de Broglie Wavelength

For particles (electrons, neutrons, helium atoms), the effective wavelength is computed from the
de Broglie relation:

    λ = h / (m × v)

where:
- h = 6.626 × 10⁻³⁴ J·s (Planck's constant)
- m = particle mass
- v = particle velocity

### Single-Slit and Which-Path Cases

When one slit is covered, the double-slit interference factor is removed and only the single-slit
diffraction envelope remains:

    I(y) = sinc²(π a sin(θ) / λ)

When a which-path detector is active on one slit, the interference is also destroyed. The resulting
pattern is the incoherent sum of two single-slit patterns (equivalent to a single broad diffraction
envelope). This models the quantum mechanical principle that acquiring which-path information eliminates
the coherence needed for interference.

### Hit Generation

Individual detection events are generated using rejection sampling:
1. A candidate position is chosen uniformly across the screen width.
2. The theoretical intensity at that position is evaluated.
3. The candidate is accepted with probability proportional to the intensity.
4. Vertical positions are uniformly distributed across the screen height (with small padding).

This produces a spatial distribution of hits that converges to the theoretical interference pattern
as the number of events increases.

In Hits mode, each scene is capped at 25,000 hits (`ExperimentConstants.MAX_HITS`). When the cap is
reached, the emitter turns off automatically, its on/off button is disabled, and the user must clear
the detector screen before collecting more hits in that scene.

## Source-Specific Parameters

| Parameter         | Photons        | Electrons        | Neutrons          | Helium Atoms       |
|-------------------|----------------|------------------|-------------------|--------------------|
| Slit Width        | 0.1 mm         | 0.2 μm           | 0.01 mm           | 0.3 μm             |
| Slit Separation   | 0.2–1.0 mm     | 0.5–1.0 μm       | 0.02–0.1 mm       | 1–7 μm             |
| Screen Distance   | 0.4–0.8 m      | 0.4–0.8 m        | 0.5–5.0 m         | 0.5–2.0 m          |
| Particle Mass     | —              | 9.1 × 10⁻³¹ kg  | 1.7 × 10⁻²⁷ kg   | 6.6 × 10⁻²⁷ kg    |
| Speed Range       | c (fixed)      | 700–1500 km/s    | 200–2000 m/s      | 400–2000 m/s       |

## Approximations and Assumptions

- Far-field (Fraunhofer) diffraction only; no near-field corrections.
- Slit width is constant per source type and not adjustable by the user.
- The emitter produces a uniform intensity distribution across the beam cross-section.
- Particle detection is instantaneous (no time-of-flight effects).
- Which-path detection completely destroys coherence (no partial decoherence).
- Hit positions along the vertical axis are uniformly random (no vertical interference effects).
