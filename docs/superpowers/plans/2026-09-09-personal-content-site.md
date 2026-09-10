# 个人内容网站 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个可通过 Markdown 和 Git 持续发布的个人内容网站，清晰呈现 AI 应用技术分享与交易系统分享。

**Architecture:** `frontend/` 使用 Astro 7 静态生成页面，内容位于本地 Markdown 内容集合，以类型化 schema 校验文章字段。`backend/` 不提供 API 或数据库，只保存 Nginx 模板、部署脚本和自动发布配置；CI 构建后通过受限 SSH 将 `frontend/dist/` 的版本化产物切换到 Nginx 当前发布目录。

**Tech Stack:** Node.js 22 LTS、Astro 7.3.2、TypeScript、Astro Content Collections、Vitest、GitHub Actions、Nginx、Let’s Encrypt。

**Spec:** `docs/superpowers/specs/2026-09-09-personal-content-site-design.md`

## Global Constraints

- 保持为纯静态站，不接入数据库、用户系统、评论、搜索、支付、实时行情或在线后台。
- 全部内容使用 Markdown 并要求 `title`、`description`、`pubDate`、`channel`、`category`、`tags`、`type` 字段。
- 主频道只能为 `ai` 或 `trading`；交易内容默认展示“仅为个人研究与复盘，不构成投资建议”。
- 使用编辑型、低干扰、响应式阅读体验；桌面和手机均可阅读。
- 线上发布失败时必须保留上一成功版本。
- 不在仓库提交服务器 IP、私钥、证书或任何真实密钥；在 GitHub Actions Secrets 保存部署凭据。
- 所有安装步骤优先使用官方源；如网络环境需要镜像，使用可信且版本可核验的中国大陆镜像。
- 不执行 Git 提交、推送、服务器变更或域名解析，除非用户在执行阶段明确确认。
- 除非路径以 `frontend/`、`backend/` 或仓库根目录文件名开头，本文中的 `src/`、`public/`、`tests/`、`dist/` 与 `npm` 命令都以 `frontend/` 为当前目录；`backend/` 仅存放部署和 Nginx 配置，不包含 API 或数据库代码。

---

## 文件结构

```text
.
├─ frontend/
│  ├─ public/
│  ├─ favicon.svg
│  └─ robots.txt
│  ├─ src/
│  ├─ components/
│  │  ├─ ArticleCard.astro          # 长文摘要卡片
│  │  ├─ NoteCard.astro             # 短复盘卡片
│  │  ├─ ChannelNav.astro           # 双频道导航
│  │  ├─ PostMeta.astro             # 日期、标签、阅读时长
│  │  └─ RiskNotice.astro           # 交易内容免责声明
│  ├─ content/
│  │  ├─ ai/                        # AI Markdown 内容
│  │  ├─ trading/                   # 交易 Markdown 内容
│  │  └─ config.ts                  # 内容 schema
│  ├─ layouts/
│  │  ├─ BaseLayout.astro           # 文档框架、站点导航、页脚
│  │  └─ PostLayout.astro           # 文章阅读页
│  ├─ lib/
│  │  ├─ content.ts                 # 查询、排序、筛选和阅读时长
│  │  └─ taxonomy.ts                # 频道与栏目显示文案
│  ├─ pages/
│  │  ├─ index.astro                # 首页
│  │  ├─ about.astro                # 关于页
│  │  ├─ risk-disclosure.astro      # 风险声明页
│  │  ├─ ai/[...slug].astro         # AI 内容详情页
│  │  ├─ trading/[...slug].astro    # 交易内容详情页
│  │  ├─ ai/index.astro             # AI 频道页
│  │  ├─ trading/index.astro        # 交易频道页
│  │  ├─ category/[channel]/[category].astro
│  │  └─ tags/[tag].astro
│  └─ styles/global.css              # 设计 token、排版和响应式样式
│  ├─ tests/
│  ├─ content.test.ts                # 内容查询与排序单元测试
│  └─ taxonomy.test.ts               # 栏目映射单元测试
│  ├─ astro.config.mjs
│  ├─ package.json
│  └─ tsconfig.json
├─ backend/
│  ├─ scripts/deploy.sh               # 服务器端原子切换脚本
│  └─ nginx/site.conf.template        # Nginx 静态站配置模板
├─ .github/workflows/deploy.yml       # 自动构建与发布工作流
└─ README.md
```

