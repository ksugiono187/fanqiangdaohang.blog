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
