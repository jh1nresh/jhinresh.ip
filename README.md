# jhinresh.ip

A cinematic, static portfolio built from Jerry Chen's verified local product work.

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

This is plain HTML, CSS, and JavaScript. It can be deployed to Vercel, GitHub Pages, Netlify, or any static host without a build step.

No analytics, backend, form submission, authentication, or private phone number is included.
