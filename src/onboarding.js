// onboarding.js -- first-run tooltip sequence.
//
// Order (locked design):
//   1. drag hint   -- anchored on the word, "drag letters to kern"
//   2. nudge hint  -- anchored on the ‹ › buttons, "±1px fine control"
//   3. done hint   -- anchored on the done button
//   4. share hint  -- anchored on the share button, shown only AFTER
//                     the player reveals their first result (done)
//
// Progress dots + a skip link on every tooltip. Skipping (or finishing
// step 4) marks onboarding seen via lib/onboardingFlag.js.
//
// Tooltips live on document.body, NOT inside #app, because #app is
// wiped and rebuilt on every state change. We subscribe to the store
// and reposition after each re-render (the anchor element is a brand
// new node every time, so we re-query it).

import { subscribe } from './store.js';
import { hasOnboarded, markOnboarded } from './lib/onboardingFlag.js';

const STEPS = [
  {
    anchor: '[data-letter="true"]',           // first editable letter
    placement: 'below',
    text: 'drag the highlighted letter left/right to fix the spacing.',
  },
  {
    anchor: '[data-action="nudge"]',          // the ‹ › pair
    placement: 'below',
    text: 'for ±1px fine control, use the ‹ › nudge buttons.',
  },
  {
    anchor: '[data-action="done"]',
    placement: 'above',
    text: 'when it looks right, hit done to see how close you got.',
  },
  {
    // Post-reveal only. Anchored on the share button, which is now live.
    anchor: '[data-action="share"]',
    placement: 'above',
    text: 'nice. you can share your result as an image — or keep playing.',
    postReveal: true,
  },
];

let active = false;         // sequence running (steps 1-3)
let waitingForReveal = false; // step 3 finished, waiting for first done
let stepIndex = 0;
let tooltipEl = null;

export function initOnboarding() {
  if (hasOnboarded()) return;
  active = true;
  stepIndex = 0;
  subscribe((state) => {
    if (!tooltipEl) return;
    const step = STEPS[stepIndex];
    if (!document.querySelector(step.anchor)) {
      // The anchor vanished mid-sequence -- the common case is the
      // player hitting done with steps 1-3 still open (the button
      // becomes "next"). If the round is revealed, jump straight to
      // the share hint, which anchors on a button that IS present.
      if (state.done && !step.postReveal) {
        removeTooltip();
        stepIndex = STEPS.length - 1;
        showCurrentStep();
      } else {
        removeTooltip();
      }
      return;
    }
    positionTooltip();
  });
  showCurrentStep();
}

// Called from events.js right after commitDone().
export function notifyDoneForOnboarding() {
  if (!waitingForReveal) return;
  waitingForReveal = false;
  active = true;
  stepIndex = STEPS.length - 1; // the share step
  showCurrentStep();
}

function showCurrentStep() {
  removeTooltip();
  const step = STEPS[stepIndex];
  if (!step) return finish();

  const anchor = document.querySelector(step.anchor);
  if (!anchor) {
    // Anchor not in the DOM (e.g. mid re-render) -- retry next frame.
    requestAnimationFrame(showCurrentStep);
    return;
  }

  tooltipEl = document.createElement('div');
  tooltipEl.className = 'ob-tooltip';
  tooltipEl.innerHTML = `
    <div class="ob-text">${step.text}</div>
    <div class="ob-footer">
      <div class="ob-dots">
        ${STEPS.map((_, i) => `<span class="ob-dot${i === stepIndex ? ' on' : ''}"></span>`).join('')}
      </div>
      <div class="ob-actions">
        <button class="ob-skip" data-ob="skip">skip</button>
        ${step.postReveal
          ? `<button class="ob-next" data-ob="close">got it</button>`
          : `<button class="ob-next" data-ob="next">${stepIndex === 2 ? 'got it' : 'next'}</button>`}
      </div>
    </div>
  `;
  document.body.appendChild(tooltipEl);
  positionTooltip();

  tooltipEl.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-ob]');
    if (!btn) return;
    const what = btn.dataset.ob;
    if (what === 'skip') return finish();
    if (what === 'close') return finish();
    if (what === 'next') {
      stepIndex += 1;
      if (stepIndex === STEPS.length - 1) {
        // Steps 1-3 done; step 4 waits for the player's first Done.
        removeTooltip();
        active = false;
        waitingForReveal = true;
        return;
      }
      showCurrentStep();
    }
  });
}

function positionTooltip() {
  if (!tooltipEl) return;
  const step = STEPS[stepIndex];
  const anchor = document.querySelector(step.anchor);
  if (!anchor) return;

  const r = anchor.getBoundingClientRect();
  const tr = tooltipEl.getBoundingClientRect();
  const margin = 10;

  let top = step.placement === 'above'
    ? r.top - tr.height - margin
    : r.bottom + margin;

  // Keep inside the viewport.
  if (top < margin) top = r.bottom + margin;
  if (top + tr.height > window.innerHeight - margin) top = r.top - tr.height - margin;

  let left = r.left + r.width / 2 - tr.width / 2;
  left = Math.max(margin, Math.min(left, window.innerWidth - tr.width - margin));

  tooltipEl.style.top = `${top + window.scrollY}px`;
  tooltipEl.style.left = `${left + window.scrollX}px`;
}

function removeTooltip() {
  if (tooltipEl) {
    tooltipEl.remove();
    tooltipEl = null;
  }
}

function finish() {
  removeTooltip();
  active = false;
  waitingForReveal = false;
  markOnboarded();
}

// Reposition on window resize/scroll too.
window.addEventListener('resize', () => { if (active) positionTooltip(); });
window.addEventListener('scroll', () => { if (active) positionTooltip(); }, { passive: true });
