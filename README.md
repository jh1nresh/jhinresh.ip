# jhinresh.ip

A static, proof-led portfolio for JhiNResH. The design combines an editorial full-viewport identity hero with three focused case studies, a writing destination, and a short recognition record.

The page is intentionally not a repository dump. Work is selected when it communicates a consequential decision and points to something public or inspectable.

## Included work

- SAV-E — private, evidence-backed place memory for iOS
- Maiat + Dojo — inspectable trust and execution infrastructure for agents
- SLL-R — repeatable reasoning for smart-contract review
- Writing — Substack long-form destination plus selected build notes

CV and LinkedIn are intentionally not included. Contact is limited to email, GitHub, X, and Substack.

See [`docs/portfolio-scope.md`](./docs/portfolio-scope.md) for the selection rule, information architecture, and acceptance criteria.

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

This is plain HTML, CSS, and JavaScript with no build step. GitHub Actions publishes the site to GitHub Pages from `main`.

All visible media is stored in this repository. No analytics, backend, form submission, authentication, CV, LinkedIn profile, or private phone number is included.
