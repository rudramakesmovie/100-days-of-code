# Iterable Webinar 4×5 Template

A reusable After Effects template for cutting webinar recordings into 1080×1350
(4:5) clips for LinkedIn, plus a `.mogrt` so editors can do episode-to-episode
work entirely inside Premiere.

| File | What it is |
|---|---|
| `build-template.jsx` | AE script that builds the whole comp to spec. Start here. |
| `layout-spec.html` | The approved layout — open in a browser for pixel coordinates and the phone-legibility check. |
| `README.md` | This guide. |

---

## Approved layout

Canvas **1080×1350**, all content inside a 10% title-safe inset.

| Element | Position (x, y) | Size | Type |
|---|---|---|---|
| Logo | 420, 100 | 240 × 70 | — |
| Speaker window | 108, 200 | 864 × 486 (16:9) | 20px corner radius |
| Speaker name | centred | band 864 × 100 @ y706 | Sofia Pro Medium 42px, bold |
| Title & company | centred | (same band) | Sofia Pro Medium 38px |
| Caption line 1–2 | centred | band 864 × 170 @ y826 | Sofia Pro Medium 58px |
| Session title | centred | band 864 × 90 @ y1016 | Sofia Pro Medium 40px |

**Guides (non-rendering):**
- Title-safe — 108px sides, 90px top/bottom
- LinkedIn control-safe — bottom bar y1240–1350, top-right icon x984–1080 / y0–64

Type sizes were set against a phone-width legibility check rather than by eye on
a desktop monitor. At a ~240px LinkedIn feed render, captions land at ≈12.9px
effective and the role line at ≈8.4px — the smallest thing in the frame. **Keep
role lines to roughly 30 characters** so they stay on one line.

---

## Step 1 — Build the comp

1. Open After Effects.
2. **File → Scripts → Run Script File…** and choose `build-template.jsx`.
3. The script creates `IterableWebinar_4x5_MASTER` with every layer positioned,
   labelled, and matted, and the guide layers already flagged non-rendering.

**If the text comes out in the wrong face:** AE matches fonts by PostScript
name, not the name in the font menu. Open **File → Scripts → Open Script
Editor**, run:

```javascript
alert(app.fonts.allFontFamilies.join("\n"));
```

Find the Sofia Pro entry, put that exact string into `CFG.font` at the top of
`build-template.jsx`, and re-run. The script warns you on completion if the font
didn't resolve, so you won't ship a fallback face by accident.

Everything else is tunable from the same `CFG` block — geometry, colours, frame
rate, label colours. Change a number, re-run, and you get a clean rebuild.

## Step 2 — Set the frame rate to match your source

The script defaults to **29.97fps**. Check what your webinar recordings actually
are (Zoom and StreamYard often deliver 25 or 30) and either change `CFG.fps`
before running, or fix it afterwards in **Composition → Composition Settings**.
Mismatched frame rates are the usual cause of stuttery motion on export.

## Step 3 — Drop in the real brand assets

- **Logo** — select `LOGO — replace source`, then **Layer → Replace Source** (or
  drag your logo file onto the layer with <kbd>Alt</kbd> held). Scale to fit the
  240×70 box; don't exceed it, or it collides with the top control-safe corner.
- **Background plate** — `BACKGROUND — plate` is a flat solid. Swap it for a
  branded gradient or artwork, or just change its colour. It's the only layer
  allowed outside the title-safe box.
- **Caption chip** — currently black at 55% opacity. This was my default guess;
  adjust or delete it once you've checked it against Iterable's caption styling.

## Step 4 — Expose the Essential Graphics controls

This is what makes the `.mogrt` useful in Premiere. Open **Window → Essential
Graphics**, set *Master* to your comp, then drag these into the panel:

| Drag this | From |
|---|---|
| Source Text of `SPEAKER — name` | Timeline, twirl down Text → Source Text |
| Source Text of `SPEAKER — title & company` | same |
| Source Text of `CAPTION — line 1` | same |
| Source Text of `CAPTION — line 2` | same |
| Source Text of `TITLE — session name` | same |
| `SPEAKER FOOTAGE — replace source` layer | drag the whole layer in as Media Replacement |
| `LOGO — replace source` layer | same |

Rename each control in the panel to something an editor reads without context —
"Speaker name", "Speaker title & company", "Caption line 1", and so on. Group
them with the panel's group headers if you want the captions visually separated
from the speaker fields.

## Step 5 — Export the `.mogrt`

**File → Export → Motion Graphics Template…**

- Destination: **Local Templates Folder** (it then appears automatically in
  Premiere's Essential Graphics panel), or a shared drive folder if the team
  works off shared storage.
- Name it something versioned: `Iterable_Webinar_4x5_v1.mogrt`.
- Tick **Include fonts** if the licence permits it — otherwise every editor needs
  Sofia Pro installed locally or Premiere silently substitutes.

Save the `.aep` alongside it. The `.aep` is the master you edit when the design
changes; the `.mogrt` is the disposable output you regenerate afterwards.

---

## Using it in Premiere, per episode

### Speaker footage

1. New sequence at **1080×1350**, frame rate matching the source.
2. Drag the `.mogrt` from Essential Graphics onto V2.
3. Put the raw webinar recording on V1.
4. In Effect Controls, scale and reposition the V1 clip until the speaker sits
   nicely inside the rounded window. The `.mogrt`'s matte crops it — you can pan
   across a slide, punch into a face, whatever the moment needs, without leaving
   Premiere.
5. Fill in the Essential Graphics text fields for name, title, and session.

### Captions — pick one of two paths

These are genuinely different workflows and it's worth knowing which one you're
in, because Premiere's auto-captions **do not** flow into the `.mogrt` text
fields.

**Path A — Premiere Speech-to-Text (recommended for full-length talking clips)**

1. **Window → Text → Transcript → Transcribe**, then **Create Captions**.
2. Premiere puts captions on their own caption track, styled independently of
   the template.
3. Style them to match: select the caption track, and in the Essential Graphics
   *Edit* tab set the font to **Sofia Pro Medium**, size to **58px**, alignment
   centre, and position the block over the template's caption band (y826–996).
4. **Save that as a Caption Style preset** — you only do this once, and every
   future episode gets the look in one click.
5. Turn OFF the `.mogrt`'s two caption text layers so they don't double up.

**Path B — the `.mogrt` caption fields (best for pull-quote / hero clips)**

Type the two lines directly into the Essential Graphics fields. Better control,
better typography, but manual. Use this when the clip is a short quote rather
than a continuous transcript.

### Before you export

Toggle the guide layers on for a moment and confirm nothing important sits under
the bottom control-safe strip or the top-right icon corner. The guides never
render, so leaving them on costs nothing.

---

## Open items

- **Caption chip styling** — the 55% black chip is a placeholder. Check it
  against Iterable's caption/brand guidance and adjust.
- **LinkedIn control-safe measurements** — these are based on typical native
  player chrome. Worth posting one test clip and screenshotting it on a phone to
  confirm the bottom 110px is right before the template goes wide.
- **Type hierarchy** — name (42px) and role (38px) are close in size; the
  separation is doing its work through weight and colour. If it reads flat once
  real content is in, raise the name to 48px rather than shrinking the role back
  down, which would cost phone legibility.
