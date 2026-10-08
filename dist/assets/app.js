document.addEventListener('click', async event => {
  const button = event.target.closest('[data-copy]');
  if (!button) return;
  const toast = document.querySelector('.toast');
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    toast.textContent = '已复制优惠码：' + button.dataset.copy;
  } catch {
    toast.textContent = '请手动复制优惠码：' + button.dataset.copy;
  }
  toast.classList.add('visible');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('visible'), 3500);
});
// Comparison columns preserve the publisher's original brand order.
const compareInputs = [...document.querySelectorAll('[data-compare-select]')];
if (compareInputs.length) {
  const requested = new Set((new URLSearchParams(location.search).get('brands') || '').split(',').filter(slug => compareInputs.some(input => input.dataset.compareSelect === slug)));
  if (requested.size >= 2 && requested.size <= 4) compareInputs.forEach(input => { input.checked = requested.has(input.dataset.compareSelect); });
  const status = document.querySelector('#compare-status');
  const paint = () => {
    const selected = new Set(compareInputs.filter(input => input.checked).map(input => input.dataset.compareSelect));
    document.querySelectorAll('[data-compare-brand]').forEach(cell => { cell.hidden = !selected.has(cell.dataset.compareBrand); });
    status.textContent = `已选 ${selected.size} 个品牌，可选择 2–4 个。表格保持原有目录顺序。`;
  };
  compareInputs.forEach(input => input.addEventListener('change', () => {
    const count = compareInputs.filter(item => item.checked).length;
    if (count > 4 || count < 2) {
      input.checked = !input.checked;
      status.textContent = count > 4 ? '最多对比 4 个品牌，请先取消一个候选。' : '请至少保留 2 个品牌进行对比。';
      return;
    }
    paint();
  }));
  document.querySelector('[data-compare-reset]').addEventListener('click', () => {
    compareInputs.forEach((input, index) => { input.checked = index < 3; });
    paint();
  });
  paint();
}
// Catalog discovery filters data while keeping the publisher's directory order.
const catalog = document.querySelector('#brands');
if (catalog) {
  const search = catalog.querySelector('[data-brand-query]');
  const filters = [...catalog.querySelectorAll('[data-brand-filter]')];
  const cards = [...catalog.querySelectorAll('.brand-card[data-brand-search]')];
  let category = 'all';
  const updateCatalog = () => {
    const query = search.value.trim().toLocaleLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesQuery = card.dataset.brandSearch.toLocaleLowerCase().includes(query);
      const matchesCategory = category === 'all' || card.dataset.brandCategory.split(' ').includes(category);
      card.hidden = !(matchesQuery && matchesCategory);
      if (!card.hidden) visible++;
    });
    catalog.querySelector('[data-brand-status]').textContent = `${visible} / ${cards.length} 个品牌 · 保持目录顺序`;
    catalog.querySelector('[data-brand-empty]').hidden = visible !== 0;
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.brandFilter === category)));
  };
  search.addEventListener('input', updateCatalog);
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.brandFilter; updateCatalog(); }));
  updateCatalog();
}
// Global article search: no third-party services; all results come from the static article index.
const articleDialog = document.querySelector('#article-search');
if (articleDialog) {
  const query = articleDialog.querySelector('#article-query');
  const status = articleDialog.querySelector('[data-search-status]');
  const resultList = articleDialog.querySelector('.article-search-results');
  const more = articleDialog.querySelector('[data-search-more]');
  const categories = [...articleDialog.querySelectorAll('[data-article-category]')];
  let index = null, loading = null, category = '全部', limit = 12;
  function renderResults() {
    if (!index) return;
    const terms = query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    const matches = index.filter(p => (category === '全部' || p.category === category) && terms.every(t => (p.title+' '+p.description).toLocaleLowerCase().includes(t)));
    resultList.replaceChildren();
    matches.slice(0, limit).forEach(p => {
      const link = document.createElement('a'); link.href=p.route; link.className='article-result';
      const label=document.createElement('small'); label.textContent=p.category;
      const title=document.createElement('strong'); title.textContent=p.title;
      const summary=document.createElement('span'); summary.textContent=p.description;
      link.append(label,title,summary); resultList.append(link);
    });
    status.textContent = matches.length ? `找到 ${matches.length} 篇文章，显示 ${Math.min(limit,matches.length)} 篇。` : '没有匹配的文章，可修改关键词或切换到全部分类。';
    more.hidden = matches.length <= limit;
    categories.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.articleCategory===category)));
  }
  async function loadIndex() {
    if(index)return;
    if(!loading)loading=fetch('/data/articles.json').then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>{index=data;}).catch(()=>{loading=null;status.textContent='文章目录暂时加载失败，请重新打开搜索，或浏览下方完整文章库。';});
    await loading;
  }
  async function openSearch(button) {
    if(button?.dataset.startCategory){category=button.dataset.startCategory;query.value='';limit=12;}
    if(!articleDialog.open)articleDialog.showModal();
    query.focus(); status.textContent=index?'正在筛选文章…':'正在加载文章目录…';
    await loadIndex(); renderResults();
  }
  document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',()=>openSearch(b)));
  query.addEventListener('input',()=>{limit=12;renderResults();});
  categories.forEach(b=>b.addEventListener('click',()=>{category=b.dataset.articleCategory;limit=12;renderResults();}));
  more.addEventListener('click',()=>{limit+=12;renderResults();});
  articleDialog.addEventListener('click',e=>{if(e.target===articleDialog){const r=articleDialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)articleDialog.close();}});
  document.addEventListener('keydown',e=>{if(e.isComposing||e.target.closest('input,textarea,select,[contenteditable]'))return;if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openSearch();}});
}

