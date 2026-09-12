# KernLab — Project Status

Last updated: this session. Upload this whole zip (or just this file) to a
new conversation to resume work with full context.

**Overall state: core game complete, all 5 design decisions built, end-to-end
browser testing done. The `extract-kerning.js` placeholder has now been
replaced with a REAL fontkit-based script (done this session) — see
"Extending the word pool" below. Word pool expanded from 15 to 31 words
(tier 4: 9, tier 5: 12, tier 6: 10).**

## What KernLab is

A kerning-training game inspired by KernType (type.method.ac, by Method
Inc.). Vanilla JS + Vite, terminal-themed UI, built to eventually migrate
to Svelte once advanced features land. Designer/builder is Amir
(designer, design educator, not a coder — needs step-by-step guidance for
any command-line or Git actions).

## Tech stack & infrastructure

- **Vite** (vanilla JS, no framework yet) — chosen so migration to
  Svelte later is smooth (same tooling).
- **GitHub repo**: `amirzadesign/kernlab` — connected and working.
- **Netlify**: connected, auto-deploys on every `git push` to `main`.
  Currently **private** (password-gated) on purpose — flip to public
  once the game is ready to share. Live URL: `kernlab.netlify.app`.
- **Fonts**: Source Serif 4 + Source Sans 3 (game words), JetBrains
  Mono (all UI chrome). All open-source, cloned from the official
  Adobe/JetBrains GitHub repos (not Google Fonts CDN, which wasn't
  reachable from the build sandbox — same repos work fine for the
  real Netlify build though, or just use Google Fonts CDN links,
  which is what `index.html`/component styles currently do via
  `@import` in base.css).
- **Kerning extraction**: uses `fontkit` (NOT `opentype.js` — see
  "Key technical gotchas" below for why).

## IMPORTANT: local vs. pushed state

As of this file being written, **several rounds of work exist only on
Amir's local machine** — they have NOT been `git push`-ed yet. If
resuming from this file in a new session, the first thing to check is
whether Amir has pushed since. Don't assume GitHub/Netlify reflect the
latest code.

## Design decisions locked in (do not re-litigate without reason)

- **Palette**: terminal dark theme. White (`--color-text`) = the
  correct/solution position. Green (`--color-accent`, `#7ee787`) =
  the player's own attempt/interaction. NO blue anywhere (deliberately
  dropped from an earlier KernType-inspired blue/white scheme —
  Amir wanted a tighter two-color system).
- **Fonts**: JetBrains Mono for all UI (buttons, labels, popups).
  Source Serif 4 / Source Sans 3 for the actual game word display.
- **Logo**: `KernLab-Logo-green.svg` — provided by Amir, recolored to
  `#7ee787`.
- **Interaction model**: direct-drag the letter (works on both mouse
  and touch) + `‹ ›` nudge buttons for ±1px precision, on both
  desktop and mobile. NO slider (explicitly rejected — see
  conversation history for reasoning: sliders don't work well at
  small mobile widths, drag+nudge unifies desktop/mobile into one
  interaction model, and it mirrors real Illustrator/InDesign kerning
  workflows).
- **Difficulty tiers**: 4/5/6-letter words = number of *editable*
  kerning gaps generally increases too (tier 4 = 1 gap, tier 5 = 2
  gaps, tier 6 = 3 gaps in the words built so far).
- **Fixed vs. editable pairs**: every letter pair in a word has real
  kerning data. Only designated "editable" pairs are the actual
  puzzle — they start at a randomized offset (never exactly correct,
  see gotcha below) and the player must find the right spot. ALL
  OTHER pairs are baked in at their real correct value from the
  start and are never interactive. This mirrors how real kerning
  works (most pairs in a word are already fine; only a few need
  attention) and is core to the whole game's premise — do not
  simplify this away.
- **Multi-gap UI**: clicking a letter OR its row in the pair-list
  below the word selects it as the "active" gap. Nudge buttons act on
  whichever gap is active. After clicking Done, EVERY editable pair
  reveals its own comparison (ghost overlay), not just the
  last-active one.
- **Visual feedback while playing**: the active gap gets ONLY a
  blinking cursor indicator — NOT a color change. (Amir found the
  green-letter-while-active distorted his ability to judge the whole
  word's spacing before committing — this was deliberately removed.)
- **Target values are masked** (`···`) until Done — showing them
  earlier, even at low opacity, defeats the game (the exact digits
  were still legible through the fade in an earlier version — this
  was a real bug, now fixed by replacing the content entirely, not
  just dimming it).
- **Score**: 0-100 per word, based on average pixel-equivalent error
  across all editable pairs. Streak increments on scores ≥90,
  persisted via `localStorage` (`kernlab_streak` key).
- **No leaderboard in v1.0** — explicitly cut. May revisit later as
  Phase 3 alongside a real backend, but no UI or nav for it exists
  and none should be added without Amir explicitly re-requesting it.
- **About page voice**: hybrid tone — casual/personal-blog voice
  (first-person, dry humor, lowercase-optional) for the intro and
  bio sections, but a more measured/clear educational tone for the
  "why some pairs are harder" section (uses a joke pivot header —
  "On a serious note: why some pairs are harder" — to transition
  between the two voices without being jarring). **IMPLEMENTED** in
  `src/about.js` (2026-09-12): intro, education section with 5 real
  example pairs (V·o −71, T·y −40, T·o −70, o·o 0, H·i 0) rendered
  with their actual kern applied at 64px, "how the words work"
  section, KernType/Method Inc. + font credits, and Amir's bio chip
  ("Designer / Design Educator", initial "a" avatar, no photo, no
  portfolio link). The ☰ in TopBar.js now links to /about.html;
  About page has a "← back to game" link. Copy was written fresh
  from the spec above (the original conversation's exact copy was
  not available in the resuming session) — Amir may want to tweak
  wording.
- **Attribution**: About page must credit KernType/Method Inc.
  explicitly, plus a short designer bio: "Amir — Designer / Design
  Educator." No photo. No portfolio link yet (Amir wasn't sure —
  trivial one-line addition whenever he decides).

