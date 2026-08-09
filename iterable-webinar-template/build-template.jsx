/**
 * Iterable Webinar 4x5 Template — After Effects builder
 * ------------------------------------------------------
 * Builds the approved 1080x1350 layout as a fully organised comp:
 * background plate, logo placeholder, 16:9 rounded speaker window with
 * track matte, speaker ID band, two caption lines, session title band,
 * and non-rendering guide layers for title-safe + LinkedIn control-safe.
 *
 * HOW TO RUN
 *   After Effects > File > Scripts > Run Script File... > pick this file.
 *   (No need to create a comp first — the script makes one.)
 *
 * IF THE FONT IS WRONG
 *   AE matches fonts by PostScript name, not menu name. If the text comes
 *   out in a fallback face, run this in File > Scripts > Open Script Editor:
 *       alert(app.fonts.allFontFamilies.join("\n"));
 *   find the Sofia Pro entry, and set FONT below to its PostScript name.
 *
 * All geometry lives in CFG. Change numbers there, re-run, done.
 */

(function buildIterableWebinarTemplate() {

    // ---------------------------------------------------------------
    // CONFIG — every approved value from the layout spec lives here
    // ---------------------------------------------------------------
    var CFG = {
        compName: "IterableWebinar_4x5_MASTER",
        width:    1080,
        height:   1350,
        fps:      29.97,   // match your webinar source before building
        duration: 30,      // seconds; placeholder length, trim in Premiere

        // PostScript names. See "IF THE FONT IS WRONG" above.
        // fontBold is used for the speaker name only — it is the one element
        // the approved design sets heavier than the rest. If Bold is not
        // installed the name falls back to Medium and the hierarchy still
        // reads through colour and size.
        font:     "SofiaPro-Medium",
        fontBold: "SofiaPro-Bold",
        fontFallback: "Helvetica",

        // Title-safe: standard 10% inset
        safe: { x: 108, y: 90, w: 864, h: 1170 },

        // LinkedIn native player chrome — keep meaningful content out
        controlBottom: { x: 0,   y: 1240, w: 1080, h: 110 },
        controlCorner: { x: 984, y: 0,    w: 96,   h: 64  },

        // Instagram. A 4:5 video posted to IG becomes a Reel and is letterboxed
        // into a 1080x1920 player (285px bars top and bottom), so these are the
        // Reels UI zones mapped back onto our 1080x1350 frame.
        igReelsRail:   { x: 960, y: 815,  w: 120,  h: 500 },  // right action rail
        igReelsBottom: { x: 0,   y: 1315, w: 1080, h: 35  },  // caption/audio strip
        igGridCrop:    { x: 34,  y: 0,    w: 1012, h: 1350 }, // 3:4 profile thumbnail

        logo:    { x: 420, y: 100, w: 240, h: 70  },

        // Video window stays 864 wide — footage sitting under a UI button is fine.
        speaker: { x: 108, y: 200, w: 864, h: 486, radius: 20 },

        // Text bands pull in to 840 so they clear Instagram's right-hand rail.
        idBand:  { x: 120, y: 706, w: 840, h: 100 },
        caption: { x: 120, y: 826, w: 840, h: 170 },
        title:   { x: 120, y: 1016, w: 840, h: 90 },

        type: {
            name:    { size: 42, baseline: 744, color: [1.00, 1.00, 1.00] },
            role:    { size: 38, baseline: 788, color: [0.76, 0.77, 0.86] },
            capLine1:{ size: 58, baseline: 891, color: [1.00, 1.00, 1.00] },
            capLine2:{ size: 58, baseline: 958, color: [1.00, 1.00, 1.00] },
            title:   { size: 40, baseline: 1075, color: [0.91, 0.90, 0.96] }
        },

        color: {
            bgPlate:    [0.082, 0.086, 0.102],
            logoPlate:  [0.227, 0.208, 0.314],
            footage:    [0.180, 0.192, 0.239],
            captionChip:[0.000, 0.000, 0.000],
            guideSafe:  [1.000, 0.365, 0.635],
            guideCtrl:  [1.000, 0.690, 0.125],
            guideIG:    [0.400, 0.800, 1.000]
        },

        captionChipOpacity: 55,  // percent
        // Layer label colours (AE label index) to keep the timeline readable
        label: { bg: 8, logo: 6, footage: 9, matte: 11, id: 4, caption: 2, title: 5, guide: 1 }
    };

    // ---------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------

    // Convert a top-left box into the centre point AE positions layers by.
    function centreOf(box) {
        return [box.x + box.w / 2, box.y + box.h / 2];
    }

    function makeRoundedRect(comp, name, box, radius, fillColor, opts) {
        opts = opts || {};
        var layer = comp.layers.addShape();
        layer.name = name;

        var group = layer.property("ADBE Root Vectors Group")
                         .addProperty("ADBE Vector Group");
        var contents = group.property("ADBE Vectors Group");

        var rect = contents.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([box.w, box.h]);
        rect.property("ADBE Vector Rect Position").setValue([0, 0]);
        rect.property("ADBE Vector Rect Roundness").setValue(radius || 0);

        if (opts.stroke) {
            var stroke = contents.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue(fillColor);
            stroke.property("ADBE Vector Stroke Width").setValue(opts.strokeWidth || 2);
        } else {
            var fill = contents.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(fillColor);
        }

        layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]);
        layer.property("ADBE Transform Group").property("ADBE Position").setValue(centreOf(box));
        return layer;
    }

    function makeText(comp, name, content, spec, font) {
        var layer = comp.layers.addText(content);
        layer.name = name;

        var textProp = layer.property("ADBE Text Properties")
                            .property("ADBE Text Document");
        var doc = textProp.value;
        doc.resetCharStyle();
        doc.fontSize      = spec.size;
        doc.fillColor     = spec.color;
        doc.applyFill     = true;
        doc.applyStroke   = false;
        doc.font          = font;
        doc.justification = ParagraphJustification.CENTER_JUSTIFY;
        textProp.setValue(doc);

        // Centre-justified point text: x is the centre, y is the baseline.
        layer.property("ADBE Transform Group")
             .property("ADBE Position")
             .setValue([CFG.width / 2, spec.baseline]);
        return layer;
    }

    function makeGuideBox(comp, name, box, color) {
        var layer = makeRoundedRect(comp, name, box, 0, color, {
            stroke: true, strokeWidth: 3
        });
        layer.guideLayer = true;          // never renders, never exports
        layer.label = CFG.label.guide;
        layer.shy = true;
        return layer;
    }

    // Verify a PostScript name actually resolves rather than silently
    // substituting. Returns the name on success, null so the caller can warn.
    function resolveFont(psName) {
        var probe = null;
        try {
            var testComp = app.project.items.addComp("__fontprobe", 100, 100, 1, 1, 25);
            var t = testComp.layers.addText("x");
            var p = t.property("ADBE Text Properties").property("ADBE Text Document");
            var d = p.value;
            d.font = psName;
            p.setValue(d);
            probe = p.value.font;
            testComp.remove();
        } catch (e) {
            probe = null;
        }
        if (probe && probe === psName) return psName;
        return null;
    }

    // ---------------------------------------------------------------
    // Build
    // ---------------------------------------------------------------

    if (!app.project) app.newProject();

    app.beginUndoGroup("Build Iterable Webinar 4x5 Template");

    try {
        var resolved = resolveFont(CFG.font);
        var font = resolved || CFG.fontFallback;

        // Speaker name runs heavier than everything else, per the approved
        // design. Falls back to the body weight rather than to Helvetica.
        var resolvedBold = resolveFont(CFG.fontBold);
        var fontBold = resolvedBold || font;

        var comp = app.project.items.addComp(
            CFG.compName, CFG.width, CFG.height, 1.0, CFG.duration, CFG.fps
        );
        comp.openInViewer();

        // --- Guides (added first so they end up at the top of the stack) ---
        makeGuideBox(comp, "GUIDE — IG profile grid crop (3:4)",
                     CFG.igGridCrop, CFG.color.guideIG);
        makeGuideBox(comp, "GUIDE — IG Reels caption strip",
                     CFG.igReelsBottom, CFG.color.guideIG);
        makeGuideBox(comp, "GUIDE — IG Reels action rail",
                     CFG.igReelsRail, CFG.color.guideIG);
        makeGuideBox(comp, "GUIDE — LinkedIn control-safe (top-right icon)",
                     CFG.controlCorner, CFG.color.guideCtrl);
        makeGuideBox(comp, "GUIDE — LinkedIn control-safe (bottom bar)",
                     CFG.controlBottom, CFG.color.guideCtrl);
        makeGuideBox(comp, "GUIDE — Title safe",
                     CFG.safe, CFG.color.guideSafe);

        // --- Session title ---
        var titleLayer = makeText(comp, "TITLE — session name",
                                  "Scaling Lifecycle Messaging \u2014 Ep. 4",
                                  CFG.type.title, font);
        titleLayer.label = CFG.label.title;

        // --- Captions (two independent lines for Essential Graphics) ---
        var cap2 = makeText(comp, "CAPTION — line 2",
                            "rolling this out were wild.", CFG.type.capLine2, font);
        cap2.label = CFG.label.caption;

        var cap1 = makeText(comp, "CAPTION — line 1",
                            "\u201Cthe results we saw after", CFG.type.capLine1, font);
        cap1.label = CFG.label.caption;

        var chip = makeRoundedRect(comp, "CAPTION — background chip",
                                   CFG.caption, 8, CFG.color.captionChip);
        chip.property("ADBE Transform Group")
            .property("ADBE Opacity")
            .setValue(CFG.captionChipOpacity);
        chip.label = CFG.label.caption;

        // --- Speaker ID ---
        var role = makeText(comp, "SPEAKER — title & company",
                            "VP Lifecycle Marketing, Iterable", CFG.type.role, font);
        role.label = CFG.label.id;

        var speakerName = makeText(comp, "SPEAKER — name",
                                   "Jamie Alvarez", CFG.type.name, fontBold);
        speakerName.label = CFG.label.id;

        // --- Speaker window: rounded rect matte over a footage placeholder ---
        var matte = makeRoundedRect(comp, "SPEAKER WINDOW — matte (16:9, r20)",
                                    CFG.speaker, CFG.speaker.radius, [1, 1, 1]);
        matte.label = CFG.label.matte;

        var footage = comp.layers.addSolid(
            CFG.color.footage, "SPEAKER FOOTAGE — replace source",
            CFG.speaker.w, CFG.speaker.h, 1.0
        );
        footage.property("ADBE Transform Group")
               .property("ADBE Position")
               .setValue(centreOf(CFG.speaker));
        footage.label = CFG.label.footage;

        // Alpha matte from the layer directly above. AE 24+ prefers
        // setTrackMatte(); older builds use the legacy enum property.
        try {
            footage.setTrackMatte(matte, TrackMatteType.ALPHA);
        } catch (e) {
            footage.trackMatteType = TrackMatteType.ALPHA;
        }

        // --- Logo placeholder ---
        var logo = makeRoundedRect(comp, "LOGO — replace source",
                                   CFG.logo, 4, CFG.color.logoPlate);
        logo.label = CFG.label.logo;

        // --- Background plate (bottom of the stack) ---
        var bg = comp.layers.addSolid(
            CFG.color.bgPlate, "BACKGROUND — plate",
            CFG.width, CFG.height, 1.0
        );
        bg.label = CFG.label.bg;

        // --- Wrap up ---
        app.project.items.addFolder("Iterable Webinar Template");

        var msg = "Template built: " + CFG.compName + "\n\n";
        if (!resolved) {
            msg += "\u26A0  Sofia Pro Medium did not resolve under the PostScript\n"
                 + "name \"" + CFG.font + "\", so text was set in "
                 + CFG.fontFallback + ".\n"
                 + "Fix: run  alert(app.fonts.allFontFamilies.join(\"\\n\"))  in the\n"
                 + "Script Editor, find the Sofia Pro entry, update CFG.font,\n"
                 + "and re-run this script.\n\n";
        }
        if (!resolvedBold) {
            msg += "\u26A0  \"" + CFG.fontBold + "\" did not resolve, so the speaker\n"
                 + "name uses the body weight. The design intends it heavier —\n"
                 + "install Sofia Pro Bold or update CFG.fontBold.\n\n";
        }
        msg += "Next: add the Essential Graphics controls, then export the\n"
             + ".mogrt. See README.md step 4 onward.";
        alert(msg);

    } catch (err) {
        alert("Build failed on line " + err.line + ":\n" + err.toString());
    } finally {
        app.endUndoGroup();
    }

})();
