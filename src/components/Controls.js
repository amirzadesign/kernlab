// Controls.js -- nudge buttons + the per-gap offset/target readout list.
//
// The target value is the actual answer, so before Done it's genuinely
// masked (not just dimmed) -- opacity alone still leaves the real
// digits legible, which defeated the point. Only the offset (the
// player's own live value) is shown pre-Done.

import { unitsToPixels } from '../lib/fonts.js';

function formatSignedPx(units) {
  const px = Math.round(unitsToPixels(units));
  const sign = px >= 0 ? '+' : '-';
  return sign + String(Math.abs(px)).padStart(2, '0');
}

export function Controls(state) {
  const { currentWord, done } = state;
  if (!currentWord) return '<div></div>';

  const editablePairs = currentWord.pairs.filter((p) => p.editable);
  const rows = editablePairs
    .map((gap) => {
      const targetDisplay = done
        ? `<span style="color:var(--color-accent);">${formatSignedPx(gap.target)}</span>`
        : `<span style="color:var(--color-text-faint);">···</span>`;

      return `
        <div style="color:var(--color-text); display:flex; gap:6px;">
          <span style="color:var(--color-accent);">›</span>
          <span style="flex:1;">
            ${gap.leftChar}·${gap.rightChar}
            &nbsp;offset
            <span style="display:inline-block; min-width:34px; text-align:left; color:var(--color-warn);">${formatSignedPx(gap.offset)}</span>
            <span style="color:var(--color-text-faint);"> · target </span>
            <span style="display:inline-block; min-width:34px; text-align:left;">${targetDisplay}</span>
          </span>
        </div>
      `;
    })
    .join('');

  return `
    <div style="padding:0 16px 18px; display:flex; flex-direction:column; align-items:center; gap:10px;">
      <div style="display:flex; align-items:center; gap:2px;">
        <button
          data-action="nudge"
          data-dir="-1"
          ${done ? 'disabled' : ''}
          style="font-family:var(--font-ui); font-size:28px; width:40px; height:40px; border:none; background:transparent; color:var(--color-accent); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;"
        >‹</button>
        <button
          data-action="nudge"
          data-dir="1"
          ${done ? 'disabled' : ''}
          style="font-family:var(--font-ui); font-size:28px; width:40px; height:40px; border:none; background:transparent; color:var(--color-accent); cursor:pointer; display:flex; align-items:center; justify-content:center; padding:0; line-height:1;"
        >›</button>
      </div>
      <div style="width:260px; margin:0 auto; display:flex; flex-direction:column; gap:3px; font-size:12px;">
        ${rows}
      </div>
    </div>
  `;
}
