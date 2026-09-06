// All state changes go through functions here. Components/events.js
// call these -- nothing else touches the store directly.

import { getState, setState } from './store.js';
import { pickWordForTier } from './lib/words.js';
import { scoreForWord } from './lib/scoring.js';
import { UNITS_PER_EM, WORD_FONT_SIZE_PX } from './lib/fonts.js';

const OFFSET_MIN = -150;
const OFFSET_MAX = 150;
const NUDGE_STEP_UNITS = Math.round(UNITS_PER_EM / WORD_FONT_SIZE_PX);

// Editable pairs must never start exactly at their target -- otherwise
// a word whose correct answer happens to be "no change" (common for
// round-round/stem-stem pairs, e.g. Hill's target of 0) would be
// solved automatically with zero interaction. This guarantees a real,
// visible gap to close every round, regardless of the target value.
function randomStartOffset(target) {
  const MIN_DISTANCE = 40; // ~3px at our current font size -- clearly visible
  const direction = Math.random() < 0.5 ? -1 : 1;
  const magnitude = MIN_DISTANCE + Math.random() * 40; // 40-80 units away
  return clampOffset(Math.round(target + direction * magnitude));
}

function buildRoundWord(tier) {
  const wordData = pickWordForTier(tier);
  const letters = wordData.word.split('');

  // Fixed pairs are pre-set to their real target immediately and never
  // change -- correctly kerned from the moment the round starts, same
  // as every pair in a real, professionally-set word except the one
  // you're being asked to fix.
  const pairs = wordData.pairs.map((pair) => ({
    ...pair,
    offset: pair.editable ? randomStartOffset(pair.target) : pair.target,
  }));

  return { word: wordData.word, letters, pairs };
}

export function initRound(tier) {
  setState({
    tier,
    currentWord: buildRoundWord(tier),
    done: false,
  });
}

export function setTier(tier) {
  initRound(tier);
}

function clampOffset(value) {
  return Math.max(OFFSET_MIN, Math.min(OFFSET_MAX, value));
}

function findEditablePair(currentWord, letterIndex) {
  return currentWord.pairs.find((p) => p.letterIndex === letterIndex && p.editable);
}

export function nudgeGap(letterIndex, direction) {
  const state = getState();
  if (state.done || !state.currentWord) return;
  if (!findEditablePair(state.currentWord, letterIndex)) return;

  const pairs = state.currentWord.pairs.map((pair) =>
    pair.letterIndex === letterIndex && pair.editable
      ? { ...pair, offset: clampOffset(pair.offset + direction * NUDGE_STEP_UNITS) }
      : pair
  );

  setState({ currentWord: { ...state.currentWord, pairs } });
}

export function setGapOffset(letterIndex, offsetUnits) {
  const state = getState();
  if (state.done || !state.currentWord) return;
  if (!findEditablePair(state.currentWord, letterIndex)) return;

  const clamped = clampOffset(Math.round(offsetUnits));
  const pairs = state.currentWord.pairs.map((pair) =>
    pair.letterIndex === letterIndex && pair.editable ? { ...pair, offset: clamped } : pair
  );

  setState({ currentWord: { ...state.currentWord, pairs } });
}

export function commitDone() {
  const state = getState();
  if (state.done || !state.currentWord) return;

  // Only editable pairs count toward the score -- fixed pairs are
  // always "correct" by definition, so including them would just
  // water down the number for no reason.
  const editablePairs = state.currentWord.pairs.filter((p) => p.editable);
  const score = scoreForWord(editablePairs);
  const streak = score >= 90 ? state.streak + 1 : 0;

  setState({ done: true, score, streak });

  try {
    localStorage.setItem('kernlab_streak', String(streak));
  } catch (e) {
    // localStorage can fail in private browsing -- fine to skip silently.
  }
}

export function nextRound() {
  const state = getState();
  initRound(state.tier);
}

export function loadPersistedStreak() {
  try {
    const saved = localStorage.getItem('kernlab_streak');
    if (saved !== null) {
      setState({ streak: Number(saved) });
    }
  } catch (e) {
    // ignore
  }
}