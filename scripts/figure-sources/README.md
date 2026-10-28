# Native project scenes

`output.js` and `nesting.js` preserve the pure geometry/model portions of the
user's EZNest landing figures (source: `eznest-landing/figures/src`, 27 Oct 2026).
The upstream DOM shell, manual controls, timers and animation drivers are removed.
The nesting source includes its original fourteen synthetic parts and layout data.
No live job, printer hand-off, approval, signature or payment is performed.

`drawing.js` vendors the Colorfigures drawing primitives (April Zhu / Tolga Cohce,
MIT); the matching notice is embedded in the generated bundle and fallback SVGs.
Its decimal coordinate formatter tolerates sub-nanopixel half-tenth drift so ARM
and x64 builds agree. Labels use a fixed scale inside a responsive SVG.

`agent.js` is an original 47-solid mechanical approval/receipt illustration.
The three-sheet quote travels on a continuous bed. The ram is attached to a
cantilever supported by a beam and two columns. The rubber face descends to the
card's z11.2 top and retracts before the receipt moves into its tray. All mounting
screws and guide screws sit on their supporting surfaces.

Build with `node scripts/build-project-scenes.mjs`. The generated classic script
sets `window.bookScenes` descriptors; it contains no DOM mutations, timers or
animation loops. The host owns visibility, playback, reduced motion and rendering.
Each scene plays forward, holds, then smoothly rewinds as an explicitly labelled
illustration reset. Its end pose matches the next loop's start pose.
