# JhiNResH Portfolio — Product Gate

## Goal

Create an editorial, proof-led portfolio that establishes JhiNResH as a founder-engineer and gives long-form writing a permanent home beside the work.

## Audience

- Product and engineering teams evaluating founder-engineer range
- AI and crypto founders looking for a hands-on collaborator
- Technical reviewers who care about system boundaries, failure recovery, and inspectable proof

## Two-minute test

A new visitor should be able to answer:

1. What kind of systems does JhiNResH build?
2. Which three projects best demonstrate that judgment?
3. Where can they inspect the work or read the thinking behind it?
4. How can they make contact?

## Product boundary

The public page includes a full-viewport identity hero using JhiNResH's own photograph, three case studies, Substack and selected writing, four recognition entries, and direct contact links.

The page does not include a CV, LinkedIn, exhaustive repository list, fake metrics, pricing, client services, third-party decorative media, analytics, authentication, or form submission.

## Selection rule

A featured project must communicate:

- the system and audience;
- the consequential product or engineering decision;
- the proof path a visitor can inspect.

## Information architecture

1. Full-viewport editorial photo hero
2. Operating belief
3. Three sticky, proof-led case studies
4. Writing and Substack destination
5. Condensed public recognition
6. Direct contact footer

## Visual direction

- Black and cream editorial base with one signal-orange accent
- Oversized moving identity type behind a centered portrait layer
- Local imagery only; the hero uses the supplied personal photograph
- One expressive gesture per section, restrained reveal motion, and a complete reduced-motion fallback
- No card grid, decorative gradients, purple palette, or generic dashboard styling

## Acceptance criteria

- Desktop and mobile layouts are usable and visually coherent.
- The hero remains a single full-viewport composition.
- Mobile navigation opens, closes, locks scroll, and returns focus.
- All local media paths resolve and all external links use `rel="noreferrer"`.
- CV and LinkedIn do not appear in rendered copy or navigation.
- `node --check script.js` and `python3 scripts/validate.py` pass.
- Browser QA shows no console errors at desktop and mobile widths.
- Reduced-motion mode removes nonessential animation.

## Safety receipt

`N/A` for an application security scanner: the project is static HTML, CSS, and JavaScript with no backend or user input. Manual gates are no secrets or private phone number, no third-party executable scripts, descriptive or intentionally empty image alt text, safe external-link attributes, and repository-local media.
