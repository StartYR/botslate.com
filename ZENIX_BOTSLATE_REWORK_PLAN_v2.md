# Zenix → Botslate 网站改造方案

> 目标：把当前 Zenix Astro 模板改造成一个真实、简洁、可信的独立软件/实验项目网站，同时尽量保留 Zenix 原有的视觉质量、响应式设计、深浅色主题、搜索和内容系统。
>
> 本文档是给 Codex 的实施说明。开始修改前先检查当前仓库实际状态，不要假设上游模板与本地仓库完全一致。

## 0. 品牌边界

请严格区分：

```text
公开网站品牌：Botslate
3x-ui 管理面板标题：Launchpad
域名：botslate.com
```

不要把 `Launchpad` 用到公开网站 Navbar、Hero、Footer、SEO Title 或 About 中。

## 1. 目标与原则

最终公开网站品牌使用 **Botslate**。`Launchpad` 仅保留为 3x-ui 管理面板的浏览器标题，不作为公开网站品牌。

网站定位：

> Independent software projects, experiments, and tools.

可以围绕以下概念组织内容：

- independent software experiments
- small tools
- web projects
- technical notes
- changelog / site updates

必须遵守以下原则：

1. **不要伪造 SaaS 业务。**
   - 不要保留虚假的客户数量、用户数量、收入数据、品牌 Logo 墙、Testimonials、Pricing、Login、Sign Up 等内容。
   - 不要编造客户、合作伙伴、团队成员、融资、公司规模等信息。

2. **内容宁可少，也要真实。**
   - 如果仓库中没有足够真实项目资料，不要虚构项目。
   - 可以使用“software experiments / tools / notes / work in progress”这类中性表达。
   - 可以围绕本网站本身、Astro、静态站点、Web 开发等真实主题写少量内容。

3. **保留 Zenix 的优点。**
   - 响应式布局
   - 深色 / 浅色模式
   - Command Palette / Search
   - Astro 静态输出
   - Blog/MDX 内容系统
   - Changelog
   - 现有动画与整体视觉风格

4. **不要改服务器架构。**
   本任务只修改网站仓库。

---

## 2. 明确禁止修改的内容

除非用户另行明确授权，否则不要修改：

- `scripts/deploy.mjs`
- 已配置好的 `npm run deploy` 逻辑
- SSH 配置
- `los-deploy` 部署账户
- Nginx
- Certbot
- 3x-ui
- VPS 配置
- Cloudflare 配置
- `/arc/` 订阅路径
- 3x-ui 面板路径
- 任何代理节点、端口、路由或订阅配置

生产环境目前已经能够通过：

```bash
npm run deploy
```

完成静态站点部署。

本任务完成后，默认只做本地验证。**不要自动部署到生产环境，除非用户明确要求部署。**

---

## 3. 开始前先做仓库检查

先检查实际仓库，不要直接按模板假设修改。

建议先执行：

```powershell
rg -n "Zenix|Farros|farrosfr|Pricing|Testimonials|Sign in|Sign up|Get Started|Get Zenix|hundreds of founders" .
```

同时检查：

```text
astro.config.mjs
src/config.ts
src/components/
src/layouts/
src/pages/
src/content/
public/
package.json
scripts/
```

目标是找到所有仍然带有模板品牌、虚假 SaaS 文案、模板作者链接和无效占位链接的位置。

---

## 4. 品牌基础配置

### 4.1 `astro.config.mjs`

确认：

```js
site: 'https://botslate.com'
```

如果已经正确，不要重复无意义修改。

### 4.2 `src/config.ts`

把全局站点信息改为 Botslate。

推荐：

```ts
export const SITE_TITLE = 'Botslate';

export const SITE_DESCRIPTION =
  'Independent software projects, experiments, and tools.';

export const SITE_URL = 'https://botslate.com';

export const BRAND_NAME = 'Botslate';
```

`BRAND_LOGO_TEXT` 如果 Navbar 已经改成图片 Logo，可以删除未使用配置，或保留但不要继续显示 `Z`。

### 4.3 Social Links

删除模板作者的：

- Twitter/X
- GitHub
- LinkedIn

不要替用户编造社交账号。

如果当前没有明确可公开的社交链接：

- 可以让 `SOCIAL_LINKS` 为空；
- 或调整组件，在没有链接时不渲染 Social 区域。

不要保留 `farrosfr` 的账号。

### 4.4 Repository URL

本站有明确的公开仓库：

```text
https://github.com/StartYR/botslate.com
```

