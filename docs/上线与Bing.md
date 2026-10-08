# 三毛机场：上线与 Bing

## 已制作

46 个独立静态 HTML 页面；中文语言声明；逐页唯一 Title、Description、Keywords；canonical；Open Graph 与 Twitter 文字元信息；WebSite、ItemList、Article、面包屑 JSON-LD；6 个关键词专题；29 个品牌详情内链；robots.txt；sitemap.xml；404；响应式布局；推广链接 rel=sponsored nofollow；11 个优惠码复制按钮。

关键词页分别为：

|关键词|页面|
|---|---|
|机场推荐|/guides/airport-recommendations/|
|机场推荐 2026|/guides/airport-recommendations-2026/|
|稳定机场推荐|/guides/stable-airports/|
|便宜机场推荐|/guides/cheap-airports/|
|专线机场推荐|/guides/dedicated-airports/|
|机场排行榜|/guides/airport-ranking/|

首页侧重“机场推荐 2026”，各专题从不同选购问题出发，避免六篇完全重复的关键词页面。Keywords 标签仅作为 TDK 交付项，不是排名保证。页面无需执行 JavaScript 就能读取正文和内链。

## 正式上线

正式 canonical 与 sitemap 使用 https://fanqiangdaohang.blog 。2026-10-08 已通过 GitHub Pages 发布并绑定 Cloudflare DNS，HTTPS 首页、品牌页、robots 和 sitemap 已公开返回 HTTP 200。网站地图包含 46 个 URL。

### GitHub Pages 选项

1. 仓库 Settings → Pages → Build and deployment → Source 选择 GitHub Actions。
2. 推送 main 分支将运行 `.github/workflows/pages.yml`，构建、检查并上传 dist。
3. Pages 中设置自定义域名 fanqiangdaohang.blog。仓库已含 dist/CNAME。
4. 按 GitHub 当时的官方文档在域名 DNS 服务商设置记录： https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site 。DNS 修改需在你控制的域名账号内完成。
5. 等待 HTTPS 证书就绪后启用 Enforce HTTPS，再检查首页与 /sitemap.xml。

### Sites 选项

Sites 预览默认只供所有者访问。正式使用前需改为公开访问并绑定域名，按 Sites 返回的 DNS 记录修改域名服务商设置。不要同时将根域名解析到 GitHub Pages 和 Sites。

## Bing 站长工具

1. 打开 https://www.bing.com/webmasters/ 并添加 https://fanqiangdaohang.blog 。
2. 根据账户获得的真实验证资料完成 DNS、XML 文件或 meta 验证。站点未填入虚构验证码。
3. 提交 https://fanqiangdaohang.blog/sitemap.xml 。
4. 对首页和6个专题使用 URL 检查功能，查看抓取与索引状态。
5. 根据 Bing 的实际报告改进内容，不重复堆砌关键词或发布没有独特信息的复制页面。

已完成可抓取结构不等于已经收录。验证 Bing 账户、域名 DNS 和真实收录结果需要相应账号权限。没有虚构 IndexNow 密钥或未经验证的提交状态。

## 持续维护

核对套餐时应记录官方出处、实际付款周期、节点倍率及查询日期；取得独立测试记录后再补充速度和稳定性结论。更新源文件中的日期，然后重新生成 sitemap；不要每次构建都把未核对的内容自动标为“今天验证”。


## 实际提交记录
2026-10-08：Bing DNS 所有权验证通过，https://fanqiangdaohang.blog/sitemap.xml 已提交，后台状态为 Processing。已保存截图 Bing网站地图提交.jpg。提交不代表收录。
