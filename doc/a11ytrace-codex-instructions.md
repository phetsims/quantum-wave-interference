# QWI High Intensity `a11yTrace` Codex Instructions

Use this guide when iterating on Quantum Wave Interference High Intensity screen accessibility text with
`node turing/js/interact.ts a11yTrace`. The goal is to compare authored accessible state from
`getAccessibleViewState()` against current-details PDOM text and ARIA live responses after each focused interaction.

## Prerequisites

The interact daemon must already be running in another terminal. Codex should not launch the daemon, the user is responsible
for that. If the daemon is not running, tell the user to launch it via:

```bash
node turing/js/interact-daemon.ts
```

Launch the High Intensity screen with PhET-iO enabled:

```bash
node turing/js/interact.ts navigate "http://localhost/quantum-wave-interference/quantum-wave-interference_en.html?brand=phet-io&ea&phetioStandalone&logSimLifecycle&screens=2" --json
```

Run `interact.ts` commands serially against the daemon. Do not parallelize traces; focus, ARIA live queues, and sim state
can race when multiple commands hit the same daemon at once.

In managed agent environments, invoke `node turing/js/interact.ts ...` directly when the command needs to reach the
daemon. Avoid shell redirection, pipes, `node -e`, `curl`, or other wrappers around `interact.ts`; those wrappers can
run outside the approved daemon-client execution path and fail with `Failed to connect to daemon at localhost:3001`.
Prefer `--json` or `--raw` and let the agent tooling capture stdout directly.

## Orientation

Use these before tracing, especially after a reload or screen-state change:

```bash
node turing/js/interact.ts status --json
node turing/js/interact.ts look
node turing/js/interact.ts peek
node turing/js/interact.ts a11ySnapshot --json
```

`look` changes focus while building the focus order. Prefer `peek` when you only need the current PDOM.

## Trace Workflow

Prefer one focused interaction per trace:

```bash
node turing/js/interact.ts a11yTrace tab "Photon Source Emitter" + press Space + wait 400 --json
```

For each trace, inspect:

- `before.accessibleViewState`
- `after.accessibleViewState`
- `diff.accessibleViewState`
- `after.pdom.text`
- `after.pdom.developmentText`
- `ariaLive`

The `diff.accessibleViewState` object is shallow. When a nested object changed, inspect the nested `before` and `after`
objects directly, especially:

- `waveProgress`
- `measurementTools`
- `slitBarrier`
- `detectorScreen`
- `detectorPatternGraph`

The accessible text should be an accurate, rounded, localized rendering of the view state. Treat mismatched units, stale
text after a state change, missing live responses, and unrounded numeric strings as bugs.

## Trace Recipes

Source toggle:

```bash
node turing/js/interact.ts a11yTrace tab "Photon Source Emitter" + press Space + wait 400 --json
```

Photon wavelength:

```bash
node turing/js/interact.ts a11yTrace tab "Wavelength" + press ArrowLeft + wait 150 --json
```

Particle type radio group:

```bash
node turing/js/interact.ts a11yTrace tab "Photons" + press ArrowDown + wait 300 --json
```

Detection mode radio group:

```bash
node turing/js/interact.ts a11yTrace tab "Intensity" + press ArrowDown + wait 300 --json
```

Display mode:

```bash
node turing/js/interact.ts a11yTrace tab "Screen, Switch to Graph" + press Space + wait 300 --json
```

Tool visibility:

```bash
node turing/js/interact.ts a11yTrace tab "Tape Measure" + press Space + wait 300 --json
```

For detection mode, tab to whichever radio button is currently selected, such as `Intensity` or `Hits`, then use arrow
keys.

## Radio-Button Gotcha

Only the selected radio button is in focus traversal. To select another radio option, tab to the currently selected
option, then press arrow keys.

Do not try this from the default state:

```bash
node turing/js/interact.ts a11yTrace tab "Electrons" + press Space + wait 300 --json
```

`Electrons` is not the active tab stop until it has already been selected. From the default state, tab to `Photons` and
press an arrow key instead.

## Validation Checklist

For every trace, verify accessible text matches the corresponding state fields:

- `sourceType`, `isEmitting`, `isPlaying`, `detectionMode`, `displayMode`
- photon `wavelengthNM` and `wavelengthColorZone`
- matter `particleSpeedMetersPerSecond` and `effectiveWavelengthPicometers`
- `slitConfiguration`, `slitSeparationMM`, `slitSeparationMicrometers`
- `screenBrightnessPercent`, `waveDisplayMode`, `numberOfSnapshots`
- `measurementTools.*.visible`
- `waveProgress.stage`, `waveProgress.checkpoint`, and `waveProgress.wavefrontPercent`
- nested summaries in `detectorScreen`, `detectorPatternGraph`, `slitBarrier`, and `measurementTools`
- relevant ARIA live responses in `ariaLive`

Also compare the PDOM current-details wording against `after.accessibleViewState`. The state is the semantic source of
truth, while the PDOM and live responses are the user-facing descriptions that must stay synchronized with it.

Known issue pattern to catch: after switching to electrons, current details can correctly say the slit separation is
`3.00 nanometers`, while another Experiment Setup detail says `0.003000000000000000 micrometers`. Flag this as a
description/value-formatting bug: the value is not rounded and the unit presentation is inconsistent with the intended
description.
