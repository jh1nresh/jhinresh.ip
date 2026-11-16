# JhiNResH personal website

English personal homepage for Jerry Chen. The accepted narrow notebook layout remains: 766px white page, dotted side margins, original sticker banner and portrait, DM Sans and Instrument Serif, compact project rows and dashed section bands.

## Local preview

```sh
python3 -m http.server 4186 --bind 127.0.0.1
node --check script.js
node --check assets/earth.js
node --check assets/wish.js
python3 scripts/validate.py
```

Stack and the short introduction are sourced from the authenticated user’s public profile README. The pinned source and extracted tool groups are in assets/data/profile.json. The greeting uses the visitor’s local hour. Three projects, accurate status limitations, TestFlight, twelve public recognition records and the original licensed inline workbench remain.

## Books and motion

Three English books are presented through a focused bookshelf island. Buffett’s Essays uses the eighth edition; game theory uses The Art of Strategy by Dixit and Nalebuff. Cover/edition provenance is in assets/books/SOURCES.md. Spines are interface typography, not publisher scans.

Build the isolated bookshelf with `npm run typecheck` and `node build-bookshelf.mjs` under site-components. Only assets/bookshelf is loaded; the former 23-demo gallery bundle, its section and demo/search routes are absent from the live page. Preserved historical files are not linked.

GitHub retains only the dated contribution calendar; no Insights charts, visitor analytics, Bookmarks or Certificates section. The latest footer is a green Earth with no buildings or trees. It starts automatically when visible, with only the green globe. The person, satellite and separate animation button are removed; clicking the illustration or using Enter/Space pauses/resumes the globe. Offscreen/background/reduced-motion handling remains in place. The globe retains its responsive aspect ratio on desktop and phones. Make a wish runs a short, non-looping meteor effect; it is optional and respects reduced motion. Stack includes an icon for every entry, and About/margins contain restrained decorative artwork and handwritten notes. The latest Work changes remove Maiat + Dojo, use the confirmed Savvy domain, and add hover/focus previews from actual website screenshots. Side notes are anchored to the document rather than the viewport. There are no provider calls, telemetry or external runtime font/media requests.

GitHub Pages publishes the static artifact to https://jhinresh.com after a reviewed merge to main. Run `python3 scripts/build-site.py` in a fresh checkout and `python3 scripts/validate.py _site` to verify the exact deployable file set. Only referenced runtime assets and attribution are packaged; build tooling and cancelled demos are excluded. The original dirty checkout is preserved.
