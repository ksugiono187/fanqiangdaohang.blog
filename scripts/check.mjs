import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const brands=JSON.parse(fs.readFileSync(path.join(root,'data/brands.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'data/seo.json'),'utf8'));
assert.equal(brands.length,29);assert.equal(brands.filter(b=>b.coupon).length,11);
assert.equal(new Set(brands.map(b=>b.url)).size,29);
assert.equal(new Set(brands.map(b=>b.slug)).size,29);
const home=fs.readFileSync(path.join(out,'index.html'),'utf8');
let previous=-1;
for(const b of brands){const current=home.indexOf('id="brand-'+b.slug+'"');assert(current>previous,'Ranking order: '+b.name);previous=current;assert(home.includes(b.url.replaceAll('&','&amp;')));assert(home.includes(b.advantage));}
assert.equal(seo.length,46);
const titles=new Set(),descriptions=new Set();
let links=0;
for(const r of seo){const file=path.join(out,r.route==='/'?'index.html':r.route.slice(1)+'index.html');const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,r.route+' must have one h1');assert(html.includes('<html lang="zh-CN">'));assert(html.includes('href="https://fanqiangdaohang.blog'+r.route+'"'));assert(html.includes('三毛机场'));assert(!titles.has(r.title),'Duplicate title');titles.add(r.title);assert(!descriptions.has(r.description),'Duplicate description');descriptions.add(r.description);
for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(match[1]);
for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const u=match[1];if(!u.startsWith('/')||u.startsWith('//'))continue;const [url,anchor]=u.split('#');let target=path.join(out,url.split('?')[0].slice(1));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert(fs.existsSync(target),`${r.route} broken link ${u}`);if(anchor)assert(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`));links++;}
for(const match of html.matchAll(/<a[^>]+href="https:[^"]+"[^>]*>/g)){if(match[0].includes('target="_blank"'))assert(match[0].includes('noopener'));}
}
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,46);
for(const r of seo)assert(sitemap.includes('https://fanqiangdaohang.blog'+r.route+'</loc>'));
assert(fs.readFileSync(path.join(out,'robots.txt'),'utf8').includes('Sitemap: https://fanqiangdaohang.blog/sitemap.xml'));
const report=`验证通过：46 个可索引页面、29 个品牌、11 个优惠码；${links} 个本地链接/资源检查通过。每页唯一标题、描述、一个 H1、canonical、有效 JSON-LD；sitemap 覆盖全部页面。\n此检查未验证外部入口所有权、优惠码有效性、实际套餐或 Bing 收录。\n`;
fs.writeFileSync(path.join(root,'docs/验证报告.txt'),report);console.log(report);
