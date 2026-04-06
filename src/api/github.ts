import { GH_PROXY_BASE, GH_USER } from '../config';

// ── Types ─────────────────────────────────────────────────────────
interface Repo {
  stargazers_count: number;
}

interface PushEvent {
  type: string;
  payload?: { size?: number };
}

// ── Cache ─────────────────────────────────────────────────────────
const CACHE_KEY = 'gh_stats_cache';
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  ts: number;
  totalStars: number;
  totalRepos: number;
  commits: number;
}

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL) return null;
    return entry;
  } catch { return null; }
}

function writeCache(entry: Omit<CacheEntry, 'ts'>): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...entry, ts: Date.now() }));
  } catch { /* storage quota — ignore */ }
}

// ── Core fetch (direct → proxy fallback) ──────────────────────────
async function ghFetch<T>(path: string): Promise<T> {
  const directUrl = `https://api.github.com${path}`;
  const proxyUrl  = `${GH_PROXY_BASE}${path}`;

  for (const url of [directUrl, proxyUrl]) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (res.ok) return res.json() as Promise<T>;
    } catch { /* network error — try next */ }
  }

  throw new Error(`GitHub fetch failed for ${path}`);
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

/** Fetch all stats — returns cached result if fresh, otherwise fetches & caches. */
export async function fetchAllStats(): Promise<{
  totalStars: number;
  totalRepos: number;
  commits: number;
}> {
  const cached = readCache();
  if (cached) {
    return { totalStars: cached.totalStars, totalRepos: cached.totalRepos, commits: cached.commits };
  }

  const [repoStats, commits] = await Promise.all([
    fetchRepoStats(),
    fetchRecentCommits(),
  ]);

  writeCache({ totalStars: repoStats.totalStars, totalRepos: repoStats.totalRepos, commits });
  return { totalStars: repoStats.totalStars, totalRepos: repoStats.totalRepos, commits };
}

