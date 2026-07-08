# Interactive Description Design — High Intensity Screen

**Quantum Wave Interference** · GENERATED DRAFT v2 · 2026-07-07

> [!IMPORTANT]
> Derived from `quantum-wave-interference-strings_en.yaml`, sim + common-code TypeScript, and runtime capture via the
> interact harness. **Do not hand-edit — regenerate.**

> [!NOTE]
> **How to read this document**
> - Collapsed, this document is the structural map of the screen. Every ▶ triangle expands one element's full text and variants. **The summary line always tells you: what it is, when it exists, how many variants (×N), and one example.**
> - “Curly-quoted text” is exactly what the user hears. Everything else is document machinery.
> - `{650 nanometers}` marks a dynamic fill-in, shown with an example value.
> - **[when …]** marks content that exists only under a condition.
> - 🔊 marks a spoken response (announced once, when something happens). Everything unmarked is PDOM state (readable on demand, always current).
> - **[common: joist]** / **[common: scenery-phet]** / **[common: sun]** marks text authored in shared PhET libraries, not this sim — included here so nothing a learner hears is missing from this document.
> - ⚠ marks a confirmed issue found during generation. UNKNOWN marks facts not recoverable from YAML or code — honest gaps, not omissions.
> - Shared content used from several places is defined once in [Shared blocks](#shared) and linked, mirroring how the strings themselves are shared.

---

## Screen Summary

Read first on entering the screen, inside the standard scaffold:

> “The High Intensity Screen changes as you play with it. It has a Play Area and a Control Area.” **[common: joist]**
> … four designed parts below …
> “This screen has custom interactions. If needed, check out keyboard shortcuts under Sim Resources.” **[common: joist]**

**Play Area overview** — static:
“A zoomed-in wave area shows a particle source, double-slit barrier, and detector screen. When the source is on, waves travel through available slits and build a pattern on the detector screen. You can change particle type, slit configuration, wave display, detector view, and measurement tools.”

**Control Area overview** — static (shared by all three screens):
“Measurement tools can be added or removed to assist with data collection and analysis. Reset sim to start over.”

<details><summary><b>Current Details</b> — dynamic, ×10 paths — e.g. “Currently, source is off. Detector screen is empty.”</summary>

“Currently,” … then exactly one path. The paused branch prefixes “sim is paused.” and re-capitalizes; otherwise the four states are shared:

| Path | Rendered text (photon example) |
|---|---|
| **[when max hits]** | “Source is off. Maximum hits reached. Detector screen shows hits pattern.” |
| **[when emitting]** | “Source emits `{photons}` directly at double-slit barrier with `{both slits open}`.” + result below |
| — result, intensity | “Detector screen shows intensity pattern.” — or “Detector screen is empty.” **[when wavefront hasn't reached screen]** |
| — result, hits | “Detector screen shows hits pattern.” — or “Detector screen has no hits.” **[when none yet]** |
| **[when source off]** | “Source is off.” + “Detector screen is empty.” — or “Detector screen shows hits pattern.” **[when leftover hits]** |

Slit clause uses **top/bottom** wording on this screen (“top slit covered”, “detector on bottom slit”, “no barrier”…). On this screen “has pattern” means: intensity → wavefront has actually reached the screen; hits → at least one hit.
`Driven by: sceneProperty, currentIsEmittingProperty, isPlayingProperty, currentIsMaxHitsReachedProperty, currentDetectionModeProperty, slitConfigurationProperty, totalHits/wavefront` · `a11y.screenSummary.currentDetails` · wiring `QuantumWaveInterferenceScreenSummaryContent.ts:91–103`, has-pattern rule `HighIntensityScreenView.ts:340–352`
</details>

<details><summary><b>Interaction Hint</b> — dynamic, ×2 — e.g. “Turn on photon source and observe detector screen.”</summary>

- **[when source off]** “Turn on `{photon}` source and observe detector screen.” (noun follows particle type)
- **[when source on]** “Adjust source or slits and watch for changes on detector screen.”

`a11y.screenSummary.interactionHint`
</details>

---

## PLAY AREA

### H3 · Detector Screen and Experiment Details

**[when graph view]** the heading reads **“Graph and Experiment Details”** instead.

<details><summary><b>¶ Status paragraph</b> — ×3 + graph variant — e.g. “Detector screen is empty. Photon experiment ready.”</summary>

- **[when empty, nothing traveling]** “`{Detector screen}` is empty. `{Photon}` experiment ready.”
- **[when empty, waves en route]** “`{Detector screen}` is empty.” — the “ready” invitation is deliberately dropped
- **[when pattern present]** “`{Detector screen}` shows `{an intensity pattern}` of a `{photon}` experiment.”
- **[when graph view]** subject becomes “Graph”

`a11y.experimentDetectorScreenDetails.leadingParagraph` · status computed `HighIntensityScreenView.ts:862–878`
</details>

<a id="milestones"></a>
**Milestone list** — items appear as the experiment progresses. Each PDOM item has a spoken 🔊 twin announced at the moment the milestone is reached; the item then remains readable here.

<details><summary><b>• Advancing beam</b> — <b>[when source on ∧ playing]</b> — e.g. “Red and black plane wave fronts move toward slitted barrier. Wave peaks, very far apart.” — 🔊 twin fires at source start</summary>

Text is the [beam description](#beam) (varies with wave display × particle color × barrier × peak spacing, ×~30 combinations — see shared block).
🔊 twin: announced after “Source started…” — see [source-restart cascade](#cascade-restart) and [Response index](#response-index).
</details>

<details><summary><b>• Wave behavior after slits</b> — <b>[when past slits ∧ barrier exists]</b> — ×8 — e.g. “Overlapping circular wave fronts add and cancel, and spread checkered pattern toward detector screen.”</summary>

By slit configuration × wave display:

| | Amplitude display | E-field / real / imaginary displays |
|---|---|---|
| both open (interference) | “Overlapping solid circular waves add and cancel, and spread fan-shaped rays toward `{detector screen}`.” | “Overlapping circular wave fronts add and cancel, and spread checkered pattern toward `{detector screen}`.” |
| one covered (diffraction) | “Solid circular wave spreads toward `{detector screen}`.” | “Circular wave fronts spread toward `{detector screen}`.” |
| which-path detectors | “Non-interacting solid circular waves spread toward `{detector screen}`.” | “Non-interacting circular wave fronts spread toward `{detector screen}`.” |

Destination becomes “graph.” **[when graph view]**. (No-barrier scenes never show this item.)
🔊 twin: the same strings announced when the wavefront passes the slits — plus an at-slits stage that is *response-only* (see [wave-progress responses](#r-progress)).
`a11y.waveExperimentResponses.waveProgressChanged` · items `HighIntensityExperimentSetupSequenceItems.ts:119–161`
</details>

<details><summary><b>• Hits accumulating</b> — <b>[when hits mode ∧ collecting]</b> — e.g. “Individual scattered hits on detector screen.” — wording advances with hit stage</summary>

Text comes from the [detector pattern matrix — hits mode](#matrix-hits) at the current stage.
🔊 twin: announced each time the hit count crosses a stage threshold ([scale S1](#s1)); duplicates suppressed.
</details>

<details><summary><b>• Completed intensity pattern</b> — <b>[when intensity ∧ pattern complete ∧ screen view]</b> — e.g. “Across detector screen, evenly-spaced bright bands are very close together, brightest at center.”</summary>

Text from the [detector pattern matrix — intensity mode](#matrix-intensity), complete row.
🔊 twin: announced once when formation completes; also a *response-only* announcement when formation starts (“Evenly-spaced bright bands form on detector screen.” family).
</details>

<details><summary><b>• Graph pattern</b> — <b>[when graph view ∧ (hits mode ∨ pattern present)]</b> — e.g. “Graph traces intensity versus position with tall central peak and smaller peaks on either side. 9 peaks centered on the graph, spread symmetrically to either side.”</summary>

Text from the [graph pattern descriptions](#matrix-graph).
`graph bullet wiring: HighIntensityScreenView.ts:885–896`
</details>

<a id="details-list"></a>
**¶ “Experiment details:”** — settings list, values always current:

| Item | Example | Exists when |
|---|---|---|
| Wavelength | “Wavelength is `{650 nanometers}`, in `{red}` zone.” | photon scene |
| Particle Speed | “Particle Speed is `{600 kilometers per second}`.” | matter scenes |
| Slit configuration | “Both slits open.” (top/bottom wording, ×7 — same forms as [combo box](#slit-combo)) | always |
| Slit separation | “Slit separation distance is `{3 micrometers}`.” | slits exist |
| Barrier-screen distance | “Barrier-screen distance is `{0 meters}`.” ⚠ | always |
| Screen brightness | “Screen brightness is `{50 percent}`.” | always |

> [!WARNING]
> **Unit bug:** the barrier-screen distance renders as “0 meters” — a micrometer-scale value is formatted with the
> meters unit (`QuantumWaveInterferenceScreenViewDescription.ts:107–110`). Single Particles likely affected too.

Unit phrases (“nanometers”, “percent”…) formatted by shared PhetUnit code **[common: scenery-phet]**.
`a11y.experimentSetupDetails.*` · `ExperimentSetupDetailsNode.ts`

---

### H3 · Source Controls

<details><summary><b>⊙ Source emitter</b> — switch — name “<code>{Photon}</code> Source Emitter” follows particle type — help ×5 — 🔊 on toggle</summary>

Help text:
- **[when off, photons]** “Turn source on to start experiment.”
- **[when off, matter]** same + mass sentence, e.g. “Electron mass is 9.1 times 10 to the negative 31 kilograms.” (neutron 1.7×10⁻²⁷ kg, helium atom 6.6×10⁻²⁷ kg)
- **[when on]** “Turn source off to stop experiment.”

🔊 **on → on:** “Source started on `{normal}` speed.” — or “Source started, sim now playing on `{normal}` speed.” **[when turning on auto-resumed a paused sim]** — or “Source started. Sim is paused.” **[when still paused]**. If playing, followed by the [beam description](#beam). *Flushes stale speech; never interrupted.*
🔊 **on → off:** “Source off.” — or “Source off. Hits data remain.” **[when hits mode with hits on screen]**
Switch on/off role semantics **[common: sun]**.
`a11y.emitterButton.*, a11y.waveExperimentResponses.sourceStarted/sourceStopped` · trigger `HighIntensityAccessibleResponses.ts:109`
</details>

<details><summary><b>⊙ Wavelength</b> — slider — <b>[when photon scene]</b> — value “<code>{650}</code>, <code>{red}</code> zone” — 🔊 on change</summary>

Help: “Change wavelength of emitted photons in nanometers from shortest, violet, to longest, red.”
Value spoken automatically as the slider moves (native slider semantics **[common: sun]**): “`{650}`, `{red}` zone” — zones ⟨violet · blue · indigo · green · yellow · orange · red⟩ ([scale S4](#s4)).

🔊 **on change:** “Wavelength changed. Experiment changed. Previous hits cleared.” — **[when source on ∧ playing]** fires the [source-restart cascade](#cascade-restart) instead. *Self-interrupting group.*
(The qualitative “Shorter wavelength, bright bands get closer together.” response exists for this slider in the YAML but is wired only on the Experiment screen — it does **not** fire here.)
`a11y.wavelengthSlider.*` · trigger `HighIntensityAccessibleResponses.ts:115`
</details>

<details><summary><b>⊙ Particle Speed</b> — slider — <b>[when matter scene]</b> — replaces Wavelength — 🔊 on change</summary>

Help: “Change speed of emitted particles in kilometers or meters per second.”
UNKNOWN: spoken value format on this screen not verified at runtime (matter scene not exercised).
🔊 **on change:** “Particle speed changed.” — **[when source on ∧ playing]** [source-restart cascade](#cascade-restart). `a11y.particleSpeedSlider.accessibleHelpText` · trigger `:116`
</details>

<details><summary><b>⊙ Particle Type</b> — radio group ×4 — “Photons · Electrons · Neutrons · Helium Atoms” — 🔊 on change</summary>

Name “Particle Type” · Help “Change particle type for source emitter and change experiment setup.” · Group navigation semantics **[common: sun]**.

🔊 **on change:** “`{Electron}` experiment ready to start.” — or “…in progress.” **[when emitting]**. If the switch turned the source off, that “Source off.” response precedes this one.
Design note recovered from code: the per-button responses in the YAML (“Now experimenting with electrons. Source, slits, and screen settings updated.”) are deliberately **disabled on this screen** — the screen-level response above speaks instead (`HighIntensityScreenView.ts:460–463`).
`a11y.sceneRadioButtonGroup.*, a11y.waveExperimentResponses.particleTypeChanged` · trigger `:110` (any change whose before/after particle differs collapses to this one response)
</details>

---

### H3 · Slits and Screen Configuration

<a id="slit-combo"></a>
<details><summary><b>⊙ Slit Configuration</b> — combo box ×7 — “Both Open · Cover Left · Cover Right · Detector Left · Detector Right · Detector Both · No Barrier” — 🔊 on change</summary>

Name “Slit Configuration” · Help “Choose slit configuration for barrier.” · Popup/list interaction semantics **[common: sun ComboBox]**.

🔊 **on change:** “In barrier, top slit covered.” / “Detector added to bottom slit in barrier.” / “Barrier removed from experiment.” / “In barrier, both slits open.” / “Detectors added to both slits in barrier.” (top/bottom wording) — **[when source on ∧ playing]** [source-restart cascade](#cascade-restart) instead.
UNKNOWN: the combo box also has its own response string in the YAML (`a11y.slitSettingsComboBox.accessibleContextResponse`, left/right wording); whether it is suppressed on this screen (as the Particle Type buttons’ are) is unverified — check for double-speak.
`a11y.waveExperimentResponses.slitConfigurationChanged` · trigger `:112`
</details>

<details><summary><b>⊙ Slit Separation</b> — slider — 🔊 on change</summary>

Help: “Change distance between centers of slits in barrier.”
🔊 **on change:** “Slit separation changed. Experiment changed. Previous hits cleared.” — **[when source on ∧ playing]** [source-restart cascade](#cascade-restart). *Self-interrupting group.*
`a11y.slitSeparationSlider.*` · trigger `:113`
</details>

<details><summary><b>⊙ Barrier-Screen Distance</b> — slider — object response ×4 — 🔊 restart only</summary>

Name “Barrier-Screen Distance” · Help **[when photons]** “Move slitted barrier closer to or farther from detector screen in micrometers.” / **[when matter]** “…in nanometers.”
🔊 **while sliding** (object response): ⟨“Closer to detector screen.” · “Farther from…” · “Closest…” · “Farthest…”⟩
🔊 **on change:** otherwise silent — **[when source on ∧ playing]** [source-restart cascade](#cascade-restart).
`a11y.barrierPositionSlider.*` · trigger `:114` · object-response wiring believed in `DoubleSlitNode.ts` (UNKNOWN — unverified)
</details>

---

### H3 · Detector Screen Controls

<details><summary><b>⊙ Screen / Graph</b> — toggle switch — name “Screen, Switch to Graph” ⇄ “Graph, Switch to Screen” — 🔊 on toggle</summary>

Help: “Choose screen or graph representation for data analysis.” · Switch naming pattern **[common: sun ToggleSwitch]**.
🔊 **→ graph:** “Graph shown. `{Graph traces intensity versus position with tall central peak and smaller peaks on either side. 9 peaks centered on the graph, spread symmetrically to either side.}`” (includes current [graph state](#matrix-graph); runtime-verified)
🔊 **→ screen:** “Detector screen shown.”
`a11y.screenGraphSwitch, a11y.waveExperimentResponses.displayModeChanged` · trigger `:117`
</details>

<details><summary><b>⊙ Detection Mode</b> — radio ×2 — “Intensity · Hits” — 🔊 on change</summary>

Name “Detection Mode” · Help “Choose continuous intensity pattern or individual hits pattern for particle detection.”
🔊 **on change:** current pattern description for the new mode from the [matrices](#matrix-hits) — or, if the visible surface is empty: “Screen is empty. Start particle source.” (graph view: “Graph is empty…” / “Histogram empty…”).
> [!WARNING]
> Known interaction: mode change + an immediately following progress update can speak the same sentence twice
> (dedup covers progress actions only).
`a11y.detectionModeRadioButtons.*, a11y.waveExperimentResponses.screenEmpty` · trigger `:111`
</details>

<details><summary><b>⊙ Screen Brightness</b> — slider — value “<code>{50}</code> percent” [common] — 🔊 on change ×3</summary>

Name “Screen Brightness” · Help “Adjust brightness for pattern on detector screen.” · Percent value text **[common: scenery-phet percentUnit]**.
🔊 **on change:** “Screen brightness ⟨increased. · decreased. · unchanged.⟩” `a11y.brightnessSlider.*, …brightnessChanged` · trigger `:118`
</details>

<details><summary><b>⊙ Take Snapshot</b> — button — help counts stored ×6 — 🔊 on press ×2</summary>

Help: “Capture and store up to `{4}` snapshots of detector screen pattern.” — prefixed “One/Two/Three/Four snapshots stored.” as they accumulate.
🔊 **on press:** “Detector screen snapshot stored.” (runtime-verified) — at the limit: “Max number of snapshots stored. View snapshots to review or delete.”
`a11y.detectorScreenButtons.takeSnapshot.*`
</details>

<details><summary><b>⊙ View Snapshots</b> — button — 🔊 opens dialog — dialog contents inside</summary>

Help: “After taking snapshots, open for comparison or deletion.” — gains stored-count prefix once snapshots exist.
🔊 **on open:** “`{1 snapshot}` ready to review.”

**Snapshots dialog** (opens on press; dialog semantics **[common: sun Dialog]**):
- Heading: “`{2}` `{Photon}` Experiment `{Snapshots}`” (count + particle + pluralization)
- Per snapshot: pattern description (same strings as the [matrices](#matrix-hits)) + “Screen brightness is `{50 percent}`.”
- “Delete `{Snapshot 1}`” buttons — 🔊 “Snapshot deleted.” / “Snapshot deleted, dialog closed.” **[when last one]**
`a11y.snapshotsDialog.*, a11y.snapshotNode.*`
</details>

<details><summary><b>⊙ Tool checkboxes ×4</b> — Measuring Tape · Stopwatch · Time Plot · Position Plot — 🔊 shown/hidden</summary>

Checkbox semantics **[common: sun Checkbox]**. Help texts:
- “Add measuring tape to measure distances on detector screen or graph. Once added, move with keyboard shortcuts.”
- “Add stopwatch to time experiment. Once added, Start, Pause, Reset Stopwatch, and move with keyboard shortcuts.”
- “Use added time plot to graph wave value at position over time.”
- “Use added position plot to graph wave value across positions in wave area.”

🔊 **on toggle:** “⟨Measuring tape · Stopwatch · Time plot · Position plot⟩ ⟨shown. · hidden.⟩” (spoken by the screen-level system, one response per toggle)
`a11y.*Checkbox.accessibleHelpText, …toolChanged` · triggers `:120–123`
</details>

<details><summary><b>⊙ Graph zoom</b> — <b>[when graph view]</b> — buttons “Zoom Out · Zoom In” + level paragraph — 🔊 per press</summary>

Paragraph: “Zoom level `{3}`. Use up to 6 zoom levels to zoom in on small data sets or zoom out on large data sets and optimize amount of data visible on graph.”
🔊 **per press:** “Zoom level `{4}` of `{6}`.” (runtime-verified)
`a11y.zoomInButton/zoomOutButton/zoomButtonGroup.*, detectorPatternGraph.zoomButtonGroup`
</details>

<details><summary><b>⊙ Measurement tool nodes</b> — <b>[when a tool is added]</b> — probes and charts in the wave area</summary>

- **Time Plot Probe** — “Move probe to choose which point of wave area is graphed over time.” · Chart “Time Plot Chart” — “Move chart to a convenient position.” · Chart paragraph: “Chart shows ⟨electric field · real part of wave function · imaginary part of wave function · amplitude⟩ at probe position versus time.”
- **Position Plot Probe** — “Move probe up or down to choose which row of wave area is graphed.” · Value: “`{Center}` of wave area⟨, across open slit · , across covered slit · , across slit with detector · —⟩” (region ⟨Near top · Above center · Center · Below center · Near bottom⟩) · Chart paragraph: “Chart shows ⟨…⟩ versus position along selected row of wave area.”
- Measuring tape and stopwatch interaction text **[common: scenery-phet]** — not expanded here (UNKNOWN exact strings; capture via harness when needed).
`a11y.timePlot.*, a11y.positionPlot.*`
</details>

---

## CONTROL AREA

<details><summary><b>⊙ Wave Display</b> — combo box — <b>[photon scene]</b> “Electric Field · Amplitude” / <b>[matter]</b> “Real Part · Imaginary Part · Amplitude” — 🔊 on change</summary>

Help **[photon]**: “Choose Electric Field or Amplitude display for photon wave.” · **[matter]**: “Choose real part, imaginary part, or amplitude display for matter wave function.”
🔊 **on change:** “Wave display changed to ⟨Electric Field. · Real Part. · Imaginary Part. · Amplitude.⟩” `a11y.photonWaveDisplayComboBox / matterWaveDisplayComboBox, …waveDisplayChanged` · trigger `:119`
</details>

<details><summary><b>⊙ Time Controls</b> — <b>[common: scenery-phet]</b> — Pause/Play · Step Forward · Sim Speeds — 🔊 responses inside</summary>

All text and responses authored in scenery-phet (runtime-verified on this sim):
- Group help: “Pause sim to step through little by little.”
- **Pause/Play button** (name flips) — 🔊 “Sim paused.” / “Sim playing.”
- **Step Forward** — enabled while paused — 🔊 “Stepping forward.” · help while playing: “Pause sim to step forward little by little.” / while paused: “Play sim to resume chosen speed.”
- **Sim Speeds** radio ×3 “Slow · Normal · Fast” — group help: “For closer observations Play sim on slower speed.” — 🔊 **silent on change** (runtime-verified; the sim also deliberately refreshes its response baseline without speaking, `HighIntensityAccessibleResponses.ts:124–125`). The chosen speed is voiced later inside “Source started on `{slow}` speed.”

Note: the sim has its own speeds description in the YAML (“Choose Normal or Fast speed. In Hits mode, Fast collects hits more quickly…” `a11y.timeControlNode.simSpeedDescription`) — it did **not** appear in this screen’s PDOM at runtime. UNKNOWN where it attaches (possibly another screen).
</details>

<details><summary><b>⊙ Erase</b> — button — name <b>[common: scenery-phet EraserButton]</b> — 🔊 one response per press</summary>

Name: “Erase” (`scenery-phet-strings eraserButton.accessibleName`).
🔊 **on press:** “Wave area cleared. Sim still paused.” (runtime-verified while paused) — **[when source on ∧ playing]** [source-restart cascade](#cascade-restart) instead. Property listeners are suppressed during the clear so exactly one response speaks (`HighIntensityAccessibleResponses.ts:214–229`).
</details>

<details><summary><b>⊙ Reset All</b> — button — <b>[common: scenery-phet ResetAllButton]</b> — 🔊 “Everything reset.”</summary>

Name: “Reset All” · 🔊 **on press:** “Everything reset.” **[common]** (runtime-verified).
> [!WARNING]
> The sim defines its own reset response — “Experiment reset. Source is off and detector screen is empty.”
> (`a11y.waveExperimentResponses.reset`) — and the transition describer supports it, but **it never fired at
> runtime** and no listener emits the `reset` action. Either wire it or remove the string.
</details>

---

## SIM SCREENS — **[common: joist]**

Screen buttons: “Home Screen” (“Go to Home Screen.”), “Experiment Screen”, “High Intensity Screen”, “Single Particles Screen”. Button semantics and “Go to {name} Screen.” pattern are joist; the one-line descriptions are sim-authored:
- Experiment: “Explore how source, slit, and detector settings shape intensity and hits patterns.”
- High Intensity: “Explore how interfering waves build patterns on a detector screen.”
- Single Particles: “Explore how one particle at a time builds a probability pattern.”
`a11y.*Screen.screenButtonsHelpText` · joist `goToScreenPattern`

## SIM RESOURCES — **[common: joist]**

- **Preferences** — opens preferences dialog (contents not expanded here)
- **All Audio** — toggle — 🔊 “Audio Features on.” / “Audio Features off.” (runtime-verified)
- **Keyboard Shortcuts** — opens the keyboard help dialog (documented separately; see `QuantumWaveInterferenceKeyboardHelpContent.ts`)
- **PhET Menu**

---

<a id="shared"></a>
## Shared blocks

<a id="cascade-restart"></a>
### 🔊 Source-restart cascade — fired by: slit configuration · slit separation · wavelength · particle speed · barrier position · erase **[when source on ∧ playing]**

“Source restarted.” → then the current [beam description](#beam), e.g. “Red and black plane wave fronts move toward slitted barrier. Wave peaks, very far apart.”
*Flushes stale queued speech first; never self-interrupted.* Defined once — the YAML shares the fragment the same way (`a11y.waveExperimentResponses.sourceRestarted` + `advancingWave`).

<a id="beam"></a>
<details><summary><b>Beam description</b> — ×~30 — used by: milestone item 1, source start, restart cascade — e.g. “Red and black plane wave fronts move toward slitted barrier. Wave peaks, very far apart.” (default state)</summary>

Frame by wave display mode:
- **[Amplitude]** “Solid `{red}` wave moves toward `{slitted barrier.}`”
- **[E-field / real / imaginary]** “`{Red}` and black plane wave fronts move toward `{slitted barrier.}` Wave peaks, ⟨extremely far apart · very far apart · far apart · somewhat close together · close together · very close together · extremely close together⟩.”

Color: photons ⟨violet · blue · indigo · green · yellow · orange · red⟩ by wavelength ([S4](#s4)); matter particles “gray”.
Destination: “slitted barrier.” — “detector screen.” **[when no barrier]**.
`a11y.waveExperimentState.sourceBeam + a11y.sourceWaveFragments.*` · peak-spacing category `getWavePeakSpacingCategory.ts`
</details>

<a id="matrix-hits"></a>
<details><summary><b>Detector pattern — hits mode</b> — ×26 — used by: milestone item 3, 🔊 hit-stage responses, 🔊 detection-mode response, snapshots dialog</summary>

Rows = hit stage ([S1](#s1) thresholds); columns = barrier setup. Sub-lines are envelope variants ([S5](#s5)).

| stage | double slit | single slit | which-path detectors | no barrier |
|---|---|---|---|---|
| **none** (0) | “Detector screen is empty. No particles have arrived yet.” — *all setups* | ← | ← | ← |
| **few** (1+) | “Individual scattered hits on detector screen.” — *all setups* | ← | ← | ← |
| **emerging** (188+) | “Hits begin to form faint bands.”<br>*two close areas:* “…faint bands grouped into two close areas.”<br>*two distinct areas:* “…grouped into two distinct areas.” | “Hits collect in broad central area, fewer hits toward edges.” | “Hits collect in broad central area, fewer hits toward edges.”<br>*two close areas:* “Hits are closely clustering into two areas, directly across from the slits.”<br>*two distinct areas:* “Hits collect in two distinct areas, directly across from the slits.” | “Hits build up evenly across detector screen.” |
| **developing** (300+) | “Evenly-spaced bands more distinct.”<br>*clustering variants:* “Evenly-spaced bands are grouped into two ⟨close · distinct⟩ areas.” | *same as emerging* | *same as emerging* | “Hits scatter evenly from edge to edge.” |
| **steady pattern** (563+) | “Across detector screen, evenly-spaced bright bands are ⟨[spacing ×7 — S2](#s2)⟩, brightest at center.”<br>*clustering variants:* “…bright bands are grouped into two ⟨close · distinct⟩ areas.” | “Across detector screen, hits form broad central bright area with fewer hits toward edges.” | “Across detector screen, hits form broad central bright area with fewer hits toward edges.”<br>*clustering variants: same strings as emerging* | “Across detector screen, hits form uniform glow from edge to edge.” |

Full-width rows: those stages ignore the barrier setup. “Same as” cells are real string reuse in the YAML — visible here so deliberate plateaus can be reviewed.
`a11y.waveExperimentState.detectorPattern (hits branch)`
</details>

<a id="matrix-intensity"></a>
<details><summary><b>Detector pattern — intensity mode</b> — ×14 — used by: milestone item 4, 🔊 pattern-formation responses, 🔊 detection-mode response</summary>

Rows = formation stage ([S6](#s6)); columns = barrier setup.

| stage | double slit | single slit | which-path detectors | no barrier |
|---|---|---|---|---|
| **empty** | “Detector screen is empty while the wave travels toward it.” — *all setups* | ← | ← | ← |
| **forming** | “Evenly-spaced bright bands form on detector screen.”<br>*clustering:* “…grouped into two ⟨close · distinct⟩ areas.” | “Broad central area forms on detector screen.” | “Broad central area forms on detector screen.”<br>*clustering:* “Two ⟨close · distinct⟩ bright areas form on detector screen, directly across from the slits.” | “Uniform glow forms on detector screen.” |
| **complete** | “Across detector screen, evenly-spaced bright bands are ⟨[spacing ×7 — S2](#s2)⟩, brightest at center.”<br>*clustering:* “…grouped into two ⟨close · distinct⟩ areas.” | “Across detector screen, a broad central bright area tapers toward edges.” | “Across detector screen, a broad central bright area tapers toward edges.”<br>*clustering:* “…brightness is closely clustering into two areas…” / “…two distinct bright areas, directly across from the slits, each fading toward its edges.” | “Across detector screen, uniform glow spans edge to edge.” |
| **paused** | “Detector pattern formation is paused.” — *all setups* | ← | ← | ← |

Also: “Source is off. Detector screen is empty.” **[when source off]**.
`a11y.waveExperimentState.detectorPattern (intensity branch)`
</details>

<a id="matrix-graph"></a>
<details><summary><b>Graph pattern descriptions</b> — ×~20 — used by: graph milestone bullet, 🔊 responses while graph view is active</summary>

Intensity mode (trace): “Graph is empty. Source is off.” · “Graph traces intensity versus position with tall central peak and smaller peaks on either side. `{9 peaks centered on the graph, spread symmetrically to either side.}`” (double slit; clustering variants: “…repeated peaks grouped into two ⟨close · distinct⟩ areas.”) · single slit: “…as a single broad peak centered on the graph, tapering smoothly toward the edges.” (clustering: “…two peaks that are ⟨close together · distinct⟩.”) · no barrier: “Graph traces uniform intensity versus position as a flat horizontal line.”

Hits mode (histogram): “Histogram empty. No particles counted.” → “A few bars at scattered positions across histogram.” → “Histogram growing. Some bars are becoming taller than others at repeated positions across graph.” (clustering variants) → “Taller bars at regular intervals, with shorter bars between them. `{spatial}`” → “Histogram shows a tall central peak with repeating side peaks and lower bars between them. `{spatial}`” · single-slit and no-barrier variants parallel the detector matrix.

Spatial sentence on this screen is always the no-ruler form (“`{9}` peaks centered on the graph, spread symmetrically to either side.”) — the ruler is never available here (`HighIntensityScreenView.ts:425`).
`a11y.detectorPatternGraph.accessibleParagraph.*, a11y.detectorScreen.spatialDescription.*`
</details>

<a id="r-progress"></a>
<details><summary><b>🔊 Wave-progress responses</b> — response-only, ×~20 — fired per stage change during propagation; “traveling to slits” and “direct to screen” stages are deliberately silent</summary>

- **at slits** — by barrier × display: “Circular wave fronts emerge from both slits and overlap.” (E-field family, both open) / “Solid circular waves emerge from both slits and overlap.” (amplitude) / “…emerges from open slit only.” (one covered) / “As detection events occur, ⟨solid circular waves · circular wave fronts⟩ emerge from both slits one at a time and do not interact.” (which-path)
- **after slits** — the same 8 strings as milestone item 2 (spoken twin)
- **source off** — “Source is off, so no wave is traveling.”

Destination says “graph.” **[when graph view]**. Text dedup: identical consecutive announcements dropped.
`a11y.waveExperimentResponses.waveProgressChanged` · stage computation `HighIntensityScreenView.ts:179–236` (thresholds shared with Single Particles)
</details>

🔊 **Max hits** — “Maximum hits reached. Source is off.” — fired when the hit cap is hit; the emitter also turns off. `…maxHitsReached` · trigger `:127–131`

---

## Qualitative scales — the vocabulary of “how it looks”

Category boundaries live in analysis code, not YAML; they select which string variant renders.

<a id="s1"></a>**S1 · Hit stages** (total hits): none 0 · few 1+ · emerging 188+ · developing 300+ · steady pattern 563+ — `BandAnalysis.ts:51–56`

<a id="s2"></a>**S2 · Band spacing** (fringe spacing ÷ screen width): extremely far apart ≥.50 · very far apart ≥.33 · far apart ≥.16 · somewhat close together ≥.08 · close together ≥.05 · very close together ≥.03 · extremely close together below — default photon pattern tuned to land mid-scale — `BandAnalysis.ts:88–99`. The same seven phrases describe wave-peak spacing in beam descriptions.

<a id="s4"></a>**S4 · Photon color zones** (wavelength): violet · blue · indigo · green · yellow · orange · red — `WavelengthColorUtils.ts`

<a id="s5"></a>**S5 · Envelope** (pattern silhouette): brightest at center · clustering into two close areas · clustering into two distinct areas — heuristic in `BandAnalysis.analyzeEnvelopeHeuristic` (boundary values UNKNOWN — not extracted)

<a id="s6"></a>**S6 · Pattern formation** (intensity mode): empty → forming → complete (formation factor threshold) · paused **[when paused mid-formation]** — `HighIntensityScreenView.ts:133–152`

**Wave progress stages**: source off → traveling to slits *(silent)* → at slits → ⟨interfering · diffracting · non-interacting⟩ after slits → (no barrier: direct to screen, *silent*) — per-frame estimate from propagation speed × elapsed time.

---

<a id="response-index"></a>
## Response index — every 🔊 on this screen, one line each

| Trigger | Response (first line) | Queueing | Where defined |
|---|---|---|---|
| Source on | “Source started on `{normal}` speed.” + beam | flush, uninterruptible | [emitter](#milestones) |
| Source off | “Source off.” (+ “Hits data remain.”) | group | emitter |
| Particle type | “`{Electron}` experiment ready to start.” | group | Particle Type |
| Detection mode | pattern description or “…empty. Start particle source.” | group | Detection Mode |
| Slit configuration | “In barrier, top slit covered.” etc. | group / restart→flush | Slit Configuration |
| Slit separation / wavelength / speed | “`{X}` changed. Experiment changed. Previous hits cleared.” | group / restart→flush | sliders |
| Barrier position | silent, or restart cascade | flush when restarting | Barrier-Screen Distance |
| Screen/Graph view | “Graph shown. `{state}`” / “Detector screen shown.” | group | Screen/Graph |
| Brightness | “Screen brightness ⟨increased·decreased·unchanged⟩.” | group | Screen Brightness |
| Wave display | “Wave display changed to `{X}`.” | group | Wave Display |
| Tool toggles | “`{Tool}` ⟨shown·hidden⟩.” | group | checkboxes |
| Hit stage crossed | matrix string for new stage | group + dedup | [matrix](#matrix-hits) |
| Max hits | “Maximum hits reached. Source is off.” | group | shared |
| Hits cleared / Erase | “Wave area cleared. Sim still paused.” or restart | group / flush | Erase |
| Wave progress | stage strings | group + dedup | [progress](#r-progress) |
| Pattern formation start/complete | matrix strings | group + dedup | matrices |
| Snapshot / View / Delete | “Detector screen snapshot stored.” etc. | component-level | snapshot buttons |
| Zoom | “Zoom level `{4}` of `{6}`.” | component-level | zoom |
| Pause/Play · Step | “Sim paused.” / “Sim playing.” / “Stepping forward.” **[common]** | component-level | Time Controls |
| Sim speed | *silent* (voiced later in “Source started on `{slow}` speed.”) | — | Time Controls |
| Reset All | “Everything reset.” **[common]** ⚠ sim reset string never fires | component-level | Reset All |
| All Audio | “Audio Features ⟨on·off⟩.” **[common]** | component-level | Sim Resources |

---

## Generation notes — unresolved in this draft

1. Slit Configuration combo: possible double response (own YAML response vs. screen-level) — needs runtime trace on this screen.
2. ⚠ “Barrier-screen distance is 0 meters” — unit bug, fix pending.
3. ⚠ Sim reset response (“Experiment reset…”) defined but never fires — wire or remove.
5. Particle-speed spoken value format (matter scenes) — not exercised.
6. Envelope-category thresholds (S5) — not extracted.
7. Measuring tape / stopwatch interaction strings **[common]** — not captured; harness pass needed with tools added.
8. Preferences dialog and Keyboard Shortcuts dialog contents — out of scope for this screen document.
