// Centralized input handling. One click listener + one drag handler
// on the app root, using data-action attributes to figure out what
// to do. This means components never bind their own listeners --
// they just render markup with the right data-* attributes, and
// this file is the only place that touches actions.js in response
// to real user input. Works the same after every re-render, since
// we're not attaching/detaching per-element listeners each time.

import { setTier, nudgeGap, commitDone, nextRound, setGapOffset } from '../actions.js';
import { getState } from '../store.js';
import { pixelsToUnits } from './fonts.js';

export function bindEvents(root) {
  root.addEventListener('click', handleClick);
  root.addEventListener('mousedown', handleDragStart);
  root.addEventListener('touchstart', handleDragStart, { passive: true });
}

function handleClick(e) {
  const target = e.target.closest('[data-action]');
  if (!target) return;

  const action = target.dataset.action;

  if (action === 'set-tier') {
    setTier(Number(target.dataset.tier));
  }

  if (action === 'nudge') {
    const state = getState();
    if (!state.currentWord) return;
    // MVP: exactly one editable pair per word, so nudge always
    // targets it directly. Once multi-gap words exist, this needs
    // an "active gap" concept (clicking a pair-list row to select it).
    const editablePair = state.currentWord.pairs.find((p) => p.editable);
    if (!editablePair) return;
    nudgeGap(editablePair.letterIndex, Number(target.dataset.dir));
  }

  if (action === 'done') {
    commitDone();
  }

  if (action === 'next') {
    nextRound();
  }

  if (action === 'share') {
    // Placeholder -- share card + popup menu built in a later step.
    console.log('share clicked (not yet implemented)');
  }
}

let dragState = null; // { letterIndex, startX, startOffset }

function handleDragStart(e) {
  const target = e.target.closest('[data-letter]');
  if (!target) return;

  const state = getState();
  if (state.done || !state.currentWord) return;

  const letterIndex = Number(target.dataset.letterIndex);
  const pair = state.currentWord.pairs.find((p) => p.letterIndex === letterIndex && p.editable);
  if (!pair) return; // not a draggable letter

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  dragState = { letterIndex, startX: clientX, startOffset: pair.offset };

  window.addEventListener('mousemove', handleDragMove);
  window.addEventListener('mouseup', handleDragEnd);
  window.addEventListener('touchmove', handleDragMove, { passive: true });
  window.addEventListener('touchend', handleDragEnd);
}

function handleDragMove(e) {
  if (!dragState) return;
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const deltaPx = clientX - dragState.startX;
  const deltaUnits = pixelsToUnits(deltaPx);
  setGapOffset(dragState.letterIndex, dragState.startOffset + deltaUnits);
}

function handleDragEnd() {
  dragState = null;
  window.removeEventListener('mousemove', handleDragMove);
  window.removeEventListener('mouseup', handleDragEnd);
  window.removeEventListener('touchmove', handleDragMove);
  window.removeEventListener('touchend', handleDragEnd);
}
