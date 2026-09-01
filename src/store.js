// Single source of truth for game state (mirrors a Svelte writable store).
// Other modules never mutate state directly — they call functions in
// actions.js, which call the setState()-style function exported here.

let state = {
  // filled in when we build the actual game loop
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
