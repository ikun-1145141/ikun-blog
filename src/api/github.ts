import { GH_PROXY_BASE, GH_USER } from '../config';

// ── Types ─────────────────────────────────────────────────────────
interface Repo {
  stargazers_count: number;
}

interface PushEvent {
  type: string;
  payload?: { size?: number };
}

// ── Core fetch (via custom proxy) ─────────────────────────────────
async function ghFetch<T>(path: string): Promise<T> {
  const url = `${GH_PROXY_BASE}${path}`;
  const res  = await fetch(url, {
    headers: { Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) {
    throw new Error(`GitHub proxy ${res.status}: ${url}`);
  }
  return res.json() as Promise<T>;
}

// ── Public API ────────────────────────────────────────────────────

/** Fetch all owned repos (handles pagination) and return star + repo count. */
export async function fetchRepoStats(): Promise<{
  totalStars: number;
  totalRepos: number;
}> {
  let page = 1;
  let totalStars = 0;
  let totalRepos = 0;

  while (true) {
    const repos = await ghFetch<Repo[]>(
      `/users/${GH_USER}/repos?type=owner&per_page=100&page=${page}`,
    );
    if (!Array.isArray(repos) || repos.length === 0) break;
    repos.forEach(r => { totalStars += r.stargazers_count ?? 0; });
    totalRepos += repos.length;
    if (repos.length < 100) break;
    page++;
  }

  return { totalStars, totalRepos };
}

/**
 * Sum commits from recent public PushEvents (up to 3 pages ≈ last ~90 days).
 * Uses the public events endpoint — no auth required.
 */
export async function fetchRecentCommits(): Promise<number> {
  let total = 0;

  for (let page = 1; page <= 3; page++) {
    const events = await ghFetch<PushEvent[]>(
      `/users/${GH_USER}/events/public?per_page=100&page=${page}`,
    );
    if (!Array.isArray(events) || events.length === 0) break;
    events.forEach(e => {
      if (e.type === 'PushEvent') total += e.payload?.size ?? 0;
    });
    if (events.length < 100) break;
  }

  return total;
}
