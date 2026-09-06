// Tiny DOM helper -- shorthand for querySelector.
export function qs(selector, root = document) {
  return root.querySelector(selector);
}
