# Figma remix kit

The webinar template, in a form the design team can pull apart.

Two ways in — pick based on whether you want to *look* at it or *work* in it.

| | Setup | What you get |
|---|---|---|
| **SVG** | Drag onto a canvas | Frames, shapes, editable text, guides. Flat — no components or styles. |
| **Plugin** | One-time import | Both artboards, components, colour + text styles, per-platform guide overlays. |

---

## Option A — drag in the SVG

Drag `iterable-webinar-4x5.svg` onto a Figma canvas. That's it.

Text is authored as real `<text>` elements and is **not outlined**, so it should
land as editable text layers rather than vector paths. If you re-export these
files from another tool, don't let it convert text to outlines — that's the one
setting that decides which of the two you get.

Layer names come from SVG `id` attributes, which can't contain spaces, so
they're hyphenated versions of the After Effects layer names
(`CAPTION-line-1` ↔ `CAPTION — line 1`).

## Option B — run the plugin

1. **Plugins → Development → Import plugin from manifest…**
2. Pick `plugin/manifest.json`.
3. **Plugins → Development → Iterable Webinar Template Kit**

It builds into whatever file you run it in:

- **Webinar 4:5 — 1080×1350 — APPROVED** — the signed-off layout
- **Webinar 9:16 — DERIVED, not yet designed** — see the caveat below
- **Components** — speaker window and caption chip
- **9 colour styles, 4 text styles** under a `Webinar/` prefix
- **Guide overlays** — one locked, hidden frame per platform, so you can toggle
  LinkedIn and Instagram independently

---

## What's in here

| File | Purpose |
|---|---|
| `layout.json` | Canonical geometry. Every other file derives from this. |
| `iterable-webinar-4x5.svg` | Approved 1080×1350 layout. |
| `iterable-webinar-9x16.svg` | 1080×1920 starting point. |
| `plugin/manifest.json`, `plugin/code.js` | The plugin. |

### ⚠️ The 9:16 artboard is not designed work

It's the 4:5 elements at their original sizes, re-centred on a taller canvas.
Nobody has decided how this layout *should* adapt to 9:16 — that's the open
question this file exists to hand you.

It exists because a 4:5 video posted to Instagram becomes a Reel and gets
letterboxed into a 1080×1920 player. A native 9:16 cut sidesteps that. Whether
that's worth maintaining a second layout is a call for the team.

### Tokens

Colour and text styles use generic names — `surface`, `on-surface/muted`,
`guide/linkedin` — rather than brand names, so pointing them at a real Iterable
library is a re-map rather than a rebuild. **The current palette is placeholder.**
It was never brand-matched; it's a neutral dark scheme chosen to make the layout
legible during review.

### Fonts

Everything is Sofia Pro Medium except the speaker name, which is Bold — the only
element the approved design sets heavier. If Bold isn't installed the plugin
falls back to Medium and says so in a notification rather than substituting
silently.

---

## Porting a remix back to After Effects

The Figma geometry and the AE script share one coordinate system, so changes
port back mechanically:

1. Note the new x / y / w / h off the Figma layer.
2. Open `../build-template.jsx` and edit the matching entry in the `CFG` block —
   layer names correspond directly.
3. Update `layout.json` and re-run the AE script.

Keep `layout.json`, `build-template.jsx`, the two SVGs, and `plugin/code.js` in
sync. There's no build step tying them together; for a five-file kit a toolchain
would cost more than it saves, but it does mean a geometry change is a five-file
edit.

## Checklist for the first person to open this

I can't drive Figma from here, so these need a human:

- [ ] SVG imports at 1080×1350 with the speaker window at a 20 radius
- [ ] **Double-clicking a caption line enters text editing** rather than
      selecting a vector path — if it selects a path, the text got outlined
      somewhere and the SVG needs regenerating
- [ ] Plugin creates both frames, components, and 13 styles
- [ ] Sofia Pro Medium and Bold resolve, or the fallback warning fires
- [ ] Guide frames are locked and hidden by default
