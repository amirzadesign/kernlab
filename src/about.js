import './styles/base.css';
import './styles/components.css';

// About page. Static content — no state, no game modules needed.
// Voice: casual/personal for intro + bio, measured/educational for the
// "why some pairs are harder" section (deliberate pivot header between
// the two registers). All example pairs + values are REAL data from
// src/data/words.json, extracted from actual Source Serif 4
// (unitsPerEm: 1000).

const app = document.getElementById('app');

// ── display helpers ────────────────────────────────────────────────
const EXAMPLE_PX = 64;                 // display size for demo pairs
const unitsToPx = (u) => (u * EXAMPLE_PX) / 1000;

function pairDemo(leftChar, rightChar, units, note) {
  return `
    <div style="display:flex; align-items:flex-start; gap:14px; padding:14px 0; border-top:0.5px solid var(--color-border-soft);">
      <div style="min-width:110px;">
        <span style="font-family:var(--font-serif); font-size:${EXAMPLE_PX}px; line-height:1; color:var(--color-text);">${leftChar}</span><span style="font-family:var(--font-serif); font-size:${EXAMPLE_PX}px; line-height:1; color:var(--color-text); margin-left:${unitsToPx(units)}px;">${rightChar}</span>
      </div>
      <div>
        <div style="font-size:11px; color:var(--color-text-faint); margin-bottom:4px;">
          ${leftChar}·${rightChar} — kern: <span style="color:var(--color-accent);">${units}</span>
        </div>
        <div style="font-family:var(--font-serif); font-size:14px; line-height:1.55; color:var(--color-text-dim);">${note}</div>
      </div>
    </div>
  `;
}

function sectionLabel(text) {
  return `
    <div style="font-size:11px; color:var(--color-text-faint); letter-spacing:1px; margin:26px 0 8px;">${text}</div>
  `;
}

function prose(html) {
  return `
    <p style="font-family:var(--font-serif); font-size:15px; line-height:1.7; color:var(--color-text-dim); margin:0 0 14px;">${html}</p>
  `;
}

