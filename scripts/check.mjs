import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {expandedPosts} from './library.mjs';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const brands=JSON.parse(fs.readFileSync(path.join(root,'data/brands.json'),'utf8'));
const seo=JSON.parse(fs.readFileSync(path.join(root,'data/seo.json'),'utf8'));
const articleIndex=JSON.parse(fs.readFileSync(path.join(out,'data/articles.json'),'utf8'));
assert.equal(articleIndex.length,155,'Search must cover all 155 articles');
assert.equal(new Set(articleIndex.map(p=>p.route)).size,155);
for(const p of articleIndex){assert(seo.some(r=>r.route===p.route),'Search points to missing page');const html=fs.readFileSync(path.join(out,p.route.slice(1),'index.html'),'utf8');assert(html.includes('class="reading-pagination"'));assert(html.includes('id="article-toc"'));}
const newPosts=expandedPosts({brands,esc:s=>String(s),link:(_,label)=>label});
assert.equal(newPosts.length,150,'Must add 150 original research pages');
assert.equal(new Set(newPosts.map(p=>p.slug)).size,150);
for(const id of ['method','action'])assert.equal(new Set(newPosts.filter(p=>p.brand).map(p=>p.sections.find(s=>s[0]===id)[2])).size,145,'Brand case sections must be distinct');
assert.equal(brands.find(b=>b.slug==='flycat').reference.trafficCycle,'来源品牌页明确每月150GB');
for(const b of brands)assert.equal(newPosts.filter(p=>p.brand===b.slug).length,5);
for(const p of newPosts){assert(p.sections.length>=5);assert(p.sections.map(s=>s[2].replace(/<[^>]*>/g,'')).join('').length>=350,'Thin article '+p.slug);assert(seo.some(r=>r.route==='/blog/'+p.slug+'/'));}
for(const slug of ['airport-recommendations','airport-recommendations-2026','stable-airports','cheap-airports','dedicated-airports','airport-ranking']){
 const html=fs.readFileSync(path.join(out,'guides',slug,'index.html'),'utf8');
 const selected=[...html.matchAll(/data-topic-brand="([^"]+)"/g)].map(m=>brands.find(b=>b.slug===m[1]));
 assert.equal(selected.length,10,slug+' must recommend 10 brands');
 assert.equal(new Set(selected.map(b=>b.slug)).size,10);
 let prior=0;for(const b of selected){assert(b.rank>prior,slug+' violates original order');prior=b.rank;assert(html.includes('href="/brands/'+b.slug+'/"'));if(b.reference){assert(html.includes(b.reference.price));assert(html.includes(b.reference.traffic));}if(slug==='dedicated-airports')assert(/专线|IEPL|IPLC/.test(b.reference.line));}
 assert.equal((html.match(/核心原因：/g)||[]).length,10);assert.equal((html.match(/推荐原因：/g)||[]).length,10);assert.equal((html.match(/优势分析：/g)||[]).length,10);
}
assert.equal(brands.length,29);assert.equal(brands.filter(b=>b.coupon).length,11);
assert.equal(new Set(brands.map(b=>b.url)).size,29);
assert.equal(new Set(brands.map(b=>b.slug)).size,29);
assert.equal(brands.filter(b=>b.reference).length,29,'All brands now have reference parameters');
assert.equal(brands.find(b=>b.slug==='dalaocloud').reference.price,'￥23');
assert.equal(brands.find(b=>b.slug==='dalaocloud').reference.traffic,'130GB');
assert.equal(brands.find(b=>b.slug==='dalaocloud').reference.priceBasis,'付款周期待确认');
for(const b of brands){if(!b.reference)continue;const profile=fs.readFileSync(path.join(out,'brands',b.slug,'index.html'),'utf8');assert(profile.includes(b.reference.price),'Missing reference price: '+b.slug);assert(profile.includes(b.reference.traffic),'Missing reference traffic: '+b.slug);assert(profile.includes(b.reference.sourceUrl),'Missing reference source: '+b.slug);}
assert.equal(brands.find(b=>b.slug==='flycat').reference.priceBasis,'年付折算月价');
assert.equal(brands.find(b=>b.slug==='edgenova').reference.priceBasis,'年付起价');
const home=fs.readFileSync(path.join(out,'index.html'),'utf8');
let previous=-1;
for(const b of brands){const current=home.indexOf('id="brand-'+b.slug+'"');assert(current>previous,'Ranking order: '+b.name);previous=current;assert(home.includes(b.url.replaceAll('&','&amp;')));assert(home.includes(b.advantage));}
assert.equal(seo.length,213);
const titles=new Set(),descriptions=new Set();
let links=0;
for(const r of seo){const file=path.join(out,r.route==='/'?'index.html':r.route.slice(1)+'index.html');const html=fs.readFileSync(file,'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,r.route+' must have one h1');assert(html.includes('<html lang="zh-CN">'));assert(html.includes('href="https://fanqiangdaohang.blog'+r.route+'"'));assert(html.includes('三毛机场'));assert(!titles.has(r.title),'Duplicate title');titles.add(r.title);assert(!descriptions.has(r.description),'Duplicate description');descriptions.add(r.description);
for(const match of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs))JSON.parse(match[1]);
for(const match of html.matchAll(/(?:href|src)="([^"]+)"/g)){const u=match[1];if(!u.startsWith('/')||u.startsWith('//'))continue;const [url,anchor]=u.split('#');let target=path.join(out,url.split('?')[0].slice(1));if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');assert(fs.existsSync(target),`${r.route} broken link ${u}`);if(anchor)assert(fs.readFileSync(target,'utf8').includes(`id="${anchor}"`));links++;}
for(const match of html.matchAll(/<a[^>]+href="https:[^"]+"[^>]*>/g)){if(match[0].includes('target="_blank"'))assert(match[0].includes('noopener'));}
}
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');assert.equal((sitemap.match(/<loc>/g)||[]).length,213);
for(const r of seo)assert(sitemap.includes('https://fanqiangdaohang.blog'+r.route+'</loc>'));
assert(fs.readFileSync(path.join(out,'robots.txt'),'utf8').includes('Sitemap: https://fanqiangdaohang.blog/sitemap.xml'));
const report=`验证通过：213 个可索引页面、29 个品牌、11 个优惠码；${links} 个本地链接/资源检查通过。每页唯一标题、描述、一个 H1、canonical、有效 JSON-LD；sitemap 覆盖全部页面。\n此检查未验证外部入口所有权、优惠码有效性、实际套餐或 Bing 收录。\n`;
fs.writeFileSync(path.join(root,'docs/验证报告.txt'),report);console.log(report);
