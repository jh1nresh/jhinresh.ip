# JhiNResH / Jerry Chen

A personal website presented as a six-chapter illustrated field book. The user’s
Every Joule reference guides the reading experience, with Colorfigures/Anatomy
objects, colored bookmarks, warm paper and a cloth binding. All personal/project
content is static HTML; no accounts, forms, analytics or payment actions exist.

Chapters: Hello → Savvy → OUTPUT → EZNest → Agents → Footnotes/contact.
Savvy’s TestFlight status, OUTPUT’s devnet/no-production limits and EZNest’s
workflow-preview/synthetic-shape limits remain visible with their illustrations.
The withdrawn desktop-pet article and SLL-R are excluded.

## Run locally

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/`.

## Build and verify

```bash
node scripts/build-cabinet.mjs
node scripts/build-savvy.mjs
node --check script.js
node --check cabinet.js
node --check workflows.js
node scripts/test-runtime.mjs
node scripts/test-workflows.mjs
python3 scripts/validate.py
```

Both builders update standalone SVG, a part inventory and inline SVG in the page.
The cabinet has 70 solids; the synthetic Savvy station has 48. They combine Anatomy
rounded slabs with Colorfigures projection/drawing helpers, without mounting a
library over the host page. Both MIT notices are embedded and in `LICENSES.txt`.
Archivo is local with its SIL Open Font License; serif headings use system fonts.

## Reading and animation

Without JavaScript, all six chapters and native anchors remain readable. With
JavaScript, chapter links, previous/next and history reveal the appropriate spread.
The cabinet’s four drawers select a project and update its reading link. Savvy’s
link card moves to review, then a synthetic Map Stamp appears. Both diagrams are
user-operated, stop at rest/offscreen/hidden, and jump for reduced motion.

OUTPUT and EZNest use static project diagrams extracted from the user-provided
artwork. No GIF, video player or animated media asset is included. Savvy’s
separate SVG workflow remains user-operated; its real public interface is
available in an expandable preview.

Runtime checks use deterministic DOM/frame adapters; inspect desktop/mobile,
all chapters, keyboard navigation, static project images and no-JavaScript fallback in a
real browser too. Local proof does not establish physical-device/Safari acceptance.

GitHub Pages packages the actual HTML/CSS/JS, font, portrait, media and licenses.
Current delivery is local preview plus PR; merge/deployment are separate actions.
