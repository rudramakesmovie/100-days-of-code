/**
 * Iterable Webinar Template Kit — Figma plugin
 * --------------------------------------------
 * Builds the webinar template as a native Figma file: real frames, editable
 * text, reusable components, colour + text styles, and locked guide overlays
 * per platform.
 *
 * INSTALL
 *   Figma > Plugins > Development > Import plugin from manifest...
 *   and pick the manifest.json sitting next to this file.
 *
 * RUN
 *   Plugins > Development > Iterable Webinar Template Kit
 *
 * Geometry below mirrors ../layout.json and CFG in ../../build-template.jsx.
 * Change one, change all three — there is no build step wiring them together.
 */

// ---------------------------------------------------------------------------
// Layout — canonical values, see ../layout.json
// ---------------------------------------------------------------------------

const LAYOUT = {
  palette: {
    bgPlate:      { r: 0.082, g: 0.086, b: 0.102 },
    logoPlate:    { r: 0.227, g: 0.208, b: 0.314 },
    footage:      { r: 0.180, g: 0.192, b: 0.239 },
    captionChip:  { r: 0.000, g: 0.000, b: 0.000 },
    textPrimary:  { r: 1.000, g: 1.000, b: 1.000 },
    textSecondary:{ r: 0.760, g: 0.770, b: 0.860 },
    textTitle:    { r: 0.910, g: 0.900, b: 0.960 },
    guideSafe:    { r: 1.000, g: 0.365, b: 0.635 },
    guideLinkedIn:{ r: 1.000, g: 0.690, b: 0.125 },
    guideInstagram:{ r: 0.400, g: 0.800, b: 1.000 }
  },

  captionChipOpacity: 0.55,

  type: {
    family: 'Sofia Pro',
    body:   'Medium',
    name:   'Bold',
    sizes:  { name: 42, role: 38, caption: 58, title: 40 }
  },

  copy: {
    name:     'Jamie Alvarez',
    role:     'VP Lifecycle Marketing, Iterable',
    caption1: '“the results we saw after',
    caption2: 'rolling this out were wild.”',
    title:    'Scaling Lifecycle Messaging — Ep. 4'
  },

  frames: {
    fourFive: {
      label: 'Webinar 4:5 — 1080×1350 — APPROVED',
      w: 1080, h: 1350,
      el: {
        logo:    { x: 420, y: 100,  w: 240, h: 70 },
        speaker: { x: 108, y: 200,  w: 864, h: 486, radius: 20 },
        idBand:  { x: 120, y: 706,  w: 840, h: 100 },
        caption: { x: 120, y: 826,  w: 840, h: 170, radius: 8 },
        title:   { x: 120, y: 1016, w: 840, h: 90 }
      },
      baselines: { name: 744, role: 788, caption1: 891, caption2: 958, title: 1075 },
      guides: [
        { name: 'Title safe',                 x: 108, y: 90,   w: 864,  h: 1170, platform: 'shared'    },
        { name: 'LinkedIn — bottom bar',       x: 0,   y: 1240, w: 1080, h: 110,  platform: 'linkedin'  },
        { name: 'LinkedIn — top-right icon',   x: 984, y: 0,    w: 96,   h: 64,   platform: 'linkedin'  },
        { name: 'IG Reels — action rail',      x: 960, y: 815,  w: 120,  h: 500,  platform: 'instagram' },
        { name: 'IG Reels — caption strip',    x: 0,   y: 1315, w: 1080, h: 35,   platform: 'instagram' },
        { name: 'IG — profile grid crop',      x: 34,  y: 0,    w: 1012, h: 1350, platform: 'instagram' }
      ]
    },

    nineSixteen: {
      label: 'Webinar 9:16 — DERIVED, not yet designed',
      w: 1080, h: 1920,
      el: {
        logo:    { x: 420, y: 390,  w: 240, h: 70 },
        speaker: { x: 108, y: 550,  w: 864, h: 486, radius: 20 },
        idBand:  { x: 120, y: 1090, w: 840, h: 100 },
        caption: { x: 120, y: 1210, w: 840, h: 170, radius: 8 },
        title:   { x: 120, y: 1410, w: 840, h: 90 }
      },
      baselines: { name: 1128, role: 1172, caption1: 1275, caption2: 1342, title: 1469 },
      guides: [
        { name: 'IG Reels — top',           x: 0,   y: 0,    w: 1080, h: 108,  platform: 'instagram' },
        { name: 'IG Reels — bottom UI',     x: 0,   y: 1600, w: 1080, h: 320,  platform: 'instagram' },
        { name: 'IG Reels — action rail',   x: 960, y: 1100, w: 120,  h: 500,  platform: 'instagram' },
        { name: 'IG Reels — left margin',   x: 0,   y: 0,    w: 60,   h: 1920, platform: 'instagram' }
      ]
    }
  }
};

const FRAME_GAP = 200;

