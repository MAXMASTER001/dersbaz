'use strict';
/* =========================================================
   Denkleştirme Laboratuvarı — katsayıları ayarla, teraziyi dengele
   ========================================================= */
const Balance = (()=>{
  let S=null, raf=null;
  function levels(){
    return Store.equations().map(L=>{
      try{const eq=parseEquation(L.eq);const sol=solveEquation(eq);return sol?{...L,parsed:eq,sol}:null;}catch(e){return null;}
    }).filter(Boolean);
  }
  function mount(app,startIdx){
    const lv=levels();
    if(!lv.length){app.innerHTML='<div class="panel">Hiç geçerli denklem yok. Öğretmen panelinden ekleyin.</div>';return;}
    const prof=Store.profile();
    let idx=startIdx;
    if(idx==null){idx=lv.findIndex(l=>!prof.balance[l.id]);if(idx<0) idx=0;}
    S={app,lv,idx,coefs:[],moves:0,hints:0,solved:false,angle:0,target:0};
    render();
  }
  function render(){
    const {app,lv,idx}=S;const L=lv[idx];const eq=L.parsed;
    const prof=Store.profile();
    S.coefs=new Array(eq.left.length+eq.right.length).fill(1);
    S.moves=0;S.hints=0;S.solved=false;
    const n=eq.left.length;
    const card=(x,i)=>`<div class="sp-card" data-i="${i}">
        <div class="stepper"><button class="coef-btn" data-d="1" aria-label="artır">▲</button><div class="coef one" id="cf${i}">1</div><button class="coef-btn" data-d="-1" aria-label="azalt">▼</button></div>
        <div class="sp-main"><div class="sp-formula fml">${formatFormula(x.formula)}</div><div class="sp-mols" id="ml${i}"></div></div>
      </div>`;
    const side=(arr,off)=>arr.map((x,i)=>card(x,i+off)).join('<span class="eq-op">+</span>');
    app.innerHTML=`<section class="screen balance">
      <div class="bal-top">
        <div><h1 class="screen-title">⚖️ Denkleştirme Laboratuvarı</h1><p class="sub" style="margin:0">Katsayıları ▲▼ ile değiştir. Her atom türü iki tarafta eşit olunca terazi dengelenir!</p></div>
        <div class="level-chips">${lv.map((l,k)=>{const s=prof.balance[l.id]||0;return `<button class="lvl ${k===idx?'active':''} ${s?'done':''}" data-k="${k}" title="${esc(l.title||'')}">${k+1}<small>${s?'★'.repeat(s):''}</small></button>`;}).join('')}</div>
      </div>
      <div class="panel bal-stage" id="stage">
        <div class="bal-context"><b>${esc(L.icon||'🧪')} ${esc(L.title||'Seviye '+(idx+1))}</b>${esc(L.context||'')}</div>
        <div class="eq-row">${side(eq.left,0)}<span class="eq-arrow">→</span>${side(eq.right,n)}</div>
      </div>
      <div class="bal-bottom">
        <div class="panel"><h3>🔬 Atom Sayacı</h3>
          <div class="ac-head"><span>Atom</span><span>GİRENLER</span><span></span><span>ÜRÜNLER</span></div>
          <div id="ac"></div>
        </div>
        <div class="panel"><h3>⚖️ Kütle Terazisi <span class="muted" style="font-size:13px;font-family:var(--font-b)">(Lavoisier)</span></h3>${scaleSVG()}</div>
      </div>
      <div class="bal-actions">
        <button class="btn btn-gold" id="hint">💡 İpucu</button>
        <button class="btn btn-ghost" id="reset">↺ Sıfırla</button>
        <span class="moves" id="moves">Hamle: 0</span>
        <button class="btn btn-cyan" id="skip">Sonraki ⏭</button>
      </div>
    </section>`;
    $$('.lvl',app).forEach(b=>b.onclick=()=>{S.idx=+b.dataset.k;FX.sfx.click();render();});
    $$('.sp-card',app).forEach(c=>{
      const i=+c.dataset.i;
      $$('.coef-btn',c).forEach(b=>b.onclick=()=>change(i,+b.dataset.d));
      c.addEventListener('wheel',e=>{e.preventDefault();change(i,e.deltaY<0?1:-1);},{passive:false});
    });
    $('#hint',app).onclick=hint;
    $('#reset',app).onclick=()=>{FX.sfx.click();render();};
    $('#skip',app).onclick=()=>{S.idx=(S.idx+1)%S.lv.length;render();};
    S.coefs.forEach((_,i)=>drawMols(i));
    update(true);
    startScaleAnim();
  }
  function change(i,d){
    if(S.solved) return;
    const v=clamp(S.coefs[i]+d,1,15);
    if(v===S.coefs[i]) return;
    S.coefs[i]=v;S.moves++;
    d>0?FX.sfx.up():FX.sfx.down();
    const el=$('#cf'+i);el.textContent=v;el.classList.toggle('one',v===1);el.classList.remove('bump');void el.offsetWidth;el.classList.add('bump');
    drawMols(i);update();
  }
  function drawMols(i){
    const eq=S.lv[S.idx].parsed;const all=[...eq.left,...eq.right];
    const svg=Visual.moleculeSVG(all[i].counts);
    const c=S.coefs[i];const show=Math.min(c,6);
    $('#ml'+i).innerHTML=Array(show).fill(svg).join('')+(c>show?`<span class="more">+${c-show}</span>`:'');
  }
  function update(initial){
    const L=S.lv[S.idx];const eq=L.parsed;const n=eq.left.length;
    const Lc=S.coefs.slice(0,n),Rc=S.coefs.slice(n);
    const els=eqElements(eq);
    const rows=els.map(el=>({el,l:sideCount(eq.left,Lc,el),r:sideCount(eq.right,Rc,el)}));
    const max=Math.max(...rows.map(r=>Math.max(r.l,r.r)),1);
    $('#ac').innerHTML=rows.map(r=>`<div class="ac-row ${r.l===r.r?'ok':''}">
      <span class="el-chip" style="--c:${atomColor(r.el)}">${r.el}</span>
      <div class="ac-bar left"><div style="width:${r.l/max*100}%"></div><b>${r.l}</b></div>
      <span class="ac-eq">${r.l===r.r?'=':'≠'}</span>
      <div class="ac-bar right"><div style="width:${r.r/max*100}%"></div><b>${r.r}</b></div></div>`).join('');
    const mL=eq.left.reduce((s,x,i)=>s+formulaMass(x.counts)*Lc[i],0);
    const mR=eq.right.reduce((s,x,i)=>s+formulaMass(x.counts)*Rc[i],0);
    $('#mL').textContent=fmtNum(mL,1)+' u';$('#mR').textContent=fmtNum(mR,1)+' u';
    const diff=(mR-mL)/Math.max(mL,mR);
    S.target=clamp(diff*40,-18,18);
    $('#moves').textContent='Hamle: '+S.moves;
    if(initial) return;
    if(rows.every(r=>r.l===r.r)){
      const g=gcdArr(S.coefs);
      if(g>1){UI.toast(`⚖️ Denk! Ama katsayılar <b>en küçük tam sayılar</b> olmalı. Hepsini ${g}'ye bölebilirsin.`,'gold',3800);return;}
      solved(mL);
    }
  }
  function hint(){
    if(S.solved) return;
    const sol=S.lv[S.idx].sol;
    const wrong=S.coefs.map((c,i)=>i).filter(i=>S.coefs[i]!==sol[i]);
    if(!wrong.length) return;
    const i=wrong[Math.floor(Math.random()*wrong.length)];
    S.hints++;FX.sfx.pop();
    S.coefs[i]=sol[i];
    const el=$('#cf'+i);el.textContent=sol[i];el.classList.toggle('one',sol[i]===1);
    const card=$(`.sp-card[data-i="${i}"]`);card.classList.remove('flash');void card.offsetWidth;card.classList.add('flash');
    drawMols(i);update();
  }
  function solved(mass){
    S.solved=true;
    const L=S.lv[S.idx];const sol=L.sol;
    const optimal=sol.reduce((s,x)=>s+x-1,0);
    let stars=3;
    if(S.hints>0) stars=S.hints>=2?1:2;
    else if(S.moves>optimal*2+4) stars=2;
    $('#stage').classList.add('solved');
    FX.sfx.win();FX.confetti(140);FX.banner('DENKLEŞTİ!','good');
    const res=Game.finishBalance(L.id,stars,S.lv.length);
    setTimeout(()=>{
      UI.modal({title:'⚖️ Denkleşti!',html:`<div style="text-align:center">
        <div class="stars" style="font-size:60px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
        <div class="fml" style="font-size:28px;margin:10px 0">${formatFormula(equationString(L.parsed,S.coefs))}</div>
        <p>Girenlerin kütlesi = Ürünlerin kütlesi = <b style="color:var(--gold)">${fmtNum(mass,1)} u</b><br><span class="muted">Kimyasal tepkimelerde atomlar yok olmaz, yoktan var olmaz; yalnızca yeniden düzenlenir.</span></p>
        <p class="muted">Hamle: ${S.moves} · İpucu: ${S.hints} · <b style="color:var(--gold)">+${res.xp} XP</b></p></div>`,
        buttons:[{label:'↺ Tekrar',cls:'btn-ghost',onClick:()=>render()},{label:'Sonraki Seviye ▶',cls:'btn-good',onClick:()=>{S.idx=(S.idx+1)%S.lv.length;render();}}]});
    },900);
  }
  /* ---- Terazi ---- */
  function scaleSVG(){
    return `<svg class="scale-svg" viewBox="0 0 340 220">
      <defs><linearGradient id="pole" x1="0" x2="1"><stop offset="0" stop-color="#94a3b8"/><stop offset=".5" stop-color="#e2e8f0"/><stop offset="1" stop-color="#64748b"/></linearGradient></defs>
      <path d="M130 205 h80 l-10 -14 h-60z" fill="#475569"/>
      <rect x="164" y="48" width="12" height="146" rx="4" fill="url(#pole)"/>
      <g id="beam"><rect x="40" y="44" width="260" height="10" rx="5" fill="#cbd5e1"/></g>
      <circle cx="170" cy="49" r="9" fill="#fbbf24" stroke="#92400e" stroke-width="2"/>
      <g id="panL">${pan('#mL','GİRENLER','#6366f1')}</g>
      <g id="panR">${pan('#mR','ÜRÜNLER','#0891b2')}</g>
      <polygon id="needle" points="170,30 166,49 174,49" fill="#ef4444"/>
    </svg>`;
  }
  function pan(id,label,color){
    return `<line x1="0" y1="0" x2="-38" y2="70" stroke="#94a3b8" stroke-width="2"/><line x1="0" y1="0" x2="38" y2="70" stroke="#94a3b8" stroke-width="2"/>
      <path d="M-48 70 h96 q-6 28 -48 28 q-42 0 -48 -28z" fill="${color}" stroke="rgba(255,255,255,.5)" stroke-width="2"/>
      <text x="0" y="84" text-anchor="middle" font-family="Nunito, sans-serif" font-size="11" fill="#e0e7ff" font-weight="600">${label}</text>
      <text id="${id.slice(1)}" x="0" y="118" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" style="fill:var(--sv-ink)" font-weight="700">0 u</text>`;
  }
  function startScaleAnim(){
    cancelAnimationFrame(raf);
    const step=()=>{
      if(!S||!$('#beam')) return;
      S.angle+=(S.target-S.angle)*.08;
      const a=S.angle*Math.PI/180,L=120;
      $('#beam').setAttribute('transform',`rotate(${S.angle.toFixed(2)} 170 49)`);
      $('#needle').setAttribute('transform',`rotate(${S.angle.toFixed(2)} 170 49)`);
      $('#panL').setAttribute('transform',`translate(${(170-L*Math.cos(a)).toFixed(1)} ${(49-L*Math.sin(a)).toFixed(1)})`);
      $('#panR').setAttribute('transform',`translate(${(170+L*Math.cos(a)).toFixed(1)} ${(49+L*Math.sin(a)).toFixed(1)})`);
      raf=requestAnimationFrame(step);
    };
    raf=requestAnimationFrame(step);
  }
  function unmount(){cancelAnimationFrame(raf);S=null;}
  return {mount,unmount,levels};
})();
