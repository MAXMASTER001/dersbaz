'use strict';
/* =========================================================
   Orbital Yerleşimi — Aufbau ilkesi, Pauli ilkesi, Hund kuralı
   Öğrenci elektronları enerji diyagramındaki orbitallere tek tek
   yerleştirir; her hamle kurallara göre anında denetlenir.
   ========================================================= */
const ORB_ORDER=[[1,0],[2,0],[2,1],[3,0],[3,1],[4,0],[3,2],[4,1]];  // enerji sırası (aşağıdan yukarı)
const ORB_LEVELS=[
  {z:1,tip:'İlk elektron her zaman en düşük enerjili orbitale, 1s\'ye gider.'},
  {z:2,tip:'Aynı orbitaldeki ikinci elektron zıt spinli olmalı: ↑↓ (Pauli).'},
  {z:3,tip:'1s doldu (en fazla 2 elektron). Sıradaki orbital hangisi?'},
  {z:6,tip:'2p\'de üç eş enerjili orbital var. Hund kuralını hatırla!'},
  {z:7,tip:'Üç 2p orbitaline elektronlar önce birer birer, aynı yönde yerleşir.'},
  {z:8,tip:'2p orbitallerinin hepsi yarı dolduysa artık eşleşme başlar.'},
  {z:10,tip:'Neon: tüm orbitaller tam dolu, soy gaz düzeni!'},
  {z:11,tip:'2. katman doldu, 3. katmana geçiyoruz.'},
  {z:13,tip:'3s doldu, sırada 3p var.'},
  {z:15,tip:'Fosforda 3p orbitallerinin hepsi yarı dolu.'},
  {z:17,tip:'Klor: kaç tane yarı dolu orbital kalacak?'},
  {z:18,tip:'Argon: 3p tamamen doluyor.'},
  {z:19,tip:'Dikkat! 4s, 3d\'den daha düşük enerjilidir.'},
  {z:20,tip:'4s dolar, 3d hâlâ boş kalır.'},
  {z:26,tip:'3d\'nin beş orbitaline Hund kuralıyla yerleştir.'},
  {z:30,tip:'Çinko: 3d tamamen doluyor.'},
  {z:35,tip:'3d doldu, sırada 4p var.'},
  {z:24,bonus:true,tip:'İSTİSNA! Krom\'da yarı dolu d⁵ daha kararlıdır: 4s¹ 3d⁵.'},
  {z:29,bonus:true,tip:'İSTİSNA! Bakır\'da tam dolu d¹⁰ daha kararlıdır: 4s¹ 3d¹⁰.'},
];
const ORB_RULES={
  aufbau:{icon:'🪜',name:'Aufbau İlkesi',text:'Elektronlar önce en düşük enerjili orbitale yerleşir:<br><b>1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p</b>'},
  pauli:{icon:'🚫',name:'Pauli İlkesi',text:'Bir orbitalde en fazla <b>2 elektron</b> bulunur ve bu elektronların spinleri <b>zıt</b> olmalıdır (↑↓).'},
  hund:{icon:'🚌',name:'Hund Kuralı',text:'Eş enerjili orbitallere elektronlar önce <b>birer birer ve aynı spinle</b> yerleşir, sonra eşleşir. <i>Otobüste herkes önce boş koltuğa oturur!</i>'},
};

