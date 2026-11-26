'use strict';
/* =========================================================
   Atom Kurucu — proton, nötron, elektron ekleyerek atom/iyon yap
   ========================================================= */
const ATOM_CHALLENGES = [
  {id:'a1',text:'Bir **hidrojen-1** atomu oluştur (¹H).',check:(p,n,e)=>p===1&&n===0&&e===1},
  {id:'a2',text:'**Helyum-4** atomu oluştur. (2 proton, 2 nötron)',check:(p,n,e)=>p===2&&n===2&&e===2},
  {id:'a3',text:'Nötr bir **karbon-12** atomu oluştur.',check:(p,n,e)=>p===6&&n===6&&e===6},
  {id:'a4',text:'Karbonun radyoaktif izotopu **karbon-14**\'ü oluştur.',check:(p,n,e)=>p===6&&n===8&&e===6},
  {id:'a5',text:'**Döteryum** oluştur: bir nötronu olan hidrojen izotopu.',check:(p,n,e)=>p===1&&n===1&&e===1},
  {id:'a6',text:'Sodyum-23\'ten **Na⁺ iyonu** oluştur.',check:(p,n,e)=>p===11&&n===12&&e===10},
  {id:'a7',text:'Oksijen-16\'dan **oksit iyonu (O²⁻)** oluştur.',check:(p,n,e)=>p===8&&n===8&&e===10},
  {id:'a8',text:'**Klorür iyonu** oluştur: ³⁵Cl⁻',check:(p,n,e)=>p===17&&n===18&&e===18},
  {id:'a9',text:'**Mg²⁺** iyonu oluştur (²⁴Mg).',check:(p,n,e)=>p===12&&n===12&&e===10},
  {id:'a10',text:'Düşün! **Neon ile izoelektronik** (10 elektronlu) herhangi bir **katyon** oluştur.',check:(p,n,e)=>e===10&&p>e&&p<=13&&(STABLE_N[p]||[]).includes(n)},
  {id:'a11',text:'**Argon ile izoelektronik** kararlı bir **anyon** oluştur.',check:(p,n,e)=>e===18&&p<e&&p>=15&&(STABLE_N[p]||[]).includes(n)},
  {id:'a12',text:'**4. periyot 2A grubunda** bulunan elementin kararlı, nötr bir atomunu oluştur.',check:(p,n,e)=>p===e&&p===20&&(STABLE_N[p]||[]).includes(n)},
];

