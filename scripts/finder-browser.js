const finder=document.querySelector('[data-finder]');
if(finder){
 const rows=JSON.parse(document.getElementById('finder-data').textContent),results=document.querySelector('[data-finder-results]'),feedback=document.querySelector('[data-finder-feedback]');
 const values={budget:['0','10','20','30'],traffic:['0','50','100','150']},selected=new Set(),savedKey='sanmao-finder-v1';
 const apply=(data)=>{for(const key of ['budget','traffic'])finder.elements[key].value=values[key].includes(String(data[key]))?String(data[key]):'0';selected.clear();for(const slug of Array.isArray(data.brands)?data.brands:[])if(rows.some(r=>r.slug===slug)&&selected.size<4)selected.add(slug);};
 const params=new URLSearchParams(location.search);apply({budget:params.get('budget'),traffic:params.get('traffic'),brands:(params.get('brands')||'').split(',')});
 const current=()=>({budget:finder.elements.budget.value,traffic:finder.elements.traffic.value,brands:rows.filter(r=>selected.has(r.slug)).map(r=>r.slug)});
 const url=()=>{const u=new URL(location.href),data=current();u.search='';for(const key of ['budget','traffic'])if(data[key]!=='0')u.searchParams.set(key,data[key]);if(data.brands.length)u.searchParams.set('brands',data.brands.join(','));u.hash='';return u;};
 const toggle=(slug)=>{if(selected.has(slug)){selected.delete(slug);feedback.textContent='已移出对比。';}else if(selected.size>=4){feedback.textContent='最多选择4个品牌，请先移出一个。';return;}else{selected.add(slug);feedback.textContent='已加入对比，可选择2–4个品牌。';}render();};
 const renderBasket=()=>{const basket=document.querySelector('[data-finder-basket]');basket.replaceChildren();const heading=document.createElement('h2');heading.textContent='对比清单（'+selected.size+'/4）';basket.append(heading);
  for(const r of rows.filter(r=>selected.has(r.slug))){const remove=document.createElement('button');remove.type='button';remove.className='button subtle';remove.textContent='移出 '+r.name;remove.addEventListener('click',()=>toggle(r.slug));basket.append(remove);}
  const hint=document.createElement('p');hint.textContent=selected.size<2?'至少选择2个品牌。筛选条件变化不会清空已选品牌。':'对比表按原始目录顺序展示；参考字段仍需核对同一套餐。';basket.append(hint);
  const go=document.createElement('a');go.className='button primary';go.textContent='打开对比表 →';if(selected.size>=2)go.href='/compare/?brands='+current().brands.join(',');else{go.setAttribute('aria-disabled','true');go.classList.add('disabled');}basket.append(go);
 };
 const render=()=>{const budget=Number(finder.elements.budget.value),traffic=Number(finder.elements.traffic.value),groups={candidate:[],pending:[]};let excluded=0;
  for(const r of rows){const missing=[],amount=Number(r.price.replace(/,/g,'').match(/[\d.]+/)?.[0]),gb=Number(r.traffic.match(/([\d.]+)GB/i)?.[1]);
   if(budget&&r.price.includes('/月')&&amount>budget||traffic&&/每月/.test(r.trafficCycle)&&gb&&gb<traffic){excluded++;continue;}
   if(budget&&!r.price.includes('/月'))missing.push('月均参考价');if(traffic&&(!/每月/.test(r.trafficCycle)||!gb))missing.push('月度流量');groups[missing.length?'pending':'candidate'].push({r,missing});
  }
  results.replaceChildren();
  for(const [key,title] of [['candidate','参考字段符合条件，套餐仍需核对'],['pending','资料待确认']]){const section=document.createElement('section'),heading=document.createElement('h2');heading.textContent=title+'（'+groups[key].length+'）';section.append(heading);
   if(!groups[key].length){const p=document.createElement('p');p.textContent=key==='candidate'?'当前没有符合已知条件的候选，可放宽条件或查看待确认资料。':'没有待确认的匹配记录。';section.append(p);}
   for(const {r,missing} of groups[key]){const card=document.createElement('div');card.className='finder-card';const a=document.createElement('a');a.href='/brands/'+r.slug+'/';a.textContent=r.name;const p=document.createElement('p');p.textContent=r.price+' · '+r.traffic+' · '+r.trafficCycle;const note=document.createElement('small');note.textContent=missing.length?'需要确认：'+missing.join('、'):r.priceBasis+'；购买前核对同一套餐与实际付款总额';const pairing=document.createElement('p');pairing.className='pairing-alert';pairing.textContent=r.provenance==='owner'?'价格与流量：站长提供配对；付款与流量周期待确认。':'价格与流量未确认属于同一套餐，不能据此判断套餐满足预算和用量。';const button=document.createElement('button');button.type='button';button.className='button subtle';button.setAttribute('aria-pressed',String(selected.has(r.slug)));button.textContent=selected.has(r.slug)?'移出对比：'+r.name:'加入对比：'+r.name;button.addEventListener('click',()=>toggle(r.slug));card.append(a,p,pairing,note,button);section.append(card);}results.append(section);
  }
  document.querySelector('[data-finder-status]').textContent='候选 '+groups.candidate.length+' 个 · 待确认 '+groups.pending.length+' 个 · 已知条件不符 '+excluded+' 个';renderBasket();history.replaceState(null,'',url());
 };
 finder.addEventListener('change',render);finder.addEventListener('reset',()=>setTimeout(()=>{feedback.textContent='筛选已重置，对比清单保留。';render();},0));
 document.querySelector('[data-finder-save]').addEventListener('click',()=>{try{localStorage.setItem(savedKey,JSON.stringify(current()));feedback.textContent='筛选条件与对比清单已保存到本浏览器。';}catch{feedback.textContent='浏览器无法保存，请复制分享链接保留条件。';}});
 document.querySelector('[data-finder-restore]').addEventListener('click',()=>{try{const data=JSON.parse(localStorage.getItem(savedKey)||'null');if(!data||typeof data!=='object'){feedback.textContent='本浏览器尚未保存筛选条件。';return;}apply(data);render();feedback.textContent='已恢复保存的筛选条件与对比清单。';}catch{feedback.textContent='无法读取保存的条件，可重新筛选并保存。';}});
 document.querySelector('[data-finder-share]').addEventListener('click',async()=>{const share=document.querySelector('[data-finder-share-url]');share.hidden=false;share.value=url().href;try{await navigator.clipboard.writeText(share.value);feedback.textContent='已复制分享链接，包含筛选条件与对比清单。';}catch{feedback.textContent='请手动复制下方分享链接。';}});render();
}
