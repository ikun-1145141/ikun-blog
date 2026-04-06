#!/usr/bin/env node
// ── Blog build script ──────────────────────────────────────────────────────
// Reads   blog/docs/*.md
// Outputs posts/{slug}.html  +  src/generated/posts-manifest.ts

import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync, cpSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import { marked } from 'marked';

const __dir = dirname(fileURLToPath(import.meta.url));
const ROOT  = join(__dir, '..');
const DOCS  = join(ROOT, 'blog', 'docs');
const POSTS = join(ROOT, 'posts');
const GEN   = join(ROOT, 'src', 'generated');

// ── Ensure output directories ──────────────────────────────────────────────
[POSTS, GEN].forEach(d => mkdirSync(d, { recursive: true }));

// ── Copy blog/assets → public/blog/assets ─────────────────────────────────
const BLOG_ASSETS = join(ROOT, 'blog', 'assets');
if (existsSync(BLOG_ASSETS)) {
  const dest = join(ROOT, 'public', 'blog', 'assets');
  mkdirSync(dest, { recursive: true });
  cpSync(BLOG_ASSETS, dest, { recursive: true, force: true });
}

// ── Post-process rendered HTML ─────────────────────────────────────────────
function processHtml(html) {
  // GitHub-style alerts: > [!NOTE] / > [!WARNING] / > [!TIP]
  html = html.replace(
    /<blockquote>\n?<p>\[!(NOTE|WARNING|TIP)\]([\s\S]*?)<\/p>\n?<\/blockquote>/gi,
    (_, type, text) => {
      const t    = type.toLowerCase();
      const icon = t === 'warning' ? 'warning' : t === 'tip' ? 'lightbulb' : 'info';
      return `<div class="callout"><span class="material-symbols-rounded">${icon}</span><div class="callout__text">${text.trim()}</div></div>`;
    },
  );

  // Wrap fenced code blocks with language badge
  html = html.replace(
    /<pre><code class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/g,
    (_, lang, code) =>
      `<div class="code-block"><span class="code-block__lang">${lang}</span><pre><code>${code}</code></pre></div>`,
  );

  return html;
}

// ── HTML page template ─────────────────────────────────────────────────────
function buildPage(meta, bodyHtml) {
  const { title, date, tags = [], excerpt = '', readtime = 5 } = meta;
  const dateStr  = (() => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('zh-CN', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  })();
  const tagsHtml = tags.map(t =>
    `<span class="post-meta__tag">${t}</span>`
  ).join('\n          ');

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${excerpt.replace(/"/g, '&quot;')}" />
  <title>${title} | ikun两年半</title>

  <!-- Fonts (via ikun114 proxy) -->
  <link rel="preconnect" href="https://fonts.ikun114.top" />
  <link
    href="https://fonts.ikun114.top/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap"
    rel="stylesheet"
  />
  <link
    href="https://fonts.ikun114.top/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@24,400,1,0"
    rel="stylesheet"
  />

  <script type="module" src="/src/posts/post.ts"></script>
</head>
<body>

  <!-- ═══ Top App Bar ═════════════════════════════════════════════ -->
  <header class="top-bar" id="topBar">
    <a href="/" class="top-bar__logo" style="text-decoration:none">
      ikun<span>·</span>blog
    </a>
    <a href="/#blog" class="top-bar__link" title="博客">
      <span class="material-symbols-rounded" style="font-size:22px">article</span>
    </a>
    <a href="https://github.com/ikun-1145141" target="_blank" rel="noopener"
       class="top-bar__link" title="GitHub" style="margin-left:4px">
      <span class="material-symbols-rounded" style="font-size:22px">code</span>
    </a>
  </header>

  <!-- ═══ Post ════════════════════════════════════════════════════ -->
  <div class="post-page">

    <div class="post-header">
      <div class="post-meta">
          ${tagsHtml}
        <span class="post-meta__date">
          <span class="material-symbols-rounded" style="font-size:15px">calendar_today</span>
          ${dateStr}
        </span>
        <span class="post-meta__readtime">
          <span class="material-symbols-rounded" style="font-size:15px">schedule</span>
          约 ${readtime} 分钟
        </span>
      </div>
      <h1 class="post-header__title">${title}</h1>
      <p class="post-header__subtitle">${excerpt}</p>
    </div>

    <article class="post-body">
      <a href="/" class="post-back">
        <span class="material-symbols-rounded" style="font-size:18px">arrow_back</span>
        返回首页
      </a>

      ${bodyHtml}

      <hr />
      <a href="/" class="post-back">
        <span class="material-symbols-rounded" style="font-size:18px">arrow_back</span>
        返回首页
      </a>
    </article>
  </div>

  <!-- ═══ Footer ═══════════════════════════════════════════════════ -->
  <footer>
    <p class="footer__main">ikun两年半 · 个人博客</p>
    <p class="footer__copy">
      © 2026 ikun-1145141 · Powered by Cloudflare Pages · Material Design 3 Expressive
    </p>
  </footer>

  <!-- ═══ FAB: scroll-to-top ═══════════════════════════════════════ -->
  <button class="fab" id="fab" aria-label="回到顶部">
    <span class="material-symbols-rounded">arrow_upward</span>
  </button>

</body>
</html>`;
}

// ── Process each .md file ──────────────────────────────────────────────────
if (!existsSync(DOCS)) {
  console.log('blog/docs/ not found — nothing to build.');
  process.exit(0);
}

const files    = readdirSync(DOCS).filter(f => f.endsWith('.md'));
const manifest = [];

for (const file of files) {
  const slug              = basename(file, '.md');
  const src               = readFileSync(join(DOCS, file), 'utf-8');
  const { data, content } = matter(src);
  const bodyHtml          = processHtml(String(marked.parse(content)));

  const meta = {
    slug,
    title:    String(data.title    ?? slug),
    date:     (data.date instanceof Date
                ? data.date.toISOString()
                : String(data.date ?? '')).slice(0, 10) || '1970-01-01',
    tags:     Array.isArray(data.tags) ? data.tags.map(String) : [],
    excerpt:  String(data.excerpt  ?? ''),
    readtime: Number(data.readtime ?? 5),
  };

  writeFileSync(join(POSTS, `${slug}.html`), buildPage(meta, bodyHtml));
  manifest.push(meta);
}

manifest.sort((a, b) => b.date.localeCompare(a.date));

const manifestSrc = `// AUTO-GENERATED by scripts/build-blog.js — do not edit manually
export interface PostMeta {
  slug:     string;
  title:    string;
  date:     string;
  tags:     string[];
  excerpt:  string;
  readtime: number;
}

export const POSTS_MANIFEST: PostMeta[] = ${JSON.stringify(manifest, null, 2)};
`;

writeFileSync(join(GEN, 'posts-manifest.ts'), manifestSrc);
console.log(`✓ ${files.length} post(s) built → posts/  +  src/generated/posts-manifest.ts`);