const AtomBuilder = (()=>{
  let S=null;
  function mount(app){
    const prof=Store.profile();
    const firstOpen=ATOM_CHALLENGES.findIndex(c=>!prof.atomDone.includes(c.id));
    S={app,p:1,n:0,e:0,mode:firstOpen>=0?'challenge':'free',ch:Math.max(0,firstOpen),lock:false,prev:null};
    app.innerHTML=`<section class="screen atom">
      <div class="bal-top"><div><h1 class="screen-title">⚛️ Atom Kurucu</h1><p class="sub" style="margin:0">Parçacık ekle ya da çıkar; atomun kimliği, kütlesi ve yükü anında değişsin.</p></div>
        <div class="chips"><button class="chip" data-m="challenge">🎯 Görevler</button><button class="chip" data-m="free">🧪 Serbest Mod</button></div></div>
      <div id="chbar"></div>
      <div class="atom-layout">
        <div class="panel atom-stage"><div id="stage"></div><div class="stage-tools">${App.spinButton()}</div></div>
        <div class="panel">
          ${ctl('p','#ef4444','Proton','Atomun kimliğini belirler')}
          ${ctl('n','#94a3b8','Nötron','Kütleyi değiştirir → izotop')}
          ${ctl('e','#38bdf8','Elektron','Yükü değiştirir → iyon')}
          <div class="info-grid"><div class="el-tile" id="tile"></div><div class="facts" id="facts"></div></div>
        </div>
      </div>
      <div class="panel" style="margin-top:18px"><h3>🗂️ Periyodik Sistem (ilk 4 periyot) <span class="muted" style="font-size:13px;font-family:var(--font-b)">— bir elemente tıkla</span></h3>
        <div class="ptable" id="ptable"></div>
        <div class="legend">${Object.values(CAT_INFO).map(c=>`<span><i style="background:${c.color}"></i>${c.name}</span>`).join('')}</div>
      </div>
    </section>`;
    $$('[data-m]',app).forEach(b=>b.onclick=()=>{S.mode=b.dataset.m;FX.sfx.click();renderAll();});
    $$('.pctl',app).forEach(r=>{
      const k=r.dataset.k;
      $('.minus',r).onclick=()=>change(k,-1);
      $('.plus',r).onclick=()=>change(k,1);
    });
    buildTable();
    renderAll();
  }
  function ctl(k,color,name,desc){
    return `<div class="pctl" data-k="${k}"><span class="dot" style="background:${color}"></span><span class="nm">${name}<small>${desc}</small></span>
      <button class="pbtn minus" aria-label="${name} çıkar">−</button><span class="pval" id="v${k}">0</span><button class="pbtn plus" aria-label="${name} ekle">+</button></div>`;
  }
  function buildTable(){
    const cells=[];
    for(let period=1;period<=4;period++) for(let col=1;col<=18;col++){
      const el=ELEMENTS.find(e=>e.period===period&&e.col===col);
      cells.push(el?`<button class="pt" data-z="${el.z}" style="--cat:${CAT_INFO[el.cat].color}" title="${el.name} (${el.z})">${el.sym}</button>`:'<span class="pt-empty"></span>');
    }
    $('#ptable').innerHTML=cells.join('');
    $$('.pt').forEach(b=>b.onclick=()=>{const z=+b.dataset.z;const el=ELEMENTS[z-1];S.p=z;S.n=el.n;S.e=z;FX.sfx.pop();renderAll();check();});
  }
  function change(k,d){
    if(S.lock) return;
    const lim={p:[1,36],n:[0,60],e:[0,40]}[k];
    const v=clamp(S[k]+d,lim[0],lim[1]);
    if(v===S[k]){FX.sfx.down();return;}
    S[k]=v;d>0?FX.sfx.up():FX.sfx.down();
    renderAll(k);check();
  }
  function renderAll(changed){
    const {p,n,e}=S;
    $$('[data-m]',S.app).forEach(b=>b.classList.toggle('active',b.dataset.m===S.mode));
    ['p','n','e'].forEach(k=>$('#v'+k).textContent=S[k]);
    $('#stage').innerHTML=stageSVG(p,n,e,changed);
    const el=ELEMENTS[p-1];
    const cat=CAT_INFO[el.cat];
    const tile=$('#tile');tile.style.setProperty('--cat',cat.color);
    tile.innerHTML=`<span class="z">${p}</span><span class="sy">${el.sym}</span><span class="na">${el.name}</span><span class="ms">${el.mass}</span>`;
    const A=p+n,c=p-e;
    const type=c===0?'<span class="good">Nötr atom</span>':c>0?`Katyon (${chargeStr(c)}) — ${c} elektron vermiş`:`Anyon (${chargeStr(c)}) — ${-c} elektron almış`;
    let stab='';
    if(STABLE_N[p]){
      stab=STABLE_N[p].includes(n)?'<span class="good">✓ Kararlı izotop</span>':'<span class="warn">⚠ Kararsız (radyoaktif) çekirdek</span>';
    } else stab='<span class="muted">Kararlılık verisi bu sürümde Z ≤ 20 için var</span>';
    const iso=ISOTOPE_NAMES[p+'-'+n];
    const conf=electronConfig(p,e);
    const sh=shellsOf(p,e);
    const noble={2:'He',10:'Ne',18:'Ar',36:'Kr'}[e];
    S.app.querySelector('#facts').innerHTML=`
      <div>Gösterim: ${Visual.nuclideHTML(p,n,e)}</div>
      <div>Kütle numarası (A) = p + n = <b>${A}</b></div>
      <div>Yük = p − e = <b>${c>0?'+':''}${c}</b> · ${type}</div>
      <div>${stab}${iso?' · '+iso:''}</div>
      <div>Katmanlar: <b>${sh.join(', ')||'—'}</b>${noble&&c!==0?` <span class="good">· ${noble} ile izoelektronik ✓</span>`:''}</div>
      <div style="font-size:13px">Dizilim: <b style="font-size:14px">${configString(conf)||'—'}</b>${e?Visual.orbitalSVG('Z='+p+' e='+e):''}</div>
      <div>Konum: <b>${el.period}. periyot, ${groupLabel(el.col)} grubu</b> · ${cat.name}</div>`;
    $$('.pt').forEach(b=>b.classList.toggle('cur',+b.dataset.z===p));
    renderChallenge();
  }
  function renderChallenge(){
    const bar=$('#chbar');
    if(S.mode!=='challenge'){bar.innerHTML='';return;}
    const prof=Store.profile();
    const c=ATOM_CHALLENGES[S.ch];
    const done=prof.atomDone.length;
    bar.innerHTML=`<div class="challenge-bar"><span class="cn">Görev ${S.ch+1}/${ATOM_CHALLENGES.length}</span><span class="ct">${richText(c.text)} ${prof.atomDone.includes(c.id)?'✅':''}</span>
      <span class="muted" style="font-weight:800">Tamamlanan: ${done}/${ATOM_CHALLENGES.length}</span>
      <button class="btn btn-sm btn-ghost" id="chprev">◀</button><button class="btn btn-sm btn-ghost" id="chnext">▶</button></div>`;
    $('#chprev').onclick=()=>{S.ch=(S.ch-1+ATOM_CHALLENGES.length)%ATOM_CHALLENGES.length;renderChallenge();};
    $('#chnext').onclick=()=>{S.ch=(S.ch+1)%ATOM_CHALLENGES.length;renderChallenge();};
  }
  function check(){
    if(S.mode!=='challenge'||S.lock) return;
    const c=ATOM_CHALLENGES[S.ch];
    if(c.check(S.p,S.n,S.e)){
      S.lock=true;
      FX.sfx.win();FX.celebrate($('#stage'));FX.banner('GÖREV TAMAM!','good','small');
      Game.finishAtom(c.id,ATOM_CHALLENGES.length);
      setTimeout(()=>{
        S.lock=false;if(!S) return;
        const prof=Store.profile();
        const nextOpen=ATOM_CHALLENGES.findIndex((x,i)=>i>S.ch&&!prof.atomDone.includes(x.id));
        const anyOpen=ATOM_CHALLENGES.findIndex(x=>!prof.atomDone.includes(x.id));
        if(nextOpen>=0) S.ch=nextOpen; else if(anyOpen>=0) S.ch=anyOpen; else {UI.toast('🏆 Tüm atom görevlerini tamamladın! Serbest modda keşfetmeye devam et.','gold',4000);S.mode='free';}
        renderAll();
      },1400);
    }
  }
  /* ---- Büyük atom sahnesi ---- */
  function stageSVG(p,n,e,changed){
    const C=200;
    const total=p+n;
    const rb=total<=12?11:total<=30?9:total<=60?7:5.6;
    const rand=rng(p*1000+n);
    const kinds=[];for(let i=0;i<p;i++) kinds.push('p');for(let i=0;i<n;i++) kinds.push('n');
    for(let i=kinds.length-1;i>0;i--){const j=Math.floor(rand()*(i+1));[kinds[i],kinds[j]]=[kinds[j],kinds[i]];}
    const pos=kinds.map((_,i)=>{const r=rb*1.05*Math.sqrt(i+.3);const a=i*2.39996;return [C+Math.cos(a)*r,C+Math.sin(a)*r];});
    const nucR=rb*1.05*Math.sqrt(total)+rb;
    const sh=shellsOf(p,e);const N=sh.length;
    const r0=Math.max(nucR+24,78),r1=186;
    const radii=sh.map((_,i)=>N===1?(r0+r1)/2-20:r0+i*(r1-r0)/(N-1));
    let s=`<svg viewBox="0 0 400 400"><defs>
      <radialGradient id="pg" cx=".35" cy=".35"><stop offset="0" stop-color="#fecaca"/><stop offset="1" stop-color="#dc2626"/></radialGradient>
      <radialGradient id="ng" cx=".35" cy=".35"><stop offset="0" stop-color="#f1f5f9"/><stop offset="1" stop-color="#64748b"/></radialGradient>
      <radialGradient id="eg" cx=".35" cy=".35"><stop offset="0" stop-color="#e0f2fe"/><stop offset="1" stop-color="#0284c7"/></radialGradient>
      <radialGradient id="glow"><stop offset="0" stop-color="rgba(251,146,60,.45)"/><stop offset="1" stop-color="rgba(251,146,60,0)"/></radialGradient></defs>`;
    s+=`<circle cx="${C}" cy="${C}" r="${nucR+30}" fill="url(#glow)"/>`;
    radii.forEach((r,i)=>{s+=`<circle cx="${C}" cy="${C}" r="${r.toFixed(1)}" fill="none" style="stroke:var(--sv-ink)" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 6"/><text x="${C+r*.71+4}" y="${C-r*.71-2}" font-family="Nunito, sans-serif" font-size="12" style="fill:var(--sv-ink)" fill-opacity=".75">${i+1}. katman</text>`;});
    kinds.forEach((k,i)=>{
      const [x,y]=pos[i];
      const isNew=(changed==='p'&&k==='p'&&i===kinds.lastIndexOf('p'))||(changed==='n'&&k==='n'&&i===kinds.lastIndexOf('n'));
      s+=`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${rb}" fill="url(#${k}g)" stroke="rgba(0,0,0,.25)" stroke-width="1">${isNew?'<animate attributeName="r" from="0" to="'+rb+'" dur=".3s"/>':''}</circle>`;
      if(k==='p'&&rb>=7) s+=`<text x="${x.toFixed(1)}" y="${(y+rb*.38).toFixed(1)}" text-anchor="middle" font-size="${rb*1.1}" font-weight="900" fill="#7f1d1d" font-family="Nunito">+</text>`;
    });
    sh.forEach((cnt,i)=>{
      const r=radii[i];
      s+=`<g class="spin" style="transform-origin:${C}px ${C}px;animation-duration:${9+i*5}s;${i%2?'animation-direction:reverse;':''}">`;
      for(let k=0;k<cnt;k++){
        const a=2*Math.PI*k/cnt-Math.PI/2;
        s+=`<circle cx="${(C+Math.cos(a)*r).toFixed(1)}" cy="${(C+Math.sin(a)*r).toFixed(1)}" r="8" fill="url(#eg)" stroke="#e0f2fe" stroke-width="1.5"/>`;
        s+=`<text x="${(C+Math.cos(a)*r).toFixed(1)}" y="${(C+Math.sin(a)*r+3.5).toFixed(1)}" text-anchor="middle" font-size="10" font-weight="900" fill="#082f49">−</text>`;
      }
      s+='</g>';
    });
    return s+'</svg>';
  }
  function unmount(){S=null;}
  return {mount,unmount};
})();
