// Centralized input handling. One click listener + one drag handler
// on the app root, using data-action attributes to figure out what
// to do. Components never bind their own listeners -- this is the
// only place that calls into actions.js in response to real input.

import { setTier, nudgeActiveGap, commitDone, nextRound, setGapOffset, selectGap } from '../actions.js';
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

  if (action === 'select-gap') {
    selectGap(Number(target.dataset.letterIndex));
  }

  if (action === 'nudge') {
    nudgeActiveGap(Number(target.dataset.dir));
  }

  if (action === 'done') {
    commitDone();
  }

  if (action === 'next') {
    nextRound();
  }

  if (action === 'share') {
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

  // Dragging (even a tap with no movement) makes this the active gap.
  selectGap(letterIndex);

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
