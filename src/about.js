import './styles/base.css';
import './styles/components.css';

// About page. Static content — no state, no game modules needed.
// Voice: casual/personal for intro + bio, measured/educational for the
// "why some pairs are harder" section (deliberate pivot header between
// the two registers). All example pairs + values are REAL data from
// src/data/words.json, extracted from actual Source Serif 4
// (unitsPerEm: 1000).

import { logoMark } from './lib/logo.js';

const app = document.getElementById('app');

// ── display helpers ────────────────────────────────────────────────
const EXAMPLE_PX = 92;                 // display size for demo pairs
const unitsToPx = (u) => (u * EXAMPLE_PX) / 1000;

// Same signed, zero-padded format the game's Controls.js pair list
// uses -- just scaled to this page's own display size (EXAMPLE_PX)
// instead of the game's WORD_FONT_SIZE_PX.
function formatSignedPx(units) {
  const px = Math.round(unitsToPx(units));
  const sign = px >= 0 ? '+' : '-';
  return sign + String(Math.abs(px)).padStart(2, '0');
}

function pairDemo(leftChar, rightChar, units, note) {
  return `
    <div style="display:flex; align-items:flex-start; gap:18px; padding:18px 0; border-top:1px solid var(--color-border-soft);">
      <div style="min-width:150px;">
        <span style="font-family:var(--font-serif); font-size:${EXAMPLE_PX}px; line-height:1; color:var(--color-text);">${leftChar}</span><span style="font-family:var(--font-serif); font-size:${EXAMPLE_PX}px; line-height:1; color:var(--color-text); margin-left:${unitsToPx(units)}px;">${rightChar}</span>
      </div>
      <div>
        <div style="font-size:18px; color:var(--color-text-faint); margin-bottom:8px;">
          ${leftChar}·${rightChar} — kern: <span style="color:var(--color-accent);">${formatSignedPx(units)}</span>
        </div>
        <div style="font-family:var(--font-serif); font-size:18px; line-height:1.75; color:var(--color-text-dim);">${note}</div>
      </div>
    </div>
  `;
}

function sectionLabel(text) {
  return `
    <div style="font-size:13px; color:var(--color-text-faint); letter-spacing:1px; margin:32px 0 10px;">${text}</div>
  `;
}

function prose(html) {
  return `
    <p style="font-family:var(--font-serif); font-size:18px; line-height:1.75; color:var(--color-text-dim); margin:0 0 16px;">${html}</p>
  `;
}

