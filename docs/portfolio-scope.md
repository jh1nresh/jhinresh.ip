# Jerry Chen Portfolio — PM Gate

## Goal

Turn the existing static portfolio into a cinematic, dark, one-page portfolio that represents the strongest locally verified work without presenting every repository as equally mature.

## Audience

- Smart-contract security and protocol engineering hiring teams
- Crypto/AI infrastructure founders and ecosystem partners
- Early product collaborators who need evidence of founder-engineer range

## Customer-paid job

In under two minutes, help a technical reviewer answer:

1. What kind of systems does Jerry build?
2. Which projects are real, live, or inspectable?
3. What is his distinctive technical judgment?
4. Where can I inspect source, demos, or contact him?

## Selection rule

A project enters the public portfolio only when its local repo provides at least two of:

- a coherent product statement;
- current implementation evidence;
- a public source repository;
- a live demo or captured UI;
- a testable technical primitive;
- an award, integration, or receipt that can be inspected.

Repositories that are forks, learning exercises, dormant duplicates, infrastructure siblings with no separate public story, or private operating memory stay out of the main portfolio.

## Public project set

### Flagship systems

- SAV-E — private place memory for iOS
- Maiat + Dojo — reputation clearing and agent work infrastructure
- SLL-R — merchant-backed order execution for AI agents
- R8 — branch-level cross-strait food evidence and discovery

### Product and protocol experiments

- Oshiami — prerequisite-based learning studios
- Gimi — community inventory rental agent
- Jiagon — receipt-backed local reviews
- Cloak — AI dressing room and fashion agent
- Pincher — Telegram-first event carpool matcher
- flops — redeemable AI infrastructure capacity credits
- ClearTrade Agent — receipt-first paper trading agent

### Research direction

- Hedge / AMM risk infrastructure — explicitly labeled as current research, not a shipped product.

## Information architecture

1. Full-screen video identity hero
2. Centered operating-belief tagline
3. Split selected-work feature with five project tabs
4. HLS-backed awards and recognition
5. Full-screen video contact CTA
6. Three-column footer

## Visual direction

The site follows the supplied Velorah prompt's visual system while keeping Jerry's
verified identity, work, and links:

- pure-black cinematic surface with full-bleed video scenes;
- Instrument Serif display typography and Inter body typography;
- white, gray, and near-black palette;
- selective liquid-glass navigation and calls to action;
- generous vertical rhythm, centered statements, and a two-column feature split;
- restrained fade-rise motion and a complete reduced-motion fallback.

## Acceptance criteria

- Desktop and mobile layouts are usable and visually coherent.
- Navigation anchors work and header state responds to scroll.
- Project tabs update the featured content, progress, and destination and support keyboard navigation.
- MP4 backgrounds and the HLS statement stream degrade to readable black sections when media is unavailable.
- Every public link is sourced from a verified local README or git remote.
- No private phone number, secrets, analytics, or unverifiable metrics appear.
- `node --check script.js` passes.
- Local browser QA produces no console errors.
- Primary interactions and all media paths are verified.

## Security scan receipt

`N/A` for scanner execution: this is a static HTML/CSS/JS portfolio with no
authentication, payments, backend, user data storage, or form submission. It loads
display fonts from Google Fonts, three decorative MP4 files from the supplied
CloudFront URLs, one Mux HLS stream, and a pinned hls.js browser build from jsDelivr.
Media failure leaves the copy and calls to action readable. Manual safety requirements:
no secrets/private phone number, links use `rel="noreferrer"` where appropriate, and
no form data or first-party analytics are collected. Browser requests to the font,
media, and script providers expose normal network metadata such as IP address and
user-agent. Confirm media reuse rights or replace/self-host the supplied assets before
treating a public deployment as durable.

## Demand / distribution / paywall

- Demand proof: the user explicitly requested a portfolio covering worthwhile local work.
- Distribution format: one shareable personal URL plus GitHub source; future screenshots can be used in X/job applications.
- Pricing/paywall: `N/A`; this is a public credibility surface, not a paid product.
