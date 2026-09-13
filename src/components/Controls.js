// Controls.js -- nudge buttons (act on whichever gap is active) + the
// clickable pair-list, one row per editable pair. Target values stay
// masked ("···") until Done.
//
// UI chrome sizing bumped up to match the now-much-larger word -- see
// TopBar.js's note. First pass, tune by eye.

import { unitsToPixels } from '../lib/fonts.js';

function formatSignedPx(units) {
  const px = Math.round(unitsToPixels(units));
  const sign = px >= 0 ? '+' : '-';
  return sign + String(Math.abs(px)).padStart(2, '0');
}

export function Controls(state) {
  const { currentWord, done, activeLetterIndex } = state;
  if (!currentWord) return '<div></div>';

  const editablePairs = currentWord.pairs.filter((p) => p.editable);

  const rows = editablePairs
    .map((pair) => {
      const isActive = pair.letterIndex === activeLetterIndex;
      const rowColor = isActive || done ? 'var(--color-text)' : 'var(--color-text-faint)';
      const marker = isActive ? '›' : '&nbsp;';

      const targetDisplay = done
        ? `<span style="color:var(--color-accent);">${formatSignedPx(pair.target)}</span>`
        : `<span style="color:var(--color-text-faint);">···</span>`;

      return `
        <div
          data-action="select-gap"
          data-letter-index="${pair.letterIndex}"
          style="color:${rowColor}; display:flex; gap:8px; cursor:pointer;"
        >
          <span style="color:var(--color-accent);">${marker}</span>
          <span style="flex:1;">
            ${pair.leftChar}·${pair.rightChar}
            &nbsp;offset
            <span style="display:inline-block; min-width:42px; text-align:left; color:var(--color-warn);">${formatSignedPx(pair.offset)}</span>
            <span style="color:var(--color-text-faint);"> · target </span>
            <span style="display:inline-block; min-width:42px; text-align:left;">${targetDisplay}</span>
          </span>
        </div>
      `;
    })
    .join('');

  return `
    <div style="padding:0 28px 28px; display:flex; flex-direction:column; align-items:center; gap:16px;">
      <div style="display:flex; align-items:center; gap:4px;">
        <button
          data-action="nudge"
          data-dir="-1"
          ${done ? 'disabled' : ''}
          style="font-family:var(--font-ui); font-size:40px; width:56px; height:56px; border:none; background:transparent; color:var(--color-accent); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;"
        >‹</button>
        <button
          data-action="nudge"
          data-dir="1"
          ${done ? 'disabled' : ''}
          style="font-family:var(--font-ui); font-size:40px; width:56px; height:56px; border:none; background:transparent; color:var(--color-accent); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;"
        >›</button>
      </div>
      <div style="width:360px; margin:0 auto; display:flex; flex-direction:column; gap:6px; font-size:16px;">
        ${rows}
      </div>
    </div>
  `;
}