## Task 1: 初始化 Astro 项目与质量命令

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/astro.config.mjs`
- Create: `frontend/tsconfig.json`
- Create: `frontend/src/pages/index.astro`
- Create: `frontend/src/styles/global.css`
- Create: `frontend/tests/smoke.test.ts`
- Create: `.gitignore`

**Interfaces:**
- Produces: `npm run dev`、`npm run check`、`npm run test` 和 `npm run build` 四个可重复执行的项目命令。
- Consumes: Node.js 22 LTS 与 npm。

- [ ] **Step 1: 创建最小 Astro 配置和失败的 smoke 测试**

```ts
// tests/smoke.test.ts
import { describe, expect, it } from 'vitest';

describe('site configuration', () => {
  it('uses the expected site URL', async () => {
    const config = await import('../astro.config.mjs');
    expect(config.default.site).toBe('https://example.com');
  });
});
```

- [ ] **Step 2: 运行测试确认当前失败**

Run: `npm run test -- --run tests/smoke.test.ts`

Expected: FAIL，因为 `package.json`、测试命令与 Astro 配置尚不存在。

- [ ] **Step 3: 创建项目配置并实现最小首页**

```json
{
  "scripts": {
    "dev": "astro dev",
    "check": "astro check",
    "test": "vitest run",
    "build": "astro build"
  },
  "devDependencies": {
    "@astrojs/check": "^0.9.4",
    "astro": "^7.3.2",
    "typescript": "^5.9.3",
    "vitest": "^4.0.0"
  }
}
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
});
```

```astro
---
import '../styles/global.css';
---
<main><h1>知行之间</h1></main>
```

- [ ] **Step 4: 添加依赖并验证四个质量命令**

Run: `npm install && npm run test && npm run check && npm run build`

Expected: 全部通过，且 `dist/index.html` 已生成。

- [ ] **Step 5: 供用户确认后提交本任务已暂存文件**

Run: `git add package.json package-lock.json astro.config.mjs tsconfig.json src tests .gitignore && git commit -m "feat: 初始化 Astro 内容站"`

Expected: 仅在用户明确确认后执行；提交前检查最近 5 条提交的语言风格。

## Task 2: 定义内容 schema、栏目映射与示例内容

**Files:**
- Create: `src/content/config.ts`
- Create: `src/lib/taxonomy.ts`
- Create: `src/content/ai/ai-coding-workflow.md`
- Create: `src/content/trading/weekly-system-review.md`
- Create: `tests/taxonomy.test.ts`

**Interfaces:**
- Produces: `PostData`、`CHANNELS`、`CATEGORIES`，供所有页面和组件读取。
- Consumes: Task 1 的 Astro Content Collections 与 TypeScript 配置。

- [ ] **Step 1: 写入栏目映射失败测试**

```ts
import { describe, expect, it } from 'vitest';
import { getCategoryLabel } from '../src/lib/taxonomy';

