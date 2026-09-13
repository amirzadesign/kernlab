import './styles/base.css';
import './styles/components.css';

import { getState, subscribe } from './store.js';
import { initRound, loadPersistedStreak } from './actions.js';
import { bindEvents } from './lib/events.js';
import { initOnboarding } from './onboarding.js';

import { TopBar } from './components/TopBar.js';
import { Stage } from './components/Stage.js';
import { Controls } from './components/Controls.js';
import { ScorePanel } from './components/ScorePanel.js';

const app = document.getElementById('app');

// Full-viewport, full-width layout: TopBar and ScorePanel already use
// justify-content:space-between with edge padding, so removing this
// outer width cap naturally sends the logo/hamburger and score/done
// to the true browser edges, with horizontal rules running full width.
// Stage still centers the word within whatever space is left, so it
// doesn't stretch oddly on very wide screens.
function render(state) {
  app.innerHTML = `
    <div
      style="
        display: flex;
        flex-direction: column;
        height: 100dvh;
        width: 100%;
        background: var(--color-bg);
        overflow: hidden;
      "
    >
      ${TopBar(state)}
      <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
        ${Stage(state)}
      </div>
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
initOnboarding();