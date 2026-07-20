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
- Match Receipt Engine — proof-gated deterministic settlement

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

1. Full-screen identity hero
2. Verifiable proof strip
3. Featured project stories
4. Filterable project index
5. Current research thesis
6. Working principles and technical stack
7. Contact

## Visual direction

Original design inspired by the reference video's vocabulary, not a clone:

- near-black cinematic surface;
- acid-lime signal color with restrained ember accent;
- oversized condensed typography;
- faint grid/noise and mouse spotlight;
- project imagery used as evidence, not decoration;
- dense editorial labels and generous section scale;
- card tilt, reveal, filter, and reduced-motion fallbacks.

## Acceptance criteria

- Desktop and mobile layouts are usable and visually coherent.
- Navigation anchors work and header state responds to scroll.
- Project filters work with keyboard-accessible buttons.
- Every public link is sourced from a verified local README or git remote.
- Maturity labels distinguish live, shipped, prototype, and research work.
- No private phone number, secrets, analytics, or unverifiable metrics appear.
- `node --check script.js` passes.
- Local browser QA produces no console errors.
- Primary interactions and all image paths are verified.

## Security scan receipt

`N/A` for scanner execution: this is a static HTML/CSS/JS portfolio with no authentication, payments, backend, user data storage, third-party scripts, or form submission. Manual safety requirements: no secrets/private phone number, links use `rel="noreferrer"` where appropriate, and external pages are never embedded.

## Demand / distribution / paywall

- Demand proof: the user explicitly requested a portfolio covering worthwhile local work.
- Distribution format: one shareable personal URL plus GitHub source; future screenshots can be used in X/job applications.
- Pricing/paywall: `N/A`; this is a public credibility surface, not a paid product.
