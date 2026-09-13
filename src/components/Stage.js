// Stage.js -- renders the word itself.
//
// Every editable letter is draggable/clickable, but only the
// currently-active one (state.activeLetterIndex) gets the blinking
// cursor pre-Done -- others stay neutral until selected. After Done,
// EVERY editable letter shows its own "yours" ghost, since scoring
// covers all of them, not just whichever was last active.
//
// Font size comes from the single WORD_FONT_SIZE_PX constant in
// lib/fonts.js -- the same one all drag/nudge/scoring math uses --
// so the visual size and the interaction math can never drift apart.
// Padding and cursor dimensions scale proportionally from that one
// number too, relative to the original 74px baseline they were
// tuned at.

import { unitsToPixels, WORD_FONT_SIZE_PX } from '../lib/fonts.js';
import { computeLetterOffsets } from '../lib/layout.js';

const BASELINE_PX = 74; // the size padding was originally tuned for
const SCALE = WORD_FONT_SIZE_PX / BASELINE_PX;

const PAD_TOP = Math.round(36 * SCALE);
const PAD_BOTTOM = Math.round(46 * SCALE);
const MIN_HEIGHT = Math.round(130 * SCALE);

// The cursor is a short baseline tick, not a cap-height bar -- kerning
// only ever moves a letter horizontally, so a mark implying vertical
// extent (like our old nearly-full-height version) was misleading.
// Sized as a fraction of the font size directly, not scaled from the
// old (wrong) proportions.
const CURSOR_LEFT = Math.round(WORD_FONT_SIZE_PX * 0.09); // generous enough to clear round letters' left curve
const CURSOR_TOP_INSET = Math.round(WORD_FONT_SIZE_PX * 0.62); // starts well below cap-height
const CURSOR_BOTTOM_INSET = Math.round(WORD_FONT_SIZE_PX * 0.08); // small gap below baseline
const CURSOR_WIDTH = Math.max(2, Math.round(WORD_FONT_SIZE_PX * 0.015));

export function Stage(state) {
  const { currentWord, done, activeLetterIndex } = state;
  if (!currentWord) return '<div></div>';

  const { letters, pairs } = currentWord;
  const liveOffsets = computeLetterOffsets(currentWord);
  const solvedOffsets = computeLetterOffsets(currentWord, { useTarget: true });
  const frontOffsets = done ? solvedOffsets : liveOffsets;

  const letterSpans = letters
    .map((char, index) => {
      const pairHere = pairs.find((p) => p.letterIndex === index);
      const isEditable = pairHere && pairHere.editable;
      const frontOffsetPx = unitsToPixels(frontOffsets[index]);

      if (!isEditable) {
        return `<span style="position:relative; z-index:2; display:inline-block; transform:translateX(${frontOffsetPx}px);">${char}</span>`;
      }

      const isActive = !done && index === activeLetterIndex;
      const frontColor = 'var(--color-text)';

      const yoursGhost = done
        ? `<span style="position:absolute; left:0; bottom:0; color:var(--color-accent); opacity:0.55; transform:translateX(${unitsToPixels(liveOffsets[index])}px); display:inline-block; z-index:1; pointer-events:none;">${char}</span>`
        : '';

      const cursor = isActive
        ? `<span style="position:absolute; left:-${CURSOR_LEFT}px; top:${CURSOR_TOP_INSET}px; bottom:${CURSOR_BOTTOM_INSET}px; width:${CURSOR_WIDTH}px; background:var(--color-accent); animation:blinkCursor 1s step-start infinite; pointer-events:none; z-index:3;"></span>`
        : '';

      return `
        <span style="position:relative; display:inline-block;">
          ${cursor}
          <span
            data-letter="true"
            data-letter-index="${index}"
            style="
              cursor: ${done ? 'default' : 'grab'};
              color: ${frontColor};
              position: relative;
              z-index: 2;
              transform: translateX(${frontOffsetPx}px);
              display: inline-block;
              touch-action: none;
            "
          >${char}</span>
          ${yoursGhost}
        </span>
      `;
    })
    .join('');

  return `
    <div style="padding:${PAD_TOP}px 16px ${PAD_BOTTOM}px; text-align:center; min-height:${MIN_HEIGHT}px; position:relative; display:flex; align-items:center; justify-content:center;">
      <div style="font-family:var(--font-serif); font-size:${WORD_FONT_SIZE_PX}px; font-weight:600; color:var(--color-text); line-height:1; position:relative; display:inline-flex; font-kerning:none; font-feature-settings:'kern' 0, 'liga' 0;">
        ${letterSpans}
      </div>
    </div>
    <style>
      @keyframes blinkCursor { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
    </style>
  `;
}