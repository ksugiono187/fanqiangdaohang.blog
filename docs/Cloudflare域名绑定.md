# Cloudflare 域名绑定记录

2026-10-08 已保存以下记录。GitHub Pages 自定义域名为 fanqiangdaohang.blog，发布来源为 GitHub Actions。

|类型|名称|当前内容|代理|TTL|
|---|---|---|---|---|
|A|@|185.199.108.153|已代理|自动|
|CNAME|www|ksugiono187.github.io|已代理|自动|
|CNAME|372d9abc3082aff3e314c2fef3adb23e|verify.bing.com|仅 DNS|自动|

第三条用于 Bing 所有权验证，验证已通过。

修改前根域名与 www 均为 A 记录，内容 156.236.116.3，已代理，TTL 自动。如需回滚旧源站，可恢复上述两条旧 A 记录。

未删除其他记录，未调整安全功能。正式域名 HTTPS 首页可打开；首页、品牌页、网站地图及 robots 均返回 HTTP 200。GitHub DNS 检查仍在进行，源站 Enforce HTTPS 暂不可用。

官方配置资料：https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