const tocContent=document.querySelector('#article-toc .toc-content');
if(tocContent){if(matchMedia('(max-width:700px)').matches)tocContent.open=false;document.querySelectorAll('a[href="#article-toc"]').forEach(a=>a.addEventListener('click',()=>{tocContent.open=true;}));}
// Private reading preferences: stored only in this browser, never sent to a server.
const readingHistory=document.querySelector('#reading-history');
if(readingHistory){
 const storageKey='sanmao.reading.v1',notice=readingHistory.querySelector('[data-reading-status]');
 let reading={favorites:[],recent:[]},storageAvailable=true;
 const valid=x=>x&&typeof x.route==='string'&&/^\/(blog|guides|brands)\/[a-z0-9\-/]+\/$/.test(x.route)&&typeof x.title==='string';
 try{const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){reading.favorites=(Array.isArray(saved.favorites)?saved.favorites:[]).filter(valid).slice(0,100);reading.recent=(Array.isArray(saved.recent)?saved.recent:[]).filter(valid).slice(0,20);}}catch{storageAvailable=false;}
 const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify(reading));}catch{storageAvailable=false;}notice.textContent=storageAvailable?'记录只保存在当前浏览器。':'浏览器未允许持久保存，本次页面内仍可使用收藏。';};
 const bookmark=document.querySelector('[data-bookmark]');
 const current={route:location.pathname,title:document.querySelector('h1')?.textContent.trim()||document.title,progress:0,anchor:''};
 const updateBookmark=()=>{if(!bookmark)return;const active=reading.favorites.some(x=>x.route===current.route);bookmark.setAttribute('aria-pressed',String(active));bookmark.textContent=active?'已收藏 ✓':'收藏本文';};
 const drawList=(node,items,removable)=>{node.replaceChildren();if(!items.length){const empty=document.createElement('p');empty.className='reading-empty';empty.textContent=removable?'还没有收藏。在文章或品牌页面点击“收藏本文”。':'还没有阅读记录。打开文章、专题或品牌详情后会记录。';node.append(empty);return;}
 items.forEach(item=>{const row=document.createElement('div');row.className='saved-reading-row';const a=document.createElement('a');a.href=item.route+(item.anchor&&/^[a-zA-Z0-9_-]+$/.test(item.anchor)?'#'+item.anchor:'');a.textContent=item.title;row.append(a);if(!removable){const p=document.createElement('small');p.textContent='阅读进度 '+Math.min(100,Math.max(0,Number(item.progress)||0))+'%';row.append(p);}else{const remove=document.createElement('button');remove.type='button';remove.textContent='取消收藏';remove.setAttribute('aria-label','取消收藏 '+item.title);remove.addEventListener('click',()=>{reading.favorites=reading.favorites.filter(x=>x.route!==item.route);persist();drawHistory();updateBookmark();});row.append(remove);}node.append(row);});};
 const drawHistory=()=>{drawList(readingHistory.querySelector('[data-favorite-list]'),reading.favorites,true);drawList(readingHistory.querySelector('[data-recent-list]'),reading.recent,false);notice.textContent=storageAvailable?'记录只保存在当前浏览器。':'浏览器未允许持久保存，本次页面内仍可使用收藏。';};
 document.querySelectorAll('[data-reading-open]').forEach(b=>b.addEventListener('click',()=>{if(articleDialog?.open)articleDialog.close();drawHistory();if(!readingHistory.open)readingHistory.showModal();}));
 readingHistory.querySelector('[data-clear-recent]').addEventListener('click',()=>{reading.recent=[];persist();drawHistory();});
 if(bookmark){updateBookmark();bookmark.addEventListener('click',()=>{if(reading.favorites.some(x=>x.route===current.route))reading.favorites=reading.favorites.filter(x=>x.route!==current.route);else reading.favorites.unshift({...current});reading.favorites=reading.favorites.slice(0,100);persist();updateBookmark();});}
 const prose=document.querySelector('.article-grid>.prose'),bar=document.querySelector('.reading-progress');
 if(prose&&valid(current)){
  const previous=reading.recent.find(x=>x.route===current.route);reading.recent=[{...current,...(previous||{}),title:current.title},...reading.recent.filter(x=>x.route!==current.route)].slice(0,20);persist();bar.hidden=false;
  let pending=false,timer;
  const saveProgress=()=>{const record=reading.recent.find(x=>x.route===current.route);if(record)Object.assign(record,current);persist();};
  const paint=()=>{pending=false;const rect=prose.getBoundingClientRect(),distance=Math.max(1,prose.offsetHeight-innerHeight+120);const value=Math.max(0,Math.min(100,Math.round((120-rect.top)/distance*100)));current.progress=value;const passed=[...prose.querySelectorAll('section[id]')].filter(s=>s.getBoundingClientRect().top<=160);current.anchor=passed.length?passed[passed.length-1].id:'';bar.querySelector('span').style.width=value+'%';bar.setAttribute('aria-valuenow',String(value));};
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(paint);}clearTimeout(timer);timer=setTimeout(saveProgress,800);},{passive:true});
  addEventListener('pagehide',saveProgress);paint();
 }
}
const correctionForm=document.querySelector('[data-correction-form]');
const finder=document.querySelector('[data-finder]');
if(finder){
 const rows=JSON.parse(document.getElementById('finder-data').textContent);
 const results=document.querySelector('[data-finder-results]');
 const render=()=>{
  const budget=Number(finder.elements.budget.value),traffic=Number(finder.elements.traffic.value),devices=Number(finder.elements.devices.value);
  const groups={candidate:[],pending:[]};let excluded=0;
  for(const r of rows){const missing=[];const amount=Number(r.price.replace(/,/g,'').match(/[\d.]+/)?.[0]);const gb=Number(r.traffic.match(/([\d.]+)GB/i)?.[1]);
   if(budget&&r.price.includes('/月')&&amount>budget||traffic&&/每月/.test(r.trafficCycle)&&gb&&gb<traffic){excluded++;continue;}
   if(budget&&!r.price.includes('/月'))missing.push('月均参考价');if(traffic&&(!/每月/.test(r.trafficCycle)||!gb))missing.push('月度流量');if(devices)missing.push('设备限制');
   groups[missing.length?'pending':'candidate'].push({r,missing});
  }
  results.replaceChildren();
  for(const [key,title] of [['candidate','符合已知参考条件'],['pending','资料待确认']]){const section=document.createElement('section'),heading=document.createElement('h2');heading.textContent=title+'（'+groups[key].length+'）';section.append(heading);
   if(!groups[key].length){const p=document.createElement('p');p.textContent=key==='candidate'?'当前没有符合已知条件的候选，可放宽条件或查看待确认资料。':'没有待确认的匹配记录。';section.append(p);}
   for(const {r,missing} of groups[key]){const card=document.createElement('div');card.className='finder-card';const a=document.createElement('a');a.href='/brands/'+r.slug+'/';a.textContent=r.name;const p=document.createElement('p');p.textContent=r.price+' · '+r.traffic+' · '+r.trafficCycle;const note=document.createElement('small');note.textContent=missing.length?'需要确认：'+missing.join('、'):r.priceBasis+'；购买前核对同一套餐与实际付款总额';card.append(a,p,note);section.append(card);}results.append(section);
  }
  document.querySelector('[data-finder-status]').textContent='候选 '+groups.candidate.length+' 个 · 待确认 '+groups.pending.length+' 个 · 已知条件不符 '+excluded+' 个';
 };
 finder.addEventListener('change',render);finder.addEventListener('reset',()=>setTimeout(render,0));render();
}
const usageForm=document.querySelector('[data-usage-form]');
if(usageForm){
 const key='sanmao-usage-v1',list=document.querySelector('[data-usage-list]'),status=document.querySelector('[data-usage-status]');let records=[];
 try{const saved=JSON.parse(localStorage.getItem(key)||'[]');records=Array.isArray(saved)?saved.filter(r=>r&&typeof r.id==='string'&&['brand','date','device','network','node','result'].every(k=>typeof r[k]==='string')).slice(0,100):[];}catch{status.textContent='无法读取本机记录。';}
 const save=()=>{try{localStorage.setItem(key,JSON.stringify(records));return true;}catch{status.textContent='浏览器无法保存，请使用导出记录保留资料。';return false;}};
 const render=()=>{list.replaceChildren();if(!records.length){const p=document.createElement('p');p.textContent='还没有使用记录。填写一次真实观察后会显示在这里。';list.append(p);}
  for(const r of records){const card=document.createElement('section');card.className='finder-card';const h=document.createElement('h2');h.textContent=r.brand+' · '+r.date.replace('T',' ');const p=document.createElement('p');p.textContent=r.device+' / '+r.network+' / '+r.node;const result=document.createElement('p');result.textContent=r.result;const remove=document.createElement('button');remove.className='button subtle';remove.type='button';remove.textContent='删除这条记录';remove.addEventListener('click',()=>{records=records.filter(x=>x.id!==r.id);save();render();status.textContent='已删除这条记录。';});card.append(h,p,result,remove);list.append(card);}
 };
 usageForm.addEventListener('submit',e=>{e.preventDefault();if(!usageForm.reportValidity())return;if(records.length>=100){status.textContent='已保存100条，请导出并删除旧记录后再添加。';return;}const data=new FormData(usageForm);records.unshift({id:crypto.randomUUID(),brand:usageForm.elements.brand.selectedOptions[0].textContent,...Object.fromEntries(['date','device','network','node','result'].map(k=>[k,String(data.get(k)).trim()]))});if(save())status.textContent='已保存到本浏览器，未上传或公开。';render();});
 document.querySelector('[data-usage-export]').addEventListener('click',()=>{if(!records.length){status.textContent='还没有可导出的记录。';return;}const url=URL.createObjectURL(new Blob([JSON.stringify({description:'个人填写的使用观察，非本站独立实测',records},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='三毛机场-个人使用记录.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);status.textContent='已生成本机记录导出文件。';});render();
}
if(correctionForm){
 const source=correctionForm.querySelector('[name=page]'),details=correctionForm.querySelector('[name=details]'),type=correctionForm.querySelector('[name=type]');
 const requested=new URLSearchParams(location.search).get('page');
 if(requested&&/^\/[a-z0-9/?=#,_-]*$/i.test(requested))source.value=location.origin+requested;
 const body=()=>`页面：${source.value.trim()}\n类型：${type.value}\n\n需要更正的内容与公开依据：\n${details.value.trim()}\n\n请核对价格、流量、周期或链接后更新。`;
 const status=correctionForm.querySelector('[data-correction-status]');
 correctionForm.addEventListener('submit',e=>{e.preventDefault();if(!correctionForm.reportValidity())return;const url=new URL('https://github.com/ksugiono187/fanqiangdaohang.blog/issues/new');url.searchParams.set('title','资料更正：'+type.value);url.searchParams.set('body',body());const link=correctionForm.querySelector('[data-correction-link]');link.href=url.href;link.hidden=false;status.textContent='反馈草稿已生成。点击下方按钮，在GitHub核对并提交；本站尚未发送。';});
 correctionForm.querySelector('[data-correction-copy]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(body());status.textContent='已复制反馈文字，可自行保存或提交。';}catch{status.textContent='复制失败，请手动复制表单中的文字。';}});
}
