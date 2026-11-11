# JhiNResH / Jerry Chen

A scrolling personal site. The page is a dark control room: a near-black field,
a faint blueprint grid, and one cyan instrument light. Jerry’s portrait is a
high-contrast plate, and the projects read as systems with status lines taken
from the real copy. Primary actions are machined-metal buttons. All personal
and project content is static HTML; no accounts, forms, analytics, or payment
actions exist.

Savvy’s TestFlight status, OUTPUT’s devnet and no-production limits, and
EZNest’s workflow-preview and synthetic-shape limits stay visible. The
withdrawn desktop-pet article and SLL-R stay excluded.

The opening pairs Jerry’s portrait and a short first-person introduction with
two inherited recognition highlights. Maiat and Dojo repeat their own results
and link to the full record of 12 awards, grants, and cohort entries. Blog
stays blank until the owner chooses post URLs.

## Run locally

```bash
python3 -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/`.

## Verify

```bash
node --check script.js
node scripts/test-site.mjs
python3 scripts/validate.py
```

The field-book reader is gone: no page curl, folio fit, cabinet clock, or
chapter pager. `page-curl.js`, `fit-reader.js`, `cabinet.js`, and `workflows.js`
and their tests were removed with that reader. Grid parallax and the cursor
light pause for `prefers-reduced-motion`, and a Pause motion control can stop
or resume them. On a narrow screen the section links sit behind a Menu button.

Archivo and its OFL notice stay local. GitHub Pages packages the HTML, CSS,
script, font, portrait, project images, and licenses.
