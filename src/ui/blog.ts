import { POSTS_MANIFEST, type PostMeta } from '../generated/posts-manifest';

function postCardHTML(p: PostMeta): string {
  const tags    = p.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const dateStr = new Date(p.date).toLocaleDateString('zh-CN', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  return /* html */`
    <a class="post-card reveal" href="/posts/${p.slug}.html">
      <div class="post-card__date">
        <span class="material-symbols-rounded" style="font-size:14px">calendar_today</span>
        ${dateStr}
        <span style="margin-left:6px;opacity:.6">· 约 ${p.readtime} 分钟</span>
      </div>
      <div class="post-card__title">${p.title}</div>
      <div class="post-card__excerpt">${p.excerpt}</div>
      <div class="post-card__footer">
        <div class="post-card__tags">${tags}</div>
        <div class="post-card__read">
          阅读
          <span class="material-symbols-rounded" style="font-size:15px">arrow_forward</span>
        </div>
      </div>
    </a>`;
}

/** Render latest 3 posts into #blog-grid (homepage). */
export function renderBlog(): void {
  const container = document.getElementById('blog-grid');
  if (!container) return;
  if (POSTS_MANIFEST.length === 0) {
    container.innerHTML = '<p style="color:var(--c-on-surface-variant);padding:24px 0">暂无文章，敬请期待。</p>';
    return;
  }
  container.innerHTML = POSTS_MANIFEST.slice(0, 3).map(postCardHTML).join('');
}

export { postCardHTML };
