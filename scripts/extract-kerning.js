#!/usr/bin/env node
// ---------------------------------------------------------------------------
// extract-kerning.js — pull REAL kerning values out of the actual font file
// and add new words to src/data/words.json.
//
// This is the tool behind every word in the game. It shapes each adjacent
// letter pair with fontkit (the same technique used for the original 15
// words) and measures:
//
//     kern(A·B) = advance("AB") − advance("A") − advance("B")
//
// in font units (Source Serif 4 is 1000 units/em), then rounds to an
// integer — exactly the numbers the game applies as letter-spacing.
//
// USAGE (run from the project root):
//
//   node scripts/extract-kerning.js                 dry run — prints a report
//                                                   for the candidate words,
//                                                   changes nothing
//   node scripts/extract-kerning.js --write         same, then merges the new
//                                                   words into
//                                                   src/data/words.json
//                                                   (backup: words.json.bak)
//   node scripts/extract-kerning.js Valor Wizard    ad-hoc words instead of
//                                                   the candidates file
//   node scripts/extract-kerning.js --font=/path/to/Font.otf
//                                                   use a specific font file
//
// The word list lives in scripts/words-candidates.json — edit that file to
// add/remove candidates, then re-run. Words already in words.json are never
// touched or duplicated.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

// fontkit ships as CommonJS without a clean ESM default export, so load it
// through createRequire — works on every Node version.
const require = createRequire(import.meta.url);
const fontkit = require('fontkit');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const FONTS_DIR = path.join(ROOT, 'scripts', 'fonts');
const WORDS_FILE = path.join(ROOT, 'src', 'data', 'words.json');
const CANDIDATES_FILE = path.join(ROOT, 'scripts', 'words-candidates.json');

// ---------------------------------------------------------------------------
// 1. Find the font file
// ---------------------------------------------------------------------------
// Scans scripts/fonts/ recursively so we don't depend on the exact folder
// layout of the cloned Adobe repo. Prefers Source Serif 4 Regular, static
// (non-variable), non-italic.

function findFontFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findFontFiles(full));
    else if (/\.(otf|ttf)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function scoreFontFile(file) {
  const name = path.basename(file);
  let score = 0;
  if (/SourceSerif4/i.test(name)) score += 100;
  else if (/SourceSerif/i.test(name)) score += 60; // SourceSerifPro fallback
  else if (/serif/i.test(name)) score += 20;
  if (/Regular/i.test(name)) score += 50;
  if (/Italic|Bold|Black|Semibold|Light|Thin|Extra/i.test(name)) score -= 300;
  if (/(^|[\\/])VAR([\\/]|$)/i.test(file)) score -= 50; // prefer static over variable
  return score;
}

function resolveFont(explicit) {
  if (explicit) {
    if (!fs.existsSync(explicit)) {
      console.error(`Font file not found: ${explicit}`);
      process.exit(1);
    }
    return explicit;
  }
  const files = findFontFiles(FONTS_DIR);
  if (!files.length) {
    console.error(
      `No font files found in scripts/fonts/.\n\n` +
      `Get Source Serif 4 first (one-time setup):\n` +
      `  git clone --depth 1 https://github.com/adobe-fonts/source-serif.git scripts/fonts/source-serif\n\n` +
      `Then re-run this script.`
    );
    process.exit(1);
  }
  files.sort((a, b) => scoreFontFile(b) - scoreFontFile(a));
  return files[0];
}

// ---------------------------------------------------------------------------
// 2. Kerning extraction (fontkit shaping)
// ---------------------------------------------------------------------------

function shape(font, text) {
  const run = font.layout(text);
  const total = run.positions.reduce((sum, p) => sum + p.xAdvance, 0);
  return { total, glyphCount: run.glyphs.length };
}

// Returns integer kern in font units, or null if the pair got replaced by a
// ligature (e.g. f·i) and the measurement can't be trusted.
function kernOfPair(font, left, right) {
  const pair = shape(font, left + right);
  if (pair.glyphCount !== 2) return null; // ligature formed — bail out
  const a = shape(font, left);
  const b = shape(font, right);
  if (a.glyphCount !== 1 || b.glyphCount !== 1) return null;
  return Math.round(pair.total - a.total - b.total);
}

// ---------------------------------------------------------------------------
// 3. Shape classification (for the informational "category" labels)
// ---------------------------------------------------------------------------

const DIAGONALS = new Set('AVWXYZK'.split('').concat('vwxyzk'.split('')));
const ROUNDS = new Set('OQCGSU'.split('').concat('oacgeqsu'.split('')));
const RANK = { diagonal: 0, round: 1, stem: 2 };

function classOf(ch) {
  if (DIAGONALS.has(ch)) return 'diagonal';
  if (ROUNDS.has(ch)) return 'round';
  return 'stem';
}

// Matches the naming already in words.json: shapes sorted diagonal > round >
// stem, e.g. T·o → "round-stem", V·o → "diagonal-round", o·o → "round-round".
function categoryOf(left, right) {
  const sorted = [classOf(left), classOf(right)].sort((x, y) => RANK[x] - RANK[y]);
  return `${sorted[0]}-${sorted[1]}`;
}

// ---------------------------------------------------------------------------
// 4. Editable-gap selection
// ---------------------------------------------------------------------------
// Tier convention: 4-letter words get 1 editable gap, 5-letter get 2,
// 6-letter get 3. Auto-pick = strongest |kern| pairs; when a word needs 2+
// gaps and has a zero-kern pair, one zero pair is included as a "trap"
// (like Noon's o·o or Hill's H·i). Manual override per word via the
// "editable" list of letterIndex values in words-candidates.json.

function pickEditable(pairs, manual, wordLength) {
  if (manual && manual.length) return new Set(manual);

  const n = Math.max(1, Math.min(3, wordLength - 3));
  const chosen = new Set();

  if (n >= 2) {
    const zeros = pairs.filter((p) => p.target === 0);
    if (zeros.length) {
      const sameShape =
        zeros.find((p) => classOf(p.leftChar) === classOf(p.rightChar)) || zeros[0];
      chosen.add(sameShape.letterIndex);
    }
  }

  const ranked = [...pairs].sort(
    (a, b) => Math.abs(b.target) - Math.abs(a.target)
  );
  for (const p of ranked) {
    if (chosen.size >= n) break;
    chosen.add(p.letterIndex);
  }
  return chosen;
}

// ---------------------------------------------------------------------------
// 5. Word processing
// ---------------------------------------------------------------------------

function buildWordEntry(font, word, manualEditable) {
  const pairs = [];
  for (let i = 0; i < word.length - 1; i++) {
    const leftChar = word[i];
    const rightChar = word[i + 1];
    const target = kernOfPair(font, leftChar, rightChar);
    if (target === null) {
      return { error: `pair ${leftChar}·${rightChar} forms a ligature — can't measure` };
    }
    pairs.push({ leftChar, rightChar, letterIndex: i + 1, target });
  }

  const editable = pickEditable(pairs, manualEditable, word.length);
  const finalPairs = pairs.map((p) => {
    const entry = { ...p, editable: editable.has(p.letterIndex) };
    if (entry.editable) entry.category = categoryOf(p.leftChar, p.rightChar);
    // key order to match existing words.json entries
    return {
      leftChar: entry.leftChar,
      rightChar: entry.rightChar,
      letterIndex: entry.letterIndex,
      target: entry.target,
      editable: entry.editable,
      ...(entry.category ? { category: entry.category } : {}),
    };
  });

  return { word, pairs: finalPairs };
}

function reportWord(entry) {
  console.log(`\n  ${entry.word}  (tier ${entry.word.length})`);
  for (const p of entry.pairs) {
    const value = String(p.target).padStart(4);
    const mark = p.editable ? ` EDITABLE  ${p.category}` : '';
    console.log(`    ${p.leftChar}·${p.rightChar}  ${value}${mark}`);
  }
}

// ---------------------------------------------------------------------------
// 6. CLI
// ---------------------------------------------------------------------------

function loadCandidates() {
  if (!fs.existsSync(CANDIDATES_FILE)) return [];
  const raw = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
  const list = Array.isArray(raw) ? raw : raw.words || [];
  return list.map((item) =>
    typeof item === 'string' ? { word: item } : item
  );
}

function main() {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const fontArg = args.find((a) => a.startsWith('--font='));
  const explicitFont = fontArg ? fontArg.slice('--font='.length) : null;
  const adHocWords = args.filter((a) => !a.startsWith('--'));

  const fontFile = resolveFont(explicitFont);
  const font = fontkit.create(fs.readFileSync(fontFile));
  console.log(`Font: ${font.fullName || font.postscriptName || path.basename(fontFile)}`);
  console.log(`File: ${fontFile}`);
  console.log(`Units/em: ${font.unitsPerEm}${font.unitsPerEm !== 1000 ? '  ⚠ expected 1000 — values may not match the browser!' : ''}`);

  const candidates = adHocWords.length
    ? adHocWords.map((word) => ({ word }))
    : loadCandidates();
  if (!candidates.length) {
    console.log('\nNo candidate words. Edit scripts/words-candidates.json or pass words as arguments.');
    return;
  }

  const wordsData = JSON.parse(fs.readFileSync(WORDS_FILE, 'utf8'));
  const existing = new Set();
  for (const tierWords of Object.values(wordsData)) {
    for (const w of tierWords) existing.add(w.word.toLowerCase());
  }

  const newEntries = [];
  const skipped = [];
  for (const { word, editable } of candidates) {
    if (!/^[A-Za-z]{4,}$/.test(word)) {
      skipped.push({ word, reason: 'must be 4+ letters, A–Z only' });
      continue;
    }
    if (existing.has(word.toLowerCase())) {
      skipped.push({ word, reason: 'already in words.json' });
      continue;
    }
    const result = buildWordEntry(font, word, editable);
    if (result.error) skipped.push({ word, reason: result.error });
    else newEntries.push(result);
  }

  console.log(`\n${newEntries.length} new word(s) extracted:`);
  for (const entry of newEntries) reportWord(entry);

  if (skipped.length) {
    console.log(`\nSkipped:`);
    for (const s of skipped) console.log(`  ${s.word} — ${s.reason}`);
  }

  if (!write) {
    console.log('\nDry run — nothing written. Re-run with --write to add these words to src/data/words.json.');
    return;
  }
  if (!newEntries.length) {
    console.log('\nNothing to write.');
    return;
  }

  // backup, then merge
  fs.copyFileSync(WORDS_FILE, WORDS_FILE + '.bak');
  for (const entry of newEntries) {
    const tier = String(entry.word.length);
    if (!wordsData[tier]) wordsData[tier] = [];
    wordsData[tier].push(entry);
  }
  fs.writeFileSync(WORDS_FILE, JSON.stringify(wordsData, null, 2) + '\n');

  console.log('\nWrote src/data/words.json (backup: words.json.bak).');
  for (const tier of Object.keys(wordsData).sort()) {
    console.log(`  tier ${tier}: ${wordsData[tier].length} words`);
  }
}

main();
