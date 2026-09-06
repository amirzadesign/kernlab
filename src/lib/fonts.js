// Handles the conversion between "font design units" (the space real
// kerning values live in -- e.g. -40, -119) and actual on-screen
// pixels, which depends on the font's units-per-em and whatever size
// we're currently rendering the word at.
//
// Keeping this conversion centralized means if the word's rendered
// size ever changes (e.g. the responsive clamp() sizing we planned
// for larger screens), every offset/target automatically stays
// correct -- nothing else needs to know about pixels at all.

export const UNITS_PER_EM = 1000; // confirmed for Source Serif 4 & Source Sans 3
export const WORD_FONT_SIZE_PX = 74; // matches Stage.js's current rendered size

export function unitsToPixels(units, fontSizePx = WORD_FONT_SIZE_PX) {
  return units * (fontSizePx / UNITS_PER_EM);
}

export function pixelsToUnits(px, fontSizePx = WORD_FONT_SIZE_PX) {
  return px * (UNITS_PER_EM / fontSizePx);
}
