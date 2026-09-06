// ScorePanel.js -- bottom bar: score + share (dimmed until Done),
// and the single button that reads "done" then flips to "next".

export function ScorePanel(state) {
  const { done, score } = state;
  const groupOpacity = done ? '1' : '0.35';
  const groupPointer = done ? 'auto' : 'none';

  return `
    <div style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; border-top:0.5px solid var(--color-border);">
      <div style="display:flex; align-items:center; gap:10px; opacity:${groupOpacity}; pointer-events:${groupPointer};">
        <div style="color:var(--color-text-faint); font-size:12px;">
          <span style="color:var(--color-text); font-size:15px; font-weight:700;">${done ? score : 0}</span><span style="color:var(--color-text-faint);">/100</span>
        </div>
        <button
          data-action="share"
          style="font-family:var(--font-ui); font-size:11px; padding:5px 10px; border-radius:var(--radius-sm); border:0.5px solid var(--color-border); background:transparent; color:var(--color-text-faint); cursor:pointer;"
        >share</button>
      </div>
      <button
        data-action="${done ? 'next' : 'done'}"
        style="font-family:var(--font-ui); font-size:12px; padding:6px 14px; border-radius:var(--radius-sm); border:0.5px solid var(--color-accent); background:var(--color-bg); color:var(--color-accent); cursor:pointer; font-weight:500;"
      >${done ? 'next →' : 'done'}</button>
    </div>
  `;
}
