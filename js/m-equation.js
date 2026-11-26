'use strict';
/* =========================================================
   Denklem Terazisi — birinci dereceden denklemler (9. sınıf)
   ax + b = cx + d ; iki tarafa aynı işlemi uygula, x'i yalnız bırak.
   ========================================================= */
const MEquation = (()=>{
  const LEVELS=[
    [1,5,0,12],[1,-3,0,7],[3,0,0,18],[2,3,0,11],[5,-4,0,21],
    [3,2,1,10],[4,-5,2,7],[-2,9,0,3],[6,1,4,9],[2,-7,5,-16],
  ];
  let S=null;
  const N=v=>MathX.num(v);

  function eqStr(e){
    const side=(x,c)=>{
      let s='';
      if(x){s=(x===1?'':x===-1?'−':N(x))+'x';}
      if(c){s+=s?(c<0?' − '+N(-c):' + '+N(c)):N(c);}
      return s||'0';
    };
    return side(e[0],e[1])+' = '+side(e[2],e[3]);
  }
  function optimal(e){const [a,b,c,d]=e;return (c!==0?1:0)+(b!==0?1:0)+((a-c)!==1?1:0);}
  function solved(e){const [a,b,c,d]=e;return (a===1&&b===0&&c===0)||(c===1&&d===0&&a===0);}

  function mount(app,startIdx){
    const stars=Game.levelStars('eq');
    let idx=startIdx??LEVELS.findIndex((_,i)=>!stars['e'+i]);if(idx<0) idx=0;
    S={app,idx,e:LEVELS[idx].slice(),hist:[],op:'-',val:1,term:'n',done:false};
    app.innerHTML=`<section class="screen equation">
      <div class="bal-top">
        <div><h1 class="screen-title">⚖️ Denklem Terazisi</h1><p class="sub" style="margin:0">Terazi dengede: iki kefeye <b>aynı işlemi</b> uygula ve <b>x</b>'i tek başına bırak!</p></div>
        <div class="level-chips">${LEVELS.map((l,k)=>{const s=stars['e'+k]||0;return `<button class="lvl ${k===idx?'active':''} ${s?'done':''}" data-k="${k}">${k+1}<small>${s?'★'.repeat(s):''}</small></button>`;}).join('')}</div>
      </div>
      <div class="panel eq-stage" id="eqstage">
        <div class="eq-big" id="eqbig"></div>
        <div id="eqscale"></div>
      </div>
      <div class="eq-layout">
        <div class="panel">
          <h3>🛠️ İki tarafa uygula</h3>
          <div class="eq-ops">${['+','-','×','÷'].map(o=>`<button class="eq-op-btn" data-op="${o}">${o==='-'?'−':o}</button>`).join('')}</div>
          <div class="eq-val"><button class="pbtn minus" id="vminus">−</button><span class="pval" id="vval">1</span><button class="pbtn plus" id="vplus">+</button>
            <div class="eq-term"><button data-t="n" class="spin-btn">sayı</button><button data-t="x" class="spin-btn">x</button></div></div>
          <div class="eq-preview" id="eqprev"></div>
          <div class="btn-row"><button class="btn btn-big btn-good" id="eqapply">Uygula ⚖️</button><button class="btn btn-ghost" id="equndo">↶ Geri al</button><button class="btn btn-gold" id="eqhint">💡 İpucu</button></div>
          <div class="orb-msg" id="eqmsg">x'i yalnız bırakmak için önce x'li terimleri bir tarafta, sayıları diğer tarafta topla.</div>
        </div>
        <div class="panel"><h3>📜 Adımlar</h3><ol class="eq-steps" id="eqsteps"></ol></div>
      </div>
    </section>`;
    $$('.lvl',app).forEach(b=>b.onclick=()=>{FX.sfx.click();mount(app,+b.dataset.k);});
    $$('.eq-op-btn',app).forEach(b=>b.onclick=()=>{S.op=b.dataset.op;if(S.op==='×'||S.op==='÷') S.term='n';FX.sfx.click();sync();});
    $$('.eq-term button',app).forEach(b=>b.onclick=()=>{if(S.op==='×'||S.op==='÷') return;S.term=b.dataset.t;FX.sfx.click();sync();});
    $('#vminus').onclick=()=>{S.val=S.val-1||(-1);if(S.val<-20) S.val=-20;FX.sfx.down();sync();};
    $('#vplus').onclick=()=>{S.val=S.val+1||1;if(S.val>20) S.val=20;FX.sfx.up();sync();};
    $('#eqapply').onclick=apply;
    $('#equndo').onclick=undo;
    $('#eqhint').onclick=hint;
    render();sync();
  }
  function opText(op,val,term){
    const v=(term==='x'?(val===1?'':val===-1?'−':N(val))+'x':N(val));
    return {'+':`Her iki tarafa ${v} ekle`,'-':`Her iki taraftan ${v} çıkar`,'×':`Her iki tarafı ${N(val)} ile çarp`,'÷':`Her iki tarafı ${N(val)}'${dat(val)} böl`}[op];
  }
  function dat(n){ // Türkçe yönelme eki: 2'ye, 3'e, 6'ya, 10'a, 20'ye
    n=Math.abs(n);const u=n%10,t=Math.floor(n/10)%10;
    if(u) return ['','e','ye','e','e','e','ya','ye','e','a'][u];
    return ['a','a','ye','a','a','ye','a','e','e','a'][t];
  }
  function sync(){
    $$('.eq-op-btn').forEach(b=>b.classList.toggle('active',b.dataset.op===S.op));
    $$('.eq-term button').forEach(b=>{b.classList.toggle('active',b.dataset.t===S.term);b.disabled=(S.op==='×'||S.op==='÷')&&b.dataset.t==='x';});
    $('#vval').textContent=N(S.val);
    $('#eqprev').textContent='➜ '+opText(S.op,S.val,S.term);
  }
  function blocks(x,c){
    const out=[];
    const add=(cls,label,n)=>{
      if(n<=12) for(let i=0;i<n;i++) out.push(`<span class="eb ${cls}">${label}</span>`);
      else out.push(`<span class="eb ${cls} many">${label}<small>×${n}</small></span>`);
    };
    add(x>0?'bx':'bnx',x>0?'x':'−x',Math.abs(x));
    add(c>0?'b1':'bn1',c>0?'1':'−1',Math.abs(c));
    return out.join('')||'<span class="eb empty">0</span>';
  }
  function render(anim){
    const e=S.e;
    $('#eqbig').innerHTML=MathX.format(eqStr(e));
    $('#eqscale').innerHTML=`<div class="eq-scale ${anim?'wobble':''}">
      <div class="eq-beam"></div><div class="eq-pivot">▲</div>
      <div class="eq-pan left"><div class="eq-blocks">${blocks(e[0],e[1])}</div><div class="eq-plate"></div><span class="eq-side">SOL</span></div>
      <div class="eq-pan right"><div class="eq-blocks">${blocks(e[2],e[3])}</div><div class="eq-plate"></div><span class="eq-side">SAĞ</span></div>
    </div>`;
    $('#eqsteps').innerHTML=`<li class="muted">${MathX.format(eqStr(LEVELS[S.idx]))}</li>`+S.hist.map(h=>`<li><span class="muted">${esc(h.txt)}</span><br>${MathX.format(eqStr(h.after))}</li>`).join('');
  }
  function apply(){
    if(S.done) return;
    const [a,b,c,d]=S.e,v=S.val,op=S.op;let n;
    if(op==='+'||op==='-'){
      const s=op==='+'?v:-v;
      n=S.term==='x'?[a+s,b,c+s,d]:[a,b+s,c,d+s];
    } else if(op==='×'){
      n=[a*v,b*v,c*v,d*v];
    } else {
      if([a,b,c,d].some(t=>t%v!==0)) return msg(`⚠️ ${N(v)}'e bölünce kesirli sayılar çıkar. Bu oyunda tam sayılarla kal: önce başka bir işlem dene.`,'warn');
      n=[a/v,b/v,c/v,d/v].map(t=>t===0?0:t);
    }
    if(n[0]===0&&n[2]===0) return msg('⚠️ Bu işlemle x tamamen kaybolur! Başka bir işlem seç.','warn');
    S.hist.push({before:S.e,after:n,txt:opText(op,v,S.term)});
    S.e=n;FX.sfx.pop();render(true);
    if(solved(n)){
      S.done=true;
      const x=n[0]===1?n[3]:n[1];
      const steps=S.hist.length,opt=optimal(LEVELS[S.idx]);
      const st=steps<=opt?3:steps<=opt+2?2:1;
      FX.sfx.win();FX.confetti(140);FX.banner('x = '+N(x),'good');
      const [a0,b0,c0,d0]=LEVELS[S.idx];
      const check=`${N(a0*x+b0)} = ${N(c0*x+d0)}`;
      const res=Game.finishLevel('eq','e'+S.idx,st,LEVELS.length,'eq5','eqAll');
      msg(`✅ Çözüm: x = ${N(x)}. Sağlama: x yerine ${N(x)} yazarsak ${check} ✓`,'good');
      setTimeout(()=>{if(!S) return;UI.modal({title:'⚖️ x yalnız kaldı!',html:`<div style="text-align:center">
        <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<st?'on':''}">⭐</span>`).join('')}</div>
        <div class="eq-big">${MathX.format('x = '+N(x))}</div>
        <p>Sağlama: ${MathX.format(eqStr(LEVELS[S.idx]).replace(/x/g,'('+N(x)+')'))} → ${check} ✓</p>
        <p class="muted">Adım: ${steps} (en kısa: ${opt}) · <b style="color:var(--gold)">+${res.xp} XP</b></p></div>`,
        buttons:[{label:'↺ Tekrar',cls:'btn-ghost',onClick:()=>mount(S.app,S.idx)},{label:'Sonraki ▶',cls:'btn-good',onClick:()=>mount(S.app,(S.idx+1)%LEVELS.length)}]});},1000);
    } else msg('✓ Terazi hâlâ dengede. Devam et!','good');
  }
  function undo(){
    if(S.done||!S.hist.length) return;
    S.e=S.hist.pop().before;FX.sfx.down();render(true);msg('↶ Son adım geri alındı.','');
  }
  function hint(){
    if(S.done) return;
    const [a,b,c,d]=S.e;
    let op,val,term;
    if(c!==0&&a!==0){op=c>0?'-':'+';val=Math.abs(c);term='x';}
    else if(a!==0&&b!==0){op=b>0?'-':'+';val=Math.abs(b);term='n';}
    else if(c!==0&&d!==0){op=d>0?'-':'+';val=Math.abs(d);term='n';}
    else {op='÷';val=a!==0?a:c;term='n';}
    S.op=op;S.val=val;S.term=term;sync();FX.sfx.pop();
    msg('💡 Öneri: '+opText(op,val,term)+'. "Uygula"ya bas.','warn');
  }
  function msg(h,k){const m=$('#eqmsg');m.className='orb-msg '+k;m.innerHTML=h;if(k==='warn') FX.sfx.down();}
  function unmount(){S=null;}
  return {mount,unmount,LEVELS};
})();
