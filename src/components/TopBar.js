// TopBar.js -- logo, tier selector, streak. Pure render: takes state,
// returns an HTML string. Click handling lives in lib/events.js.

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
            font-size: 12px;
            width: 30px;
            height: 26px;
            border-radius: var(--radius-sm);
            border: 0.5px solid ${active ? 'var(--color-accent)' : 'var(--color-border)'};
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
      <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:0.5px solid var(--color-border);">
        <span style="color:var(--color-accent); font-size:14px; font-weight:700; letter-spacing:1px;">KERNLAB</span>
        <span style="color:var(--color-accent); font-size:18px;">☰</span>
      </div>
      <div style="display:flex; gap:6px; padding:10px 16px; border-bottom:0.5px solid var(--color-border); align-items:center;">
        ${tierButtons}
        <div style="margin-left:auto; color:var(--color-text-faint); font-size:12px; display:flex; align-items:center; gap:5px;">
          <span style="color:var(--color-danger);">●</span>${state.streak}
        </div>
      </div>
    </div>
  `;
}
