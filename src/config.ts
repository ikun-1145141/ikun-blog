// ── GitHub ────────────────────────────────────────────────────────
export const GH_USER        = 'ikun-1145141' as const;
/** Custom GitHub API reverse proxy — format: {base}/{path} */
export const GH_PROXY_BASE  = 'https://github.ikun114.top/api.github.com' as const;

// ── Services ──────────────────────────────────────────────────────
export interface Service {
  name:  string;
  url:   string;
  desc:  string;
  emoji: string;
  tag:   string;
  icon:  string; // Material Symbols name
}

export const SERVICES: Service[] = [
  {
    name:  'GitHub API 代理',
    url:   'https://github.ikun114.top',
    desc:  'GitHub REST API 中转代理，解决访问限制，无需额外 Token 提升速率。本站 Stats 数据即由此驱动。',
    emoji: '🐙',
    tag:   'github proxy',
    icon:  'code',
  },
  {
    name:  'Gemini API 代理',
    url:   'https://gemini.ikun114.top',
    desc:  'Google Gemini 官方 API 中转代理，让前沿 AI 能力触手可及，无感接入。',
    emoji: '✨',
    tag:   'gemini proxy',
    icon:  'auto_awesome',
  },
  {
    name:  'Gemini CLI 代理',
    url:   'https://cli.ikun114.top',
    desc:  'Gemini CLI API 中转代理，告别访问障碍。',
    emoji: '☁️',
    tag:   'cli proxy',
    icon:  'terminal',
  },
];

// ── Projects ──────────────────────────────────────────────────────
export interface Project {
  name:   string;
  url:    string;
  desc:   string;
  emoji:  string;
  tags:   string[];
  stars?: number;
  forks?: number;
}

export const PROJECTS: Project[] = [
  {
    name:  'desktop_pet_scheduler',
    url:   'https://github.com/ikun-1145141/desktop_pet_scheduler',
    desc:  'Live2D 桌宠 + LLM 日程管理，让你的桌面助手帮你搞定一切。把 AI 塞进桌宠里，是最有创意的选择。',
    emoji: '🐾',
    tags:  ['TypeScript', 'Python', 'Electron', 'FastAPI', 'Live2D'],
  },
  {
    name:  'mofox-plugin-builder',
    url:   'https://github.com/ikun-1145141/mofox-plugin-builder',
    desc:  '基于积木块的 MoFox 插件可视化构建器，让插件开发像搭积木一样简单直观。',
    emoji: '🔧',
    tags:  ['TypeScript', 'Vue', 'Vite'],
  },
  {
    name:  'cli-balance-lite',
    url:   'https://github.com/ikun-1145141/cli-balance-lite',
    desc:  'Cloudflare Workers 上的 Gemini CLI API 中转代理，轻量又好用。',
    emoji: '☁️',
    tags:  ['JavaScript', 'Cloudflare Workers'],
    stars: 2,
    forks: 1,
  },
];
