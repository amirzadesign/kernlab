// SharePopup.js -- terminal-styled share menu.
//
// Rendered into document.body (NOT inside #app) because #app is wiped
// and rebuilt on every state change; the popup has to survive that.
// The card PNG is generated once when the popup opens and cached, so
// the menu actions (download/copy/share) can fire synchronously
// inside the user's click gesture -- Safari rejects clipboard writes
// that happen after an await outside a gesture.

import { getState } from '../store.js';
import { generateShareCard } from '../lib/shareCard.js';

let backdropEl = null;
let statusEl = null;
let cachedCard = null;   // { blob, dataUrl, filename }
let cardError = null;

function setStatus(msg, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = msg;
  statusEl.style.color = isError ? 'var(--color-danger)' : 'var(--color-accent)';
}

function buildMenu(canNativeShare) {
  const item = (action, label) => `
    <button class="share-item" data-share-action="${action}">
      <span class="share-slash">\</span>${label}
    </button>
  `;

  return `
    <div class="share-popup" role="dialog" aria-label="Share your result">
      <div class="share-title">// share result</div>
      ${item('download', 'download png')}
      ${item('copy', 'copy image')}
      ${canNativeShare ? item('native', 'share…') : ''}
      ${item('close', 'close')}
      <div class="share-status" data-share-status>preparing card…</div>
    </div>
  `;
}

function close() {
  if (!backdropEl) return;
  backdropEl.remove();
  backdropEl = null;
  statusEl = null;
  cachedCard = null;
  cardError = null;
  document.removeEventListener('keydown', onKeydown);
}

function onKeydown(e) {
  if (e.key === 'Escape') close();
}

async function handleAction(action) {
  if (action === 'close') return close();

  if (cardError || !cachedCard) {
    setStatus(cardError || 'card not ready yet…', true);
    return;
  }

  const { blob, filename } = cachedCard;

  if (action === 'download') {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    setStatus('saved ✓');
    return;
  }

  if (action === 'copy') {
    try {
      if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
        throw new Error('unsupported');
      }
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      setStatus('copied ✓');
    } catch (err) {
      setStatus('copy failed — use download', true);
    }
    return;
  }

  if (action === 'native') {
    try {
      const state = getState();
      const file = new File([blob], filename, { type: 'image/png' });
      const shareData = {
        title: 'KernLab',
        text: `I scored ${state.score}/100 kerning "${state.currentWord.word.toLowerCase()}" in KernLab.`,
      };
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
      } else if (navigator.share) {
        await navigator.share(shareData);
      }
      setStatus('shared ✓');
    } catch (err) {
      // User cancelling the share sheet also lands here -- not an error
      // worth shouting about, but show it just in case.
      if (err && err.name !== 'AbortError') setStatus('share failed', true);
    }
  }
}

export async function openSharePopup() {
  if (backdropEl) return; // already open
  const state = getState();
  if (!state.done || !state.currentWord) return; // nothing to share yet

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  backdropEl = document.createElement('div');
  backdropEl.className = 'share-backdrop';
  backdropEl.innerHTML = buildMenu(canNativeShare);
  document.body.appendChild(backdropEl);

  statusEl = backdropEl.querySelector('[data-share-status]');

  // Backdrop click closes; clicks inside the popup don't bubble up.
  backdropEl.addEventListener('click', (e) => {
    if (e.target === backdropEl) return close();
    const btn = e.target.closest('[data-share-action]');
    if (btn) handleAction(btn.dataset.shareAction);
  });
  document.addEventListener('keydown', onKeydown);

  // Generate the card AFTER the menu is visible so the user sees
  // something immediately.
  try {
    cachedCard = await generateShareCard(state);
    setStatus('card ready — pick an option');
  } catch (err) {
    cardError = 'could not generate card';
    setStatus(cardError, true);
  }
}
