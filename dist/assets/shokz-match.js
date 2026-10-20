(function(global){
 'use strict';
 const defaults={hybrid_audio:50,battery:60,protection:60,lightweight:40,quick_charge:40,budget:70};
 function baseScores(m,models,currency){
  const lightest=Math.min(...models.map(x=>x.weight));
  const cheapest=Math.min(...models.map(x=>Number(x[currency])));
  const bestTopup=Math.max(...models.map(x=>x.quickHours/x.quickMinutes));
  return {hybrid_audio:m.hybrid?100:0,battery:m.battery/12*100,protection:m.ip==='IP67'?100:70,lightweight:lightest/m.weight*100,quick_charge:(m.quickHours/m.quickMinutes)/bestTopup*100,budget:cheapest/Number(m[currency])*100};
 }
 function rank(models,weights,{size='any',currency='usd',pure=false}={}){
  const total=Object.keys(defaults).reduce((n,k)=>n+Number(weights[k]||0),0);
  const result=models.map((m,index)=>{const scores=baseScores(m,models,currency);const excluded=[];if(size!=='any'&&m.size!==size)excluded.push('Outside your selected fit');if(pure&&m.hybrid)excluded.push('Outside your bone-conduction-only preference');return {...m,index,scores,score:total?Object.keys(defaults).reduce((n,k)=>n+scores[k]*Number(weights[k]||0),0)/total:null,eligible:!excluded.length,excluded};});
  return result.sort((a,b)=>Number(b.eligible)-Number(a.eligible)||(b.score??0)-(a.score??0)||a.index-b.index);
 }
 const api={defaults,baseScores,rank};
 if(typeof module!=='undefined'&&module.exports)module.exports=api;
 if(!global.document)return;
 const dataEl=document.getElementById('match-data');if(!dataEl)return;
 const {models,dimensions}=JSON.parse(dataEl.textContent);
 const el=id=>document.getElementById(id),size=el('match-size'),currency=el('match-currency'),pure=el('match-pure');
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const weights=()=>Object.fromEntries(dimensions.map(d=>[d.key,Number(el('priority-'+d.key).value)]));
 function reason(item,w){
  const labels={hybrid_audio:'the hybrid sound design you prioritised',battery:'longer claimed battery life',protection:'a higher stated water-resistance rating',lightweight:'lower listed weight',quick_charge:'faster claimed top-ups',budget:'a lower stored price'};
  const picks=Object.keys(defaults).filter(k=>w[k]>0&&item.scores[k]>=95).sort((a,b)=>w[b]-w[a]).slice(0,2);
  return picks.length?'Matches your priorities for '+picks.map(k=>labels[k]).join(' and ')+'.':'The closest weighted match among the models that meet your selected preferences.';
 }
 function render(){
  const w=weights(),items=rank(models,w,{size:size.value,currency:currency.value,pure:pure.checked});
  const hasWeights=Object.values(w).some(v=>v>0),eligible=items.filter(m=>m.eligible),top=eligible[0];
  el('match-count').textContent=eligible.length+' of 5 eligible';
  el('match-status').textContent=!hasWeights?'Move at least one slider to get a match.':!top?'No models match both filters. Try changing the size or bone-conduction-only preference.':eligible.length>1&&top.score-eligible[1].score<.5?'Close match — compare the highlighted models for fit before choosing.':'Your closest match: '+top.name+'.';
  el('match-ranking').innerHTML=items.map((m,i)=>{
   const winner=hasWeights&&m.eligible&&m===top;
   const close=hasWeights&&m.eligible&&top&&top.score-m.score<.5&&eligible.filter(x=>top.score-x.score<.5).length>1;
   const flag=winner?'Your closest match':close?'Close match':m.eligible?'':'Outside your preferences';
   const price=currency.value==='usd'?'$'+m.usd:'€'+m.eur;
   return `<li class="match-item${winner?' best-match':''}${!m.eligible?' outside-match':''}" data-model="${m.id}" data-eligible="${m.eligible}">${flag?`<span class="match-flag">${esc(flag)}${winner&&close?' · Close match':''}</span>`:''}<div class="match-product"><span class="match-position">${i+1}.</span><h3>${esc(m.name)}</h3><span class="match-score">${hasWeights?m.score.toFixed(1):'—'}<span> / 100</span></span></div>${winner?`<p class="match-reason">${esc(reason(m,w))}</p>`:''}${!m.eligible?`<p class="match-excluded">${m.excluded.map(esc).join(' · ')}</p>`:''}<div class="match-buy"><span>${price}</span><a href="${esc(m.url)}" target="_blank" rel="sponsored noopener noreferrer">View at Amazon ↗</a></div></li>`;
  }).join('');
  for(const d of dimensions){const input=el('priority-'+d.key);el('value-'+d.key).value=input.value;input.style.setProperty('--fill',input.value+'%');}
 }
 for(const d of dimensions)el('priority-'+d.key).addEventListener('input',render);
 for(const input of [size,currency,pure])input.addEventListener('change',render);
 el('match-reset').addEventListener('click',()=>{for(const d of dimensions)el('priority-'+d.key).value=d.value;size.value='any';currency.value='usd';pure.checked=false;hideTip(true);render();});
 const tip=el('score-tooltip');let active=null,pinned=false;
 function place(x,y,focus=false){
  const rect=tip.getBoundingClientRect(),gap=14;
  let left=x+gap,top=y+gap;
  if(left+rect.width>innerWidth-10)left=x-rect.width-gap;
  if(top+rect.height>innerHeight-10)top=y-rect.height-gap;
  if(focus){const area=el('priorities').getBoundingClientRect();left=Math.max(10,Math.min(innerWidth-rect.width-10,x));top=y+gap;if(top+rect.height>innerHeight-10)top=Math.max(10,y-rect.height-gap);}
  tip.style.left=Math.max(10,Math.min(innerWidth-rect.width-10,left))+'px';tip.style.top=Math.max(10,Math.min(innerHeight-rect.height-10,top))+'px';
 }
 function showTip(control,event,focus=false){active=control;const dimension=dimensions.find(d=>d.key===control.dataset.rule);tip.querySelector('p').textContent=dimension.tip;tip.hidden=false;const r=control.getBoundingClientRect();place(event?.clientX??r.left,event?.clientY??r.bottom,focus);}
 function hideTip(force=false){if(pinned&&!force)return;tip.hidden=true;active=null;if(force){pinned=false;document.querySelectorAll('.rule-info').forEach(b=>b.setAttribute('aria-expanded','false'));}}
 for(const control of document.querySelectorAll('.priority-control')){
  const button=control.querySelector('.rule-info');
  control.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!pinned)showTip(control,e);});
  control.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!pinned){showTip(control,e);}});
  control.addEventListener('pointerleave',()=>hideTip());
  control.addEventListener('focusin',()=>{if(!pinned)showTip(control,null,true);});
  control.addEventListener('focusout',e=>{if(!control.contains(e.relatedTarget))hideTip(true);});
  button.addEventListener('click',()=>{if(pinned&&active===control){hideTip(true);button.setAttribute('aria-expanded','false');}else{pinned=true;showTip(control,null,true);document.querySelectorAll('.rule-info').forEach(b=>b.setAttribute('aria-expanded',String(b===button)));}});
 }
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.rule-info')&&!tip.contains(e.target))hideTip(true);});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){hideTip(true);document.querySelectorAll('.rule-info').forEach(b=>b.setAttribute('aria-expanded','false'));}});
 global.addEventListener('scroll',()=>{if(pinned&&active){const r=active.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)hideTip(true);else showTip(active,null,true);}else hideTip(true);},{passive:true});global.addEventListener('resize',()=>hideTip(true));
 // Persistent, non-modal product shortcuts; links retain the owner's affiliate URLs.
 const shortcuts=document.createElement('aside');shortcuts.className='product-shortcuts';shortcuts.setAttribute('aria-label','Quick product links');
 shortcuts.innerHTML=`<section id="quick-products" class="quick-products" role="dialog" aria-modal="false" aria-labelledby="quick-products-title" hidden><div class="quick-products-head"><h2 id="quick-products-title">The Shokz lineup</h2><button type="button" class="quick-products-close" aria-label="Close product list">×</button></div><p>Choose a model to view it at Amazon.</p><ul>${models.map(m=>`<li><span>${esc(m.name)}</span><a href="${esc(m.url)}" target="_blank" rel="sponsored noopener noreferrer" aria-label="View ${esc(m.name)} at Amazon">Amazon <span aria-hidden="true">↗</span></a></li>`).join('')}</ul></section><button type="button" id="quick-products-toggle" class="quick-products-toggle" aria-label="Open product list" aria-controls="quick-products" aria-expanded="false" aria-haspopup="dialog" title="Product links"><svg width="27" height="27" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8.5h16l1.5 16h-19l1.5-16Z"/><path d="M10 9V6a4 4 0 0 1 8 0v3M9.5 14h9M9.5 18h9"/></svg><span class="sr-only">Five Shokz products</span></button>`;
 document.body.append(shortcuts);
 const productsPanel=el('quick-products'),productsToggle=el('quick-products-toggle');
 function closeProducts(restoreFocus=false){productsPanel.hidden=true;productsToggle.setAttribute('aria-expanded','false');productsToggle.setAttribute('aria-label','Open product list');if(restoreFocus)productsToggle.focus();}
 productsToggle.addEventListener('click',()=>{if(!productsPanel.hidden){closeProducts();return;}productsPanel.hidden=false;productsToggle.setAttribute('aria-expanded','true');productsToggle.setAttribute('aria-label','Close product list');productsPanel.querySelector('.quick-products-close').focus({preventScroll:true});});
 shortcuts.querySelector('.quick-products-close').addEventListener('click',()=>closeProducts(true));
 document.addEventListener('pointerdown',e=>{if(!shortcuts.contains(e.target))closeProducts();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!productsPanel.hidden)closeProducts(true);});
 shortcuts.addEventListener('focusout',e=>{if(e.relatedTarget&&!shortcuts.contains(e.relatedTarget))closeProducts();});
 render();
})(typeof window==='undefined'?globalThis:window);
