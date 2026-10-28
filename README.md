# JhiNResH / Jerry Chen

A personal website presented as a six-chapter illustrated field book. The user’s
Every Joule reference guides the reading experience, with Colorfigures/Anatomy
objects, colored bookmarks, warm paper and a cloth binding. All personal/project
content is static HTML; no accounts, forms, analytics or payment actions exist.

Chapters: Hello → Savvy → OUTPUT → EZNest → Agents → About & awards/contact.
Savvy’s TestFlight status, OUTPUT’s devnet/no-production limits and EZNest’s
workflow-preview/synthetic-shape limits remain visible with their illustrations.
The withdrawn desktop-pet article and SLL-R are excluded.

The opening page pairs Jerry’s owned portrait and a short first-person introduction
with two inherited recognition highlights. Maiat/Dojo includes project-specific
recognition; the final chapter openly lists all12 inherited awards, grants and
cohort entries by year. Recognition links focus the full record heading.

## Run locally

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/`.

## Build and verify

```bash
node scripts/build-cabinet.mjs
node scripts/build-savvy.mjs
node scripts/build-project-scenes.mjs
node --check script.js
node --check page-curl.js
node --check cabinet.js
node --check workflows.js
node scripts/test-runtime.mjs
node scripts/test-page-curl.mjs
node scripts/test-workflows.mjs
python3 scripts/validate.py
```

The builders update standalone SVGs, inventories and inline fallbacks. The cabinet
has70 solids; Savvy has48; the new Maiat approval/receipt mechanism has47.
OUTPUT/EZNest reuse the pure scene models from the canonical EZNest landing.
Source provenance and MIT notices live in `scripts/figure-sources/README.md`,
`LICENSES.txt` and the generated bundle. Archivo/OFL stays local.

## Reading and animation

All six chapters share a fixed book frame and twelve consecutive folios.
A retained sheet has the old page on its front and the incoming page on its back;
the sheet bends across18 connected material strips, with the outer edge leading
the spine and a soft, flat landing. Its front/back crops keep the original page
layout and scroll gutters. The cover, page boxes and navigation keep their size.
Rapid input queues the latest destination; completion removes the overlay before
starting another turn. Chapter navigation does not scroll the desktop viewport.
Mobile alignment happens before a turn; contact can scroll to its explicit target.
History preserves the page's reading position. Without scripts all chapters and
native anchors remain readable.

The four Look Inside diagrams autoplay on chapter entry and loop while visible.
One host RAF clock renders only the active project at up to30fps. It pauses during
paper turns, when offscreen/hidden, and on the global Pause illustrations button.
Reduced-motion preferences default to meaningful stills and instant page changes;
readers can explicitly opt into diagram motion. No GIF/video player is involved.
The real Savvy/Maiat interfaces remain separately expandable. All diagrams are
illustrative: no real search, approval, printing, signature or payment occurs.

Runtime checks exercise actual reader and motion handlers with deterministic
DOM/frame/media-query/animation adapters. Browser verification must additionally
inspect the turning faces, frame geometry, scrolling and autonomous SVG states.
These checks do not establish physical-device/Safari acceptance.

GitHub Pages packages the actual HTML/CSS/JS, font, portrait, media and licenses.
Current delivery is local preview plus PR; merge/deployment are separate actions.
