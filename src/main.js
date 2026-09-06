import './styles/base.css';
import './styles/components.css';

import { getState, subscribe } from './store.js';
import { initRound, loadPersistedStreak } from './actions.js';
import { bindEvents } from './lib/events.js';

import { TopBar } from './components/TopBar.js';
import { Stage } from './components/Stage.js';
import { Controls } from './components/Controls.js';
import { ScorePanel } from './components/ScorePanel.js';

const app = document.getElementById('app');

function render(state) {
  app.innerHTML = `
    <div
      style="
        background: var(--color-bg);
        border-radius: 12px;
        overflow: hidden;
        border: 0.5px solid var(--color-border);
        max-width: 420px;
        margin: 40px auto;
      "
    >
      ${TopBar(state)}
      ${Stage(state)}
      ${Controls(state)}
      ${ScorePanel(state)}
    </div>
  `;
}

// Re-render on every state change. Event delegation (bindEvents) means
// we only need to bind listeners once -- no rebinding after each
// innerHTML replacement.
subscribe(render);
bindEvents(app);

loadPersistedStreak();
initRound(getState().tier);
render(getState());