## Key technical gotchas (do not re-discover these the hard way)

1. **`opentype.js`'s `getKerningValue()` does NOT support modern
   "Extension Positioning" GPOS lookups**, which is how Source
   Serif 4 / Source Sans 3 (and probably most modern professionally-
   built fonts) actually store their kerning. It silently returns 0
   for every pair instead of erroring loudly — very easy to miss.
   **Fix**: use `fontkit` instead, and extract kerning by actually
   *shaping* text (`font.layout(pair)`) and comparing total advance
   width against the two letters shaped independently. This works
   correctly regardless of which GPOS lookup format the font uses,
   since it goes through the font's real layout engine rather than
   trying to manually parse the pair-positioning table.
   Reference: `fontkit`'s `.layout(text).positions[].xAdvance`.

2. **Browsers auto-apply a font's real kerning by default.** If you
   render text normally, `offset: 0` will ALREADY be correctly
   kerned by the browser — meaning there's no puzzle left to solve!
   **Fix**: `font-kerning: none; font-feature-settings: 'kern' 0,
   'liga' 0;` on the word's container. This must stay in place — do
   not "clean up" this CSS thinking it's redundant.

3. **CSS `transform` does not affect document flow.** Since letters
   are individually positioned `<span>`s (not real flowing text),
   moving one letter via `translateX` does NOT automatically shift
   the letters after it — you must manually compute a **cumulative
   offset** (running sum of every pair's offset from the start of
   the word) and apply that full cumulative value to every letter,
   not just its own immediate pair's offset. This logic lives in
   `src/lib/layout.js` (`computeLetterOffsets`). Don't try to
   simplify this back to "just apply each pair's own offset" — that
   was an actual bug caught mid-project.

4. **Kerning values live in font design units** (e.g. `-40`, `-119`
   for these fonts — NOT small numbers like pixels). Both fonts here
   have `unitsPerEm: 1000`. Conversion to real screen pixels is
   `units * (fontSizePx / unitsPerEm)`, centralized in
   `src/lib/fonts.js` (`unitsToPixels` / `pixelsToUnits`). All
   internal state (offsets, targets, drag deltas) is stored in
   units; conversion to pixels happens only at render/display time.
   This also means the drag/nudge range and scoring penalty are
   tuned in real, meaningful terms (not arbitrary numbers) — see
   `OFFSET_MIN/MAX` and `NUDGE_STEP_UNITS` in `actions.js`, and
   `PENALTS_PER_PIXEL` in `lib/scoring.js`.

5. **Editable pairs must never start exactly at their target.** Some
   real pairs have a target of `0` (e.g. "Hill"'s H·i, "Noon"'s o·o)
   — if the player's starting offset were also `0`, the round would
   be auto-solved with zero interaction. `randomStartOffset()` in
   `actions.js` guarantees a minimum distance (40-80 units, roughly
   3-6px) away from the target in a random direction, every round.

6. **Font files**: Google Fonts' actual font files aren't reachable
   from this build sandbox's network allowlist (no
   `fonts.google.com` or `fonts.gstatic.com`). Adobe and JetBrains
   both publish their fonts as open-source GitHub repos though
   (`adobe-fonts/source-serif`, `adobe-fonts/source-sans`,
   `JetBrains/JetBrainsMono`), which IS reachable via `git clone`.
   Used those directly for kerning extraction. The live site itself
   just uses Google Fonts' CDN `@import` for actual web delivery,
   which is a different (allowed, normal) code path than the
   sandbox's font-parsing step.

## Current file structure & what's real vs. stub

