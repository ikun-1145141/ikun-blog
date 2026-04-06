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
├── public/
│   └── _headers         # Cloudflare Pages 安全响应头
├── src/
│   ├── config.ts        # 全局常量：GitHub 用户名、代理地址、项目/服务数据
│   ├── main.ts          # 应用入口
│   ├── api/
│   │   └── github.ts    # GitHub API（via 自建代理 github.ikun114.top）
│   ├── ui/
│   │   ├── scroll.ts    # TopBar 高亮 + FAB + Scroll Reveal
│   │   ├── stats.ts     # GitHub 动态统计 + count-up 动画
│   │   ├── projects.ts  # 项目卡片渲染
│   │   └── services.ts  # 服务卡片渲染
│   └── styles/
│       ├── tokens.css   # M3 Design Tokens（亮色/暗色自动切换）
│       ├── base.css     # Reset + body
│       ├── layout.css   # Section 容器 + 响应式栅格
│       ├── components.css
│       └── animations.css
├── vite.config.ts
├── tsconfig.json
└── package.json
```

## 自建服务

| 服务 | 地址 | 说明 |
|------|------|------|
| GitHub API 代理 | [github.ikun114.top](https://github.ikun114.top) | GitHub REST API 中转，本站 Stats 数据由此驱动 |
| Gemini API 代理 | [gemini.ikun114.top](https://gemini.ikun114.top) | Google Gemini 官方 API 中转 |
| Gemini CLI 代理 | [cli.ikun114.top](https://cli.ikun114.top) | Gemini CLI API 中转，配合 cli-balance-lite 使用 |

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

## 添加/修改项目 or 服务

编辑 `src/config.ts` 中的 `PROJECTS` 或 `SERVICES` 数组即可，页面自动重新渲染，无需改 HTML。

## License

[AGPL-3.0](./LICENSE) © 2026 ikun-1145141
