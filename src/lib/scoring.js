// Pure scoring functions -- no state, no DOM, easy to test in isolation.
import { unitsToPixels } from './fonts.js';

// Points lost per pixel of *visible* error. This constant is tuned
// against pixels specifically (not raw design units) so it stays
// meaningful no matter how large a font's unit values happen to be --
// "off by 1 visible pixel costs ~3.5 points" is a stable game-design
// decision; "off by 1 design unit" isn't, since that means wildly
// different amounts of visible error from font to font.
const PENALTY_PER_PIXEL = 3.5;

export function scoreForGap(offsetUnits, targetUnits) {
  const diffPx = Math.abs(unitsToPixels(offsetUnits - targetUnits));
  return Math.max(0, Math.round(100 - diffPx * PENALTY_PER_PIXEL));
}

export function scoreForWord(gaps) {
  if (gaps.length === 0) return 0;
  const total = gaps.reduce((sum, g) => sum + scoreForGap(g.offset, g.target), 0);
  return Math.round(total / gaps.length);
}
