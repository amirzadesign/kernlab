// Stage.js -- renders the word itself.
//
// Every editable letter is draggable/clickable, but only the
// currently-active one (state.activeLetterIndex) gets the green
// highlight + blinking cursor pre-Done -- others stay neutral until
// selected. After Done, EVERY editable letter shows its own "yours"
// ghost, since scoring covers all of them, not just whichever was
// last active.

import { unitsToPixels } from '../lib/fonts.js';
import { computeLetterOffsets } from '../lib/layout.js';

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
      // Color no longer changes for the active letter -- that was
      // distorting how the whole word reads while judging it. The
      // cursor below is now the only "this is selected" indicator.
      const frontColor = 'var(--color-text)';

      const yoursGhost = done
        ? `<span style="position:absolute; left:0; bottom:0; color:var(--color-accent); opacity:0.55; transform:translateX(${unitsToPixels(liveOffsets[index])}px); display:inline-block; z-index:1; pointer-events:none;">${char}</span>`
        : '';

      const cursor = isActive
        ? `<span style="position:absolute; left:-3px; top:4px; bottom:10px; width:2px; background:var(--color-accent); animation:blinkCursor 1s step-start infinite; pointer-events:none;"></span>`
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
    <div style="padding:36px 16px 46px; text-align:center; min-height:130px; position:relative;">
      <div style="font-family:var(--font-serif); font-size:74px; font-weight:600; color:var(--color-text); line-height:1; position:relative; display:inline-flex; font-kerning:none; font-feature-settings:'kern' 0, 'liga' 0;">
        ${letterSpans}
      </div>
    </div>
    <style>
      @keyframes blinkCursor { 0%,50% { opacity:1; } 51%,100% { opacity:0; } }
    </style>
  `;
}
