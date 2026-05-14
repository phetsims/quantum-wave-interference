# Quantum Wave Interference - model description

This document is a high-level description of the model used in PhET's _Quantum Wave Interference_
simulation.

Each screen has 4 "scenes", one for each source type: Photons, Electrons, Neutrons, and Helium
atoms. Selection of the scene is controlled by the source-type radio buttons. Each scene preserves
its own emitter settings, slit settings, detector-screen data, and snapshots.

For photons, the source wavelength is controlled directly. For matter particles, wavelength is
derived from particle speed using the de Broglie relation `lambda = h / ( m * v )`, where `lambda`
is in meters, `h = 6.626e-34 J*s`, `m` is mass in kilograms, and `v` is speed in meters per second.
Particle masses are:

* Electron: 9.109e-31 kg
* Neutron: 1.675e-27 kg
* Helium atom: 6.646e-27 kg

Across the simulation:

* Wavelength is stored in nanometers for photons. The photon range is 380-780 nm, default 650 nm.
* Particle speed is stored in meters per second, though some UI labels display kilometers per second.
* Slit separation is the center-to-center slit distance and is stored in millimeters.
* Screen distance is stored in meters where it is modeled directly.
* Screen brightness is a dimensionless display value in the range 0-0.25.
* Each source-type scene can store up to 4 detector-screen snapshots.

## Experiment screen

The _Experiment_ screen models a detector-pattern experiment with an overhead apparatus view and a
front-facing detector screen.

There are 4 source-type scenes. In each scene:

* The emitter can be turned on or off.
* Photons use wavelength in the range 380-780 nm, default 650 nm.
* Electrons use speed in the range 2.0e5-1.0e6 m/s, default 6.0e5 m/s.
* Neutrons and helium atoms use speed in the range 200-1000 m/s, default 600 m/s.
* Source intensity is dimensionless in the range 0-1, default 0.5.
* The detector screen can show Average Intensity or Hits.
* The detector-screen horizontal zoom can show -20..20 mm, -15..15 mm, -10..10 mm, or -5..5 mm.

The barrier always contains slits. The available slit settings are:

* Both Open
* Left Covered
* Right Covered
* Left Detector
* Right Detector
* Both Detectors

Source-specific slit and screen parameters are:

* Photons: slit width 0.02 mm, slit separation 0.05-0.5 mm, default 0.25 mm.
* Electrons: slit width 0.00006 mm, slit separation 0.0001-0.002 mm, default 0.001 mm.
* Neutrons: slit width 0.00006 mm, slit separation 0.0001-0.002 mm, default 0.001 mm.
* Helium atoms: slit width 0.00006 mm, slit separation 0.0001-0.002 mm, default 0.001 mm.
* All source types: screen distance 0.4-0.8 m, default 0.6 m.

The detector pattern is computed from a Fraunhofer diffraction model:

* With both slits open, a double-slit `cos^2` interference factor is multiplied by a single-slit
  `sinc^2` diffraction envelope.
* With one slit covered, only the single-slit diffraction envelope remains, centered on the open
  slit, with half the peak transmitted intensity.
* With a which-path detector, coherence between paths is removed, so the detector screen shows the
  broad single-slit-like envelope without double-slit fringes.

In Hits mode:

* Hit positions are sampled from the analytical detector intensity.
* Horizontal hit position is normalized to [-1,1] across the full detector screen.
* Vertical hit position is uniformly sampled in [-1,1].
* At full intensity, the model attempts up to 100 hits/second.
* Each scene is capped at 25,000 hits. When the cap is reached, the emitter turns off and remains
  disabled until the detector screen is cleared.

## High Intensity screen

The _High Intensity_ screen models a continuous wave passing through a barrier and accumulating a
detector pattern.

There are 4 source-type scenes. In each scene:

* The emitter can be turned on or off.
* Photons use wavelength in the range 380-780 nm, default 650 nm.
* Electrons use speed in the range 7.0e5-1.5e6 m/s, default 1.1e6 m/s.
* Neutrons use speed in the range 200-800 m/s, default 500 m/s.
* Helium atoms use speed in the range 400-2000 m/s, default 1200 m/s.
* The detector screen can show Average Intensity or Hits.
* The barrier can be set to None or Double Slit.
* The barrier position is a dimensionless fraction across the wave region, range 0.25-0.75,
  default 0.5.

