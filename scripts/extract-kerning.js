// Run manually (or on font update) with: node scripts/extract-kerning.js
//
// Job: parse the chosen Google Font files (Source Serif 4, Source Sans 3)
// with opentype.js, pull each letter pair's GPOS kerning value, and write
// the results to src/data/kerning-serif.json / kerning-sans.json.
//
// This runs once at build/update time, NOT in the browser at runtime —
// keeps the shipped game lightweight and avoids parsing font binaries
// on every page load.
//
// Placeholder for now — filled in once we've downloaded the actual
// font files to parse.
