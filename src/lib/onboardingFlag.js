// onboardingFlag.js -- where the "has seen the tutorial" flag lives.
//
// Isolated in its own tiny module on purpose: the storage choice
// (localStorage vs. something else) was deliberately left open, so
// when that decision is made, only this file changes.

const KEY = 'kernlab_onboarded';

export function hasOnboarded() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch (e) {
    // Storage blocked (private browsing etc.) -- better to never show
    // the tutorial than to show it on every single page load.
    return true;
  }
}

export function markOnboarded() {
  try {
    localStorage.setItem(KEY, '1');
  } catch (e) {
    // ignore -- worst case the tutorial shows again next visit
  }
}
