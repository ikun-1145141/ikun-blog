import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/post.css';

const topBar = document.getElementById('topBar');
const fab    = document.getElementById('fab') as HTMLButtonElement | null;

// ── Left-side TOC ──────────────────────────────────────────────────
const article  = document.querySelector<HTMLElement>('.post-body');
const headings = article
  ? Array.from(article.querySelectorAll<HTMLHeadingElement>('h2, h3'))
  : [];

headings.forEach((h, i) => { if (!h.id) h.id = `h-toc-${i}`; });

let tocItems:    HTMLElement[]    = [];
let tocRailFill: HTMLElement | null = null;
let tocLabel:    HTMLElement | null = null;
let tocEl:       HTMLElement | null = null;

if (headings.length >= 2) {
  tocEl = document.createElement('nav');
  tocEl.className = 'toc';
  tocEl.setAttribute('aria-label', '文章目录');

  // Progress rail (visual only)
  const rail     = document.createElement('div');
  rail.className = 'toc__rail';
  const railFill = document.createElement('div');
  railFill.className = 'toc__rail-fill';
  rail.appendChild(railFill);
  tocRailFill = railFill;

  // Percentage label below the rail
  const lbl = document.createElement('div');
  lbl.className = 'toc__pct';
  lbl.textContent = '0%';
  tocLabel = lbl;

  // Rail column: track + label
  const railCol = document.createElement('div');
  railCol.className = 'toc__rail-col';
  railCol.appendChild(rail);
  railCol.appendChild(lbl);

  // Heading list
  const list = document.createElement('ul');
  list.className = 'toc__list';

  headings.forEach(h => {
    const li  = document.createElement('li');
    li.className = `toc__item toc__item--${h.tagName.toLowerCase()}`;

    const dot  = document.createElement('span');
    dot.className = 'toc__dot';

    const text = document.createElement('span');
    text.className = 'toc__text';
    text.textContent = h.textContent ?? '';

    li.appendChild(dot);
    li.appendChild(text);
    li.addEventListener('click', () =>
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
    );

    list.appendChild(li);
    tocItems.push(li);
  });

  tocEl.appendChild(railCol);
  tocEl.appendChild(list);
  document.body.appendChild(tocEl);
}

// ── Scroll handler ─────────────────────────────────────────────────
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  topBar?.classList.toggle('raised', y > 40);
  fab?.classList.toggle('show', y > 300);

  if (!tocEl || headings.length < 2) return;

  tocEl.classList.toggle('visible', y > 120);

  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const pct  = docH > 0 ? Math.round((y / docH) * 100) : 0;

  if (tocRailFill) tocRailFill.style.height = `${pct}%`;
  if (tocLabel)    tocLabel.textContent = `${pct}%`;

  // Highlight active heading
  let activeIdx = 0;
  const threshold = window.innerHeight * 0.40;
  for (let i = 0; i < headings.length; i++) {
    if (headings[i].getBoundingClientRect().top <= threshold) activeIdx = i;
  }
  tocItems.forEach((item, i) => {
    item.classList.toggle('active', i === activeIdx);
    item.classList.toggle('passed', i < activeIdx);
  });
}, { passive: true });

fab?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));


