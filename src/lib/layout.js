// Computes each letter's horizontal position for rendering.
//
// Two modes:
//  - "live" (default): uses each pair's current offset -- this is
//    what's actually being dragged/adjusted during play, and (once
//    Done) represents exactly what the player left behind.
//  - "solved": uses each pair's real target instead of its current
//    offset -- this is what the fully correct word looks like. Fixed
//    pairs are identical in both modes, since their offset always
//    equals their target already.
//
// We need both: after Done, the main word should snap to "solved" so
// everything reads correctly, while the one tested letter also shows
// a "live" ghost behind it for comparison.

export function computeLetterOffsets(currentWord, { useTarget = false } = {}) {
  const { letters, pairs } = currentWord;
  const offsets = new Array(letters.length).fill(0);

  let cumulative = 0;
  for (let i = 1; i < letters.length; i++) {
    const pair = pairs.find((p) => p.letterIndex === i);
    if (pair) {
      cumulative += useTarget ? pair.target : pair.offset;
    }
    offsets[i] = cumulative;
  }

  return offsets;
}
