// Environment helpers -- currently just touch detection, used later
// to decide things like nudge-button sizing or interaction hints.
export function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
