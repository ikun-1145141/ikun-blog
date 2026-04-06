# ikun-blog

> ikun两年半的个人博客 —— 永远相信美好的事情即将发生 🏀

## 技术栈

- **TypeScript** + **Vite 5** — 模块化架构，零框架依赖
- **Material Design 3 Expressive** — 自实现，纯 CSS Design Tokens
- **Cloudflare Pages** — 部署托管

## 项目结构

```
ikun-blog/
├── index.html           # Vite 入口（纯骨架，无内联样式/脚本）
├── blog/
│   ├── docs/            # ✍️  在这里写博客（Markdown 文件）
│   └── assets/          # 博客文章引用的图片等资源
├── scripts/
│   └── build-blog.js    # MD → HTML 构建脚本（gray-matter + marked）
├── posts/               # 构建产物，自动生成，勿手动编辑（已 .gitignore）
├── public/
│   └── _headers         # Cloudflare Pages 安全响应头
├── src/
│   ├── config.ts        # 全局常量：GitHub 用户名、代理地址、项目/服务数据
│   ├── main.ts          # 应用入口
│   ├── generated/
│   │   └── posts-manifest.ts  # 文章索引，由 build-blog.js 自动生成
│   ├── api/
│   │   └── github.ts    # GitHub API（via 自建代理 github.ikun114.top）
│   ├── ui/
│   │   ├── scroll.ts    # TopBar 高亮 + FAB + Scroll Reveal
│   │   ├── stats.ts     # GitHub 动态统计 + count-up 动画
│   │   ├── projects.ts  # 项目卡片渲染
│   │   ├── services.ts  # 服务卡片渲染
│   │   └── blog.ts      # 博客卡片渲染（读 posts-manifest）
│   └── styles/
│       ├── tokens.css   # M3 Design Tokens（亮色/暗色自动切换）
│       ├── base.css     # Reset + body
│       ├── layout.css   # Section 容器 + 响应式栅格
│       ├── components.css
│       ├── animations.css
│       └── post.css     # 文章页专属样式
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 本地开发

```bash
npm install
npm run dev        # 启动开发服务器 http://localhost:5173
```

## 构建 & 部署

```bash
npm run build      # 生产构建 → dist/
npm run typecheck  # 仅 TypeScript 类型检查
npm run preview    # 预览构建产物
```

**Cloudflare Pages 配置：**

| 设置 | 值 |
|------|----|
| 构建命令 | `npm run build` |
| 输出目录 | `dist` |

## 写博客

### 1. 新建 Markdown 文件

在 `blog/docs/` 下新建 `{slug}.md`，slug 即文章的 URL 路径名（仅用英文、数字和连字符）。

文件开头写 frontmatter：

```yaml
---
title: 文章标题
date: 2026-04-08
tags: [教程, TypeScript]
excerpt: 显示在首页卡片的一句话摘要
readtime: 5        # 预计阅读分钟数
---

正文内容（标准 Markdown）……
```

### 2. 放置资源（可选）

需要在文章中引用的图片等资源放入 `blog/assets/`，在 MD 中引用：

```markdown
![描述](/blog/assets/your-image.png)
```

### 3. 构建发布

```bash
npm run build       # 自动执行 build:blog → vite build，生成 dist/
# 或仅预览 HTML 效果
npm run build:blog  # 仅生成 posts/*.html 和 posts-manifest.ts
```

`build:blog` 脚本（`scripts/build-blog.js`）会：

- 将每篇 MD 渲染为 `posts/{slug}.html`
- 更新 `src/generated/posts-manifest.ts`，首页文章卡片随之自动刷新
- 将 `blog/assets/` 复制到 `public/blog/assets/`

`posts/*.html` 和 `public/blog/assets/` 已加入 `.gitignore`，提交时只需提交 `blog/docs/*.md` 源文件。

> **支持的 Markdown 扩展：**
> - 围栏代码块自动添加语言标签（`` ```typescript ``）
> - GitHub-style 警示块：`> [!NOTE]` / `> [!WARNING]` / `> [!TIP]`

## 添加/修改项目 or 服务

编辑 `src/config.ts` 中的 `PROJECTS` 或 `SERVICES` 数组即可，页面自动重新渲染，无需改 HTML。

## 自建服务

| 服务 | 地址 | 说明 |
|------|------|------|
| Google Fonts 代理 | [fonts.ikun114.top](https://fonts.ikun114.top) | Google Fonts 及 Material Symbols 字体图标中转，本站字体由此加速 |
| GitHub API 代理 | [github.ikun114.top](https://github.ikun114.top) | GitHub REST API 中转，本站 Stats 数据由此驱动 |
| Gemini API 代理 | [gemini.ikun114.top](https://gemini.ikun114.top) | Google Gemini 官方 API 中转 |
| Gemini CLI 代理 | [cli.ikun114.top](https://cli.ikun114.top) | Gemini CLI API 中转，配合 cli-balance-lite 使用 |

## License

[AGPL-3.0](./LICENSE) © 2026 ikun-1145141
