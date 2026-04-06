import { fetchRepoStats, fetchRecentCommits } from '../api/github';

// ── Helpers ───────────────────────────────────────────────────────

function countUp(el: HTMLElement, target: number, suffix = ''): void {
  el.classList.remove('loading');
  const duration = 1000;
  const start    = performance.now();

  function step(now: number): void {
    const p   = Math.min((now - start) / duration, 1);
    const val = Math.round(p * p * target); // ease-in-quad
    el.textContent = String(val) + suffix;
    if (p < 1) requestAnimationFrame(step);
    else       el.textContent = String(target) + suffix;
  }

  requestAnimationFrame(step);
}

function setError(el: HTMLElement | null): void {
  if (!el) return;
  el.classList.remove('loading');
  el.textContent = 'N/A';
}

// ── Public API ────────────────────────────────────────────────────

/** Fetch GitHub stats via proxy and animate the stat counters. */
export async function initStats(): Promise<void> {
  const elRepos   = document.getElementById('stat-repos');
  const elCommits = document.getElementById('stat-commits');
  const elStars   = document.getElementById('stat-stars');

  try {
    const [repoStats, commits] = await Promise.all([
      fetchRepoStats(),
      fetchRecentCommits(),
    ]);

    if (elRepos)   countUp(elRepos,   repoStats.totalRepos);
    if (elCommits) countUp(elCommits, commits);
    if (elStars)   countUp(elStars,   repoStats.totalStars, ' ★');
  } catch (err) {
    console.warn('[ikun-blog] GitHub stats fetch failed:', err);
    [elRepos, elCommits, elStars].forEach(setError);
  }
}
