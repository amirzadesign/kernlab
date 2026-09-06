// Single source of truth for game state (mirrors a Svelte writable store).
// Nothing outside this file ever mutates `state` directly -- actions.js
// is the only place that calls setState().

let state = {
  tier: 4,
  currentWord: null,   // { word, letters: [...], gaps: [...] }
  done: false,
  score: 0,
  streak: 0,
};

const listeners = new Set();

export function getState() {
  return state;
}

export function setState(patch) {
  state = { ...state, ...patch };
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