When the Double Slit barrier is selected, the available slit settings are:

* Both Open
* Left Covered
* Right Covered
* Left Detector
* Right Detector
* Both Detectors

The wave region is scaled so that about 15 default wavelengths fit across its width. At default
settings:

* Photons: effective wavelength 650 nm, wave-region width 9.75 um.
* Electrons: effective wavelength 0.661 nm, wave-region width 9.92 nm.
* Neutrons: effective wavelength 0.791 nm, wave-region width 11.87 nm.
* Helium atoms: effective wavelength 0.0831 nm, wave-region width 1.25 nm.

Slit widths and separations are derived from the wave-region scale:

* Photons: slit width 0.511 um, slit separation range 0.929-5.11 um.
* Electrons: slit width 0.520 nm, slit separation range 0.945-5.20 nm.
* Neutrons: slit width 0.622 nm, slit separation range 1.13-6.22 nm.
* Helium atoms: slit width 0.0653 nm, slit separation range 0.119-0.653 nm.

The continuous-wave solver:

* Evaluates an analytical wave field over the wave region.
* Accumulates a time-averaged detector probability distribution while the source is on.
* Starts forming the Average Intensity detector pattern after the wavefront reaches the detector.
* Forms the Average Intensity detector pattern over 2 seconds of effective model time.
* Samples Hits from the detector probability distribution after the wavefront reaches the screen.
* Uses 5 conceptual particles/second for Hits mode and slit-detector decoherence events.

When slit detectors are active:

* The model creates decoherence events at the slits.
* Detector counts track which monitored slit clicked.
* Which-path information removes coherent interference between the affected paths.

## Single Particles screen

The _Single Particles_ screen models one wave packet at a time. Each packet propagates through the
wave region and eventually collapses to a localized detection event unless the detector tool detects
it first.

There are 4 source-type scenes. Source ranges, wave-region scales, and slit widths are the same as
the _High Intensity_ screen. Slit separation ranges are Single Particles-specific:

* Photons: 1-4 um, default 2.5 um.
* Electrons: 1-4 nm, default 2.5 nm.
* Neutrons and helium atoms: physical values chosen so their minimum, maximum, and default visual
  slit spacing match the electrons scene.

In each scene:

* The emitter creates one packet at a time.
* Auto Repeat controls whether additional packets are emitted after the previous packet ends.
* The detector screen is always in Hits mode.
* The barrier can be set to None or Double Slit.
* The available Double Slit settings are Both Open, Left Covered, Right Covered, Left Detector,
  Right Detector, and Both Detectors.
* The minimum interval between emitted packets is 0.3 seconds.
* Each scene is capped at 25,000 detector-screen hits.

The wave packet model:

* Uses an analytical Gaussian wave-packet solver.
* Has a baseline traversal time of 1.5 seconds for the packet center to cross the wave region at
  the default source speed.
* Starts the packet center 3 initial `sigma_x` widths to the left of the visible region.
* Uses initial packet widths `sigma_x = 0.2 * regionWidth` and `sigma_y = 0.2 * regionHeight`.
* Samples screen-detection timing from the packet's longitudinal probability profile.

When a packet reaches the detector screen:

* The hit position is sampled from the current detector probability distribution.
* Horizontal hit position is normalized to [-1,1].
* Vertical hit position is uniformly sampled in [0,1].
* The packet ends and one detector-screen hit is added.

When slit detectors are active:

* The model samples an on-slit detection time for the packet.
* If a detector clicks, the corresponding detector count is incremented.
* The downstream packet is re-emitted from the selected slit to represent the post-measurement
  state.

The detector tool is unique to the _Single Particles_ screen and is available only when the barrier
is None.

For the detector tool:

* Position is normalized within the wave region, with x and y in [0,1].
* Radius is a fraction of the wave-region/grid width, range 0.03-0.3, default 0.1.
* Probability is dimensionless in the range 0-1 and is computed by integrating `|psi|^2` inside the
  detector circle.
* If Detect succeeds, the packet ends.
* If Detect fails, probability inside the detector circle is removed and the remaining wave function
  is renormalized.