describe('getCategoryLabel', () => {
  it('maps the ai learning category to Chinese text', () => {
    expect(getCategoryLabel('ai', 'learning')).toBe('个人学习与总结');
  });

  it('rejects a category outside its channel', () => {
    expect(() => getCategoryLabel('trading', 'learning')).toThrow('无效栏目');
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- --run tests/taxonomy.test.ts`

Expected: FAIL，因为 `taxonomy.ts` 尚不存在。

- [ ] **Step 3: 实现 schema 和映射**

```ts
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const postSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  pubDate: z.coerce.date(),
  channel: z.enum(['ai', 'trading']),
  category: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  type: z.enum(['article', 'note']),
  featured: z.boolean().default(false),
  pinned: z.boolean().default(false),
  riskDisclosure: z.boolean().default(true),
});

const ai = defineCollection({ type: 'content', schema: postSchema });
const trading = defineCollection({ type: 'content', schema: postSchema });

export const collections = { ai, trading };
```

```ts
// src/lib/taxonomy.ts
export const CATEGORIES = {
  ai: { learning: '个人学习与总结', cases: '案例分享' },
  trading: { principles: '交易理念与规则', risk: '风控与仓位管理', review: '交易系统复盘' },
} as const;

export function getCategoryLabel(channel: keyof typeof CATEGORIES, category: string) {
  const label = (CATEGORIES[channel] as Record<string, string>)[category];
  if (!label) throw new Error('无效栏目');
  return label;
}
```

- [ ] **Step 4: 添加两篇符合 schema 的示例 Markdown 并验证**

```md
---
title: 我的 AI Coding 工作流
description: 从需求到上线的个人实践记录。
pubDate: 2026-09-09
channel: ai
category: learning
tags: [AI Coding, 工作流]
type: article
featured: true
pinned: false
---

正文示例。
```

Run: `npm run test && npm run check`

Expected: 所有测试和 Astro 类型检查通过；错误频道或栏目在检查阶段报错。

- [ ] **Step 5: 供用户确认后提交本任务已暂存文件**

Run: `git add src/content src/lib/taxonomy.ts tests/taxonomy.test.ts && git commit -m "feat: 定义内容模型与栏目"`

Expected: 仅在用户明确确认后执行。

## Task 3: 内容查询工具与自动化测试

**Files:**
- Create: `src/lib/content.ts`
- Create: `tests/content.test.ts`

**Interfaces:**
- Produces: `sortPosts(posts)`、`getFeaturedPosts(posts)`、`getRelatedPosts(posts, currentSlug, tags)`、`estimateReadingMinutes(body)`。
- Consumes: Task 2 的 `PostData` 字段和内容集合条目。

- [ ] **Step 1: 编写排序、精选与阅读时长的失败测试**

```ts
import { describe, expect, it } from 'vitest';
import { estimateReadingMinutes, sortPosts } from '../src/lib/content';

describe('content helpers', () => {
  it('sorts newer posts before older posts', () => {
    const posts = [{ data: { pubDate: new Date('2026-01-01') } }, { data: { pubDate: new Date('2026-02-01') } }];
    expect(sortPosts(posts)[0].data.pubDate.toISOString()).toContain('2026-02-01');
  });

  it('rounds Chinese text reading time up to one minute', () => {
    expect(estimateReadingMinutes('字'.repeat(299))).toBe(1);
    expect(estimateReadingMinutes('字'.repeat(301))).toBe(2);
  });
});
```

- [ ] **Step 2: 运行测试确认失败**

Run: `npm run test -- --run tests/content.test.ts`

Expected: FAIL，因为查询工具尚不存在。

- [ ] **Step 3: 实现纯函数内容工具**

```ts
export function sortPosts<T extends { data: { pubDate: Date } }>(posts: T[]) {
  return [...posts].sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());
}

export function estimateReadingMinutes(body: string) {
  return Math.max(1, Math.ceil(body.replace(/\s/g, '').length / 300));
}
```

`getFeaturedPosts` 应先按 `pinned`、再按 `featured`、最后按日期排序；`getRelatedPosts` 排除当前 slug，并按共同标签数量、日期排序。

- [ ] **Step 4: 补充相关内容的确定性测试并完整验证**

Run: `npm run test && npm run check`

Expected: 测试覆盖排序、置顶、精选、共同标签、阅读时长；全部通过。

- [ ] **Step 5: 供用户确认后提交本任务已暂存文件**

Run: `git add src/lib/content.ts tests/content.test.ts && git commit -m "feat: 添加内容查询工具"`

Expected: 仅在用户明确确认后执行。

## Task 4: 共享布局、首页与频道/栏目/标签页

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/ChannelNav.astro`
- Create: `src/components/ArticleCard.astro`
- Create: `src/components/NoteCard.astro`
- Create: `src/components/PostMeta.astro`
- Modify: `src/pages/index.astro`
- Create: `src/pages/ai/index.astro`
- Create: `src/pages/trading/index.astro`
- Create: `src/pages/category/[channel]/[category].astro`
- Create: `src/pages/tags/[tag].astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `sortPosts`、`getFeaturedPosts`、`CATEGORIES` 与 Astro 的 `getCollection()`。
- Produces: 首页、频道页、栏目页、标签页的静态路由；所有内容列表复用 `ArticleCard` 或 `NoteCard`。

- [ ] **Step 1: 为首页渲染写失败的静态构建断言**

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('home page', () => {
  it('renders both top-level channel links', async () => {
    const html = await readFile('dist/index.html', 'utf8');
    expect(html).toContain('AI 应用技术分享');
    expect(html).toContain('交易系统分享');
  });
});
```

- [ ] **Step 2: 运行构建和测试确认失败**

Run: `npm run build && npm run test -- --run tests/home.test.ts`

Expected: FAIL，因为频道导航和首页内容区尚未实现。

- [ ] **Step 3: 实现共享布局与首页内容优先级**

首页按以下顺序渲染：置顶/精选长文、两个频道入口、最新内容流。列表组件根据 `entry.data.type` 选择长文卡或短卡。`BaseLayout.astro` 必须提供语义化 `header`、`nav`、`main`、`footer`。

```astro
---
const { title = '知行之间' } = Astro.props;
---
<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width" /><title>{title}</title></head>
<body><slot /></body></html>
```

- [ ] **Step 4: 实现频道、栏目和标签静态路径**

每个动态页面用 `getStaticPaths()` 从内容集合及 `CATEGORIES` 生成路径。无内容的栏目不生成路径；不存在的标签返回 404，而不是空白页面。

- [ ] **Step 5: 验证浏览与响应式布局**

Run: `npm run build && npm run test && npm run check`

Expected: 首页 HTML 包含两个频道名称；所有示例内容的频道、栏目、标签页被生成；在浏览器 375px 与 1440px 宽度人工检查导航、卡片、换行无溢出。

- [ ] **Step 6: 供用户确认后提交本任务已暂存文件**

Run: `git add src/layouts src/components src/pages src/styles tests/home.test.ts && git commit -m "feat: 完成内容首页与频道浏览"`

Expected: 仅在用户明确确认后执行。

## Task 5: 长文章、短复盘与风险声明页面

**Files:**
- Create: `src/layouts/PostLayout.astro`
- Create: `src/components/RiskNotice.astro`
- Create: `src/pages/ai/[...slug].astro`
- Create: `src/pages/trading/[...slug].astro`
- Create: `src/pages/about.astro`
- Create: `src/pages/risk-disclosure.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: 内容集合 entry、`PostMeta`、`estimateReadingMinutes`、`getRelatedPosts`。
- Produces: 详情路由、风险声明、关于页和上一篇/下一篇导航。

- [ ] **Step 1: 写交易文章免责声明失败测试**

```ts
import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('trading post', () => {
  it('includes the risk disclosure', async () => {
    const html = await readFile('dist/trading/weekly-system-review/index.html', 'utf8');
    expect(html).toContain('不构成投资建议');
  });
});
```

- [ ] **Step 2: 运行构建和测试确认失败**

Run: `npm run build && npm run test -- --run tests/trading-page.test.ts`

Expected: FAIL，因为详情页和 `RiskNotice` 尚不存在。

- [ ] **Step 3: 实现详情路由和阅读布局**

`PostLayout.astro` 渲染标题、摘要、日期、栏目、标签、阅读时长、正文、相关内容与相邻文章。`RiskNotice.astro` 仅在 `channel === 'trading' && riskDisclosure` 时渲染。短复盘仍生成独立 URL，但正文布局比长文紧凑。

```astro
{channel === 'trading' && riskDisclosure && <RiskNotice />}
```

- [ ] **Step 4: 添加关于页和完整风险声明页**

关于页先使用可替换的简短个人介绍，不虚构履历。风险声明页包含：个人研究记录性质、非投资建议、读者独立决策与风险自担、历史复盘不代表未来表现。

- [ ] **Step 5: 验证内容页**

Run: `npm run build && npm run test && npm run check`

Expected: AI、交易示例页可访问；交易页含风险声明；关于页和风险声明页可访问；长文与短复盘均有正确元信息。

- [ ] **Step 6: 供用户确认后提交本任务已暂存文件**

Run: `git add src/layouts src/components src/pages src/styles tests/trading-page.test.ts && git commit -m "feat: 添加文章详情与风险声明"`

Expected: 仅在用户明确确认后执行。

## Task 6: 完善站点元数据、质量门禁与写作指南

**Files:**
- Create: `public/robots.txt`
- Create: `public/favicon.svg`
- Create: `README.md`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `package.json`
- Create: `tests/content-schema.test.ts`

**Interfaces:**
- Consumes: 所有页面与 schema。
- Produces: 可复制的写作流程、搜索引擎基础元数据、CI 可调用的 `npm run verify` 命令。

- [ ] **Step 1: 写 schema 完整性失败测试**

```ts
import { getCollection } from 'astro:content';
import { describe, expect, it } from 'vitest';

describe('published content', () => {
  it('uses at least one tag and a non-empty description', async () => {
    const entries = await getCollection('ai').then((ai) => getCollection('trading').then((trading) => [...ai, ...trading]));
    for (const entry of entries) {
      expect(entry.data.tags.length).toBeGreaterThan(0);
      expect(entry.data.description.trim()).not.toBe('');
    }
  });
});
```

- [ ] **Step 2: 运行测试确认失败或暴露字段问题**

Run: `npm run test -- --run tests/content-schema.test.ts`

Expected: 如果任何样例字段缺失则 FAIL；补齐后 PASS。

- [ ] **Step 3: 添加站点级 metadata 与 verify 命令**

在 `BaseLayout.astro` 增加描述、canonical URL、Open Graph 标题与描述。`package.json` 添加：

```json
"verify": "npm run check && npm run test && npm run build"
```

README 必须给出：新建文章的 Markdown 模板、两条频道与子栏目可选值、本地预览命令、发布触发条件和风险声明编辑位置。

- [ ] **Step 4: 完整验证**

Run: `npm run verify`

Expected: 类型检查、单元测试、内容字段检查和生产构建全部通过。

- [ ] **Step 5: 供用户确认后提交本任务已暂存文件**

Run: `git add public README.md package.json src/layouts/BaseLayout.astro tests/content-schema.test.ts && git commit -m "docs: 补充写作与发布说明"`

Expected: 仅在用户明确确认后执行。

## Task 7: 配置受保护的 CI/CD 与云服务器发布

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `backend/scripts/deploy.sh`
- Create: `backend/nginx/site.conf.template`
- Create: `docs/deployment.md`

**Interfaces:**
- Consumes: 在 `frontend/` 目录运行的 `npm run verify` 与生成的 `frontend/dist/`。
- Produces: `main` 分支推送后的构建验证与原子发布流程。

- [ ] **Step 1: 写部署脚本行为测试（不连接真实服务器）**

```sh
# 在临时目录执行，模拟两个已发布版本
mkdir -p releases/old releases/new
ln -s "$PWD/releases/old" current
./backend/scripts/deploy.sh "$PWD/releases/new" "$PWD/current"
test "$(readlink current)" = "$PWD/releases/new"
```

Expected: 脚本先验证传入目录有 `index.html`，再以临时软链接原子替换 `current`；验证失败时 `current` 指向旧版本。

- [ ] **Step 2: 实现原子切换脚本**

```sh
#!/usr/bin/env sh
set -eu
release_dir="$1"
current_link="$2"
test -f "$release_dir/index.html"
ln -sfn "$release_dir" "${current_link}.next"
mv -Tf "${current_link}.next" "$current_link"
```

- [ ] **Step 3: 编写 GitHub Actions 工作流**

工作流仅在 `main` 分支 `push` 后触发：checkout → 进入 `frontend/` → Node 22 → `npm ci` → `npm run verify` → 打包 `dist/` → 使用 `DEPLOY_HOST`、`DEPLOY_USER`、`DEPLOY_SSH_KEY` 和 `DEPLOY_PATH` Secrets 上传到时间戳版本目录 → SSH 执行 `backend/scripts/deploy.sh`。任何校验失败都不得连接服务器。

- [ ] **Step 4: 编写服务器准备与恢复文档**

`docs/deployment.md` 必须列出需由用户确认后执行的外部操作：域名 DNS、服务器安装 Nginx/Certbot、创建受限部署用户、配置 GitHub Secrets、首次上传、HTTPS 验证。文档同时给出恢复方法：将 `current` 软链接指回上一个 `releases/<timestamp>` 目录并 `nginx -t` 后 reload。

- [ ] **Step 5: 在不影响真实服务器的前提下验证**

Run: `npm run verify`，并在本地临时目录运行部署脚本行为测试。

Expected: 网站构建通过；原子切换成功；无网络、无 SSH、无 DNS、无服务器状态变更。

- [ ] **Step 6: 在用户明确“继续”后执行首次真实服务器部署**

执行前向用户展示：目标服务器、域名、涉及文件路径、Nginx 配置内容、GitHub Secrets 名称、可恢复方式，以及 DNS/证书/线上服务受到的影响。得到明确确认后才连接服务器、修改 Nginx 或启用 HTTPS。

- [ ] **Step 7: 供用户确认后提交本任务已暂存文件**

Run: `git add .github/workflows/deploy.yml backend/scripts/deploy.sh backend/nginx/site.conf.template docs/deployment.md && git commit -m "ci: 添加静态站自动部署"`

Expected: 仅在用户明确确认后执行。

## 计划自检

- 规格覆盖：信息架构与双频道由 Task 2、4 实现；编辑型阅读体验由 Task 4、5 实现；Markdown 与字段校验由 Task 2、6 实现；交易风险边界由 Task 5 实现；响应式人工检查由 Task 4、5 验证；HTTPS、自动部署、失败回退由 Task 7 实现。
- 无范围漂移：没有加入数据库、登录、评论、搜索、支付或实时行情。
- 外部变更边界：Task 7 明确把服务器、DNS、证书和真实部署放在用户再次确认之后。
- 占位符检查：本文件不包含 `TBD`、`TODO` 或“稍后实现”等未定义执行项。