因此将：

```ts
export const REPOSITORY_URL = 'https://github.com/farrosfr/zenix';
```

改为：

```ts
export const REPOSITORY_URL = 'https://github.com/StartYR/botslate.com';
```

如果 Navbar、Footer、Command Palette 或其他组件引用 `REPOSITORY_URL`，应继续保留该入口，并确保最终跳转到本站公开仓库。

不要再把上游 Zenix 仓库当作本站仓库。

保留仓库中的原始 MIT License 文件以及依法需要保留的上游版权/许可信息；重新品牌不等于删除许可证。

---

## 5. Logo 与 favicon

公开站点品牌使用 **Botslate**，但本任务不需要再为 Astro 站点单独配置 favicon。

生产服务器已经通过 Nginx 全局提供：

```text
/favicon.svg
/favicon.ico
```

当前访问 `https://botslate.com/` 时已经显示统一的小火箭 favicon，因此：

- 不要新增或修改 Astro favicon 配置；
- 不要为了 favicon 修改 Nginx；
- 不要重复注入 `<link rel="icon">`；
- 不要删除服务器现有 favicon 配置。

Navbar 的品牌标识可以继续沿用 Zenix 现有布局，但必须把 `Z` / `Zenix` 改成 `Botslate`。

如果仓库里现有的模板 favicon、Logo 或图片仍带有 Zenix 品牌：
- 用户可见的 Zenix Logo 应清理；
- 但不要为了生产 favicon 额外增加新的图标文件；
- 本地开发环境是否显示同一 favicon 不属于本轮改造的必要目标。

---

## 6. Navbar

重点检查：

```text
src/components/Navbar.astro
```

目标：

### 保留

- Logo / Brand
- Theme toggle
- Command palette / Search
- 移动端导航

### 删除

- `Sign in`
- `Get Started`
- `Sign up`
- 任何 Pricing CTA
- 指向不存在功能的按钮

### 推荐导航

第一阶段使用：

```text
Home
Notes
Changelog
About
```

如果确实建立了 Projects 页面，再加入：

```text
Projects
```

不要为了导航完整而创建没有真实内容的空页面。

“Notes” 可以继续使用现有 `/blog/` 路由，只把用户可见名称从 `Blog` 改成 `Notes`，这样能减少无意义的路由迁移。

---

## 7. Hero 首页首屏

重点检查：

```text
src/components/Hero.astro
```

彻底删除模板营销文案，例如：

- Zenix v2.0
- SaaS
- conversion
- founders
- customers
- growth
- pricing
- Get Zenix

推荐方向：

### Badge

```text
Independent software lab
```

### 主标题

推荐：

```text
Ideas, tools, and experiments.
```

或者：

```text
Build. Launch. Iterate.
```

二选一，不要同时堆太多 slogan。

### 描述

推荐：

```text
A small independent space for software experiments, useful tools, and technical notes.
```

### CTA

保留最多两个：

```text
Explore Notes
View Changelog
```

如果有真实 Projects 页面，则可以：

```text
Explore Projects
Read Notes
```

不要放假的注册、购买、试用按钮。

---

## 8. 首页结构

重点检查：

```text
src/pages/index.astro
```

当前 Zenix 首页可能包含：

```astro
<Hero />
<Features />
<Testimonials />
<Pricing />
<FAQ />
```

建议第一阶段调整为：

```astro
<Hero />
<Features />
```

然后根据实际内容增加：

- Latest Notes
- Recent Changes

### 删除

- Testimonials
- Pricing
- 任何虚假客户证明
- “Join hundreds of founders”
- “Get Zenix Now”
- 所有模板 SaaS CTA

### 首页底部 CTA

改成简单、真实的内容，例如：

标题：

```text
Built in public, one iteration at a time.
```

说明：

```text
Small experiments, useful tools, and notes from the process.
```

按钮：

```text
Read Notes
View Changelog
```

---

## 9. Features 改造成真实内容

重点检查：

```text
src/components/Features.astro
```

不要继续宣传 Zenix 模板功能。

把该区域重新定位成类似：

```text
What lives here
```

推荐 4 个项目：

### Experiments

```text
Small ideas explored through working software.
```

### Tools

```text
Focused utilities built to solve practical problems.
```

### Web

```text
Modern static and interactive web projects.
```

### Notes

```text
Technical notes, implementation details, and lessons learned.
```

可以保留 Zenix 原来的卡片、图标、Bento 布局，只替换内容。