const Orbital = (()=>{
  let S=null,keyH=null;
  const key=(n,l)=>n+','+l;
  const lab=(n,l)=>n+LCHAR[l];
  const cap=l=>2*(2*l+1);

  function mount(app,startIdx){
    const prof=Store.profile();
    let idx=startIdx;
    if(idx==null){idx=ORB_LEVELS.findIndex(L=>!prof.orbital['z'+L.z]);if(idx<0) idx=0;}
    S={app,idx,spin:'u',tool:'add'};
    keyH=e=>{
      if(!S||['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
      if(e.key==='ArrowUp'){e.preventDefault();setTool('add','u');}
      else if(e.key==='ArrowDown'){e.preventDefault();setTool('add','d');}
      else if(e.key==='Backspace'||e.key.toLowerCase()==='z'){e.preventDefault();undo();}
    };
    document.addEventListener('keydown',keyH);
    render();
  }

  function render(){
    const L=ORB_LEVELS[S.idx];const el=ELEMENTS[L.z-1];
    const prof=Store.profile();
    S.orbs={};ORB_ORDER.forEach(([n,l])=>{S.orbs[key(n,l)]=Array.from({length:2*l+1},()=>[]);});
    S.placed=[];S.mistakes=0;S.hints=0;S.done=false;
    S.target={};electronConfig(L.z,L.z).forEach(x=>{S.target[key(x.n,x.l)]=x.e;});
    S.app.innerHTML=`<section class="screen orbital">
      <div class="bal-top">
        <div><h1 class="screen-title">🌀 Orbital Yerleşimi</h1><p class="sub" style="margin:0">Elektronları enerji merdivenindeki orbitallere yerleştir. Her hamlende üç kural denetleniyor!</p></div>
        <div class="level-chips">${ORB_LEVELS.map((x,k)=>{const s=prof.orbital['z'+x.z]||0;const e=ELEMENTS[x.z-1];
          return `<button class="lvl ${k===S.idx?'active':''} ${s?'done':''} ${x.bonus?'bonus':''}" data-k="${k}" title="${e.name}${x.bonus?' (istisna)':''}">${e.sym}<small>${s?'★'.repeat(s):x.bonus?'⚡':''}</small></button>`;}).join('')}</div>
      </div>
      <div class="challenge-bar orb-target">
        <div class="orb-el" style="--cat:${CAT_INFO[el.cat].color}"><span class="z">${L.z}</span><b>${el.sym}</b><small>${el.name}</small></div>
        <div class="ct"><div>Hedef: <b>${el.name}</b> atomunun <b>${L.z} elektronunu</b> temel hâle göre yerleştir.</div>
          <div class="muted" style="font-size:14px;margin-top:4px">💡 ${L.tip}</div></div>
        <div class="orb-tray"><span class="muted" style="font-weight:900;font-size:12px">KALAN ELEKTRON</span><b id="remain">${L.z}</b></div>
      </div>
      <div class="orb-layout">
        <div class="panel orb-main">
          <div class="orb-tools">
            <button class="spin-btn" data-tool="add" data-spin="u" title="Yukarı spin (klavye ↑)"><span>↑</span> Yukarı spin</button>
            <button class="spin-btn" data-tool="add" data-spin="d" title="Aşağı spin (klavye ↓)"><span>↓</span> Aşağı spin</button>
            <button class="spin-btn eraser" data-tool="erase" title="Bir elektron çıkar"><span>🧽</span> Çıkar</button>
            <span style="flex:1"></span>
            <button class="btn btn-sm btn-ghost" id="undo" title="Geri al (Z)">↶ Geri al</button>
            <button class="btn btn-sm btn-gold" id="hint">💡 İpucu</button>
            <button class="btn btn-sm btn-ghost" id="reset">↺</button>
          </div>
          <div class="orb-msg" id="orbmsg">Bir spin seç ve bir orbital kutusuna tıkla.</div>
          <div class="orb-diagram" id="diagram"></div>
          <div class="orb-notation">Elektron dizilimi: <span id="notation" class="fml">—</span></div>
        </div>
        <div class="orb-side">
          ${Object.entries(ORB_RULES).map(([k,r])=>`<div class="rule-card" id="rule-${k}"><div class="ri">${r.icon}</div><div><h4>${r.name}</h4><p>${r.text}</p></div><span class="rc" id="rc-${k}"></span></div>`).join('')}
          <div class="panel" style="padding:14px"><h3 style="font-size:16px;margin-bottom:6px">↘ Köşegen kuralı (dolma sırası)</h3>${diagonalSVG()}</div>
        </div>
      </div>
    </section>`;
    $$('.lvl',S.app).forEach(b=>b.onclick=()=>{S.idx=+b.dataset.k;FX.sfx.click();render();});
    $$('.spin-btn',S.app).forEach(b=>b.onclick=()=>{setTool(b.dataset.tool,b.dataset.spin);FX.sfx.click();});
    $('#undo').onclick=undo;
    $('#hint').onclick=hint;
    $('#reset').onclick=()=>{FX.sfx.click();render();};
    drawDiagram();
    setTool('add',S.spin);
  }

  function setTool(tool,spin){
    S.tool=tool;if(spin) S.spin=spin;
    $$('.spin-btn',S.app).forEach(b=>b.classList.toggle('active',b.dataset.tool===tool&&(tool==='erase'||b.dataset.spin===S.spin)));
    $('#diagram').classList.toggle('erasing',tool==='erase');
  }

  function drawDiagram(){
    const hi=Math.max(...ORB_ORDER.map(([n,l],i)=>S.target[key(n,l)]?i:0));
    const rows=clamp(hi+2,3,ORB_ORDER.length);
    const dg=$('#diagram');dg.style.gridTemplateRows=`repeat(${rows},var(--orb-row))`;
    dg.innerHTML=`<div class="energy-axis"><span>ENERJİ</span></div>`+ORB_ORDER.slice(0,rows).map(([n,l],i)=>{
      const k=key(n,l);const orbs=S.orbs[k];const cnt=orbs.reduce((t,o)=>t+o.length,0);
      return `<div class="orb-group ${cnt===cap(l)?'full':''}" data-key="${k}" style="grid-row:${rows-i};grid-column:${l+2}">
        <div class="orb-label">${lab(n,l)}<sup>${cnt||''}</sup></div>
        <div class="orb-boxes">${orbs.map((o,oi)=>`<button class="orb-box" data-k="${k}" data-o="${oi}" aria-label="${lab(n,l)} orbitali ${oi+1}">${arrowsHTML(o)}</button>`).join('')}</div>
      </div>`;
    }).join('');
    $$('.orb-box',S.app).forEach(b=>b.onclick=()=>{
      if(S.tool==='erase') erase(b.dataset.k,+b.dataset.o,b); else place(b.dataset.k,+b.dataset.o,b);
    });
    updateInfo();
  }
  function arrowsHTML(o,popLast){return o.map((s,i)=>`<i class="ar ${s} ${popLast&&i===o.length-1?'pop':''}">${s==='u'?'↑':'↓'}</i>`).join('');}
  function refreshBox(k,oi,pop){
    const b=$(`.orb-box[data-k="${k}"][data-o="${oi}"]`);b.innerHTML=arrowsHTML(S.orbs[k][oi],pop);
    const [n,l]=k.split(',').map(Number);const cnt=countOf(k);
    const g=b.closest('.orb-group');g.classList.toggle('full',cnt===cap(l));
    $('.orb-label',g).innerHTML=lab(n,l)+'<sup>'+(cnt||'')+'</sup>';
  }
  function countOf(k){return S.orbs[k].reduce((t,o)=>t+o.length,0);}
  function updateInfo(){
    const L=ORB_LEVELS[S.idx];
    $('#remain').textContent=L.z-S.placed.length;
    const parts=ORB_ORDER.filter(([n,l])=>countOf(key(n,l))>0).map(([n,l])=>`${n}${LCHAR[l]}<sup>${countOf(key(n,l))}</sup>`);
    $('#notation').innerHTML=parts.join(' ')||'—';
  }
  function msg(text,kind=''){const m=$('#orbmsg');m.className='orb-msg '+kind;m.innerHTML=text;}

  /* ---- Kural denetimi ---- */
  function check(k,oi){
    const L=ORB_LEVELS[S.idx];
    const [n,l]=k.split(',').map(Number);
    if(S.placed.length>=L.z) return {rule:null,text:'Tüm elektronları yerleştirdin! Fazla elektron yok.'};
    // Aufbau
    const idx=ORB_ORDER.findIndex(([a,b])=>a===n&&b===l);
    for(let j=0;j<idx;j++){
      const [n2,l2]=ORB_ORDER[j];const k2=key(n2,l2);
      if(countOf(k2)<cap(l2)){
        if(L.bonus&&k2==='4,0'&&k==='3,2'&&countOf(k2)>=1) continue;
        return {rule:'aufbau',text:`<b>Aufbau ihlali!</b> Önce daha düşük enerjili <b>${lab(n2,l2)}</b> orbitali dolmalı.`};
      }
    }
    const sub=S.orbs[k],o=sub[oi],s=S.spin;
    // Pauli
    if(o.length>=2) return {rule:'pauli',text:'<b>Pauli ihlali!</b> Bir orbitalde en fazla <b>2 elektron</b> bulunabilir.'};
    if(o.length===1&&o[0]===s) return {rule:'pauli',text:`<b>Pauli ihlali!</b> Aynı orbitaldeki iki elektron <b>zıt spinli</b> olmalı. Burada ${s==='u'?'↓':'↑'} spin gerekiyor.`};
    // Hund
    if(o.length===1&&sub.some(x=>x.length===0)) return {rule:'hund',text:`<b>Hund ihlali!</b> ${lab(n,l)} orbitallerinin hepsine önce <b>birer elektron</b> yerleşmeli, sonra eşleşme başlar.`};
    if(o.length===0){
      const singles=sub.filter(x=>x.length===1).map(x=>x[0]);
      if(singles.length&&singles.some(x=>x!==s)) return {rule:'hund',text:'<b>Hund ihlali!</b> Yarı dolu eş enerjili orbitallerdeki elektronlar <b>aynı yönlü (paralel) spinli</b> olmalı.'};
    }
    return null;
  }
  function place(k,oi,box){
    if(S.done) return;
    const v=check(k,oi);
    if(v){
      if(!v.rule){msg(v.text,'warn');FX.sfx.down();return;}
      S.mistakes++;
      FX.sfx.wrong();
      box.classList.remove('bad');void box.offsetWidth;box.classList.add('bad');setTimeout(()=>box.classList.remove('bad'),600);
      const ghost=document.createElement('i');ghost.className='ar ghost '+S.spin;ghost.textContent=S.spin==='u'?'↑':'↓';box.appendChild(ghost);setTimeout(()=>ghost.remove(),700);
      const rc=$('#rule-'+v.rule);rc.classList.remove('violated');void rc.offsetWidth;rc.classList.add('violated');
      msg('❌ '+v.text,'bad');
      return;
    }
    S.orbs[k][oi].push(S.spin);
    S.placed.push({k,oi});
    $$('.orb-box.hinted').forEach(b=>b.classList.remove('hinted'));
    refreshBox(k,oi,true);
    FX.sfx.pop();
    updateInfo();
    const left=ORB_LEVELS[S.idx].z-S.placed.length;
    msg(left?`✓ Güzel! ${left} elektron kaldı.`:'✓ Son elektron da yerleşti!','good');
    if(!left) complete();
  }
  function erase(k,oi,box){
    if(S.done) return;
    const o=S.orbs[k][oi];if(!o.length){FX.sfx.down();return;}
    o.pop();
    for(let i=S.placed.length-1;i>=0;i--) if(S.placed[i].k===k&&S.placed[i].oi===oi){S.placed.splice(i,1);break;}
    refreshBox(k,oi);FX.sfx.down();updateInfo();msg('Bir elektron çıkarıldı.','');
  }
  function undo(){
    if(!S||S.done||!S.placed.length) return;
    const {k,oi}=S.placed.pop();S.orbs[k][oi].pop();refreshBox(k,oi);FX.sfx.down();updateInfo();msg('↶ Son hamle geri alındı.','');
  }
  function nextMove(){
    for(const [n,l] of ORB_ORDER){
      const k=key(n,l);const need=S.target[k]||0;const sub=S.orbs[k];
      if(countOf(k)>need) return {wrong:k};
      if(countOf(k)<need){
        const singles=sub.filter(x=>x.length===1);
        const empty=sub.findIndex(x=>x.length===0);
        if(empty>=0) return {k,oi:empty,spin:singles.length?singles[0][0]:'u'};
        const half=sub.findIndex(x=>x.length===1);
        return {k,oi:half,spin:sub[half][0]==='u'?'d':'u'};
      }
    }
    return null;
  }
  function hint(){
    if(S.done) return;
    const m=nextMove();if(!m) return;
    S.hints++;FX.sfx.pop();
    if(m.wrong){const [n,l]=m.wrong.split(',').map(Number);msg(`💡 <b>${lab(n,l)}</b> orbitalinde olması gerekenden fazla elektron var. 🧽 ile bir tanesini çıkar.`,'warn');setTool('erase');return;}
    setTool('add',m.spin);
    $$('.orb-box.hinted').forEach(b=>b.classList.remove('hinted'));
    const b=$(`.orb-box[data-k="${m.k}"][data-o="${m.oi}"]`);b.classList.add('hinted');
    const [n,l]=m.k.split(',').map(Number);
    msg(`💡 Sıradaki elektron <b>${lab(n,l)}</b> orbitaline, <b>${m.spin==='u'?'↑ yukarı':'↓ aşağı'}</b> spinle gider.`,'warn');
  }
  function complete(){
    const L=ORB_LEVELS[S.idx];const el=ELEMENTS[L.z-1];
    const ok=ORB_ORDER.every(([n,l])=>countOf(key(n,l))===(S.target[key(n,l)]||0));
    if(!ok){
      msg(L.bonus?`⚡ Neredeyse! <b>${el.name}</b> bir istisnadır: ${L.tip.replace('İSTİSNA! ','')} 🧽 ile 4s'ten bir elektron çıkarıp 3d'ye yerleştir.`:'Dizilim temel hâle uymuyor. İpucu almayı dene.','warn');
      return;
    }
    S.done=true;
    const stars=S.mistakes===0&&S.hints===0?3:(S.mistakes<=2&&S.hints<=1)?2:1;
    Object.keys(ORB_RULES).forEach(r=>$('#rule-'+r).classList.add('ok'));
    $$('.orb-group',S.app).forEach((g,i)=>setTimeout(()=>g.classList.add('celebrate'),i*60));
    FX.sfx.win();FX.confetti(140);FX.banner('KURALLARA UYGUN!','good','small');
    const res=Game.finishOrbital('z'+L.z,stars,ORB_LEVELS.length);
    const conf=electronConfig(L.z,L.z);
    const unpaired=Object.keys(S.orbs).reduce((t,k)=>t+S.orbs[k].filter(o=>o.length===1).length,0);
    setTimeout(()=>{
      if(!S) return;
      UI.modal({title:`🌀 ${el.name} tamam!`,html:`<div style="text-align:center">
        <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
        <div style="max-width:420px;margin:0 auto">${Visual.orbitalSVG('Z='+L.z)}</div>
        <p class="fml" style="font-size:20px">${configString(conf)}</p>
        <p>Yarı dolu orbital sayısı: <b style="color:var(--gold)">${unpaired}</b> · Son katman: <b>${shellsOf(L.z,L.z).length}. katman</b></p>
        <p class="muted">Hata: ${S.mistakes} · İpucu: ${S.hints} · <b style="color:var(--gold)">+${res.xp} XP</b></p></div>`,
        buttons:[{label:'↺ Tekrar',cls:'btn-ghost',onClick:()=>render()},{label:'Sonraki ▶',cls:'btn-good',onClick:()=>{S.idx=(S.idx+1)%ORB_LEVELS.length;render();}}]});
    },1100);
  }
  function diagonalSVG(){
    const X=l=>34+l*50,Y=n=>22+(n-1)*30;
    let s=`<svg viewBox="0 0 230 172" class="diag-svg">`;
    let k=0;const colors=['#22d3ee','#a78bfa','#f472b6','#fbbf24','#4ade80','#60a5fa','#fb923c','#f87171'];
    for(let sum=1;sum<=6;sum++){
      const list=[];for(let l=3;l>=0;l--){const n=sum-l;if(n>l&&n>=1&&n<=5) list.push([n,l]);}
      if(!list.length) continue;
      const [n1,l1]=list[0],[n2,l2]=list[list.length-1];
      const x1=X(l1)+16,y1=Y(n1)-12,x2=X(l2)-14,y2=Y(n2)+10;
      const c=colors[k++%colors.length];
      s+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${c}" stroke-width="2.5" opacity=".8"/><circle cx="${x2}" cy="${y2}" r="3.5" fill="${c}"/>`;
    }
    for(let n=1;n<=5;n++) for(let l=0;l<Math.min(n,4);l++){
      s+=`<text x="${X(l)}" y="${Y(n)+5}" text-anchor="middle" font-family="Nunito, sans-serif" font-size="15" font-weight="600" style="fill:var(--sv-ink)">${n}${LCHAR[l]}</text>`;
    }
    return s+'</svg>';
  }
  function unmount(){if(keyH) document.removeEventListener('keydown',keyH);keyH=null;S=null;}
  return {mount,unmount};
})();
