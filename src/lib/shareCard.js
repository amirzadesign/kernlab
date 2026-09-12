// shareCard.js -- generates the share PNG on a canvas.
//
// Comparison view, KernType-style: the CORRECT kerning drawn in white
// with the player's attempt ghosted in green behind it (same visual
// language as the game's post-Done reveal). Terminal dark background,
// JetBrains Mono chrome, Source Serif 4 for the word.
//
// The card is rendered at 2x (2400x1260 backing store for a
// 1200x630 card) so it stays crisp on retina screens and in feeds.

import { computeLetterOffsets } from './layout.js';

const CARD_W = 1200;
const CARD_H = 630;
const SCALE = 2;

const COLORS = {
  bg: '#0d1117',
  border: '#2a2f38',
  text: '#e6edf3',
  dim: '#8b949e',
  faint: '#5b6470',
  accent: '#7ee787',
};

// Kick the browser to actually download/parse the webfonts before we
// measure anything -- canvas silently falls back to a default font if
// the face isn't ready, which would wreck letter widths.
async function ensureFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('700 34px "JetBrains Mono"'),
    document.fonts.load('400 26px "JetBrains Mono"'),
    document.fonts.load('600 150px "Source Serif 4"'),
  ]);
}

function setFont(ctx, spec) {
  ctx.font = spec;
}

// Total advance width of the word at a given size, including kerning
// offsets. offsets[] is the cumulative per-letter offset array from
// computeLetterOffsets (font units).
function measureWord(ctx, letters, offsets, sizePx) {
  setFont(ctx, `600 ${sizePx}px "Source Serif 4", serif`);
  let total = 0;
  for (let i = 0; i < letters.length; i++) {
    total += ctx.measureText(letters[i]).width;
    if (i < letters.length - 1) {
      total += offsets[i + 1] * (sizePx / 1000);
    }
  }
  return total;
}

function drawWord(ctx, letters, offsets, sizePx, centerX, baselineY, color, alpha) {
  const width = measureWord(ctx, letters, offsets, sizePx);
  let x = centerX - width / 2;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  setFont(ctx, `600 ${sizePx}px "Source Serif 4", serif`);
  ctx.textBaseline = 'alphabetic';

  for (let i = 0; i < letters.length; i++) {
    ctx.fillText(letters[i], x, baselineY);
    x += ctx.measureText(letters[i]).width;
    if (i < letters.length - 1) {
      x += offsets[i + 1] * (sizePx / 1000);
    }
  }
  ctx.restore();
  return width;
}

/**
 * Build the share card for a completed round.
 * @param state  game state snapshot (must have done === true)
 * @returns Promise<{ blob: Blob, dataUrl: string, filename: string }>
 */
export async function generateShareCard(state) {
  await ensureFonts();

  const canvas = document.createElement('canvas');
  canvas.width = CARD_W * SCALE;
  canvas.height = CARD_H * SCALE;
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);

  const { currentWord, score, tier, streak } = state;
  const { word, letters, pairs } = currentWord;

  // ── background + border ──────────────────────────────────────────
  ctx.fillStyle = COLORS.bg;
  ctx.fillRect(0, 0, CARD_W, CARD_H);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, CARD_W - 48, CARD_H - 48);

  // ── header: logo ─────────────────────────────────────────────────
  setFont(ctx, `700 30px "JetBrains Mono", monospace`);
  ctx.fillStyle = COLORS.accent;
  ctx.textBaseline = 'middle';
  ctx.fillText('KernLab', 64, 84);
  const logoW = ctx.measureText('KernLab').width;
  // blinking-cursor block after the logo, like the terminal UI
  ctx.fillRect(64 + logoW + 10, 70, 16, 28);

  setFont(ctx, `400 22px "JetBrains Mono", monospace`);
  ctx.fillStyle = COLORS.faint;
  ctx.textAlign = 'right';
  ctx.fillText('a kerning trainer', CARD_W - 64, 84);
  ctx.textAlign = 'left';

  // ── the word: correct (white) over yours (green ghost) ──────────
  const liveOffsets = computeLetterOffsets(currentWord);           // player's
  const solvedOffsets = computeLetterOffsets(currentWord, { useTarget: true }); // correct

  // Fit the word to ~1000px max width.
  let sizePx = 150;
  while (sizePx > 70) {
    const w = Math.max(
      measureWord(ctx, letters, liveOffsets, sizePx),
      measureWord(ctx, letters, solvedOffsets, sizePx)
    );
    if (w <= 1000) break;
    sizePx -= 5;
  }

  const baselineY = 330;
  const centerX = CARD_W / 2;
  drawWord(ctx, letters, liveOffsets, sizePx, centerX, baselineY, COLORS.accent, 0.5);
  drawWord(ctx, letters, solvedOffsets, sizePx, centerX, baselineY, COLORS.text, 1);

  // ── legend ───────────────────────────────────────────────────────
  setFont(ctx, `400 20px "JetBrains Mono", monospace`);
  const legendY = 396;
  ctx.textBaseline = 'middle';

  ctx.fillStyle = COLORS.accent;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(centerX - 190, legendY - 8, 16, 16);
  ctx.globalAlpha = 1;
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('yours', centerX - 166, legendY);

  ctx.fillStyle = COLORS.text;
  ctx.fillRect(centerX + 40, legendY - 8, 16, 16);
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('correct', centerX + 64, legendY);

  // ── stats line ───────────────────────────────────────────────────
  setFont(ctx, `400 26px "JetBrains Mono", monospace`);
  ctx.textAlign = 'center';
  ctx.fillStyle = COLORS.faint;
  const statsLine = `score ${score}/100   ·   tier ${tier}   ·   streak ${streak}`;
  ctx.fillText(statsLine, centerX, 468);
  ctx.textAlign = 'left';

  // ── footer: word + url ───────────────────────────────────────────
  setFont(ctx, `400 22px "JetBrains Mono", monospace`);
  ctx.fillStyle = COLORS.faint;
  ctx.fillText(`"${word.toLowerCase()}"`, 64, CARD_H - 72);
  ctx.textAlign = 'right';
  ctx.fillStyle = COLORS.dim;
  ctx.fillText('kernlab.netlify.app', CARD_W - 64, CARD_H - 72);
  ctx.textAlign = 'left';

  // ── export ───────────────────────────────────────────────────────
  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
  const dataUrl = canvas.toDataURL('image/png');
  const filename = `kernlab-${word.toLowerCase()}-${score}.png`;

  return { blob, dataUrl, filename };
}
