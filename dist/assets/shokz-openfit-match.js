(function(global){
 'use strict';
 const keys=['price','weight','battery','charging','buttons','noise'];
 function baseScores(m,models,noiseOn=false){
  const cheapest=Math.min(...models.map(x=>x.price)),lightest=Math.min(...models.map(x=>x.weight));
  const hours=m.noise&&noiseOn?6:m.hours,total=m.noise&&noiseOn?24:m.total;
  return {price:cheapest/m.price*10,weight:lightest/m.weight*10,battery:5*(hours/12+total/50),charging:(m.quick/4*10+(m.wireless?10:0))/2,buttons:m.buttons?10:0,noise:m.noise?10:0};
 }
 function rank(models,weights,noiseOn=false){
  const total=keys.reduce((s,k)=>s+Number(weights[k]||0),0);
  const items=models.map((m,index)=>{const parts=baseScores(m,models,noiseOn);return {...m,index,parts,score:total?keys.reduce((s,k)=>s+parts[k]*Number(weights[k]||0),0)/total*10:null};});
  items.sort((a,b)=>(b.score??0)-(a.score??0)||a.index-b.index);
  let last=null,place=0;return items.map((m,i)=>{const display=m.score===null?null:m.score.toFixed(1);if(display!==last){place=i+1;last=display;}return {...m,place:m.score===null?null:place};});
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={baseScores,rank};
 if(!global.document)return;
 const data=document.getElementById('of-match-data');if(!data)return;
 const {models,dimensions}=JSON.parse(data.textContent),get=id=>document.getElementById(id);
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const reasonText={price:'A lower listed price helps its match.',weight:'Lower earbud weight helps its match.',battery:'Longer listed listening time helps its match.',charging:'Quick top-ups and charging features help its match.',buttons:'Press controls match your preference.',noise:'The noise reduction option matches your preference.'};
 function render(){
  const weights=Object.fromEntries(dimensions.map(d=>[d.key,Number(get('of-weight-'+d.key).value)]));
  const total=keys.reduce((n,k)=>n+weights[k],0),noiseOn=document.querySelector('input[name="of-pro-mode"]:checked').value==='on';
  const items=rank(models,weights,noiseOn);
  for(const d of dimensions){const i=get('of-weight-'+d.key),share=total?Math.round(weights[d.key]/total*100):0;get('of-value-'+d.key).textContent=weights[d.key]+'%';i.style.setProperty('--of-fill',Number(i.value)+'%');i.setAttribute('aria-valuetext',weights[d.key]+' percent');}
  get('of-match-status').textContent=total?'Your closest match: '+items.filter(x=>x.place===1).map(x=>x.name).join(' and ')+'.':'Choose at least one priority to see your matches.';
  get('of-match-ranking').innerHTML=items.map(m=>{
   const contributions=keys.filter(k=>weights[k]>0&&m.parts[k]>0).sort((a,b)=>weights[b]*m.parts[b]-weights[a]*m.parts[a]);
   const reason=total&&contributions.length?reasonText[contributions[0]]:'Choose a priority to compare this model.';
   return `<li class="of-result${m.place===1?' of-best':''}" data-model="${m.id}"><div class="of-result-top"><span class="of-place">${m.place===null?'—':m.place+'.'}</span><h4 class="of-result-name">${esc(m.name)}</h4><strong class="of-score">${m.score===null?'—':m.score.toFixed(1)}<small> / 100</small></strong></div><div class="of-score-bar" role="meter" aria-label="${esc(m.name)} match score" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.score??0}" aria-valuetext="${m.score===null?'No score until a priority is selected':m.score.toFixed(1)+' out of 100'}"><span style="width:${m.score??0}%"></span></div><div class="of-result-bottom"><span class="of-result-price">€${m.price}</span><p class="of-result-reason">${esc(reason)}</p></div></li>`;
  }).join('');
 }
 dimensions.forEach(d=>get('of-weight-'+d.key).addEventListener('input',render));
 document.querySelectorAll('input[name="of-pro-mode"]').forEach(r=>r.addEventListener('change',render));
 get('of-reset-priorities').addEventListener('click',()=>{dimensions.forEach(d=>{const input=get('of-weight-'+d.key);input.value=input.defaultValue;});render();});
 render();
 const tip=get('of-score-tip'),buttons=[...document.querySelectorAll('.of-info')];let active=null,pinned=false,timer=null,suppressFocus=false;
 function position(){
  if(!active||tip.hidden)return;
  tip.style.maxHeight=(innerHeight-24)+'px';
  const r=active.getBoundingClientRect(),t=tip.getBoundingClientRect(),gap=12;
  let left,top;
  if(r.right+gap+t.width<=innerWidth-12){left=r.right+gap;top=Math.max(12,Math.min(r.top-8,innerHeight-t.height-12));}
  else if(r.left-gap-t.width>=12){left=r.left-gap-t.width;top=Math.max(12,Math.min(r.top-8,innerHeight-t.height-12));}
  else{
   left=Math.max(12,Math.min(r.left,innerWidth-t.width-12));
   const below=innerHeight-r.bottom-gap-12,above=r.top-gap-12;
   if(below>=t.height){top=r.bottom+gap;}
   else if(above>=t.height){top=r.top-gap-t.height;}
   else if(below>=above){top=r.bottom+gap;tip.style.maxHeight=Math.max(1,below)+'px';}
   else{top=12;tip.style.maxHeight=Math.max(1,above)+'px';}
  }
  tip.style.left=left+'px';tip.style.top=top+'px';
 }
 function hide(refocus=false){clearTimeout(timer);const old=active;if(old)old.setAttribute('aria-expanded','false');tip.hidden=true;active=null;pinned=false;if(refocus&&old){suppressFocus=true;old.focus();suppressFocus=false;}}
 function show(btn,pin=false){document.dispatchEvent(new CustomEvent('of:score-tip-open'));clearTimeout(timer);if(active&&active!==btn)active.setAttribute('aria-expanded','false');active=btn;pinned=pin;const d=dimensions.find(d=>d.key===btn.dataset.dimension);get('of-tip-title').textContent=d.label;get('of-tip-copy').textContent=d.help;get('of-tip-formula').textContent=d.formula;get('of-tip-note').textContent=d.note;get('of-tip-note').hidden=!d.note;tip.hidden=false;btn.setAttribute('aria-expanded','true');position();}
 function delayedHide(){clearTimeout(timer);timer=setTimeout(()=>{if(!pinned&&!tip.matches(':hover')&&document.activeElement!==active&&!tip.contains(document.activeElement))hide();},160);}
 for(const btn of buttons){btn.addEventListener('mouseenter',()=>{if(!pinned)show(btn);});btn.addEventListener('mouseleave',delayedHide);btn.addEventListener('focus',()=>{if(!suppressFocus)show(btn);});btn.addEventListener('blur',delayedHide);btn.addEventListener('click',()=>{if(active===btn&&pinned)hide();else{show(btn,true);tip.focus({preventScroll:true});}});}
 tip.addEventListener('mouseenter',()=>clearTimeout(timer));tip.addEventListener('mouseleave',delayedHide);tip.addEventListener('focusout',delayedHide);tip.querySelector('.of-tip-close').addEventListener('click',()=>hide(true));
 document.addEventListener('of:products-open',()=>hide());
 document.addEventListener('click',e=>{if(active&&!tip.contains(e.target)&&!buttons.some(b=>b.contains(e.target)))hide();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&active){e.preventDefault();hide(true);}});
 addEventListener('resize',position);addEventListener('scroll',()=>{if(active){const r=active.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)hide();else position();}},{passive:true});
})(typeof window!=='undefined'?window:globalThis);
