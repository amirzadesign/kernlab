import './styles/base.css';
import './styles/components.css';

// This is a deliberately minimal first render — just enough to prove
// the dev server, fonts, and palette are all wired up correctly.
// The real game (TopBar, Stage, Controls, etc.) gets built on top
// of this in the next steps, piece by piece.

const app = document.getElementById('app');

app.innerHTML = `
  <div class="app" style="align-items:center; justify-content:center; text-align:center;">
    <div>
      <div style="color:var(--color-accent); font-size:14px; font-weight:700; letter-spacing:1px;">
        KERNLAB
      </div>
      <div style="font-family:var(--font-serif); font-size:64px; font-weight:600; margin-top:24px;">
        Type
      </div>
      <div style="color:var(--color-text-faint); font-size:12px; margin-top:16px;">
        v0.1 — scaffold running. The real game starts here.
      </div>
    </div>
  </div>
`;
