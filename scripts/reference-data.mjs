import fs from 'node:fs';
const dataset=JSON.parse(fs.readFileSync(new URL('../data/reference-parameters.json',import.meta.url),'utf8'));
const aliases={sogo:'sogocloud',flyv:'fei-v',jilian:'jilianyun',guangnian:'lightyear',globalcloud:'globalcloud'};
const audiences={breezenet:'日常浏览、流媒体与在线工具用户',flycat:'同时关注预算与流量配置的用户',twilight:'需要核对专线与协议配置的中轻度用户',worryfree:'重视目标地区连接表现的用户',civet:'流量需求较高并关注线路类型的用户',flashleap:'优先比较专线范围与流量规则的用户',firefly:'能接受年付、月度流量需求较轻的用户',kuajie:'希望核对专线覆盖范围的用户',sogo:'关注专线配置与设备兼容的用户',yuzhou:'月度流量需求较轻的专线候选用户','2mao':'需要比较多种套餐与地区节点的用户','1fly':'流媒体与文件下载需求较多的用户',edgenova:'能接受年付并关注客户端易用性的用户',kosing:'希望控制月度预算的轻量用户',sujie:'希望简化客户端配置的新用户',kuaili:'能接受年付的轻量或备用用户',flyv:'预算较低、使用频率不固定的用户',laddercloud:'下载、视频或多设备流量需求较高的用户',wavenet:'关注流量配置与客户端使用方式的用户',lingdong:'需要清晰周期流量配置的用户',invisible:'同时关注专线资料与流量额度的用户',stardream:'关注专线配置与月度预算的用户',lightspeed:'希望比较多种套餐结构的用户',v2yun:'同时关注参考价、流量与专线配置的用户',u1s1:'希望观察不同运营商路径表现的用户',jilian:'希望比较专线入门方案的用户',globalcloud:'希望比较中转型套餐的用户',guangnian:'关注IEPL资料与参考价格的用户'};
export function referenceFor(slug){
 const sourceSlug=aliases[slug]||slug;
 const row=dataset.rows.find(row=>row.sourceUrl.endsWith('/'+sourceSlug));
 if(!row)return null;
 return {...row,audience:audiences[slug],retrieved:dataset.retrieved,priceBasis:row.price.includes('折算')?'年付折算月价':row.price.includes('/年')?'年付起价':row.price.includes('/月')?'月价参考（实际付款周期需核对）':'付款周期待确认',trafficCycle:row.traffic.includes('/月')?'来源标为每月':row.traffic.includes('GB')?'来源未明确流量周期':'额度与周期未明确',pairing:'来源为品牌级参考参数，未确认起步价与流量是否对应同一套餐'};
}
export function referenceMarkup(b,esc,link){
 const r=b.reference;
 if(!r)return `<section class="reference-block"><h2>价格与流量资料</h2><p>站长提供的旧博客未收录${esc(b.name)}，当前不填入价格、流量、线路或协议数值。已有资料定位保留，参数需要进一步补充。</p></section>`;
 return `<section class="reference-block" id="parameters"><h2>价格、流量与线路参数</h2><dl class="parameter-grid"><div><dt>参考起步价</dt><dd>${esc(r.price)}</dd><small>${esc(r.priceBasis)}</small></div><div><dt>参考流量</dt><dd>${esc(r.traffic)}</dd><small>${esc(r.trafficCycle)}</small></div><div><dt>线路资料</dt><dd>${esc(r.line)}</dd><small>来源描述，非线路认证</small></div><div><dt>协议 / 使用方式</dt><dd>${esc(r.protocol)}</dd><small>当前兼容性以服务商说明为准</small></div></dl><p class="parameter-note">${esc(r.pairing)}。年付折算价不能当作可按月购买的价格；本页不据此计算每 GB 成本。</p><p class="muted">资料：${link(r.sourceUrl,'站长提供的旧博客品牌页',true)} · ${link('https://jichang-tuijian.org/compare','原始对照表',true)} · 读取日期 ${r.retrieved}。订单价格与套餐可能调整。</p></section>`;
}
