# AGENTS.md - Jerry Portfolio

Repo rails for coding agents working in this project.

## Scope

This is a static personal portfolio. Keep it lightweight and directly deployable
to Vercel, GitHub Pages, Netlify, or any static host.

## Before Editing

- Read the target file and the relevant consumer. Read `README.md` for project
  context, `styles.css` for layout/styling, and `script.js` for behavior only when
  they can affect the requested edit; do not require all four for a text fix.
- Preserve the current one-page narrative: founder-engineer, verifiable agents,
  crypto rails, receipts, reputation, and proof-driven shipping.
- Do not expose private phone numbers or sensitive personal data unless the user
  explicitly asks for that exact change.

## Verification

For changes affecting visible layout or browser interaction:

```bash
python3 -m http.server 4173
```

Then inspect desktop and mobile widths in a browser.

For a copy-only edit, verify the exact wording, links and diff; inspect rendering
if wrapping or layout may change. For JavaScript syntax checks:

```bash
node --check script.js
```

## Boundaries

- Do not publish, deploy, or connect analytics without explicit approval.
- Do not invent GitHub, LinkedIn, employer, award, or project URLs.
- Do not replace the generated visual asset with stock imagery.
