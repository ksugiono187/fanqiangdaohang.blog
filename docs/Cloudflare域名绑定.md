# 三毛机场：Cloudflare DNS 与 GitHub Pages

站长已确认 fanqiangdaohang.blog 在 Cloudflare 管理。2026-10-08 公共查询返回 Cloudflare NS（coco.ns.cloudflare.com、dante.ns.cloudflare.com）以及 Cloudflare 代理地址。公共查询无法看到代理背后的源站，不能据此判断现在指向哪个服务。

本次没有修改任何现有 DNS，也没有把域名标记为上线完成。

## 推荐步骤

先完成 GitHub 推送，并在仓库 Settings → Pages 选择 GitHub Actions。等发布成功后，在 Pages 的 Custom domain 填入 fanqiangdaohang.blog。Actions 发布方式不能仅依赖 dist/CNAME 自动绑定域名，必须完成仓库设置。

然后进入 Cloudflare 的该域名 → DNS → Records。先查看当前根域名记录，确认旧源站用途，避免影响现有网站或邮件记录。

如正式托管使用 GitHub Pages，根据 GitHub 官方文档设置根域名 A 记录：

|类型|名称|内容|
|---|---|---|
|A|@|185.199.108.153|
|A|@|185.199.109.153|
|A|@|185.199.110.153|
|A|@|185.199.111.153|
|CNAME|www|ksugiono187.github.io|

不要删除 MX、TXT 等无关记录，也不要同时保留指向旧源站的根域名 A/AAAA 记录。GitHub 的 IP 以修改当天官方文档为准。

保存后等待 DNS 与 HTTPS 配置完成，在 GitHub Pages 勾选 Enforce HTTPS。确认正式域名首页、品牌页与 sitemap.xml 均能公开读取，然后再执行 Bing 站长验证及提交。

## 官方资料

- GitHub 自定义域名：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Cloudflare DNS 记录管理：https://developers.cloudflare.com/dns/manage-dns-records/how-to/create-dns-records/

这份记录表是待执行配置，不代表已经修改成功。目前仍需要 GitHub 登录与 Cloudflare 账号操作权限。
