import { GH_PROXY_BASE, GH_USER } from '../config';

// ── Types ─────────────────────────────────────────────────────────
interface Repo {
  stargazers_count: number;
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
 * Count commits authored by GH_USER across all public repos in the last 30 days.
 * More reliable than the events API which only covers public events and caps at 300.
 */
export async function fetchRecentCommits(): Promise<number> {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  // Reuse repos already fetched if possible; otherwise fetch page 1
  let repos: { name: string }[] = [];
  let page = 1;
  while (true) {
    const batch = await ghFetch<{ name: string }[]>(
      `/users/${GH_USER}/repos?type=owner&per_page=100&page=${page}`,
    );
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos = repos.concat(batch);
    if (batch.length < 100) break;
    page++;
  }

  // Fetch commit counts for all repos in parallel
  const counts = await Promise.all(
    repos.map(async repo => {
      try {
        // GitHub returns commits as array; we only need the count
        const commits = await ghFetch<unknown[]>(
          `/repos/${GH_USER}/${repo.name}/commits?author=${GH_USER}&since=${since}&per_page=100`,
        );
        return Array.isArray(commits) ? commits.length : 0;
      } catch { return 0; }
    }),
  );

  return counts.reduce((a, b) => a + b, 0);
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

