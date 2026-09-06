// Loads word data for a given difficulty tier and picks a round's word.
import wordsData from '../data/words.json';
import { pickRandom } from './rng.js';

export function getWordsForTier(tier) {
  return wordsData[String(tier)] || [];
}

export function pickWordForTier(tier) {
  const words = getWordsForTier(tier);
  return pickRandom(words);
}
