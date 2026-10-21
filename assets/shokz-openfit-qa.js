(function(){
 'use strict';
 const toggle=document.getElementById('of-products-toggle'),panel=document.getElementById('of-quick-products');if(!toggle||!panel)return;
 const closeButton=panel.querySelector('.of-products-close');
 function close(refocus=false){panel.hidden=true;toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open SHOKZ OpenFit product list');if(refocus)toggle.focus({preventScroll:true});}
 function open(){document.dispatchEvent(new CustomEvent('of:products-open'));panel.hidden=false;toggle.setAttribute('aria-expanded','true');toggle.setAttribute('aria-label','Close SHOKZ OpenFit product list');closeButton.focus({preventScroll:true});}
 toggle.addEventListener('click',()=>panel.hidden?open():close(true));
 closeButton.addEventListener('click',()=>close(true));
 document.addEventListener('click',e=>{if(!panel.hidden&&!panel.contains(e.target)&&!toggle.contains(e.target))close();});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden){e.preventDefault();close(true);}});
 document.addEventListener('of:score-tip-open',()=>close());
})();
