# jhinresh.ip

A cinematic, static portfolio built from Jerry Chen's verified product work and a
six-part, video-led editorial layout.

The page is intentionally not a repository dump. Projects are selected when their local source provides a coherent product statement plus inspectable implementation, public source, live proof, or a technical primitive worth evaluating.

## Included work

### Flagship systems

- SAV-E — private place memory for iOS
- Maiat + Dojo — reputation clearing for agent work
- SLL-R — merchant-backed order execution for AI agents
- Match Receipt Engine — proof-gated deterministic settlement

### Product and protocol experiments

- Oshiami
- Cloak
- Jiagon
- Gimi
- Pincher
- flops
- ClearTrade Agent

### Research

- Hedge / AMM risk infrastructure, clearly labeled as research rather than a shipped product

See [`docs/portfolio-scope.md`](./docs/portfolio-scope.md) for the selection rule, information architecture, acceptance criteria, and safety receipt.

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Verification

```bash
node --check script.js
python3 scripts/validate.py
```

Then inspect desktop and mobile widths in a browser and check the browser console.

## Deployment

This is plain HTML, CSS, and JavaScript. It can be deployed to Vercel, GitHub Pages,
Netlify, or any static host without a build step. Cinematic backgrounds load from the
supplied CloudFront and Mux URLs, with hls.js loaded from a pinned jsDelivr URL; the
content remains readable if those media resources are unavailable.

The supplied CloudFront and Mux media are third-party dependencies. Confirm reuse
rights or replace/self-host them before treating a public deployment as durable.

No analytics, backend, form submission, authentication, or private phone number is included.
