import '../styles/tokens.css';
import '../styles/base.css';
import '../styles/layout.css';
import '../styles/components.css';
import '../styles/animations.css';
import '../styles/post.css';
import '../styles/list.css';

import { POSTS_MANIFEST } from '../generated/posts-manifest';
import { SERVICES } from '../config';
import { postCardHTML } from '../ui/blog';
import { serviceCardHTML } from '../ui/services';
import { initReveal } from '../ui/scroll';

// ── Top-bar elevation + FAB ────────────────────────────────────────
const topBar = document.getElementById('topBar');
const fab    = document.getElementById('fab') as HTMLButtonElement | null;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  topBar?.classList.toggle('raised', y > 40);
  fab?.classList.toggle('show',     y > 300);
}, { passive: true });

fab?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ── Blog list page ─────────────────────────────────────────────────
const postsGrid = document.getElementById('all-posts-grid');
const filterBar  = document.getElementById('filter-bar');
const emptyTip   = document.getElementById('empty-tip') as HTMLElement | null;

if (postsGrid && filterBar) {
  // Collect all unique tags
  const allTags = [...new Set(POSTS_MANIFEST.flatMap(p => p.tags))].sort();

  allTags.forEach(tag => {
    const btn = document.createElement('button');
    btn.className  = 'filter-btn';
    btn.dataset['tag'] = tag;
    btn.textContent = tag;
    filterBar.appendChild(btn);
  });

  function renderPosts(tag: string): void {
    const list = tag === 'all'
      ? POSTS_MANIFEST
      : POSTS_MANIFEST.filter(p => p.tags.includes(tag));

    if (!postsGrid) return;
    if (list.length === 0) {
      postsGrid.innerHTML = '';
      if (emptyTip) emptyTip.style.display = 'flex';
    } else {
      postsGrid.innerHTML = list.map(postCardHTML).join('');
      if (emptyTip) emptyTip.style.display = 'none';
      initReveal();
    }
  }

  renderPosts('all');

  filterBar.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('filter-btn--active'));
    btn.classList.add('filter-btn--active');
    renderPosts(btn.dataset['tag'] ?? 'all');
  });
}

// ── Services list page ─────────────────────────────────────────────
const servicesGrid = document.getElementById('all-services-grid');
if (servicesGrid) {
  servicesGrid.innerHTML = SERVICES.map(serviceCardHTML).join('');
  initReveal();
}

// Always init reveal for static elements
initReveal();
