'use strict';
/* Küçük yardımcılar + modal/toast */
function esc(s){return String(s ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function $(sel,root=document){return root.querySelector(sel);}
function $$(sel,root=document){return [...root.querySelectorAll(sel)];}
function shuffle(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function hashStr(s){let h=2166136261;for(const ch of String(s)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
function uid(){return 'id'+Date.now().toString(36)+Math.random().toString(36).slice(2,7);}
function fmtNum(x,d=2){return Number(x).toLocaleString('tr-TR',{minimumFractionDigits:d,maximumFractionDigits:d});}

const UI = {
  modal({title='',html='',buttons=[{label:'Tamam',cls:'btn-primary'}],dismiss=true,wide=false,onOpen}={}){
    const root=$('#modal-root');
    const wrap=document.createElement('div');
    wrap.className='modal-back';
    wrap.innerHTML=`<div class="modal ${wide?'wide':''}" role="dialog" aria-modal="true">${title?`<h2 class="modal-title">${title}</h2>`:''}<div class="modal-body">${html}</div><div class="modal-actions"></div></div>`;
    const acts=$('.modal-actions',wrap);
    const close=()=>{wrap.classList.add('out');setTimeout(()=>wrap.remove(),200);};
    buttons.forEach(b=>{
      const el=document.createElement('button');
      el.className='btn '+(b.cls||'btn-primary');
      el.innerHTML=b.label;
      el.onclick=()=>{const r=b.onClick?b.onClick(wrap):undefined; if(r!==false) close();};
      acts.appendChild(el);
    });
    if(!buttons.length) acts.remove();
    if(dismiss) wrap.addEventListener('click',e=>{if(e.target===wrap) close();});
    root.appendChild(wrap);
    if(onOpen) onOpen(wrap,close);
    return {el:wrap,close};
  },
  confirm(msg,onYes,{yes='Evet',no='Vazgeç',danger=false,title='Emin misin?'}={}){
    return UI.modal({title,html:`<p>${msg}</p>`,buttons:[{label:no,cls:'btn-ghost'},{label:yes,cls:danger?'btn-danger':'btn-primary',onClick:onYes}]});
  },
  toast(msg,kind='info',ms=2800){
    const el=document.createElement('div');
    el.className='toast '+kind;
    el.innerHTML=msg;
    $('#toast-root').appendChild(el);
    setTimeout(()=>{el.classList.add('out');setTimeout(()=>el.remove(),300);},ms);
  },
  download(filename,text,type='application/json'){
    const blob=new Blob([text],{type});
    const a=document.createElement('a');
    a.href=URL.createObjectURL(blob);a.download=filename;
    document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},500);
  }
};