不要写无法证明的指标。

---

## 10. 删除模板 SaaS 页面

检查：

```text
src/pages/login.astro
src/pages/signup.astro
src/pages/pricing.astro
```

如果它们仅仅是 Zenix 模板演示页面，没有真实功能，则删除。

同时清理：

- Navbar 引用
- Footer 引用
- Search index
- Sitemap
- Command Palette
- 任何组件中的链接
- 任何 `resolvePath('/pricing/')` 等引用

删除后必须确保构建不会出现死链接。

---

## 11. Blog → Notes

保留 Astro Content Collections，但把用户可见名称从 **Blog** 改为 **Notes**。

URL 第一阶段可以继续：

```text
/blog/
```

不需要为了名字改成 `/notes/`，除非修改非常干净且不会造成大量额外工作。

重点检查：

```text
src/pages/blog/
src/content/blog/
src/content.config.ts
```

### 删除模板示例文章

删除或替换所有明显属于 Zenix/Farros 的演示文章。

不要把模板作者的文章继续作为本站内容发布。

### 第一篇真实文章

创建一篇简单文章，例如：

```text
Welcome to Botslate
```

内容只需要解释：

- Botslate 是一个小型独立软件项目、实验与技术笔记空间；
- 网站使用 Astro；
- 这里会记录工具、Web 实验和实现笔记；
- 不夸大、不虚构任何业务数据。

文章日期使用实际修改日期。

如果需要第二篇，可以围绕本仓库真实实现写：

```text
Why this site is static
```

内容可介绍静态站点带来的简单部署、性能和维护优势。

不要公开敏感服务器细节、SSH 用户、秘密路径、代理配置或内部基础设施信息。

---

## 12. Changelog

保留 Changelog。

重点检查：

```text
src/pages/changelog/
src/content/changelog/
```

删除 Zenix 模板示例 changelog。

第一条可以写：

```text
Initial Launch
```

内容：

- Botslate initial public site
- Astro-based static build
- light/dark theme
- notes and changelog

不要写内部管理面板、代理服务、订阅路径或 VPS 安全配置。

---

## 13. About

如果当前没有 About 页面，创建：

```text
src/pages/about.astro
```

内容保持简单：

```text
Botslate is a small independent space for software projects, experiments, useful tools, and technical notes.

The focus is simple: build things, learn from them, and document what is worth keeping.
```

不要虚构：

- 公司
- 团队规模
- 客户
- 办公地址
- 商业服务
- 联系电话

---

## 14. Footer

重点检查：

```text
src/components/Footer.astro
```

### 删除

- Newsletter / Email Subscribe（如果没有真实后端）
- Pricing
- Integrations
- Community
- Help Center
- Contact（如果没有真实联系方式）
- 模板作者 Social
- 无效的 `href="#"`
- 假的 Company/Product/Resources 链接

### 推荐简化为

左侧：

```text
Botslate
Independent software projects, experiments, and tools.
```

链接：

```text
Home
Notes
Changelog
About
```

底部：

```text
© 2026 Botslate
Built with Astro.
```

如果希望保留 Privacy / Terms，必须先检查页面内容是否仍然是模板文案。

若这些法律页面并不适用于当前站点，可以从导航/Footer 隐藏；不要伪装成经过法律审查的正式政策。

---

## 15. 搜索与 Command Palette

Zenix 有搜索 / Command Palette。

必须检查：

```text
src/components/CommandPalette.astro
src/pages/search-index.json.ts
```

要求：

- 删除 Login / Signup / Pricing 后，不应继续搜索到这些页面；
- Notes 应正确进入搜索；
- About / Changelog 应正确进入搜索；
- 不应出现 Zenix/Farros 模板结果；
- 不应出现 dead links。

---

## 16. SEO 与 Metadata

检查：

```text
src/layouts/
astro.config.mjs
src/config.ts
public/
```

确保：

```text
title: Botslate
site: https://botslate.com
description: Independent software experiments, tools, and technical notes.
```

清除所有：

```text
Zenix
Farros
zenix.farrosfr.com
github.com/farrosfr/zenix
```

作为网站品牌或 SEO metadata 的残留。

### Open Graph

如果现有 `og-image.png` 带 Zenix 品牌：

- 不要继续使用。
- 可以使用代码生成一个新的 1200×630 PNG；
- 设计保持简单：Launchpad + 火箭 Logo + tagline。
- 如果不方便生成，宁可暂时移除模板 OG image，也不要发布 Zenix 的 OG 图片。