// ── content ────────────────────────────────────────────────────────
const intro = `
  <div>
    ${prose(`so you want your <span style="color:var(--color-text);">Type</span> to stop looking like <span style="color:var(--color-text);">T y p e</span>. same.`)}
    ${prose(`KernLab is a small training game for the part of typesetting that nobody teaches on purpose: the tiny adjustments between specific letter pairs that make a word look <em>right</em> instead of merely <em>placed</em>.`)}
    ${prose(`drag the letter to where it feels correct, nudge it by single pixels if you're feeling brave, hit <span style="color:var(--color-accent);">done</span> — and find out how far off your eye was. score is out of 100. string up 90+ scores and the streak counter goes up. that's the whole loop.`)}
    ${prose(`every kerning value in the game is real, pulled from an actual font (Adobe's <span style="color:var(--color-text);">Source Serif 4</span>) — not made up. when you solve a word, you're matching what a professional type designer decided fifteen years ago. you're welcome.`)}
  </div>
`;

const education = `
  <div>
    ${sectionLabel('# why some pairs are harder')}
    <h2 style="font-family:var(--font-ui); font-size:15px; font-weight:700; color:var(--color-text); margin:0 0 12px;">On a serious note: why some pairs are harder</h2>
    ${prose(`Kerning is optical, not mathematical. Two letters can be exactly flush and still look far apart — because of the shapes that face each other. The game's data groups every pair into a few shape categories. These are real examples, with the real values (in font units, where the font's em is 1000 units; negative means the letters tuck closer together):`)}
    <div style="border:0.5px solid var(--color-border); border-radius:var(--radius-md); padding:4px 16px; margin:16px 0;">
      ${pairDemo('V', 'o', -71, `diagonal + round. the <em>V</em>'s slanted arm opens a wedge that the round <em>o</em> can slide into. one of the biggest corrections you'll ever make — and one of the most satisfying to get right.`)}
      ${pairDemo('T', 'y', -40, `diagonal + stem. the <em>T</em>'s overhang leaves a gap above the <em>y</em>'s stem; the diagonal arms of the <em>y</em> allow a moderate tuck.`)}
      ${pairDemo('T', 'o', -70, `round + stem. a round letter meeting a straight-sided letter wants a strong tuck, even when the verticals look "square".`)}
      ${pairDemo('o', 'o', 0, `round + round. counterintuitively, often needs almost nothing: two identical curves face each other evenly. the puzzle is trusting that zero is correct.`)}
      ${pairDemo('H', 'i', 0, `stem + stem. parallel verticals again. like <em>o·o</em>, the trap is overcorrecting — if it looks loose, it's the letters, not the spacing.`)}
    </div>
    ${prose(`general rule of thumb: the more the two letters' facing shapes interlock diagonally or curvily, the bigger the correction. the more they face each other with parallel straight edges, the closer the answer is to zero. the game picks both kinds, so your instincts get tested in both directions.`)}
  </div>
`;

const dataNote = `
  <div>
    ${sectionLabel('# how the words work')}
    ${prose(`each word is built from real pairs. most pairs arrive already correct — like real typesetting, where the font handles the boring stuff. only a few pairs per word are switched off and shuffled, and those are the puzzle. fix them and the whole word snaps into place, because every letter after a corrected pair shifts with it.`)}
  </div>
`;

const credits = `
  <div>
    ${sectionLabel('# credits &amp; colophon')}
    <p style="font-family:var(--font-serif); font-size:14px; line-height:1.7; color:var(--color-text-dim); margin:0 0 14px;">
      the idea descends directly from <a href="https://type.method.ac" target="_blank" rel="noopener" style="color:var(--color-accent);">KernType</a> by <a href="https://method.ac" target="_blank" rel="noopener" style="color:var(--color-accent);">Method Inc.</a> — a great exercise worth playing too. kerning data extracted from <a href="https://github.com/adobe-fonts/source-serif" target="_blank" rel="noopener" style="color:var(--color-accent);">Source Serif 4</a> (Adobe, under the SIL Open Font License). UI set in <a href="https://www.jetbrains.com/mono/" target="_blank" rel="noopener" style="color:var(--color-accent);">JetBrains Mono</a>, also free and open source.
    </p>
    <div style="border:0.5px solid var(--color-border); border-radius:var(--radius-md); padding:14px 16px; display:flex; align-items:center; gap:12px;">
      <div style="width:34px; height:34px; border-radius:50%; border:0.5px solid var(--color-accent); display:flex; align-items:center; justify-content:center; color:var(--color-accent); font-size:13px; font-weight:700;">a</div>
      <div>
        <div style="font-size:13px; color:var(--color-text); font-weight:700;">Amir</div>
        <div style="font-size:11px; color:var(--color-text-faint);">Designer / Design Educator</div>
      </div>
    </div>
  </div>
`;

app.innerHTML = `
  <div style="max-width:420px; margin:40px auto; background:var(--color-bg); border:0.5px solid var(--color-border); border-radius:12px; overflow:hidden;">
    <div style="display:flex; align-items:center; justify-content:space-between; padding:14px 16px; border-bottom:0.5px solid var(--color-border);">
      <span style="color:var(--color-accent); font-size:14px; font-weight:700; letter-spacing:1px;">KERNLAB</span>
      <a href="/index.html" style="font-size:12px; color:var(--color-text-faint); text-decoration:none; border:0.5px solid var(--color-border); border-radius:var(--radius-sm); padding:5px 10px;">← back to game</a>
    </div>
    <div style="padding:20px 16px 24px;">
      ${intro}
      ${education}
      ${dataNote}
      ${credits}
    </div>
    <div style="padding:12px 16px; border-top:0.5px solid var(--color-border); font-size:11px; color:var(--color-text-faint);">
      \\ kernlab — practice makes permanent
    </div>
  </div>
`;
