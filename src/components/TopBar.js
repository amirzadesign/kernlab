// TopBar.js -- logo, tier selector, streak. Pure render: takes state,
// returns an HTML string. Click handling lives in lib/events.js.
//
// UI chrome sizing bumped up to match the now-much-larger word (see
// WORD_FONT_SIZE_PX in lib/fonts.js) -- first pass, tune by eye.

import { logoMark } from '../lib/logo.js';

export function TopBar(state) {
  const tiers = [4, 5, 6];

  const tierButtons = tiers
    .map((t) => {
      const active = t === state.tier;
      return `
        <button
          class="tier-btn"
          data-action="set-tier"
          data-tier="${t}"
          style="
            font-family: var(--font-ui);
            font-size: 16px;
            width: 44px;
            height: 38px;
            border-radius: var(--radius-sm);
            border: 1px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'};
            background: transparent;
            color: ${active ? 'var(--color-accent)' : 'var(--color-text-faint)'};
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          "
        >${t}</button>
      `;
    })
    .join('');

  return `
    <div>
      <div style="display:flex; align-items:center; justify-content:space-between; padding:20px 28px; border-bottom:0.5px solid var(--color-border);">
        <span aria-label="KernLab">${logoMark(72)}</span>
        <a href="/about.html" title="About" style="color:var(--color-accent); font-size:28px; text-decoration:none; line-height:1;">☰</a>
      </div>
      <div style="display:flex; gap:10px; padding:16px 28px; border-bottom:0.5px solid var(--color-border); align-items:center;">
        ${tierButtons}
        <div style="margin-left:auto; color:var(--color-text-faint); font-size:16px; display:flex; align-items:center; gap:7px;">
          <span style="color:var(--color-danger); font-size:14px;">●</span>${state.streak}
        </div>
      </div>
    </div>
  `;
}