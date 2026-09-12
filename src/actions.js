// All state changes go through functions here. Components/events.js
// call these -- nothing else touches the store directly.

import { getState, setState } from './store.js';
import { pickWordForTier } from './lib/words.js';
import { scoreForWord } from './lib/scoring.js';
import { UNITS_PER_EM, WORD_FONT_SIZE_PX } from './lib/fonts.js';

const OFFSET_MIN = -150;
const OFFSET_MAX = 150;
const NUDGE_STEP_UNITS = Math.round(UNITS_PER_EM / WORD_FONT_SIZE_PX);

function clampOffset(value) {
  return Math.max(OFFSET_MIN, Math.min(OFFSET_MAX, value));
}

// Editable pairs must never start exactly at their target -- otherwise
// a word whose correct answer happens to be "no change" (e.g. Hill's
// target of 0) would be solved automatically with zero interaction.
function randomStartOffset(target) {
  const MIN_DISTANCE = 40; // ~3px at our current font size -- clearly visible
  const direction = Math.random() < 0.5 ? -1 : 1;
  const magnitude = MIN_DISTANCE + Math.random() * 40;
  return clampOffset(Math.round(target + direction * magnitude));
}

function buildRoundWord(tier) {
  const wordData = pickWordForTier(tier);
  const letters = wordData.word.split('');

  const pairs = wordData.pairs.map((pair) => ({
    ...pair,
    offset: pair.editable ? randomStartOffset(pair.target) : pair.target,
  }));

  return { word: wordData.word, letters, pairs };
}

export function initRound(tier) {
  const currentWord = buildRoundWord(tier);
  const firstEditable = currentWord.pairs.find((p) => p.editable);

  setState({
    tier,
    currentWord,
    activeLetterIndex: firstEditable ? firstEditable.letterIndex : null,
    done: false,
  });
}

export function setTier(tier) {
  initRound(tier);
}

function findEditablePair(currentWord, letterIndex) {
  return currentWord.pairs.find((p) => p.letterIndex === letterIndex && p.editable);
}

// Selects which editable pair the nudge buttons / next drag will act
// on. Called both when clicking a letter directly and when clicking
// its row in the pair list -- both are just "make this the active gap."
export function selectGap(letterIndex) {
  const state = getState();
  if (state.done || !state.currentWord) return;
  if (!findEditablePair(state.currentWord, letterIndex)) return;

  setState({ activeLetterIndex: letterIndex });
}

export function nudgeActiveGap(direction) {
  const state = getState();
  if (state.done || !state.currentWord || state.activeLetterIndex === null) return;

  const pairs = state.currentWord.pairs.map((pair) =>
    pair.letterIndex === state.activeLetterIndex && pair.editable
      ? { ...pair, offset: clampOffset(pair.offset + direction * NUDGE_STEP_UNITS) }
      : pair
  );

  setState({ currentWord: { ...state.currentWord, pairs } });
}

// Called from drag handling in lib/events.js. Dragging a letter also
// makes it the active gap, so a plain click-and-release still selects
// it even with no movement.
export function setGapOffset(letterIndex, offsetUnits) {
  const state = getState();
  if (state.done || !state.currentWord) return;
  if (!findEditablePair(state.currentWord, letterIndex)) return;

  const clamped = clampOffset(Math.round(offsetUnits));
  const pairs = state.currentWord.pairs.map((pair) =>
    pair.letterIndex === letterIndex && pair.editable ? { ...pair, offset: clamped } : pair
  );

  setState({ currentWord: { ...state.currentWord, pairs }, activeLetterIndex: letterIndex });
}

export function commitDone() {
  const state = getState();
  if (state.done || !state.currentWord) return;

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