```
kernlab/
├── index.html, about.html       — real, working entry points
├── package.json, vite.config.js, netlify.toml, .gitignore  — real
├── src/
│   ├── main.js                  — real, wires everything together
│   ├── about.js                 — real (full About page content, built 2026-09-12)
│   ├── store.js                 — real (tier, currentWord, activeLetterIndex, done, score, streak)
│   ├── actions.js                — real (all game logic: initRound, selectGap,
│   │                                nudgeActiveGap, setGapOffset, commitDone, nextRound)
│   ├── data/
│   │   └── words.json           — real. Tier 4: 9 words. Tier 5: 12 words.
│   │                               Tier 6: 10 words. All kerning values are
│   │                               REAL, extracted from actual Source Serif 4.
│   ├── lib/
│   │   ├── dom.js                — real (tiny qs() helper)
│   │   ├── env.js                — real (isTouchDevice(), not yet used anywhere)
│   │   ├── rng.js                — real (pickRandom, not seeded)
│   │   ├── fonts.js              — real (unitsToPixels/pixelsToUnits, the
│   │   │                            UNITS_PER_EM=1000 / WORD_FONT_SIZE_PX=74 constants)
│   │   ├── layout.js             — real (computeLetterOffsets, live vs. solved modes)
│   │   ├── scoring.js            — real (scoreForGap, scoreForWord)
│   │   ├── words.js              — real (getWordsForTier, pickWordForTier)
│   │   └── events.js             — real (all click/drag delegation)
│   ├── components/
│   │   ├── TopBar.js             — real (logo, tier buttons, streak)
│   │   ├── Stage.js              — real (word rendering, drag targets, ghosts)
│   │   ├── Controls.js           — real (nudge buttons, multi-gap pair list)
│   │   ├── ScorePanel.js         — real (score, share button [placeholder], done/next)
│   │   ├── Letter.js             — STUB, unused (letter rendering ended up
│   │   │                            living inline in Stage.js instead)
│   │   ├── LetterPair.js         — STUB, unused (same reason)
│   │   ├── Breakdown.js          — STUB, unused (the per-gap breakdown IS
│   │   │                            implemented, but inline in Controls.js's
│   │   │                            pair-list rows rather than a separate component)
│   │   └── Summary.js            — STUB, unused (planned for a future
│   │                                multi-round session summary screen)
│   └── styles/
│       ├── tokens.css            — real (all CSS custom properties: colors, fonts, spacing)
│       ├── base.css              — real (font imports, reset, .app layout)
│       └── components.css        — empty stub (all component styles are
│                                    currently inline in each component's
│                                    template string, not yet extracted here)
└── scripts/
    └── extract-kerning.js        — STUB — the actual extraction was done
                                     ad-hoc in throwaway scripts during this
                                     session (extract_word_pairs.js etc.,
                                     not part of the repo), using `fontkit`.
                                     This file should eventually contain that
                                     real logic as a proper, re-runnable
                                     build step, but doesn't yet.
```

## What's fully working right now

- Tiers 4/5/6, all with real per-pair kerning data from actual font files
- Drag (mouse + touch) and nudge-button interaction
- Multi-gap selection (click a letter or its pair-list row to make it active)
- Correct cumulative positioning (fixing one gap properly carries through
  to every letter after it)
- Masked target reveal on Done, with per-gap "yours vs. solution" ghost
  comparison
- Scoring + streak, persisted across page reloads
- Random per-round starting offset (never trivially pre-solved)

## What's NOT built yet (in rough priority order)

1. **Push today's local changes to GitHub** — check this first in any
   new session; Amir may not have run `git add / commit / push` yet.
2. **About page** — DONE (2026-09-12, see "Design decisions" above).
   Remaining: Amir to review/tweak copy wording, and confirm it looks
   right in a real browser (was built without a sandbox build available).
3. **Share functionality** — `ScorePanel.js`'s "share" button
   currently just does `console.log`. The full design exists
   (Download PNG / Copy Image / native Share, via a terminal-styled
   `\`-prefixed popup menu) but none of the actual image generation
   or clipboard/share-API code has been written.
4. **Onboarding tooltips** — a full first-run sequence was designed
   (drag hint → nudge hint → Done hint → post-reveal share hint,
   each with dot progress + skip), but not implemented in code at
   all yet.
5. **More word variety** — tiers 5/6 have only 3 words each; could
   use more for replay variety, same process as tier 4 (pick
   candidate words, run through the fontkit extraction script,
   verify real values before adding).
6. **`scripts/extract-kerning.js`** should eventually contain the
   real, re-runnable fontkit-based extraction logic (currently only
   exists as throwaway scripts from this session), so adding new
   words doesn't require reconstructing the extraction process from
   scratch each time.
7. **Netlify visibility** — currently private/password-gated on
   purpose. Flip to public when Amir decides the game is ready.
8. **Multi-word share card / results screen, leaderboard-adjacent
   features** — all explicitly deferred to a hypothetical Phase 2/3,
   not current priorities.

## Working style notes for whoever picks this up

- Amir is a designer, not a coder. Explain terminal/Git commands
  step by step, confirm what appeared on screen before proceeding.
- He has explicitly asked to **minimize the number of files rewritten
  per round** and to **verify things (build, test logic) before
  handing over code**, rather than iterating via full project
  zip re-deliveries each time. Prefer: verify in a sandbox build,
  then give exact file contents (or precise diffs) to paste
  directly into VS Code.
- He reviews actual visual/interactive behavior carefully and catches
  real bugs by playing the game (e.g. the browser-auto-kerning issue,
  the cumulative-offset issue, the masked-target-still-legible issue,
  the distracting-green-letter issue) — take his bug reports
  seriously and dig for root causes rather than surface patches.
