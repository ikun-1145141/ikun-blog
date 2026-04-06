---
title: GitHub 代理怎么用
date: 2026-04-07
tags: [教程, GitHub, Cloudflare]
excerpt: github.ikun114.top 使用完全指南——GitHub REST API 中转与原始文件加速，一行替换，开箱即用。
readtime: 5
---

## 背景

国内直连 GitHub 时延高、偶发失败，REST API 尤其容易出现 `ERR_CONNECTION_TIMED_OUT`。**github.ikun114.top** 是我用 Cloudflare Workers 搭建的开放反向代理，部署在全球边缘节点，国内几乎秒响应。

目前支持两类代理：

- GitHub REST API（`api.github.com`）
- GitHub 原始文件（`raw.githubusercontent.com`）

> [!NOTE]
> 代理完全开放，无需注册或申请密钥，直接使用即可。

## URL 规则

所有请求遵循统一格式，规律非常简单：

```
https://github.ikun114.top/{原始主机}/{路径?查询参数}
```

把原始 URL 中 `https://` 之后、路径之前的主机名，替换为 `github.ikun114.top/{原始主机}` 即可。路径和查询参数**完全保持不变**。

## 代理 GitHub REST API

把 `https://api.github.com` 换成 `https://github.ikun114.top/api.github.com`：

```
# 原始（国内高延迟 / 超时）
GET https://api.github.com/users/ikun-1145141

# 代理（国内秒响应）
GET https://github.ikun114.top/api.github.com/users/ikun-1145141
```

### JavaScript / TypeScript

```typescript
const GH = 'https://github.ikun114.top/api.github.com';

// 获取用户信息
const user = await fetch(`${GH}/users/ikun-1145141`).then(r => r.json());

// 获取仓库列表
const repos = await fetch(`${GH}/users/ikun-1145141/repos?per_page=30`)
  .then(r => r.json());

// 获取指定仓库信息
const repo = await fetch(`${GH}/repos/ikun-1145141/desktop_pet_scheduler`)
  .then(r => r.json());
console.log(repo.stargazers_count); // Star 数
```

### curl

```bash
# 查用户信息
curl https://github.ikun114.top/api.github.com/users/ikun-1145141

# 查仓库并格式化输出
curl https://github.ikun114.top/api.github.com/repos/ikun-1145141/desktop_pet_scheduler \
  | python3 -m json.tool
```

### Python

```python
import requests

PROXY = 'https://github.ikun114.top/api.github.com'

resp = requests.get(f'{PROXY}/users/ikun-1145141')
data = resp.json()
print(f"公开仓库数：{data['public_repos']}")
```

## 代理 GitHub 原始文件

GitHub 原始文件下载走 `raw.githubusercontent.com`，国内经常超时断连。代理方式完全一致：把主机名换掉即可。

```
# 原始（国内经常失败）
https://raw.githubusercontent.com/ikun-1145141/desktop_pet_scheduler/main/README.md

# 代理（稳定访问）
https://github.ikun114.top/raw.githubusercontent.com/ikun-1145141/desktop_pet_scheduler/main/README.md
```

### 通用替换函数（TypeScript）

```typescript
/** 将 GitHub URL 一键转为代理 URL */
function toProxy(url: string): string {
  return url.replace(
    /^https:\/\/(api\.github\.com|raw\.githubusercontent\.com)/,
    'https://github.ikun114.top/$1'
  );
}

// 示例
toProxy('https://api.github.com/users/ikun-1145141');
// → 'https://github.ikun114.top/api.github.com/users/ikun-1145141'

toProxy('https://raw.githubusercontent.com/owner/repo/main/file.ts');
// → 'https://github.ikun114.top/raw.githubusercontent.com/owner/repo/main/file.ts'
```

## 速率限制

代理不注入认证 Token，对 GitHub 来说属于**未认证请求**，遵循 GitHub 官方默认限速：

| 请求类型 | 速率上限 |
|---|---|
| 未认证（默认） | 60 次 / 小时 / IP |
| 携带 `Authorization: Bearer <token>` | 5,000 次 / 小时 / Token |

如果调用量较大，可以在请求头附上自己的 GitHub PAT，代理会原样透传所有 header：

```
GET https://github.ikun114.top/api.github.com/user/repos
Authorization: Bearer ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> [!WARNING]
> 不建议把 PAT 硬编码进前端代码——访客可通过浏览器开发者工具看到。大量 API 需求建议走自己的后端附加 Token。

## 速查表

| 场景 | 原主机 | 代理写法 |
|---|---|---|
| REST API | `api.github.com` | `github.ikun114.top/api.github.com/…` |
| 原始文件 | `raw.githubusercontent.com` | `github.ikun114.top/raw.githubusercontent.com/…` |

代理免费开放，无需注册。如果对你有帮助，欢迎给仓库点个 Star ⭐
