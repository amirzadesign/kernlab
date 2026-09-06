// Simple random helpers. Deliberately not seeded yet -- every round
// is genuinely random. A seeded version (for daily-challenge-style
// reproducibility) can replace pickRandom's internals later without
// changing any code that calls it.

export function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}
