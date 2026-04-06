import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/post.css';

const topBar = document.getElementById('topBar');
const fab    = document.getElementById('fab') as HTMLButtonElement | null;

// ── Reading progress ───────────────────────────────────────────────
const progress = document.createElement('div');
progress.className = 'reading-progress';
progress.innerHTML = `
  <div class="reading-progress__track">
    <div class="reading-progress__fill" id="prog-fill"></div>
  </div>
  <div class="reading-progress__label" id="prog-label">0%</div>
`;
document.body.appendChild(progress);

const fill  = document.getElementById('prog-fill')  as HTMLElement;
const label = document.getElementById('prog-label') as HTMLElement;

window.addEventListener(
  'scroll',
  () => {
    const y   = window.scrollY;
    topBar?.classList.toggle('raised', y > 40);
    fab?.classList.toggle('show', y > 300);

    const docH   = document.documentElement.scrollHeight - window.innerHeight;
    const pct    = docH > 0 ? Math.round((y / docH) * 100) : 0;
    fill.style.height  = `${pct}%`;
    label.textContent  = `${pct}%`;
    progress.classList.toggle('visible', y > 120);
  },
  { passive: true },
);

fab?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
