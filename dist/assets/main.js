const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('#navigation');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
const payload=document.querySelector('#model-data');
if(payload){
const models=JSON.parse(payload.textContent),weights=[25,25,25,25],quotes=models.map(()=>null),invalid=models.map(()=>false);
const names=['Wearing Comfort','Sound & Noise Cancellation','Ecosystem & Design','Price'];
document.querySelector('#weights').innerHTML=names.map((n,i)=>`<div class="control"><label for="weight-${i}"><span>${n}</span><output id="share-${i}">25.0%</output></label><input type="range" id="weight-${i}" min="0" max="100" value="25" aria-label="${n} importance"></div>`).join('');
weights.forEach((_,i)=>document.querySelector('#weight-'+i).addEventListener('input',e=>{weights[i]=Number(e.target.value);update();}));
models.forEach((m,i)=>document.querySelector('#price-'+i).addEventListener('input',e=>{const text=e.target.value;invalid[i]=e.target.validity.badInput||(text!==''&&(!Number.isFinite(Number(text))||Number(text)<=0||Number(text)>1e9));quotes[i]=text===''?null:Number(text);e.target.setAttribute('aria-invalid',String(invalid[i]));update();}));
document.querySelector('#reset').addEventListener('click',()=>{weights.fill(25);quotes.fill(null);invalid.fill(false);weights.forEach((_,i)=>document.querySelector('#weight-'+i).value=25);models.forEach((_,i)=>{const e=document.querySelector('#price-'+i);e.value='';e.setAttribute('aria-invalid','false');});update();});
function update(){
const total=weights.reduce((a,b)=>a+b,0),priceActive=weights[3]>0;
weights.forEach((w,i)=>{const share=total?(100*w/total).toFixed(1)+'%':'—';document.querySelector('#share-'+i).textContent=share;document.querySelector('#weight-'+i).setAttribute('aria-valuetext',`${w}; normalized share ${share}`);});
const active=models.map((m,i)=>({...m,index:i,effective:quotes[i]??(m.buy?m.price:null)})).filter(m=>!priceActive||(!invalid[m.index]&&m.effective!==null));
const prices=active.map(m=>m.effective).filter(p=>p!==null),lo=Math.min(...prices),hi=Math.max(...prices);
models.forEach((m,i)=>{document.querySelector('#quote-note-'+i).textContent=invalid[i]?'Enter a valid positive USD price.':quotes[i]!==null?'Your price':m.buy?'Using official snapshot':'Add a quote to include';});
const ps=new Map(active.map(m=>[m.index,m.effective===null?null:hi===lo?10:1+9*(hi-m.effective)/(hi-lo)]));
models.forEach((m,i)=>{document.querySelector('#price-score-'+i).textContent=ps.get(i)==null?'—':ps.get(i).toFixed(1);});
const winner=document.querySelector('#winner'),ranking=document.querySelector('#ranking'),reason=document.querySelector('#reason');
document.querySelector('#zero-error').hidden=total>0;
document.querySelector('#eligibility').textContent=priceActive?'Price is active. Models without a purchasable snapshot or a valid personal quote are excluded. Invalid quotes exclude that model until corrected.':'Price is ignored. All six models participate; quotes do not affect the result.';
if(!total||!active.length){winner.textContent=!total?'Choose your priorities':'No models have a valid price';ranking.replaceChildren();reason.textContent='';return;}
const ranks=active.map(m=>({...m,score:10*(m.scores.reduce((s,x,j)=>s+x*weights[j],0)+(priceActive?ps.get(m.index)*weights[3]:0))/total})).sort((a,b)=>b.score-a.score||a.index-b.index);
const leaders=ranks.filter(m=>ranks[0].score-m.score<=0.05);
winner.textContent=`Best match for your priorities: ${leaders.map(m=>m.id).join(' / ')}${leaders.length>1?' (tied)':''}`;
const lead=ranks[0],contrib=[...lead.scores,ps.get(lead.index)??0].map((s,i)=>({i,v:s*weights[i]})).sort((a,b)=>b.v-a.v);
reason.textContent=`${lead.id} scores ${lead.score.toFixed(1)} / 100. Its largest weighted contribution comes from ${names[contrib[0].i].toLowerCase()}. Fit and must-have features still deserve a separate check.`;
let rank=1,group=ranks[0].score;
ranking.innerHTML=ranks.map((m,i)=>{if(group-m.score>0.05){rank=i+1;group=m.score;}return `<div class="rank"><span>${rank}</span><strong>${m.id}</strong><div class="track" aria-hidden="true"><div class="fill" style="width:${m.score}%"></div></div><span class="rankscore">${m.score.toFixed(1)}</span></div>`;}).join('');
}
update();
}
