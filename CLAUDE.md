# Quantum Wave Interference

## Verification

After making changes, run **both** of the following from the totality root:

```bash
npm run check
npm run sim-test -- --sim=quantum-wave-interference
```

The first runs type checking and linting. The second launches the sim in a headless browser and verifies it starts without errors. Both must pass.

## Using sim-test to Inspect Runtime State

sim-test accepts a `--script` flag that evaluates JavaScript in the browser after the sim starts. Use this to interrogate model state, verify property values, and understand the sim at runtime.

### Basic Examples

```bash
# How many screens?
npm run sim-test -- --sim=quantum-wave-interference --script="phet.joist.sim.screens.length"

# Sim version
npm run sim-test -- --sim=quantum-wave-interference --script="phet.joist.sim.version"

# List screen names
npm run sim-test -- --sim=quantum-wave-interference --script="phet.joist.sim.screens.map(s => s.tandem.phetioID).join(', ')"
```

### Inspecting Model State

```bash
# Dump key model properties from screen 0
npm run sim-test -- --sim=quantum-wave-interference --script="
  const model = phet.joist.sim.screens[0].model;
  const scene = model.sceneProperty.value;
  JSON.stringify({
    selectedScene: scene.sourceType,
    isPlaying: model.isPlayingProperty.value,
    wavelength: scene.wavelengthProperty.value,
    intensity: scene.intensityProperty.value,
    slitSetting: scene.slitSettingProperty.value,
    isEmitting: scene.isEmittingProperty.value
  }, null, 2)
"
```

### Verifying a Change

After modifying model code, use `--script` to confirm the change took effect:

```bash
# Example: verify a new property exists and has the expected default
npm run sim-test -- --sim=quantum-wave-interference --script="
  const model = phet.joist.sim.screens[0].model;
  JSON.stringify({ myNewProperty: model.myNewProperty.value })
"
```

### Exploring Unfamiliar State

When you're not sure what properties exist, explore incrementally:

```bash
# List own property names on the model
npm run sim-test -- --sim=quantum-wave-interference --script="
  Object.getOwnPropertyNames(phet.joist.sim.screens[0].model).filter(k => k.endsWith('Property')).join('\n')
"

# Then drill into a specific one
npm run sim-test -- --sim=quantum-wave-interference --script="
  phet.joist.sim.screens[0].model.someProperty.value
"
```

## Multi-Pass Workflow

When working on QWI, use sim-test iteratively:

1. **Explore** -- Use `--script` to understand the current model state before making changes.
2. **Change** -- Edit the code.
3. **Check** -- Run `npm run check` for type/lint errors.
4. **Smoke test** -- Run `npm run sim-test -- --sim=quantum-wave-interference` to confirm the sim starts.
5. **Verify** -- Run sim-test with `--script` to confirm the change has the expected runtime effect.
6. Repeat as needed.

## Reference

See `doc/implementation-notes.md` for architecture details, component nickname/street-name mappings (e.g., "camera" = `snapshotButton`, "eye" = `viewSnapshotsButton`), and other helpful context.

## Sim Structure

- **Screens**: Experiment (single screen sim when built with `--screens=1`)
- **Common code**: `js/common/` -- colors, constants, query parameters
- **Experiment screen**: `js/experiment/` -- model and view
- **Entry point**: `js/quantum-wave-interference-main.ts`
- **Strings**: `quantum-wave-interference-strings_en.yaml`