// ── content ────────────────────────────────────────────────────────
const intro = `
  <div>
    ${prose(`So you want your <span style="color:var(--color-text);">Type</span> to stop looking like <span style="color:var(--color-text);">T y p e</span>. Same.`)}
    ${prose(`KernLab is a small training game for the part of typesetting that nobody teaches on purpose: the tiny adjustments between specific letter pairs that make a word look <em>right</em> instead of merely <em>placed</em>.`)}
    ${prose(`Drag the letter to where it feels correct, nudge it by single pixels if you're feeling brave, hit <span style="color:var(--color-accent);">done</span> — and find out how far off your eye was. Score is out of 100. String up 90+ scores and the streak counter goes up. That's the whole loop.`)}
    ${prose(`Every kerning value in the game is real, pulled from an actual font (Adobe's <span style="color:var(--color-text);">Source Serif 4</span>) — not made up. When you solve a word, you're matching what a professional type designer decided fifteen years ago. You're welcome.`)}
  </div>
`;

const education = `
  <div>
    ${sectionLabel('# why some pairs are harder')}
    <h2 style="font-family:var(--font-ui); font-size:19px; font-weight:700; color:var(--color-text); margin:0 0 14px;">On a serious note: why some pairs are harder</h2>
    ${prose(`Kerning is optical, not mathematical. Two letters can be exactly flush and still look far apart — because of the shapes that face each other. The game's data groups every pair into a few shape categories. These are real examples, with the real values (in font units, where the font's em is 1000 units; negative means the letters tuck closer together):`)}
    <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:6px 20px; margin:18px 0;">
      ${pairDemo('V', 'o', -71, `Diagonal + round. The <em>V</em>'s slanted arm opens a wedge that the round <em>o</em> can slide into. One of the biggest corrections you'll ever make — and one of the most satisfying to get right.`)}
      ${pairDemo('T', 'y', -40, `Diagonal + stem. The <em>T</em>'s overhang leaves a gap above the <em>y</em>'s stem; the diagonal arms of the <em>y</em> allow a moderate tuck.`)}
      ${pairDemo('T', 'o', -70, `Round + stem. A round letter meeting a straight-sided letter wants a strong tuck, even when the verticals look "square".`)}
      ${pairDemo('o', 'o', 0, `Round + round. Counterintuitively, often needs almost nothing: two identical curves face each other evenly. The puzzle is trusting that zero is correct.`)}
      ${pairDemo('H', 'i', 0, `Stem + stem. Parallel verticals again. Like <em>o·o</em>, the trap is overcorrecting — if it looks loose, it's the letters, not the spacing.`)}
    </div>
    ${prose(`General rule of thumb: the more the two letters' facing shapes interlock diagonally or curvily, the bigger the correction. The more they face each other with parallel straight edges, the closer the answer is to zero. The game picks both kinds, so your instincts get tested in both directions.`)}
  </div>
`;

const dataNote = `
  <div>
    ${sectionLabel('# how the words work')}
    ${prose(`Each word is built from real pairs. Most pairs arrive already correct — like real typesetting, where the font handles the boring stuff. Only a few pairs per word are switched off and shuffled, and those are the puzzle. Fix them and the whole word snaps into place, because every letter after a corrected pair shifts with it.`)}
  </div>
`;

const credits = `
  <div>
    ${sectionLabel('# credits &amp; colophon')}
    <p style="font-family:var(--font-serif); font-size:17px; line-height:1.75; color:var(--color-text-dim); margin:0 0 16px;">
      The idea descends directly from <a href="https://type.method.ac" target="_blank" rel="noopener" style="color:var(--color-accent);">KernType</a> by <a href="https://method.ac" target="_blank" rel="noopener" style="color:var(--color-accent);">Method Inc.</a> — a great exercise worth playing too. Kerning data extracted from <a href="https://github.com/adobe-fonts/source-serif" target="_blank" rel="noopener" style="color:var(--color-accent);">Source Serif 4</a> (Adobe, under the SIL Open Font License). UI set in <a href="https://www.jetbrains.com/mono/" target="_blank" rel="noopener" style="color:var(--color-accent);">JetBrains Mono</a>, also free and open source.
    </p>
    <div style="border:1px solid var(--color-border); border-radius:var(--radius-md); padding:18px 20px; display:flex; align-items:center; gap:16px;">
      <div style="width:44px; height:44px; border-radius:50%; border:1px solid var(--color-accent); display:flex; align-items:center; justify-content:center; color:var(--color-accent); font-size:16px; font-weight:700;">a</div>
      <div>
        <div style="font-size:16px; color:var(--color-text); font-weight:700;">Amir</div>
        <div style="font-size:13px; color:var(--color-text-faint);">Designer / Design Educator</div>
      </div>
    </div>
  </div>
`;

// Full-width, full-height page to match the game's scale -- but
// unlike the game, prose benefits from a capped reading width rather
// than stretching edge to edge, so the header/rules span full width
// while the actual paragraphs sit in a centered ~720px column.
app.innerHTML = `
  <div style="min-height:100dvh; background:var(--color-bg); display:flex; flex-direction:column;">
    <div style="display:flex; align-items:center; justify-content:space-between; padding:20px 28px; border-bottom:1px solid var(--color-border);">
      <span aria-label="KernLab">${logoMark(72)}</span>
      <a href="/index.html" style="font-size:15px; color:var(--color-text-faint); text-decoration:none; border:1px solid var(--color-border); border-radius:var(--radius-sm); padding:8px 16px;">← back to game</a>
    </div>
    <div style="flex:1; display:flex; justify-content:center; padding:0 24px;">
      <div style="max-width:780px; width:100%; padding:36px 0 28px;">
        ${intro}
        ${education}
        ${dataNote}
        ${credits}
      </div>
    </div>
    <div style="padding:16px 28px; border-top:1px solid var(--color-border); font-size:14px; color:var(--color-text-faint); text-align:center;">
      \\ kernlab — practice makes permanent
    </div>
  </div>
`;