不要求人工截图。

---

## 17. 404 页面

保留 Zenix 的视觉风格，但改掉品牌。

页面应：

- 显示 Botslate；
- 返回首页按钮；
- 不出现 Zenix/Farros；
- 不暴露服务器、Nginx、3x-ui 等内部信息。

注意：生产环境中部分 404 可能由 Nginx 统一处理；不要为了 Astro 404 页面去修改 Nginx。

---

## 18. 全仓库清理

修改完成后执行：

```powershell
rg -n "Zenix|Farros|farrosfr|zenix\.farrosfr\.com|Get Zenix|hundreds of founders|Testimonials|Pricing|Sign in|Sign up|Get Started" .
```

逐项判断：

- 如果是网站用户可见内容，应清理；
- 如果是 `package-lock.json`、合法许可证说明或必要历史元数据，不要机械删除；
- 不要为了做到“0 搜索结果”破坏依赖或许可证。

同时搜索死占位链接：

```powershell
rg -n 'href=["'\'']#["'\'']|href:\s*["'\'']#["'\'']' src
```

尽量删除用户可点击但没有实际功能的链接。

---

## 19. 样式原则

不要重做整个 Zenix 设计系统。

保留：

- Tailwind
- 字体
- spacing
- card system
- dark mode
- animation
- layout
- accessibility behavior

只进行必要的品牌化。

火箭 Logo 已经有明显蓝色视觉，可以让现有主题主色保持接近蓝色 / indigo；若当前 Zenix 主色已经协调，不必为了品牌强制大改所有颜色。

---

## 20. 不要暴露内部代理服务

这个网站是公开网站。

任何公开内容里都不要出现：

- 3x-ui
- Xray
- VLESS
- REALITY
- Hysteria2
- Clash
- Mihomo
- SOCKS5
- `/arc/`
- 面板随机路径
- VPS IP
- SSH 用户名
- SSH 密钥名
- Telegram Bot Token
- 内部端口
- Nginx 私有反代结构

这些内容与公开网站无关。

---

## 21. 构建与验证

完成修改后：

```powershell
npm run build
```

检查：

- 无 Astro 构建错误；
- 无 TypeScript 错误；
- 无明显 dead link；
- 首页正常；
- 深色/浅色切换正常；
- 移动端 Navbar 正常；
- Search / Command Palette 正常；
- `/blog/`（Notes）正常；
- `/changelog/` 正常；
- `/about/` 正常；
- 删除的 `/login/`、`/signup/`、`/pricing/` 不再生成；
- 页面中无 Zenix/Farros 品牌残留。

如果仓库已有 Playwright：

```powershell
npm run test:e2e
```

在测试环境可用时运行。

### 已知本地环境注意事项

如果 Windows 上 Astro 在明确输出：

```text
[build] Complete!
```

之后出现 Node/libuv assertion：

- 先确认 `dist/` 是否完整生成；
- 不要未经用户授权修改部署脚本来“吞掉”所有构建失败；
- 区分 Node 退出阶段异常与真正的 Astro build error。

---

## 22. 最终验收标准

只有满足以下条件才算完成：

- [ ] 网站名称为 Botslate
- [ ] Logo 使用火箭图标
- [ ] `botslate.com` 为 canonical site URL
- [ ] 首页不再像 SaaS 模板
- [ ] 无 Pricing
- [ ] 无 Login / Signup
- [ ] 无虚假 Testimonials
- [ ] 无虚假客户或业务指标
- [ ] 无模板作者社交链接
- [ ] Notes 内容真实且简洁
- [ ] Changelog 至少有一条真实站点更新
- [ ] About 页面存在
- [ ] Footer 简洁且无假链接
- [ ] Search 不返回已删除模板页面
- [ ] 不暴露任何代理、服务器或管理面板信息
- [ ] `npm run build` 可生成完整 `dist/`
- [ ] 不修改现有部署和服务器基础设施

---

## 23. 实施方式

Codex 应：

1. 先检查本地实际文件结构；
2. 列出计划修改的文件；
3. 直接实施上述修改；
4. 不做无关重构；
5. 不升级依赖，除非修复当前任务必需问题；
6. 完成后运行构建与必要测试；
7. 汇总：
   - 修改了哪些文件；
   - 删除了哪些模板内容；
   - 是否仍有需要用户决定的文案/链接；
   - 构建/测试结果；
8. **不要自动运行 `npm run deploy`，除非用户明确要求上线。**
