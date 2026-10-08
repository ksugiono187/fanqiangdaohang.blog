const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const a=(href,label,cls='')=>`<a class="${cls}" href="${escape(href)}">${escape(label)}</a>`;
export function readingTools(route,body,index){
 const hasToc=body.includes('<aside class="toc"');
 if(hasToc)body=body.replace('<aside class="toc"','<aside id="article-toc" class="toc"');
 if(hasToc)body=body.replace(/(<aside id="article-toc"[^>]*>)<h2>本文目录<\/h2>([\s\S]*?)<\/aside>/,'$1<details class="toc-content" open><summary>本文目录</summary>$2</details></aside>');
 if(route==='/blog/'||route.startsWith('/blog/page/')){
  const finder=`<section class="wrap article-finder"><div><span class="eyebrow">QUICK FIND / 155篇文章</span><h2>想看什么？直接找到文章。</h2><p>输入品牌或问题，也可以按分类浏览。</p></div><button type="button" class="button primary" data-search-open>搜索全部文章 <span aria-hidden="true">⌕</span></button><div class="finder-categories">${['套餐预算','流量规划','线路兼容','使用观察','购买核对'].map(x=>`<button type="button" data-search-open data-start-category="${x}">${x} →</button>`).join('')}</div></section>`;
  body=body.replace(/(<section class="wrap article-head">[\s\S]*?<\/section>)/,'$1'+finder);
 }
 if(hasToc){
  const toolbar=`<div class="wrap reading-toolbar" aria-label="阅读快捷入口"><button type="button" data-search-open>搜索文章</button>${a('#article-toc','查看目录')}${a('/blog/','文章库')}${a('/topics/','选购专题')}${a('/compare/','机场对比')}</div>`;
  body=body.replace(/(<section class="wrap (?:article-head|brand-head)">[\s\S]*?<\/section>)/,'$1'+toolbar);
 }
 const pos=index.findIndex(x=>x.route===route);
 if(pos>=0){
  const prev=index[pos-1],next=index[pos+1];
  const pager=`<nav class="reading-pagination" aria-label="继续阅读">${prev?`<a href="${prev.route}" rel="prev"><small>← 上一篇</small><strong>${escape(prev.title)}</strong></a>`:'<span></span>'}${next?`<a href="${next.route}" rel="next"><small>下一篇 →</small><strong>${escape(next.title)}</strong></a>`:a('/blog/','回到文章库')}</nav>`;
  body=body.replace('</article><aside',pager+'</article><aside');
 }
 return body;
}
export function navigationUI(body){
 const hasToc=body.includes('id="article-toc"');
 return `<nav class="quick-dock" aria-label="随手导航"><button type="button" data-search-open><span aria-hidden="true">⌕</span>找文章</button>${a(hasToc?'#article-toc':'/topics/',hasToc?'☷ 目录':'☷ 专题')}${a('/compare/','⇄ 对比')}${a('#top','↑ 顶部')}</nav><dialog id="article-search" aria-labelledby="search-title"><div class="search-dialog-head"><div><span class="eyebrow">ARTICLE SEARCH</span><h2 id="search-title">找文章</h2></div><form method="dialog"><button type="submit" class="search-close" aria-label="关闭文章搜索">×</button></form></div><label class="article-query-label" for="article-query">品牌、关键词或选购问题</label><input type="search" id="article-query" placeholder="例如：微风、年付、专线、流量" autocomplete="off"><div class="search-category-list" aria-label="按文章分类筛选">${['全部','选购基础','套餐预算','流量规划','线路兼容','使用观察','购买核对','年度资料','榜单方法'].map(x=>`<button type="button" data-article-category="${x}" aria-pressed="${x==='全部'}">${x}</button>`).join('')}</div><p data-search-status role="status" aria-live="polite">打开后加载文章目录。</p><div class="article-search-results"></div><button type="button" class="button subtle" data-search-more hidden>显示更多文章</button><div class="search-dialog-footer">${a('/blog/','浏览完整文章库')}${a('/topics/','查看6个选购专题')}</div></dialog>`;
}