// ---------------------------------------------------------------------------
// Font loading. The API requires a font to be loaded before .characters,
// .fontSize or .fontName can be set, so this has to resolve before any text
// work happens. If Sofia Pro is missing we fall back loudly rather than
// silently shipping the wrong face — the AE script behaves the same way.
// ---------------------------------------------------------------------------

const fonts = { body: null, name: null, warnings: [] };

async function tryFont(family, style) {
  try {
    await figma.loadFontAsync({ family, style });
    return { family, style };
  } catch (e) {
    return null;
  }
}

async function resolveFonts() {
  const fam = LAYOUT.type.family;

  fonts.body = await tryFont(fam, LAYOUT.type.body);
  if (!fonts.body) {
    fonts.body = await tryFont('Inter', 'Medium') || await tryFont('Inter', 'Regular');
    fonts.warnings.push(
      fam + ' ' + LAYOUT.type.body + ' is not available — used ' +
      fonts.body.family + ' ' + fonts.body.style + ' instead.'
    );
  }

  // Bold is used for the speaker name only. Falling back to the body weight
  // is acceptable: colour and size still carry the hierarchy.
  fonts.name = await tryFont(fam, LAYOUT.type.name);
  if (!fonts.name) {
    fonts.name = fonts.body;
    if (fonts.body.family === fam) {
      fonts.warnings.push(
        fam + ' ' + LAYOUT.type.name + ' is not available — the speaker name ' +
        'falls back to ' + LAYOUT.type.body + '.'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Style helpers
// ---------------------------------------------------------------------------

const solid = (rgb, opacity) => [{
  type: 'SOLID',
  color: { r: rgb.r, g: rgb.g, b: rgb.b },
  opacity: opacity === undefined ? 1 : opacity
}];

function createStyles() {
  const made = { paints: {}, texts: {} };

  // Generic names so re-pointing these at a real Iterable library is a
  // re-map rather than a rebuild.
  const paints = [
    ['surface',           LAYOUT.palette.bgPlate],
    ['surface/raised',    LAYOUT.palette.footage],
    ['surface/logo-slot', LAYOUT.palette.logoPlate],
    ['on-surface',        LAYOUT.palette.textPrimary],
    ['on-surface/muted',  LAYOUT.palette.textSecondary],
    ['on-surface/title',  LAYOUT.palette.textTitle],
    ['guide/shared',      LAYOUT.palette.guideSafe],
    ['guide/linkedin',    LAYOUT.palette.guideLinkedIn],
    ['guide/instagram',   LAYOUT.palette.guideInstagram]
  ];

  paints.forEach(function (entry) {
    const style = figma.createPaintStyle();
    style.name = 'Webinar/' + entry[0];
    style.paints = solid(entry[1]);
    made.paints[entry[0]] = style;
  });

  const texts = [
    ['speaker-name',  LAYOUT.type.sizes.name,    fonts.name],
    ['speaker-role',  LAYOUT.type.sizes.role,    fonts.body],
    ['caption',       LAYOUT.type.sizes.caption, fonts.body],
    ['session-title', LAYOUT.type.sizes.title,   fonts.body]
  ];

  texts.forEach(function (entry) {
    const style = figma.createTextStyle();
    style.name = 'Webinar/' + entry[0];
    style.fontSize = entry[1];
    style.fontName = entry[2];
    made.texts[entry[0]] = style;
  });

  return made;
}

// ---------------------------------------------------------------------------
// Node builders
// ---------------------------------------------------------------------------

function rect(name, box, fill, opacity) {
  const node = figma.createRectangle();
  node.name = name;
  node.x = box.x;
  node.y = box.y;
  node.resize(box.w, box.h);
  node.fills = solid(fill, opacity);
  if (box.radius) node.cornerRadius = box.radius;
  return node;
}

/**
 * Centre-aligned text positioned by baseline, matching how the AE script
 * places its point text. Figma positions by bounding box, so we offset by
 * roughly the ascender to land the baseline where we want it.
 */
function text(name, content, size, font, fill, frameWidth, baseline) {
  const node = figma.createText();
  node.name = name;
  node.fontName = font;
  node.fontSize = size;
  node.characters = content;
  node.textAlignHorizontal = 'CENTER';
  node.textAutoResize = 'HEIGHT';
  node.fills = solid(fill);
  node.resize(frameWidth, node.height);
  node.x = 0;
  node.y = baseline - size * 0.8;
  return node;
}

function guideFrame(name, guides, frameW, frameH, platformColor) {
  const group = figma.createFrame();
  group.name = name;
  group.x = 0;
  group.y = 0;
  group.resize(frameW, frameH);
  group.fills = [];
  group.clipsContent = false;

  guides.forEach(function (g) {
    const box = figma.createRectangle();
    box.name = g.name;
    box.x = g.x;
    box.y = g.y;
    box.resize(g.w, g.h);
    box.fills = [];
    box.strokes = solid(platformColor(g.platform));
    box.strokeWeight = 3;
    box.dashPattern = [12, 8];
    group.appendChild(box);
  });

  group.locked = true;
  group.visible = false;
  return group;
}

function buildFrame(spec, originX, styles) {
  const P = LAYOUT.palette;
  const T = LAYOUT.type.sizes;
  const C = LAYOUT.copy;

  const frame = figma.createFrame();
  frame.name = spec.label;
  frame.x = originX;
  frame.y = 0;
  frame.resize(spec.w, spec.h);
  frame.fills = solid(P.bgPlate);
  frame.clipsContent = true;

  // Logo slot
  const logo = figma.createFrame();
  logo.name = 'LOGO — replace source';
  logo.x = spec.el.logo.x;
  logo.y = spec.el.logo.y;
  logo.resize(spec.el.logo.w, spec.el.logo.h);
  logo.fills = solid(P.logoPlate);
  logo.cornerRadius = 4;
  frame.appendChild(logo);

  // Speaker window — drop an image fill straight onto this
  const speaker = rect('SPEAKER WINDOW — replace with footage', spec.el.speaker, P.footage);
  frame.appendChild(speaker);

  // Speaker ID
  const nameNode = text('SPEAKER — name', C.name, T.name, fonts.name,
                        P.textPrimary, spec.w, spec.baselines.name);
  frame.appendChild(nameNode);

  const roleNode = text('SPEAKER — title & company', C.role, T.role, fonts.body,
                        P.textSecondary, spec.w, spec.baselines.role);
  frame.appendChild(roleNode);

  // Captions
  const chip = rect('CAPTION — background chip', spec.el.caption,
                    P.captionChip, LAYOUT.captionChipOpacity);
  frame.appendChild(chip);

  frame.appendChild(text('CAPTION — line 1', C.caption1, T.caption, fonts.body,
                         P.textPrimary, spec.w, spec.baselines.caption1));
  frame.appendChild(text('CAPTION — line 2', C.caption2, T.caption, fonts.body,
                         P.textPrimary, spec.w, spec.baselines.caption2));

  // Session title
  frame.appendChild(text('TITLE — session name', C.title, T.title, fonts.body,
                         P.textTitle, spec.w, spec.baselines.title));

  // Guide overlays, split so each platform can be toggled on its own
  const colorFor = function (platform) {
    if (platform === 'linkedin')  return P.guideLinkedIn;
    if (platform === 'instagram') return P.guideInstagram;
    return P.guideSafe;
  };

  const byPlatform = {};
  spec.guides.forEach(function (g) {
    if (!byPlatform[g.platform]) byPlatform[g.platform] = [];
    byPlatform[g.platform].push(g);
  });

  Object.keys(byPlatform).forEach(function (platform) {
    frame.appendChild(
      guideFrame('GUIDES — ' + platform, byPlatform[platform], spec.w, spec.h, colorFor)
    );
  });

  return frame;
}

// ---------------------------------------------------------------------------
// Components — the reusable pieces, parked on their own row
// ---------------------------------------------------------------------------

function buildComponents(sourceFrame, originY) {
  const wanted = [
    'SPEAKER WINDOW — replace with footage',
    'CAPTION — background chip'
  ];

  const made = [];
  let cursorX = 0;

  wanted.forEach(function (layerName) {
    const source = sourceFrame.findOne(function (n) { return n.name === layerName; });
    if (!source) return;

    const component = figma.createComponent();
    component.name = layerName.split(' — ')[0];
    component.x = cursorX;
    component.y = originY;
    component.resize(source.width, source.height);
    component.fills = source.fills;
    if (source.cornerRadius) component.cornerRadius = source.cornerRadius;

    made.push(component);
    cursorX += source.width + 80;
  });

  return made;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await resolveFonts();

  const styles = createStyles();

  const fourFive = buildFrame(LAYOUT.frames.fourFive, 0, styles);
  const nineSixteen = buildFrame(
    LAYOUT.frames.nineSixteen,
    LAYOUT.frames.fourFive.w + FRAME_GAP,
    styles
  );

  const components = buildComponents(fourFive, LAYOUT.frames.nineSixteen.h + FRAME_GAP);

  const created = [fourFive, nineSixteen].concat(components);
  created.forEach(function (n) { figma.currentPage.appendChild(n); });

  figma.currentPage.selection = [fourFive];
  figma.viewport.scrollAndZoomIntoView(created);

  let message = 'Built 2 frames, ' + components.length + ' components, ' +
                '9 colour styles and 4 text styles.';
  if (fonts.warnings.length) {
    message = '⚠ ' + fonts.warnings.join(' ') + ' ' + message;
  }

  figma.notify(message, { timeout: fonts.warnings.length ? 12000 : 5000 });
  figma.closePlugin();
}

main().catch(function (err) {
  figma.notify('Build failed: ' + err.message, { error: true, timeout: 10000 });
  figma.closePlugin();
});
