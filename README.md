# 三毛机场 · fanqiangdaohang.blog

静态中文机场品牌博客。29 个品牌严格按站长提供顺序排列，品牌名称及访问按钮保留原始推广链接；11 个优惠码保留大小写。

## 文件

- `dist/`：可直接部署的网站，包括首页、6 个关键词专题、29 个品牌详情、关于页、隐私页、404、robots.txt 与 sitemap.xml。
- `scripts/build.mjs`：品牌与专题的编辑源，修改后运行构建。运行时生成 `data/brands.json`、`data/seo.json` 和所有 HTML。
- `dist/assets/`：站点样式、优惠码复制交互及图标。
- `data/`：生成后的品牌档案与逐页 TDK 清单。
- `docs/`：部署、Bing 和资料边界说明。

## 本地编辑

需要 Node.js 20+，无第三方运行依赖。

```sh
npm run build
npm run check
npm run preview
```

预览地址为 http://127.0.0.1:4173 。不要直接双击 HTML 预览，站内地址使用根路径。

## 资料与排名

排名是站长指定的展示顺序，不是独立测速排名。品牌优势为第三方公开资料的简要定位，来源见各品牌页面和 `data/brands.json`。站长提供的推广入口未经域名归属核验；优惠码未经结算验证。不含虚构价格、测速、评分、可用率或匿名性承诺。

## GitHub

目标仓库：https://github.com/ksugiono187/fanqiangdaohang.blog
GitHub Pages 工作流使用 `dist/` 作为发布目录。启用仓库 Settings → Pages → GitHub Actions，并按 `docs/上线与Bing.md` 配置域名。

`.openai/hosting.json` 用于 Sites 预览发布；GitHub Pages 使用独立工作流，两者都可部署相同静态内容。正式域名应该仅选择一个托管目标。
