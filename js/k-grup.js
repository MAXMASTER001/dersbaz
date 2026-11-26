'use strict';
/* =========================================================
   Grup Bul — periyodik sistemde yer bulma (9. sınıf, Maarif)
   İpucu (katman dizilimi, orbital dizilimi, atom numarası ya da
   soy gaz kısaltması) verilir; öğrenci boş tablodaki doğru hücreye
   dokunur. Her cevaptan sonra periyot ve grubun nasıl bulunduğu
   adım adım açıklanır.
   ========================================================= */
const KGrup = (()=>{
  const LEVELS={
    katman:{name:'Katman dizilimi',icon:'🪜',grade:'2) 8) 5) · Z 1–20',max:20,clue:'shell'},
    orbital:{name:'Orbital dizilimi',icon:'🌀',grade:'1s² 2s² 2p⁶ 3s¹ · Z 1–20',max:20,clue:'conf'},
    numara:{name:'Atom numarası',icon:'🔢',grade:'Yalnızca Z verilir · Z 1–36',max:36,clue:'z'},
    usta:{name:'Usta',icon:'🏆',grade:'Karışık ipucu, grup adları gizli · Z 1–36',max:36,clue:'mix',hide:true},
  };
  const TOTAL=10;
  let S=null;

  /* Periyot ve grubun adım adım açıklaması */
  function explain(z){
    const el=ELEMENTS[z-1],conf=ChemX.conf(z),per=Math.max(...conf.map(x=>x.n)),last=ChemX.last(conf),g=groupLabel(el.col);
    let txt=`En büyük katman numarası <b>${per}</b> → <b>${per}. periyot</b>. `;
    if(z===2) txt+='Helyumun 2 değerlik elektronu var ama o bir <b>soy gazdır</b>: <b>8A (18. grup)</b>.';
    else if(last.l===2){
      const s=conf.find(x=>x.n===per&&x.l===0),sum=s.e+last.e;
      txt+=`Dizilim <b>d</b> ile bitiyor → <b>B grubu</b>. ${ChemX.subHTML(s)} + ${ChemX.subHTML(last)} → ${s.e} + ${last.e} = <b>${sum}</b> → <b>${g}</b> (${el.col}. grup).`;
      if(sum>=8&&sum<=10) txt+=' <i>Toplam 8, 9 ya da 10 ise 8B grubudur.</i>';
      if(sum>=11) txt+=' <i>Toplam 11 ise 1B, 12 ise 2B grubudur.</i>';
    } else {
      const outer=conf.filter(x=>x.n===per),val=outer.reduce((t,x)=>t+x.e,0);
      txt+=`Dizilim <b>${LCHAR[last.l]}</b> ile bitiyor → <b>A grubu</b>. Son katmandaki elektronlar: ${outer.map(ChemX.subHTML).join(' + ')} = <b>${val}</b> → <b>${g}</b> (${el.col}. grup).`;
    }
    return txt;
  }
  function clueHTML(z,kind){
    const conf=ChemX.conf(z);
    if(kind==='shell') return {label:'Katman dizilimi',html:shellsOf(z,z).map(n=>`${n})`).join(' ')};
    if(kind==='conf') return {label:'Elektron dizilimi',html:ChemX.confHTML(conf)};
    if(kind==='short') return {label:'Elektron dizilimi',html:ChemX.shortHTML(conf)};
    return {label:'Atom numarası',html:'Z = '+z};
  }

  function mount(app){
    const prof=Store.profile();
    app.innerHTML=`<section class="screen grup">
      <h1 class="screen-title">🔍 Grup Bul</h1>
      <p class="sub">Elementin ipucundan <b>periyodunu</b> ve <b>grubunu</b> bul, boş periyodik tablodaki yerine dokun. Her doğru cevapta tablo biraz daha dolar! Her turda ${TOTAL} element var.</p>
      <div class="panel gb-howto">
        <div><b>📏 Periyot</b> = en büyük katman numarası (n)</div>
        <div><b>🅰️ A grubu</b>: dizilim <b>s</b> ya da <b>p</b> ile biter → son katmandaki elektron sayısı</div>
        <div><b>🅱️ B grubu</b>: dizilim <b>d</b> ile biter → <b>s + d</b> elektron sayısı</div>
      </div>
      <div class="mode-pick">${Object.entries(LEVELS).map(([k,l])=>{const b=(prof.games['grup_'+k]||{}).best||0;
        return `<button class="mode-card gb-lv" data-l="${k}"><div class="mi">${l.icon}</div><h4>${l.name}</h4><p>${l.grade}</p><p style="margin-top:6px;color:var(--gold)">🏆 En iyi: ${b}/${TOTAL}</p></button>`;}).join('')}</div>
    </section>`;
    $$('.gb-lv',app).forEach(b=>b.onclick=()=>{FX.sfx.pop();start(app,b.dataset.l);});
  }

  function start(app,lv){
    const L=LEVELS[lv];
    const kinds=['shell','conf','z','short'];
    S={app,lv,i:0,correct:0,res:[],locked:false,
      list:shuffle(ELEMENTS.slice(0,L.max).map(e=>e.z)).slice(0,TOTAL).map((z,k)=>({z,kind:L.clue==='mix'?kinds[(k+Math.floor(Math.random()*4))%4]:L.clue}))};
    app.innerHTML=`<section class="screen grup">
      <div class="q-hud" style="grid-template-columns:1fr auto">
        <div><div class="q-progress" id="gbdots"></div><div class="q-count" id="gbcount"></div></div>
        <div class="score-box"><span>DOĞRU</span><b id="gbscore">0</b></div>
      </div>
      <div class="challenge-bar gb-clue-bar"><div class="cn" id="gblabel"></div><div class="gb-clue fml" id="gbclue"></div>
        <div class="ct muted" style="font-size:14px;min-width:160px">Bu element tabloda nerede? Hücresine dokun.</div></div>
      <div class="panel" style="margin-top:12px"><div class="gb-swipe">↔ Tabloyu parmağınla sağa sola kaydırabilirsin</div><div class="gb-wrap"><div class="gb-table ${L.hide?'nohead':''}" id="gbtable"></div></div>
        <div class="legend">${Object.values(CAT_INFO).map(c=>`<span><i style="background:${c.color}"></i>${c.name}</span>`).join('')}</div></div>
      <div id="gbmsg"></div>
    </section>`;
    buildTable();
    question();
  }
  function buildTable(){
    const L=LEVELS[S.lv],h=[];
    h.push('<span></span>');
    for(let c=1;c<=18;c++) h.push(`<span class="gb-h">${L.hide?'?':groupLabel(c)}<small>${c}</small></span>`);
    for(let p=1;p<=4;p++){
      h.push(`<span class="gb-p">${p}</span>`);
      for(let c=1;c<=18;c++){
        const el=ELEMENTS.find(e=>e.period===p&&e.col===c);
        if(!el){h.push('<span></span>');continue;}
        const dim=el.z>L.max;
        h.push(`<button class="gb-cell ${dim?'dim':''}" data-p="${p}" data-c="${c}" style="--cat:${CAT_INFO[el.cat].color}" aria-label="${p}. periyot, ${groupLabel(c)} grubu" ${dim?'tabindex="-1"':''}></button>`);
      }
    }
    $('#gbtable').innerHTML=h.join('');
    $$('.gb-cell',S.app).forEach(b=>b.onclick=()=>pick(b));
  }
  function dots(){
    $('#gbdots').innerHTML=Array.from({length:TOTAL},(_,k)=>`<i class="${k===S.i?'cur':S.res[k]===true?'ok':S.res[k]===false?'no':''}"></i>`).join('');
    $('#gbcount').textContent=`Soru ${S.i+1} / ${TOTAL}`;
  }
  function question(){
    S.locked=false;dots();
    const q=S.list[S.i],c=clueHTML(q.z,q.kind);
    $('#gblabel').textContent=c.label;
    $('#gbclue').innerHTML=c.html;
    const bar=$('.gb-clue-bar',S.app);bar.style.animation='none';void bar.offsetWidth;bar.style.animation='';
    $('#gbmsg').innerHTML='';
    $$('.gb-cell.bad',S.app).forEach(b=>b.classList.remove('bad'));
    $$('.gb-cell.reveal',S.app).forEach(b=>b.classList.remove('reveal'));
  }
  function pick(b){
    if(S.locked||b.classList.contains('fill')||b.classList.contains('miss')) {if(!S.locked) FX.sfx.down();return;}
    S.locked=true;
    const q=S.list[S.i],el=ELEMENTS[q.z-1];
    const p=+b.dataset.p,c=+b.dataset.c,ok=p===el.period&&c===el.col;
    const target=$(`.gb-cell[data-p="${el.period}"][data-c="${el.col}"]`);
    target.textContent=el.sym;
    S.res[S.i]=ok;
    if(ok){
      S.correct++;$('#gbscore').textContent=S.correct;
      target.classList.add('fill');
      FX.sfx.correct();FX.celebrate(target);
    } else {
      b.classList.add('bad');
      target.classList.add('miss','reveal');
      FX.sfx.wrong();
    }
    dots();
    const w=$('.gb-wrap',S.app);
    if(w.scrollWidth>w.clientWidth) w.scrollLeft=target.offsetLeft-w.clientWidth/2+target.offsetWidth/2; // anında: dikey yumuşak kaydırma yataydakini iptal ediyor
    const last=S.i>=TOTAL-1;
    $('#gbmsg').innerHTML=`<div class="orb-msg ${ok?'good':'bad'}">
      ${ok?`✅ <b>Doğru! ${el.name} (${el.sym})</b> — ${el.period}. periyot, ${groupLabel(el.col)} grubu.`:`❌ Senin seçtiğin: <b>${p}. periyot, ${groupLabel(c)}</b>. Doğrusu: <b>${el.name} (${el.sym})</b> — ${el.period}. periyot, ${groupLabel(el.col)} grubu.`}
      <div class="gb-why">${q.kind!=='conf'&&q.kind!=='short'?`<span class="fml">${ChemX.confHTML(ChemX.conf(q.z),true)}</span><br>`:''}${explain(q.z)}</div></div>
      <div style="text-align:center"><button class="btn btn-big btn-primary" id="gbnext">${last?'Sonuçlar 🏁':'Devam ▶'}</button></div>`;
    $('#gbnext').onclick=()=>{FX.sfx.click();if(last) return finish();S.i++;question();};
    $('#gbmsg').scrollIntoView({behavior:'smooth',block:'nearest'});
  }
  function finish(){
    const {correct,lv,app}=S;
    const stars=correct>=9?3:correct>=7?2:correct>=5?1:0;
    const res=Game.finishArcade('grup_'+lv,{score:correct,xp:correct*4+stars*5,badge:correct===TOTAL?'grup10':null});
    stars?FX.sfx.win():FX.sfx.lose();if(stars>=2) FX.confetti(150);
    UI.modal({title:'🔍 Tur bitti!',dismiss:false,html:`<div style="text-align:center">
      <div class="stars" style="font-size:56px">${[0,1,2].map(i=>`<span class="star ${i<stars?'on':''}">⭐</span>`).join('')}</div>
      <div class="big-score">${correct} / ${TOTAL}</div><p class="muted">${res.newBest?'🎉 YENİ REKOR!':'En iyi: '+res.best+' / '+TOTAL}</p></div>`,
      buttons:[{label:'Seviye seç',cls:'btn-ghost',onClick:()=>mount(app)},{label:'🔁 Tekrar',cls:'btn-good',onClick:()=>start(app,lv)}]});
  }
  function unmount(){S=null;}
  return {mount,unmount};
})();
