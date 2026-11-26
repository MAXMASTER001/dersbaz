'use strict';
/* =========================================================
   Küresel Simetri — 9. sınıf (Maarif Modeli)
   Elektron dizilimi s¹, s², p³, p⁶, d⁵, d¹⁰ ile biten (yani tüm
   orbitalleri ya tam ya yarı dolu olan) atom ve iyonlar küresel
   simetriktir.
   Keşfet: element/iyon seç, orbitallerini ve "küresini" gör.
   Avcı: kartlardan küresel simetrik olanların hepsini seç.
   ========================================================= */
const ChemX = {
  cap:l=>2*(2*l+1),
  conf(z,q=0){return electronConfig(z,z-q);},
  state(x){const c=ChemX.cap(x.l);return x.e===c?'full':x.e*2===c?'half':'part';},
  isSym(conf){return conf.length>0&&conf.every(x=>ChemX.state(x)!=='part');},
  last(conf){return conf[conf.length-1];},
  subHTML(x){return x.n+LCHAR[x.l]+'<sup>'+x.e+'</sup>';},
  confHTML(conf,mark){
    return conf.map((x,i)=>mark&&i===conf.length-1?`<b class="cx-last ${ChemX.state(x)}">${ChemX.subHTML(x)}</b>`:ChemX.subHTML(x)).join(' ');
  },
  ionHTML(sym,q){return sym+(q?`<sup>${chargeStr(q)}</sup>`:'');},
  /* Soy gaz kısaltması: [Ar] 4s² 3d⁶ */
  shortHTML(conf,mark){
    let core=0,k=0,cum=0;
    conf.forEach((x,i)=>{cum+=x.e;if([2,10,18,36].includes(cum)&&ChemX.state(x)==='full'&&i<conf.length-1){core=cum;k=i+1;}});
    if(!core) return ChemX.confHTML(conf,mark);
    const name={2:'He',10:'Ne',18:'Ar',36:'Kr'}[core];
    return `[${name}] `+ChemX.confHTML(conf.slice(k),mark);
  },
  /* Orbital kutuları (Hund kuralına göre) */
  boxesHTML(conf){
    return `<div class="sy-boxes">${conf.map(x=>{
      const k=2*x.l+1,ups=Math.min(x.e,k),downs=Math.max(0,x.e-k);
      return `<div class="sy-sub ${ChemX.state(x)}"><div class="bx">${Array.from({length:k},(_,i)=>`<i>${i<ups?'↑':''}${i<downs?'↓':''}</i>`).join('')}</div><span class="lb">${ChemX.subHTML(x)}</span></div>`;
    }).join('')}</div>`;
  },
  /* Elektron bulutu: simetrikse kusursuz küre, değilse yamuk bir bulut */
  sphereSVG(ok,label,seed=1){
    const id='sg'+Math.random().toString(36).slice(2,8);
    let body;
    if(ok){
      body=`<circle cx="100" cy="100" r="70" fill="url(#${id})"/>
        <g class="sp-rings"><circle cx="100" cy="100" r="86" fill="none" stroke-width="2" stroke-dasharray="4 7" style="stroke:var(--good)"/>
        <ellipse cx="100" cy="100" rx="86" ry="30" fill="none" stroke-width="1.5" stroke-dasharray="3 6" opacity=".7" style="stroke:var(--good)"/>
        <ellipse cx="100" cy="100" rx="30" ry="86" fill="none" stroke-width="1.5" stroke-dasharray="3 6" opacity=".7" style="stroke:var(--good)"/></g>`;
    } else {
      const R=rng(seed*97+13),N=9,pts=[];
      for(let i=0;i<N;i++){const a=i/N*Math.PI*2,r=60+R()*30;pts.push([100+r*Math.cos(a),100+r*Math.sin(a)*.86]);}
      let d=`M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for(let i=0;i<N;i++){
        const p0=pts[(i-1+N)%N],p1=pts[i],p2=pts[(i+1)%N],p3=pts[(i+2)%N];
        const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];
        d+=` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
      }
      body=`<path class="sp-blob" d="${d}Z" fill="url(#${id})"/>`;
    }
    const c1=ok?'var(--good-soft)':'var(--warn-soft)',c2=ok?'var(--good)':'var(--warn)';
    return `<svg class="sphere ${ok?'ok':'no'}" viewBox="0 0 200 200" role="img" aria-label="${ok?'Küresel simetrik':'Küresel simetrik değil'}">
      <defs><radialGradient id="${id}" cx="38%" cy="34%" r="75%"><stop offset="0" style="stop-color:#fff;stop-opacity:.95"/><stop offset=".35" style="stop-color:${c1}"/><stop offset="1" style="stop-color:${c2};stop-opacity:.85"/></radialGradient></defs>
      ${body}
      <circle cx="100" cy="100" r="17" style="fill:var(--paper);stroke:var(--ink)" stroke-width="2"/>
      <text x="100" y="105" text-anchor="middle" font-size="14" font-weight="900" style="fill:var(--ink)">${label}</text>
    </svg>`;
  },
  verdictHTML(conf){
    const ok=ChemX.isSym(conf),L=ChemX.last(conf);
    if(ok) return `<b>✔ Küresel simetrik.</b> Tüm orbitaller ya <b>tam dolu</b> ya <b>yarı dolu</b>; dizilim <b>${ChemX.subHTML(L)}</b> ile bitiyor.`;
    const bad=conf.filter(x=>ChemX.state(x)==='part')[0];
    const c=ChemX.cap(bad.l);
    return `<b>✘ Küresel simetrik değil.</b> <b>${ChemX.subHTML(bad)}</b> ne yarı dolu (${LCHAR[bad.l]}<sup>${c/2}</sup>) ne tam dolu (${LCHAR[bad.l]}<sup>${c}</sup>).`;
  },
};

const SYM_IONS=[
  [11,1],[12,2],[13,3],[8,-2],[9,-1],[17,-1],[16,-2],[7,-3],[19,1],[20,2],
  [26,2],[26,3],[29,1],[29,2],[25,2],[30,2],[24,3],[27,2],[28,2],[21,3],[22,2],[23,3],[24,2],[3,1],[4,2],
];

const KSimetri = (()=>{
  const LEVELS={
    kolay:{name:'Dizilimi gör',icon:'👁️',grade:'Dizilim kartta yazılı · Z 1–20',max:20,showConf:true},
    orta:{name:'Atom avcısı',icon:'🎯',grade:'Yalnızca sembol · Z 1–20',max:20},
    zor:{name:'d orbitali',icon:'⚡',grade:'Cr, Mn, Cu, Zn… · Z 1–36',max:36},
    iyon:{name:'İyonlar',icon:'💎',grade:'Na⁺, Fe³⁺, Cu⁺, Cl⁻…',ion:true},
  };
  const ROUNDS=5,PER=6;
  let S=null;

  function mount(app){
    const prof=Store.profile();
    app.innerHTML=`<section class="screen simetri">
      <h1 class="screen-title">💎 Küresel Simetri</h1>
      <p class="sub">Elektron dizilimi <span class="sy-chip">s¹</span> <span class="sy-chip">s²</span> <span class="sy-chip">p³</span> <span class="sy-chip">p⁶</span> <span class="sy-chip">d⁵</span> <span class="sy-chip">d¹⁰</span> ile biten atomlar <b>küresel simetriktir</b>: orbitallerinin hepsi ya tam dolu ya yarı doludur.</p>
      <div class="mode-pick">
        <button class="mode-card sy-lv" data-l="kesfet"><div class="mi">🔍</div><h4>Keşfet</h4><p>Bir element ya da iyon seç; orbitallerini ve elektron küresini gör.</p></button>
        ${Object.entries(LEVELS).map(([k,l])=>{const b=(prof.games['simetri_'+k]||{}).best||0;
          return `<button class="mode-card sy-lv" data-l="${k}"><div class="mi">${l.icon}</div><h4>${l.name}</h4><p>${l.grade}</p><p style="margin-top:6px;color:var(--gold)">🏆 En iyi: ${b}/${ROUNDS*PER}</p></button>`;}).join('')}
      </div>
    </section>`;
    $$('.sy-lv',app).forEach(b=>b.onclick=()=>{FX.sfx.pop();b.dataset.l==='kesfet'?explore(app):start(app,b.dataset.l);});
  }

  /* ---------- Keşfet ---------- */
  function explore(app){
    S={app,z:7,q:0,show:false};
    app.innerHTML=`<section class="screen simetri">
      <div class="bal-top"><div><h1 class="screen-title">🔍 Küresel Simetri · Keşfet</h1>
        <p class="sub" style="margin:0">Tablodan bir elemente dokun. İyon yapmak için yükü değiştir.</p></div>
        <button class="btn btn-ghost btn-sm" id="syback">↶ Geri</button></div>
      <div class="sy-layout">
        <div class="panel">
          <div class="sy-tools"><button class="btn btn-sm btn-gold" id="syshow">💎 Küresel simetrikleri göster</button></div>
          <div class="ptable" id="sytable"></div>
          <p class="muted" style="font-size:13px;font-weight:700;margin:10px 0 0">İpucu: Aynı gruptaki elementlerin dizilimi aynı tür orbitalle biter. Gruplara göre bir örüntü görüyor musun?</p>
        </div>
        <div class="panel sy-view" id="syview"></div>
      </div>
    </section>`;
    const cells=[];
    for(let p=1;p<=4;p++) for(let c=1;c<=18;c++){
      const el=ELEMENTS.find(e=>e.period===p&&e.col===c);
      cells.push(el?`<button class="pt" data-z="${el.z}" style="--cat:${CAT_INFO[el.cat].color}" title="${el.name} (${el.z})">${el.sym}</button>`:'<span class="pt-empty"></span>');
    }
    $('#sytable').innerHTML=cells.join('');
    $$('#sytable .pt').forEach(b=>b.onclick=()=>{S.z=+b.dataset.z;S.q=0;FX.sfx.pop();view();});
    $('#syshow').onclick=()=>{S.show=!S.show;FX.sfx.click();marks();};
    $('#syback').onclick=()=>{FX.sfx.click();mount(app);};
    view();
  }
  function marks(){
    $$('#sytable .pt').forEach(b=>{
      const ok=ChemX.isSym(ChemX.conf(+b.dataset.z));
      b.classList.toggle('sym',S.show&&ok);b.classList.toggle('nosym',S.show&&!ok);
      b.classList.toggle('cur',+b.dataset.z===S.z);
    });
    $('#syshow').innerHTML=S.show?'🙈 İşaretleri gizle':'💎 Küresel simetrikleri göster';
  }
  function view(){
    const el=ELEMENTS[S.z-1],conf=ChemX.conf(S.z,S.q),ok=ChemX.isSym(conf);
    const e=S.z-S.q;
    $('#syview').innerHTML=`
      <div class="sy-head">
        <div class="orb-el" style="--cat:${CAT_INFO[el.cat].color}"><span class="z">${el.z}</span><b>${ChemX.ionHTML(el.sym,S.q)}</b><small>${el.name}</small></div>
        <div class="sy-charge"><span>Yük</span>
          <button class="pbtn" id="qm" aria-label="Yükü azalt">−</button><b class="pval" style="min-width:44px;text-align:center">${S.q>0?'+'+S.q:S.q}</b><button class="pbtn" id="qp" aria-label="Yükü artır">+</button>
          <span class="muted" style="font-size:13px">${e} elektron</span></div>
      </div>
      ${ChemX.sphereSVG(ok,ChemX.ionHTML(el.sym,S.q).replace(/<\/?sup>/g,''),S.z*10+S.q)}
      <div class="stage-tools">${App.spinButton()}</div>
      <div class="sy-verdict ${ok?'good':'bad'}">${ChemX.verdictHTML(conf)}</div>
      ${ChemX.boxesHTML(conf)}
      <div class="orb-notation">Elektron dizilimi: <span class="fml">${ChemX.confHTML(conf,true)}</span></div>
      ${S.q?`<p class="muted" style="font-size:13px;font-weight:700;margin:0">İyon oluşurken elektronlar önce <b>en dış katmandan</b> (en büyük n) kopar. Örneğin Fe → Fe³⁺: önce 4s, sonra 3d elektronları gider.</p>`:''}`;
    $('#qm').onclick=()=>charge(-1);
    $('#qp').onclick=()=>charge(1);
    marks();
    if(ok) FX.celebrate($('#syview .sphere'));
  }
  function charge(d){
    const q=clamp(S.q+d,-3,4),e=S.z-q;
    if(q===S.q||e<1||e>36){FX.sfx.down();return;}
    S.q=q;d>0?FX.sfx.up():FX.sfx.down();view();
  }

  /* ---------- Avcı ---------- */
  function pool(lv){
    const L=LEVELS[lv];
    if(L.ion) return SYM_IONS.map(([z,q])=>({z,q}));
    return ELEMENTS.slice(0,L.max).map(e=>({z:e.z,q:0}));
  }
  function deal(lv){
    const P=pool(lv);
    for(let t=0;t<200;t++){
      const pick=shuffle(P).slice(0,PER);
      const n=pick.filter(x=>ChemX.isSym(ChemX.conf(x.z,x.q))).length;
      if(n>=2&&n<=4) return pick;
    }
    return shuffle(P).slice(0,PER);
  }
  function start(app,lv){
    S={app,lv,round:0,score:0,res:[]};
    app.innerHTML=`<section class="screen simetri">
      <div class="q-hud" style="grid-template-columns:1fr auto">
        <div><div class="q-progress" id="sydots"></div><div class="q-count" id="sycount"></div></div>
        <div class="score-box"><span>PUAN</span><b id="syscore">0</b></div>
      </div>
      <div class="challenge-bar"><div class="ct">Küresel simetrik olan <b>bütün</b> kartları seç, sonra <b>Kontrol Et</b>.
        <div class="muted" style="font-size:13px;margin-top:4px">Hatırla: <span class="sy-chip">s¹</span> <span class="sy-chip">s²</span> <span class="sy-chip">p³</span> <span class="sy-chip">p⁶</span> <span class="sy-chip">d⁵</span> <span class="sy-chip">d¹⁰</span></div></div></div>
      <div class="sy-grid" id="sygrid"></div>
      <div id="symsg"></div>
    </section>`;
    round();
  }
  function dots(){
    $('#sydots').innerHTML=Array.from({length:ROUNDS},(_,k)=>`<i class="${k===S.round?'cur':S.res[k]===true?'ok':S.res[k]===false?'no':''}"></i>`).join('');
    $('#sycount').textContent=`Tur ${S.round+1} / ${ROUNDS}`;
  }
  function round(){
    dots();
    S.cards=deal(S.lv).map(x=>({...x,on:false,conf:ChemX.conf(x.z,x.q)}));
    S.checked=false;
    const L=LEVELS[S.lv];
    $('#sygrid').innerHTML=S.cards.map((c,i)=>{const el=ELEMENTS[c.z-1];
      return `<button class="sy-card" data-i="${i}" style="--d:${i*60}ms"><span class="z">${c.z}</span><span class="tick">✔</span>
        <div class="sy">${ChemX.ionHTML(el.sym,c.q)}</div><div class="nm">${el.name}${c.q?' iyonu':''}</div>
        <div class="cf">${L.showConf?ChemX.confHTML(c.conf):''}</div><div class="vd"></div></button>`;}).join('');
    $$('.sy-card',S.app).forEach(b=>b.onclick=()=>{
      if(S.checked) return;
      const c=S.cards[+b.dataset.i];c.on=!c.on;b.classList.toggle('on',c.on);c.on?FX.sfx.up():FX.sfx.down();
    });
    $('#symsg').innerHTML=`<div style="text-align:center;margin-top:16px"><button class="btn btn-big btn-good" id="sycheck">Kontrol Et ✔</button></div>`;
    $('#sycheck').onclick=check;
  }
  function check(){
    if(S.checked) return;S.checked=true;
    let right=0;
    S.cards.forEach((c,i)=>{
      const ok=ChemX.isSym(c.conf),good=ok===c.on;if(good) right++;
      const b=$(`.sy-card[data-i="${i}"]`);
      b.classList.add(good?'right':'wrong');
      $('.cf',b).innerHTML=ChemX.confHTML(c.conf,true);
      $('.vd',b).innerHTML=ok?'<span class="good">💎 Küresel simetrik</span>':'<span class="bad">Simetrik değil</span>';
    });
    S.score+=right;S.res[S.round]=right===PER;
    $('#syscore').textContent=S.score;
    const sb=$('.score-box',S.app);sb.classList.remove('bump');void sb.offsetWidth;sb.classList.add('bump');
    if(right===PER){FX.sfx.correct();FX.celebrate($('#sygrid'));}
    else{FX.sfx.wrong();}
    dots();
    const last=S.round>=ROUNDS-1;
    $('#symsg').innerHTML=`<div class="orb-msg ${right===PER?'good':'warn'}">${right===PER?'✅ Hepsi doğru! Tam isabet.':`${right} / ${PER} kart doğru. Kırmızı kartların son orbitaline bak: yarı ya da tam dolu mu?`}</div>
      <div style="text-align:center"><button class="btn btn-big btn-primary" id="synext">${last?'Sonuçlar 🏁':'Sonraki tur ▶'}</button></div>`;
    $('#synext').onclick=()=>{FX.sfx.click();if(last) return finish();S.round++;round();};
  }
  function finish(){
    const {score,lv,app}=S,T=ROUNDS*PER;
    const stars=score>=27?3:score>=22?2:score>=16?1:0;
    const res=Game.finishArcade('simetri_'+lv,{score,xp:score*2+stars*5,badge:score===T?'sym30':null});
    stars?FX.sfx.win():FX.sfx.lose();if(stars>=2) FX.confetti(150);
    UI.modal({title:'💎 Av bitti!',dismiss:false,html:`<div style="text-align:center">
      <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
      <div class="big-score">${score} / ${T}</div><p class="muted">${res.newBest?'🎉 YENİ REKOR!':'En iyi: '+res.best+' / '+T}</p></div>`,
      buttons:[{label:'Seviye seç',cls:'btn-ghost',onClick:()=>mount(app)},{label:'🔁 Tekrar',cls:'btn-good',onClick:()=>start(app,lv)}]});
  }
  function unmount(){S=null;}
  return {mount,unmount};
})();
